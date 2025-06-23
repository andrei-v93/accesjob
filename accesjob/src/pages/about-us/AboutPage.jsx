import React from 'react';
import PageWrapper from "../../components/motion/PageWrapper.jsx";

const About = () => {
    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-6 text-center">Despre AccesJob</h1>
                <p className="mb-4 text-lg">
                    <strong>AccesJob</strong> este o platformă dedicată sprijinirii persoanelor cu dizabilități în găsirea de oportunități de angajare potrivite și incluzive. Credem că fiecare persoană merită șansa de a-și valorifica potențialul profesional, indiferent de provocările cu care se confruntă.
                </p>
                <p className="mb-4 text-lg">
                    Platforma conectează candidații cu dizabilități cu angajatori responsabili, oferind un spațiu sigur, accesibil și orientat spre echitate. Ne propunem să eliminăm barierele de comunicare și prejudecățile, contribuind la construirea unei piețe a muncii mai echitabile.
                </p>
                <p className="mb-4 text-lg">
                    Fie că ești în căutarea unui loc de muncă sau un angajator care dorește să construiască o echipă diversă și valoroasă, AccesJob este locul potrivit pentru tine.
                </p>
                <p className="text-lg font-semibold mt-6">
                    Împreună construim un viitor mai accesibil.
                </p>
            </div>
        </PageWrapper>
    );
};

export default About;
