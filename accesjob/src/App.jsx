import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getUserData, saveUserData, clearUserData } from './services/auth';
import { AnimatePresence } from 'framer-motion';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/Header/Header';
import LoginPage from './pages/auth/login/LoginPage.jsx';
import RegisterPage from './pages/auth/register/RegisterPage.jsx';
import HomePage from './pages/homepage/HomePage.jsx';
import ProfilePage from './pages/profile/main/Profile.jsx';
import ProfileEdit from './pages/profile/profile-edit/ProfileEdit.jsx';
import ForgotPasswordPage from './pages/auth/forgot-password/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/reset-password/ResetPasswordPage.jsx';
import ViewEmployeePage from './pages/view-employee/ViewEmployeePage.jsx';
import About from './pages/about-us/AboutPage.jsx';
import FilterResultsPage from './pages/filter-results/FilterResultsPage.jsx';
import MessagesPage from './pages/messages/MessagesPage.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


function App() {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const savedUser = getUserData();

        if (!token) {
            // Nu avem token, clar nu suntem logați
            setLoadingUser(false);
            setUser(null);
            return;
        }

        if (savedUser && savedUser.name) {
            // Avem user și token în localStorage -> setăm user
            setUser(savedUser.user ? savedUser.user : savedUser);
            setLoadingUser(false);
            return;
        }

        // Avem token dar NU user-ul în localStorage → fetch /me să-l obținem
        fetch(`${API_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    // Token invalid sau expirat → clear și deloghează
                    clearUserData();
                    setUser(null);
                    setLoadingUser(false);
                    throw new Error('Token invalid sau expirat');
                }
                const data = await res.json();
                return data;
            })
            .then((data) => {
                // Salvează user și token local
                const normalizedUser = data.user ? data.user : data;
                saveUserData({ user: normalizedUser, token });
                setUser(normalizedUser);
                setLoadingUser(false);
            })
            .catch((err) => {
                setLoadingUser(false);
            });
    }, []);

    const handleLogin = (data, rememberMe) => {
        const token = data.token;
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
        saveUserData(data.user || data);
        setUser(data.user || data);
    };

    const handleLogout = () => {
        clearUserData();
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
    };

    if (loadingUser) {
        return <div>Loading...</div>; // spinner sau ceva
    }

    return (
        <>
            <SocketProvider user={user}>
                <NotificationProvider user={user}>
                    <Header user={user} onLogout={handleLogout} />
                    <main>
                        <AnimatePresence mode="wait">
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        user
                                            ? user.userType === 'angajat'
                                                ? <Navigate to="/profile" />
                                                : <Navigate to="/home" />
                                            : <Navigate to="/home" />
                                    }
                                />
                                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/home" element={<HomePage user={user} />} />
                                <Route path="/profile" element={<ProfilePage user={user} onUserUpdate={setUser} />} />
                                <Route path="/profile/edit" element={<ProfileEdit user={user} onUserUpdate={setUser} />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                                <Route path="/angajat/:id" element={<ViewEmployeePage user={user} />} />
                                <Route path="/despre-noi" element={<About />} />
                                <Route path="/filtrare" element={<FilterResultsPage user={user} />} />
                                <Route path="/mesaje" element={<MessagesPage user={user} />} />
                            </Routes>
                        </AnimatePresence>
                    </main>
                </NotificationProvider>
            </SocketProvider>
        </>
    );
}

export default App;
