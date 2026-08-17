const ball = document.getElementById("ball");
const pitch = document.getElementById("pitch");
const keeper = document.getElementById("keeper");
const shootBtn = document.getElementById("shootBtn");
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById("result");
const scoreEl = document.getElementById("score");
const accuracyEl = document.getElementById("accuracy");
const speedEl = document.getElementById("speed");
const rankEl = document.getElementById("rank");
const todayRankEl = document.getElementById("todayRank");
const bestScoreEl = document.getElementById("bestScore");
const youScoreEl = document.getElementById("youScore");
const youPlaceEl = document.getElementById("youPlace");
const instruction = document.getElementById("instruction");
const aimLine = document.getElementById("aimLine");
const shareBtn = document.getElementById("shareBtn");
const toast = document.getElementById("toast");

const today = new Date();
const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
document.getElementById("dayNumber").textContent = dayOfYear;

let dragging = false;
let dragStart = null;
let hasShot = false;

const storedBest = Number(localStorage.getItem("ogad-best") || 0);
bestScoreEl.textContent = storedBest;

function resetBall() {
  ball.style.left = "50%";
  ball.style.bottom = "70px";
  ball.style.transform = "translateX(-50%) scale(1)";
  ball.style.transition = "none";
  keeper.style.left = "50%";
  keeper.style.transform = "translateX(-50%)";
  aimLine.style.display = "none";
  instruction.textContent = "Ziehe den Ball nach hinten und lasse los.";
  shootBtn.classList.remove("hidden");
  resetBtn.classList.add("hidden");
  hasShot = false;
}

