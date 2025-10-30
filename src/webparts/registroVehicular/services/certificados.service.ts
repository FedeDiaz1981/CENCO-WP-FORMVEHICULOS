import { SP } from "../../../pnp";
import type { DocState } from "../types";
import { LISTS, CERT_FIELDS } from "./fields";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";

const safe = (s: string) => (s || "").replace(/'/g, "''");
const toDate = (v: any): Date | null =>
  v ? new Date(typeof v === "string" ? v : (v as string)) : null;

export type Certificado = {
  Placa: string;
  certificado?: string;
  emision?: Date;
  caducidad?: Date;
  anio?: string | number;
  resolucion?: Date;
  expediente?: string;
  Adjuntos?: File[];
};

export async function addOrUpdateCertificado(
  data: Certificado,
  listTitle: string = LISTS.Certificados
): Promise<number> {
  const sp = SP();
  const list = sp.web.lists.getByTitle(listTitle);

  const payload: any = { [CERT_FIELDS.Title]: data.Placa };
  if (data.certificado) payload[CERT_FIELDS.Certificado] = data.certificado;
  if (data.emision) payload[CERT_FIELDS.Emision] = data.emision;
  if (data.caducidad) payload[CERT_FIELDS.Caducidad] = data.caducidad;
  if (data.anio !== undefined && data.anio !== null) payload[CERT_FIELDS.Anio] = data.anio as any;
  if (data.resolucion) payload[CERT_FIELDS.Resolucion] = data.resolucion;
  if (data.expediente) payload[CERT_FIELDS.Expediente] = data.expediente;

  const tipo = data.certificado ? safe(data.certificado) : "";
  const ex: any[] = await list.items
    .select("Id")
    .filter(`${CERT_FIELDS.Title} eq '${safe(data.Placa)}' and ${CERT_FIELDS.Certificado} eq '${tipo}'`)
    .orderBy("Id", false)
    .top(1)();

  let id: number;
  if (ex?.[0]?.Id) {
    id = ex[0].Id as number;
    await list.items.getById(id).update(payload);
  } else {
    const add = await list.items.add(payload);
    id = add.data.Id as number;
  }

  if (data.Adjuntos?.length) {
    const item = list.items.getById(id);
    const current = await item.attachmentFiles();
    for (const f of current) await item.attachmentFiles.getByName(f.FileName).delete();
    for (const f of data.Adjuntos) await item.attachmentFiles.add(f.name, f);
  }

  return id;
}

export async function getCertificadosEstado(
  placa: string,
  listTitle: string = LISTS.Certificados
): Promise<Partial<DocState>> {
  const sp = SP();

  const items: any[] = await sp.web.lists
    .getByTitle(listTitle)
    .items.select(
      `Id,${CERT_FIELDS.Title},${CERT_FIELDS.Certificado},${CERT_FIELDS.Emision},${CERT_FIELDS.Caducidad},${CERT_FIELDS.Anio},${CERT_FIELDS.Resolucion},${CERT_FIELDS.Expediente}`
    )
    .filter(`${CERT_FIELDS.Title} eq '${safe(placa)}'`)
    .orderBy("Id", false)();

  const latest = new Map<string, any>();
  for (const it of items) {
    const key = (it[CERT_FIELDS.Certificado] || "").toUpperCase();
    if (!latest.has(key)) latest.set(key, it);
  }
  const get = (k: string) => latest.get(k);

  return {
    propFile: null,
    resBonificacionFile: null,
    certBonificacionDate: toDate(get("CERTIFICADO_BONIFICACION")?.[CERT_FIELDS.Emision]),
    certBonificaFile: null,
    revTecDate: toDate(get("REVISION_TECNICA")?.[CERT_FIELDS.Emision]),
    revTecText: (get("REVISION_TECNICA")?.[CERT_FIELDS.Anio] ?? "") + "",
    revTecFile: null,
    SanipesDate: toDate(get("SANIPES")?.[CERT_FIELDS.Resolucion]),
    SanipesText: get("SANIPES")?.[CERT_FIELDS.Expediente] ?? "",
    sanipesFile: null,
    termokingDate: toDate(get("TERMOKING")?.[CERT_FIELDS.Emision]),
    termokingFile: null,
    limpiezaDate: toDate(get("LIMPIEZA_DESINFECCION")?.[CERT_FIELDS.Emision]),
    limpiezaFile: null,
  };
}

export type CertRow = {
  id: number;
  tipo: string;
  emision?: string | null;
  resolucion?: string | null;
  anio?: string | number | null;
  expediente?: string | null;
  archivo?: string | null;
};

// Sin N+1: expandimos adjuntos
export async function getCertificadosListado(
  placa: string,
  listTitle: string = LISTS.Certificados
): Promise<CertRow[]> {
  const sp = SP();

  const items: any[] = await sp.web.lists
    .getByTitle(listTitle)
    .items.select(
      `Id,${CERT_FIELDS.Title},${CERT_FIELDS.Certificado},${CERT_FIELDS.Emision},${CERT_FIELDS.Caducidad},${CERT_FIELDS.Anio},${CERT_FIELDS.Resolucion},${CERT_FIELDS.Expediente},AttachmentFiles/FileName`
    )
    .expand("AttachmentFiles")
    .filter(`${CERT_FIELDS.Title} eq '${safe(placa)}'`)
    .orderBy("Id", false)();

  const byTipo = new Map<string, any>();
  for (const it of items) {
    const key = (it[CERT_FIELDS.Certificado] || "").toUpperCase();
    if (!byTipo.has(key)) byTipo.set(key, it);
  }

  const tipos = Array.from(byTipo.keys()).sort();
  const rows: CertRow[] = [];
  for (const t of tipos) {
    const it = byTipo.get(t);
    const archivo = it?.AttachmentFiles?.[0]?.FileName ?? null;
    rows.push({
      id: it.Id,
      tipo: t,
      emision: it[CERT_FIELDS.Emision] ?? null,
      resolucion: it[CERT_FIELDS.Resolucion] ?? null,
      anio: it[CERT_FIELDS.Anio] ?? null,
      expediente: it[CERT_FIELDS.Expediente] ?? null,
      archivo,
    });
  }
  return rows;
}

// PnPjs v3 batching
// certificados.service.ts
export async function deleteCertificadosPorPlaca(
  placa: string,
  listTitle: string = LISTS.Certificados
): Promise<void> {
  const placaTrim = (placa || "").trim();
  if (!placaTrim) return;

  const sp = SP();
  const list = sp.web.lists.getByTitle(listTitle);

  const items = await list.items
    .select("Id")
    .filter(`${CERT_FIELDS.Title} eq '${safe(placaTrim)}'`)();

  if (!items?.length) return;

  // Eliminamos en paralelo por tandas para no saturar
  const ids = items.map((it: any) => it.Id);
  const chunkSize = 10; // ajustá si querés

  for (let i = 0; i < ids.length; i += chunkSize) {
    const slice = ids.slice(i, i + chunkSize);
    await Promise.all(
      slice.map((id) => list.items.getById(id).delete())
    );
  }
}


export async function replaceCertificadoAdjunto(
  placa: string,
  tipo: string,
  newFile: File,
  listTitle: string = LISTS.Certificados
): Promise<{ id: number; archivo: string | null }> {
  const sp = SP();
  const items: any[] = await sp.web.lists
    .getByTitle(listTitle)
    .items.select(`Id,${CERT_FIELDS.Title},${CERT_FIELDS.Certificado}`)
    .filter(
      `${CERT_FIELDS.Title} eq '${safe(placa)}' and (${CERT_FIELDS.Certificado} eq '${safe(
        tipo
      )}' or ${CERT_FIELDS.Certificado} eq '${safe(tipo.toUpperCase())}')`
    )
    .orderBy("Id", false)
    .top(1)();

  const it = items[0];
  if (!it) throw new Error("No existe un registro para ese certificado");

  const item = sp.web.lists.getByTitle(listTitle).items.getById(it.Id);

  const existing = await item.attachmentFiles();
  for (const f of existing) await item.attachmentFiles.getByName(f.FileName).delete();

  await item.attachmentFiles.add(newFile.name, newFile);

  const withFiles = await item.select("AttachmentFiles/FileName").expand("AttachmentFiles")();
  const archivo = withFiles?.AttachmentFiles?.[0]?.FileName ?? newFile.name;
  return { id: it.Id, archivo };
}

export async function replaceAdjuntoById(
  itemId: number,
  newFile: File,
  listTitle: string = LISTS.Certificados
): Promise<{ id: number; archivo: string | null }> {
  const sp = SP();
  const item = sp.web.lists.getByTitle(listTitle).items.getById(itemId);

  const existing = await item.attachmentFiles();
  for (const f of existing) await item.attachmentFiles.getByName(f.FileName).delete();

  await item.attachmentFiles.add(newFile.name, newFile);

  const withFiles = await item.select("AttachmentFiles/FileName").expand("AttachmentFiles")();
  const archivo = withFiles?.AttachmentFiles?.[0]?.FileName ?? newFile.name;
  return { id: itemId, archivo };
}
