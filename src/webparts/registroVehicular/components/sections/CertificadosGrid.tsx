import * as React from "react";
import {
  DetailsList,
  IColumn,
  IconButton,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Text,
  DetailsListLayoutMode,
  SelectionMode,
  DefaultButton,
} from "@fluentui/react";
import {
  getCertificadosListado,
  CertRow,
} from "../../services/certificados.service";
import { classes } from "../../ui/styles";

type RowEx = CertRow & {
  _newFile?: File | null;
  _status?: "idle" | "pending" | "ok"; // compat visual
  _staged?: boolean;                    // cambio pendiente de guardar
};

export const CertificadosGrid: React.FC<{
  placa?: string;
  disabled?: boolean; // si es true (p.ej. Dar de baja) todo queda bloqueado
  onStagedChange?: (items: { tipo: string; file: File }[]) => void;

  /** === Flags de visibilidad (igual que en Documentacion.tsx) === */
  showTermoking?: boolean;
  showSanipes?: boolean;
  showFumigacion?: boolean;
  showLimpieza?: boolean;
  showResBonificacion?: boolean;
}> = ({
  placa,
  disabled = false,
  onStagedChange,
  showTermoking = false,
  showSanipes = false,
  showFumigacion = false,
  showLimpieza = false,
  showResBonificacion = false,
}) => {
  const [rows, setRows] = React.useState<RowEx[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Mapea tipo -> flag de visibilidad
  const isVisible = React.useCallback(
    (tipo: string) => {
      switch (tipo) {
        case "TERMOKING":
          return !!showTermoking;
        case "SANIPES":
          return !!showSanipes;
        case "FUMIGACION":
          return !!showFumigacion;
        case "LIMPIEZA_DESINFECCION":
          return !!showLimpieza;
        case "RESOLUCION_BONIFICACION":
          return !!showResBonificacion;
        // El resto se muestran siempre
        default:
          return true;
      }
    },
    [showTermoking, showSanipes, showFumigacion, showLimpieza, showResBonificacion]
  );

  React.useEffect(() => {
    const load = async () => {
      if (!placa) {
        setRows([]);
        onStagedChange?.([]);
        return;
      }
      setLoading(true);
      try {
        const data = await getCertificadosListado(placa);

        // Aplica las mismas reglas de Documentacion.tsx
        const filtered = data.filter((r) => isVisible(r.tipo));

        setRows(
          filtered.map((r) => ({
            ...r,
            _status: "idle",
            _newFile: null,
            _staged: false,
          }))
        );
        onStagedChange?.([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placa, isVisible]);

  // Notificar al padre cada vez que cambian los staged
  React.useEffect(() => {
    const staged = rows
      .filter((r) => r._staged && r._newFile)
      .map((r) => ({ tipo: r.tipo, file: r._newFile! }));
    onStagedChange?.(staged);
  }, [rows, onStagedChange]);

  const setNewFile = (tipo: string, file: File | null) => {
    if (disabled) return; // hard block
    setRows((rs) => rs.map((r) => (r.tipo === tipo ? { ...r, _newFile: file } : r)));
  };

  // Solo preconfirma en memoria
  const onConfirmReplace = (r: RowEx) => {
    if (disabled || !r._newFile) return;
    setRows((rs) =>
      rs.map((x) =>
        x.tipo === r.tipo
          ? {
              ...x,
              _staged: true,
              _status: "idle", // sin spinner
            }
          : x
      )
    );
  };

  const onUndo = (r: RowEx) => {
    if (disabled) return;
    setRows((rs) =>
      rs.map((x) =>
        x.tipo === r.tipo ? { ...x, _staged: false, _newFile: null } : x
      )
    );
  };

  const columns: IColumn[] = React.useMemo((): IColumn[] => {
    return [
      {
        key: "row",
        name: "",
        minWidth: 300,
        isResizable: true,
        onRender: (r: RowEx) => {
          const d = r.emision || r.resolucion || null;
          const fecha = d ? new Date(d).toLocaleDateString() : "-";
          const extra = r.anio || r.expediente || "-";
          const id = `file_${r.tipo}`;

          const canConfirm = !!r._newFile && !disabled;

          return (
            <div className={classes.certTwoLineRow}>
              {/* Línea superior: Certificado + Fecha + Extra */}
              <div className={classes.certRowTop}>
                <div className={classes.certCellGrow}>
                  <div className={classes.certMeta}>Certificado</div>
                  <div className={classes.certValue}>{r.tipo}</div>
                </div>
                <div className={classes.certCell}>
                  <div className={classes.certMeta}>Fecha</div>
                  <div className={classes.certValue}>{fecha}</div>
                </div>
                <div className={classes.certCell}>
                  <div className={classes.certMeta}>Extra</div>
                  <div className={classes.certValue}>{extra}</div>
                </div>
              </div>

              {/* Línea inferior: Archivo actual + Nuevo archivo + Acción */}
              <div className={classes.certRowBottom}>
                <div className={classes.certCellGrow}>
                  <div className={classes.certMeta}>Archivo actual</div>
                  <div
                    className={`${classes.certFileCell} ${
                      r._staged ? classes.certStaged : ""
                    }`}
                    title={r.archivo || undefined}
                  >
                    {r._staged && r._newFile
                      ? r._newFile.name
                      : r.archivo || "-"}
                  </div>
                </div>

                <div className={classes.certCellGrow}>
                  <div className={classes.certMeta}>Nuevo archivo</div>
                  <input
                    id={id}
                    type="file"
                    className={classes.certFileInputHidden}
                    disabled={disabled}
                    onChange={(e) => setNewFile(r.tipo, e.target.files?.[0] ?? null)}
                  />
                  <div className={classes.certFilePicker}>
                    <DefaultButton
                      text={r._newFile ? "Cambiar archivo" : "Adjuntar"}
                      onClick={() => !disabled && document.getElementById(id)?.click()}
                      disabled={disabled}
                    />
                    {r._newFile && (
                      <span className={classes.certFileInputName}>
                        {r._newFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className={classes.certActions}>
                  {r._staged ? (
                    <DefaultButton
                      text="Deshacer"
                      onClick={() => onUndo(r)}
                      disabled={disabled}
                    />
                  ) : (
                    <PrimaryButton
                      text="Confirmar"
                      disabled={!canConfirm}
                      onClick={() => onConfirmReplace(r)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
    ];
  }, [disabled, rows]);

  return (
    <div className={classes.certCard}>
      <div className={classes.certToolbar}>
        <Text variant="large">Documentación</Text>
        <IconButton
          title="Actualizar"
          ariaLabel="Actualizar"
          iconProps={{ iconName: "Refresh" }}
          onClick={() => !disabled && window.location.reload()}
          disabled={loading || disabled}
        />
        {loading && <Spinner size={SpinnerSize.small} />}
      </div>

      <div className={classes.certTableWrap}>
        <DetailsList
          items={rows}
          columns={columns}
          selectionMode={SelectionMode.none}
          compact={true}
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible={false}
        />
      </div>
    </div>
  );
};
