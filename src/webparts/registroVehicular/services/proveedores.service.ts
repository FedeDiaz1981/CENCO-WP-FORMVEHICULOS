import { SP } from "../../../pnp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface EmpresaLookupResult {
  empresaTitle?: string;
  proveedorId?: number;
}

export interface GetEmpresaOptions {
  /** Si es false no se aplica filtro por proveedor */
  Proveedor?: boolean;
  listName?: string;
  displayCol?: string;
  userCol?: string;
}

const safe = (s: string) => (s || "").replace(/'/g, "''");

/**
 * Si opts.Proveedor === false -> retorna {} para no filtrar
 * Si true/undefined -> busca el proveedor asociado al usuario actual
 */
export async function getEmpresaForCurrentUser(
  opts: GetEmpresaOptions = {}
): Promise<EmpresaLookupResult> {
  const {
    Proveedor = true,
    listName = "Proveedores",
    displayCol = "Title",
    userCol = "Usuarios",
  } = opts;

  // No filtrar por proveedor => devolvemos vacío
  if (!Proveedor) return {};

  try {
    const me = await SP().web.currentUser();
    const meId = me?.Id;
    const emailSafe = safe((me?.Email || "").toLowerCase());

    const r1: any[] = await SP()
      .web.lists.getByTitle(listName)
      .items.select(`Id,${displayCol},${userCol}/Id,Created`)
      .expand(userCol)
      .filter(`${userCol}/Id eq ${meId}`)
      .orderBy("Created", false)
      .top(1)();

    if (r1?.[0]) return { empresaTitle: r1[0][displayCol], proveedorId: r1[0].Id };

    const r2: any[] = await SP()
      .web.lists.getByTitle(listName)
      .items.select(`Id,${displayCol},${userCol},Created`)
      .filter(`${userCol} eq '${emailSafe}'`)
      .orderBy("Created", false)
      .top(1)();

    if (r2?.[0]) return { empresaTitle: r2[0][displayCol], proveedorId: r2[0].Id };

    const r3: any[] = await SP()
      .web.lists.getByTitle(listName)
      .items.select(`Id,${displayCol},Created`)
      .filter(`substringof('${emailSafe}', ${userCol})`)
      .orderBy("Created", false)
      .top(1)();

    if (r3?.[0]) return { empresaTitle: r3[0][displayCol], proveedorId: r3[0].Id };
  } catch {}

  return {};
}
