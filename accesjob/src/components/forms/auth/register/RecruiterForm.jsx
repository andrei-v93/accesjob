// RecruiterForm.jsx
import React from 'react';

function RecruiterForm({ formData, handleChange, handleSubmit }) {
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
            <input
                type="text"
                name="company"
                placeholder="Companie"
                value={formData.company}
                onChange={handleChange}
                required
            />
            <button type="submit">Înregistrează-te</button>
        </form>
    );
}

export default RecruiterForm;
