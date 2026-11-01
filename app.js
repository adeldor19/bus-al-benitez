/*
 * BUS AL BENÍTEZ — lógica de la aplicación
 * Esta primera versión evita ofrecer rutas ficticias.
 * La búsqueda de rutas se activará al incorporar datos oficiales.
 */

const formulario = document.querySelector("#route-form");
const selectorOrigen = document.querySelector("#origin");
const selectorLlegada = document.querySelector("#arrival");
const selectorMargen = document.querySelector("#buffer");
const contenedorResultados = document.querySelector("#results");

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function cargarZonas() {
  selectorOrigen.replaceChildren();
  selectorOrigen.add(new Option("Selecciona tu barrio o zona…", ""));

  const zonasOrdenadas = [...DATOS_BUS.zonas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es")
  );

  zonasOrdenadas.forEach(zona => {
    selectorOrigen.add(new Option(zona.nombre, zona.id));
  });

  selectorOrigen.disabled = zonasOrdenadas.length === 0;

  if (zonasOrdenadas.length === 0) {
    selectorOrigen.options[0].textContent = "Zonas pendientes de incorporar";
  }
}

function mostrarEstado(titulo, mensaje) {
  const tarjeta = crearElemento("div", "empty-state card");
  tarjeta.append(
    crearElemento("span", "empty-symbol", "⌁"),
    crearElemento("p", "eyebrow", "02 / RESULTADOS"),
    crearElemento("h2", "", titulo),
    crearElemento("p", "", mensaje)
  );

  const enlace = document.createElement("a");
  enlace.href = DATOS_BUS.fuente.url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  enlace.textContent = "Consultar información oficial de COMUJESA ↗";
  tarjeta.append(enlace);

  contenedorResultados.replaceChildren(tarjeta);
}

function minutosDesdeMedianoche(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

/*
 * Próximo paso de desarrollo:
 * 1. Construir el grafo dirigido con las paradas y líneas.
 * 2. Incorporar horarios de paso por parada.
 * 3. Calcular hacia atrás desde la hora objetivo.
 * 4. Comparar hora de llegada, espera y transbordos.
 *
 * No se calculará una "ruta más rápida" usando duraciones inventadas.
 */
function buscarRutas(origenId, horaLlegada, margen) {
  const horaObjetivo = minutosDesdeMedianoche(horaLlegada) - margen;
  const zona = DATOS_BUS.zonas.find(item => item.id === origenId);

  if (!zona) {
    return {
      rutas: [],
      mensaje: "Selecciona una zona de origen válida."
    };
  }

  if (!DATOS_BUS.destino.paradaId) {
    return {
      rutas: [],
      mensaje: "Estamos identificando y verificando las paradas más cercanas al IES Andrés Benítez. Aún no hay una parada de destino confirmada."
    };
  }

  if (DATOS_BUS.lineas.length === 0 || DATOS_BUS.paradas.length === 0) {
    return {
      rutas: [],
      mensaje: "La estructura está preparada, pero todavía no se han incorporado las líneas y paradas oficiales."
    };
  }

  return {
    rutas: [],
    horaObjetivo,
    mensaje: "Los datos de recorridos están incorporados, pero falta completar y validar los horarios de paso necesarios para comparar tiempos de llegada."
  };
}

function dibujarResultados(resultado) {
  if (!resultado.rutas.length) {
    mostrarEstado("Todavía estamos preparando las rutas", resultado.mensaje);
    return;
  }

  // Se mostrarán rutas aquí cuando existan resultados verificables.
  const fragmento = document.createDocumentFragment();

  resultado.rutas.forEach((ruta, indice) => {
    const tarjeta = crearElemento("article", "card route-card");
    tarjeta.append(
      crearElemento("p", "eyebrow", `ALTERNATIVA ${indice + 1}`),
      crearElemento("h2", "", ruta.titulo),
      crearElemento("p", "", ruta.descripcion)
    );
    fragmento.append(tarjeta);
  });

  contenedorResultados.replaceChildren(fragmento);
}

formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  if (!formulario.reportValidity()) return;

  const origen = selectorOrigen.value;
  const llegada = selectorLlegada.value;
  const margen = Number(selectorMargen.value);

  const resultado = buscarRutas(origen, llegada, margen);
  dibujarResultados(resultado);
});

cargarZonas();
