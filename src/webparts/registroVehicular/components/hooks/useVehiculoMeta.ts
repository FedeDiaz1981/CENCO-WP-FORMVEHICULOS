// src/webparts/registroVehicular/hooks/useVehiculoMeta.ts
import * as React from "react";
import type { IDropdownOption } from "@fluentui/react";
import type { FieldMeta } from "../../types";
import type { IFieldInfo } from "@pnp/sp/fields/types";
import { SP } from "../../../../pnp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";     
import "@pnp/sp/fields/list";   
import "@pnp/sp/items";

async function readFieldsMeta(listTitle: string, internals: readonly string[]) {
  const fieldsApi = SP().web.lists.getByTitle(listTitle).fields;
  const metas: Record<string, FieldMeta> = {};
  await Promise.all(
    internals.map(async (name) => {
      try {
        const f = await fieldsApi
          .getByInternalNameOrTitle(name)
          .select(
            "InternalName,Title,TypeAsString,Required,Choices,LookupList,LookupField"
          )();
        const fa = f as IFieldInfo & { LookupList?: string; LookupField?: string };
        metas[name] = {
          InternalName: fa.InternalName,
          Title: fa.Title,
          TypeAsString: fa.TypeAsString,
          Required: fa.Required,
          Choices: fa.Choices,
          LookupList: fa.LookupList,
          LookupField: fa.LookupField,
        };
      } catch {
        /* ignore */
      }
    })
  );
  return metas;
}

async function readLookupOptions(
  listGuid: string,
  lookupField: string
): Promise<IDropdownOption[]> {
  const list = SP().web.lists.getById(listGuid.replace(/[{}]/g, ""));
  const col = lookupField || "Title";
  const items = await list.items.select(`Id,${col}`).top(2000)();
  return items.map((it: any) => ({ key: it.Id, text: it[col] ?? `#${it.Id}` }));
}

type UseVehiculoMetaReturn = {
  meta: Record<string, FieldMeta>;
  choices: Record<string, IDropdownOption[]>;
  lookups: Record<string, IDropdownOption[]>;
  isChoice: (n: string) => boolean;
  isLookup: (n: string) => boolean;
  isNumber: (n: string) => boolean;
};

export function useVehiculoMeta(
  vehList: string,
  internals: readonly string[]
): UseVehiculoMetaReturn {
  const [meta, setMeta] = React.useState<Record<string, FieldMeta>>({});
  const [choices, setChoices] = React.useState<Record<string, IDropdownOption[]>>(
    {}
  );
  const [lookups, setLookups] = React.useState<
    Record<string, IDropdownOption[]>
  >({});

  // clave estable para deps (evita usar .join() inline)
  const internalsKey = React.useMemo(() => internals.join("|"), [internals]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const m = await readFieldsMeta(vehList, internals);
        if (cancelled) return;
        setMeta(m);

        const ch: Record<string, IDropdownOption[]> = {};
        Object.values(m)
          .filter(
            (f) => f.TypeAsString === "Choice" && Array.isArray(f.Choices)
          )
          .forEach((f) => {
            ch[f.InternalName] = (f.Choices || []).map((c) => ({
              key: c,
              text: c,
            }));
          });
        if (cancelled) return;
        setChoices(ch);

        const lookupsToLoad = Object.values(m).filter(
          (f) => f.TypeAsString === "Lookup" && f.LookupList
        );

        const loaded = await Promise.all(
          lookupsToLoad.map(async (f) => {
            try {
              const opts = await readLookupOptions(
                f.LookupList!,
                f.LookupField || "Title"
              );
              return [f.InternalName, opts] as const;
            } catch {
              return [f.InternalName, [] as IDropdownOption[]] as const;
            }
          })
        );
        if (cancelled) return;

        const lk: Record<string, IDropdownOption[]> = {};
        loaded.forEach(([k, opts]) => (lk[k] = opts));
        setLookups(lk);
      } catch {
        // silenciado a propósito
      }
    };

    void run(); // <- elimina no-floating-promises
    return () => {
      cancelled = true;
    };
  }, [vehList, internalsKey]);

  const isChoice = (n: string) => meta[n]?.TypeAsString === "Choice";
  const isLookup = (n: string) => meta[n]?.TypeAsString === "Lookup";
  const isNumber = (n: string) => meta[n]?.TypeAsString === "Number";

  return { meta, choices, lookups, isChoice, isLookup, isNumber };
}
