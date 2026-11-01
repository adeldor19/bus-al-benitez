/*
 * DATOS DE BUS AL BENÍTEZ
 * Los datos de líneas, paradas y horarios deben transcribirse
 * desde documentos oficiales actuales de COMUJESA y comprobarse.
 *
 * No rellenar con suposiciones. "minutos" solo puede contener
 * una duración respaldada por una fuente o marcada como estimada.
 */

const DATOS_BUS = {
  fuente: {
    nombre: "COMUJESA",
    url: "https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios",
    temporada: null,
    fechaActualizacion: null
  },

  destino: {
    nombre: "IES Andrés Benítez",
    paradaId: null,
    paradasAlternativas: []
  },

  // Cada zona debe apuntar a paradas reales incluidas en las líneas.
  zonas: [
    // Ejemplo de estructura (no es un dato real):
    // { id: "zona-centro", nombre: "Centro", paradas: ["P001"] }
  ],

  // Estructura de cada línea:
  // {
  //   id: "L1",
  //   nombre: "Línea 1",
  //   sentido: "Sentido verificado",
  //   paradas: ["P001", "P002", "P003"],
  //   tiemposEntreParadas: [4, 6],
  //   horarios: [],
  //   urlHorario: "",
  //   estado: "verificado" // o "estimado"
  // }
  paradas: [],
  lineas: []
};
