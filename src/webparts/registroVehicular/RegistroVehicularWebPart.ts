// src/webparts/registroVehicular/RegistroVehicularWebPart.ts
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, DisplayMode } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import RegistroVehicular from './RegistroVehicular';
import type { IRegistroVehicularProps } from './IRegistroVehicularProps';

// PnP
import { initSP, SP } from '../../pnp';
// necesarios para grupos de sitio
import "@pnp/sp/site-groups";
import "@pnp/sp/site-users";

export interface IRegistroVehicularWebPartProps {
  // NUEVAS/EXISTENTES
  vehiculosListTitle?: string;
  proveedoresList?: string;
  proveedoresDisplayField?: string;
  proveedoresUserField?: string;

  // Flags por membresía (se calculan en onInit)
  Proveedor?: boolean;
  Distribuidor?: boolean;
  Coordinador?: boolean;
}

export default class RegistroVehicularWebPart
  extends BaseClientSideWebPart<IRegistroVehicularWebPartProps> {

  /** Evita renders en vivo mientras el usuario tipea en el property pane */
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  public async onInit(): Promise<void> {
    await super.onInit();
    try { initSP(this.context); } catch { /* ya inicializado */ }

    // defaults defensivos
    if (typeof this.properties.Proveedor !== 'boolean')   this.properties.Proveedor = false;
    if (typeof this.properties.Distribuidor !== 'boolean') this.properties.Distribuidor = false;
    if (typeof this.properties.Coordinador !== 'boolean')  this.properties.Coordinador = false;

    if (!this.properties.vehiculosListTitle)      this.properties.vehiculosListTitle = 'Vehiculos';
    if (!this.properties.proveedoresList)         this.properties.proveedoresList = 'Proveedores';
    if (!this.properties.proveedoresDisplayField) this.properties.proveedoresDisplayField = 'Title';
    if (!this.properties.proveedoresUserField)    this.properties.proveedoresUserField = 'Usuarios';

    // === detectar grupos del usuario actual ===
    try {
      const me = await SP().web.currentUser();
      const meId = me?.Id;

      const isMember = async (names: string[]): Promise<boolean> => {
        for (const n of names) {
          if (!n) continue;
          try {
            const users: any[] = await SP().web.siteGroups.getByName(n).users.select('Id')();
            if (users.some(u => u.Id === meId)) return true;
          } catch { /* grupo no existe */ }
        }
        return false;
      };

      const inProv  = await isMember(["Proveedores", "GrupoProveedores"]);
      const inDist  = await isMember(["Distribucion", "Distribución", "Grupo Distribucion", "Grupo Distribución"]);
      const inCoord = await isMember(["Coordinadores"]);

      this.properties.Distribuidor = inDist;
      this.properties.Coordinador  = inCoord;
      this.properties.Proveedor    = inProv ? true : false;
    } catch {
      // si falla detección, dejamos defaults
    }
  }

  public render(): void {
    const element: React.ReactElement<IRegistroVehicularProps> = React.createElement(
      RegistroVehicular,
      {
        // Flags de rol
        Proveedor:   this.properties.Proveedor ?? false,
        Distribuidor:this.properties.Distribuidor ?? false,
        Coordinador: this.properties.Coordinador ?? false,

        // Orígenes/config
        vehiculosListTitle: this.properties.vehiculosListTitle || 'Vehiculos',
        proveedoresList: this.properties.proveedoresList || 'Proveedores',
        proveedoresDisplayField: this.properties.proveedoresDisplayField || 'Title',
        proveedoresUserField: this.properties.proveedoresUserField || 'Usuarios',

        // Útiles abajo en el componente
        context: this.context as any,
        displayMode: this.displayMode as DisplayMode,
      } as IRegistroVehicularProps
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configuración' },
          groups: [
            {
              groupName: 'Roles detectados (solo lectura)',
              groupFields: [
                PropertyPaneToggle('Proveedor',    { label: 'Es Proveedor',    disabled: true }),
                PropertyPaneToggle('Distribuidor', { label: 'Es Distribuidor', disabled: true }),
                PropertyPaneToggle('Coordinador',  { label: 'Es Coordinador',  disabled: true }),
              ],
            },
            {
              groupName: 'Listas / Proveedores',
              groupFields: [
                PropertyPaneTextField('vehiculosListTitle',      { label: 'Lista de Vehículos', placeholder: 'Vehiculos' }),
                PropertyPaneTextField('proveedoresList',         { label: 'Lista de Proveedores', placeholder: 'Proveedores' }),
                PropertyPaneTextField('proveedoresDisplayField', { label: 'Campo a mostrar', placeholder: 'Title' }),
                PropertyPaneTextField('proveedoresUserField',    { label: 'Campo de usuario', placeholder: 'Usuarios' }),
              ],
            },
          ],
        },
      ],
    };
  }
}
