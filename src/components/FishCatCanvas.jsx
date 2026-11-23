import { useEffect, useRef } from "react";
import cabinBgSrc from "../assets/cabin-bg.png";

const DIFFICULTY_SETTINGS = {
  easy: { baseSpeed: 2.3, speedRange: 1.2, spawnEvery: 55, label: "Easy" },
  medium: { baseSpeed: 3.6, speedRange: 1.8, spawnEvery: 42, label: "Medium" },
  hard: { baseSpeed: 5.2, speedRange: 2.4, spawnEvery: 28, label: "Hard" },
};

// Synthesized Web Audio sound effects
function playFishSound(isGolden = false) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";

    osc.frequency.setValueAtTime(1046.5, now); // C6 ("clink")
    osc.frequency.setValueAtTime(isGolden ? 1567.98 : 1318.5, now + 0.07); // G6 or E6 ("point")

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Ignore if browser blocks audio before interaction
  }
}

function playHazardSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";

    osc.frequency.setValueAtTime(196, now); // G3 ("te")
    osc.frequency.setValueAtTime(130.81, now + 0.12); // C3 ("tot")

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Ignore if browser blocks audio before interaction
  }
}

// Crisp, bold vector Fish (Blue or Golden)
function drawFish(ctx, x, y, isGolden = false) {
  ctx.save();
  ctx.translate(x + 22, y - 12);
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  // Tail fin
  ctx.fillStyle = isGolden ? "#f59e0b" : "#0284c7";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-26, -11);
  ctx.lineTo(-26, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.fillStyle = isGolden ? "#facc15" : "#38bdf8";
  ctx.beginPath();
  ctx.ellipse(2, 0, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly highlight
  ctx.shadowColor = "transparent";
  ctx.fillStyle = isGolden ? "#fef08a" : "#bae6fd";
  ctx.beginPath();
  ctx.ellipse(3, 4, 12, 5, 0, 0, Math.PI);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(11, -3, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(12, -3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Crisp, high-contrast vector Boot
function drawBoot(ctx, x, y) {
  ctx.save();
  ctx.translate(x + 20, y - 14);
  ctx.rotate(-0.2);
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  // Boot body
  ctx.fillStyle = "#92400e";
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-12, -18);
  ctx.lineTo(4, -18);
  ctx.lineTo(4, 2);
  ctx.quadraticCurveTo(20, 2, 22, 12);
  ctx.lineTo(-12, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cuff & sole
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#d97706";
  ctx.fillRect(-12, -18, 16, 5);
  ctx.fillStyle = "#292524";
  ctx.fillRect(-13, 10, 36, 5);

  ctx.restore();
}

// Crisp, outlined vector Fish Bone
function drawFishBone(ctx, x, y) {
  ctx.save();
  ctx.translate(x + 20, y - 10);
  ctx.rotate(-0.35);
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  // Dark outer outline for contrast against wood
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(14, 0);
  [-9, -1, 7].forEach((rx) => {
    ctx.moveTo(rx, -9);
    ctx.lineTo(rx, 9);
  });
  ctx.moveTo(-18, 0);
  ctx.lineTo(-24, -7);
  ctx.moveTo(-18, 0);
  ctx.lineTo(-24, 7);
  ctx.stroke();

  // Bright white inner bone
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(14, 0);
  [-9, -1, 7].forEach((rx) => {
    ctx.moveTo(rx, -9);
    ctx.lineTo(rx, 9);
  });
  ctx.moveTo(-18, 0);
  ctx.lineTo(-24, -7);
  ctx.moveTo(-18, 0);
  ctx.lineTo(-24, 7);
  ctx.stroke();

  // Fish skull with dark outline
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(13, -8);
  ctx.lineTo(25, 0);
  ctx.lineTo(13, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye socket
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(17, -1, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCat(ctx, x, y, isMouthOpen) {
  ctx.save();
  ctx.translate(x + 40, y + 35);

  // Ears
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(-28, -15);
  ctx.lineTo(-22, -42);
  ctx.lineTo(-5, -24);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(28, -15);
  ctx.lineTo(22, -42);
  ctx.lineTo(5, -24);
  ctx.fill();

  // Inner ears
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.moveTo(-23, -18);
  ctx.lineTo(-20, -34);
  ctx.lineTo(-9, -23);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(23, -18);
  ctx.lineTo(20, -34);
  ctx.lineTo(9, -23);
  ctx.fill();

  // Head
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 3;
  if (isMouthOpen) {
    ctx.beginPath();
    ctx.arc(-12, -8, 5, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, -8, 5, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(-12, -8, 4.5, 0, Math.PI * 2);
    ctx.arc(12, -8, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();

  // Mouth
  if (isMouthOpen) {
    ctx.fillStyle = "#881337";
    ctx.beginPath();
    ctx.ellipse(0, 15, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.arc(0, 21, 6, Math.PI, 0);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(-5, 8, 5, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, 8, 5, 0, Math.PI);
    ctx.stroke();
  }

  // Whiskers
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 4);
  ctx.lineTo(-36, 0);
  ctx.moveTo(-18, 9);
  ctx.lineTo(-36, 12);
  ctx.moveTo(18, 4);
  ctx.lineTo(36, 0);
  ctx.moveTo(18, 9);
  ctx.lineTo(36, 12);
  ctx.stroke();

  ctx.restore();
}

export default function FishCatCanvas({
  gameState,
  onStartGame,
  onResumeGame,
  difficulty,
  onChangeDifficulty,
  score,
  onCatchFish,
  setLives,
  bonusPoints = 0,
}) {
  const canvasRef = useRef(null);
  const catXRef = useRef(360);
  const keysRef = useRef({ left: false, right: false });

  // Persist items, popups, and timers in refs so Stop/Continue freezes in place
  const itemsRef = useRef([]);
  const popupsRef = useRef([]);
  const frameCountRef = useRef(0);
  const mouthOpenTimerRef = useRef(0);

  // Reset board when starting a fresh game
  useEffect(() => {
    if (gameState === "start") {
      itemsRef.current = [];
      popupsRef.current = [];
      frameCountRef.current = 0;
      mouthOpenTimerRef.current = 0;
      catXRef.current = 360;
    }
  }, [gameState]);

  // Keyboard movement listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = true;
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main game loop (only advances while gameState === "playing")
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
    let animationId;

    function loop() {
      frameCountRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move cat
      const moveSpeed = difficulty === "hard" ? 9 : 7.5;
      if (keysRef.current.left) catXRef.current -= moveSpeed;
      if (keysRef.current.right) catXRef.current += moveSpeed;
      catXRef.current = Math.max(0, Math.min(canvas.width - 80, catXRef.current));

      // Spawn fish, golden fish, boots, or fish bones based on difficulty
      if (frameCountRef.current % settings.spawnEvery === 0) {
        const rand = Math.random();
        let type = "fish";
        if (rand < 0.16) type = "boot";
        else if (rand < 0.32) type = "bone";
        else if (rand > 0.85) type = "golden";

        itemsRef.current.push({
          x: Math.random() * (canvas.width - 50),
          y: -30,
          speed:
            (type === "golden" ? settings.baseSpeed + 1.2 : settings.baseSpeed) +
            Math.random() * settings.speedRange,
          type,
        });
      }

      let fishNearby = false;

      // Update & draw sharp vector items
      itemsRef.current = itemsRef.current.filter((item) => {
        item.y += item.speed;

        if (item.type === "bone") {
          drawFishBone(ctx, item.x, item.y);
        } else if (item.type === "boot") {
          drawBoot(ctx, item.x, item.y);
        } else {
          drawFish(ctx, item.x, item.y, item.type === "golden");
        }

        const isHazard = item.type === "boot" || item.type === "bone";

        // Open cat mouth when a tasty fish approaches
        if (
          !isHazard &&
          item.y > canvas.height - 175 &&
          item.y < canvas.height - 35 &&
          Math.abs(item.x - (catXRef.current + 20)) < 75
        ) {
          fishNearby = true;
        }

        // Check collision with cat
        const hitCat =
          item.y > canvas.height - 80 &&
          item.y < canvas.height - 15 &&
          item.x > catXRef.current - 20 &&
          item.x < catXRef.current + 75;

        if (hitCat) {
          if (isHazard) {
            playHazardSound();
            setLives((prev) => prev - 1);
            popupsRef.current.push({
              x: catXRef.current + 15,
              y: canvas.height - 85,
              text: item.type === "bone" ? "Yuck! -1 ❤️" : "-1 ❤️",
              color: "#f87171",
              life: 32,
            });
          } else {
            playFishSound(item.type === "golden");
            const hardBonus = difficulty === "hard" ? 5 : 0;
            const pts =
              (item.type === "golden" ? 25 : 10) + bonusPoints + hardBonus;
            onCatchFish(pts);
            mouthOpenTimerRef.current = 15;
            popupsRef.current.push({
              x: catXRef.current + 20,
              y: canvas.height - 85,
              text: `+${pts}!`,
              color: "#fef08a",
              life: 30,
            });
          }
          return false;
        }

        return item.y < canvas.height + 30;
      });

      if (mouthOpenTimerRef.current > 0) mouthOpenTimerRef.current--;
      drawCat(
        ctx,
        catXRef.current,
        canvas.height - 82,
        fishNearby || mouthOpenTimerRef.current > 0
      );

      // Floating score feedback popups with dark outline for sharp readability
      popupsRef.current = popupsRef.current.filter((p) => {
        p.y -= 1.2;
        p.life--;
        ctx.font = "bold 22px sans-serif";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 4;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
        return p.life > 0;
      });

      animationId = requestAnimationFrame(loop);
    }

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, difficulty, bonusPoints, onCatchFish, setLives]);

  // Responsive touch/mouse drag support
  function handlePointerMove(e) {
    if (gameState !== "playing" || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const pointerX = (e.clientX - rect.left) * scaleX;
    catXRef.current = Math.max(
      0,
      Math.min(canvasRef.current.width - 80, pointerX - 40)
    );
  }

  return (
    <div
      className="canvas-wrapper"
      style={{ backgroundImage: `url(${cabinBgSrc})` }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onPointerMove={handlePointerMove}
      />

      {gameState !== "playing" && (
        <div className="overlay-screen">
          <h2>
            {gameState === "paused"
              ? "⏸️ Game Paused"
              : gameState === "start"
              ? "🐱 Ready to Catch Fish?"
              : "Game Over!"}
          </h2>
          <p>
            {gameState === "paused"
              ? "Take a breather! Click Continue when you are ready."
              : gameState === "start"
              ? "Catch fresh fish and dodge old boots & fish bones!"
              : `Final Score: ${score}`}
          </p>

          {/* Difficulty Selector */}
          <div className="level-selector">
            <span>Level:</span>
            {["easy", "medium", "hard"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`btn level-btn ${
                  difficulty === lvl ? "active-level" : ""
                }`}
                onClick={() => onChangeDifficulty(lvl)}
              >
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            {gameState === "paused" ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onResumeGame}
                >
                  ▶ Continue
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onStartGame}
                >
                  Restart
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onStartGame}
              >
                {gameState === "start" ? "Start Game" : "Play Again"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}