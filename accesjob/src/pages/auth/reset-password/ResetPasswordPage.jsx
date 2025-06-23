// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./reset-password-page.scss";

function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async e => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
                password: newPassword,
            });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Eroare server.');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h2>Setează o nouă parolă</h2>
            <form onSubmit={handleReset}>
                <input
                    type="password"
                    placeholder="Parola nouă"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: 8, marginBottom: 10 }}
                />
                <button type="submit" style={{ padding: 10, width: '100%' }}>Resetează parola</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default ResetPasswordPage;
