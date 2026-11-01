# Bus al Benítez 🚌

Planificador educativo de rutas de autobús al IES Andrés Benítez (Jerez de la Frontera). Está construido con HTML, CSS y JavaScript y puede publicarse con GitHub Pages, sin servidor ni base de datos.

## Archivos

- `index.html`: estructura y formulario.
- `styles.css`: diseño visual adaptable a móvil y ordenador.
- `datos.js`: recorridos, paradas, zonas y enlaces a las fuentes.
- `app.js`: búsqueda de rutas directas y con un transbordo.

## Importante: cómo interpretar los resultados

Esta versión compara recorridos y muestra una **estimación didáctica**, calculada a partir del número de tramos de autobús (2 minutos por tramo, más una estimación para caminar y, si procede, hacer un transbordo). Estos valores son parámetros de prueba, no tiempos publicados por COMUJESA.

Todavía no se han incorporado ni validado en el buscador los horarios de paso completos de cada parada. Por tanto, la aplicación **no puede garantizar que una ruta permita llegar antes de una hora determinada** y no debe usarse como sustituto de los horarios oficiales. Las rutas se ordenan por una estimación de duración, no por una predicción real del servicio.

## Fuentes oficiales

- [COMUJESA — Líneas, paradas y horarios](https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/)
- [Línea 4](https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/linea-4)
- [Línea 8](https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/linea-8)
- [Línea 9](https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/linea-9)
- [Línea 10](https://www.comujesa.es/autobuses-urbanos/lineas-paradas-y-horarios/linea-10)

La web de COMUJESA indica que sus mapas de recorrido son orientativos y que obras, tráfico y otros factores pueden alterar los trayectos. Hay que verificar la temporada de cada PDF antes de transcribir sus horarios.

## Ideas de ampliación para el alumnado

1. Incorporar más líneas y sentidos de recorrido desde las fichas oficiales.
2. Añadir el código oficial de cada parada para evitar confusiones entre nombres parecidos.
3. Importar los horarios laborables vigentes y distinguirlos de sábados, domingos y festivos.
4. Calcular hacia atrás desde la hora de entrada para determinar qué salidas permiten llegar a tiempo.
5. Sustituir los tiempos didácticos por tiempos documentados y etiquetar cualquier estimación.
6. Añadir pruebas de rutas conocidas y comprobar los resultados manualmente.

## Publicar con GitHub Pages

En el repositorio, abre **Settings → Pages**. En “Build and deployment”, selecciona “Deploy from a branch”, rama `main` y carpeta `/(root)`, y guarda los cambios.
