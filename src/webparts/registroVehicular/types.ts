// src/webparts/registroVehicular/types.ts
export type Accion = "crear" | "actualizar" | "baja";

export type FieldMeta = {
  InternalName: string;
  Title: string;
  TypeAsString: string;
  Required?: boolean;
  Choices?: string[];
  LookupList?: string;
  LookupField?: string;
};

export type VehiculoRow = {
  key: number;
  Id: number;
  Placa: string;
  SOAT?: string;
  Codigo?: string;
  Marca?: string;
  Modelo?: string;
  Capacidad?: string;
  Rampa?: boolean;
  CorreosNotificacion?: string;
};

export type DocState = {
  propFile: File | null;
  resBonificacionFile: File | null;
  certBonificacionDate: Date | null;
  certBonificaFile: File | null;
  revTecDate: Date | null;
  revTecText: string;
  revTecFile: File | null;
  SanipesDate: Date | null;
  SanipesText: string;
  sanipesFile: File | null;
  termokingDate: Date | null;
  termokingFile: File | null;
  limpiezaDate: Date | null;
  limpiezaFile: File | null;
  fumigacionDate: Date | null;
  fumigacionFile: File | null;
};
