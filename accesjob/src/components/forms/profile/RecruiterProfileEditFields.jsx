import React from 'react';

const isFieldFilled = (value) => {
    return value !== null && value !== undefined && value.trim() !== '';
};

export default function RecruiterProfileEditFields({
                                                       company, setCompany,
                                                       companyDomain, setCompanyDomain,
                                                       companyPosition, setCompanyPosition,
                                                   }) {
    return (
        <>
            <label>Companie:</label>
            <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
            />
            <small>{isFieldFilled(company) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Domeniu companie:</label>
            <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
            />
            <small>{isFieldFilled(companyDomain) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Poziția în companie:</label>
            <input
                type="text"
                value={companyPosition}
                onChange={(e) => setCompanyPosition(e.target.value)}
            />
            <small>{isFieldFilled(companyPosition) ? '✅ Completat' : '❌ Necompletat'}</small>
        </>
    );
}
