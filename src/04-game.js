
/* ============================ teacher drawer ============================ */
function Drawer(props){
  var m=props.match, setM=props.setMatch, s=m.settings, au=props.audio;
  function patchSettings(k,v){
    setM(function(p){ var ns=Object.assign({},p.settings); ns[k]=v;
      var np=Object.assign({},p,{settings:ns});
      if(k==="timer"&&p.phase!=="question") np.timeLeft=v;
      return np; });
  }
  function bump(i,d){
    setM(function(p){ var ts=clone(p.teams); ts[i].score=Math.max(0,ts[i].score+d); return Object.assign({},p,{teams:ts}); });
  }
  function toggleChar(i,cid){
    setM(function(p){
      var ts=clone(p.teams), tm=ts[i], k=tm.unlocked.indexOf(cid);
      if(k>=0){ tm.unlocked.splice(k,1); tm.progress[cid]=0; }
      else { tm.unlocked.push(cid); tm.progress[cid]=p.settings.needed; }
      return Object.assign({},p,{teams:ts});
    });
  }
  function giveCrown(i){
    setM(function(p){ var ts=clone(p.teams); ts[i].crowns++; return Object.assign({},p,{teams:ts}); });
  }
  return html`<aside class="drawer" role="dialog" aria-label=${T.teacher}>
    <div class="row between">
      <strong style=${{fontFamily:"var(--f-display)",fontSize:"19px"}}>${T.teacher}</strong>
      <button class="icon-btn" onClick=${props.onClose} aria-label=${T.close}>✕</button>
    </div>

    <h3>${T.pause}</h3>
    <div class="row">
      <button class=${"btn sm"+(m.paused?"":" ghost")}
        onClick=${function(){ sfx("click"); setM(function(p){return Object.assign({},p,{paused:!p.paused});}); }}>
        ${m.paused?T.unpause:T.pause}</button>
      <button class="btn sm ghost" disabled=${m.phase!=="question"}
        onClick=${function(){ sfx("click"); props.onSkip(); }}>${T.skip}</button>
    </div>

    <h3>${T.sound}</h3>
    <div class="row">
      <button class=${"btn sm"+(au.sfx?"":" ghost")} onClick=${function(){ props.setAudio({sfx:!au.sfx}); }}>
        ${T.sound}: ${au.sfx?"on":"off"}</button>
      <button class=${"btn sm"+(au.music?"":" ghost")} onClick=${function(){ props.setAudio({music:!au.music}); }}>
        ${T.music}: ${au.music?"on":"off"}</button>
    </div>
    <div class="field" style=${{marginTop:"10px"}}><span class="label">${T.volume}</span>
      <${Seg} value=${au.vol} onChange=${function(v){ props.setAudio({vol:v}); }}
        items=${[{v:0.35,l:"Low"},{v:0.75,l:"Medium"},{v:1,l:"High"}]}/></div>

    <h3>${T.adjust}</h3>
    ${m.teams.map(function(tm,i){ return html`<div key=${tm.id} class="row between" style=${{marginBottom:"8px"}}>
      <span class="row" style=${{gap:"8px",minWidth:0}}>
        <span style=${{width:"10px",height:"10px",borderRadius:"50%",background:tm.color,display:"inline-block"}}></span>
        <b style=${{fontSize:"13.5px"}}>${tm.name}</b>
        <span class="tnum muted" style=${{fontSize:"13px"}}>${tm.score}</span>
      </span>
      <span class="row" style=${{gap:"6px"}}>
        <button class="btn sm ghost" onClick=${function(){bump(i,-100);}}>−100</button>
        <button class="btn sm ghost" onClick=${function(){bump(i,100);}}>+100</button>
      </span></div>`; })}

    <h3>${T.chars}</h3>
    ${m.teams.map(function(tm,i){ return html`<div key=${tm.id} style=${{marginBottom:"12px"}}>
      <div class="row between" style=${{marginBottom:"6px"}}>
        <b style=${{fontSize:"13.5px"}}>${tm.name}</b>
        <button class="btn sm ghost" onClick=${function(){ sfx("click"); giveCrown(i); }}>♛ ${T.giveCrown}</button>
      </div>
      <div class="row" style=${{gap:"6px"}}>
        ${CATS.map(function(c){ var got=tm.unlocked.indexOf(c.id)>=0;
          return html`<button key=${c.id} class="icon-btn" title=${c.name+" — "+(got?T.revoke:T.grant)}
            onClick=${function(){ sfx("click"); toggleChar(i,c.id); }}
            style=${{padding:"3px",overflow:"hidden",width:"44px",height:"44px",
              borderColor:got?"var(--c-"+c.id+")":"var(--line)"}}>
            <${Tile} cat=${c.id} dim=${!got} style=${{width:"100%"}}/>
          </button>`; })}
      </div></div>`; })}

    <h3>${T.lifelines}</h3>
    ${m.teams.map(function(tm,i){ return html`<div key=${tm.id} class="row between" style=${{marginBottom:"8px"}}>
      <b style=${{fontSize:"13.5px"}}>${tm.name}</b>
      <span class="row" style=${{gap:"6px"}}>
        ${LIFELINES.map(function(l){
          var left=!!(tm.lifelines&&tm.lifelines[l.id]);
          return html`<button key=${l.id} class=${"btn sm"+(left?" ghost":"")}
            title=${llName(l.id)+" — "+(left?T.llUsed:T.llGiveBack)}
            onClick=${function(){ sfx("click"); setM(function(p){
              var ts=clone(p.teams);
              if(!ts[i].lifelines) ts[i].lifelines=freshLifelines();
              ts[i].lifelines[l.id]=!ts[i].lifelines[l.id];
              return Object.assign({},p,{teams:ts});
            }); }}><${LLIcon} id=${l.id} size=${15}/></button>`;
        })}
      </span></div>`; })}

    <h3>${T.setup}</h3>
    <div class="field"><span class="label">${T.timeLimit}</span>
      <${Seg} value=${s.timer} onChange=${function(v){patchSettings("timer",v);}}
        items=${[15,20,30,45,60].map(function(v){return {v:v,l:v+T.sec};})}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.crownEvery}</span>
      <${Seg} value=${s.crownEvery} onChange=${function(v){patchSettings("crownEvery",v);}}
        items=${[2,3,4].map(function(v){return {v:v,l:String(v)};})}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.difficulty}</span>
      <${Seg} value=${s.difficulty} onChange=${function(v){patchSettings("difficulty",v);}}
        items=${[{v:"easy",l:T.easy},{v:"medium",l:T.medium},{v:"hard",l:T.hard},{v:"mixed",l:T.mixed}]}/></div>
    <div class="field" style=${{marginTop:"12px"}}><span class="label">${T.level}</span>
      <${Seg} value=${s.level} onChange=${function(v){patchSettings("level",v);}}
        items=${LEVELS.map(function(l){return {v:l.id,l:l.name};})}/></div>

    <h3>${T.review}</h3>
    ${m.log.length?m.log.slice(0,14).map(function(L,i){
      return html`<div key=${i} class="log-item" style=${{"--lc":L.ok?"var(--good)":"var(--bad)"}}>
        <b>${L.team}</b> · ${catOf(L.cat).subject}${L.crown?" ♛":""} · ${L.ok?"correct":(L.timeout?"timed out":"wrong")}<br/>
        <span class="muted">${L.q}</span></div>`;
    }):html`<p class="muted" style=${{fontSize:"13.5px"}}>${T.noLog}</p>`}

    <h3>${T.restart}</h3>
    <div class="row">
      <button class="btn sm ghost" onClick=${function(){ sfx("click"); props.onRestart(); }}>${T.restart}</button>
      <button class="btn sm ghost" onClick=${function(){ sfx("click"); props.onExit(); }}>${T.exit}</button>
    </div>
  </aside>`;
}

