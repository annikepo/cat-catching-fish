import { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import FishCatCanvas from "./components/FishCatCanvas";
import { getCurrentUser, logOut } from "./Utils/localStorageAuth";
import "./App.css";

function App() {

    /* Logged in user (null = show login) */
    const [user, setUser] = useState(getCurrentUser());

    /* Which screen to show: "menu" or "playing" */
    const [screen, setScreen] = useState("menu");

    if (!user) {
        return <LoginScreen setUser={setUser} />;
    }

    /* Log out and go back to the login screen */
    const handleLogOut = () => {
        logOut();
        setUser(null);
        setScreen("menu");
    };

    return (
        <div className="app">
            {/* Top bar */}
            <header className="app-header">
                <h1>Purrfect Catch</h1>
                <div>
                    {user.username}{" "}
                    {screen !== "playing" && (
                        <button type="button" className="secondary-button" onClick={handleLogOut}>
                            Log out
                        </button>
                    )}
                </div>
            </header>

            {/* Start menu */}
            {screen === "menu" && (
                <div className="card">
                    <div className="cat-icon" />
                    <h2>Welcome, {user.username}!</h2>

                    <button type="button" onClick={() => setScreen("playing")}>
                        Start game
                    </button>
                </div>
            )}

            {/* The game */}
            {screen === "playing" && <FishCatCanvas />}
        </div>
    );
}

export default App;
