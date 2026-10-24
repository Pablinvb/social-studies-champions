
/* ============================ shared chrome ============================ */
function TopBar(props){
  return html`<div class="topbar">
    ${props.back?html`<button class="btn sm ghost" onClick=${function(){ sfx("click"); props.back(); }}>← ${T.backHome}</button>`
               :html`<span class="brand">Social Studies <span>Champions</span></span>`}
    <span class="spacer"></span>
    ${props.title?html`<span class="eyebrow">${props.title}</span>`:null}
    <button class="icon-btn" title=${T.music}
      onClick=${function(){ props.setAudio({music:!props.audio.music}); }}>${props.audio.music?"♪":"𝄽"}</button>
  </div>`;
}

/* ============================ home ============================ */
function Home(props){
  return html`<div class="wrap">
    <${TopBar} audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="home">
      <h1 class="logo"><span class="l1">SOCIAL STUDIES</span><span class="l2">CHAMPIONS</span></h1>
      <p class="tagline">${T.tagline}</p>
      <div class="cast">
        ${WHEEL.map(function(c){ return html`<figure key=${c.id} style=${catVars(c.id)}>
          <${Tile} cat=${c.id}/>
          <figcaption>${c.short}${c.subject!==c.short?html`<small>${c.subject}</small>`:null}</figcaption>
        </figure>`; })}
      </div>
      <div class="home-actions">
        <button class="btn lg" onClick=${function(){ audioResume(); sfx("click"); props.go("setup"); }}>${T.start}</button>
        ${props.hasMatch?html`<button class="btn lg ghost" onClick=${function(){ audioResume(); sfx("click"); props.go("game"); }}>${T.resume}</button>`:null}
        <button class="btn lg ghost" onClick=${function(){ sfx("click"); props.go("howto"); }}>${T.howto}</button>
        <button class="btn lg ghost" onClick=${function(){ sfx("click"); props.go("bank"); }}>${T.bank}</button>
      </div>
      <p class="home-note">${T.homeNote}</p>
    </div>
  </div>`;
}

/* ============================ how to play ============================ */
var STEPS=[
  ["Form the teams","Two to four teams, each with a name and a colour. They sit around the wheel."],
  ["Spin the wheel","Six slots: the five characters and the Crown."],
  ["Answer in time","Four options, one correct. Running out of time counts as a wrong answer."],
  ["Spend a lifeline","Stuck? The iPad buys 30 more seconds and asking a rival gives 15 seconds to consult another team. Each team gets one use of each for the whole match."],
  ["Earn crowns","Every third correct answer wins a crown, and landing on the Crown slot wins one too."],
  ["Spend the crown","Pick the character you want and answer one question from that subject. Right, it is yours. Wrong, the crown is gone."],
  ["Win the match","The first team holding all five characters wins."]
];
function HowTo(props){
  return html`<div class="wrap" style=${{paddingBottom:"48px"}}>
    <${TopBar} back=${function(){props.go("home");}} title=${T.rulesTitle}
      audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="card" style=${{marginBottom:"18px"}}>
      <div class="steps">
        ${STEPS.map(function(s,i){ return html`<div key=${i} class="step">
          <span class="n">${i+1}</span>
          <div><h4>${s[0]}</h4><p>${s[1]}</p></div></div>`; })}
      </div>
    </div>
    <div class="grid2">
      <div class="card">
        <div class="eyebrow">${T.score}</div>
        <table style=${{marginTop:"10px",minWidth:0}}><tbody>
          <tr><td>${T.easy}</td><td class="num">100</td></tr>
          <tr><td>${T.medium}</td><td class="num">200</td></tr>
          <tr><td>${T.hard}</td><td class="num">300</td></tr>
          <tr><td>${T.crownWon}</td><td class="num">+${CROWN_BONUS}</td></tr>
          <tr><td><b>${T.unlocked}</b></td><td class="num">+${UNLOCK_BONUS}</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <div class="eyebrow">${T.lifelines}</div>
        <div style=${{display:"grid",gap:"12px",marginTop:"12px"}}>
          ${LIFELINES.map(function(l){ return html`<div key=${l.id} class="row" style=${{gap:"12px",flexWrap:"nowrap"}}>
            <span style=${{color:"var(--gold)",flex:"0 0 auto"}}><${LLIcon} id=${l.id} size=${26}/></span>
            <b style=${{fontSize:"15px"}}>${llName(l.id)}
              <br/><span class="muted" style=${{fontWeight:700,fontSize:"13px"}}>${llHint(l.id)}</span></b>
          </div>`; })}
        </div>
        <p class="hint" style=${{marginTop:"12px"}}>${T.llOnce}</p>
      </div>
      <div class="card">
        <div class="eyebrow">${T.characters}</div>
        <div style=${{display:"grid",gap:"10px",marginTop:"10px"}}>
          ${WHEEL.map(function(c){ return html`<div key=${c.id} class="row" style=${{gap:"12px",flexWrap:"nowrap"}}>
            <${Tile} cat=${c.id} style=${{width:"46px",flex:"0 0 auto"}}/>
            <b style=${{color:"var(--c-"+c.id+")",fontSize:"15px"}}>${c.name}
              <br/><span class="muted" style=${{fontWeight:700,fontSize:"13px"}}>${c.subject}</span></b>
          </div>`; })}
        </div>
      </div>
    </div>
    <p class="muted" style=${{marginTop:"16px",fontSize:"14px",fontWeight:600}}>
      Keyboard: <span class="kbd">space</span> spins, <span class="kbd">A</span>–<span class="kbd">D</span>
      or <span class="kbd">1</span>–<span class="kbd">4</span> answer. The gear opens the teacher panel.</p>
    <div style=${{marginTop:"18px"}}>
      <button class="btn lg" onClick=${function(){ sfx("click"); props.go("home"); }}>${T.gotIt}</button></div>
  </div>`;
}

