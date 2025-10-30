// src/webparts/registroVehicular/hooks/useVehiculosEmpresa.ts
import * as React from "react";
import { SP } from "../../../../pnp";            // <- fijo la ruta relativa
import type { VehiculoRow } from "../../types";

const safe = (s: string = "") => s.replace(/'/g, "''");

export function useVehiculosEmpresa(vehList?: string) {
  const [rows, setRows] = React.useState<VehiculoRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(
    async (nombreEmpresa?: string) => {
      const listTitle = vehList || "Vehiculos";
      setLoading(true);
      try {
        let q = SP()
          .web.lists.getByTitle(listTitle)
          .items.select("Id,Title,soat,codigo,marca,modelo,capacidad,rampa,Proveedor/Title")
          .expand("Proveedor")
          .top(500); // si necesitás más, subilo

        if (nombreEmpresa && nombreEmpresa.trim()) {
          q = q.filter(`Proveedor/Title eq '${safe(nombreEmpresa.trim())}'`);
        }

        const items: any[] = await q();
        const mapped: VehiculoRow[] = items.map((it) => ({
          key: it.Id,
          Id: it.Id,
          Placa: it.Title || "",
          SOAT: it.soat,
          Codigo: it.codigo,
          Marca: it.marca,
          Modelo: it.modelo,
          Capacidad: it.capacidad,
          Rampa: !!it.rampa,
        }));
        setRows(mapped);
      } catch (err) {
        console.error("useVehiculosEmpresa.load error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [vehList]
  );

  return { rows, loading, load, setRows };
}
