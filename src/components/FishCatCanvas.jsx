/* Game component: blue circles (fish) fall into the orange half circle (cat) */
import { useEffect, useState } from "react";

/* Game settings (all positions are in % of the game area) */
const CAT_WIDTH = 18; // how wide the cat is
const CAT_STEP = 4; // how far the cat moves per key press

/* Start values for a new game */
const startGame = {
    catX: 50,
};

/* Move the cat left (-1) or right (1) */
const moveCat = (game, direction) => {
    const newX = game.catX + direction * CAT_STEP;

    // Keep the cat inside the game area
    const catX = Math.min(100 - CAT_WIDTH / 2, Math.max(CAT_WIDTH / 2, newX));

    return { ...game, catX: catX };
};

function FishCatCanvas() {
    /* Everything in the game lives in this one object */
    const [game, setGame] = useState(startGame);

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
            {/* The game area */}
            <div className="game-area">
                <div className="cat" style={{ left: game.catX + "%" }} />
            </div>

            <p className="controls-hint">Use the arrow keys (or A / D) to move the cat</p>
        </div>
    );
}

export default FishCatCanvas;