/* ============================ setup ============================ */
function Setup(props){
  var bank=props.bank;
  var cs=useState(clone(props.settings)), cfg=cs[0], setCfg=cs[1];
  function patch(k,v){ setCfg(function(p){ var n=Object.assign({},p); n[k]=v; return n; }); }
  function setCount(n){
    setCfg(function(p){
      var ts=p.teams.slice(0,n);
      while(ts.length<n) ts.push({name:"Team "+(ts.length+1),color:TEAM_COLORS[ts.length]});
      return Object.assign({},p,{teams:ts});
    });
  }
  function setTeam(i,k,v){ setCfg(function(p){ var ts=clone(p.teams); ts[i][k]=v; return Object.assign({},p,{teams:ts}); }); }
  var pool=useMemo(function(){ return poolFor(bank,cfg); },[bank,cfg.set,cfg.level,cfg.difficulty]);
  var perCat=CATS.map(function(c){ return {c:c,n:pool.filter(function(q){return q.cat===c.id;}).length}; });
  var thin=perCat.some(function(x){ return x.n<3; });
  return html`<div class="wrap" style=${{paddingBottom:"48px"}}>
    <${TopBar} back=${function(){props.go("home");}} title=${T.setup}
      audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="card" style=${{marginBottom:"18px"}}>
      <div class="field"><span class="label">${T.numTeams}</span>
        <${Seg} value=${cfg.teams.length} onChange=${setCount}
          items=${[2,3,4].map(function(n){return {v:n,l:n+" "+T.howManyTeams};})}/></div>
      <div style=${{display:"grid",gap:"11px",marginTop:"16px"}}>
        ${cfg.teams.map(function(tm,i){ return html`<div key=${i} class="team-row" style=${{"--tc":tm.color}}>
          <div class="field"><span class="label">${T.teamName} ${i+1}</span>
            <input type="text" id=${"team-name-"+i} value=${tm.name} maxLength="22"
              onChange=${function(e){ setTeam(i,"name",e.target.value); }}/></div>
          <div class="field" style=${{flex:"2 1 250px"}}><span class="label">${T.color}</span>
            <div class="swatches">${TEAM_COLORS.map(function(col){
              return html`<button key=${col} class="swatch" style=${{background:col}} aria-label=${col}
                aria-pressed=${String(tm.color===col)} onClick=${function(){ sfx("click"); setTeam(i,"color",col); }}></button>`;
            })}</div></div>
        </div>`; })}
      </div>
    </div>
    <div class="card grid2" style=${{marginBottom:"18px"}}>
      <div class="field"><span class="label">${T.set}</span>
        <${Seg} value=${cfg.set} onChange=${function(v){patch("set",v);}}
          items=${[{v:"wwi",l:SET_BY_ID.wwi.name},{v:"unit",l:SET_BY_ID.unit.name},
                   {v:"general",l:SET_BY_ID.general.name},{v:"all",l:T.setAll}]}/></div>
      <div class="field"><span class="label">${T.level}</span>
        <${Seg} value=${cfg.level} onChange=${function(v){patch("level",v);}}
          items=${LEVELS.map(function(l){return {v:l.id,l:l.name};})}/>
        <span class="hint">${T.levelHint}</span></div>
      <div class="field"><span class="label">${T.unlockRule}</span>
        <${Seg} value=${cfg.unlockRule} onChange=${function(v){patch("unlockRule",v);}}
          items=${[{v:"crown",l:T.ruleCrown},{v:"both",l:T.ruleBoth}]}/>
        <span class="hint">${cfg.unlockRule==="crown"?T.ruleCrownHint:T.ruleBothHint}</span></div>
      <div class="field"><span class="label">${T.crownEvery}</span>
        <${Seg} value=${cfg.crownEvery} onChange=${function(v){patch("crownEvery",v);}}
          items=${[2,3,4].map(function(v){return {v:v,l:String(v)};})}/></div>
      ${cfg.unlockRule==="both"?html`<div class="field"><span class="label">${T.needed}</span>
        <${Seg} value=${cfg.needed} onChange=${function(v){patch("needed",v);}}
          items=${[1,2,3].map(function(v){return {v:v,l:String(v)};})}/></div>`:null}
      <div class="field"><span class="label">${T.difficulty}</span>
        <${Seg} value=${cfg.difficulty} onChange=${function(v){patch("difficulty",v);}}
          items=${[{v:"easy",l:T.easy},{v:"medium",l:T.medium},{v:"hard",l:T.hard},{v:"mixed",l:T.mixed}]}/></div>
      <div class="field"><span class="label">${T.timeLimit}</span>
        <${Seg} value=${cfg.timer} onChange=${function(v){patch("timer",v);}}
          items=${[15,20,30,45,60].map(function(v){return {v:v,l:v+" "+T.sec};})}/></div>
      <div class="field"><span class="label">${T.options}</span>
        <${Seg} value=${cfg.shuffleOpts} onChange=${function(v){patch("shuffleOpts",v);}}
          items=${[{v:true,l:T.shuffleOpts},{v:false,l:T.fixedOpts}]}/></div>
    </div>
    <div class="card flat" style=${{marginBottom:"18px"}}>
      <div class="eyebrow">${pool.length} ${T.available}</div>
      <div class="row" style=${{marginTop:"11px",gap:"7px"}}>
        ${perCat.map(function(x){ return html`<span key=${x.c.id} class="tag cat" style=${catVars(x.c.id)}>
          ${x.c.subject} ${x.n}</span>`; })}
      </div>
      ${thin?html`<p class="hint" style=${{marginTop:"11px"}}>${T.shortBank}</p>`:null}
    </div>
    <button class="btn lg block" disabled=${pool.length===0}
      onClick=${function(){ audioResume(); sfx("click"); props.onStart(cfg); }}>${T.startMatch}</button>
  </div>`;
}

