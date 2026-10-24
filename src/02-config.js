<div id="root"></div>
<canvas id="confetti" hidden></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/htm/3.1.1/htm.js"></script>
<script>
(function(){
"use strict";
var React=window.React, ReactDOM=window.ReactDOM;
var html=window.htm.bind(React.createElement);
var useState=React.useState, useEffect=React.useEffect, useRef=React.useRef, useMemo=React.useMemo;

/* ============================ reference data ============================ */
var CATS=[
  {id:"history",   name:"Cronos the Wise",     short:"Cronos",   subject:"History",   img:"art/history.webp"},
  {id:"geography", name:"Globi the Explorer",  short:"Globi",    subject:"Geography", img:"art/geography.webp"},
  {id:"civics",    name:"Justi the Leader",    short:"Justi",    subject:"Civics",    img:"art/civics.webp"},
  {id:"economics", name:"Ahorrito the Genius", short:"Ahorrito", subject:"Economics", img:"art/economics.webp"},
  {id:"culture",   name:"Arti the Creative",   short:"Arti",     subject:"Culture",   img:"art/culture.webp"}
];
var CROWN={id:"crown",name:"The Crown",short:"Crown",subject:"Crown",img:"art/crown.webp"};
/* the wheel carries the five categories plus the crown slot */
var WHEEL=CATS.concat([CROWN]);
var CAT_BY_ID={}; CATS.forEach(function(c){CAT_BY_ID[c.id]=c;}); CAT_BY_ID.crown=CROWN;
var LEVELS=[
  {id:"8", name:"8th EGB"},{id:"9", name:"9th EGB"},{id:"10",name:"10th EGB"},
  {id:"B1",name:"1st BGU"},{id:"B2",name:"2nd BGU"},{id:"B3",name:"3rd BGU"}
];
var LEVEL_ORDER={"8":0,"9":1,"10":2,"B1":3,"B2":4,"B3":5};
var SETS=[
  {id:"unit",   name:"Aztecs, Maya & the Andes", short:"Unit 1"},
  {id:"wwi",    name:"WWI & Russian Revolution", short:"Unit 2"},
  {id:"general",name:"General Social Studies",   short:"General"},
  {id:"custom", name:"My own questions",         short:"Custom"}
];
var SET_BY_ID={}; SETS.forEach(function(s){SET_BY_ID[s.id]=s;});
var DIFFS=["easy","medium","hard"];
var POINTS={easy:100,medium:200,hard:300};
var UNLOCK_BONUS=150;
var CROWN_BONUS=50;
var TEAM_COLORS=["#d7395a","#1f8a63","#3362c9","#b8821a","#a4349b","#c05a1c","#1a8a93","#6a46c8"];
/* Lifelines: one use of each per team for the whole match. A third one is planned. */
var LIFELINES=[
  {id:"tablet", secs:30, mode:"extend"},
  {id:"ask",    secs:15, mode:"consult"}
];

var T={
  start:"START GAME", howto:"HOW TO PLAY", bank:"QUESTION BANK", resume:"CONTINUE MATCH",
  tagline:"Collect the characters. Conquer the knowledge.",
  homeNote:"A team knowledge contest for Social Studies. Win crowns, choose your characters, and collect all five to take the match.",
  setup:"Game setup", numTeams:"Number of teams", teamName:"Team name", color:"Colour",
  level:"School level", levelHint:"Applies to the general bank. The two units always play in full.",
  difficulty:"Difficulty", timeLimit:"Time per question", needed:"Correct answers per character",
  crownEvery:"Correct answers per crown", unlockRule:"How characters are won",
  ruleCrown:"Crowns only", ruleBoth:"Crowns and category streaks",
  ruleCrownHint:"Characters come only from crown challenges, the way the original game works.",
  ruleBothHint:"Teams can also unlock a character by answering enough questions in its category.",
  set:"Question set", setAll:"All sets", available:"questions available",
  startMatch:"Start match", backHome:"Home",
  spin:"SPIN", spinning:"…", turn:"Turn", score:"Score", pts:"pts",
  easy:"Easy", medium:"Medium", hard:"Hard", mixed:"Mixed", all:"All",
  correct:"Correct!", incorrect:"Not quite", timeup:"Time's up",
  answerWas:"The answer was", next:"Next team", continueB:"Continue",
  unlocked:"Character unlocked", collect:"Collect", collected:"Collected",
  crownWon:"Crown earned!", crownLanded:"The wheel landed on the crown",
  crownPick:"Choose the character you want to win",
  crownQuestion:"Crown question", crownLost:"The crown is spent",
  crownKept:"crowns", crownOne:"crown", toNextCrown:"to next crown",
  winner:"Champions", finalScore:"Final score", summary:"Match summary",
  playAgain:"Play again", newGame:"New game",
  teacher:"Teacher panel", pause:"Pause", unpause:"Resume", paused:"Paused",
  skip:"Skip question", adjust:"Adjust score", chars:"Characters", giveCrown:"Give a crown",
  review:"Answer log", restart:"Restart match", exit:"Exit to home",
  sound:"Sound effects", music:"Music", volume:"Volume", theme:"Theme",
  light:"Light", dark:"Dark", close:"Close", noLog:"No answers yet.",
  team:"Team", characters:"Characters", crowns:"Crowns", hits:"Correct", misses:"Wrong",
  addQ:"New question", edit:"Edit", del:"Delete", save:"Save", cancel:"Cancel",
  importT:"Import", exportT:"Export", copy:"Copy", copied:"Copied",
  search:"Search", category:"Category", question:"Question", options:"Options",
  answer:"Correct answer", explanation:"Explanation",
  importHint:"Paste JSON or CSV and press Import. CSV uses the same header as the export.",
  exportHint:"Copy this text and save it as a .json or .csv file.",
  replaceAll:"Replace whole bank", merge:"Add to bank",
  restoreDefaults:"Restore original bank", custom:"Custom",
  imported:"questions imported", badData:"That text could not be read.", saved:"Saved",
  noQuestions:"No questions match these filters.",
  shortBank:"Few questions with this setup. Add levels or change the difficulty.",
  recycled:"Reshuffled this category's questions.",
  already:"Already collected — this one only scores points.",
  rulesTitle:"How to play", gotIt:"Got it", howManyTeams:"teams",
  sec:"s", grant:"Give", revoke:"Remove", shuffleOpts:"Shuffle the options every time",
  fixedOpts:"Keep A·B·C·D order", allWon:"Every character is already collected.",
  lifelines:"Lifelines", llOnce:"One use each per match", llUsed:"Used",
  llTablet:"iPad", llTabletHint:"Look it up on the iPad — 30 seconds more",
  llAsk:"Ask a rival", llAskHint:"15 seconds to ask another team",
  consultTitle:"Ask another team", consultSub:"The clock is paused. Answer when you are ready.",
  consultDone:"Done", llGiveBack:"Return"
};

/* ============================ question bank ============================ */
function Q(cat,lvl,dif,q,o,a,e){
  return {set:"general",cat:cat,lvl:lvl,dif:dif,q:q,o:o,a:a,e:e};
}
function U(ref,cat,dif,q,o,a,e){
  return {set:"unit",ref:ref,topic:"Aztecs, Maya & the Andes",cat:cat,lvl:"8",dif:dif,q:q,o:o,a:a,e:e};
}
function W(ref,cat,dif,topic,q,o,a,e){
  return {set:"wwi",ref:ref,topic:topic,cat:cat,lvl:"10",dif:dif,q:q,o:o,a:a,e:e};
}
var SEED=[
