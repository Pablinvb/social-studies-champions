];
SEED.forEach(function(q,i){ q.id="s"+i; });

/* ============================ utilities ============================ */
function lsGet(k,d){ try{var v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch(e){return d;} }
function lsSet(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
function lsDel(k){ try{localStorage.removeItem(k);}catch(e){} }
function uid(p){ return (p||"c")+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function shuffle(a){ var r=a.slice(); for(var i=r.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=r[i];r[i]=r[j];r[j]=t;} return r; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function catOf(id){ return CAT_BY_ID[id]||CATS[0]; }
function catVars(id){ return {"--cc":"var(--c-"+id+")"}; }
function levelName(id){ for(var i=0;i<LEVELS.length;i++){ if(LEVELS[i].id===id) return LEVELS[i].name; } return LEVELS[0].name; }

/* ============================ audio ============================ */
/* Music comes from real files dropped into audio/ — see the README. Anything missing just
   stays silent. The short cues are still synthesised so the game never waits on a download. */
var MUSIC_FILES={ menu:"audio/menu.mp3", board:"audio/board.mp3", quiz:"audio/question.mp3", victory:"audio/victory.mp3" };
/* a missing track borrows another: the play track covers the questions, the intro covers the rest */
var MUSIC_FALLBACK={ board:"menu", quiz:"board", victory:"menu" };
var A={ ctx:null, master:null, sfxOn:true, musicOn:true, vol:0.75, noise:null,
        players:{}, track:null, want:null, unlocked:false, preloaded:false };
function audioInit(){
  if(A.ctx!==null) return A.ctx;
  try{ A.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ A.ctx=false; return null; }
  A.master=A.ctx.createGain(); A.master.gain.value=A.vol; A.master.connect(A.ctx.destination);
  var len=A.ctx.sampleRate*0.5, buf=A.ctx.createBuffer(1,len,A.ctx.sampleRate), d=buf.getChannelData(0);
  for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
  A.noise=buf;
  return A.ctx;
}
function player(name){
  if(A.players[name]!==undefined) return A.players[name];
  var src=MUSIC_FILES[name]; if(!src){ A.players[name]=null; return null; }
  var el=new Audio(src);
  el.loop=(name!=="victory"); el.preload="auto"; el.volume=0;
  el.addEventListener("error",function(){
    A.players[name]=null;                       /* file is not there: fall back and keep playing */
    if(A.track===name){ A.track=null; if(A.want) musicStart(A.want); }
  });
  A.players[name]=el;
  return el;
}
function fade(el,to,ms){
  if(!el) return;
  var from=el.volume, t0=performance.now();
  (function step(){
    var p=Math.min(1,(performance.now()-t0)/ms);
    try{ el.volume=clamp(from+(to-from)*p,0,1); }catch(e){}
    if(p<1) requestAnimationFrame(step);
    else if(to===0){ try{ el.pause(); }catch(e){} }
  })();
}
function musicStart(name){
  A.want=name;
  /* start fetching the moment a screen asks for a track, even before sound is unlocked,
     so the first note is not waiting on the download */
  if(!A.unlocked||!A.musicOn){ if(A.musicOn) preloadTrack(name); return; }
  var key=name;
  if(!player(key)) key=MUSIC_FALLBACK[name]||null;
  if(key&&!player(key)) key=null;
  if(A.track===key) return;
  if(A.track&&A.players[A.track]) fade(A.players[A.track],0,300);
  A.track=key;
  if(!key) return;
  var el=player(key);
  try{ if(!el.loop) el.currentTime=0; var p=el.play(); if(p&&p.catch) p.catch(function(){}); }catch(e){}
  fade(el,A.vol*0.55,260);
}
function musicStop(){
  if(A.track&&A.players[A.track]) fade(A.players[A.track],0,400);
  A.track=null; A.want=null;
}
/* Fetch every track as soon as sound is unlocked. Switching mid-match then costs nothing,
   and a file that is not there reports its error long before anything asks for it. */
function preloadTrack(name){
  var el=player(name);
  if(!el) return;
  /* creating the element already starts the fetch; load() would abort and restart it */
  if(el.readyState===0&&el.networkState!==2){ try{ el.load(); }catch(e){} }
}
function preloadAll(){
  if(A.preloaded) return;
  A.preloaded=true;
  if(A.want) preloadTrack(A.want);          /* whatever is playing gets the bandwidth first */
  setTimeout(function(){
    Object.keys(MUSIC_FILES).forEach(function(n){ if(n!==A.want) preloadTrack(n); });
  },1500);
}
function audioResume(){
  audioInit();
  if(A.ctx&&A.ctx.state==="suspended"){ try{ A.ctx.resume(); }catch(e){} }
  if(!A.unlocked){
    A.unlocked=true;
    if(A.want) musicStart(A.want);
    preloadAll();
  }
}
function applyAudio(st){
  A.sfxOn=st.sfx; A.musicOn=st.music; A.vol=st.vol;
  if(A.master&&A.ctx) A.master.gain.setTargetAtTime(A.vol,A.ctx.currentTime,0.05);
  if(!A.musicOn){ if(A.track&&A.players[A.track]) fade(A.players[A.track],0,300); A.track=null; }
  else if(A.want) musicStart(A.want);
  else if(A.track&&A.players[A.track]) fade(A.players[A.track],A.vol*0.55,300);
}
function voice(type,f1,f2,t0,dur,peak,cutoff){
  var c=A.ctx; if(!c) return;
  var o=c.createOscillator(), g=c.createGain(), node=o;
  o.type=type; o.frequency.setValueAtTime(f1,t0);
  if(f2&&f2!==f1) o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  if(cutoff){ var f=c.createBiquadFilter(); f.type="lowpass"; f.frequency.setValueAtTime(cutoff,t0); o.connect(f); node=f; }
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  node.connect(g); g.connect(A.master);
  o.start(t0); o.stop(t0+dur+0.04);
}
function hiss(t0,dur,peak,hp){
  var c=A.ctx; if(!c||!A.noise) return;
  var s=c.createBufferSource(); s.buffer=A.noise;
  var f=c.createBiquadFilter(); f.type="highpass"; f.frequency.value=hp||5000;
  var g=c.createGain();
  g.gain.setValueAtTime(peak,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  s.connect(f); f.connect(g); g.connect(A.master);
  s.start(t0); s.stop(t0+dur+0.02);
}
function sfx(name){
  if(!A.sfxOn) return; var c=audioInit(); if(!c) return;
  var t=c.currentTime;
  if(name==="click")      voice("sine",680,920,t,0.07,0.06,4000);
  else if(name==="tick")  voice("sine",1500,1500,t,0.04,0.05);
  else if(name==="land"){ voice("sine",700,1050,t,0.14,0.12,6000); hiss(t,0.09,0.05,4000); }
  else if(name==="good"){ [784,988,1319].forEach(function(f,i){ voice("sine",f,f,t+i*0.065,0.26,0.1,6000); }); }
  else if(name==="bad"){  voice("sine",330,180,t,0.3,0.09,1400); }
  else if(name==="riser"){ for(var i=0;i<18;i++) hiss(t+i*0.26,0.22,0.018+i*0.001,1200+i*260); }
  else if(name==="unlock"){ [659,880,1175,1568].forEach(function(f,i){ voice("sine",f,f,t+i*0.085,0.4,0.1,8000); }); }
  else if(name==="crown"){ [880,1175,1568,2093].forEach(function(f,i){ voice("sine",f,f,t+i*0.07,0.45,0.1,9000); }); }
  else if(name==="win"){ [523,659,784,1047,1319].forEach(function(f,i){ voice("sine",f,f,t+i*0.14,0.5,0.1,8000); }); }
}

/* ---- confetti ---- */
var confettiStop=0, confettiRunning=false;
function confetti(ms){
  var cv=document.getElementById("confetti"); if(!cv) return;
  if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  cv.hidden=false;
  var ctx=cv.getContext("2d"), parts=[];
  function size(){ cv.width=window.innerWidth; cv.height=window.innerHeight; }
  size();
  var cols=["#ffc83d","#2d9cdb","#27ae60","#eb5ba8","#9b51e0","#ffffff"];
  for(var i=0;i<170;i++) parts.push({
    x:Math.random()*cv.width, y:-20-Math.random()*cv.height*0.6,
    w:5+Math.random()*8, h:7+Math.random()*10,
    vy:2.4+Math.random()*3.6, vx:-1.6+Math.random()*3.2,
    r:Math.random()*Math.PI, vr:-0.16+Math.random()*0.32,
    c:cols[(Math.random()*cols.length)|0]
  });
  confettiStop=Date.now()+(ms||4200);
  if(confettiRunning) return;
  confettiRunning=true;
  (function frame(){
    ctx.clearRect(0,0,cv.width,cv.height);
    for(var i=0;i<parts.length;i++){
      var p=parts[i]; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr;
      if(p.y>cv.height+30){ p.y=-20; p.x=Math.random()*cv.width; }
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle=p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    }
    if(Date.now()<confettiStop) requestAnimationFrame(frame);
    else { ctx.clearRect(0,0,cv.width,cv.height); cv.hidden=true; confettiRunning=false; }
  })();
  window.addEventListener("resize",size);
}

/* ---- starfield ---- */
function Stars(){
  var ref=useRef(null);
  useEffect(function(){
    var cv=ref.current; if(!cv) return;
    var ctx=cv.getContext("2d"), stars=[], raf=0,
        reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function build(){
      cv.width=window.innerWidth; cv.height=window.innerHeight; stars=[];
      var n=Math.min(170,Math.round(cv.width*cv.height/12000));
      for(var i=0;i<n;i++) stars.push({x:Math.random()*cv.width,y:Math.random()*cv.height,
        r:Math.random()*1.6+0.3,p:Math.random()*6.28,s:0.01+Math.random()*0.026});
    }
    build();
    function frame(){
      ctx.clearRect(0,0,cv.width,cv.height);
      for(var i=0;i<stars.length;i++){
        var s=stars[i]; s.p+=s.s;
        ctx.globalAlpha=0.25+Math.abs(Math.sin(s.p))*0.65;
        ctx.fillStyle=i%8===0?"#ffd97a":"#ffffff";
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.283); ctx.fill();
      }
      ctx.globalAlpha=1;
      if(!reduce) raf=requestAnimationFrame(frame);
    }
    frame();
    window.addEventListener("resize",build);
    return function(){ cancelAnimationFrame(raf); window.removeEventListener("resize",build); };
  },[]);
  return html`<canvas id="stars" ref=${ref} aria-hidden="true"></canvas>`;
}

/* ============================ bank helpers ============================ */
function defaultBank(){ return clone(SEED); }
function loadBank(){
  var b=lsGet("ssc.bank",null);
  if(!b||!b.length) return defaultBank();
  var ok=b.filter(function(q){ return q&&typeof q.q==="string"&&q.o&&q.o.length===4&&CAT_BY_ID[q.cat]&&q.cat!=="crown"; });
  return ok.length?ok:defaultBank();
}
function poolFor(bank,s){
  var max=LEVEL_ORDER[s.level]; if(max===undefined) max=5;
  return bank.filter(function(q){
    var set=q.set||"general";
    if(s.set!=="all"&&set!==s.set) return false;
    if(set==="general"&&(LEVEL_ORDER[q.lvl]===undefined||LEVEL_ORDER[q.lvl]>max)) return false;
    if(s.difficulty!=="mixed"&&q.dif!==s.difficulty) return false;
    return true;
  });
}
var CSV_HEAD=["id","set","ref","topic","category","level","difficulty","question","a","b","c","d","answer","explanation"];
function csvCell(v){ v=(v==null?"":String(v)); return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
function toCSV(bank){
  var rows=[CSV_HEAD.join(",")];
  bank.forEach(function(q){
    rows.push([q.id,q.set||"general",q.ref||"",q.topic||"",q.cat,q.lvl,q.dif,q.q,
      q.o[0],q.o[1],q.o[2],q.o[3],"ABCD".charAt(q.a),q.e].map(csvCell).join(","));
  });
  return rows.join("\n");
}
function parseCSV(text){
  var rows=[],row=[],cur="",q=false,i=0;
  text=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
  for(;i<text.length;i++){
    var ch=text[i];
    if(q){ if(ch==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=ch; }
    else if(ch==='"'){ q=true; }
    else if(ch===","){ row.push(cur); cur=""; }
    else if(ch==="\n"){ row.push(cur); rows.push(row); row=[]; cur=""; }
    else cur+=ch;
  }
  if(cur!==""||row.length){ row.push(cur); rows.push(row); }
  return rows.filter(function(r){ return r.length>1||r[0]!==""; });
}
function normalize(o){
  if(!o) return null;
  var cat=String(o.cat||o.category||"").toLowerCase().trim();
  if(!CAT_BY_ID[cat]||cat==="crown") return null;
  var opts=o.o&&o.o.length?o.o:[o.a,o.b,o.c,o.d];
  opts=(opts||[]).map(function(x){ return String(x==null?"":x).trim(); });
  if(opts.length!==4||!opts.every(function(x){return x;})) return null;
  var a=o.answer; if(a===undefined||a===null||a===""){ a=o.a; }
  if(typeof a==="string"){ var l=a.trim().toUpperCase().charAt(0);
    a="ABCD".indexOf(l)>=0?"ABCD".indexOf(l):parseInt(a,10); }
  a=parseInt(a,10); if(isNaN(a)||a<0||a>3) return null;
  var text=String(o.q||o.question||"").trim(); if(!text) return null;
  var lvl=String(o.lvl||o.level||"8").trim().toUpperCase().replace("º","");
  if(LEVEL_ORDER[lvl]===undefined) lvl="8";
  var dif=String(o.dif||o.difficulty||"medium").toLowerCase().trim();
  if(DIFFS.indexOf(dif)<0) dif="medium";
  var set=String(o.set||"custom").toLowerCase().trim();
  if(!SET_BY_ID[set]) set="custom";
  return {id:o.id||uid(),set:set,ref:o.ref||"",topic:o.topic||"",cat:cat,lvl:lvl,dif:dif,
    q:text,o:opts,a:a,e:String(o.e||o.explanation||"").trim()};
}
function parseImport(text){
  text=(text||"").trim(); if(!text) return [];
  var out=[];
  if(text.charAt(0)==="["||text.charAt(0)==="{"){
    var data=JSON.parse(text);
    if(!Array.isArray(data)) data=data.questions||data.bank||[data];
    data.forEach(function(o){ var n=normalize(o); if(n) out.push(n); });
  } else {
    var rows=parseCSV(text); if(rows.length<2) return [];
    var head=rows[0].map(function(h){ return String(h).trim().toLowerCase(); });
    for(var i=1;i<rows.length;i++){
      var obj={}; head.forEach(function(h,j){ obj[h]=rows[i][j]; });
      var n=normalize(obj); if(n) out.push(n);
    }
  }
  return out;
}

/* ============================ small components ============================ */
function Seg(props){
  return html`<div class="seg" role="group">${props.items.map(function(it){
    return html`<button key=${String(it.v)} type="button" aria-pressed=${String(props.value===it.v)}
      onClick=${function(){ sfx("click"); props.onChange(it.v); }}>${it.l}</button>`;
  })}</div>`;
}
function Tile(props){
  var c=catOf(props.cat);
  var cls="ctile"+(props.dim?" dim":"")+(props.on?" on":"")+(props.cls?" "+props.cls:"");
  return html`<div class=${cls} style=${Object.assign(catVars(props.cat),props.style||{})}>
    <img src=${c.img} alt=${c.name} draggable="false"/></div>`;
}
function llName(id){ return T["ll"+id.charAt(0).toUpperCase()+id.slice(1)]||id; }
function llHint(id){ return T["ll"+id.charAt(0).toUpperCase()+id.slice(1)+"Hint"]||""; }
function freshLifelines(){ var o={}; LIFELINES.forEach(function(l){ o[l.id]=true; }); return o; }
function LLIcon(props){
  var sz=props.size||18;
  if(props.id==="tablet") return html`<svg viewBox="0 0 24 24" width=${sz} height=${sz} fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <rect x="5" y="2.5" width="14" height="19" rx="2.5"/><line x1="10.5" y1="18.5" x2="13.5" y2="18.5"/></svg>`;
  return html`<svg viewBox="0 0 24 24" width=${sz} height=${sz} fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c0-3.4 2.8-6.2 6.2-6.2S15.2 16.6 15.2 20"/>
    <circle cx="17.6" cy="9.8" r="2.3"/><path d="M15.9 14.9c2.9.2 5.3 2.6 5.3 5.1"/></svg>`;
}
function Toast(props){
  useEffect(function(){ var t=setTimeout(props.onDone,2500); return function(){clearTimeout(t);}; },[]);
  return html`<div class="toast">${props.msg}</div>`;
}

/* ============================ wheel ============================ */
var SEG=360/WHEEL.length;
function Wheel(props){
  var r=96, cx=100, cy=100;
  function pt(deg,rad){ var a=(deg-90)*Math.PI/180; return [cx+rad*Math.cos(a), cy+rad*Math.sin(a)]; }
  var sectors=WHEEL.map(function(c,i){
    var a1=i*SEG, a2=a1+SEG;
    var p1=pt(a1,r), p2=pt(a2,r), mid=pt(a1+SEG/2,60);
    return html`<g key=${c.id}>
      <path d=${"M"+cx+","+cy+" L"+p1[0].toFixed(2)+","+p1[1].toFixed(2)+" A"+r+","+r+" 0 0 1 "+p2[0].toFixed(2)+","+p2[1].toFixed(2)+" Z"}
        fill=${"var(--c-"+c.id+")"} stroke="rgba(255,255,255,.9)" stroke-width="1.4"/>
      <image href=${c.img} x=${(mid[0]-25).toFixed(2)} y=${(mid[1]-25).toFixed(2)}
        width="50" height="50" preserveAspectRatio="xMidYMid meet"/>
    </g>`;
  });
  return html`<div class="wheel-stage">
    <div class="wheel-glow"></div>
    <div class=${"pointer"+(props.landed?" hit":"")}></div>
    <div class=${"wheel-rotor"+(props.spinning?" spin":"")} style=${{transform:"rotate("+props.rot+"deg)"}}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
        <circle cx="100" cy="100" r="99" fill="rgba(255,255,255,.95)"/>
        ${sectors}
        <circle cx="100" cy="100" r="96.5" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="5"/>
      </svg>
    </div>
    <button class="spin-hub" onClick=${props.onSpin} disabled=${props.spinning||props.disabled}
      aria-label=${T.spin}>${props.spinning?T.spinning:T.spin}</button>
  </div>`;
}

/* ============================ team seat ============================ */
function TeamCard(props){
  var team=props.team, s=props.settings;
  var toCrown=s.crownEvery-(team.correct%s.crownEvery);
  return html`<div class=${"team-card"+(props.active?" active":"")} style=${{"--tc":team.color}}>
    <div class="thead">
      <span class="tname">${team.name}</span>
      ${team.crowns>0?html`<span class="crown-badge">♛${team.crowns}</span>`:null}
      <span class="score tnum">${team.score}</span>
    </div>
    <div class="slots">
      ${CATS.map(function(c){
        var got=team.unlocked.indexOf(c.id)>=0;
        return html`<${Tile} key=${c.id} cat=${c.id} on=${got} dim=${!got} cls="framed"/>`;
      })}
    </div>
    <div class="crown-meter">
      <span class="pips">${Array.apply(null,{length:s.crownEvery}).map(function(_,i){
        return html`<span key=${i} class=${"pip"+(i<(team.correct%s.crownEvery)?" on":"")}></span>`;
      })}</span>
      <span>${team.unlocked.length}/5 · ${toCrown} ${T.toNextCrown}</span>
    </div>
    <div class="crown-meter">
      <span class="ll-mini">${LIFELINES.map(function(l){
        var left=!!(team.lifelines&&team.lifelines[l.id]);
        return html`<span key=${l.id} class=${left?"":"spent"} title=${llName(l.id)+(left?"":" — "+T.llUsed)}>
          <${LLIcon} id=${l.id} size=${13}/></span>`;
      })}</span>
      <span>${T.lifelines}</span>
    </div>
  </div>`;
}
