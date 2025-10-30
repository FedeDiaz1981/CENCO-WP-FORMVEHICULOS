// src/webparts/registroVehicular/sections/Documentacion.tsx
import * as React from "react";
import { Icon, Separator, MessageBar, MessageBarType, IDropdownOption } from "@fluentui/react";
import { classes } from "../../ui/styles";
import { DocCard } from "../atoms/DocCard";
import type { DocState } from "../../types";

type Props = {
  doc: DocState;
  setDoc: React.Dispatch<React.SetStateAction<DocState>>;
  showTermoking?: boolean;
  showSanipes?: boolean;
  showFumigacion?: boolean;
  showLimpieza?: boolean;
  showResBonificacion?: boolean;
  onValidityChange?: (ok: boolean, errors: string[]) => void;
};

export const Documentacion: React.FC<Props> = ({
  doc,
  setDoc,
  showTermoking = false,
  showSanipes = false,
  showFumigacion = false,
  showLimpieza = false,
  showResBonificacion = false,
  onValidityChange,
}) => {
  const set =
    <K extends keyof DocState>(k: K) =>
    (v: DocState[K]) =>
      setDoc((s) => ({ ...s, [k]: v }));

  // Generar años 1980 → año actual
  const yearOptions = React.useMemo<IDropdownOption[]>(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1979 }, (_, i) => {
      const y = (1980 + i).toString();
      return { key: y, text: y };
    }).reverse();
  }, []);

  // ---- Helpers de validación ----
  const monthsAgo = (n: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - n);
    return d;
  };

  const toDateOrNull = (v: unknown): Date | null => {
    if (!v) return null;
    const d = new Date(v as any);
    return isNaN(d.getTime()) ? null : d;
  };

  const isWithinLastMonths = (d: Date | null, n: number) =>
    !!d && d >= monthsAgo(n);

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    const e: string[] = [];

    if (showFumigacion) {
      const fd = toDateOrNull(doc.fumigacionDate as any);
      if (fd && !isWithinLastMonths(fd, 6)) {
        e.push("Fumigación: la fecha de emisión no puede superar 6 meses.");
      }
    }

    const rd = toDateOrNull(doc.revTecDate as any);
    if (rd && rd < today) {
      e.push("Revisión técnica: la fecha de vencimiento debe estar vigente.");
    }

    if (showTermoking) {
      const td = toDateOrNull(doc.termokingDate as any);
      if (td && !isWithinLastMonths(td, 6)) {
        e.push(
          "Termoking: la fecha de emisión no puede tener una antigüedad mayor a 6 meses."
        );
      }
    }

    if (showLimpieza) {
      const ld = toDateOrNull(doc.limpiezaDate as any);
      if (ld && !isWithinLastMonths(ld, 1)) {
        e.push(
          "Limpieza y desinfección: la fecha de emisión no puede superar 1 mes."
        );
      }
    }

    setErrors(e);
    onValidityChange?.(e.length === 0, e);
  }, [
    doc.fumigacionDate,
    doc.revTecDate,
    doc.termokingDate,
    doc.limpiezaDate,
    showFumigacion,
    showTermoking,
    showLimpieza,
    today,
    onValidityChange,
  ]);

  return (
    <div className={classes.card}>
      <div className={classes.cardHeader}>
        <Icon iconName="Document" />
        <div className={classes.cardTitle}>2- Documentación</div>
      </div>
      <Separator />

      {errors.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <MessageBar messageBarType={MessageBarType.error} isMultiline>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </MessageBar>
        </div>
      )}

      <div className={classes.docsGrid}>
        <div className={`${classes.docItem} ${classes.docLabelScope}`}>
          <DocCard
            title="Tarjeta de propiedad"
            file={doc.propFile}
            onFileChange={(f) => set("propFile")(f)}
          />
        </div>

        {showResBonificacion && (
          <div className={`${classes.docItem} ${classes.docLabelScope}`}>
            <DocCard
              title="Resolución de bonificación"
              file={doc.resBonificacionFile}
              onFileChange={(f) => set("resBonificacionFile")(f)}
            />
          </div>
        )}

        {showFumigacion && (
          <div className={`${classes.docItem} ${classes.docLabelScope}`}>
            <DocCard
              title="Certificado de fumigación"
              dateLabel="Fecha de emisión"
              dateValue={doc.fumigacionDate}
              onDateChange={(d) => set("fumigacionDate")(d)}
              dateOnly
              file={doc.fumigacionFile}
              onFileChange={(f) => set("fumigacionFile")(f)}
            />
          </div>
        )}

        <div className={`${classes.docItem} ${classes.docLabelScope}`}>
          <DocCard
            title="Revisión técnica"
            dateLabel="Fecha de vencimiento"
            textLabel="Año de fabricación"
            textValue={doc.revTecText ?? ""}
            onTextChange={(v) => set("revTecText")(String(v ?? ""))}
            textAsDropdown                         // 👈 Activamos el modo dropdown
            textOptions={yearOptions}              // 👈 Opciones de años
            dateValue={doc.revTecDate}
            onDateChange={(d) => set("revTecDate")(d)}
            dateOnly
            file={doc.revTecFile}
            onFileChange={(f) => set("revTecFile")(f)}
          />
        </div>

        {showSanipes && (
          <div className={`${classes.docItem} ${classes.docLabelScope}`}>
            <DocCard
              title="Sanipes"
              dateLabel="Fecha de resolución de incidente"
              dateValue={doc.SanipesDate}
              onDateChange={(d) => set("SanipesDate")(d)}
              dateOnly
              textLabel="N° de expediente"
              textValue={doc.SanipesText ?? ""}
              onTextChange={(v) => set("SanipesText")(String(v ?? ""))}
              file={doc.sanipesFile}
              onFileChange={(f) => set("sanipesFile")(f)}
            />
          </div>
        )}

        {showTermoking && (
          <div className={`${classes.docItem} ${classes.docLabelScope}`}>
            <DocCard
              title="Certificado de mantenimiento de termoking"
              dateLabel="Fecha de emisión"
              dateValue={doc.termokingDate}
              onDateChange={(d) => set("termokingDate")(d)}
              dateOnly
              file={doc.termokingFile}
              onFileChange={(f) => set("termokingFile")(f)}
            />
          </div>
        )}

        {showLimpieza && (
          <div className={`${classes.docItem} ${classes.docLabelScope}`}>
            <DocCard
              title="Limpieza y desinfección"
              dateLabel="Fecha de emisión"
              dateValue={doc.limpiezaDate}
              onDateChange={(d) => set("limpiezaDate")(d)}
              dateOnly
              file={doc.limpiezaFile}
              onFileChange={(f) => set("limpiezaFile")(f)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
