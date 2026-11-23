import { useEffect, useRef } from "react";
import cabinBgSrc from "../assets/cabin-bg.png";

const DIFFICULTY_SETTINGS = {
  easy: { baseSpeed: 2.3, speedRange: 1.2, spawnEvery: 54, label: "Easy" },
  medium: { baseSpeed: 3.6, speedRange: 1.8, spawnEvery: 40, label: "Medium" },
  hard: { baseSpeed: 5.2, speedRange: 2.4, spawnEvery: 27, label: "Hard" },
};

// Synthesized Web Audio sound effects (pitch scales up with combo!)
function playFishSound(isGolden = false, combo = 1) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";

    const comboBoost = Math.min(combo - 1, 6) * 45;
    osc.frequency.setValueAtTime(1046.5 + comboBoost, now);
    osc.frequency.setValueAtTime(
      (isGolden ? 1567.98 : 1318.5) + comboBoost,
      now + 0.07
    );

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

    osc.frequency.setValueAtTime(196, now);
    osc.frequency.setValueAtTime(130.81, now + 0.12);

    gain.gain.setValueAtTime(0.22, now);
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
function drawFish(ctx, x, y, isGolden = false, wobble = 0) {
  ctx.save();
  ctx.translate(x + 22, y - 12);
  ctx.rotate(Math.sin(wobble) * 0.14);
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
function drawBoot(ctx, x, y, spin = 0) {
  ctx.save();
  ctx.translate(x + 20, y - 14);
  ctx.rotate(-0.2 + Math.sin(spin) * 0.15);
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

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

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#d97706";
  ctx.fillRect(-12, -18, 16, 5);
  ctx.fillStyle = "#292524";
  ctx.fillRect(-13, 10, 36, 5);

  ctx.restore();
}

// Crisp, outlined vector Fish Bone
function drawFishBone(ctx, x, y, spin = 0) {
  ctx.save();
  ctx.translate(x + 20, y - 10);
  ctx.rotate(-0.35 + Math.cos(spin) * 0.18);
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

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

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(17, -1, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Full-Body Standing Orange Tabby Cat (inspired by your wide-mouth sticker!)
function drawFullTabbyCat(ctx, x, bottomY, { isMouthOpen, isHurt, walkPhase, isMoving }) {
  ctx.save();
  // Anchor at center-bottom of the cat's paws
  const bounce = isMoving ? Math.abs(Math.sin(walkPhase)) * 4 : 0;
  ctx.translate(x + 45, bottomY - bounce);

  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  const furMain = "#f59e0b";
  const furBelly = "#fde68a";
  const stripeColor = "#b45309";
  const outline = "#1c1917";

  // 1. Swishing Tail (behind body)
  const tailWag = Math.sin(walkPhase * 0.6) * 0.25;
  ctx.save();
  ctx.translate(22, -26);
  ctx.rotate(tailWag);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(22, -16, 16, -38);
  ctx.stroke();

  ctx.strokeStyle = furMain;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(22, -16, 16, -38);
  ctx.stroke();
  ctx.restore();

  // 2. Walking Hind & Front Legs
  const leftStep = isMoving ? Math.sin(walkPhase) * 5 : 0;
  const rightStep = isMoving ? -Math.sin(walkPhase) * 5 : 0;

  ctx.lineWidth = 3;
  ctx.strokeStyle = outline;

  // Left Leg
  ctx.fillStyle = furMain;
  ctx.beginPath();
  ctx.roundRect(-20, -24 + leftStep, 14, 24 - leftStep, 7);
  ctx.fill();
  ctx.stroke();

  // Right Leg
  ctx.beginPath();
  ctx.roundRect(6, -24 + rightStep, 14, 24 - rightStep, 7);
  ctx.fill();
  ctx.stroke();

  // 3. Full Torso
  ctx.fillStyle = furMain;
  ctx.beginPath();
  ctx.roundRect(-24, -66, 48, 48, 20);
  ctx.fill();
  ctx.stroke();

  // Cream Belly Patch
  ctx.shadowColor = "transparent";
  ctx.fillStyle = furBelly;
  ctx.beginPath();
  ctx.ellipse(0, -40, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body Tabby Stripes
  ctx.fillStyle = stripeColor;
  ctx.beginPath();
  ctx.roundRect(-22, -52, 8, 4, 2);
  ctx.roundRect(-22, -43, 7, 4, 2);
  ctx.roundRect(14, -52, 8, 4, 2);
  ctx.roundRect(15, -43, 7, 4, 2);
  ctx.fill();

  // 4. Cute Paws / Arms
  const armRaise = isMouthOpen ? -8 : 0;
  ctx.fillStyle = furMain;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3;

  // Left Arm
  ctx.beginPath();
  ctx.roundRect(-31, -56 + armRaise, 12, 24, 6);
  ctx.fill();
  ctx.stroke();

  // Right Arm
  ctx.beginPath();
  ctx.roundRect(19, -56 + armRaise, 12, 24, 6);
  ctx.fill();
  ctx.stroke();

  // 5. Head & Ears
  ctx.save();
  ctx.translate(0, -86);

  // Outer Ears
  ctx.fillStyle = furMain;
  ctx.beginPath();
  ctx.moveTo(-28, -12);
  ctx.lineTo(-22, -40);
  ctx.lineTo(-6, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(28, -12);
  ctx.lineTo(22, -40);
  ctx.lineTo(6, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Pink Ears
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.moveTo(-23, -15);
  ctx.lineTo(-20, -32);
  ctx.lineTo(-10, -22);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(23, -15);
  ctx.lineTo(20, -32);
  ctx.lineTo(10, -22);
  ctx.closePath();
  ctx.fill();

  // Round Tabby Head
  ctx.fillStyle = furMain;
  ctx.beginPath();
  ctx.ellipse(0, 0, 33, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Forehead Tabby Stripes
  ctx.fillStyle = stripeColor;
  ctx.beginPath();
  ctx.roundRect(-2, -25, 4, 9, 2);
  ctx.roundRect(-10, -23, 4, 7, 2);
  ctx.roundRect(6, -23, 4, 7, 2);
  ctx.fill();

  // Eyes (Dizzy >< if hurt, Big wide cartoon eyes like your image otherwise!)
  if (isHurt) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-17, -10);
    ctx.lineTo(-9, -6);
    ctx.lineTo(-17, -2);
    ctx.moveTo(17, -10);
    ctx.lineTo(9, -6);
    ctx.lineTo(17, -2);
    ctx.stroke();
  } else {
    // Big cream/white cartoon eyeballs
    ctx.fillStyle = "#fef9c3";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-13, -7, 8, 0, Math.PI * 2);
    ctx.arc(13, -7, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(-12, -7, 3.2, 0, Math.PI * 2);
    ctx.arc(12, -7, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pink Nose
  ctx.fillStyle = "#fb7185";
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 1, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mouth (Huge open cartoon mouth like your image when fish is near/caught!)
  if (isMouthOpen) {
    ctx.fillStyle = "#7f1d1d";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 14, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pink Tongue inside mouth
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.ellipse(0, 18, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-4, 7, 4, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(4, 7, 4, 0, Math.PI);
    ctx.stroke();
  }

  // Wavy Black Whiskers (matching your sticker!)
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  // Left whiskers
  ctx.moveTo(-24, 1);
  ctx.quadraticCurveTo(-32, -3, -40, 1);
  ctx.moveTo(-24, 7);
  ctx.quadraticCurveTo(-32, 11, -40, 7);
  // Right whiskers
  ctx.moveTo(24, 1);
  ctx.quadraticCurveTo(32, -3, 40, 1);
  ctx.moveTo(24, 7);
  ctx.quadraticCurveTo(32, 11, 40, 7);
  ctx.stroke();

  ctx.restore();
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
  const catXRef = useRef(355);
  const prevCatXRef = useRef(355);
  const keysRef = useRef({ left: false, right: false });

  // Persistent refs for Stop/Continue & dynamic effects
  const itemsRef = useRef([]);
  const popupsRef = useRef([]);
  const particlesRef = useRef([]);
  const frameCountRef = useRef(0);
  const mouthOpenTimerRef = useRef(0);
  const hurtTimerRef = useRef(0);
  const shakeTimerRef = useRef(0);
  const comboRef = useRef(0);
  const caughtInRoundRef = useRef(0);

  // Reset board when starting a fresh game
  useEffect(() => {
    if (gameState === "start") {
      itemsRef.current = [];
      popupsRef.current = [];
      particlesRef.current = [];
      frameCountRef.current = 0;
      mouthOpenTimerRef.current = 0;
      hurtTimerRef.current = 0;
      shakeTimerRef.current = 0;
      comboRef.current = 0;
      caughtInRoundRef.current = 0;
      catXRef.current = 355;
      prevCatXRef.current = 355;
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

  // Main dynamic game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
    let animationId;

    function spawnParticles(x, y, colors) {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color: colors[i % colors.length],
          size: 3 + Math.random() * 3,
          life: 24,
        });
      }
    }

    function loop() {
      frameCountRef.current++;
      ctx.save();

      // Screen shake on hazard impact
      if (shakeTimerRef.current > 0) {
        shakeTimerRef.current--;
        const shakeX = (Math.random() - 0.5) * 10;
        const shakeY = (Math.random() - 0.5) * 10;
        ctx.translate(shakeX, shakeY);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move cat
      const moveSpeed = difficulty === "hard" ? 9.5 : 8;
      if (keysRef.current.left) catXRef.current -= moveSpeed;
      if (keysRef.current.right) catXRef.current += moveSpeed;
      catXRef.current = Math.max(0, Math.min(canvas.width - 90, catXRef.current));

      const isMoving = Math.abs(catXRef.current - prevCatXRef.current) > 0.5;
      prevCatXRef.current = catXRef.current;

      // Dynamic speed ramp as you catch more fish
      const speedRamp = Math.min(2.2, caughtInRoundRef.current * 0.06);
      const dynamicSpawn = Math.max(
        18,
        settings.spawnEvery - Math.floor(caughtInRoundRef.current / 4)
      );

      // Spawn fish, golden fish, boots, or fish bones
      if (frameCountRef.current % dynamicSpawn === 0) {
        const rand = Math.random();
        let type = "fish";
        if (rand < 0.16) type = "boot";
        else if (rand < 0.32) type = "bone";
        else if (rand > 0.84) type = "golden";

        itemsRef.current.push({
          x: Math.random() * (canvas.width - 50),
          y: -30,
          speed:
            (type === "golden" ? settings.baseSpeed + 1.2 : settings.baseSpeed) +
            speedRamp +
            Math.random() * settings.speedRange,
          type,
          phase: Math.random() * Math.PI * 2,
        });
      }

      let fishNearby = false;

      // Update & draw falling items
      itemsRef.current = itemsRef.current.filter((item) => {
        item.y += item.speed;
        item.phase += 0.12;

        if (item.type === "bone") {
          drawFishBone(ctx, item.x, item.y, item.phase);
        } else if (item.type === "boot") {
          drawBoot(ctx, item.x, item.y, item.phase);
        } else {
          drawFish(ctx, item.x, item.y, item.type === "golden", item.phase);
        }

        const isHazard = item.type === "boot" || item.type === "bone";

        // Open cat's big mouth when tasty fish drops nearby
        if (
          !isHazard &&
          item.y > canvas.height - 210 &&
          item.y < canvas.height - 45 &&
          Math.abs(item.x - (catXRef.current + 25)) < 85
        ) {
          fishNearby = true;
        }

        // Hitbox covers full standing cat body & head
        const hitCat =
          item.y > canvas.height - 115 &&
          item.y < canvas.height - 12 &&
          item.x > catXRef.current - 15 &&
          item.x < catXRef.current + 80;

        if (hitCat) {
          if (isHazard) {
            playHazardSound();
            comboRef.current = 0;
            hurtTimerRef.current = 25;
            shakeTimerRef.current = 12;
            setLives((prev) => prev - 1);
            spawnParticles(catXRef.current + 45, canvas.height - 75, [
              "#ef4444",
              "#fca5a5",
              "#ffffff",
            ]);
            popupsRef.current.push({
              x: catXRef.current + 12,
              y: canvas.height - 125,
              text: item.type === "bone" ? "Yuck! -1 ❤️" : "Ouch! -1 ❤️",
              color: "#f87171",
              life: 34,
            });
          } else {
            comboRef.current += 1;
            caughtInRoundRef.current += 1;
            playFishSound(item.type === "golden", comboRef.current);

            const comboMultiplier =
              comboRef.current >= 5 ? 2 : comboRef.current >= 3 ? 1.5 : 1;
            const hardBonus = difficulty === "hard" ? 5 : 0;
            const basePts =
              (item.type === "golden" ? 25 : 10) + bonusPoints + hardBonus;
            const pts = Math.round(basePts * comboMultiplier);

            onCatchFish(pts);
            mouthOpenTimerRef.current = 16;

            spawnParticles(
              catXRef.current + 45,
              canvas.height - 85,
              item.type === "golden"
                ? ["#facc15", "#fef08a", "#ffffff"]
                : ["#38bdf8", "#bae6fd", "#fef08a"]
            );

            popupsRef.current.push({
              x: catXRef.current + 18,
              y: canvas.height - 125,
              text:
                comboRef.current >= 3
                  ? `+${pts}! (${comboRef.current}x)`
                  : `+${pts}!`,
              color: item.type === "golden" ? "#facc15" : "#fef08a",
              life: 32,
            });
          }
          return false;
        }

        return item.y < canvas.height + 30;
      });

      if (mouthOpenTimerRef.current > 0) mouthOpenTimerRef.current--;
      if (hurtTimerRef.current > 0) hurtTimerRef.current--;

      // Draw full-body standing tabby cat
      drawFullTabbyCat(ctx, catXRef.current, canvas.height - 10, {
        isMouthOpen: fishNearby || mouthOpenTimerRef.current > 0,
        isHurt: hurtTimerRef.current > 0,
        walkPhase: frameCountRef.current * 0.25,
        isMoving,
      });

      // Draw burst particles
      particlesRef.current = particlesRef.current.filter((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.22;
        pt.life--;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        return pt.life > 0;
      });

      // Floating score feedback popups
      popupsRef.current = popupsRef.current.filter((p) => {
        p.y -= 1.3;
        p.life--;
        ctx.font = "bold 22px sans-serif";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 4;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
        return p.life > 0;
      });

      // Live Combo Badge in top-right corner of the game board
      if (comboRef.current >= 2) {
        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
        ctx.beginPath();
        ctx.roundRect(canvas.width - 145, 14, 130, 34, 17);
        ctx.fill();

        ctx.fillStyle = comboRef.current >= 5 ? "#facc15" : "#38bdf8";
        ctx.fillText(`🔥 ${comboRef.current}x Combo!`, canvas.width - 132, 37);
      }

      ctx.restore();
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
      Math.min(canvasRef.current.width - 90, pointerX - 45)
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
              ? "Catch fresh fish to build combos and dodge old boots & fish bones!"
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