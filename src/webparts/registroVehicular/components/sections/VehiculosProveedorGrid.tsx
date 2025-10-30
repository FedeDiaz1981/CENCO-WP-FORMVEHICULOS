// src/webparts/registroVehicular/sections/VehiculosProveedorGrid.tsx
import * as React from "react";
import {
  Icon,
  MessageBar,
  MessageBarType,
  Separator,
  ShimmeredDetailsList,
  SelectionMode,
  SearchBox,
} from "@fluentui/react";
import { classes } from "../../ui/styles";
import type { VehiculoRow } from "../../types";

export const VehiculosProveedorGrid: React.FC<{
  /** Nombre de la empresa (solo relevante si Proveedor === true) */
  empresa?: string;
  rows: VehiculoRow[];
  loading: boolean;
  onInvokeRow: (item: VehiculoRow) => void;
  Proveedor?: boolean;
}> = ({
  empresa,
  rows,
  loading,
  onInvokeRow,
  Proveedor = true,
}) => {
  const [query, setQuery] = React.useState("");

  const titulo = Proveedor
    ? `Vehículos de ${empresa || "la Empresa"}`
    : "Vehículos";
  const emptyMsg = Proveedor
    ? "No hay vehículos registrados para esta Empresa."
    : "No hay vehículos registrados.";

  // Filtrado simple por cualquier campo
  const rowsFiltradas = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      // Ajusta campos según tu tipo VehiculoRow
      const texto = [
        r.Placa,
        r.SOAT,
        r.Codigo,
        r.Marca,
        r.Modelo,
        r.Capacidad,
      ]
        .map((v) => (v ?? "").toString().toLowerCase())
        .join(" ");
      return texto.includes(q);
    });
  }, [rows, query]);

  return (
    <div className={classes.card}>
      <div className={classes.cardHeader}>
        <Icon iconName="GroupedList" />
        <div className={classes.cardTitle}>{titulo}</div>
      </div>
      <Separator />

      {/* Buscador */}
      <SearchBox
        placeholder="Buscar por cualquier campo…"
        value={query}
        onChange={(_, v) => setQuery(v || "")}
        onClear={() => setQuery("")}
        styles={{ root: { marginBottom: 8, maxWidth: 320 } }}
      />

      {rowsFiltradas.length === 0 && !loading && (
        <MessageBar messageBarType={MessageBarType.warning}>
          {query ? "Sin resultados para la búsqueda." : emptyMsg}
        </MessageBar>
      )}

      <ShimmeredDetailsList
        items={rowsFiltradas}
        enableShimmer={loading}
        columns={[
          { key: "colPlaca", name: "Placa", minWidth: 80, fieldName: "Placa" },
          { key: "colSOAT", name: "SOAT", minWidth: 80, fieldName: "SOAT" },
          { key: "colCodigo", name: "Código", minWidth: 80, fieldName: "Codigo" },
          { key: "colMarca", name: "Marca", minWidth: 80, fieldName: "Marca" },
          { key: "colModelo", name: "Modelo", minWidth: 80, fieldName: "Modelo" },
          { key: "colCap", name: "Capacidad", minWidth: 80, fieldName: "Capacidad" },
        ]}
        selectionMode={SelectionMode.none}
        onItemInvoked={onInvokeRow}
      />

      <div style={{ marginTop: 8, opacity: 0.8 }}>
        Doble-click en una fila para cargarla en el formulario.
      </div>
    </div>
  );
};
