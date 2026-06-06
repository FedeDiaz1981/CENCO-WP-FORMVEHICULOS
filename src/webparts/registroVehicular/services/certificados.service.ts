import { SP } from "../../../pnp";
import { SPFI } from "@pnp/sp";
import { LISTS, CERT_FIELDS } from "./fields";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";

export type CertDocSimple = {
  id: number;
  tipo: string;
  emision?: string | null;
  caducidad?: string | null;
  anio?: number | null;
  resolucion?: string | null;
  expediente?: string | null;
  attachments: Array<{ name: string; url: string }>;
};

// para no romper el filtro de SP
const esc = (s: string): string => (s || "").replace(/'/g, "''");

// 1) upsert de UN certificado (como hace la webpart de personal)
async function upsertCertificado(
  sp: SPFI,
  placa: string,
  tipo: string,
  fields: {
    emision?: string | null;
    caducidad?: string | null;
    anio?: string | number | null;
    resolucion?: string | null;
    expediente?: string | null;
  },
  file?: File | null
): Promise<void> {
  const list = sp.web.lists.getByTitle(LISTS.Certificados);

  // armo el payload con los nombres reales de tu lista
  const toUpdate: any = {};
  if (fields.emision !== undefined)
    toUpdate[CERT_FIELDS.Emision] = fields.emision;
  if (fields.caducidad !== undefined)
    toUpdate[CERT_FIELDS.Caducidad] = fields.caducidad;
  if (fields.anio !== undefined && fields.anio !== null && fields.anio !== "")
    toUpdate[CERT_FIELDS.Anio] = Number(fields.anio);
  if (fields.resolucion !== undefined)
    toUpdate[CERT_FIELDS.Resolucion] = fields.resolucion;
  if (fields.expediente !== undefined)
    toUpdate[CERT_FIELDS.Expediente] = fields.expediente;

  // ¿ya existe uno para esta placa + tipo?
  const existing: any[] = await list.items
    .select("Id")
    .filter(
      `${CERT_FIELDS.Title} eq '${esc(
        placa
      )}' and ${CERT_FIELDS.Certificado} eq '${esc(tipo)}'`
    )
    .orderBy("Id", false)
    .top(1)();

  let id: number;

  if (existing.length) {
    // actualizar
    id = existing[0].Id;
    if (Object.keys(toUpdate).length) {
      await list.items.getById(id).update(toUpdate);
    }
  } else {
    // crear
    const add = await list.items.add({
      [CERT_FIELDS.Title]: placa,
      [CERT_FIELDS.Certificado]: tipo,
      ...toUpdate,
    });
    id = add.data.Id;
  }

  // si no hay archivo, ya está
  if (!(file instanceof File)) return;

  // borro adjuntos anteriores (igual que hace personal)
  const item = list.items.getById(id);
  const current = await item.attachmentFiles();
  if (current?.length) {
    for (const a of current) {
      try {
        await item.attachmentFiles.getByName(a.FileName).delete();
      } catch {
        // ignoramos si no pudo borrar
      }
    }
  }

  const safeName = (file.name || tipo).replace(/[<>:"/\\|?*]/g, "_");
  const bytes = await file.arrayBuffer();
  await item.attachmentFiles.add(safeName, bytes);
}

// 2) función grande que guarda TODO de forma secuencial
export async function guardarTodosSecuencial(
  placa: string,
  doc: any,
  flags: {
    showTermoking: boolean;
    showSanipes: boolean;
    showFumigacion: boolean;
    showLimpieza: boolean;
    showResBonificacion: boolean;
  }
): Promise<void> {
  const sp = SP();

  // Tarjeta de propiedad (siempre)
  await upsertCertificado(sp, placa, "Tarjeta de propiedad", {}, doc.propFile);

  // Bonificación
  if (flags.showResBonificacion) {
    await upsertCertificado(
      sp,
      placa,
      "Bonificación",
      {},
      doc.resBonificacionFile
    );
  }

  // Fumigación
  if (flags.showFumigacion) {
    await upsertCertificado(
      sp,
      placa,
      "Fumigación",
      {
        emision: doc.fumigacionDate || null,
      },
      doc.fumigacionFile
    );
  }

  // Revisión técnica
  await upsertCertificado(
    sp,
    placa,
    "Revisión técnica",
    {
      caducidad: doc.revTecDate || null,
      anio: doc.revTecText || null,
    },
    doc.revTecFile
  );

  // Sanipes
  if (flags.showSanipes) {
    await upsertCertificado(
      sp,
      placa,
      "Sanipes",
      {
        resolucion: doc.SanipesDate || null,
        expediente: doc.SanipesText || null,
      },
      doc.sanipesFile
    );
  }

  // Termoking
  if (flags.showTermoking) {
    await upsertCertificado(
      sp,
      placa,
      "Termoking",
      {
        emision: doc.termokingDate || null,
      },
      doc.termokingFile
    );
  }

  // Limpieza y desinfección
  if (flags.showLimpieza) {
    await upsertCertificado(
      sp,
      placa,
      "Limpieza y desinfección",
      {
        emision: doc.limpiezaDate || null,
      },
      doc.limpiezaFile
    );
  }
}


export async function cargarCertificadosPorPlaca(
  placa: string
): Promise<CertDocSimple[]> {
  const sp = SP();
  const list = sp.web.lists.getByTitle(LISTS.Certificados);

  // 1) traigo todos los items de esa placa
  const items: any[] = await list.items
    .select(
      "Id",
      CERT_FIELDS.Title,
      CERT_FIELDS.Certificado,
      CERT_FIELDS.Emision,
      CERT_FIELDS.Caducidad,
      CERT_FIELDS.Anio,
      CERT_FIELDS.Resolucion,
      CERT_FIELDS.Expediente
    )
    .filter(`${CERT_FIELDS.Title} eq '${esc(placa)}'`)
    .orderBy("Id", false)
    .top(5000)();

  const result: CertDocSimple[] = [];

  // 2) por cada item pido sus adjuntos (como hace personas)
  for (const it of items) {
    const id = it.Id as number;
    const tipo = (it[CERT_FIELDS.Certificado] || "") as string;

    let attachments: Array<{ name: string; url: string }> = [];
    try {
      const atts = await list.items.getById(id).attachmentFiles();
      attachments = (atts || []).map((a: any) => ({
        name: a.FileName,
        url: a.ServerRelativeUrl, // si querés absoluto, concatenás la url del sitio
      }));
    } catch {
      attachments = [];
    }

    result.push({
      id,
      tipo,
      emision: it[CERT_FIELDS.Emision] ?? null,
      caducidad: it[CERT_FIELDS.Caducidad] ?? null,
      anio:
        it[CERT_FIELDS.Anio] !== undefined && it[CERT_FIELDS.Anio] !== null
          ? Number(it[CERT_FIELDS.Anio])
          : null,
      resolucion: it[CERT_FIELDS.Resolucion] ?? null,
      expediente: it[CERT_FIELDS.Expediente] ?? null,
      attachments,
    });
  }

  return result;
}

export async function deleteCertificadosPorPlaca(placa: string): Promise<void> {
  const sp = SP();
  const list = sp.web.lists.getByTitle(LISTS.Certificados);
  const placaSafe = (placa || "").trim();
  if (!placaSafe) return;

  // traemos sólo los Id de esa placa
  const items: Array<{ Id: number }> = await list.items
    .select("Id")
    .filter(`${CERT_FIELDS.Title} eq '${esc(placaSafe)}'`)
    .top(5000)();

  if (!items || !items.length) return;

  // borramos en tandas por si son muchos
  const chunkSize = 10;
  for (let i = 0; i < items.length; i += chunkSize) {
    const slice = items.slice(i, i + chunkSize);
    await Promise.all(
      slice.map((it) => list.items.getById(it.Id).delete())
    );
  }
}

export async function replaceCertificadoAdjunto(args: {
  placa: string;
  tipo: string;
  emision?: string | null;
  caducidad?: string | null;
  anio?: string | number | null;
  resolucion?: string | null;
  expediente?: string | null;
  file?: File | null;
}): Promise<void> {
  const {
    placa,
    tipo,
    emision,
    caducidad,
    anio,
    resolucion,
    expediente,
    file,
  } = args;

  const sp = SP();
  const list = sp.web.lists.getByTitle(LISTS.Certificados);

  // buscar último registro de esa placa + tipo
  const found: any[] = await list.items
    .select("Id")
    .filter(
      `${CERT_FIELDS.Title} eq '${placa.replace(/'/g, "''")}' and ${
        CERT_FIELDS.Certificado
      } eq '${tipo.replace(/'/g, "''")}'`
    )
    .orderBy("Id", false)
    .top(1)();

  // armamos payload solo con lo que vino
  const payload: any = {};
  if (emision !== undefined) payload[CERT_FIELDS.Emision] = emision;
  if (caducidad !== undefined) payload[CERT_FIELDS.Caducidad] = caducidad;
  if (anio !== undefined && anio !== null && anio !== "")
    payload[CERT_FIELDS.Anio] = Number(anio);
  if (resolucion !== undefined) payload[CERT_FIELDS.Resolucion] = resolucion;
  if (expediente !== undefined) payload[CERT_FIELDS.Expediente] = expediente;

  let itemId: number;
  if (found.length) {
    itemId = found[0].Id;
    if (Object.keys(payload).length) {
      await list.items.getById(itemId).update(payload);
    }
  } else {
    const add = await list.items.add({
      [CERT_FIELDS.Title]: placa,
      [CERT_FIELDS.Certificado]: tipo,
      ...payload,
    });
    itemId = add.data.Id;
  }

  // si no hay archivo, terminamos
  if (!(file instanceof File)) return;

  // reemplazar adjuntos (igual que antes)
  const item = list.items.getById(itemId);
  try {
    const current = await item.attachmentFiles();
    for (const a of current) {
      try {
        await item.attachmentFiles.getByName(a.FileName).delete();
      } catch {}
    }
  } catch {}

  const safeName = (file.name || tipo).replace(/[<>:"/\\|?*]/g, "_");
  const bytes = await file.arrayBuffer();
  await item.attachmentFiles.add(safeName, bytes);
}


export async function replaceAdjuntoById(
  arg1: number | { id: number; file: File },
  arg2?: File
): Promise<void> {
  // normalizamos los parámetros
  const itemId = typeof arg1 === "number" ? arg1 : arg1.id;
  const file = typeof arg1 === "number" ? arg2 : arg1.file;

  if (!itemId || !(file instanceof File)) {
    // no hay datos suficientes, salimos silenciosamente
    return;
  }

  const sp = SP();
  const list = sp.web.lists.getByTitle(LISTS.Certificados);
  const item = list.items.getById(itemId);

  // borrar adjuntos anteriores (simple)
  try {
    const current = await item.attachmentFiles();
    if (current?.length) {
      for (const a of current) {
        try {
          await item.attachmentFiles.getByName(a.FileName).delete();
        } catch {
          // no frenamos por esto
        }
      }
    }
  } catch {
    // si no había adjuntos, seguimos
  }

  // subir nuevo
  const safeName = (file.name || `adjunto-${itemId}`).replace(
    /[<>:"/\\|?*]/g,
    "_"
  );
  const bytes = await file.arrayBuffer();
  await item.attachmentFiles.add(safeName, bytes);
}

export type CertRow = {
  id: number;
  tipo: string;
  emision?: string | null;
  caducidad?: string | null;
  resolucion?: string | null;
  anio?: number | null;
  expediente?: string | null;
  archivo?: string | null;        
};

export async function getCertificadosListado(
  sp: SPFI,
  placa: string,
  listTitle: string = LISTS.Certificados
): Promise<CertRow[]> {
  // usamos tu función nueva
  const docs = await cargarCertificadosPorPlaca(placa);

  // la grilla sólo mostraba el primer adjunto como nombre
  return docs.map((d) => ({
    id: d.id,
    tipo: d.tipo,
    emision: d.emision ?? null,
    caducidad: d.caducidad ?? null,
    resolucion: d.resolucion ?? null,
    anio: d.anio ?? null,
    expediente: d.expediente ?? null,
    archivo: d.attachments && d.attachments.length
      ? d.attachments[0].name
      : null,
  }));
}