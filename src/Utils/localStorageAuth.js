/* Local storage authentication helpers */

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

/* Get all saved users */
export const getUsers = () => {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
};

/* Create a new user */
export const signUp = (username, password, email) => {
    const users = getUsers();

    // Stop duplicate usernames
    if (users[username]) {
        return null;
    }

    const newUser = { username, password, email };
    users[username] = newUser;

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return newUser;
};

/* Log in an existing user */
export const logIn = (username, password) => {
    const users = getUsers();
    const storedUser = users[username];

    // Verify login credentials
    if (storedUser && storedUser.password === password) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(storedUser));
        return storedUser;
    }

    return null;
};

/* Get the logged in user (keeps you logged in after refresh) */
export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
};

/* Log out */
export const logOut = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};