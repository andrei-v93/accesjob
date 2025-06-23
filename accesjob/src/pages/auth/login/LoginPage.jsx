import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginSlider from '../../../components/carousel/login-slider/LoginSlider.jsx';
import { Link } from 'react-router-dom';
import PageWrapper from '../../../components/motion/PageWrapper.jsx';
import LoginForm from '../../../components/forms/auth/login/LoginForm.jsx';
import './login-page.module.scss';

function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const reason = queryParams.get('reason');

    const handleLogin = (data, rememberMe) => {
        onLogin(data);

        const token = data.token;

        // Salvăm tokenul fie în localStorage, fie în sessionStorage
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }

        const user = data.user || data;
        if (user.userType === 'angajat') {
            navigate('/profile');
        } else {
            navigate('/home');
        }
    };

    return (
        <PageWrapper>
            <div className="row m-0 p-2 py-lg-4 px-lg-3">
                <div className="col-lg-6">
                    <div className="d-flex flex-column justify-content-between align-items-start h-100">
                        <div className="logo border border-black rounded-pill d-block px-4 py-2 fw-light fs-3" onClick={() => navigate('/home')}>AccesJob</div>
                        <div className="d-flex flex-column mx-auto">
                            <h1 className="fw-bold">Conectează-te</h1>
                            <p className="fw-medium lh-1">Te rugăm să te conectezi pentru a continua.</p>
                            {reason === 'recruiter_required' && (
                                <div className="alert alert-warning mt-3 w-100" role="alert">
                                    Trebuie să deții un cont de recruiter pentru a putea comunica cu angajații.
                                </div>
                            )}
                            <LoginForm onLogin={handleLogin}/>
                        </div>
                        <div className="d-flex flex-row justify-content-between align-items-center w-100">
                            <div className="d-flex flex-row align-items-center">
                                <p className="fw-medium text-secondary lh-1 m-0">Nu ai cont?
                                </p>
                                <Link to="/register"
                                      className="btn btn-link text-secondary fw-medium p-0 fs-14 lh-1">Înregistrează-te</Link>
                            </div>
                            <Link to="#" className="btn btn-link fw-bold text-secondary p-0 fs-14 lh-">Termeni și
                                Condiții</Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 h-100">
                    {/*<LoginSlider/>*/}
                    <img src="/images/auth/login-1.jpg" alt="Login Background" className="w-100 h-100 object-fit-cover rounded-4" />
                </div>
            </div>
        </PageWrapper>
    );
}

export default LoginPage;
