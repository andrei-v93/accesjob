import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PageWrapper from '../../components/motion/PageWrapper.jsx';
import MainSlider from '../../components/carousel/main-slider/MainSlider.jsx';
import FilterPopOver from '../../components/filters/FilterPopOver.jsx';
import styles from './HomePage.module.scss';

const API_URL = import.meta.env.VITE_API_URL;

function HomePage({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutBadge, setShowLogoutBadge] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/angajati`);
                const data = await res.json();
                setEmployees(data);
            } catch (err) {
                console.error("Eroare la încărcarea angajaților:", err);
            } finally {
                setTimeout(() => setLoading(false), 1000);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (sessionStorage.getItem("logoutSuccess") === "1") {
            setShowLogoutBadge(true);
            sessionStorage.removeItem("logoutSuccess");
            const timeout = setTimeout(() => setShowLogoutBadge(false), 10000);
            return () => clearTimeout(timeout);
        }
    }, []);

    if (loading) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border" role="status" />
                <p className="mt-2">Se încarcă angajații...</p>
            </div>
        );
    }

    return (
        <PageWrapper>
            <div className="pt-5">

                {/* ✅ Afișare badge logout */}
                {showLogoutBadge && (
                    <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
                        <div className="toast show align-items-center text-bg-success border-0">
                            <div className="d-flex">
                                <div className="toast-body">
                                    Te-ai delogat cu succes!
                                </div>
                                <button type="button" className="btn-close btn-close-white me-2 m-auto"
                                        onClick={() => setShowLogoutBadge(false)} />
                            </div>
                        </div>
                    </div>
                )}


                <MainSlider employees={employees} />

                <div className="container">
                    <div className={"position-relative d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between my-3 my-lg-6 gap-1-5"}>
                        <h2 className="m-0 fs-18 fw-bold">Caută angajați după:</h2>
                        <div className="d-flex flex-wrap gap-1-5 gap-lg-3">
                            <FilterPopOver label="Localitate" filterKey="localitate" employees={employees} icon={"location_on"} />
                            <FilterPopOver label="Domeniu" filterKey="domeniu" employees={employees} icon={"work"} />
                            <FilterPopOver label="Disponibilitate" filterKey="disponibilitate" employees={employees} icon={"home_work"} />
                            <FilterPopOver label="Dizabilitate" filterKey="disability" employees={employees} icon={"accessibility"} />
                        </div>
                    </div>

                    <div className="row">
                        {employees.slice(0, 9).map(emp => {
                            const isRecruiter = user?.userType === 'recruiter';
                            const target = isRecruiter ? `/angajat/${emp._id}` : `/login?reason=recruiter_required`;

                            return (
                                <div className="col-md-6 col-lg-4 mb-4" key={emp._id}>
                                    <Link to={target} className={`${styles.employeeCard} border rounded-1 p-4 text-decoration-none shadow-sm d-flex flex-column align-items-start gap-3 bg-white text-dark h-100`}>
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
                                                <span className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1" title={`Domeniu: ${emp.domeniu}`}>
                                                    <span className="material-symbols-outlined fs-12">work</span>
                                                    {emp.domeniu}
                                                </span>
                                            )}
                                            {emp.localitate && (
                                                <span className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1" title={`Localitate: ${emp.localitate}`}>
                                                    <span className="material-symbols-outlined fs-12">location_on</span>
                                                    {emp.localitate}
                                                </span>
                                            )}
                                            {emp.disponibilitate && (
                                                <span className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1" title={`Disponibilitate: ${emp.disponibilitate}`}>
                                                    <span className="material-symbols-outlined fs-12">home_work</span>
                                                    {emp.disponibilitate}
                                                </span>
                                            )}
                                            {emp.disability && (
                                                <span className="badge border p-1 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1" title={`Dizabilitate: ${emp.disability}`}>
                                                    <span className="material-symbols-outlined fs-12">accessibility</span>
                                                    {emp.disability}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                        <div className="col-12 d-flex">
                            <Link to="/filtrare" className="btn btn-primary fs-16 fw-bold mx-auto w-100 w-lg-fit-content">
                                Vezi toți angajații
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}

export default HomePage;
