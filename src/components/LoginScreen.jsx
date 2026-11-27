/* Authentication component */
import { useState } from "react";
import { logIn, signUp } from "../Utils/localStorageAuth";
import "../../styles/login.css"

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
        <div className="login">
            <div className="login__card">
                <header className="login__header">
                    <h2 className="login__title">{isLogin ? "Log in" : "Sign Up"}</h2>
                </header>

                <main className="login__body">

                    {/* add logo or game name */}

                    <form onSubmit={handleSubmit} className="login__form">
                        <input
                            className="login__input"
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />

                        <input
                            className="login__input"
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />

                        {!isLogin && (
                            <input
                                className="login__input"
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        )}

                        <button className="login__button" type="submit">
                            {isLogin ? "Login" : "Sign Up"}
                        </button>
                    </form>

                    <section className="login__altpage">
                        <p className="login__prompt">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </p>

                        <button
                            type="button"
                            className="login__button login__button--toggle"
                            onClick={() => setIsLogin((current) => !current)}
                        >
                            {isLogin
                                ? "Sign up"
                                : "Log in"}
                        </button>
                    </section>

                </main>

            </div>
        </div>
    );
}

export { LoginScreen };
export default LoginScreen;
