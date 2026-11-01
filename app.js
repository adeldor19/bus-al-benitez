/*
 * Bus al Benítez — buscador didáctico.
 * Encuentra rutas directas y con un transbordo.
 * La duración se estima por número de tramos; aún no usa horarios de paso.
 */
const formulario=document.querySelector("#route-form");
const selectorOrigen=document.querySelector("#origin");
const selectorLlegada=document.querySelector("#arrival");
const selectorMargen=document.querySelector("#buffer");
const contenedorResultados=document.querySelector("#results");
const MINUTOS_POR_TRAMO_ESTIMADOS=2;
const MINUTOS_TRANSBORDO_ESTIMADOS=7;

function normalizar(texto){return texto.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
function claveParada(nombre){
  const n=normalizar(nombre);
  const alias={
    "sto domingo ii":"santo domingo ii","santo domingo ii":"santo domingo ii",
    "porvenir unica":"porvenir","avd la comedia":"avenida la comedia",
    "avenida la comedia":"avenida la comedia","avd vallesequillo":"avenida vallesequillo",
    "avda vallesequillo":"avenida vallesequillo","avda europa":"avenida europa",
    "avda medina sidonia":"avenida medina sidonia","c manuel hue":"miguel hue",
    "c miguel hue":"miguel hue","c sta ines":"santa ines",
    "tomas g figueras":"tomas g figueras","hipercor andalucia":"hipercor andalucia"
  };
  return alias[n]||n;
}
function cargarZonas(){
  selectorOrigen.replaceChildren();
  selectorOrigen.add(new Option("Selecciona tu zona…",""));
  DATOS_BUS.zonas.forEach(z=>selectorOrigen.add(new Option(z.nombre,z.id)));
  selectorOrigen.disabled=DATOS_BUS.zonas.length===0;
}
function el(tag,clase,texto){const n=document.createElement(tag);if(clase)n.className=clase;if(texto!==undefined)n.textContent=texto;return n;}
function mostrarEstado(titulo,mensaje){
  const card=el("div","empty-state card");
  card.append(el("span","empty-symbol","⌁"),el("p","eyebrow","02 / RESULTADOS"),el("h2","",titulo),el("p","",mensaje));
  const a=document.createElement("a");a.href=DATOS_BUS.fuente.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Consultar horarios oficiales de COMUJESA ↗";
  card.append(a);contenedorResultados.replaceChildren(card);
}
function posiciones(linea,nombre){const key=claveParada(nombre);const out=[];linea.paradas.forEach((p,i)=>{if(claveParada(p)===key)out.push(i);});return out;}
function objetivos(){return DATOS_BUS.destino.paradas.map(p=>({...p,clave:claveParada(p.nombre)}));}
function rutaDirecta(linea,inicio,objetivo){
  let mejor=null;
  posiciones(linea,inicio).forEach(i=>posiciones(linea,objetivo.nombre).forEach(j=>{
    if(j<=i)return;
    const tramos=j-i,minutos=tramos*MINUTOS_POR_TRAMO_ESTIMADOS+objetivo.caminarMin;
    const r={lineas:[linea],origen:linea.paradas[i],destino:objetivo.nombre,transbordos:0,cambio:null,tramos,minutos,caminarMin:objetivo.caminarMin};
    if(!mejor||r.minutos<mejor.minutos)mejor=r;
  }));
  return mejor;
}
function rutasTransbordo(a,b,inicio,objetivo){
  const out=[];
  posiciones(a,inicio).forEach(i=>{
    for(let j=i+1;j<a.paradas.length;j++){
      const cambio=a.paradas[j];
      posiciones(b,cambio).forEach(k=>posiciones(b,objetivo.nombre).forEach(f=>{
        if(f<=k)return;
        const tramos=(j-i)+(f-k);
        out.push({lineas:[a,b],origen:a.paradas[i],destino:objetivo.nombre,transbordos:1,cambio,tramos,minutos:tramos*MINUTOS_POR_TRAMO_ESTIMADOS+MINUTOS_TRANSBORDO_ESTIMADOS+objetivo.caminarMin,caminarMin:objetivo.caminarMin});
      }));
    }
  });
  return out;
}
function buscarRutas(zonaId){
  const zona=DATOS_BUS.zonas.find(z=>z.id===zonaId);if(!zona)return [];
  const candidatas=[],targets=objetivos();
  DATOS_BUS.lineas.forEach(linea=>zona.paradas.forEach(origen=>targets.forEach(target=>{const r=rutaDirecta(linea,origen,target);if(r)candidatas.push(r);})));
  DATOS_BUS.lineas.forEach(a=>zona.paradas.forEach(origen=>targets.forEach(target=>DATOS_BUS.lineas.forEach(b=>{
    if(a.numero===b.numero)return;
    candidatas.push(...rutasTransbordo(a,b,origen,target));
  }))));
  const unicas=new Map();
  candidatas.forEach(r=>{
    const key=[r.lineas.map(l=>l.id).join(">"),claveParada(r.origen),claveParada(r.destino),claveParada(r.cambio||"")].join("|");
    if(!unicas.has(key)||r.minutos<unicas.get(key).minutos)unicas.set(key,r);
  });
  return [...unicas.values()].sort((a,b)=>a.minutos-b.minutos||a.transbordos-b.transbordos||a.tramos-b.tramos).slice(0,5);
}
function dibujarRuta(ruta,i){
  const card=el("article","card route-card"),top=el("div","route-top");
  top.append(el("span","route-badge",i===0?"MENOR DURACIÓN ESTIMADA":"ALTERNATIVA"),el("span","route-number",ruta.transbordos+" transbordos"));
  const title=el("h2","route-title",ruta.minutos+" min aprox.");
  const summary=el("p","route-summary",ruta.transbordos===0?("Autobús directo desde "+ruta.origen+" hasta "+ruta.destino+"."):("Cambia en "+ruta.cambio+": línea "+ruta.lineas[0].numero+" → línea "+ruta.lineas[1].numero+"."));
  const steps=el("ol","route-stops");
  if(!ruta.transbordos){steps.append(el("li","", "Sube en: "+ruta.origen+" · Línea "+ruta.lineas[0].numero),el("li","","Baja en: "+ruta.destino));}
  else{steps.append(el("li","","Sube en: "+ruta.origen+" · Línea "+ruta.lineas[0].numero),el("li","","Transbordo en: "+ruta.cambio+" · Línea "+ruta.lineas[1].numero),el("li","","Baja en: "+ruta.destino));}
  const detail=el("p","route-detail","Estimación didáctica: "+ruta.tramos+" tramos de autobús + "+ruta.caminarMin+" min a pie. No incluye la espera real.");
  const link=document.createElement("a");link.href=ruta.lineas[0].url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Ver recorrido oficial de la línea "+ruta.lineas[0].numero+" ↗";
  card.append(top,title,summary,steps,detail,link);return card;
}
function dibujarResultados(rutas,hora,margen){
  if(!rutas.length){mostrarEstado("No encontramos una ruta con estos datos","Prueba otra zona. El buscador compara las paradas incorporadas en esta primera versión.");return;}
  const heading=el("div","results-heading");
  heading.append(el("p","eyebrow","02 / RESULTADOS"),el("h2","","Opciones para llegar al instituto"),el("p","results-note","Hora objetivo: "+hora+". Margen seleccionado: "+margen+" min. Aún no comprobamos qué autobús pasa a tiempo."));
  const warning=el("div","estimate-warning");warning.append(el("strong","","Estimaciones, no horarios oficiales"),el("p","","Las opciones se ordenan por duración orientativa calculada a partir del número de paradas. La frecuencia, los tiempos de paso y la hora real de salida deben contrastarse con COMUJESA."));
  const fragment=document.createDocumentFragment();fragment.append(heading,warning);rutas.forEach((r,i)=>fragment.append(dibujarRuta(r,i)));contenedorResultados.replaceChildren(fragment);
}
formulario.addEventListener("submit",e=>{e.preventDefault();if(!formulario.reportValidity())return;dibujarResultados(buscarRutas(selectorOrigen.value),selectorLlegada.value,Number(selectorMargen.value));});
cargarZonas();