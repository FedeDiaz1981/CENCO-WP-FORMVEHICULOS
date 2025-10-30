export interface Vehiculo {
  // --- Meta ---
  Id?: number;

  // ===================== Campos de UI (formulario) =====================
  Placa: string;                 // <- se mapea a Title
  SOAT?: string;                 // <- soat
  Codigo?: string;               // <- codigo
  Marca?: string;                // <- marca
  Modelo?: string;               // <- modelo
  Capacidad?: string;            // <- capacidad (choice)
  Otros?: string;                // <- capacidad_otros
  Rampa?: boolean;               // <- rampa
  LargoRampa?: string;           // <- largorampa
  AnchoRampa?: string;           // <- anchorampa
  Bonificacion?: boolean;        // <- bonificacion
  NroResolucion?: string;        // <- resolucion
  MedidasInternas?: string;      // <- medidasinternas
  MedidasExternas?: string;      // <- medidasexternas
  AlturaPiso?: string;           // <- alturapiso
  PesoCargaUtil?: string;        // <- pesocargautil
  PesoNeto?: string;             // <- pesobruto
  Temperatura?: string;          // <- temperatura (choice)
  TipoTemperatura?: string;      // <- Tipo_x0020_Temperatura (choice)
  TipoUnidad?: string;           // <- Tipo_x0020_de_x0020_unidad (choice)

  // Campos extra que ya existían en tu lista
  Propiedad?: boolean;           // internal normalmente "Propiedad"
  RielesLogisticos?: boolean;    // internal puede variar, lo dejamos opcional
  Activo?: boolean;              // internal normalmente "Activo"
  CorreosNotificacion?: string;
  // ===================== Nombres internos SP (payload) =====================
  // NO uses estos desde la UI; se arman en el payload.
  Title?: string;                       // Placa
  soat?: string;
  codigo?: string;
  marca?: string;
  modelo?: string;
  capacidad?: string;
  capacidad_otros?: string;
  rampa?: boolean;
  largorampa?: string;
  anchorampa?: string;
  bonificacion?: boolean;
  resolucion?: string;
  medidasinternas?: string;
  medidasexternas?: string;
  alturapiso?: string;
  pesocargautil?: string;
  pesobruto?: string;
  temperatura?: string;
  Tipo_x0020_Temperatura?: string;
  Tipo_x0020_de_x0020_unidad?: string;
}
