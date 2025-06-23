import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from "./FilterResultPage.module.scss";
const API_URL = import.meta.env.VITE_API_URL;

export default function FilterResultsPage({ user }) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filtre extrase din URL
    const localitate = params.get('localitate') || '';
    const domeniu = params.get('domeniu') || '';
    const disponibilitate = params.get('disponibilitate') || '';
    const disability = params.get('disability') || '';

    const [privMessage, setPrivMessage] = useState(params.get('reason') === 'recruiter_required');

    // Fetch angajati
    const fetchEmployees = async () => {
        setLoading(true);
        const query = new URLSearchParams();
        if (localitate) query.set('localitate', localitate);
        if (domeniu) query.set('domeniu', domeniu);
        if (disponibilitate) query.set('disponibilitate', disponibilitate);
        if (disability) query.set('disability', disability);

        const res = await fetch(`${API_URL}/api/auth/angajati?${query.toString()}`);
        const data = await res.json();
        setEmployees(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployees();
    }, [location.search]);

    // Extrage opțiunile unice din lista angajaților pentru fiecare filtru
    // Dacă vrei să faci un fetch separat pentru opțiuni, trebuie o rută API specială, dar pentru simplitate folosim ce avem
    const getUniqueOptions = (key) => {
        const vals = employees
            .map(emp => emp[key])
            .filter(Boolean);
        return Array.from(new Set(vals)).sort((a, b) => a.localeCompare(b));
    };

    const localitateOptions = getUniqueOptions('localitate');
    const domeniuOptions = getUniqueOptions('domeniu');
    const disponibilitateOptions = getUniqueOptions('disponibilitate');
    const disabilityOptions = getUniqueOptions('disability');

    // Schimbă filtrul: actualizează URL-ul
    const handleFilterChange = (key, val) => {
        const q = new URLSearchParams(location.search);

        if (val === '' || val === null) {
            q.delete(key);
        } else {
            q.set(key, val);
        }
        // Reset pagina sau alte parametri dacă e cazul aici

        navigate(`/filtrare?${q.toString()}`);
    };

    return (
        <div className="container pt-5">
            <div className="row">
                <aside className="col-md-3">
                    <h5>Filtrează rezultatele</h5>

                    <div className="mb-4">
                        <strong>Localitate</strong>
                        <ul className="list-unstyled">
                            <li>
                                <button
                                    className={`btn btn-sm ${localitate === '' ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                    onClick={() => handleFilterChange('localitate', '')}
                                >
                                    Toate
                                </button>
                            </li>
                            {localitateOptions.map(opt => (
                                <li key={opt}>
                                    <button
                                        className={`btn btn-sm ${localitate === opt ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                        onClick={() => handleFilterChange('localitate', opt)}
                                    >
                                        {opt}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-4">
                        <strong>Domeniu</strong>
                        <ul className="list-unstyled">
                            <li>
                                <button
                                    className={`btn btn-sm ${domeniu === '' ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                    onClick={() => handleFilterChange('domeniu', '')}
                                >
                                    Toate
                                </button>
                            </li>
                            {domeniuOptions.map(opt => (
                                <li key={opt}>
                                    <button
                                        className={`btn btn-sm ${domeniu === opt ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                        onClick={() => handleFilterChange('domeniu', opt)}
                                    >
                                        {opt}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-4">
                        <strong>Disponibilitate</strong>
                        <ul className="list-unstyled">
                            <li>
                                <button
                                    className={`btn btn-sm ${disponibilitate === '' ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                    onClick={() => handleFilterChange('disponibilitate', '')}
                                >
                                    Toate
                                </button>
                            </li>
                            {disponibilitateOptions.map(opt => (
                                <li key={opt}>
                                    <button
                                        className={`btn btn-sm ${disponibilitate === opt ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                        onClick={() => handleFilterChange('disponibilitate', opt)}
                                    >
                                        {opt}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-4">
                        <strong>Dizabilitate</strong>
                        <ul className="list-unstyled">
                            <li>
                                <button
                                    className={`btn btn-sm ${disability === '' ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                    onClick={() => handleFilterChange('disability', '')}
                                >
                                    Toate
                                </button>
                            </li>
                            {disabilityOptions.map(opt => (
                                <li key={opt}>
                                    <button
                                        className={`btn btn-sm ${disability === opt ? 'btn-primary' : 'btn-outline-primary'} mb-1`}
                                        onClick={() => handleFilterChange('disability', opt)}
                                    >
                                        {opt}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
                <main className="col-md-9">
                    {privMessage && <div className="alert alert-warning">Trebuie să ai cont tip recruiter pentru a vedea detaliile angajaților.</div>}
                    {loading ? <div>Loading...</div> : (
                        <div className="row">
                            {employees.map(emp => (
                                <div key={emp._id} className="col-lg-4 mb-4">
                                    <Link
                                        to={user?.userType === 'recruiter' ? `/angajat/${emp._id}` : '/login?reason=recruiter_required'}
                                        className={`${styles.employeeCard} border rounded-1 p-4 text-decoration-none shadow-sm d-flex flex-column align-items-start gap-3 bg-white text-dark h-100`}
                                    >
                                        <div className="d-flex flex-row align-items-center justify-content-between w-100">
                                            <div className={`${styles.cardImage} d-flex flex-row shadow border rounded-1 overflow-hidden`}>
                                                <img
                                                    src={emp.pozaUrl ? `http://localhost:5000${emp.pozaUrl}` : 'images/account-placeholder.jpeg'}
                                                    alt={emp.name}
                                                />
                                            </div>
                                            <span className={`${styles.cardButtonIcon} material-symbols-outlined border p-1 shadow rounded-1 fs-16`}>
                                                north_east
                                            </span>
                                        </div>
                                        <div className="d-flex flex-column align-items-start gap-0-5">
                                            <div className={`${styles.cardSubtitle} fs-12 fw-bold text-uppercase text-muted`}>
                                                Web Developer
                                            </div>
                                            <h3 className={`${styles.cardTitle} m-0 fs-18`}>{emp.name}</h3>
                                        </div>
                                        <p className="card-description">
                                            Lorem ipsum dolor amet consectetur adipiscing elitsed eiusmod tempor.
                                        </p>
                                        <div className="d-flex flex-row align-items-center gap-1 flex-wrap mt-auto mb-0">
                                            {emp.domeniu && (
                                                <span
                                                    className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1"
                                                    title={`Domeniu: ${emp.domeniu}`}
                                                >
                                                    <span className="material-symbols-outlined fs-12">work</span>
                                                    {emp.domeniu}
                                                </span>
                                            )}
                                            {emp.localitate && (
                                                <span className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1"
                                                      title={`Localitate: ${emp.localitate}`}>
                                                    <span className="material-symbols-outlined fs-12">location_on</span>
                                                    {emp.localitate}
                                                </span>
                                            )}
                                            {emp.disponibilitate && (
                                                <span className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1"
                                                      title={`Disponibilitate: ${emp.disponibilitate}`}>
                                                    <span className="material-symbols-outlined fs-12">home_work</span>
                                                    {emp.disponibilitate}
                                                </span>
                                            )}
                                            {emp.disability && (
                                                <span className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1"
                                                      title={`Dizabilitate: ${emp.disability}`}>
                                                    <span className="material-symbols-outlined fs-12">accessibility</span>
                                                    {emp.disability}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
