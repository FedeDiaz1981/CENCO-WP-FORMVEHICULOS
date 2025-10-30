export interface Certificado {
  Placa?: string;        // <- OPCIONAL
  Emision?: Date;
  Plazos?: number;
  Caducidad?: Date;
  Alerta?: number;
  Status?: string;       // "Vigente" | "Vencido" | "Baja"
  certificado?: string;  // SOAT/RTV/etc.
  Adjuntos?: File[];
  Id?: number;
}
