import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "./ViewEmployeePage.module.scss";
import styles from "./ViewEmployeePage.module.scss";

const API_URL = import.meta.env.VITE_API_URL;

function ViewEmployeePage({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [similarEmployees, setSimilarEmployees] = useState([]);

    useEffect(() => {
        if (!user || user.userType !== 'recruiter') {
            navigate('/login?reason=recruiter_required');
            return;
        }

        const fetchEmployee = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/angajati/${id}`);
                if (!res.ok) throw new Error('Angajatul nu a fost găsit.');
                const data = await res.json();
                setEmployee(data);

                // După ce luăm angajatul, căutăm alții cu același domeniu
                fetchSimilarEmployees(data.domeniu, data._id);
            } catch (err) {
                console.error('Eroare la încărcarea profilului angajatului:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchSimilarEmployees = async (domeniu, currentId) => {
            try {
                const res = await fetch(`${API_URL}/api/auth/angajati`);
                const all = await res.json();
                const filtered = all
                    .filter(e => e.domeniu === domeniu && e._id !== currentId)
                    .slice(0, 4); // max 4 sugestii
                setSimilarEmployees(filtered);
            } catch (err) {
                console.error('Eroare la încărcarea angajaților similari:', err);
            }
        };

        fetchEmployee();
    }, [id, user, navigate]);

    if (loading) return <p>Se încarcă profilul angajatului…</p>;
    if (!employee) return <p>Angajatul nu a fost găsit.</p>;

    return (
        <>
            <div className={"container-fluid"}>
                <div className={styles.employeeCover + " position-relative"} style={{backgroundImage: 'url(/images/slide-1.jpg)'}}></div>
            </div>
            <div className="container my-3 my-lg-6">
                <div className={"row"}>
                    <div className={"col-md-8 col-lg-9"}>
                        <div className={"bg-white rounded-1 shadow p-3 d-flex flex-column align-content-start"}>
                            <div className={"d-flex flex-column align-items-start gap-3 pb-3 mb-3 border-bottom"}>
                                <div className={"d-flex flex-row align-items-center justify-content-start gap-2 w-100"}>
                                    <div
                                        className={styles.employeeImage + " d-flex flex-row shadow border rounded-1 overflow-hidden"}>
                                        <img
                                            src={employee.pozaUrl ? `http://localhost:5000${employee.pozaUrl}` : 'images/account-placeholder.jpeg'}
                                            alt={employee.name}
                                        />
                                    </div>
                                    <div className={"d-flex flex-column align-items-start justify-content-center"}>
                                        <span className={styles.employeePosition + " fs-16 fw-bold text-uppercase text-muted"}>{employee.pozitie}</span>
                                        <h3 className={styles.employeeName + " m-0 fs-28 fw-bold"}>{employee.name}</h3>
                                    </div>
                                </div>
                                <div className="d-flex flex-row align-items-center gap-1 flex-wrap">
                                    {employee.domeniu && (
                                        <span
                                            className="badge border p-1 shadow rounded-1 fs-14 text-dark d-flex align-items-center gap-1"
                                            title={`Domeniu: ${employee.domeniu}`}>
                                                    <span className="material-symbols-outlined fs-14">work</span>
                                            {employee.domeniu}
                                                </span>
                                    )}
                                    {employee.localitate && (
                                        <span
                                            className="badge border p-1 shadow rounded-1 fs-14 text-dark d-flex align-items-center gap-1"
                                            title={`Localitate: ${employee.localitate}`}>
                                                    <span className="material-symbols-outlined fs-14">location_on</span>
                                            {employee.localitate}
                                                </span>
                                    )}
                                    {employee.disponibilitate && (
                                        <span
                                            className="badge border p-1 shadow rounded-1 fs-14 text-dark d-flex align-items-center gap-1"
                                            title={`Disponibilitate: ${employee.disponibilitate}`}>
                                                    <span className="material-symbols-outlined fs-14">home_work</span>
                                            {employee.disponibilitate}
                                        </span>
                                    )}
                                    {employee.disability && (
                                        <span
                                            className="badge border p-1 shadow rounded-1 fs-14 text-dark d-flex align-items-center gap-1"
                                            title={`Dizabilitate: ${employee.disability}`}>
                                                    <span
                                                        className="material-symbols-outlined fs-14">accessibility</span>
                                            {employee.disability}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {employee.descriere && (
                                <div className={"d-flex flex-column w-100 border-bottom pb-3 mb-3"}>
                                    <h3 className={"fs-28 fw-bold "}>Despre mine</h3>
                                    <div className={"d-block"} dangerouslySetInnerHTML={{ __html: employee.descriere }}></div>
                                </div>
                            )}
                            {employee.experienta && (
                                <div className={"d-flex flex-column w-100 border-bottom pb-3 mb-3"}>
                                    <h3 className={"fs-28 fw-bold "}>Experiență profesională</h3>
                                    <div className={"d-block"} dangerouslySetInnerHTML={{ __html: employee.experienta }}></div>
                                </div>
                            )}
                            <div className={"d-flex flex-column w-100"}>
                                <h3 className={"fs-28 fw-bold "}>Aptitudini</h3>
                                <div className={"d-flex flex-row align-items-start gap-1"}>
                                    {employee.skills && employee.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="badge border px-2 py-1 shadow rounded-1 fs-16 text-dark d-flex align-items-center"
                                            title={`Aptitudine: ${skill}`}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"col-md-4 col-lg-3"}>
                        <div
                            className={"position-relative position-lg-sticky top-0 d-flex flex-column align-content-start gap-1-5 gap-lg-3 w-100"}>
                            <div
                                className={"bg-white rounded-1 shadow p-3 d-flex flex-column align-content-start gap-2"}>
                            <span
                                className="badge border p-1 shadow rounded-1 text-dark d-flex align-items-center gap-1 w-fit-content">
                                 <span className="material-symbols-outlined fs-24">clinical_notes</span>
                            </span>
                                <p className={"fs-18 fw-bold text-dark m-0 lh-1"}>Descarcă CV</p>
                                <p className={"fs-16 fw-light text-dark m-0 lh-1"}>Maecenas tincidunt rutrum enim, ac
                                    venenatis
                                    arcu interdum in. Pellentesque consectetur diam at malesuada tempus.</p>
                                <a className={"btn btn-primary shadow"} href={`${employee.cvUrl}`} target="_blank"
                                   rel="noopener noreferrer">
                                    Vezi / descarcă CV
                                </a>
                            </div>
                            <div
                                className={"bg-white rounded-1 shadow p-3 d-flex flex-column align-content-start gap-2"}>
                            <span
                                className="badge border p-1 shadow rounded-1 text-dark d-flex align-items-center gap-1 w-fit-content">
                                 <span className="material-symbols-outlined fs-24">id_card</span>
                            </span>
                                <p className={"fs-18 fw-bold text-dark m-0 lh-1"}>Contactează</p>
                                <p className={"fs-16 fw-light text-dark m-0 lh-1"}>Phasellus neque mi, fermentum non
                                    convallis non, eleifend non magna</p>
                                <div className={"d-flex flex-row align-items-center justify-content-between gap-2"}>
                                    {employee.cvUrl && (
                                        <a className={"btn btn-outline-primary shadow"} href={`${employee.cvUrl}`}
                                           target="_blank"
                                           rel="noopener noreferrer">
                                            Mesaj direct
                                        </a>
                                    )}
                                    <div className={"d-flex flex-row align-items-center justify-content-center gap-2"}>
                                        <a href={`mailto:${employee.email}`}
                                           className={styles.contactButton + " btn border text-dark d-flex align-items-center justify-content-center p-1 bg-white shadow"}>
                                            <span className="material-symbols-outlined fs-18">email</span>
                                        </a>
                                        <a href={`tel:${employee.phone}`}
                                           className={styles.contactButton + " btn border text-dark d-flex align-items-center justify-content-center p-1 bg-white shadow"}>
                                            <span className="material-symbols-outlined fs-18">phone</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recomandări */}
                {similarEmployees.length > 0 && (
                    <div>
                        <h4>Angajați similari (domeniu: {employee.domeniu})</h4>
                        <div className="d-flex flex-wrap gap-3 mt-3">
                            {similarEmployees.map(emp => (
                                <Link
                                    key={emp._id}
                                    to={`/angajat/${emp._id}`}
                                    className="text-decoration-none text-dark"
                                    style={{
                                        border: '1px solid #ccc',
                                        borderRadius: 8,
                                        padding: 15,
                                        width: 220,
                                        display: 'block'
                                    }}
                                >
                                    <img
                                        src={
                                            emp.pozaUrl
                                                ? `http://localhost:5000${emp.pozaUrl}`
                                                : '/images/account-placeholder.jpeg'
                                        }
                                        alt={emp.name}
                                        style={{
                                            width: '100%',
                                            height: 140,
                                            objectFit: 'cover',
                                            borderRadius: 8
                                        }}
                                    />
                                    <h6 className="mt-2">{emp.name}</h6>
                                    <p className="mb-0"><strong>{emp.localitate}</strong></p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ViewEmployeePage;
