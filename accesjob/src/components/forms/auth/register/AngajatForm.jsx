// AngajatForm.jsx
import React from 'react';

function AngajatForm({ formData, handleChange, handleSubmit }) {
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Nume complet"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Parolă"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <select
                name="disability"
                value={formData.disability}
                onChange={handleChange}
                required
            >
                <option value="">Selectează dizabilitatea</option>
                <option value="vizuala">Vizuală</option>
                <option value="auditiva">Auditivă</option>
                <option value="motorie">Motorie</option>
                <option value="mentala">Mentală</option>
            </select>
            <input
                type="text"
                name="skills"
                placeholder="Competențe"
                value={formData.skills}
                onChange={handleChange}
                required
            />
            <button type="submit">Înregistrează-te</button>
        </form>
    );
}

export default AngajatForm;
