/* Game component: blue circles (fish) fall into the orange half circle (cat) */
import { useEffect, useState } from "react";

/* Game settings (all positions are in % of the game area) */
const CAT_WIDTH = 18; // how wide the cat is
const CAT_STEP = 4; // how far the cat moves per key press
const CATCH_LINE = 84; // a fish this far down can land in the cat

/* Start values for a new game */
const startGame = {
    catX: 50,
    fish: [],
    score: 0,
    nextId: 1,
};

/* Move the cat left (-1) or right (1) */
const moveCat = (game, direction) => {
    const newX = game.catX + direction * CAT_STEP;

    // Keep the cat inside the game area
    const catX = Math.min(100 - CAT_WIDTH / 2, Math.max(CAT_WIDTH / 2, newX));

    return { ...game, catX: catX };
};

/* Add a new fish at a random spot at the top */
const addFish = (game) => {
    const newFish = {
        id: game.nextId,
        x: 5 + Math.random() * 90,
        y: 0,
    };

    return { ...game, fish: [...game.fish, newFish], nextId: game.nextId + 1 };
};

/* Move every fish down one step and check if the cat caught it */
const moveFish = (game) => {
    let { score } = game;
    const fishLeft = [];
    const speed = 0.6;

    for (const fish of game.fish) {
        const newY = fish.y + speed;

        // Is the fish above the cat, and did it just reach the catch line?
        const isAboveCat = Math.abs(fish.x - game.catX) < CAT_WIDTH / 2;
        const isAtCatchLine = fish.y < CATCH_LINE && newY >= CATCH_LINE;

        if (isAboveCat && isAtCatchLine) {
            score += 1;
        } else if (newY <= 100) {
            // Still falling
            fishLeft.push({ ...fish, y: newY });
        }
    }

    return { ...game, fish: fishLeft, score: score };
};

function FishCatCanvas() {
    /* Everything in the game lives in this one object */
    const [game, setGame] = useState(startGame);

    /* Move the fish every 20 milliseconds */
    useEffect(() => {
        const moveTimer = setInterval(() => {
            setGame((current) => moveFish(current));
        }, 20);

        // Stop the timer when the game closes
        return () => clearInterval(moveTimer);
    }, []);

    /* Drop a new fish every second */
    useEffect(() => {
        const dropTimer = setInterval(() => {
            setGame((current) => addFish(current));
        }, 1000);

        return () => clearInterval(dropTimer);
    }, []);

    /* Arrow keys (or A / D) move the cat */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft" || event.key === "a") {
                event.preventDefault();
                setGame((current) => moveCat(current, -1));
            }

            if (event.key === "ArrowRight" || event.key === "d") {
                event.preventDefault();
                setGame((current) => moveCat(current, 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="game">
            {/* Score */}
            <div className="game-info">
                <span>Score: {game.score}</span>
            </div>

            {/* The game area */}
            <div className="game-area">
                {game.fish.map((fish) => (
                    <div
                        key={fish.id}
                        className="fish"
                        style={{ left: fish.x + "%", top: fish.y + "%" }}
                    />
                ))}

                <div className="cat" style={{ left: game.catX + "%" }} />
            </div>

            <p className="controls-hint">Use the arrow keys (or A / D) to move the cat</p>
        </div>
    );
}

export default FishCatCanvas;