/* ============================ game ============================ */
/* Seats ring the wheel: two face each other, a third sits below, a fourth set takes the corners. */
function seatStyle(i,n){
  var maps={
    2:[{gridColumn:1,gridRow:2},{gridColumn:3,gridRow:2}],
    3:[{gridColumn:1,gridRow:2},{gridColumn:3,gridRow:2},{gridColumn:2,gridRow:3}],
    4:[{gridColumn:1,gridRow:1},{gridColumn:3,gridRow:1},{gridColumn:1,gridRow:3},{gridColumn:3,gridRow:3}]
  };
  var m=maps[n]||maps[2];
  return m[i]||{gridColumn:1,gridRow:2};
}
function Game(props){
  var m=props.match, setM=props.setMatch, bank=props.bank;
  var s=m.settings, team=m.teams[m.turn];
  var st=useState(0), rot=st[0], setRot=st[1];
  var sp=useState(false), spinning=sp[0], setSpinning=sp[1];
  var ld=useState(false), landed=ld[0], setLanded=ld[1];
  var dr=useState(false), drawer=dr[0], setDrawer=dr[1];
  var to=useState(null), toast=to[0], setToast=to[1];
  var timers=useRef([]);
  useEffect(function(){ return function(){ timers.current.forEach(clearTimeout); }; },[]);
  function later(fn,ms){ var id=setTimeout(fn,ms); timers.current.push(id); return id; }

  useEffect(function(){
    if(m.phase==="question") musicStart("quiz");
    else if(m.phase==="victory") musicStart("victory");
    else musicStart("board");
  },[m.phase]);

  useEffect(function(){
    if(m.phase!=="question"||m.paused||m.consult) return;
    var iv=setInterval(function(){
      setM(function(p){
        if(p.phase!=="question"||p.paused||p.consult) return p;
        return Object.assign({},p,{timeLeft:Math.max(0,Math.round((p.timeLeft-0.25)*100)/100)});
      });
    },250);
    return function(){ clearInterval(iv); };
  },[m.phase,m.paused]);
  useEffect(function(){ if(m.phase==="question"&&m.timeLeft<=0) answer(null); },[m.phase,m.timeLeft]);
  useEffect(function(){
    if(m.phase==="question"&&!m.paused&&!m.consult&&m.timeLeft>0&&m.timeLeft<=5&&m.timeLeft%1===0) sfx("tick");
  },[m.timeLeft]);

  /* the "ask a rival" window runs on its own clock while the question clock waits */
  useEffect(function(){
    if(!m.consult||m.paused) return;
    var iv=setInterval(function(){
      setM(function(p){
        if(!p.consult||p.paused) return p;
        var left=Math.max(0,Math.round((p.consult.left-0.25)*100)/100);
        return Object.assign({},p,{consult:left<=0?null:{left:left,total:p.consult.total}});
      });
    },250);
    return function(){ clearInterval(iv); };
  },[!!m.consult,m.paused]);
  useEffect(function(){
    if(m.consult&&!m.paused&&m.consult.left>0&&m.consult.left<=5&&m.consult.left%1===0) sfx("tick");
  },[m.consult&&m.consult.left]);

  useEffect(function(){
    if(m.phase==="victory"||m.phase==="unlock"||m.pendingUnlock) return;
    for(var i=0;i<m.teams.length;i++){
      if(m.teams[i].unlocked.length>=CATS.length){
        sfx("win"); confetti(11000);
        setM(function(p){ return Object.assign({},p,{phase:"victory",winner:i,endedAt:Date.now()}); });
        return;
      }
    }
  },[m.teams,m.phase]);

  useEffect(function(){
    function onKey(ev){
      var tag=(ev.target&&ev.target.tagName)||"";
      if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT") return;
      if(m.paused) return;
      if(m.phase==="question"){
        var k=String(ev.key).toLowerCase();
        var i="abcd".indexOf(k); if(i<0) i="1234".indexOf(k);
        if(i>=0){ ev.preventDefault(); answer(i); }
      } else if(ev.key===" "||ev.key==="Enter"){
        if(m.phase==="spin"){ ev.preventDefault(); spin(); }
        else if(m.phase==="feedback"){ ev.preventDefault(); cont(); }
        else if(m.phase==="unlock"){ ev.preventDefault(); collect(); }
        else if(m.phase==="crownIntro"){ ev.preventDefault(); toPick(); }
      }
    }
    window.addEventListener("keydown",onKey);
    return function(){ window.removeEventListener("keydown",onKey); };
  },[m,rot,spinning]);

  function resolveAnswer(p,pick){
    var q=p.q, ok=(pick!==null&&pick===q.a);
    var teams=clone(p.teams), tm=teams[p.turn];
    var gained=0, unlock=null, crownEarned=false, crownLost=false;
    if(ok){
      gained=POINTS[q.dif]||100; tm.score+=gained; tm.correct++;
      if(q.crown){
        if(tm.unlocked.indexOf(q.cat)<0){
          tm.unlocked.push(q.cat); tm.progress[q.cat]=p.settings.needed;
          tm.score+=UNLOCK_BONUS; gained+=UNLOCK_BONUS; unlock=q.cat;
        }
      } else if(p.settings.unlockRule==="both"&&tm.unlocked.indexOf(q.cat)<0){
        tm.progress[q.cat]=(tm.progress[q.cat]||0)+1;
        if(tm.progress[q.cat]>=p.settings.needed){
          tm.unlocked.push(q.cat); tm.score+=UNLOCK_BONUS; gained+=UNLOCK_BONUS; unlock=q.cat;
        }
      }
      if(tm.correct>0&&tm.correct%p.settings.crownEvery===0&&tm.unlocked.length<CATS.length){
        tm.crowns++; tm.score+=CROWN_BONUS; gained+=CROWN_BONUS; crownEarned=true;
      }
    } else {
      tm.wrong++;
      if(q.crown) crownLost=true;
    }
    var log=p.log.slice(0,59);
    log.unshift({team:tm.name,cat:q.cat,ok:ok,timeout:pick===null,crown:!!q.crown,q:q.q});
    return Object.assign({},p,{phase:"feedback",teams:teams,pick:pick,ok:ok,gained:gained,
      pendingUnlock:unlock,crownEarned:crownEarned,crownLost:crownLost,log:log,consult:null});
  }
  function answer(pick){
    if(m.phase!=="question") return;
    var next=resolveAnswer(m,pick);
    sfx(next.ok?"good":"bad");
    setM(next);
  }
  function cont(){
    sfx("click");
    if(m.pendingUnlock){ sfx("unlock"); confetti(2600); setM(Object.assign({},m,{phase:"unlock"})); return; }
    afterUnlock(m);
  }
  function collect(){
    sfx("click");
    var next=Object.assign({},m,{pendingUnlock:null});
    if(m.teams[m.turn].unlocked.length>=CATS.length){
      sfx("win"); confetti(11000);
      setM(Object.assign(next,{phase:"victory",winner:m.turn,endedAt:Date.now()}));
      return;
    }
    afterUnlock(next);
  }
  function afterUnlock(p){
    var tm=p.teams[p.turn];
    if(tm.crowns>0&&tm.unlocked.length<CATS.length){
      sfx("crown");
      setM(Object.assign({},p,{phase:"crownIntro",pendingUnlock:null,crownEarned:false,fromWheel:false}));
      return;
    }
    setM(Object.assign({},p,{pendingUnlock:null,crownEarned:false}));
    later(nextTurn,10);
  }
  /* each lifeline is good once per team for the whole match */
  function useLifeline(id){
    if(m.phase!=="question"||m.paused||m.consult) return;
    var tm=m.teams[m.turn];
    if(!tm.lifelines||!tm.lifelines[id]) return;
    var spec=LIFELINES.filter(function(l){ return l.id===id; })[0];
    if(!spec) return;
    sfx("crown");
    setM(function(p){
      var teams=clone(p.teams);
      teams[p.turn].lifelines[id]=false;
      if(spec.mode==="extend"){
        return Object.assign({},p,{teams:teams,
          timeLeft:p.timeLeft+spec.secs,
          timeMax:(p.timeMax||p.settings.timer)+spec.secs});
      }
      return Object.assign({},p,{teams:teams,consult:{left:spec.secs,total:spec.secs}});
    });
  }
  function toPick(){ sfx("click"); setM(function(p){ return Object.assign({},p,{phase:"crownPick"}); }); }
  function nextTurn(){
    setLanded(false);
    setM(function(p){ return Object.assign({},p,{phase:"spin",turn:(p.turn+1)%p.teams.length,
      q:null,cat:null,pick:null,ok:null,gained:0,pendingUnlock:null,crownEarned:false,
      crownLost:false,fromWheel:false,timeLeft:p.settings.timer,timeMax:p.settings.timer,
      consult:null,recycled:false}); });
  }
  function drawQuestion(p,catId,isCrown){
    var pool=poolFor(bank,p.settings).filter(function(q){ return q.cat===catId; });
    if(!pool.length) return null;
    var used=p.used||{};
    var avail=pool.filter(function(q){ return !used[q.id]; });
    var recycled=false;
    if(!avail.length){ used=Object.assign({},used); pool.forEach(function(q){ delete used[q.id]; }); avail=pool; recycled=true; }
    var q=avail[Math.floor(Math.random()*avail.length)];
    var order=p.settings.shuffleOpts?shuffle([0,1,2,3]):[0,1,2,3];
    var nu=Object.assign({},used); nu[q.id]=1;
    return {used:nu,recycled:recycled,q:{
      id:q.id,cat:q.cat,dif:q.dif,lvl:q.lvl,ref:q.ref||"",topic:q.topic||"",crown:!!isCrown,
      q:q.q,o:order.map(function(k){return q.o[k];}),a:order.indexOf(q.a),e:q.e}};
  }
  function loadQuestion(catId,isCrown){
    setM(function(p){
      var d=drawQuestion(p,catId,isCrown);
      if(!d) return Object.assign({},p,{phase:isCrown?"crownPick":"spin",noPool:true});
      var teams=p.teams;
      if(isCrown){ teams=clone(p.teams); teams[p.turn].crowns=Math.max(0,teams[p.turn].crowns-1); }
      return Object.assign({},p,{phase:"question",teams:teams,q:d.q,used:d.used,
        timeLeft:p.settings.timer,timeMax:p.settings.timer,consult:null,
        pick:null,ok:null,recycled:d.recycled,noPool:false});
    });
  }
  useEffect(function(){ if(m.noPool){ setToast(T.noQuestions); setM(function(p){return Object.assign({},p,{noPool:false});}); } },[m.noPool]);
  useEffect(function(){ if(m.recycled){ setToast(T.recycled); setM(function(p){return Object.assign({},p,{recycled:false});}); } },[m.recycled]);

  function spin(){
    if(spinning||m.phase!=="spin"||m.paused) return;
    audioResume(); setLanded(false);
    var i=Math.floor(Math.random()*WHEEL.length);
    var target=(360-(i*SEG+SEG/2)+360)%360;
    var delta=(((target-(rot%360))%360)+360)%360;
    setRot(rot+360*6+delta); setSpinning(true); sfx("riser");
    later(function(){
      setSpinning(false); setLanded(true); sfx("land");
      var hit=WHEEL[i];
      setM(function(p){ return Object.assign({},p,{phase:"reveal",cat:hit.id}); });
      later(function(){
        if(hit.id==="crown"){
          setM(function(p){
            var tm=p.teams[p.turn];
            if(tm.unlocked.length>=CATS.length) return p;
            var teams=clone(p.teams); teams[p.turn].crowns++; teams[p.turn].score+=CROWN_BONUS;
            return Object.assign({},p,{teams:teams,phase:"crownIntro",fromWheel:true});
          });
          sfx("crown");
        } else {
          loadQuestion(hit.id,false);
        }
      },1500);
    },5250);
  }
  function skip(){ setDrawer(false); nextTurn(); }
  function restart(){
    setDrawer(false); setLanded(false);
    setM(function(p){
      var ts=p.teams.map(function(tm){ var n=clone(tm);
        n.score=0; n.correct=0; n.wrong=0; n.unlocked=[]; n.progress={}; n.crowns=0;
        n.lifelines=freshLifelines(); return n; });
      return Object.assign({},p,{teams:ts,turn:0,used:{},log:[],phase:"spin",q:null,cat:null,
        pick:null,ok:null,gained:0,pendingUnlock:null,crownEarned:false,crownLost:false,
        fromWheel:false,winner:null,timeLeft:p.settings.timer});
    });
  }

  if(m.phase==="victory"){
    var w=m.teams[m.winner];
    var ranked=m.teams.slice().sort(function(a,b){ return (b.unlocked.length-a.unlocked.length)||(b.score-a.score); });
    return html`<div class="wrap victory">
      <div style=${{fontSize:"56px",lineHeight:1}}>🏆</div>
      <div class="eyebrow">${T.winner}</div>
      <h2 class="winner-name">${w.name}</h2>
      <span class="chip gold tnum" style=${{fontSize:"16px"}}>${T.finalScore}: ${w.score} ${T.pts}</span>
      <div class="winner-cast">${CATS.map(function(c){ return html`<${Tile} key=${c.id} cat=${c.id}/>`; })}</div>
      <div class="card results">
        <div class="eyebrow" style=${{marginBottom:"12px"}}>${T.summary}</div>
        <table><thead><tr>
          <th>${T.team}</th><th>${T.characters}</th><th>${T.crowns}</th>
          <th>${T.hits}</th><th>${T.misses}</th><th style=${{textAlign:"right"}}>${T.score}</th>
        </tr></thead><tbody>
        ${ranked.map(function(tm){ return html`<tr key=${tm.id}>
          <td><span style=${{display:"inline-block",width:"9px",height:"9px",borderRadius:"50%",
            background:tm.color,marginRight:"9px"}}></span>${tm.name}</td>
          <td class="tnum">${tm.unlocked.length}/5</td>
          <td class="tnum">${tm.crowns}</td>
          <td class="tnum">${tm.correct}</td><td class="tnum">${tm.wrong}</td>
          <td class="num">${tm.score}</td>
        </tr>`; })}
        </tbody></table>
      </div>
      <div class="row" style=${{justifyContent:"center"}}>
        <button class="btn lg" onClick=${function(){ sfx("click"); restart(); }}>${T.playAgain}</button>
        <button class="btn lg ghost" onClick=${function(){ sfx("click"); props.onNewGame(); }}>${T.newGame}</button>
      </div>
    </div>`;
  }

  var middle;
  if(m.phase==="question"||m.phase==="feedback"){
    var q=m.q, c=catOf(q.cat), done=m.phase==="feedback";
    var tmax=m.timeMax||s.timer;
    var pct=clamp(m.timeLeft/tmax*100,0,100);
    middle=html`<div class="qcard" style=${catVars(q.cat)}>
      <div class="qhead">
        <${Tile} cat=${q.cat}/>
        <span class="cat">${c.name}</span>
        <span class="tag">${c.subject}</span>
        ${q.crown?html`<span class="chip gold">♛ ${T.crownQuestion}</span>`:null}
        <span class="tag">${T[q.dif]} · ${POINTS[q.dif]}</span>
        ${q.topic?html`<span class="tag">${q.topic}</span>`:html`<span class="tag">${levelName(q.lvl)}</span>`}
        ${q.ref?html`<span class="tag">${q.ref}</span>`:null}
      </div>
      <div class="timer-track"><div class=${"timer-fill"+(m.timeLeft<=5?" warn":"")} style=${{width:pct+"%"}}></div></div>
      <h2 class="qtext">${q.q}</h2>
      <div class="opts">
        ${q.o.map(function(txt,i){
          var cls="opt";
          if(done){ cls+= i===q.a?" correct":(i===m.pick?" wrong":" dim"); }
          return html`<button key=${i} class=${cls} disabled=${done||m.paused}
            onClick=${function(){ answer(i); }}>
            <span class="key">${"ABCD".charAt(i)}</span><span>${txt}</span></button>`;
        })}
      </div>
      ${!done?html`<div class="lifelines">
        ${LIFELINES.map(function(l){
          var left=!!(team.lifelines&&team.lifelines[l.id]);
          return html`<button key=${l.id} class="ll" disabled=${!left||!!m.consult}
            title=${llHint(l.id)} onClick=${function(){ useLifeline(l.id); }}>
            <${LLIcon} id=${l.id}/>
            <span class="nm">${llName(l.id)}</span>
            <span class="secs">${left?"+"+l.secs+"s":T.llUsed}</span></button>`;
        })}
        <span class="hint">${T.llOnce}</span>
      </div>`:null}
      ${done?html`<div class=${"verdict "+(m.ok?"ok":"no")}>
          <span class="big">${m.ok?T.correct:(m.pick===null?T.timeup:T.incorrect)}</span>
          ${m.ok?html`<span class="chip tnum">+${m.gained} ${T.pts}</span>`:null}
          ${m.crownEarned?html`<span class="crown-badge">♛ ${T.crownWon}</span>`:null}
          ${m.crownLost?html`<span class="chip">${T.crownLost}</span>`:null}
        </div>
        <div class="explain">
          ${!m.ok?html`<b>${T.answerWas}: ${"ABCD".charAt(q.a)}. ${q.o[q.a]}</b><br/>`:null}
          ${q.e}
          ${m.ok&&!m.pendingUnlock&&!q.crown&&team.unlocked.indexOf(q.cat)>=0
            ?html`<div style=${{marginTop:"7px",fontSize:"13.5px"}}>${T.already}</div>`:null}
        </div>
        <button class="btn block" onClick=${cont}>
          ${m.pendingUnlock?T.collect:(m.crownEarned?T.continueB:T.next)}</button>`:null}
    </div>`;
  } else if(m.phase==="crownPick"){
    var mine=m.teams[m.turn];
    middle=html`<div style=${{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px",width:"100%"}}>
      <div style=${{textAlign:"center"}}>
        <div class="eyebrow">♛ ${T.crownQuestion}</div>
        <h2 style=${{fontSize:"clamp(20px,2.8vw,28px)",marginTop:"5px"}}>${T.crownPick}</h2>
      </div>
      <div class="crown-pick">
        ${CATS.map(function(c){
          var got=mine.unlocked.indexOf(c.id)>=0;
          return html`<button key=${c.id} class="pick-btn" style=${catVars(c.id)} disabled=${got}
            onClick=${function(){ sfx("click"); loadQuestion(c.id,true); }}>
            <${Tile} cat=${c.id} dim=${got} style=${{width:"100%"}}/>
            <span class="nm">${c.short}</span>
            <span class="got">${got?T.collected:c.subject}</span>
          </button>`;
        })}
      </div>
    </div>`;
  } else if(m.phase==="reveal"){
    var rc=catOf(m.cat);
    middle=html`<${React.Fragment}>
      <${Wheel} rot=${rot} spinning=${false} landed=${landed} disabled=${true} onSpin=${function(){}}/>
      <div class="cat-reveal" style=${catVars(m.cat)}>
        <${Tile} cat=${m.cat}/><span class="nm">${rc.short}</span></div>
    <//>`;
  } else {
    middle=html`<${Wheel} rot=${rot} spinning=${spinning} landed=${landed} disabled=${m.paused} onSpin=${spin}/>`;
  }

  return html`<div class="wrap">
    <div class="topbar">
      <span class="brand">Social Studies <span>Champions</span></span>
      <span class="spacer"></span>
      ${m.paused?html`<span class="chip">⏸ ${T.paused}</span>`:null}
      <button class="icon-btn" title=${T.music}
        onClick=${function(){ props.setAudio({music:!props.audio.music}); }}>${props.audio.music?"♪":"𝄽"}</button>
      <button class="icon-btn" title=${T.teacher} onClick=${function(){ sfx("click"); setDrawer(true); }}>⚙</button>
    </div>
    <div class="turn-bar" style=${{"--tc":team.color}}>
      <span class="eyebrow">${T.turn}</span>
      <span class="who">${team.name}</span>
      <span class="spacer"></span>
      ${team.crowns>0?html`<span class="crown-badge">♛ ${team.crowns}</span>`:null}
      <span class="chip tnum">${team.score} ${T.pts}</span>
      <span class="chip tnum">${team.unlocked.length}/5</span>
    </div>
    <div class="arena">
      <div class="center">${middle}</div>
      ${m.teams.map(function(tm,i){
        return html`<div key=${tm.id} class="seat" style=${seatStyle(i,m.teams.length)}>
          <${TeamCard} team=${tm} settings=${s} active=${i===m.turn}/></div>`;
      })}
    </div>

    ${m.consult?html`<div class="overlay">
      <div class="sheet">
        <div class="eyebrow">${T.consultTitle}</div>
        <div style=${{color:"var(--gold)"}}><${LLIcon} id="ask" size=${54}/></div>
        <div class="consult-num tnum">${Math.ceil(m.consult.left)}</div>
        <div class="consult-ring"><i style=${{width:(m.consult.left/m.consult.total*100)+"%"}}></i></div>
        <p class="muted" style=${{fontWeight:700}}>${T.consultSub}</p>
        <button class="btn lg block" onClick=${function(){ sfx("click"); setM(function(p){ return Object.assign({},p,{consult:null}); }); }}>${T.consultDone}</button>
      </div></div>`:null}

    ${m.phase==="unlock"&&m.pendingUnlock?html`<div class="overlay">
      <div class="rays"></div>
      <div class="sheet" style=${catVars(m.pendingUnlock)}>
        <div class="eyebrow">${T.unlocked}</div>
        <${Tile} cat=${m.pendingUnlock} cls="hero"/>
        <h2 style=${{color:"var(--cc)",fontSize:"clamp(21px,3.4vw,30px)"}}>${catOf(m.pendingUnlock).name}</h2>
        <span class="chip gold tnum">${team.name} · +${UNLOCK_BONUS} ${T.pts}</span>
        <button class="btn lg block" onClick=${collect}>${T.collect}</button>
      </div></div>`:null}

    ${m.phase==="crownIntro"?html`<div class="overlay">
      <div class="rays"></div>
      <div class="sheet">
        <div class="eyebrow">${m.fromWheel?T.crownLanded:T.crownWon}</div>
        <${Tile} cat="crown" cls="hero"/>
        <h2 style=${{fontSize:"clamp(21px,3.4vw,30px)"}}>${team.name}</h2>
        <p class="muted" style=${{fontWeight:700}}>${T.crownPick}</p>
        <button class="btn lg block" onClick=${toPick}>${T.continueB}</button>
      </div></div>`:null}

    ${drawer?html`<${Drawer} match=${m} setMatch=${setM} audio=${props.audio} setAudio=${props.setAudio}
      onClose=${function(){setDrawer(false);}} onSkip=${skip} onRestart=${restart} onExit=${props.onExit}/>`:null}
    ${toast?html`<${Toast} msg=${toast} onDone=${function(){setToast(null);}}/>`:null}
  </div>`;
}
