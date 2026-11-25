import { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import { getCurrentUser, logOut } from "./Utils/localStorageAuth";
//import "./App.css";

function App() {

    /* Logged in user (null = show login) */
    const [user, setUser] = useState(getCurrentUser());

    if (!user) {
        return <LoginScreen setUser={setUser} />;
    }

    return (
        <div>
            <h1>Welcome, {user.username}!</h1>
            <p>Game coming soon...</p>
            <button onClick={() => { logOut(); setUser(null); }}>Log out</button>
        </div>
    );
}

export default App;
