import React from 'react';
import {Link} from "react-router-dom";
import styles from "./AngajatProfile.module.scss";

const API_URL = 'http://localhost:5000';

function AngajatProfile({ user }) {
    return (
        <div className={"row"}>
            <div className={"col-md-8 col-lg-9"}>

            </div>
            <div className={"col-md-4 col-lg-3"}>
                <div
                    className={"position-relative position-lg-sticky top-0 d-flex flex-column align-content-start gap-1-5 gap-lg-3 w-100"}>
                    <div className={"bg-white rounded-1 shadow p-3 d-flex flex-column align-content-start gap-2"}>
                        <span
                            className="badge border p-1 shadow rounded-1 text-dark d-flex align-items-center gap-1 w-fit-content">
                             <span className="material-symbols-outlined fs-24">clinical_notes</span>
                        </span>
                        <p className={"fs-18 fw-bold text-dark m-0 lh-1"}>Descarcă CV</p>
                        <p className={"fs-16 fw-light text-dark m-0 lh-1"}>Maecenas tincidunt rutrum enim, ac venenatis
                            arcu interdum in. Pellentesque consectetur diam at malesuada tempus.</p>
                        <a className={"btn btn-primary shadow"} href={`${user.cvUrl}`} target="_blank"
                           rel="noopener noreferrer">
                            Vezi / descarcă CV
                        </a>
                    </div>
                    <div className={"bg-white rounded-1 shadow p-3 d-flex flex-column align-content-start gap-2"}>
                        <span
                            className="badge border p-1 shadow rounded-1 text-dark d-flex align-items-center gap-1 w-fit-content">
                             <span className="material-symbols-outlined fs-24">id_card</span>
                        </span>
                        <p className={"fs-18 fw-bold text-dark m-0 lh-1"}>Contactează</p>
                        <p className={"fs-16 fw-light text-dark m-0 lh-1"}>Phasellus neque mi, fermentum non convallis non, eleifend non magna</p>
                        <div className={"d-flex flex-row align-items-center justify-content-between gap-2"}>
                            {user.cvUrl && (
                                <a className={"btn btn-outline-primary shadow"} href={`${user.cvUrl}`} target="_blank"
                                   rel="noopener noreferrer">
                                    Mesaj direct
                                </a>
                            )}
                            <div className={"d-flex flex-row align-items-center justify-content-center gap-2"}>
                                <a href={`mailto:${user.email}`} className={styles.contactButton + " btn border text-dark d-flex align-items-center justify-content-center p-1 bg-white shadow"}>
                                    <span className="material-symbols-outlined fs-18">email</span>
                                </a>
                                <a href={`tel:${user.phone}`} className={styles.contactButton + " btn border text-dark d-flex align-items-center justify-content-center p-1 bg-white shadow"}>
                                    <span className="material-symbols-outlined fs-18">phone</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {user.pozaUrl && (
                <img
                    src={`${API_URL}${user.pozaUrl}`}
                    alt="Poza profil"
                    style={{width: 150, height: 150, objectFit: 'cover', borderRadius: '50%'}}
                />
            )}
            <p><b>Nume:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Telefon:</b> {user.phone}</p>
            <p><b>Adresă:</b> {user.tara}, {user.judet}, {user.localitate}</p>
            <p><b>Dizabilitate:</b> {user.disability}</p>
            <p><b>Skill-uri:</b> {user.skills ? user.skills.join(', ') : ''}</p>
            <p><b>Domeniu:</b> {user.domeniu}</p>
            <p><b>Poziția dorită:</b> {user.pozitie}</p>
            <p><b>Disponibilitate:</b> {user.disponibilitate}</p>
            {user.cvUrl && (
                <p>
                    <b>CV:</b>{' '}
                    <a href={`${user.cvUrl}`} target="_blank" rel="noopener noreferrer">
                        Vezi / descarcă CV
                    </a>
                </p>
            )}
            {user.descriere && (
                <div className="bg-white rounded-1 shadow p-3 my-3">
                    <h5 className="fw-bold">Despre mine</h5>
                    <div dangerouslySetInnerHTML={{ __html: user.descriere }} />
                </div>
            )}

            {user.experienta && (
                <div className="bg-white rounded-1 shadow p-3 my-3">
                    <h5 className="fw-bold">Experiență profesională</h5>
                    <div dangerouslySetInnerHTML={{ __html: user.experienta }} />
                </div>
            )}

        </div>
    );
}

export default AngajatProfile;
