import { SP } from "../../../pnp";
export { SP }; // reexport por comodidad

export const safe = (s: string) => (s || "").replace(/'/g, "''");
export const asString = (v: any) => (v ?? v === 0 ? String(v) : undefined);
export const asBool   = (v: any) => (v ?? v === false ? !!v : undefined);

// cache genérico por lista
const _allowedKeysCache = new Map<string, Promise<Set<string>>>();
export async function getAllowedKeys(listTitle: string): Promise<Set<string>> {
  const key = (listTitle || "").toLowerCase();
  if (_allowedKeysCache.has(key)) return _allowedKeysCache.get(key)!;
  const p = (async () => {
    const fields = await SP().web.lists.getByTitle(listTitle)
      .fields.select("InternalName,TypeAsString,Hidden,ReadOnlyField")();
    const allowed = new Set<string>();
    for (const f of fields) {
      if (f.Hidden || f.ReadOnlyField) continue;
      allowed.add(f.InternalName);
      if (/Lookup|User/i.test(f.TypeAsString || "")) allowed.add(`${f.InternalName}Id`);
    }
    return allowed;
  })();
  _allowedKeysCache.set(key, p);
  return p;
}
