/* Authentication component */
import { useState } from "react";
import { logIn, signUp } from "../Utils/localStorageAuth";

function LoginScreen({ setUser }) {
    /* Form state */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    /* Form submission */
    const handleSubmit = (event) => {
        event.preventDefault();

        if (!username || !password || (!isLogin && !email)) {
            alert("Please fill in all fields");
            return;
        }

        if (isLogin) {
            const user = logIn(username, password);

            if (user) {
                setUser(user);
            } else {
                alert("Incorrect username or password");
            }
        } else {
            const newUser = signUp(username, password, email);

            if (newUser) {
                setUser(newUser);
            } else {
                alert("That username is already taken");
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? "Login" : "Sign Up"}</h2>

                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />

                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />

                    {!isLogin && (
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    )}

                    <button type="submit">
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <button
                    type="button"
                    className="toggle-auth"
                    onClick={() => setIsLogin((current) => !current)}
                >
                    {isLogin
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Login"}
                </button>
            </div>
        </div>
    );
}

export { LoginScreen };
export default LoginScreen;
