import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './login-form-page.scss';

function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({ email: false, password: false });
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isEmailValid = email.includes('@');
    const isPasswordValid = password.length >= 6;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isEmailValid || !isPasswordValid) {
            setTouched({ email: true, password: true });
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Eroare la autentificare');

            onLogin(data, rememberMe);
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleShowPassword = () => setShowPassword(prev => !prev);

    return (
        <form className="login-form needs-validation" noValidate onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                    type="email"
                    id="email"
                    className={`form-control ${touched.email ? (isEmailValid ? 'is-valid' : 'is-invalid') : ''}`}
                    value={email}
                    required
                    autoComplete="email"
                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <div className="invalid-feedback">Te rugăm să introduci un email valid.</div>
            </div>

            <div className="mb-3">
                <label htmlFor="password" className="form-label">Parolă</label>
                <div className="input-group">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className={`form-control ${touched.password ? (isPasswordValid ? 'is-valid' : 'is-invalid') : ''}`}
                        value={password}
                        required
                        autoComplete="current-password"
                        onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={toggleShowPassword}
                        tabIndex={-1}
                        aria-label={showPassword ? "Ascunde parola" : "Afișează parola"}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>
                <div className="invalid-feedback">Parola trebuie să aibă minim 6 caractere.</div>
            </div>

            <div className="form-check mb-3">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rememberMe">Ține-mă minte</label>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
                <Link to="/forgot-password" className="small">Ai uitat parola?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-100">Conectează-te</button>
        </form>
    );
}

export default LoginForm;
