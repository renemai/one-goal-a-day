const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const $=s=>document.querySelector(s);
let W=0,H=0,dpr=Math.min(2,devicePixelRatio||1),state="ready",drag=false,start=null,aim=null,shot=null,sound=true;
let best=+localStorage.getItem("ogad-final-best")||0;
let streak=+localStorage.getItem("ogad-streak")||1;
$("#streak").textContent=streak;$("#streakBig").textContent=streak;$("#best").textContent=best;

const now=new Date(), day=Math.floor((now-new Date(now.getFullYear(),0,0))/86400000);
const seed=day*7919+31;
function rand(n){let x=Math.sin(seed+n*97.13)*43758.5453;return x-Math.floor(x)}
const challenge={distance:(28+rand(1)*5).toFixed(1),wind:Math.round(7+rand(2)*10),wall:3+Math.floor(rand(3)*3),angle:rand(4)*2-1};
$("#day").textContent=day;$("#distance").textContent=challenge.distance+" m";$("#wind").textContent=challenge.wind+" km/h "+(challenge.angle>0?"↗":"↖");$("#wallCount").textContent=challenge.wall;

let ball={x:.5,y:.83,vx:0,vy:0,r:16,rot:0};
let keeper={x:.5,y:.29,target:.5,save:false};
let particles=[];

