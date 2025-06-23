import React from 'react';

const API_URL = 'http://localhost:5000';

function RecruiterProfile({ user }) {
    return (
        <>
            {user.pozaUrl && (
                <img
                    src={`${API_URL}${user.pozaUrl}`}
                    alt="Poza profil"
                    style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '50%' }}
                />
            )}
            <p><b>Nume:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Telefon:</b> {user.phone}</p>
            <p><b>Adresă:</b> {user.tara}, {user.judet}, {user.localitate}</p>
            <p><b>Companie:</b> {user.company}</p>
            <p><b>Domeniu companie:</b> {user.companyDomain}</p>
            <p><b>Poziția în companie:</b> {user.companyPosition}</p>
        </>
    );
}

export default RecruiterProfile;
