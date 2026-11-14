// FlohWorldControl – Seitensteuerung
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

const demoData = {
  farms: [
    {id:"holzfarm",name:"Holzfarm",base:"Hauptbase",world:"Survival",interval:10,active:true},
    {id:"eisenfarm",name:"Eisenfarm",base:"Hauptbase",world:"Survival",interval:15,active:true},
    {id:"kelpfarm",name:"Kelp-Farm",base:"Holz-Außenposten",world:"Survival",interval:10,active:true},
    {id:"zuckerrohr",name:"Zuckerrohr",base:"Testbasis",world:"Kreativ",interval:30,active:false}
  ],
  bases: [
    {id:"hauptbase",name:"Hauptbase",world:"Survival",description:"Deine Hauptzentrale"},
    {id:"holz-aussenposten",name:"Holz-Außenposten",world:"Survival",description:"Außenposten mit Holzfarm"},
    {id:"testbasis",name:"Testbasis",world:"Kreativ",description:"Technik- und Testbereich"}
  ],
  worlds: [
    {id:"survival",name:"Survival",description:"Hauptüberlebenswelt"},
    {id:"kreativ",name:"Kreativ",description:"Kreativ- und Testwelt"}
  ]
};

let data = demoData;
try {
  const saved = localStorage.getItem("fwc-demo-data");
  if (saved) {
    const parsed = JSON.parse(saved);
    data = {
      farms: Array.isArray(parsed.farms) ? parsed.farms : demoData.farms,
      bases: Array.isArray(parsed.bases) ? parsed.bases : demoData.bases,
      worlds: Array.isArray(parsed.worlds) ? parsed.worlds : demoData.worlds
    };
  }
} catch (error) {
  console.warn("Demo-Daten konnten nicht geladen werden:", error);
}

