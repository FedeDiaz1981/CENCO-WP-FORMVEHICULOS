// src/webparts/registroVehicular/IRegistroVehicularProps.ts
import { DisplayMode } from '@microsoft/sp-core-library';

export interface IRegistroVehicularProps {
  Proveedor?: boolean;
  Distribuidor?: boolean;
  Coordinador?: boolean;

  proveedoresList?: string;
  proveedoresDisplayField?: string;
  proveedoresUserField?: string;
  vehiculosListTitle?: string;

  // útiles para hooks/componente (opcionales)
  context?: any;
  displayMode?: DisplayMode;
}
