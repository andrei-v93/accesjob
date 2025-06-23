import React, { useState, useEffect } from 'react';
import { getUserToken, getUserData } from '../../../services/auth.js'; // importă funcțiile tale
import { Link } from 'react-router-dom';
import AngajatProfile from '../angajat-profile/AngajatProfile.jsx';
import RecruiterProfile from '../recruiter-profile/RecruiterProfile.jsx';
import "./profile-page.scss";

const API_URL = 'http://localhost:5000';

function Profile({ user: initialUser, onUserUpdate }) {
    // Încarcă userul din localStorage dacă există, altfel folosește props
    const [user, setUser] = useState(() => initialUser || getUserData());

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = getUserToken();
                if (!token) {
                    console.error('Token lipsește');
                    return;
                }

                const res = await fetch(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (res.ok) {
                    setUser(data);
                    onUserUpdate && onUserUpdate(data);
                } else {
                    console.error('Eroare profil:', data.message);
                    // Poți de asemenea să faci logout aici dacă 401
                }
            } catch (err) {
                console.error('Eroare la fetch profil:', err);
            }
        };
        fetchProfile();
    }, [onUserUpdate]);

    if (!user) return <p>Se încarcă profilul...</p>;

    return (
        <div className={"container"}>
            {user.userType === 'recruiter' && <RecruiterProfile user={user} />}
            {user.userType === 'angajat' && <AngajatProfile user={user} />}

            <Link to="/profile/edit" className="btn" style={{ marginRight: 10 }}>
                Editează profil
            </Link>
            <Link to="/home" className="btn btn-secondary">
                Înapoi
            </Link>
        </div>
    );
}

export default Profile;
