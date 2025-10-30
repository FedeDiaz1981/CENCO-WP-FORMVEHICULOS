// src/webparts/registroVehicular/components/hooks/useEmpresaAuto.ts
import * as React from "react";
import { SP } from "../../../../pnp";
import "@pnp/sp/site-users/web";

type EmpresaRef = { nombre?: string; id?: number };

export function useEmpresaAuto(
  listName: string = "Proveedores",
  displayCol: string = "Title",
  userCol: string = "Usuarios"
): EmpresaRef {
  const [empresa, setEmpresa] = React.useState<EmpresaRef>({});

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const effectiveList  = listName || "Proveedores";
        const effectiveDisp  = displayCol || "Title";
        const effectiveUsers = userCol   || "Usuarios";

        const me = await SP().web.currentUser();
        const meId = me?.Id as number;
        const meEmail = (me?.Email || "").toLowerCase();
        const emailSafe = meEmail.replace(/'/g, "''");

        const byPersona = async () => {
          try {
            const r: any[] = await SP()
              .web.lists.getByTitle(effectiveList)
              .items.select(`Id,${effectiveDisp},${effectiveUsers}/Id,${effectiveUsers}/EMail,Created`)
              .expand(effectiveUsers)
              .filter(`${effectiveUsers}/Id eq ${meId}`)
              .orderBy("Created", false)
              .top(1)();
            return r?.[0] ?? null;
          } catch { return null; }
        };

        const byTextExact = async () => {
          try {
            const r: any[] = await SP()
              .web.lists.getByTitle(effectiveList)
              .items.select(`Id,${effectiveDisp},${effectiveUsers},Created`)
              .filter(`${effectiveUsers} eq '${emailSafe}'`)
              .orderBy("Created", false)
              .top(1)();
            return r?.[0] ?? null;
          } catch { return null; }
        };

        const byTextContains = async () => {
          try {
            const r: any[] = await SP()
              .web.lists.getByTitle(effectiveList)
              .items.select(`Id,${effectiveDisp},Created`)
              .filter(`substringof('${emailSafe}', ${effectiveUsers})`)
              .orderBy("Created", false)
              .top(1)();
            return r?.[0] ?? null;
          } catch { return null; }
        };

        const item = (await byPersona()) ?? (await byTextExact()) ?? (await byTextContains());
        if (!cancelled) setEmpresa({ nombre: item ? item[effectiveDisp] : "", id: item?.Id });
      } catch {
        if (!cancelled) setEmpresa({});
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [listName, displayCol, userCol]);

  return empresa;
}
