import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FilterPopOver.module.scss';

export default function FilterPopover({ label, filterKey, employees, icon }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Ia toate valorile unice din lista de angajați pentru filtrul curent
    const uniqueOptions = Array.from(new Set(
        employees.map(emp => emp[filterKey]).filter(Boolean)
    ));

    return (
        <div className={styles.PopoverContainer} ref={containerRef} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button type="button" className={styles.filtersButton + " border px-1 py-0-5 shadow rounded-1 fs-12 text-dark d-flex align-items-center justify-content-center bg-white fw-bold"} onClick={() => setOpen(!open)}>
                <span className="material-symbols-outlined fs-18">{icon}</span>
            </button>

            {open && (
                <div className={styles.PopoverMenu + " position-absolute shadow rounded p-2 bg-white z-3"}>
                    <div className={"d-flex flex-row align-content-center fs-16 gap-0-5 pb-1 mb-1 border-bottom border-muted lh-1 fw-light"}>
                        <span className="material-symbols-outlined fs-16">{icon}</span>
                        {label}
                    </div>
                    <div className="d-flex flex-row align-items-center gap-1 flex-wrap">
                        {[...uniqueOptions].map((opt, i) => (
                        <button
                            key={i}
                            type="button"
                            className={styles.selectionButton + " border px-1 py-0-5 shadow rounded-1 fs-12 text-dark d-flex align-items-center gap-1 bg-white fw-bold"}
                            onClick={() => {
                                // Ia query params curente din URL
                                const currentQuery = new URLSearchParams(window.location.search);

                                if (opt) {
                                    currentQuery.set(filterKey, opt);
                                } else {
                                    currentQuery.delete(filterKey);
                                }

                                // Navighează cu query params actualizate
                                navigate(`/filtrare?${currentQuery.toString()}`);

                                setOpen(false);
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
}