function getPoint(e) {
  const rect = pitch.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

ball.addEventListener("pointerdown", (e) => {
  if (hasShot) return;
  dragging = true;
  ball.setPointerCapture(e.pointerId);
  const p = getPoint(e);
  dragStart = p;
  ball.classList.add("dragging");
  instruction.textContent = "Ziehe nach hinten …";
});

ball.addEventListener("pointermove", (e) => {
  if (!dragging || hasShot) return;
  const p = getPoint(e);

  // Keep the ball within a sensible lower zone.
  const x = Math.max(25, Math.min(p.x, pitch.clientWidth - 25));
  const y = Math.max(pitch.clientHeight * 0.58, Math.min(p.y, pitch.clientHeight - 45));

  ball.style.left = `${x}px`;
  ball.style.bottom = `${pitch.clientHeight - y - 23}px`;

  const dx = dragStart.x - x;
  const dy = dragStart.y - y;
  const len = Math.min(140, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  aimLine.style.display = "block";
  aimLine.style.left = `${x}px`;
  aimLine.style.top = `${y}px`;
  aimLine.style.width = `${Math.max(20, len)}px`;
  aimLine.style.transform = `rotate(${angle}deg)`;
});

ball.addEventListener("pointerup", (e) => {
  if (!dragging || hasShot) return;
  dragging = false;
  ball.classList.remove("dragging");

  const p = getPoint(e);
  const dx = dragStart.x - p.x;
  const dy = dragStart.y - p.y;
  const power = Math.min(1, Math.max(0.15, Math.hypot(dx, dy) / 150));

  // If the user barely dragged, use a center shot.
  const direction = Math.max(-1, Math.min(1, dx / 110));
  shoot(direction, power);
});

shootBtn.addEventListener("click", () => {
  if (hasShot) return;
  // Button fallback for mouse/touch users who don't drag.
  shoot((Math.random() * 1.6) - 0.8, 0.72);
});

resetBtn.addEventListener("click", resetBall);

function shoot(direction, power) {
  hasShot = true;
  shootBtn.classList.add("hidden");
  aimLine.style.display = "none";
  instruction.textContent = "SCHUSS!";

  const pitchRect = pitch.getBoundingClientRect();
  const goalRect = document.querySelector(".goal").getBoundingClientRect();
  const goalLeft = goalRect.left - pitchRect.left;
  const goalWidth = goalRect.width;

  // Convert direction to a target point in the goal.
  const targetX = Math.max(goalLeft + 18, Math.min(
    goalLeft + goalWidth - 18,
    goalLeft + goalWidth / 2 + direction * goalWidth * 0.43
  ));

  const targetY = goalRect.top - pitchRect.top + 35 + (1 - power) * 75;
  const startX = ball.offsetLeft;
  const startY = ball.offsetTop;

  const distance = Math.hypot(targetX - startX, targetY - startY);
  const duration = Math.max(420, 900 - power * 300);

  // Keeper reacts, biased toward the shot direction.
  const keeperDirection = direction + (Math.random() - 0.5) * 0.8;
  keeper.style.left = `${50 + keeperDirection * 33}%`;
  keeper.style.transform = `translateX(-50%) scale(1.08)`;

  ball.style.transition = `left ${duration}ms cubic-bezier(.2,.7,.2,1), top ${duration}ms cubic-bezier(.2,.7,.2,1), transform ${duration}ms ease`;
  ball.style.left = `${targetX}px`;
  ball.style.top = `${targetY}px`;
  ball.style.bottom = "auto";
  ball.style.transform = `translateX(-50%) scale(.72) rotate(${direction * 500}deg)`;

  setTimeout(() => finishShot(direction, power, targetX, targetY, goalLeft, goalWidth), duration + 80);
}

function finishShot(direction, power, targetX, targetY, goalLeft, goalWidth) {
  // Distance from center; closer to a post gets a higher accuracy score.
  const center = goalLeft + goalWidth / 2;
  const normalized = Math.abs(targetX - center) / (goalWidth / 2);
  const accuracy = Math.round(Math.max(0, 100 - normalized * 62 - (1 - power) * 12));

  // A simple keeper collision model.
  const keeperPos = parseFloat(keeper.style.left) || 50;
  const keeperNorm = (keeperPos - 50) / 33;
  const keeperDistance = Math.abs(direction - keeperNorm);

  let saved = keeperDistance < 0.23 && power < 0.92;

  // Very central shots are easier to save.
  if (Math.abs(direction) < 0.12 && power < 0.85) saved = true;

  const goalQuality = saved ? 0.18 : 1;
  const score = Math.round((500 + accuracy * 3 + power * 100) * goalQuality);
  const finalScore = Math.max(0, Math.min(999, score));

  const speed = Math.round(65 + power * 75);
  scoreEl.textContent = finalScore;
  accuracyEl.textContent = `${accuracy}%`;
  speedEl.textContent = `${speed} km/h`;

  const oldBest = Number(localStorage.getItem("ogad-best") || 0);
  if (finalScore > oldBest) {
    localStorage.setItem("ogad-best", finalScore);
    bestScoreEl.textContent = finalScore;
  }

  // Demo rank. Replace with a backend/leaderboard later.
  const rank = Math.max(1, 10000 - finalScore * 8 + Math.floor(Math.random() * 120));
  rankEl.textContent = `#${rank.toLocaleString("de-DE")}`;
  todayRankEl.textContent = `#${rank.toLocaleString("de-DE")}`;
  youScoreEl.textContent = finalScore;
  youPlaceEl.textContent = rank < 935 ? "1" : "4";

  result.classList.remove("hidden");
  resetBtn.classList.remove("hidden");

  if (saved) {
    document.getElementById("resultMessage").textContent = "🧤 GEHALTEN — morgen gibt's die nächste Chance.";
  } else if (finalScore >= 900) {
    document.getElementById("resultMessage").textContent = "🔥 ABSOLUTER TRAUMSCHUSS";
  } else if (finalScore >= 750) {
    document.getElementById("resultMessage").textContent = "⚽ Stark! Nur ein paar Punkte zum nächsten Rekord.";
  } else {
    document.getElementById("resultMessage").textContent = "Knapp daneben. Morgen wieder.";
  }
}

shareBtn.addEventListener("click", async () => {
  const score = scoreEl.textContent;
  const text = `⚽ ONE GOAL A DAY\nIch habe heute ${score} Punkte geschafft. Schlag mich!`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "One Goal a Day", text });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast("Score kopiert – jetzt an Freunde schicken!");
    } else {
      showToast(text);
    }
  } catch (_) {}
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

resetBall();