/* ============================ question bank ============================ */
function QForm(props){
  var st=useState(props.value), v=st[0], setV=st[1];
  function p(k,val){ setV(function(o){ var n=clone(o); n[k]=val; return n; }); }
  function po(i,val){ setV(function(o){ var n=clone(o); n.o[i]=val; return n; }); }
  var valid=String(v.q).trim()&&v.o.every(function(x){return String(x).trim();});
  return html`<div class="card" style=${{marginBottom:"16px",borderColor:"var(--gold)"}}>
    <div class="grid2">
      <div class="field"><span class="label">${T.category}</span>
        <${Seg} value=${v.cat} onChange=${function(x){p("cat",x);}} items=${CATS.map(function(c){return {v:c.id,l:c.subject};})}/></div>
      <div class="field"><span class="label">${T.level}</span>
        <${Seg} value=${v.lvl} onChange=${function(x){p("lvl",x);}} items=${LEVELS.map(function(l){return {v:l.id,l:l.name};})}/></div>
      <div class="field"><span class="label">${T.difficulty}</span>
        <${Seg} value=${v.dif} onChange=${function(x){p("dif",x);}} items=${DIFFS.map(function(d){return {v:d,l:T[d]};})}/></div>
      <div class="field"><span class="label">${T.answer}</span>
        <${Seg} value=${v.a} onChange=${function(x){p("a",x);}} items=${[0,1,2,3].map(function(i){return {v:i,l:"ABCD".charAt(i)};})}/></div>
    </div>
    <div class="field" style=${{marginTop:"16px"}}><span class="label">${T.question}</span>
      <input type="text" id="qf-q" value=${v.q} onChange=${function(e){ p("q",e.target.value); }}/></div>
    <div class="field" style=${{marginTop:"16px"}}><span class="label">${T.options}</span>
      ${[0,1,2,3].map(function(i){ return html`<div key=${i} class="row" style=${{gap:"9px",marginBottom:"7px",flexWrap:"nowrap"}}>
        <span style=${{width:"30px",height:"30px",display:"grid",placeItems:"center",borderRadius:"50%",flex:"0 0 auto",
          background:v.a===i?"var(--good)":"rgba(255,255,255,.14)",color:v.a===i?"#06351d":"#fff",
          fontWeight:900,fontSize:"13px"}}>${"ABCD".charAt(i)}</span>
        <input type="text" id=${"qf-o-"+i} value=${v.o[i]} onChange=${function(e){ po(i,e.target.value); }}/></div>`; })}
    </div>
    <div class="field" style=${{marginTop:"16px"}}><span class="label">${T.explanation}</span>
      <input type="text" id="qf-e" value=${v.e} onChange=${function(e){ p("e",e.target.value); }}/></div>
    <div class="row" style=${{marginTop:"18px"}}>
      <button class="btn" disabled=${!valid} onClick=${function(){ sfx("click"); props.onSave(v); }}>${T.save}</button>
      <button class="btn ghost" onClick=${function(){ sfx("click"); props.onCancel(); }}>${T.cancel}</button>
    </div>
  </div>`;
}

