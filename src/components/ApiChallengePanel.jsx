import { useState, useEffect } from "react";

export default function ApiChallengePanel({
  fishCaught,
  challengeCompleted,
  onSetChallenge,
}) {
  const [fact, setFact] = useState("Loading daily cat wisdom...");
  const [challengeText, setChallengeText] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchApiChallenge() {
    setLoading(true);
    try {
      const response = await fetch("https://catfact.ninja/fact");
      const data = await response.json();
      const fetchedFact = data.fact;
      setFact(fetchedFact);

      // Dynamically update game rules based on the API response
      if (fetchedFact.length > 95) {
        setChallengeText("Long Fact Frenzy: +5 extra points per fish caught!");
        onSetChallenge({
          type: "POINTS_BOOST",
          bonusPerFish: 5,
          targetFish: 0,
          rewardPoints: 0,
        });
      } else {
        setChallengeText("Quick Fact Sprint: Catch 5 fish to earn a +50 pt bonus!");
        onSetChallenge({
          type: "FISH_SPRINT",
          bonusPerFish: 0,
          targetFish: 5,
          rewardPoints: 50,
        });
      }
    } catch {
      setFact("Cats spend 70% of their lives sleeping—stay alert for falling fish!");
      setChallengeText("Offline Quest: Catch 5 fish to earn a +50 pt bonus!");
      onSetChallenge({
        type: "FISH_SPRINT",
        bonusPerFish: 0,
        targetFish: 5,
        rewardPoints: 50,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApiChallenge();
  }, []);

  return (
    <section className="api-panel">
      <div className="api-details">
        <span className="api-badge">LIVE CAT API</span>
        <p className="api-fact">"{fact}"</p>
        <p className="api-quest">
          <strong>Active Challenge:</strong> {challengeText}{" "}
          {challengeCompleted ? "✅ Completed!" : `(Progress: ${fishCaught} fish)`}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={fetchApiChallenge}
        disabled={loading}
      >
        {loading ? "Fetching..." : "New API Challenge"}
      </button>
    </section>
  );
}