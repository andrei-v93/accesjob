// src/components/Header.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './header-component.scss';
import defaultAvatar from '/images/account-placeholder.jpeg';

function Header({ user, onLogout }) {
    const navigate = useNavigate();
    const currentPage = useLocation().pathname;

    if (currentPage === '/login' || currentPage === '/register') return null;

    const firstName = user?.name?.split(' ')[0] || 'Utilizator';
    const userImage = user?.pozaUrl
        ? `http://localhost:5000${user.pozaUrl}`
        : defaultAvatar;

    return (
        <header className="header position-relative w-100 top-0 start-0 z-3">
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <Link to="/home" className="navbar-brand logo">AccesJob</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-lg-end" id="navbarNavAltMarkup">
                        <div className="navbar-nav align-items-center gap-3">
                            <Link to="/despre-noi" className="nav-link">Despre noi</Link>

                            {user ? (
                                <div className="dropdown">
                                    <button
                                        className="btn dropdown-toggle d-flex align-items-center gap-2"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={userImage} alt="avatar" width="32" height="32" className="rounded-circle" />
                                        <span>Salut, {firstName}</span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><Link className="dropdown-item" to="/profile">Profil</Link></li>
                                        <li><Link className="dropdown-item" to="/profile/edit">Editare profil</Link></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => {
                                                    sessionStorage.setItem("logoutSuccess", "1");
                                                    onLogout();
                                                    navigate('/home');
                                                }}
                                            >
                                                Deconectare
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-outline-primary">Login</Link>
                                    <Link to="/register" className="btn btn-primary">Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
