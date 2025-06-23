import React, { useState, useEffect, useRef } from 'react';
import { getUserToken } from '../../../services/auth.js';
import { Link, useNavigate } from 'react-router-dom';
import AngajatProfileEditFields from '../../../components/forms/profile/AngajatProfileEditFields.jsx';
import RecruiterProfileEditFields from '../../../components/forms/profile/RecruiterProfileEditFields.jsx';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './profile-edit-page.scss';

const localitatiByJudet = {
    Prahova: ['Ploiești', 'Câmpina', 'Vălenii de Munte'],
    Alba: ['Alba Iulia', 'Blaj', 'Sebeș'],
    Bucuresti: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'],
};

const isFieldFilled = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '';
};

function RichTextEditor({ value, onChange }) {
    const quillRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        quillRef.current = new Quill(containerRef.current, {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['link', 'blockquote', 'code-block'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['clean'],
                ],
            },
        });

        quillRef.current.root.innerHTML = value;

        quillRef.current.on('text-change', () => {
            onChange(quillRef.current.root.innerHTML);
        });

        return () => {
            quillRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (quillRef.current && quillRef.current.root.innerHTML !== value) {
            quillRef.current.root.innerHTML = value;
        }
    }, [value]);

    return <div ref={containerRef} style={{ minHeight: '150px', marginBottom: '20px' }} />;
}

function ProfileEdit({ user, onUserUpdate }) {
    const token = getUserToken();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [tara, setTara] = useState('');
    const [judet, setJudet] = useState('');
    const [localitate, setLocalitate] = useState('');
    const [disability, setDisability] = useState('');
    const [skills, setSkills] = useState('');
    const [domeniu, setDomeniu] = useState('');
    const [pozitie, setPozitie] = useState('');
    const [disponibilitate, setDisponibilitate] = useState('');
    const [poza, setPoza] = useState(null);
    const [cv, setCv] = useState(null);
    const [company, setCompany] = useState('');
    const [companyDomain, setCompanyDomain] = useState('');
    const [companyPosition, setCompanyPosition] = useState('');
    const [localitatiDisponibile, setLocalitatiDisponibile] = useState([]);
    const [userType, setUserType] = useState('angajat');

    const [descriere, setDescriere] = useState('');
    const [experienta, setExperienta] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;

            try {
                const res = await fetch('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error('Eroare la încărcarea profilului');

                const userData = await res.json();

                const names = userData.name?.trim().split(' ') || ['', ''];
                setFirstName(names[0]);
                setLastName(names.slice(1).join(' '));
                setEmail(userData.email || '');
                setPhone(userData.phone || '');
                setTara(userData.tara || '');
                setJudet(userData.judet || '');
                setLocalitate(userData.localitate || '');
                setDisability(userData.disability || '');
                setSkills(userData.skills?.join(', ') || '');
                setDomeniu(userData.domeniu || '');
                setPozitie(userData.pozitie || '');
                setDisponibilitate(userData.disponibilitate || '');
                setCompany(userData.company || '');
                setCompanyDomain(userData.companyDomain || '');
                setCompanyPosition(userData.companyPosition || '');
                setUserType(userData.userType || 'angajat');
                setDescriere(userData.descriere || '');
                setExperienta(userData.experienta || '');
            } catch (err) {
                console.error(err.message);
                alert('Nu s-au putut încărca datele profilului.');
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const loc = localitatiByJudet[judet] || [];
        setLocalitatiDisponibile(loc);
        if (!loc.includes(localitate)) setLocalitate('');
    }, [judet]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return alert('Nu ești autentificat!');

        const formData = new FormData();
        formData.append('name', `${firstName.trim()} ${lastName.trim()}`.trim());
        formData.append('email', email.trim());
        formData.append('phone', phone.trim());
        formData.append('tara', tara.trim());
        formData.append('judet', judet);
        formData.append('localitate', localitate);

        if (userType === 'angajat') {
            formData.append('disability', disability);
            const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
            formData.append('skills', skills);
            formData.append('domeniu', domeniu.trim());
            formData.append('pozitie', pozitie.trim());
            formData.append('disponibilitate', disponibilitate);

            formData.append('descriere', descriere);
            formData.append('experienta', experienta);

            if (cv) formData.append('cv', cv);
        }

        if (userType === 'recruiter') {
            formData.append('company', company.trim());
            formData.append('companyDomain', companyDomain.trim());
            formData.append('companyPosition', companyPosition.trim());
        }

        if (poza) formData.append('poza', poza);

        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error((await res.json()).message || 'Eroare la actualizare profil');

            const updatedUser = await res.json();

            if (typeof onUserUpdate === 'function') {
                onUserUpdate(updatedUser);
            }

            navigate('/profile');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto' }}>
            <h2>Editează profilul</h2>

            <label>Prenume:</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <small>{isFieldFilled(firstName) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Nume:</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <small>{isFieldFilled(lastName) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <small>{isFieldFilled(email) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Telefon:</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <small>{isFieldFilled(phone) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Țară:</label>
            <input type="text" value={tara} onChange={(e) => setTara(e.target.value)} />
            <small>{isFieldFilled(tara) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Județ:</label>
            <select value={judet} onChange={(e) => setJudet(e.target.value)} required>
                <option value="">Selectează județ</option>
                {Object.keys(localitatiByJudet).map((j) => (
                    <option key={j} value={j}>
                        {j}
                    </option>
                ))}
            </select>

            <label>Localitate:</label>
            <select value={localitate} onChange={(e) => setLocalitate(e.target.value)} required disabled={!judet}>
                <option value="">Selectează localitate</option>
                {localitatiDisponibile.map((loc) => (
                    <option key={loc} value={loc}>
                        {loc}
                    </option>
                ))}
            </select>

            {userType === 'angajat' && (
                <AngajatProfileEditFields
                    disability={disability}
                    setDisability={setDisability}
                    skills={skills}
                    setSkills={setSkills}
                    domeniu={domeniu}
                    setDomeniu={setDomeniu}
                    pozitie={pozitie}
                    setPozitie={setPozitie}
                    disponibilitate={disponibilitate}
                    setDisponibilitate={setDisponibilitate}
                    cv={cv}
                    setCv={setCv}
                />
            )}

            {userType === 'recruiter' && (
                <RecruiterProfileEditFields
                    company={company}
                    setCompany={setCompany}
                    companyDomain={companyDomain}
                    setCompanyDomain={setCompanyDomain}
                    companyPosition={companyPosition}
                    setCompanyPosition={setCompanyPosition}
                />
            )}

            <label>Descriere personală:</label>
            <RichTextEditor value={descriere} onChange={setDescriere} />

            <label>Experiență profesională:</label>
            <RichTextEditor value={experienta} onChange={setExperienta} />

            <label>Poza profil:</label>
            <input type="file" accept="image/*" onChange={(e) => setPoza(e.target.files[0])} />

            <button type="submit" style={{ marginTop: 20 }}>
                Salvează
            </button>
            <Link to="/profile" style={{ marginLeft: 10 }}>
                Anulează
            </Link>
        </form>
    );
}

export default ProfileEdit;