function Bank(props){
  var bank=props.bank, setBank=props.setBank;
  var f=useState({cat:"all",lvl:"all",dif:"all",set:"all",q:""}), flt=f[0], setFlt=f[1];
  var e=useState(null), editing=e[0], setEditing=e[1];
  var io=useState(null), ioMode=io[0], setIoMode=io[1];
  var tx=useState(""), text=tx[0], setText=tx[1];
  var ts=useState(null), toast=ts[0], setToast=ts[1];
  var fm=useState("json"), fmt=fm[0], setFmt=fm[1];
  function patch(k,v){ setFlt(function(p){ var n=Object.assign({},p); n[k]=v; return n; }); }
  var list=useMemo(function(){
    var needle=flt.q.trim().toLowerCase();
    return bank.filter(function(q){
      if(flt.cat!=="all"&&q.cat!==flt.cat) return false;
      if(flt.lvl!=="all"&&q.lvl!==flt.lvl) return false;
      if(flt.dif!=="all"&&q.dif!==flt.dif) return false;
      if(flt.set!=="all"&&(q.set||"general")!==flt.set) return false;
      if(needle){
        var hay=(q.q+" "+q.o.join(" ")+" "+(q.ref||"")+" "+(q.topic||"")).toLowerCase();
        if(hay.indexOf(needle)<0) return false;
      }
      return true;
    });
  },[bank,flt]);
  function save(v){
    var n=normalize(v); if(!n){ setToast(T.badData); return; }
    setBank(function(b){
      if(v.id){ return b.map(function(q){ return q.id===v.id?Object.assign(n,{id:v.id,set:q.set,ref:q.ref,topic:q.topic}):q; }); }
      return b.concat([Object.assign(n,{id:uid(),set:"custom"})]);
    });
    setEditing(null); setToast(T.saved);
  }
  function del(id){ setBank(function(b){ return b.filter(function(q){ return q.id!==id; }); }); }
  function blank(){ return {cat:"history",lvl:"8",dif:"easy",q:"",o:["","","",""],a:0,e:""}; }
  function doExport(kind){ setFmt(kind); setIoMode("export"); setText(kind==="json"?JSON.stringify(bank,null,1):toCSV(bank)); }
  function doImport(replace){
    var parsed; try{ parsed=parseImport(text); }catch(err){ parsed=null; }
    if(!parsed||!parsed.length){ setToast(T.badData); return; }
    setBank(function(b){ return replace?parsed:b.concat(parsed); });
    setToast(parsed.length+" "+T.imported); setIoMode(null); setText("");
  }
  function selectArea(){ var a=document.getElementById("io-area"); if(a){ a.focus(); a.select(); } }
  function copyOut(){
    try{ navigator.clipboard.writeText(text).then(function(){ setToast(T.copied); },selectArea); }
    catch(err){ selectArea(); }
  }
  return html`<div class="wrap" style=${{paddingBottom:"48px"}}>
    <${TopBar} back=${function(){props.go("home");}} title=${T.bank}
      audio=${props.audio} setAudio=${props.setAudio}/>
    <div class="card">
      <div class="toolbar">
        <div class="field"><span class="label">${T.search}</span>
          <input type="text" id="bank-search" value=${flt.q} placeholder="…" onChange=${function(ev){patch("q",ev.target.value);}}/></div>
        <div class="field"><span class="label">${T.category}</span>
          <select id="bank-cat" value=${flt.cat} onChange=${function(ev){patch("cat",ev.target.value);}}>
            <option value="all">${T.all}</option>
            ${CATS.map(function(c){ return html`<option key=${c.id} value=${c.id}>${c.subject}</option>`; })}
          </select></div>
        <div class="field"><span class="label">${T.set}</span>
          <select id="bank-set" value=${flt.set} onChange=${function(ev){patch("set",ev.target.value);}}>
            <option value="all">${T.all}</option>
            ${SETS.map(function(s){ return html`<option key=${s.id} value=${s.id}>${s.name}</option>`; })}
          </select></div>
        <div class="field"><span class="label">${T.level}</span>
          <select id="bank-lvl" value=${flt.lvl} onChange=${function(ev){patch("lvl",ev.target.value);}}>
            <option value="all">${T.all}</option>
            ${LEVELS.map(function(l){ return html`<option key=${l.id} value=${l.id}>${l.name}</option>`; })}
          </select></div>
        <div class="field"><span class="label">${T.difficulty}</span>
          <select id="bank-dif" value=${flt.dif} onChange=${function(ev){patch("dif",ev.target.value);}}>
            <option value="all">${T.all}</option>
            ${DIFFS.map(function(d){ return html`<option key=${d} value=${d}>${T[d]}</option>`; })}
          </select></div>
      </div>
      <div class="row" style=${{marginTop:"14px"}}>
        <button class="btn sm" onClick=${function(){ sfx("click"); setEditing(blank()); setIoMode(null); }}>+ ${T.addQ}</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); setIoMode("import"); setText(""); setEditing(null); }}>${T.importT}</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); doExport("json"); setEditing(null); }}>${T.exportT} JSON</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); doExport("csv"); setEditing(null); }}>${T.exportT} CSV</button>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); setBank(defaultBank()); setToast(T.restoreDefaults); }}>${T.restoreDefaults}</button>
        <span class="spacer"></span><span class="chip tnum">${list.length} / ${bank.length}</span>
      </div>
    </div>

    ${ioMode==="export"?html`<div class="card" style=${{marginTop:"16px"}}>
      <div class="row between"><span class="eyebrow">${T.exportT} · ${fmt.toUpperCase()}</span>
        <button class="icon-btn" onClick=${function(){setIoMode(null);}} aria-label=${T.close}>✕</button></div>
      <p class="hint" style=${{margin:"8px 0 10px"}}>${T.exportHint}</p>
      <textarea id="io-area" readOnly value=${text}></textarea>
      <div class="row" style=${{marginTop:"12px"}}>
        <button class="btn sm" onClick=${copyOut}>${T.copy}</button>
        <button class="btn sm ghost" onClick=${function(){ doExport(fmt==="json"?"csv":"json"); }}>${fmt==="json"?"CSV":"JSON"}</button>
      </div></div>`:null}

    ${ioMode==="import"?html`<div class="card" style=${{marginTop:"16px"}}>
      <div class="row between"><span class="eyebrow">${T.importT}</span>
        <button class="icon-btn" onClick=${function(){setIoMode(null);}} aria-label=${T.close}>✕</button></div>
      <p class="hint" style=${{margin:"8px 0 10px"}}>${T.importHint}</p>
      <textarea id="io-area" value=${text} onChange=${function(ev){ setText(ev.target.value); }}></textarea>
      <div class="row" style=${{marginTop:"12px"}}>
        <button class="btn sm" onClick=${function(){ doImport(false); }}>${T.merge}</button>
        <button class="btn sm ghost" onClick=${function(){ doImport(true); }}>${T.replaceAll}</button>
      </div></div>`:null}

    ${editing?html`<div style=${{marginTop:"16px"}}>
      <${QForm} value=${editing} onSave=${save} onCancel=${function(){setEditing(null);}}/></div>`:null}

    <div class="bank-list">
      ${list.length?list.map(function(q){
        var c=catOf(q.cat);
        return html`<div key=${q.id} class="qrow" style=${catVars(q.cat)}>
          <div class="meta">
            <span class="tag cat">${c.subject}</span>
            <span class="tag">${(SET_BY_ID[q.set||"general"]||SET_BY_ID.general).short}</span>
            ${q.topic?html`<span class="tag">${q.topic}</span>`:null}
            <span class="tag">${levelName(q.lvl)}</span>
            <span class="tag">${T[q.dif]}</span>
            ${q.ref?html`<span class="tag">${q.ref}</span>`:null}
            <span class="spacer"></span>
            <button class="btn sm ghost" onClick=${function(){ sfx("click"); setEditing(clone(q)); setIoMode(null); window.scrollTo({top:0,behavior:"smooth"}); }}>${T.edit}</button>
            <button class="btn sm ghost" onClick=${function(){ sfx("click"); del(q.id); }}>${T.del}</button>
          </div>
          <div class="qq">${q.q}</div>
          <div class="ans">${"ABCD".charAt(q.a)}. ${q.o[q.a]}</div>
          <div class="exp">${q.e}</div>
        </div>`;
      }):html`<div class="empty">${T.noQuestions}</div>`}
    </div>
    ${toast?html`<${Toast} msg=${toast} onDone=${function(){setToast(null);}}/>`:null}
  </div>`;
}

