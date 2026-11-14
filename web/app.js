// FlohWorldControl – Dashboard-Vorschau mit Bearbeitung und Überwachungsansichten
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const demo={bases:[{id:"hauptbase",name:"Hauptbase",world:"Survival",description:"Deine Hauptzentrale"},{id:"aussenposten",name:"Außenposten",world:"Survival",description:"Farm-Außenposten"}],farms:[{id:"holzfarm",name:"Holzfarm",base:"hauptbase",interval:10,active:true,world:"Survival"},{id:"eisenfarm",name:"Eisenfarm",base:"hauptbase",interval:15,active:true,world:"Survival"},{id:"kelpfarm",name:"Kelp-Farm",base:"aussenposten",interval:10,active:false,world:"Survival"}],switches:[{id:"nordweiche",name:"Nordweiche",base:"hauptbase",status:"Bereit"},{id:"lagerweiche",name:"Lagerweiche",base:"aussenposten",status:"Bereit"}],items:[{id:"baumaterial",name:"Baumaterial",base:"hauptbase",chests:3},{id:"farmoutput",name:"Farm-Ausgabe",base:"aussenposten",chests:2}],teleports:[{id:"lager",name:"Lager",base:"hauptbase",world:"Survival",description:"Optional mit Hauptbase verknüpft"},{id:"spawn",name:"Spawn",base:null,world:"Survival",description:"Unabhängiger Teleportpunkt"}]};
let data=demo;
try{const saved=JSON.parse(localStorage.getItem("fwc-demo-data")||"null");if(saved){data={...demo,...saved};for(const k of Object.keys(demo))if(!Array.isArray(data[k]))data[k]=demo[k];for(const list of ["farms","switches","items","teleports"])data[list].forEach(x=>{if(x.base&&!data.bases.some(b=>b.id===x.base)){const m=data.bases.find(b=>b.name===x.base);x.base=m?.id||null;}});}}catch{}
const save=()=>{try{localStorage.setItem("fwc-demo-data",JSON.stringify(data));}catch{}};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=v=>v.toLowerCase().trim().replace(/[^a-z0-9äöüß]+/g,"-").replace(/^-|-$/g,"");
const titles={overview:"Übersicht",bases:"Basen",teleport:"Teleport-Infos",plugin:"Plugin"};
const route=()=>{const p=location.hash.slice(1).split("/");return{section:p[0]||"overview",id:p[1]?decodeURIComponent(p[1]):null,category:p[2]||null,entry:p[3]?decodeURIComponent(p[3]):null};};
function closeMenu(){$("#sidebar").classList.remove("open");$("#sidebarBackdrop").classList.remove("show");$("#menuButton").setAttribute("aria-expanded","false");}
function menu(){const s=$("#sidebar");if(innerWidth<=760){const o=s.classList.toggle("open");$("#sidebarBackdrop").classList.toggle("show",o);$("#menuButton").setAttribute("aria-expanded",String(o));}else{s.classList.toggle("collapsed");$(".main-area").classList.toggle("expanded");}}
function baseTree(){const el=$("#sidebarSubnav"),r=route();el.classList.add("visible");el.innerHTML='<p class="tree-heading">BASEN</p>'+data.bases.map(b=>{const active=r.id===b.id,child=(type,label,icon)=>'<a class="tree-child '+(r.category===type?'active':'')+'" href="#bases/'+encodeURIComponent(b.id)+'/'+type+'"><span>'+icon+'</span>'+label+'</a>';return '<div class="tree-base '+(active?'selected':'')+'"><a class="tree-base-link" href="#bases/'+encodeURIComponent(b.id)+'"><span class="tree-caret">'+(active?'▾':'▸')+'</span>'+esc(b.name)+'</a>'+(active?'<div class="tree-children">'+child("farms","Farmen","⚙")+child("switches","Weichen","⇄")+child("items","Item-Statistiken","⌁")+child("teleports","Teleportpunkte","⌖")+child("monitor","Überwachung","◉")+'</div>':'')+'</div>';}).join("")+(data.bases.length?"":'<p class="muted">Noch keine Basen angelegt.</p>')+'<button class="tree-add" id="treeAddBase">＋ Neue Base</button>';}
function addBase(){const name=prompt("Name der neuen Base:");if(!name?.trim())return;const id=slug(name)+"-"+Date.now().toString().slice(-4);data.bases.push({id,name:name.trim(),world:"",description:"Neue Base"});save();location.hash="bases/"+encodeURIComponent(id);}
function baseHeader(b){return '<section class="panel base-overview"><div class="panel-head"><div><p class="eyebrow-panel">BASE / '+esc(b.world||"Welt nicht gesetzt")+'</p><h2>'+esc(b.name)+'</h2><p class="muted">'+esc(b.description||"")+'</p></div><a class="button secondary" href="#bases">← Alle Basen</a></div><div class="base-counts"><div><b>'+data.farms.filter(x=>x.base===b.id).length+'</b><small>Farmen</small></div><div><b>'+data.switches.filter(x=>x.base===b.id).length+'</b><small>Weichen</small></div><div><b>'+data.items.filter(x=>x.base===b.id).length+'</b><small>Statistikgruppen</small></div><div><b>'+data.teleports.filter(x=>x.base===b.id).length+'</b><small>Teleportpunkte</small></div></div></section>';}
function basesPage(){return '<div class="notice"><b>Basis-Zentrale</b> · Öffne eine Base, um Farmen, Weichen, Item-Statistiken, Teleportpunkte und Überwachung zu bearbeiten.</div><section class="panel"><div class="panel-head"><div><p class="eyebrow-panel">WORLD STRUCTURE</p><h2>Deine Basen</h2></div><button id="addBase">＋ Base erstellen</button></div><div class="base-grid">'+data.bases.map(b=>'<a class="base-card" href="#bases/'+encodeURIComponent(b.id)+'"><span class="base-symbol">⌂</span><h3>'+esc(b.name)+'</h3><p>'+esc(b.description||"")+'</p><small>'+esc(b.world||"Welt nicht festgelegt")+'</small><b>Base öffnen ↗</b></a>').join("")+'</div></section>';}
function categoryPage(b,cat){const cfg={farms:{key:"farms",title:"Farmen",icon:"⚙",desc:x=>"Intervall: "+(x.interval??10)+" min · Impuls: "+(x.pulse??4)+" Ticks · "+(x.active?"Eingeschaltet":"Ausgeschaltet")},switches:{key:"switches",title:"Weichen",icon:"⇄",desc:x=>x.status||"Bereit"},items:{key:"items",title:"Item-Statistiken",icon:"⌁",desc:x=>(x.chests??0)+" zugeordnete Kisten"},teleports:{key:"teleports",title:"Teleportpunkte",icon:"⌖",desc:x=>(x.world||"Welt unbekannt")+" · "+(x.description||"")}};
 const q=cfg[cat];if(!q)return monitorPage(b);const items=data[q.key].filter(x=>x.base===b.id);
 return baseHeader(b)+'<section class="panel manage-panel"><div class="panel-head"><div><p class="eyebrow-panel">VERWALTUNG / '+esc(b.name)+'</p><h2>'+q.icon+' '+q.title+'</h2><p class="muted">Jeder Eintrag hat eine eigene Konfigurationsseite.</p></div><button data-open-new="'+cat+'" data-base="'+b.id+'">＋ Hinzufügen</button></div>'+(items.length?'<div class="manage-list">'+items.map(x=>'<article class="manage-row"><div class="manage-main"><b>'+esc(x.name)+'</b><small>'+esc(q.desc(x))+'</small></div><div class="manage-actions"><a class="button secondary" href="#bases/'+encodeURIComponent(b.id)+'/'+cat+'/'+encodeURIComponent(x.id)+'">Konfigurieren ↗</a><button class="danger" data-delete="'+cat+'" data-id="'+x.id+'">Löschen</button></div></article>').join("")+'</div>':'<div class="empty-state"><span>'+q.icon+'</span><b>Noch keine '+q.title.toLowerCase()+'</b><p>Lege den ersten Eintrag für diese Base an.</p></div>')+'</section>';
}
function editorPage(b,cat,id){const keys={farms:"farms",switches:"switches",teleports:"teleports",items:"items"},titles2={farms:"Farm konfigurieren",switches:"Weiche konfigurieren",teleports:"Teleportpunkt konfigurieren",items:"Item-Gruppe konfigurieren"};const key=keys[cat];if(!key)return categoryPage(b,cat);let x=id==="new"?null:data[key].find(v=>v.id===id);if(id!=="new"&&!x)return categoryPage(b,cat);const v=x||{};const field=(label,name,value,type="text",extra="")=>'<label class="editor-field"><span>'+label+'</span><input name="'+name+'" type="'+type+'" value="'+esc(value??"")+'" '+extra+'></label>';let fields=field("Name","name",v.name||"");
if(cat==="farms")fields+=field("Intervall (Minuten)","interval",v.interval??10,"number",'min="1"')+field("Impulsdauer (Ticks)","pulse",v.pulse??4,"number",'min="1"')+field("Trigger-Position (x y z)","trigger",v.trigger||"")+field("Redstone-Ausgang (x y z)","output",v.output||"")+'<label class="editor-toggle"><input type="checkbox" name="active" '+(v.active!==false?"checked":"")+'> Farm eingeschaltet</label><p class="editor-help">Intervall und Impuls werden gespeichert. Die echte Redstone-Steuerung funktioniert erst mit dem verbundenen Plugin.</p>';
if(cat==="switches")fields+=field("Status / Beschreibung","status",v.status||"Bereit")+field("Kompassname","compassName",v.compassName||"")+field("Position (x y z)","position",v.position||"")+'<label class="editor-toggle"><input type="checkbox" name="enabled" '+(v.enabled!==false?"checked":"")+'> Weiche aktiviert</label>';
if(cat==="teleports")fields+=field("Welt","world",v.world||"Survival")+field("Beschreibung","description",v.description||"")+field("Position (x y z)","position",v.position||"");
if(cat==="items")fields+=field("Zugeordnete Kisten (Vorschau)","chests",v.chests??0,"number",'min="0"');
return baseHeader(b)+'<section class="panel editor-panel"><a class="back-link" href="#bases/'+encodeURIComponent(b.id)+'/'+cat+'">← Zurück zur Übersicht</a><p class="eyebrow-panel">EINSTELLUNGEN / '+esc(b.name)+'</p><h2>'+titles2[cat]+'</h2><form id="entryEditor" data-cat="'+cat+'" data-id="'+esc(id||"new")+'" data-base="'+esc(b.id)+'"><div class="editor-grid">'+fields+'</div><div class="editor-actions"><button type="submit">Änderungen speichern</button><a class="button secondary" href="#bases/'+encodeURIComponent(b.id)+'/'+cat+'">Abbrechen</a></div></form></section>';
}
function monitorPage(b){const farms=data.farms.filter(x=>x.base===b.id),switches=data.switches.filter(x=>x.base===b.id),tps=data.teleports.filter(x=>x.base===b.id);return baseHeader(b)+'<div class="notice"><b>Überwachungsvorschau:</b> Diese Anzeigen zeigen derzeit gespeicherte Demo-/Konfigurationswerte. Live-Status, Redstone-Signale, Kisteninhalte und Laufzeiten erscheinen erst nach Verbindung mit dem Minecraft-Plugin.</div><section class="panel"><p class="eyebrow-panel">BASE MONITOR</p><h2>Überwachung · '+esc(b.name)+'</h2><div class="monitor-grid"><article><small>FARMEN AKTIV</small><strong>'+farms.filter(x=>x.active).length+' / '+farms.length+'</strong><span>Konfigurierter Status</span></article><article><small>WEICHEN</small><strong>'+switches.length+'</strong><span>Registrierte Weichen</span></article><article><small>TELEPORTPUNKTE</small><strong>'+tps.length+'</strong><span>Dieser Base zugeordnet</span></article><article><small>ITEM-GRUPPEN</small><strong>'+data.items.filter(x=>x.base===b.id).length+'</strong><span>Keine Live-Inventardaten</span></article></div><h3 class="subheading">Farmstatus</h3><div class="mini-list">'+(farms.map(x=>'<div class="mini-row"><span>'+esc(x.name)+'</span><small><i class="status-dot '+(x.active?'online':'offline')+'"></i>'+(x.active?'Aktiviert':'Deaktiviert')+' · '+(x.interval||"—")+' min Intervall</small></div>').join("")||'<div class="empty-inline">Keine Farmen angelegt.</div>')+'</div><h3 class="subheading">Weichenstatus</h3><div class="mini-list">'+(switches.map(x=>'<div class="mini-row"><span>'+esc(x.name)+'</span><small>'+esc(x.status||"Noch kein Live-Status")+'</small></div>').join("")||'<div class="empty-inline">Keine Weichen angelegt.</div>')+'</div></section>';}
function baseDetail(id,cat){const r=route();const b=data.bases.find(x=>x.id===id);if(!b)return '<section class="panel"><h2>Base nicht gefunden</h2><a href="#bases">Zurück</a></section>';if(cat&&r.entry)return editorPage(b,cat,r.entry);if(cat)return categoryPage(b,cat);return baseHeader(b)+'<div class="base-shortcuts">'+[['farms','⚙','Farmen'],['switches','⇄','Weichen'],['items','⌁','Item-Statistiken'],['teleports','⌖','Teleportpunkte'],['monitor','◉','Überwachung']].map(([k,i,n])=>'<a class="feature-card" href="#bases/'+encodeURIComponent(id)+'/'+k+'"><span class="feature-icon">'+i+'</span><span><b>'+n+'</b><small>Verwalten und überwachen</small></span><i>↗</i></a>').join("")+'</div>';}
function overview(){return '<section class="hero"><div class="hero-copy"><span class="hero-tag"><i></i> WORLD CONTROL SYSTEM</span><h2>Deine Welt.<br><em>Deine Kontrolle.</em></h2><p>Alle deine Minecraft-Basen und ihre zugehörigen Systeme übersichtlich an einem Ort.</p><a class="button" href="#bases">Basen öffnen <b>↗</b></a></div><div class="hero-orbit"><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="core">F<span>W</span></div><div class="orbit-dot dot-a"></div><div class="orbit-dot dot-b"></div><div class="orbit-dot dot-c"></div></div></section><div class="notice"><b>Vorschau:</b> Das Dashboard ist noch nicht mit dem Minecraft-Server verbunden. Angezeigte Einträge sind lokale Demodaten.</div><section class="stats"><article><small>VERWALTETE BASEN</small><strong>'+data.bases.length+'</strong><span>Lokale Vorschau</span></article><article><small>FARMEN</small><strong>'+data.farms.length+'</strong><span>In den Basen</span></article><article><small>WEICHEN</small><strong>'+data.switches.length+'</strong><span>In den Basen</span></article><article><small>STATISTIKGRUPPEN</small><strong>'+data.items.length+'</strong><span>Keine erfundenen Bestände</span></article></section><section class="panel"><div class="panel-head"><h2>Basen im Überblick</h2><a class="button secondary" href="#bases">Alle Basen ↗</a></div><div class="base-grid">'+data.bases.map(b=>'<a class="base-card" href="#bases/'+encodeURIComponent(b.id)+'"><span class="base-symbol">⌂</span><h3>'+esc(b.name)+'</h3><p>'+esc(b.description||"")+'</p><b>Öffnen ↗</b></a>').join("")+'</div></section>';}
function teleportPage(){const unlinked=data.teleports.filter(t=>!t.base);return '<div class="notice"><b>Teleportpunkte sind unabhängig.</b> Du kannst sie optional einer Base zuordnen und dort bearbeiten und überwachen.</div><section class="panel"><p class="eyebrow-panel">TELEPORT SYSTEM</p><h2>Teleport-Infos</h2><div class="command-list"><div><code>/Floh tp punkt &lt;name&gt;</code><p>Speichert deine aktuelle Position, Welt und Blickrichtung.</p></div><div><code>/Floh tp block &lt;name&gt;</code><p>Gibt einen vorbereiteten Commandblock für den gespeicherten Punkt.</p></div><div><code>/Floh tp punkt list</code><p>Zeigt gespeicherte Teleportpunkte.</p></div><div><code>/Floh tp punkt delete &lt;name&gt;</code><p>Löscht einen Teleportpunkt.</p></div></div><div class="panel-head" style="margin-top:22px"><h3>Unabhängige Teleportpunkte</h3><button id="addGlobalTp">＋ Teleportpunkt</button></div><div class="manage-list">'+(unlinked.map(t=>'<article class="manage-row"><div class="manage-main"><b>'+esc(t.name)+'</b><small>'+esc(t.world||"Welt unbekannt")+' · Nicht zugeordnet</small></div><div class="manage-actions"><button class="secondary" data-edit="teleports" data-id="'+t.id+'">Bearbeiten</button><button class="danger" data-delete="teleports" data-id="'+t.id+'">Löschen</button></div></article>').join("")||'<div class="empty-inline">Keine unabhängigen Teleportpunkte.</div>')+'</div></section>';}
function pluginPage(){return '<div class="notice"><b>Noch kein fertiges JAR.</b> Das Plugin wird erst nach vollständiger Implementierung gebaut und getestet.</div><section class="panel"><p class="eyebrow-panel">PAPER SERVER PLUGIN</p><h2>FlohWorldControl</h2><p class="muted">Das Plugin verbindet deine Minecraft-Welt später sicher mit diesem Dashboard.</p><div class="detail-kpis"><div><small>Server</small><b>Paper 26.3</b></div><div><small>Status</small><b>In Entwicklung</b></div><div><small>Download</small><b>Noch nicht bereit</b></div></div><div class="form-row"><button disabled>JAR noch nicht verfügbar</button><a class="button secondary" href="https://github.com/Flohhausen/FlohWorldControl-PluginWeb" target="_blank" rel="noopener">Quellcode ansehen ↗</a></div></section>';}
function editEntry(cat,id,base){const key={farms:"farms",switches:"switches",teleports:"teleports",items:"items"}[cat];if(!key)return;let x=id?data[key].find(v=>v.id===id):null;const name=prompt("Name:",x?.name||"");if(!name?.trim())return;if(!x){x={id:slug(name)+"-"+Date.now().toString().slice(-4),base:base??null};data[key].push(x);}x.name=name.trim();if(cat==="farms"){const n=Number(prompt("Intervall in Minuten:",x.interval??10));if(Number.isFinite(n)&&n>0)x.interval=n;x.active=confirm("Farm aktivieren? OK = aktiv, Abbrechen = pausiert");}if(cat==="switches"){x.status=prompt("Anzeigestatus:",x.status||"Bereit")||"Bereit";}if(cat==="teleports"){x.world=prompt("Welt:",x.world||"Survival")||"Survival";x.description=prompt("Beschreibung:",x.description||"")||"";if(base===null||base===undefined){const choices=["Keine Zuordnung",...data.bases.map(b=>b.name)];const answer=prompt("Base-Zuordnung (Name) oder leer für unabhängig:\n"+choices.join("\n"),x.base?data.bases.find(b=>b.id===x.base)?.name:"");x.base=data.bases.find(b=>b.name.toLowerCase()===answer?.toLowerCase())?.id||null;}}if(cat==="items"){const n=Number(prompt("Zugeordnete Kisten (Vorschau):",x.chests??0));if(Number.isFinite(n)&&n>=0)x.chests=n;}save();render();}
function deleteEntry(cat,id){const key={farms:"farms",switches:"switches",teleports:"teleports",items:"items"}[cat];const x=data[key]?.find(v=>v.id===id);if(!x||!confirm('"'+x.name+'" wirklich löschen?'))return;data[key]=data[key].filter(v=>v.id!==id);save();render();}
function saveEditor(form){const cat=form.dataset.cat,base=form.dataset.base,id=form.dataset.id,key={farms:"farms",switches:"switches",teleports:"teleports",items:"items"}[cat];if(!key)return;const fd=new FormData(form);const name=String(fd.get("name")||"").trim();if(!name){alert("Bitte einen Namen eingeben.");return;}let x=id==="new"?null:data[key].find(v=>v.id===id);if(!x){x={id:slug(name)+"-"+Date.now().toString().slice(-4),base};data[key].push(x);}x.name=name;x.base=base;if(cat==="farms"){x.interval=Math.max(1,Number(fd.get("interval"))||10);x.pulse=Math.max(1,Number(fd.get("pulse"))||4);x.trigger=String(fd.get("trigger")||"").trim();x.output=String(fd.get("output")||"").trim();x.active=fd.has("active");}if(cat==="switches"){x.status=String(fd.get("status")||"Bereit");x.compassName=String(fd.get("compassName")||"");x.position=String(fd.get("position")||"");x.enabled=fd.has("enabled");}if(cat==="teleports"){x.world=String(fd.get("world")||"Survival");x.description=String(fd.get("description")||"");x.position=String(fd.get("position")||"");}if(cat==="items")x.chests=Math.max(0,Number(fd.get("chests"))||0);save();location.hash="bases/"+encodeURIComponent(base)+"/"+cat;}
function bind(){ $("#addBase")?.addEventListener("click",addBase);$("#treeAddBase")?.addEventListener("click",addBase);$("[data-open-new]").forEach(b=>b.addEventListener("click",()=>{location.hash="bases/"+encodeURIComponent(b.dataset.base)+"/"+b.dataset.openNew+"/new";}));$("#entryEditor")?.addEventListener("submit",e=>{e.preventDefault();saveEditor(e.currentTarget);});$$("[data-edit]").forEach(b=>b.addEventListener("click",()=>editEntry(b.dataset.edit,b.dataset.id)));$$("[data-delete]").forEach(b=>b.addEventListener("click",()=>deleteEntry(b.dataset.delete,b.dataset.id)));$("#addGlobalTp")?.addEventListener("click",()=>editEntry("teleports",null,null));}
function render(){const r=route(),section=titles[r.section]?r.section:"overview";$("#pageTitle").textContent=section==="bases"&&r.id?(data.bases.find(b=>b.id===r.id)?.name||"Base"):titles[section];$$(".main-nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===section));baseTree();const html=section==="overview"?overview():section==="bases"?(r.id?baseDetail(r.id,r.category):basesPage()):section==="teleport"?teleportPage():pluginPage();const host=$("#pageContent");host.classList.remove("page-enter");host.innerHTML=html;if(section==="overview"){host.insertAdjacentHTML("afterbegin",cloudPanelHtml());bindCloudPanel();refreshCloudStatus();}requestAnimationFrame(()=>host.classList.add("page-enter"));bind();closeMenu();}
function init(){$("#menuButton").addEventListener("click",menu);$("#sidebarBackdrop").addEventListener("click",closeMenu);$$(".main-nav a").forEach(a=>a.addEventListener("click",closeMenu));addEventListener("hashchange",render);if(!location.hash)location.hash="#overview";render();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();


// PWA-Installation: Android/Chromium direkt, iOS mit Safari-Anleitung.
let pendingInstallPrompt=null;
function setupPwaInstall(){
  const button=document.querySelector("#installButton");
  if(!button)return;
  const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  if(isStandalone){button.hidden=true;return;}
  if(isIos){
    button.hidden=false;
    button.textContent="＋ Zum Home-Bildschirm";
    button.addEventListener("click",()=>{
      alert("FlohWorldControl installieren:\n\n1. Öffne diese Website in Safari.\n2. Tippe unten auf „Teilen“ (Quadrat mit Pfeil).\n3. Wähle „Zum Home-Bildschirm“.\n4. Tippe auf „Hinzufügen“.\n\nFalls die Option fehlt, scrolle im Teilen-Menü nach unten.");
    });
    return;
  }
  window.addEventListener("beforeinstallprompt",event=>{
    event.preventDefault();
    pendingInstallPrompt=event;
    button.hidden=false;
  });
  window.addEventListener("appinstalled",()=>{
    pendingInstallPrompt=null;
    button.hidden=true;
    button.textContent="App installiert";
  });
  button.addEventListener("click",async()=>{
    if(!pendingInstallPrompt){
      alert("Wenn keine Installationsmeldung erscheint, öffne das Browser-Menü und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.");
      return;
    }
    pendingInstallPrompt.prompt();
    await pendingInstallPrompt.userChoice;
    pendingInstallPrompt=null;
    button.hidden=true;
  });
}
if("serviceWorker" in navigator && location.protocol!=="file:"){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(error=>console.warn("PWA-Offlinecache konnte nicht gestartet werden:",error)));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupPwaInstall);else setupPwaInstall();


function cloudPanelHtml(){
  return '<section class="panel cloud-panel"><div class="panel-head"><div><p class="eyebrow-panel">LIVE SERVER LINK</p><h2>Server-Verbindung</h2></div><span id="cloudState" class="cloud-state">Nicht verbunden</span></div><p id="cloudDetails" class="muted">Verbinde das Dashboard mit deinem Paper-Server, um echte Statusdaten zu sehen.</p><div class="cloud-actions"><button id="cloudConnect">Zugangsschlüssel eingeben</button><button id="cloudRefresh" class="secondary">Aktualisieren</button><button id="cloudDisconnect" class="secondary">Trennen</button></div><div id="cloudStats" class="cloud-stats"></div></section>';
}
function bindCloudPanel(){
  document.querySelector("#cloudConnect")?.addEventListener("click",()=>{
    const token=prompt("Dashboard-Zugangsschlüssel (ADMIN_TOKEN) eingeben:");
    if(!token)return;
    sessionStorage.setItem("fwc-admin-token",token.trim());
    refreshCloudStatus();
  });
  document.querySelector("#cloudRefresh")?.addEventListener("click",refreshCloudStatus);
  document.querySelector("#cloudDisconnect")?.addEventListener("click",()=>{
    sessionStorage.removeItem("fwc-admin-token");
    const state=document.querySelector("#cloudState");
    if(state)state.textContent="Getrennt";
    const details=document.querySelector("#cloudDetails");
    if(details)details.textContent="Der Zugangsschlüssel wurde aus dieser Browser-Sitzung entfernt.";
    const stats=document.querySelector("#cloudStats");if(stats)stats.replaceChildren();
  });
}
async function refreshCloudStatus(){
  const token=sessionStorage.getItem("fwc-admin-token");
  const state=document.querySelector("#cloudState");
  const details=document.querySelector("#cloudDetails");
  const stats=document.querySelector("#cloudStats");
  if(!state||!details||!stats)return;
  if(!token){state.textContent="Nicht verbunden";details.textContent="Gib deinen ADMIN_TOKEN ein. Der Schlüssel bleibt nur in dieser Browser-Sitzung.";return;}
  state.textContent="Verbinde …";
  try{
    const response=await fetch("/api/state",{headers:{Authorization:"Bearer "+token},cache:"no-store"});
    if(response.status===401)throw new Error("Zugangsschlüssel ungültig.");
    if(!response.ok)throw new Error("Cloud-API antwortet mit HTTP "+response.status+".");
    const result=await response.json();
    if(!result.connected||!result.snapshot){state.textContent="Warte auf Server";details.textContent="Cloudflare ist erreichbar, aber der Minecraft-Server hat noch keinen Status gesendet.";stats.replaceChildren();return;}
    const snap=result.snapshot,server=snap.server||{};
    const age=Math.max(0,Math.floor((Date.now()-(snap.timestamp||result.updatedAt||Date.now()))/1000));
    state.textContent=age<90?"Server online":"Letzter Kontakt vor "+Math.floor(age/60)+" min";
    details.textContent=(server.name||"Minecraft-Server")+" · "+(server.version||"Version unbekannt")+" · "+(server.online??0)+"/"+(server.maxPlayers??"?")+" Spieler online";
    stats.innerHTML='<div><small>SPIELER ONLINE</small><b>'+Number(server.online||0)+'</b></div><div><small>FARMEN</small><b>'+(Array.isArray(snap.farms)?snap.farms.length:0)+'</b></div><div><small>WELTEN</small><b>'+Number(snap.worlds||0)+'</b></div>';
  }catch(error){
    state.textContent="Verbindung fehlgeschlagen";
    details.textContent=error.message;
    stats.replaceChildren();
  }
}