function resize(){
 const r=canvas.getBoundingClientRect();W=r.width;H=r.height;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize",resize);resize();

function draw(){
 ctx.clearRect(0,0,W,H);
 drawStadium();drawField();drawGoal();drawWall();drawKeeper();drawBall();drawAim();drawParticles();
 requestAnimationFrame(draw);
}
function drawStadium(){
 let g=ctx.createLinearGradient(0,0,0,H*.55);g.addColorStop(0,"#02050a");g.addColorStop(.5,"#101923");g.addColorStop(1,"#1c2731");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 for(let i=0;i<420;i++){let x=(i*83)%W,y=80+(i*47)%(H*.28),c=i%5===0?"#dfe8f2":"#6b7884";ctx.fillStyle=c;ctx.globalAlpha=.18+(i%7)/35;ctx.beginPath();ctx.arc(x,y,1+(i%3)*.35,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;
 for(const x of [.15,.35,.65,.85]){ctx.fillStyle="#f6fbff";ctx.shadowBlur=35;ctx.shadowColor="#cce6ff";ctx.beginPath();ctx.ellipse(W*x,26,10,4,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
 ctx.fillStyle="#18314a";ctx.fillRect(0,H*.49,W,30);ctx.fillStyle="#dfe9f3";ctx.font="900 11px system-ui";ctx.textAlign="center";ctx.fillText("ONE GOAL A DAY     •     ONE GOAL A DAY     •     ONE GOAL A DAY",W/2,H*.51);
}
function drawField(){
 let top=H*.5;let g=ctx.createLinearGradient(0,top,0,H);g.addColorStop(0,"#2b6f3b");g.addColorStop(1,"#123d23");ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(W*.07,top);ctx.lineTo(W*.93,top);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
 for(let i=0;i<10;i++){ctx.fillStyle=i%2?"#ffffff08":"#00000008";ctx.beginPath();ctx.moveTo(W*(i/10),top);ctx.lineTo(W*((i+1)/10),top);ctx.lineTo(W*((i+1)/10+.06),H);ctx.lineTo(W*(i/10+.06),H);ctx.fill()}
 ctx.strokeStyle="#ffffff55";ctx.lineWidth=2;ctx.beginPath();ctx.arc(W*.5,H*.93,W*.22,Math.PI,0);ctx.stroke();
}
function goalRect(){return{x:W*.28,y:H*.53,w:W*.44,h:H*.18}}
function drawGoal(){
 const g=goalRect();ctx.strokeStyle="#e8eef2";ctx.lineWidth=5;ctx.strokeRect(g.x,g.y,g.w,g.h);
 ctx.strokeStyle="#ffffff22";ctx.lineWidth=1;
 for(let x=g.x;x<g.x+g.w;x+=24){ctx.beginPath();ctx.moveTo(x,g.y);ctx.lineTo(x,g.y+g.h);ctx.stroke()}
 for(let y=g.y;y<g.y+g.h;y+=20){ctx.beginPath();ctx.moveTo(g.x,y);ctx.lineTo(g.x+g.w,y);ctx.stroke()}
}
function drawWall(){
 const gap=8,pw=Math.min(43,W*.07),startX=W*.5-(challenge.wall*(pw+gap)-gap)/2,y=H*.67;
 for(let i=0;i<challenge.wall;i++){let x=startX+i*(pw+gap);ctx.fillStyle="#dfe2e4";ctx.fillRect(x,y,pw,55);ctx.fillStyle="#202831";ctx.fillRect(x+pw*.18,y+15,pw*.64,35);ctx.fillStyle="#d7a47d";ctx.beginPath();ctx.arc(x+pw/2,y-6,10,0,Math.PI*2);ctx.fill();ctx.fillStyle="#111";ctx.font="bold 9px system-ui";ctx.textAlign="center";ctx.fillText([11,7,5,9,4][i],x+pw/2,y+36)}
}
function drawKeeper(){
 const x=W*keeper.x,y=H*.58;ctx.save();ctx.translate(x,y);ctx.scale(.95,.95);
 ctx.fillStyle="#121a24";ctx.fillRect(-18,0,36,58);ctx.fillStyle="#f2c547";ctx.fillRect(-34,20,68,10);ctx.fillStyle="#d9a27d";ctx.beginPath();ctx.arc(0,-9,11,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawBall(){
 const x=W*ball.x,y=H*ball.y;ctx.save();ctx.translate(x,y);ctx.rotate(ball.rot);ctx.shadowBlur=12;ctx.shadowColor="#0009";ctx.fillStyle="#f3f5f6";ctx.beginPath();ctx.arc(0,0,ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle="#18212a";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-5);ctx.lineTo(0,-12);ctx.lineTo(9,-5);ctx.lineTo(7,6);ctx.lineTo(-4,10);ctx.closePath();ctx.stroke();ctx.restore()}
function drawAim(){
 if(!aim||state!=="ready")return;let x=W*ball.x,y=H*ball.y;ctx.strokeStyle="#ffffffaa";ctx.lineWidth=5;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-aim.dx,y-aim.dy);ctx.stroke();ctx.strokeStyle="#a9df38";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-aim.dx,y-aim.dy);ctx.stroke();
}
function drawParticles(){
 for(const p of particles){ctx.globalAlpha=p.life;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fill();p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life-=.018}particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;
}

function pointerPos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.addEventListener("pointerdown",e=>{
 if(state!=="ready")return;drag=true;const p=pointerPos(e);start=p;canvas.setPointerCapture(e.pointerId);$("#hint").textContent="LOS LASSEN ZUM SCHIESSEN";
});
canvas.addEventListener("pointermove",e=>{
 if(!drag)return;const p=pointerPos(e);let dx=Math.max(-150,Math.min(150,start.x-p.x)),dy=Math.max(-150,Math.min(150,start.y-p.y));aim={dx,dy};let power=Math.min(1,Math.max(.05,Math.hypot(dx,dy)/150));$("#meterFill").style.width=(power*100)+"%";$("#crosshair").style.display="block";$("#crosshair").style.left=p.x+"px";$("#crosshair").style.top=p.y+"px";
});
canvas.addEventListener("pointerup",e=>{
 if(!drag)return;drag=false;$("#crosshair").style.display="none";const p=pointerPos(e);let dx=start.x-p.x,dy=start.y-p.y;let power=Math.min(1,Math.max(.12,Math.hypot(dx,dy)/150));let dir=Math.max(-1,Math.min(1,dx/120));takeShot(dir,power);
});

function takeShot(dir,power){
 state="flight";$("#shotsLeft").textContent="1 / 1";$("#hint").textContent="SCHUSS!";
 const g=goalRect(),targetX=Math.max(g.x+10,Math.min(g.x+g.w-10,g.x+g.w/2+dir*g.w*.46)),targetY=g.y+g.h*.22+(1-power)*g.h*.45;
 const keeperError=(rand(20)-.5)*.65;keeper.target=Math.max(.08,Math.min(.92,.5+dir*.55+keeperError));keeper.save=Math.abs(keeper.target-(targetX/W))<.075&&power<.9;
 const startX=W*ball.x,startY=H*ball.y,tx=targetX,ty=targetY,duration=850-power*250,t0=performance.now();
 const animate=t=>{
   let q=Math.min(1,(t-t0)/duration),ease=1-Math.pow(1-q,3);ball.x=(startX+(tx-startX)*ease)/W;ball.y=(startY+(ty-startY)*ease)/H-(Math.sin(q*Math.PI)*.08);ball.rot+=.3;keeper.x+=(keeper.target-keeper.x)*.12;
   if(q<1)requestAnimationFrame(animate);else finish(dir,power,targetX)
 };requestAnimationFrame(animate);
}
function finish(dir,power,targetX){
 const g=goalRect(),center=g.x+g.w/2,norm=Math.abs(targetX-center)/(g.w/2),accuracy=Math.round(Math.max(0,100-norm*58-(1-power)*8));
 let saved=keeper.save;if(Math.abs(dir)<.09&&power<.82)saved=true;
 const base=500,bonus=accuracy*3+Math.round(power*100),score=Math.max(0,Math.min(999,Math.round((base+bonus)*(saved?.18:1))));
 const speed=Math.round(72+power*68),rank=Math.max(1,Math.round(11000-score*8-rand(33)*300));
 $("#score").textContent=score;$("#accuracy").textContent=accuracy+"%";$("#power").textContent=Math.round(power*100)+"%";$("#speed").textContent=speed+" km/h";$("#rank").textContent="#"+rank.toLocaleString("de-DE");$("#youScore").textContent=score;
 if(score>best){best=score;localStorage.setItem("ogad-final-best",best);$("#best").textContent=best}
 $("#resultLabel").textContent=saved?"GEHALTEN – morgen wieder!":score>900?"WORLD CLASS!":"Gutes Tor – morgen geht's weiter.";
 $("#modalScore").textContent=score;$("#modalAccuracy").textContent=accuracy+"%";$("#modalSpeed").textContent=speed+" km/h";$("#modalRank").textContent="#"+rank.toLocaleString("de-DE");
 $("#modalTitle").textContent=saved?"SAVED!":score>900?"WORLD CLASS!":"GOAL!";
 $("#modalText").textContent=saved?"Der Torwart hat deinen Schuss gelesen.":score>900?"Top corner. Das war ein Traumtor.":"Starker Abschluss. Schaffst du morgen einen neuen Rekord?";
 if(!saved){for(let i=0;i<38;i++)particles.push({x:targetX,y:g.y+g.h*.3,vx:(Math.random()-.5)*3,vy:(Math.random()-1.2)*3,s:1+Math.random()*3,life:1,c:i%3?"#fff":"#a9df38"})}
 $("#tomorrow").disabled=false;setTimeout(()=>$("#resultModal").classList.add("show"),450);
}
$("#closeModal").onclick=()=>$("#resultModal").classList.remove("show");
$("#tomorrow").onclick=()=>{resetGame();window.scrollTo({top:0,behavior:"smooth"})};
function resetGame(){state="ready";ball={x:.5,y:.83,vx:0,vy:0,r:16,rot:0};aim=null;$("#meterFill").style.width="0";$("#hint").textContent="Ziehe vom Ball weg und lasse los";$("#shotsLeft").textContent="1 / 1";$("#tomorrow").disabled=true}
$("#share").onclick=async()=>{const s=$("#score").textContent;if(s==="—")return showToast("Erst schießen!");const t=`⚽ ONE GOAL A DAY\nMein heutiger Score: ${s}. Schlag mich!`;try{if(navigator.share)await navigator.share({title:"One Goal a Day",text:t});else{await navigator.clipboard.writeText(t);showToast("Score kopiert!")}}catch(e){}};
$("#sound").onclick=()=>{$("body").classList.toggle("muted");$("#sound").textContent=$("#sound").textContent==="🔊"?"🔇":"🔊";sound=!sound};
function showToast(t){$("#toast").textContent=t;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),2200)}
const leaders={world:[["Max",934],["Anna",901],["You",best||873],["Lukas",821]],country:[["Jonas",941],["Max",934],["You",best||873],["Sofia",812]],friends:[["Max",934],["Anna",901],["You",best||873],["Lukas",821]]};
function renderTab(tab="world"){const rows=leaders[tab];$("#tabContent").innerHTML=rows.map((r,i)=>`<div class="row ${r[0]==="You"?"you":""}"><span class="num">${i+1}</span><span class="avatar"></span><b>${r[0]}</b><strong>${r[1]}</strong></div>`).join("")}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderTab(b.dataset.tab)});
$("#leaderboard").onclick=()=>document.querySelector(".tabs-card").scrollIntoView({behavior:"smooth"});
renderTab();draw();resetGame();
