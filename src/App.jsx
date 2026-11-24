import { useState, useEffect, useCallback } from "react";
import LoginScreen from "./components/LoginScreen";
import ApiChallengePanel from "./components/ApiChallengePanel";
import FishCatCanvas from "./components/FishCatCanvas";
import LeaderboardModal from "./components/LeaderboardModal";
import {
  getCurrentUser,
  logOut,
  updateUserHighScore,
} from "./Utils/localStorageAuth";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  // "start" | "playing" | "paused" | "gameover"
  const [gameState, setGameState] = useState("start");
  const [difficulty, setDifficulty] = useState("medium");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [fishCaught, setFishCaught] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [apiChallenge, setApiChallenge] = useState({
    type: "POINTS_BOOST",
    bonusPerFish: 0,
    targetFish: 0,
    rewardPoints: 0,
  });
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  // Award API sprint bonus when target fish count is reached
  useEffect(() => {
    if (
      gameState === "playing" &&
      !challengeCompleted &&
      apiChallenge.type === "FISH_SPRINT" &&
      fishCaught >= apiChallenge.targetFish
    ) {
      setChallengeCompleted(true);
      setScore((prev) => prev + apiChallenge.rewardPoints);
    }
  }, [fishCaught, gameState, challengeCompleted, apiChallenge]);

  // Trigger Game Over and save high score to localStorage
  useEffect(() => {
    if (lives <= 0 && gameState === "playing") {
      setGameState("gameover");
      if (user) {
        const updatedUser = updateUserHighScore(user.username, score);
        if (updatedUser) setUser({ ...updatedUser });
      }
    }
  }, [lives, gameState, score, user]);

  const handleCatchFish = useCallback((points) => {
    setScore((prev) => prev + points);
    setFishCaught((prev) => prev + 1);
  }, []);

  const handleDeductPoints = useCallback((penalty) => {
    setScore((prev) => Math.max(0, prev - penalty));
  }, []);

  function handleStartGame() {
    setScore(0);
    setLives(3);
    setFishCaught(0);
    setChallengeCompleted(false);
    setGameState("start");
    // Brief tick resets canvas items before switching to "playing"
    setTimeout(() => setGameState("playing"), 0);
  }

  function handleFinishGame() {
    setGameState("gameover");
    if (user) {
      const updatedUser = updateUserHighScore(user.username, score);
      if (updatedUser) setUser({ ...updatedUser });
    }
    }

  if (!user) {
    return <LoginScreen setUser={setUser} />;
  }

  return (
    <div className="app-wrapper">
      <header className="hud-bar">
        <div>
          <strong>Player:</strong> {user.username} |{" "}
          <strong>Best:</strong> {user.highScore || 0}
        </div>

        <div className="hud-stats">
          <span>Score: {score}</span>
          <span>Lives: {"❤️".repeat(Math.max(0, lives))}</span>
          <span className="level-badge">
            {difficulty.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {gameState === "playing" && (
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => setGameState("paused")}
            >
              ⏸ Stop
            </button>
          )}
          {gameState === "paused" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setGameState("playing")}
            >
              ▶ Continue
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowLeaderboard(true)}
          >
            🏆 Ranks
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              logOut();
              setUser(null);
              setGameState("start");
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <ApiChallengePanel
        fishCaught={fishCaught}
        challengeCompleted={challengeCompleted}
        onSetChallenge={(newChallenge) => {
          setApiChallenge(newChallenge);
          setChallengeCompleted(false);
        }}
      />

   <FishCatCanvas
  gameState={gameState}
  onStartGame={handleStartGame}
  onResumeGame={() => setGameState("playing")}
  difficulty={difficulty}
  onChangeDifficulty={setDifficulty}
  score={score}
  onCatchFish={handleCatchFish}
  onDeductPoints={handleDeductPoints}
  setLives={setLives}
  bonusPoints={apiChallenge.bonusPerFish}
/>

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentUsername={user.username}
      />
    </div>
  );
}

export default App;