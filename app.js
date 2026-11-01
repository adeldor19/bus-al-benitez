/*
 * Bus al Benítez — buscador didáctico.
 * Las líneas circulares 8 y 9 se reconstruyen como un recorrido continuo.
 * Los nombres de los sentidos oficiales son tramos de una vuelta; no implican
 * que el autobús termine necesariamente el servicio en la última parada listada.
 * Los tiempos son estimaciones didácticas, no horarios de paso.
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
 const alias={"sto domingo ii":"santo domingo ii","santo domingo ii":"santo domingo ii","porvenir unica":"porvenir","avd la comedia":"avenida la comedia","avenida la comedia":"avenida la comedia","avd vallesequillo":"avenida vallesequillo","avda vallesequillo":"avenida vallesequillo","avda europa":"avenida europa","avda medina sidonia":"avenida medina sidonia","c manuel hue":"miguel hue","c miguel hue":"miguel hue","c sta ines":"santa ines","tomas g figueras":"tomas g figueras","hipercor andalucia":"hipercor andalucia","pz madre dios":"madre de dios","madre de dios":"madre de dios","esteve":"plaza esteve","plaza esteve":"plaza esteve","angustias canal sur unica":"angustias canal sur","angustias canal sur":"angustias canal sur"};
 return alias[n]||n;
}
function cargarZonas(){selectorOrigen.replaceChildren();selectorOrigen.add(new Option("Selecciona tu zona…",""));DATOS_BUS.zonas.forEach(z=>selectorOrigen.add(new Option(z.nombre,z.id)));selectorOrigen.disabled=DATOS_BUS.zonas.length===0;}
function el(tag,clase,texto){const n=document.createElement(tag);if(clase)n.className=clase;if(texto!==undefined)n.textContent=texto;return n;}
function mostrarEstado(titulo,mensaje){
 const card=el("div","empty-state card");card.append(el("span","empty-symbol","⌁"),el("p","eyebrow","02 / RESULTADOS"),el("h2","",titulo),el("p","",mensaje));
 const a=document.createElement("a");a.href=DATOS_BUS.fuente.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Consultar horarios oficiales de COMUJESA ↗";card.append(a);contenedorResultados.replaceChildren(card);
}
function posiciones(linea,nombre){const key=claveParada(nombre),out=[];linea.paradas.forEach((p,i)=>{if(claveParada(p)===key)out.push(i);});return out;}
function objetivos(){return DATOS_BUS.destino.paradas.map(p=>({...p,clave:claveParada(p.nombre)}));}
function lineasParaBuscar(){
 const salida=[],porNumero=new Map();
 DATOS_BUS.lineas.forEach(l=>{if(!porNumero.has(l.numero))porNumero.set(l.numero,[]);porNumero.get(l.numero).push(l);});
 porNumero.forEach(grupo=>{
  if(grupo[0].circular){
   const primero=grupo.find(l=>l.id.endsWith("-ida"))||grupo[0];
   const segundo=grupo.find(l=>l.id.endsWith("-vuelta"));
   salida.push({...primero,id:"L"+primero.numero+"-circular",sentido:"Recorrido circular completo",circular:true,paradas:segundo?[...primero.paradas,...segundo.paradas]:[...primero.paradas]});
  }else salida.push(...grupo);
 });
 return salida;
}
function distanciaIndices(linea,i,j){
 if(linea.circular){const d=(j-i+linea.paradas.length)%linea.paradas.length;return d===0?Infinity:d;}
 return j>i?j-i:Infinity;
}
function rutaDirecta(linea,inicio,objetivo){
 let mejor=null;
 posiciones(linea,inicio).forEach(i=>posiciones(linea,objetivo.nombre).forEach(j=>{
  const tramos=distanciaIndices(linea,i,j);if(!Number.isFinite(tramos))return;
  const minutos=tramos*MINUTOS_POR_TRAMO_ESTIMADOS+objetivo.caminarMin;
  const r={lineas:[linea],origen:linea.paradas[i],destino:objetivo.nombre,transbordos:0,cambio:null,tramos,minutos,caminarMin:objetivo.caminarMin};
  if(!mejor||r.minutos<mejor.minutos)mejor=r;
 }));
 return mejor;
}
function rutasTransbordo(a,b,inicio,objetivo){
 const out=[];
 posiciones(a,inicio).forEach(i=>{
  a.paradas.forEach((cambio,j)=>{
   const primerTramo=distanciaIndices(a,i,j);if(!Number.isFinite(primerTramo))return;
   posiciones(b,cambio).forEach(k=>posiciones(b,objetivo.nombre).forEach(f=>{
    const segundoTramo=distanciaIndices(b,k,f);if(!Number.isFinite(segundoTramo))return;
    const tramos=primerTramo+segundoTramo;
    out.push({lineas:[a,b],origen:a.paradas[i],destino:objetivo.nombre,transbordos:1,cambio,tramos,minutos:tramos*MINUTOS_POR_TRAMO_ESTIMADOS+MINUTOS_TRANSBORDO_ESTIMADOS+objetivo.caminarMin,caminarMin:objetivo.caminarMin});
   }));
  });
 });
 return out;
}
function buscarRutas(zonaId){
 const zona=DATOS_BUS.zonas.find(z=>z.id===zonaId);if(!zona)return [];
 const lineas=lineasParaBuscar(),candidatas=[],targets=objetivos();
 lineas.forEach(linea=>zona.paradas.forEach(origen=>targets.forEach(target=>{const r=rutaDirecta(linea,origen,target);if(r)candidatas.push(r);})));
 lineas.forEach(a=>zona.paradas.forEach(origen=>targets.forEach(target=>lineas.forEach(b=>{
  if(a.id===b.id)return;
  if(a.numero===b.numero)return;
  candidatas.push(...rutasTransbordo(a,b,origen,target));
 }))));
 const unicas=new Map();
 candidatas.forEach(r=>{const key=[r.lineas.map(l=>l.id).join(">"),claveParada(r.origen),claveParada(r.destino),claveParada(r.cambio||"")].join("|");if(!unicas.has(key)||r.minutos<unicas.get(key).minutos)unicas.set(key,r);});
 const ordenadas=[...unicas.values()].sort((a,b)=>a.transbordos-b.transbordos||a.minutos-b.minutos||a.tramos-b.tramos);
 // No ocultar una línea directa solo porque la estimación simplificada de un transbordo sea menor.
 // Reservar primero la mejor ruta directa de cada línea; después completar con las alternativas más rápidas.
 const elegidas=[],lineasDirectas=new Set();
 ordenadas.filter(r=>r.transbordos===0).forEach(r=>{
  const id=r.lineas[0].id;
  if(!lineasDirectas.has(id)&&elegidas.length<5){elegidas.push(r);lineasDirectas.add(id);}
 });
 ordenadas.forEach(r=>{if(elegidas.length<5&&!elegidas.includes(r))elegidas.push(r);});
 return elegidas.sort((a,b)=>a.transbordos-b.transbordos||a.minutos-b.minutos||a.tramos-b.tramos);
}
function dibujarRuta(ruta,i){
 const card=el("article","card route-card"),top=el("div","route-top");
 top.append(el("span","route-badge",i===0?"MENOR DURACIÓN ESTIMADA":"ALTERNATIVA"),el("span","route-number",ruta.transbordos+" transbordos"));
 const title=el("h2","route-title",ruta.minutos+" min aprox.");
 const summary=el("p","route-summary",ruta.transbordos===0?("Autobús directo desde "+ruta.origen+" hasta "+ruta.destino+". El autobús puede continuar después de esa parada."):( "Cambia en "+ruta.cambio+": línea "+ruta.lineas[0].numero+" → línea "+ruta.lineas[1].numero+"."));
 const steps=el("ol","route-stops");
 if(!ruta.transbordos)steps.append(el("li","","Sube en: "+ruta.origen+" · Línea "+ruta.lineas[0].numero),el("li","","Baja en: "+ruta.destino+" (parada de bajada, no necesariamente final de línea)"));
 else steps.append(el("li","","Sube en: "+ruta.origen+" · Línea "+ruta.lineas[0].numero),el("li","","Transbordo en: "+ruta.cambio+" · Línea "+ruta.lineas[1].numero),el("li","","Baja en: "+ruta.destino+" (parada de bajada, no necesariamente final de línea)"));
 const detail=el("p","route-detail","Estimación didáctica: "+ruta.tramos+" tramos de autobús + "+ruta.caminarMin+" min a pie. No incluye la espera real ni confirma una hora de llegada.");
 const links=el("p","route-detail","Recorrido considerado: "+ruta.lineas.map(l=>"línea "+l.numero).join(" → ")+". Consulta el sentido y los horarios oficiales antes de viajar.");
 const link=document.createElement("a");link.href=ruta.lineas[0].url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Ver recorrido oficial de la línea "+ruta.lineas[0].numero+" ↗";
 card.append(top,title,summary,steps,detail,links,link);return card;
}
function dibujarResultados(rutas,hora,margen){
 if(!rutas.length){mostrarEstado("No encontramos una ruta con estos datos","Prueba otra zona. El buscador compara las paradas incorporadas en esta primera versión.");return;}
 const heading=el("div","results-heading");heading.append(el("p","eyebrow","02 / RESULTADOS"),el("h2","","Opciones para llegar al instituto"),el("p","results-note","Hora objetivo: "+hora+". Margen seleccionado: "+margen+" min. Aún no comprobamos qué autobús pasa a tiempo."));
 const warning=el("div","estimate-warning");warning.append(el("strong","","Estimaciones, no horarios oficiales"),el("p","","Las líneas circulares 8 y 9 se recorren de forma continua en el buscador: llegar a la última parada mostrada de un sentido no significa necesariamente que el autobús termine allí. La duración se estima por tramos y no garantiza la llegada."));
 const fragment=document.createDocumentFragment();fragment.append(heading,warning);rutas.forEach((r,i)=>fragment.append(dibujarRuta(r,i)));contenedorResultados.replaceChildren(fragment);
}
formulario.addEventListener("submit",e=>{e.preventDefault();if(!formulario.reportValidity())return;dibujarResultados(buscarRutas(selectorOrigen.value),selectorLlegada.value,Number(selectorMargen.value));});
cargarZonas();