import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterForm from '../../../components/forms/auth/register/RecruiterForm.jsx';
import AngajatForm from '../../../components/forms/auth/register/AngajatForm.jsx';
import "./register-page.scss";

function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState(null); // null la început
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: '',
        disability: '',
        skills: '',
    });

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const payload = {
            userType,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            company: userType === 'recruiter' ? formData.company : undefined,
            disability: userType === 'angajat' ? formData.disability : undefined,
            skills: userType === 'angajat' ? formData.skills : undefined,
        };

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Înregistrare reușită! Poți face login acum.');
                navigate('/login');
            } else {
                alert('Eroare: ' + data.message);
            }
        } catch (err) {
            alert('Eroare la conectarea cu serverul.');
        }
    };

    // Pasul 1: selectare tip cont
    if (step === 1) {
        return (
            <div>
                <h2>Alege tipul contului</h2>
                <button
                    onClick={() => {
                        setUserType('angajat');
                        setStep(2);
                    }}
                >
                    Angajat
                </button>
                <button
                    onClick={() => {
                        setUserType('recruiter');
                        setStep(2);
                    }}
                >
                    Recruiter
                </button>
                <p>
                    Ai deja cont? <button onClick={() => navigate('/login')}>Loghează-te</button>
                </p>
            </div>
        );
    }

    // Pasul 2: formular în funcție de userType
    return (
        <div>
            {userType === 'angajat' ? (
                <AngajatForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                />
            ) : (
                <RecruiterForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                />
            )}
            <button onClick={() => setStep(1)}>Înapoi la selecție</button>
        </div>
    );
}

export default RegisterPage;
