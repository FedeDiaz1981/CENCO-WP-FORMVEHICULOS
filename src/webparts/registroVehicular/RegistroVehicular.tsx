// src/webparts/registroVehicular/RegistroVehicular.tsx
import * as React from "react";
import {
  ThemeProvider,
  PrimaryButton,
  DefaultButton,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";

import { Vehiculo } from "./models/vehiculo";
import {
  getVehiculoByPlaca,
  upsertVehiculo,
  deleteVehiculoByPlaca,
} from "./services/vehiculos.service";
import {
  //guardarTodosSecuencial,
  cargarCertificadosPorPlaca,
  deleteCertificadosPorPlaca,
  replaceCertificadoAdjunto,
  //replaceAdjuntoById,
} from "./services/certificados.service";
import { CertificadosGrid } from "./components/sections/CertificadosGrid";

import { ActionTile } from "./components/atoms/ActionTile";
import { DatosVehiculo } from "./components/sections/DatosVehiculo";
import { Documentacion } from "./components/sections/Documentacion";
import { Notificaciones } from "./components/sections/Notificaciones";
import { VehiculosProveedorGrid } from "./components/sections/VehiculosProveedorGrid";

import { useEmpresaAuto } from "./components/hooks/useEmpresaAuto";
import { useVehiculoMeta } from "./components/hooks/useVehiculoMeta";
import { useVehiculosEmpresa } from "./components/hooks/useVehiculosEmpresa";

import { classes, theme } from "./ui/styles";
import type { Accion, DocState } from "./types";
import type { IRegistroVehicularProps } from "./IRegistroVehicularProps";

const VEH_LIST_DEFAULT = "Vehiculos";
const VEH_INTERNALS = [
  "Title",
  "soat",
  "codigo",
  "marca",
  "modelo",
  "capacidad",
  "rampa",
  "largorampa",
  "anchorampa",
  "bonificacion",
  "resolucion",
  "Activo",
  "medidasinternas",
  "medidasexternas",
  "alturapiso",
  "pesocargautil",
  "pesobruto",
  "temperatura",
  "Tipo_x0020_Temperatura",
  "Tipo_x0020_de_x0020_unidad",
] as const;

export default function RegistroVehicular(props: IRegistroVehicularProps) {
  const vehList = props.vehiculosListTitle || VEH_LIST_DEFAULT;

  const filtrarProveedorEfectivo =
    !!props.Proveedor && !(props.Distribuidor || props.Coordinador);

  const [accion, setAccion] = React.useState<Accion>("crear");
  const [busy, setBusy] = React.useState(false);
  const [staged, setStaged] = React.useState<{ tipo: string; file: File }[]>(
    []
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const [docValido, setDocValido] = React.useState(true);
  const [erroresDocs, setErroresDocs] = React.useState<string[]>([]);

  const empresa = useEmpresaAuto(
    props.proveedoresList || "Proveedores",
    props.proveedoresDisplayField || "Title",
    props.proveedoresUserField || "Usuarios"
  );

  const [vehiculo, setVehiculo] = React.useState<
    Vehiculo & { Empresa?: string; EmpresaId?: number; Activo?: boolean }
  >({
    Placa: "",
    Activo: true,
    Rampa: false,
  });

  // Guard para evitar setState innecesario
  React.useEffect(() => {
    setVehiculo((s) => {
      const sameName = s.Empresa === empresa.nombre;
      const sameId = s.EmpresaId === empresa.id;
      if (sameName && sameId) return s;
      return { ...s, Empresa: empresa.nombre, EmpresaId: empresa.id };
    });
  }, [empresa.nombre, empresa.id]);

  const { meta, choices, lookups, isChoice, isLookup, isNumber } =
    useVehiculoMeta(vehList, VEH_INTERNALS);

  const required: Record<string, boolean | undefined> = React.useMemo(() => {
    return Object.keys(meta).reduce((acc, k) => {
      acc[k] = meta[k].Required;
      return acc;
    }, {} as Record<string, boolean | undefined>);
  }, [meta]);

  const [doc, setDoc] = React.useState<DocState>({
    propFile: null,
    resBonificacionFile: null,
    certBonificacionDate: null,
    certBonificaFile: null,
    revTecDate: null,
    revTecText: "",
    revTecFile: null,
    SanipesDate: null,
    SanipesText: "",
    sanipesFile: null,
    termokingDate: null,
    termokingFile: null,
    limpiezaDate: null,
    limpiezaFile: null,
    fumigacionDate: null,
    fumigacionFile: null,
  });

  const { rows, loading, load } = useVehiculosEmpresa(vehList);

  const lastLoadKeyRef = React.useRef<string>("");

  // Control de ejecución + evita loops de carga repetida (sin floating promises)
  React.useEffect(() => {
    if (accion !== "actualizar" && accion !== "baja") return;

    const filtroEmpresa = filtrarProveedorEfectivo
      ? vehiculo.Empresa
      : undefined;
    const key = `${accion}|${filtroEmpresa ?? ""}`;
    if (lastLoadKeyRef.current === key) return;
    lastLoadKeyRef.current = key;

    // Marcamos explícitamente que no esperamos la promesa y manejamos errores
    void load(filtroEmpresa).catch(() => {
      /* silencio */
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accion, vehiculo.Empresa, filtrarProveedorEfectivo]);

  const onInvokeRow = React.useCallback(
    async (item: { Placa: string }) => {
      try {
        const [full, docs] = await Promise.all([
          getVehiculoByPlaca(item.Placa, vehList),
          cargarCertificadosPorPlaca(item.Placa),
        ]);
        if (!full) {
          alert("No se encontró la placa en la lista seleccionada.");
          return;
        }
        setVehiculo((s) => ({
          ...s,
          ...full,
          Empresa: s.Empresa,
          EmpresaId: s.EmpresaId,
        }));
        setDoc((old) => ({
          ...old,
          ...docs,
        }));
      } catch (e: any) {
        console.error(
          "getVehiculoByPlaca/getCertificadosEstado error:",
          e?.data?.responseBody?.error?.message?.value || e
        );
        alert("Error al cargar la placa seleccionada.");
      }
    },
    [vehList]
  );

  const resetForm = React.useCallback(() => {
    setVehiculo((s) => ({
      Placa: "",
      SOAT: "",
      Codigo: "",
      Marca: "",
      Modelo: "",
      Capacidad: "",
      Otros: "",
      Rampa: false,
      LargoRampa: "",
      AnchoRampa: "",
      Bonificacion: false,
      NroResolucion: "",
      MedidasInternas: "",
      MedidasExternas: "",
      AlturaPiso: "",
      PesoCargaUtil: "",
      PesoNeto: "",
      Temperatura: "",
      TipoTemperatura: "",
      TipoUnidad: "",
      Activo: true,
      CorreosNotificacion: "",
      ...(s.Empresa ? { Empresa: s.Empresa } : {}),
      ...(s.EmpresaId ? { EmpresaId: s.EmpresaId } : {}),
    }));
    setDoc({
      propFile: null,
      resBonificacionFile: null,
      certBonificacionDate: null,
      certBonificaFile: null,
      revTecDate: null,
      revTecText: "",
      revTecFile: null,
      SanipesDate: null,
      SanipesText: "",
      sanipesFile: null,
      termokingDate: null,
      termokingFile: null,
      limpiezaDate: null,
      limpiezaFile: null,
      fumigacionDate: null,
      fumigacionFile: null,
    });
    setStaged([]);
    setDocValido(true);
    setErroresDocs([]);
  }, []);

  // const toDateOnly = (d: Date | null | undefined) =>
  //   d
  //     ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  //     : undefined;

  // ====== REPUESTAS QUE FALTABAN ======

  const toISO = (d?: Date | string | null): string | null => {
    if (!d) return null;
    // si ya es string, devolvelo
    if (typeof d === "string") return d;
    // si es Date, lo pasamos a yyyy-mm-dd
    return d.toISOString().slice(0, 10);
  };

  async function guardarCertificados() {
    const placa = (vehiculo.Placa || "").trim();
    if (!placa) return;

    const {
      propFile,
      resBonificacionFile,
      certBonificacionDate,
      certBonificaFile,
      revTecDate,
      revTecText,
      revTecFile,
      SanipesDate,
      SanipesText,
      sanipesFile,
      termokingDate,
      termokingFile,
      limpiezaDate,
      limpiezaFile,
    } = doc;

    // 1) Tarjeta de propiedad
    if (propFile) {
      await replaceCertificadoAdjunto({
        placa,
        tipo: "Tarjeta de propiedad",
        file: propFile,
      });
    }

    // 2) Resolución de bonificación (la que es solo archivo)
    if (resBonificacionFile) {
      await replaceCertificadoAdjunto({
        placa,
        tipo: "Bonificación",
        file: resBonificacionFile,
      });
    }

    // 3) Certificado de bonificación (el que tiene fecha)
    if (certBonificacionDate || certBonificaFile) {
      await replaceCertificadoAdjunto({
        placa,
        tipo: "Certificado de bonificación",
        emision: toISO(certBonificacionDate),
        file: certBonificaFile ?? null,
      });
    }

    // 4) Revisión técnica
    if (revTecDate || revTecText || revTecFile) {
      await replaceCertificadoAdjunto({
        placa,
        tipo: "Revisión técnica",
        // para RT suele ir en caducidad
        caducidad: toISO(revTecDate),
        anio: (revTecText || "").trim(),
        file: revTecFile ?? null,
      });
    }

    // 5) Sanipes
    if (SanipesDate || SanipesText || sanipesFile) {
      await replaceCertificadoAdjunto({
        placa,
        tipo: "Sanipes",
        resolucion: toISO(SanipesDate),
        expediente: (SanipesText || "").trim(),
        file: sanipesFile ?? null,
      });
    }

    // 6) Termoking
    if (termokingDate || termokingFile) {
      await replaceCertificadoAdjunto({
        placa,
        tipo: "Termoking",
        emision: toISO(termokingDate),
        file: termokingFile ?? null,
      });
    }

    // 7) Limpieza y desinfección
    if (limpiezaDate || limpiezaFile) {
      await replaceCertificadoAdjunto({
        placa,
        tipo: "Limpieza y desinfección",
        emision: toISO(limpiezaDate),
        file: limpiezaFile ?? null,
      });
    }
  }

  async function guardarStagedCertificados(): Promise<void> {
    const placa = (vehiculo.Placa || "").trim();
    if (!placa || staged.length === 0) return;
    for (const it of staged) {
      await replaceCertificadoAdjunto({ placa, tipo: it.tipo, file: it.file });
    }
  }

  // ====================================

  async function eliminarVehiculoYCertificados(): Promise<void> {
    const placa = (vehiculo.Placa || "").trim();
    if (!placa) {
      alert("Selecciona una placa para dar de baja.");
      return;
    }
    await deleteCertificadosPorPlaca(placa);
    await deleteVehiculoByPlaca(placa, vehList);
  }

  // Garantiza que busy se libere siempre
  async function onGuardar(): Promise<void> {
    if (!vehiculo.Placa) {
      alert("Placa es obligatoria.");
      return;
    }

    if (accion === "crear" && !docValido) {
      const detalle = erroresDocs.length
        ? `\n\n- ${erroresDocs.join("\n- ")}`
        : "";
      alert(
        "Revisa la documentación antes de guardar. Hay errores que deben corregirse." +
          detalle
      );
      return;
    }

    setBusy(true);
    setIsSaving(true);
    try {
      if (accion === "baja") {
        await eliminarVehiculoYCertificados();
        alert("Vehículo dado de baja.");
        resetForm();
      } else {
        await upsertVehiculo(vehiculo);
        if (accion === "crear") {
          await guardarCertificados();
        } else {
          await guardarStagedCertificados();
          setStaged([]);
        }
        alert("Listo.");
        if (accion !== "actualizar") resetForm();
      }
    } catch (e: any) {
      const msg =
        e?.data?.responseBody?.error?.message?.value ||
        e?.message ||
        JSON.stringify(e);
      alert("Error al guardar: " + msg);
    } finally {
      setIsSaving(false);
      setBusy(false);
    }
  }

  const norm = (s: string = "") =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const cumpleRequisitosResolucionBonificacion = React.useCallback(() => {
    const unidad = norm(vehiculo.TipoUnidad);
    const bonificacion = !!vehiculo.Bonificacion;
    return bonificacion && unidad === "carreta";
  }, [vehiculo.Bonificacion, vehiculo.TipoUnidad]);

  const cumpleRequisitosTermoking = React.useCallback(() => {
    const temp = norm(vehiculo.Temperatura);
    const unidad = norm(vehiculo.TipoUnidad);
    const conTemperatura =
      temp === "con temperatura" ||
      temp === "con_temperatura" ||
      temp === "contemperatura";
    return conTemperatura && (unidad === "camion" || unidad === "carreta");
  }, [vehiculo.Temperatura, vehiculo.TipoUnidad]);

  const cumpleRequisitosSanipes = cumpleRequisitosTermoking;

  const cumpleRequisitosFumigacion = React.useCallback(() => {
    const unidad = norm(vehiculo.TipoUnidad);
    return unidad === "camion" || unidad === "carreta";
  }, [vehiculo.TipoUnidad]);

  const cumpleRequisitosLimpieza = cumpleRequisitosFumigacion;

  const showResBonificacion = React.useMemo(
    () => cumpleRequisitosResolucionBonificacion(),
    [cumpleRequisitosResolucionBonificacion]
  );
  const showTermoking = React.useMemo(
    () => cumpleRequisitosTermoking(),
    [cumpleRequisitosTermoking]
  );
  const showSanipes = React.useMemo(
    () => cumpleRequisitosSanipes(),
    [cumpleRequisitosSanipes]
  );
  const showFumigacion = React.useMemo(
    () => cumpleRequisitosFumigacion(),
    [cumpleRequisitosFumigacion]
  );
  const showLimpieza = React.useMemo(
    () => cumpleRequisitosLimpieza(),
    [cumpleRequisitosLimpieza]
  );

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root} aria-busy={busy}>
        {busy && (
          <div className={classes.overlay} role="alert" aria-live="assertive">
            <Spinner label="Guardando..." size={SpinnerSize.large} />
          </div>
        )}

        <div className={`${classes.page} ${busy ? classes.busyMask : ""}`}>
          <div className={classes.actions}>
            <ActionTile
              icon="Add"
              label="Ingresar"
              selected={accion === "crear"}
              onClick={() => {
                setAccion("crear");
                resetForm();
              }}
              disabled={busy}
            />
            <ActionTile
              icon="Edit"
              label="Modificar"
              selected={accion === "actualizar"}
              onClick={() => setAccion("actualizar")}
              disabled={busy}
            />
            <ActionTile
              icon="Delete"
              label="Dar de baja"
              selected={accion === "baja"}
              onClick={() => setAccion("baja")}
              disabled={busy}
            />
          </div>

          {(accion === "actualizar" || accion === "baja") && (
            <VehiculosProveedorGrid
              empresa={filtrarProveedorEfectivo ? vehiculo.Empresa : undefined}
              rows={rows}
              loading={loading}
              onInvokeRow={onInvokeRow}
              Proveedor={filtrarProveedorEfectivo}
            />
          )}

          <DatosVehiculo
            vehiculo={vehiculo}
            setVehiculo={setVehiculo}
            disabled={busy || accion === "baja"}
            required={required}
            isChoice={isChoice}
            isLookup={isLookup}
            isNumber={isNumber}
            choices={choices}
            lookups={lookups}
          />

          <Notificaciones
            vehiculo={vehiculo}
            setVehiculo={setVehiculo}
            disabled={busy || accion === "baja"}
          />

          {(accion === "actualizar" || accion === "baja") && (
            <CertificadosGrid
              placa={vehiculo.Placa}
              disabled={busy || isSaving || accion === "baja"}
              onStagedChange={setStaged}
              showTermoking={showTermoking}
              showSanipes={showSanipes}
              showFumigacion={showFumigacion}
              showLimpieza={showLimpieza}
              showResBonificacion={showResBonificacion}
            />
          )}

          {accion === "crear" && (
            <Documentacion
              doc={doc}
              setDoc={setDoc}
              showTermoking={showTermoking}
              showSanipes={showSanipes}
              showFumigacion={showFumigacion}
              showLimpieza={showLimpieza}
              showResBonificacion={showResBonificacion}
              onValidityChange={(ok, errs) => {
                setDocValido(ok);
                setErroresDocs(errs || []);
              }}
            />
          )}

          <div className={classes.footer}>
            <PrimaryButton
              text={
                accion === "baja"
                  ? "DAR DE BAJA"
                  : accion === "actualizar"
                  ? "GRABAR ACTUALIZACIÓN"
                  : "GUARDAR"
              }
              onClick={onGuardar}
              disabled={busy || (accion === "crear" && !docValido)}
            />
            <DefaultButton
              text="Cancelar"
              onClick={() => window.location.reload()}
              disabled={busy}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
