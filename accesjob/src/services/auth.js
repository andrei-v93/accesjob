// src/services/auth.js

export function saveUserData(userWithToken) {
    // userWithToken poate fi { user, token } sau doar user (fără token)
    if (!userWithToken) return;

    // Daca e obiect cu user + token
    if (userWithToken.token && userWithToken.user) {
        localStorage.setItem('userData', JSON.stringify(userWithToken.user));
        localStorage.setItem('token', userWithToken.token);
    } else if (userWithToken.token) {
        localStorage.setItem('token', userWithToken.token);
    } else {
        // Doar user object
        localStorage.setItem('userData', JSON.stringify(userWithToken));
    }
}

export function getUserToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}


export function getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

export function clearUserData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
}
