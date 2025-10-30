import * as React from "react";
import {
  Dropdown,
  IDropdownOption,
  Icon,
  IconButton,
  Modal,
  Separator,
  TextField,
  Toggle,
} from "@fluentui/react";
import { classes } from "../../ui/styles";
import type { Vehiculo } from "../../models/vehiculo";

type VehiculoExt = Vehiculo & {
  Empresa?: string;
  EmpresaId?: number;
  Activo?: boolean;
};

export const DatosVehiculo: React.FC<{
  vehiculo: VehiculoExt;
  setVehiculo: React.Dispatch<React.SetStateAction<VehiculoExt>>;
  disabled?: boolean;
  required?: Record<string, boolean | undefined>;
  isChoice: (n: string) => boolean;
  isLookup: (n: string) => boolean;
  isNumber: (n: string) => boolean;
  choices: Record<string, IDropdownOption[]>;
  lookups: Record<string, IDropdownOption[]>;
}> = ({
  vehiculo,
  setVehiculo,
  disabled,
  required = {},
  isChoice,
  isLookup,
  isNumber,
  choices,
  lookups,
}) => {
  const [isAlturaModalOpen, setIsAlturaModalOpen] = React.useState(false);

  const setText =
    (key: keyof Vehiculo) =>
    (
      _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      v?: string
    ) =>
      setVehiculo((s: VehiculoExt) => ({ ...s, [key]: v ?? "" }));

  const setChoice =
    (key: keyof Vehiculo) =>
    (_ev: React.FormEvent<HTMLDivElement>, opt?: IDropdownOption) =>
      setVehiculo((s: VehiculoExt) => ({
        ...s,
        [key]: (opt?.key as string) ?? "",
      }));

  // Default "Seco" si no hay valor
  React.useEffect(() => {
    if ((vehiculo.Temperatura || "").trim()) return;

    const normalize = (s: any = "") =>
      String(s)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const opts = choices["temperatura"] || [];
    const secoOpt = opts.find((o) => normalize(o.text) === "seco");

    setVehiculo((s) => ({
      ...s,
      Temperatura: secoOpt ? (secoOpt.key as string) : "Seco",
    }));
  }, [choices, setVehiculo, vehiculo.Temperatura]);

  // Visible "Tipo temperatura" solo si Temperatura = "Con temperatura"
  const showTipoTemperatura = React.useMemo(() => {
    const normalize = (s: any = "") =>
      String(s)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const raw = (vehiculo.Temperatura || "").toString();
    const opt = (choices["temperatura"] || []).find(
      (o) => String(o.key) === raw
    );
    const text = opt ? String(opt.text) : raw;

    return (
      normalize(text) === "con temperatura" ||
      normalize(raw) === "con temperatura"
    );
  }, [vehiculo.Temperatura, choices]);

  // Visible campo "Otros" de capacidad si la capacidad es "otro"/"otros"
  const showCapacidadOtros = React.useMemo(() => {
    const normalize = (s: any = "") =>
      String(s)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const raw = (vehiculo.Capacidad || "").toString();
    let text = raw;

    if (isChoice("capacidad")) {
      const opt = (choices["capacidad"] || []).find(
        (o) => String(o.key) === raw
      );
      if (opt) text = String(opt.text);
    }

    const n = normalize(text);
    return n === "otro" || n === "otros" || n.startsWith("otro");
  }, [vehiculo.Capacidad, choices, isChoice]);

  return (
    <div className={classes.card}>
      <div className={classes.cardHeader}>
        <Icon iconName="Car" />
        <div className={classes.cardTitle}>1- Datos del vehículo</div>
      </div>
      <Separator />

      <div className={classes.grid3}>
        <TextField label="Empresa" value={vehiculo.Empresa || ""} disabled />
        <div />
        <div />
      </div>

      <div className={classes.grid3}>
        <div className={classes.fieldCell}>
          <div className={classes.fieldLabel}>Temperatura</div>
          {isChoice("temperatura") ? (
            <Dropdown
              options={choices["temperatura"] || []}
              selectedKey={vehiculo.Temperatura || undefined}
              onChange={setChoice("Temperatura")}
              disabled={disabled}
            />
          ) : (
            <TextField
              value={vehiculo.Temperatura || ""}
              onChange={setText("Temperatura")}
              disabled={disabled}
            />
          )}
        </div>

        {showTipoTemperatura && (
          <div className={classes.fieldCell}>
            <div className={classes.fieldLabel}>Tipo temperatura</div>
            {isChoice("Tipo_x0020_Temperatura") ? (
              <Dropdown
                options={choices["Tipo_x0020_Temperatura"] || []}
                selectedKey={vehiculo.TipoTemperatura || undefined}
                onChange={setChoice("TipoTemperatura")}
                disabled={disabled}
              />
            ) : (
              <TextField
                value={vehiculo.TipoTemperatura || ""}
                onChange={setText("TipoTemperatura")}
                disabled={disabled}
              />
            )}
          </div>
        )}

        <div className={classes.fieldCell}>
          <div className={classes.fieldLabel}>Tipo de unidad</div>
          {isChoice("Tipo_x0020_de_x0020_unidad") ? (
            <Dropdown
              placeholder="Seleccione..."
              options={choices["Tipo_x0020_de_x0020_unidad"] || []}
              selectedKey={vehiculo.TipoUnidad || undefined}
              onChange={setChoice("TipoUnidad")}
              disabled={disabled}
            />
          ) : (
            <TextField
              value={vehiculo.TipoUnidad || ""}
              onChange={setText("TipoUnidad")}
              disabled={disabled}
            />
          )}
        </div>
      </div>

      <div className={classes.grid3}>
        <div className={classes.fieldCell}>
          <div className={classes.fieldLabel}>Capacidad</div>
          {isChoice("capacidad") ? (
            <Dropdown
              placeholder="Seleccione..."
              options={choices["capacidad"] || []}
              selectedKey={vehiculo.Capacidad || undefined}
              onChange={setChoice("Capacidad")}
              disabled={disabled}
            />
          ) : (
            <TextField
              value={vehiculo.Capacidad || ""}
              onChange={setText("Capacidad")}
              disabled={disabled}
            />
          )}
        </div>

        {showCapacidadOtros && (
          <div className={classes.fieldCell}>
            <TextField
              label="Especifique capacidad"
              value={(vehiculo as any).Otros || ""}
              onChange={setText("Otros")}
              disabled={disabled}
            />
          </div>
        )}

        <div />
      </div>

      <div className={classes.grid3}>
        <div className={classes.fieldCell}>
          <div className={classes.fieldLabel}>Rampa</div>
          <Toggle
            checked={!!vehiculo.Rampa}
            onChange={(_e, c) =>
              setVehiculo((s: VehiculoExt) => ({ ...s, Rampa: !!c }))
            }
            disabled={disabled}
          />
        </div>
        {vehiculo.Rampa && (
          <>
            <TextField
              label="Largo rampa"
              value={vehiculo.LargoRampa || ""}
              onChange={setText("LargoRampa")}
              disabled={disabled}
            />
            <TextField
              label="Ancho rampa"
              value={vehiculo.AnchoRampa || ""}
              onChange={setText("AnchoRampa")}
              disabled={disabled}
            />
          </>
        )}
      </div>

      <div className={classes.grid3}>
        <div className={classes.fieldCell}>
          <div className={classes.fieldLabel}>Bonificación</div>
          <Toggle
            checked={!!vehiculo.Bonificacion}
            onChange={(_e, c) =>
              setVehiculo((s: VehiculoExt) => ({ ...s, Bonificacion: !!c }))
            }
            disabled={disabled}
          />
        </div>

        {vehiculo.Bonificacion && (
          <TextField
            label="N° de resolución"
            value={vehiculo.NroResolucion || ""}
            onChange={setText("NroResolucion")}
            disabled={disabled}
          />
        )}
        <div />
      </div>

      <div className={classes.grid3}>
        <TextField
          label="Medidas internas"
          value={vehiculo.MedidasInternas || ""}
          onChange={setText("MedidasInternas")}
          disabled={disabled}
        />
        <TextField
          label="Medidas externas"
          value={vehiculo.MedidasExternas || ""}
          onChange={setText("MedidasExternas")}
          disabled={disabled}
        />
        <div />
      </div>

      <div className={classes.grid3}>
        <TextField
          // Label con ícono que abre el modal
          onRenderLabel={() => (
            <div
              className={classes.fieldLabel}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span>Altura del piso</span>
              <IconButton
                iconProps={{ iconName: "Info" }}
                title="Ver referencia"
                ariaLabel="Ver referencia"
                styles={{ root: { height: 24, width: 24 } }}
                onClick={() => setIsAlturaModalOpen(true)}
              />
            </div>
          )}
          value={vehiculo.AlturaPiso || ""}
          onChange={setText("AlturaPiso")}
          disabled={disabled}
        />
        <div />
        <div />
      </div>

      <div className={classes.grid3}>
        <TextField
          label="Peso carga útil"
          value={vehiculo.PesoCargaUtil || ""}
          type={isNumber("pesocargautil") ? "number" : "text"}
          onChange={setText("PesoCargaUtil")}
          disabled={disabled}
        />
        <TextField
          label="Peso bruto"
          value={vehiculo.PesoNeto || ""}
          type={isNumber("pesobruto") ? "number" : "text"}
          onChange={setText("PesoNeto")}
          disabled={disabled}
        />
        <div />
      </div>

      {/* Modal con la imagen de referencia */}
      <Modal
        isOpen={isAlturaModalOpen}
        onDismiss={() => setIsAlturaModalOpen(false)}
        isBlocking={false}
      >
        <div style={{ padding: 12, maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 600 }}>Altura del piso — Referencia</div>
            <IconButton
              iconProps={{ iconName: "Cancel" }}
              ariaLabel="Cerrar"
              onClick={() => setIsAlturaModalOpen(false)}
            />
          </div>
          <img
            src="https://cnco.sharepoint.com/sites/DucumentosTrasportesPE/SiteAssets/Altura.png"
            alt="altura del piso"
            style={{ maxWidth: "100%", height: "auto", display: "block" }}
          />
        </div>
      </Modal>
    </div>
  );
};
