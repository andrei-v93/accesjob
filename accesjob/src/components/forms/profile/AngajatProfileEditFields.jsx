import React from 'react';

const dizabilitatiOptions = ['Vizuală', 'Auditivă', 'Locomotorie', 'Neuro-motorie', 'Altele'];
const disponibilitateOptions = ['Remote', 'On-site', 'Hibrid'];

const isFieldFilled = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '';
};

export default function AngajatProfileEditFields({
                                                     disability, setDisability,
                                                     skills, setSkills,
                                                     domeniu, setDomeniu,
                                                     pozitie, setPozitie,
                                                     disponibilitate, setDisponibilitate,
                                                     cv, setCv,
                                                 }) {
    return (
        <>
            <label>Dizabilitate:</label>
            <select value={disability} onChange={(e) => setDisability(e.target.value)} required>
                <option value="">Selectează dizabilitate</option>
                {dizabilitatiOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>
            <small>{isFieldFilled(disability) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Skill-uri (separate prin virgulă):</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} />
            <small>{isFieldFilled(skills) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Domeniu:</label>
            <input type="text" value={domeniu} onChange={(e) => setDomeniu(e.target.value)} />
            <small>{isFieldFilled(domeniu) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Poziția dorită:</label>
            <input type="text" value={pozitie} onChange={(e) => setPozitie(e.target.value)} />
            <small>{isFieldFilled(pozitie) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Disponibilitate:</label>
            <select value={disponibilitate} onChange={(e) => setDisponibilitate(e.target.value)} required>
                <option value="">Selectează disponibilitate</option>
                {disponibilitateOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>
            <small>{isFieldFilled(disponibilitate) ? '✅ Completat' : '❌ Necompletat'}</small>

            <label>Upload CV:</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files[0])} />
            <small>{cv ? '✅ Uploadat' : '❌ Neuploadat'}</small>
        </>
    );
}
