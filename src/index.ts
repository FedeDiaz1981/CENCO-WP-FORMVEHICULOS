// index.ts  (o pnp.ts)
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp";

// Imports de efecto para habilitar webs/lists/items/attachments
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";

import { BaseComponentContext } from "@microsoft/sp-component-base";

let _sp: SPFI | undefined;

/** Inicializa PnPjs v3 con el contexto SPFx */
export function initSP(context: BaseComponentContext): void {
  _sp = spfi().using(SPFx(context));
}

/** Obtiene la instancia global de SPFI ya inicializada */
export function SP(): SPFI {
  if (!_sp) throw new Error("PnPjs no inicializado. Llama initSP(this.context) en onInit().");
  return _sp;
}