/* ============================ app ============================ */
var DEFAULT_SETTINGS={
  teams:[{name:"Team 1",color:TEAM_COLORS[0]},{name:"Team 2",color:TEAM_COLORS[1]}],
  level:"10", difficulty:"mixed", timer:30, needed:2, crownEvery:3,
  unlockRule:"crown", set:"wwi", shuffleOpts:true
};
function App(){
  var sc=useState("home"), screen=sc[0], setScreen=sc[1];
  var bs=useState(loadBank), bank=bs[0], setBank=bs[1];
  var ss=useState(function(){ return Object.assign({},DEFAULT_SETTINGS,lsGet("ssc.settings",{})); }), settings=ss[0], setSettings=ss[1];
  var ad=useState(function(){ return Object.assign({sfx:true,music:true,vol:0.75},lsGet("ssc.audio",{})); }), audio=ad[0], setAudioState=ad[1];
  var ms=useState(function(){
    var saved=lsGet("ssc.match",null);
    if(saved&&saved.teams&&saved.teams.length&&saved.teams[0].crowns!==undefined){
      if(saved.phase==="spinning"||saved.phase==="reveal") saved.phase="spin";
      /* matches saved before lifelines existed still open cleanly */
      saved.teams.forEach(function(t){ if(!t.lifelines) t.lifelines=freshLifelines(); });
      if(saved.timeMax===undefined) saved.timeMax=(saved.settings||{}).timer||30;
      saved.consult=null;
      return saved;
    }
    return null;
  }), match=ms[0], setMatch=ms[1];

  function setAudio(patch){
    setAudioState(function(p){ var n=Object.assign({},p,patch); applyAudio(n); audioResume(); return n; });
  }
  useEffect(function(){ lsSet("ssc.bank",bank); },[bank]);
  useEffect(function(){ lsSet("ssc.settings",settings); },[settings]);
  useEffect(function(){ lsSet("ssc.audio",audio); applyAudio(audio); },[audio]);
  useEffect(function(){ if(match) lsSet("ssc.match",match); else lsDel("ssc.match"); },[match]);
  useEffect(function(){ document.documentElement.lang="en"; },[]);
  useEffect(function(){
    function once(){ audioResume(); }
    window.addEventListener("pointerdown",once,{once:true});
    window.addEventListener("keydown",once,{once:true});
    return function(){ window.removeEventListener("pointerdown",once); window.removeEventListener("keydown",once); };
  },[]);
  useEffect(function(){ if(screen!=="game") musicStart("menu"); },[screen]);

  function start(cfg){
    setSettings(cfg);
    var teams=cfg.teams.map(function(tm,i){
      return {id:"t"+i+"_"+Date.now().toString(36),name:(tm.name||("Team "+(i+1))).trim(),
        color:tm.color,score:0,correct:0,wrong:0,unlocked:[],progress:{},crowns:0,
        lifelines:freshLifelines()};
    });
    setMatch({settings:clone(cfg),teams:teams,turn:0,used:{},log:[],phase:"spin",q:null,cat:null,
      pick:null,ok:null,gained:0,pendingUnlock:null,crownEarned:false,crownLost:false,
      fromWheel:false,winner:null,paused:false,timeLeft:cfg.timer,startedAt:Date.now()});
    setScreen("game");
  }
  function newGame(){ setMatch(null); setScreen("setup"); }
  function exitHome(){ setScreen("home"); }

  var common={audio:audio,setAudio:setAudio,go:setScreen};
  var view;
  if(screen==="game"&&match){
    view=html`<${Game} match=${match} setMatch=${setMatch} bank=${bank}
      audio=${audio} setAudio=${setAudio} onExit=${exitHome} onNewGame=${newGame}/>`;
  } else if(screen==="setup"){
    view=html`<${Setup} ...${common} settings=${settings} bank=${bank} onStart=${start}/>`;
  } else if(screen==="howto"){
    view=html`<${HowTo} ...${common}/>`;
  } else if(screen==="bank"){
    view=html`<${Bank} ...${common} bank=${bank} setBank=${setBank}/>`;
  } else {
    view=html`<${Home} ...${common} hasMatch=${!!(match&&match.phase!=="victory")}/>`;
  }
  return html`<${React.Fragment}><${Stars}/><div class="app">${view}</div><//>`;
}

var root=ReactDOM.createRoot(document.getElementById("root"));
function boot(){ root.render(html`<${App}/>`); }
if(window.claude&&window.claude.hot&&window.claude.hot.ready){ window.claude.hot.ready(boot); } else { boot(); }
})();
</script>
