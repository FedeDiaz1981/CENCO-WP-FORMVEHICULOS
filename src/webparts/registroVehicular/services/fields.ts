export const LISTS = { Vehiculos:"Vehiculos", Certificados:"Certificados", Proveedores:"Proveedores" } as const;

export const VEH_FIELDS = {
  Title: "Title",
  Proveedor: "Proveedor",
  SOAT: "soat",
  Codigo: "codigo",
  Marca: "marca",
  Modelo: "modelo",
  Capacidad: "capacidad",
  CapacidadOtros: "capacidad_otros",
  Rampa: "rampa",
  LargoRampa: "largorampa",
  AnchoRampa: "anchorampa",
  Bonificacion: "bonificacion",
  Resolucion: "resolucion",
  MedidasInternas: "medidasinternas",
  MedidasExternas: "medidasexternas",
  AlturaPiso: "alturapiso",
  PesoCargaUtil: "pesocargautil",
  PesoBruto: "pesobruto",
  Temperatura: "temperatura",
  TipoTemperatura: "Tipo_x0020_Temperatura",
  TipoUnidad: "Tipo_x0020_de_x0020_unidad",
  Activo: "Activo",
} as const;

export const CERT_FIELDS = {
  Title: "Title",
  Certificado: "certificado",
  Emision: "emision",
  Caducidad: "caducidad",
  Anio: "anio",
  Resolucion: "resolucion",
  Expediente: "expediente",
} as const;