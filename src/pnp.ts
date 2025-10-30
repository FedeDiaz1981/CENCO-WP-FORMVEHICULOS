// src/webparts/registroVehicular/pnp.ts
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp";   // <- v2.x: SPFx viene de "@pnp/sp"

// IMPORTS DE EFECTO (v2/v3, seguros)
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";

import { BaseComponentContext } from "@microsoft/sp-component-base";

let _sp: SPFI | undefined;

export function initSP(context: BaseComponentContext): void {
  if (!_sp) {
    _sp = spfi().using(SPFx(context));
  }
}

export function SP(): SPFI {
  if (!_sp) throw new Error("PnPjs no inicializado. Llama initSP(context) en onInit().");
  return _sp;
}