const save = () => {
  try { localStorage.setItem("fwc-demo-data", JSON.stringify(data)); }
  catch (error) { console.warn("Demo-Daten konnten nicht gespeichert werden:", error); }
};
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[char]));
const slug = value => value.toLowerCase().trim().replace(/[^a-z0-9äöüß]+/g,"-").replace(/^-|-$/g,"");
const titles = {
  overview:"Übersicht", farms:"Farmen", bases:"Basen", worlds:"Welten",
  storage:"Kistensuche", teleport:"Teleport", statistics:"Statistiken", plugin:"Plugin herunterladen"
};
const getRoute = () => {
  const parts = location.hash.replace(/^#/,"").split("/");
  return {section:parts[0] || "overview", id:parts[1] || null};
};

function closeMenu() {
  $("#sidebar")?.classList.remove("open");
  $("#sidebarBackdrop")?.classList.remove("show");
  $("#menuButton")?.setAttribute("aria-expanded","false");
}
function toggleMenu() {
  const sidebar = $("#sidebar");
  if (window.innerWidth <= 760) {
    const open = sidebar.classList.toggle("open");
    $("#sidebarBackdrop").classList.toggle("show",open);
    $("#menuButton").setAttribute("aria-expanded",String(open));
  } else {
    const hidden = sidebar.classList.toggle("collapsed");
    $(".main-area").classList.toggle("expanded",hidden);
    $("#menuButton").setAttribute("aria-expanded",String(!hidden));
  }
}

function updateSubnav(section,id) {
  const box = $("#sidebarSubnav");
  if (!["farms","bases","worlds"].includes(section)) {
    box.classList.remove("visible");
    box.innerHTML = "";
    return;
  }
  const labels = {farms:"Erstellte Farmen",bases:"Erstellte Basen",worlds:"Erstellte Welten"};
  box.classList.add("visible");
  box.innerHTML = '<p class="subnav-title">'+labels[section]+'</p>' +
    data[section].map(item => '<a class="'+(item.id===id?"active":"")+'" href="#'+section+'/'+encodeURIComponent(item.id)+'">'+escapeHTML(item.name)+'</a>').join("") +
    (data[section].length ? "" : '<p class="muted">Noch keine Einträge erstellt</p>');
}

function card(item,section,description) {
  return '<article class="item-card" data-open="'+section+'/'+encodeURIComponent(item.id)+'"><h3>'+escapeHTML(item.name)+'</h3><p>'+escapeHTML(description(item))+'</p><div class="card-foot"><span class="pill '+(item.active===false?"off":"")+'">'+(item.active===false?"Pausiert":"Verfügbar")+'</span><span class="muted">Öffnen →</span></div></article>';
}
function listPage(section) {
  const names = {farms:"Farmen",bases:"Basen",worlds:"Welten"};
  const singular = {farms:"Farm",bases:"Base",worlds:"Welt"};
  const describe = item => section==="farms" ? 'Alle '+item.interval+' Minuten · '+item.base+' · '+item.world : section==="bases" ? 'Welt: '+item.world+' · '+item.description : item.description;
  const cards = data[section].map(item=>card(item,section,describe)).join("");
  return '<div class="notice">Demo-Modus: Einträge werden derzeit in diesem Browser gespeichert. Die Minecraft-Verbindung folgt später.</div><section class="panel"><div class="panel-head"><div><p class="eyebrow-panel">VERWALTUNG</p><h2>Alle '+names[section]+'</h2></div><button id="addItem">+ '+singular[section]+' erstellen</button></div><div class="item-grid">'+(cards || '<div class="empty-card"><b>Noch keine '+names[section]+'</b>Erstelle deinen ersten Eintrag über die Schaltfläche oben.</div>')+'</div></section>';
}
function detailPage(section,id) {
  const item = data[section].find(entry=>entry.id===decodeURIComponent(id));
  if (!item) return '<section class="panel"><h2>Eintrag nicht gefunden</h2><a href="#'+section+'">Zurück zur Übersicht</a></section>';
  const singular = {farms:"Farm",bases:"Base",worlds:"Welt"}[section];
  let details = '<p class="muted">'+escapeHTML(item.description || "")+'</p>';
  if (section==="farms") {
    details = '<p class="muted">Zugeordnete Base: '+escapeHTML(item.base)+' · Welt: '+escapeHTML(item.world)+'</p><div class="detail-kpis"><div><small>Intervall</small><b>'+item.interval+' Min.</b></div><div><small>Status</small><b>'+(item.active?"Aktiv":"Pausiert")+'</b></div><div><small>Nächster Lauf</small><b>Demo</b></div></div><div class="form-row"><label class="muted">Intervall (Minuten)<input id="editInterval" type="number" min="1" value="'+item.interval+'"></label></div><button id="toggleItem" class="secondary">'+(item.active?"Farm pausieren":"Farm aktivieren")+'</button>';
  } else if (section==="bases") {
    details = '<p class="muted">'+escapeHTML(item.description)+'</p><div class="detail-kpis"><div><small>Welt</small><b>'+escapeHTML(item.world)+'</b></div><div><small>Farmen</small><b>'+data.farms.filter(f=>f.base===item.name).length+'</b></div></div>';
  } else {
    details = '<p class="muted">'+escapeHTML(item.description)+'</p><div class="detail-kpis"><div><small>Basen</small><b>'+data.bases.filter(b=>b.world===item.name).length+'</b></div><div><small>Farmen</small><b>'+data.farms.filter(f=>f.world===item.name).length+'</b></div></div>';
  }
  return '<section class="panel"><div class="panel-head"><div><p class="eyebrow-panel">'+singular.toUpperCase()+' · DETAILSEITE</p><h2>'+escapeHTML(item.name)+'</h2></div><a class="button secondary" href="#'+section+'">← Zurück</a></div>'+details+'<div class="form-row"><button id="renameItem" class="secondary">Umbenennen</button><button id="deleteItem" class="secondary">Löschen</button></div></section>';
}
function overviewPage() {
  return '<div class="notice">Vorschau-Modus: Beispieldaten. Noch keine echten Serveraktionen.</div><section class="stats"><article><small>VERWALTETE BASEN</small><strong>'+data.bases.length+'</strong><span>über '+data.worlds.length+' Welten</span></article><article><small>FARMEN GESAMT</small><strong>'+data.farms.length+'</strong><span>'+data.farms.filter(f=>f.active).length+' aktiv · '+data.farms.filter(f=>!f.active).length+' pausiert</span></article><article><small>ERTRAG HEUTE</small><strong>2.480</strong><span class="good">Items · +12,4 %</span></article><article><small>VERBRAUCH HEUTE</small><strong>640</strong><span>Items</span></article></section><section class="content-grid"><article class="panel wide"><div class="panel-head"><div><p class="eyebrow-panel">AUTOMATION</p><h2>Zuletzt angelegte Farmen</h2></div><a class="button" href="#farms">Alle Farmen</a></div><div class="item-grid">'+data.farms.slice(0,3).map(f=>card(f,"farms",x=>'Alle '+x.interval+' Min. · '+x.base)).join("")+'</div></article><article class="panel"><p class="eyebrow-panel">STRUKTUR</p><h2>Deine Basen</h2>'+data.bases.map(b=>'<p><a href="#bases/'+encodeURIComponent(b.id)+'">'+escapeHTML(b.name)+'</a> · '+escapeHTML(b.world)+'</p>').join("")+'</article><article class="panel"><p class="eyebrow-panel">WELTEN</p><h2>Verwaltete Welten</h2>'+data.worlds.map(w=>'<p><a href="#worlds/'+encodeURIComponent(w.id)+'">'+escapeHTML(w.name)+'</a></p>').join("")+'</article></section>';
}
function pluginPage() {
  return '<div class="notice">Das Plugin ist noch in der Entwicklung. Ein fertiges, getestetes JAR steht momentan noch nicht zum Download bereit.</div><section class="panel"><p class="eyebrow-panel">PAPER 26.3 · SERVER-PLUGIN</p><h2>FlohWorldControl-Plugin</h2><p class="muted">Das Plugin soll deine Farmen im Spiel verwalten und später sicher mit dieser Website verbinden.</p><div class="detail-kpis"><div><small>Version</small><b>0.1.0 · Vorschau</b></div><div><small>Status</small><b>Entwicklung</b></div><div><small>Dateityp</small><b>.jar</b></div></div><div class="form-row"><button class="secondary" disabled title="Noch kein fertiges Plugin-JAR vorhanden">Plugin herunterladen · noch nicht verfügbar</button><a class="button secondary" href="https://github.com/Flohhausen/FlohWorldControl-PluginWeb/tree/main/plugin" target="_blank" rel="noopener">Quellcode ansehen ↗</a></div><h2>Installation (sobald das JAR bereit ist)</h2><ol class="install-steps"><li>Paper-Server stoppen.</li><li>Die Datei <b>FlohWorldControl.jar</b> in den Ordner <code>plugins</code> legen.</li><li>Server starten und die Plugin-Konfiguration prüfen.</li></ol></section>';
}
function genericPage(section) {
  if (section==="storage") return '<section class="panel"><p class="eyebrow-panel">INVENTAR</p><h2>Kistensuche</h2><div class="search"><input id="itemSearch" placeholder="Item suchen, z. B. Diamant"><button id="searchButton">Suchen</button></div><p id="searchResult" class="muted">Live-Suche folgt mit Plugin-Verbindung.</p></section>';
  return '<section class="panel"><p class="eyebrow-panel">NAVIGATION</p><h2>Teleport</h2><div class="search"><input id="teleportTarget" placeholder="Spieler, Base oder Farm"><button id="teleportButton">Ziel suchen</button></div><p id="teleportResult" class="muted">Teleport wird nach Login und Verbindung aktiviert.</p></section>';
}
function addItem(section) {
  const label = {farms:"Farm",bases:"Base",worlds:"Welt"}[section];
  const name = prompt("Name der neuen "+label+":");
  if (!name || !name.trim()) return;
  const item = {id:slug(name)+"-"+Date.now().toString().slice(-4),name:name.trim()};
  if (section==="farms") Object.assign(item,{base:data.bases[0]?.name||"Hauptbase",world:data.worlds[0]?.name||"Survival",interval:10,active:true});
  else if (section==="bases") Object.assign(item,{world:data.worlds[0]?.name||"Survival",description:"Neue Base"});
  else item.description="Neue Welt";
  data[section].push(item); save(); location.hash=section+"/"+encodeURIComponent(item.id);
}
function bindPage(section,id) {
  $$("[data-open]").forEach(el=>el.addEventListener("click",()=>location.hash=el.dataset.open));
  $("#addItem")?.addEventListener("click",()=>addItem(section));
  $("#deleteItem")?.addEventListener("click",()=>{
    if(confirm("Diesen Eintrag wirklich löschen?")) {
      data[section]=data[section].filter(x=>x.id!==decodeURIComponent(id)); save(); location.hash=section;
    }
  });
  $("#renameItem")?.addEventListener("click",()=>{
    const item=data[section].find(x=>x.id===decodeURIComponent(id));
    const name=prompt("Neuer Name:",item?.name||"");
    if(name?.trim()){item.name=name.trim();save();render();}
  });
  $("#toggleItem")?.addEventListener("click",()=>{
    const item=data.farms.find(x=>x.id===decodeURIComponent(id));
    if(item){item.active=!item.active;save();render();}
  });
  $("#editInterval")?.addEventListener("change",event=>{
    const item=data.farms.find(x=>x.id===decodeURIComponent(id));
    if(item){item.interval=Math.max(1,Number(event.target.value)||1);save();}
  });
  $("#searchButton")?.addEventListener("click",()=>{
    const query=$("#itemSearch").value.trim();
    $("#searchResult").textContent=query?"Demo-Modus: keine Live-Suche nach "+query+".":"Bitte einen Itemnamen eingeben.";
  });
  $("#teleportButton")?.addEventListener("click",()=>{
    const query=$("#teleportTarget").value.trim();
    $("#teleportResult").textContent=query?"Demo-Modus: Teleport zu "+query+" ist noch nicht aktiv.":"Bitte ein Ziel eingeben.";
  });
}
function renderChart() {
  const canvas=$("#yieldChart");
  if(!canvas || typeof Chart==="undefined") return;
  new Chart(canvas,{type:"bar",data:{labels:["08:00","10:00","12:00","14:00","16:00","18:00"],datasets:[{label:"Ertrag",data:[220,380,310,520,460,590],backgroundColor:"#e8a23b",borderRadius:5},{label:"Verbrauch",data:[90,120,80,160,110,140],backgroundColor:"#538bd7",borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#aab5c3"}}},scales:{x:{grid:{display:false},ticks:{color:"#93a0b1"}},y:{grid:{color:"#263444"},ticks:{color:"#93a0b1"}}}}});
}
function render() {
  try {
    const {section,id}=getRoute();
    const current=titles[section]?section:"overview";
    const detail=Boolean(id && ["farms","bases","worlds"].includes(current));
    $("#pageTitle").textContent=detail?(data[current].find(x=>x.id===decodeURIComponent(id))?.name||"Details"):titles[current];
    $$(".main-nav a").forEach(link=>link.classList.toggle("active",link.dataset.route===current));
    updateSubnav(current,detail?id:null);
    const content=detail?detailPage(current,id):current==="overview"?overviewPage():["farms","bases","worlds"].includes(current)?listPage(current):current==="plugin"?pluginPage():current==="statistics"?'<section class="panel"><p class="eyebrow-panel">RESSOURCEN</p><h2>Ertrag & Verbrauch</h2><div class="chart-wrap"><canvas id="yieldChart"></canvas></div><p class="muted">Beispielwerte – echte Messdaten werden später vom Plugin geliefert.</p></section>':genericPage(current);
    $("#pageContent").innerHTML=content;
    bindPage(current,id);
    if(current==="statistics") renderChart();
    closeMenu();
  } catch(error) {
    console.error("FlohWorldControl konnte die Seite nicht laden:",error);
    $("#pageContent").innerHTML='<section class="panel error-panel"><h2>Seite konnte nicht geladen werden</h2><p class="muted">Bitte lade die Website neu. Technischer Fehler: '+escapeHTML(error.message)+'</p></section>';
  }
}
function init() {
  $("#menuButton").addEventListener("click",toggleMenu);
  $("#sidebarBackdrop").addEventListener("click",closeMenu);
  $$(".main-nav a").forEach(link=>link.addEventListener("click",closeMenu));
  window.addEventListener("hashchange",render);
  if(!location.hash) location.hash="#overview";
  render();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
else init();
