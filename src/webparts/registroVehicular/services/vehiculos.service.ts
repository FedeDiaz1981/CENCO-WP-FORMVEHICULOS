import { SP } from "../../../pnp"; // deja tu helper como lo tenías
import { Vehiculo } from "../models/vehiculo";
import { getEmpresaForCurrentUser } from "./proveedores.service";
import { LISTS, VEH_FIELDS } from "./fields";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";

const safe = (s: string) => (s || "").replace(/'/g, "''");
const asString = (v: any) => (v === undefined || v === null ? undefined : String(v));
const asBool = (v: any) => (v === undefined || v === null ? undefined : !!v);

// Campos a seleccionar (una sola vez)
const DESIRED_FIELDS: readonly string[] = [
  VEH_FIELDS.Title,
  VEH_FIELDS.SOAT,
  VEH_FIELDS.Codigo,
  VEH_FIELDS.Marca,
  VEH_FIELDS.Modelo,
  VEH_FIELDS.Capacidad,
  VEH_FIELDS.CapacidadOtros,
  VEH_FIELDS.Rampa,
  VEH_FIELDS.LargoRampa,
  VEH_FIELDS.AnchoRampa,
  VEH_FIELDS.Bonificacion,
  VEH_FIELDS.Resolucion,
  VEH_FIELDS.MedidasInternas,
  VEH_FIELDS.MedidasExternas,
  VEH_FIELDS.AlturaPiso,
  VEH_FIELDS.PesoCargaUtil,
  VEH_FIELDS.PesoBruto,
  VEH_FIELDS.Temperatura,
  VEH_FIELDS.TipoTemperatura,
  VEH_FIELDS.TipoUnidad,
  VEH_FIELDS.Activo,
  // CorreosNotificacion puede estar en otra lista; si lo tenés, descomenta:
  // "correosnotificacion",
];

let _allowedKeysPromise: Promise<Set<string>> | null = null;
async function getAllowedKeys(listTitle: string): Promise<Set<string>> {
  if (_allowedKeysPromise) return _allowedKeysPromise;
  const sp = SP();
  _allowedKeysPromise = (async () => {
    const fields = await sp.web.lists
      .getByTitle(listTitle)
      .fields.select("InternalName,TypeAsString,Hidden,ReadOnlyField")();
    const allowed = new Set<string>();
    for (const f of fields) {
      if (f.Hidden || f.ReadOnlyField) continue;
      allowed.add(f.InternalName);
      if (/Lookup|User/i.test(f.TypeAsString || "")) allowed.add(`${f.InternalName}Id`);
    }
    return allowed;
  })();
  return _allowedKeysPromise;
}

export async function getVehiculoByPlaca(
  placa: string,
  listTitle: string = LISTS.Vehiculos
): Promise<(Vehiculo & { Empresa?: string; EmpresaId?: number }) | undefined> {
  const sp = SP();
  const allowed = await getAllowedKeys(listTitle);
  const selectFields = ["Id", ...DESIRED_FIELDS.filter((n) => allowed.has(n))];

  const items: any[] = await sp.web.lists
    .getByTitle(listTitle)
    .items.select(selectFields.join(","))
    .filter(`${VEH_FIELDS.Title} eq '${safe(placa)}'`)
    .top(1)();

  const it = items?.[0];
  if (!it) return undefined;

  return {
    Id: it.Id,
    Placa: it[VEH_FIELDS.Title] || "",
    SOAT: it[VEH_FIELDS.SOAT],
    Codigo: it[VEH_FIELDS.Codigo],
    Marca: it[VEH_FIELDS.Marca],
    Modelo: it[VEH_FIELDS.Modelo],
    Capacidad: it[VEH_FIELDS.Capacidad],
    Otros: it[VEH_FIELDS.CapacidadOtros],
    Rampa: it[VEH_FIELDS.Rampa],
    LargoRampa: it[VEH_FIELDS.LargoRampa],
    AnchoRampa: it[VEH_FIELDS.AnchoRampa],
    Bonificacion: it[VEH_FIELDS.Bonificacion],
    NroResolucion: it[VEH_FIELDS.Resolucion],
    MedidasInternas: it[VEH_FIELDS.MedidasInternas],
    MedidasExternas: it[VEH_FIELDS.MedidasExternas],
    AlturaPiso: it[VEH_FIELDS.AlturaPiso],
    PesoCargaUtil: it[VEH_FIELDS.PesoCargaUtil],
    PesoNeto: it[VEH_FIELDS.PesoBruto],
    Temperatura: it[VEH_FIELDS.Temperatura],
    TipoTemperatura: it[VEH_FIELDS.TipoTemperatura],
    TipoUnidad: it[VEH_FIELDS.TipoUnidad],
    Activo: it[VEH_FIELDS.Activo],
    // CorreosNotificacion: it["correosnotificacion"],
  };
}

export async function upsertVehiculo(v: Vehiculo, listTitle: string = LISTS.Vehiculos): Promise<number> {
  const sp = SP();
  const { proveedorId } = await getEmpresaForCurrentUser();

  const payloadBase: any = {
    [VEH_FIELDS.Title]: asString(v.Placa),
    [VEH_FIELDS.SOAT]: asString(v.SOAT),
    [VEH_FIELDS.Codigo]: asString(v.Codigo),
    [VEH_FIELDS.Marca]: asString(v.Marca),
    [VEH_FIELDS.Modelo]: asString(v.Modelo),
    [VEH_FIELDS.Capacidad]: asString(v.Capacidad),
    [VEH_FIELDS.CapacidadOtros]: asString(v.Otros),
    [VEH_FIELDS.Rampa]: asBool(v.Rampa),
    [VEH_FIELDS.LargoRampa]: asString(v.LargoRampa),
    [VEH_FIELDS.AnchoRampa]: asString(v.AnchoRampa),
    [VEH_FIELDS.Bonificacion]: asBool(v.Bonificacion),
    [VEH_FIELDS.Resolucion]: asString(v.NroResolucion),
    [VEH_FIELDS.MedidasInternas]: asString(v.MedidasInternas),
    [VEH_FIELDS.MedidasExternas]: asString(v.MedidasExternas),
    [VEH_FIELDS.AlturaPiso]: asString(v.AlturaPiso),
    [VEH_FIELDS.PesoCargaUtil]: asString(v.PesoCargaUtil),
    [VEH_FIELDS.PesoBruto]: asString(v.PesoNeto),
    [VEH_FIELDS.Temperatura]: asString(v.Temperatura),
    [VEH_FIELDS.TipoTemperatura]: asString(v.TipoTemperatura),
    [VEH_FIELDS.TipoUnidad]: asString(v.TipoUnidad),
    // "correosnotificacion": asString(v.CorreosNotificacion),
  };
  if (proveedorId != null) {
    payloadBase[`${VEH_FIELDS.Proveedor}Id`] = proveedorId;
  }

  const allowed = await getAllowedKeys(listTitle);
  const payload: any = {};
  for (const [k, val] of Object.entries(payloadBase)) {
    if (val !== undefined && allowed.has(k)) payload[k] = val;
  }

  const ex: any[] = await sp.web.lists
    .getByTitle(listTitle)
    .items.select("Id")
    .filter(`${VEH_FIELDS.Title} eq '${safe(v.Placa || "")}'`)
    .top(1)();

  if (ex[0]?.Id) {
    await sp.web.lists.getByTitle(listTitle).items.getById(ex[0].Id).update(payload);
    return ex[0].Id;
  } else {
    const add = await sp.web.lists.getByTitle(listTitle).items.add(payload);
    return add.data.Id;
  }
}

export async function deleteVehiculoById(id: number, listTitle: string = LISTS.Vehiculos): Promise<void> {
  if (!id) return;
  const sp = SP();
  await sp.web.lists.getByTitle(listTitle).items.getById(id).delete();
}

export async function deleteVehiculoByPlaca(
  placa: string,
  listTitle: string = LISTS.Vehiculos
): Promise<void> {
  const placaTrim = (placa || "").trim();
  if (!placaTrim) return;

  const sp = SP();
  const list = sp.web.lists.getByTitle(listTitle);

  const items = await list.items
    .select("Id")
    .filter(`${VEH_FIELDS.Title} eq '${safe(placaTrim)}'`)
    .top(1)();

  const id = items?.[0]?.Id;
  if (!id) return;

  await list.items.getById(id).delete();
}
