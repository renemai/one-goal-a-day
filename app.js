const $=s=>document.querySelector(s);
const ball=$("#ball"), field=document.querySelector(".field"), keeper=$("#keeper"), aim=$("#aim"), hint=$("#hint");
let start=null, dragging=false, shot=false;
const saved=+localStorage.getItem("ogad-best-realistic")||0; $("#best").textContent=saved||0;

function point(e){const r=field.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function reset(){shot=false;ball.style.transition="none";ball.style.left="50%";ball.style.top="auto";ball.style.bottom="50px";ball.style.transform="translateX(-50%)";keeper.style.left="50%";keeper.style.transform="translateX(-50%)";hint.textContent="SWIPE TO SHOOT";aim.style.display="none"}
ball.addEventListener("pointerdown",e=>{if(shot)return;dragging=true;ball.setPointerCapture(e.pointerId);start=point(e);ball.classList.add("drag")});
ball.addEventListener("pointermove",e=>{
 if(!dragging||shot)return;
 const p=point(e),x=Math.max(30,Math.min(field.clientWidth-30,p.x)),y=Math.max(field.clientHeight*.58,Math.min(field.clientHeight-50,p.y));
 ball.style.left=x+"px";ball.style.bottom=(field.clientHeight-y-26)+"px";
 const dx=start.x-x,dy=start.y-y,len=Math.min(160,Math.hypot(dx,dy)),ang=Math.atan2(dy,dx)*180/Math.PI;
 aim.style.display="block";aim.style.left=x+"px";aim.style.top=y+"px";aim.style.width=Math.max(25,len)+"px";aim.style.transform=`rotate(${ang}deg)`;
 hint.textContent="RELEASE TO SHOOT";
});
ball.addEventListener("pointerup",e=>{if(!dragging)return;dragging=false;ball.classList.remove("drag");const p=point(e),dx=start.x-p.x,dy=start.y-p.y;shoot(Math.max(-1,Math.min(1,dx/120)),Math.min(1,Math.max(.18,Math.hypot(dx,dy)/160)))});

function shoot(dir,power){
 if(shot)return;shot=true;aim.style.display="none";hint.textContent="SHOT!";
 const goal=document.querySelector(".goal").getBoundingClientRect(),fr=field.getBoundingClientRect();
 const gx=goal.left-fr.left,gw=goal.width,targetX=Math.max(gx+15,Math.min(gx+gw-15,gx+gw/2+dir*gw*.44)),targetY=goal.top-fr.top+25+(1-power)*65;
 const duration=720-power*220;
 const keeperDir=dir+(Math.random()-.5)*.75;keeper.style.left=(50+keeperDir*34)+"%";keeper.style.transform=`translateX(-50%) scale(1.12)`;
 ball.style.transition=`left ${duration}ms cubic-bezier(.15,.7,.2,1),top ${duration}ms cubic-bezier(.15,.7,.2,1),transform ${duration}ms ease`;
 ball.style.left=targetX+"px";ball.style.top=targetY+"px";ball.style.bottom="auto";ball.style.transform=`translateX(-50%) scale(.65) rotate(${dir*650}deg)`;
 setTimeout(()=>finish(dir,power,targetX,gx,gw),duration+100);
}
function finish(dir,power,targetX,gx,gw){
 const center=gx+gw/2,norm=Math.abs(targetX-center)/(gw/2),accuracy=Math.round(Math.max(0,100-norm*60-(1-power)*10));
 const k=(parseFloat(keeper.style.left)||50-50)/34; let saved=Math.abs(dir-k)<.22&&power<.9;if(Math.abs(dir)<.1&&power<.8)saved=true;
 const score=Math.max(0,Math.min(999,Math.round((500+accuracy*3+power*100)*(saved?.18:1))));
 const speed=Math.round(70+power*70);
 $("#score").textContent=score;$("#total").textContent=score;$("#acc").textContent=accuracy+"%";$("#power").textContent=Math.round(power*100);$("#base").textContent=500;
 const old=+localStorage.getItem("ogad-best-realistic")||0;if(score>old){localStorage.setItem("ogad-best-realistic",score);$("#best").textContent=score}
 const rank=Math.max(1,Math.round(9000-score*8+Math.random()*100));$("#rank").textContent="#"+rank.toLocaleString("de-DE");$("#youScore").textContent=score;
 $("#modalScore").textContent=score;$("#modalTitle").textContent=saved?"SAVED!":score>900?"WORLD CLASS!":"GOAL!";$("#modalText").textContent=saved?"The keeper read your shot. Come back tomorrow.":score>900?"Top corner. That was special.":"Great finish. Can you beat it tomorrow?";
 setTimeout(()=>$("#modal").classList.add("show"),350);
}
$("#closeModal").onclick=()=>$("#modal").classList.remove("show");
$("#share").onclick=async()=>{const text=`⚽ ONE GOAL A DAY — Ich habe heute ${$("#score").textContent} Punkte. Schlag mich!`;try{if(navigator.share)await navigator.share({title:"One Goal a Day",text});else{await navigator.clipboard.writeText(text);alert("Score kopiert!")}}catch(e){}};
$("#tomorrow").onclick=()=>{reset();window.scrollTo({top:0,behavior:"smooth"})};
$("#soundBtn").onclick=e=>{e.currentTarget.textContent=e.currentTarget.textContent==="🔊"?"🔇":"🔊"};
reset();