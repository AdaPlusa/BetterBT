import React from 'react';

const Step4_Summary = ({ formData, prevStep, handleSubmit }) => {
    return (
        <div>
            <h5>Krok 4: Podsumowanie</h5>
            <div className="alert alert-info">
                <p><strong>Cel:</strong> {formData.purpose}</p>
                <p><strong>Termin:</strong> {formData.startDate} - {formData.endDate}</p>
                <p><strong>Miasto ID:</strong> {formData.destinationId}</p>
                <hr/>
                <p><strong>Transport:</strong> {formData.transportType ? `Tak (koszt: ${formData.transportCost} PLN)` : "Nie dotyczy"}</p>
                <p><strong>Hotel ID:</strong> {formData.hotelId ? formData.hotelId : "Nie dotyczy"}</p>
            </div>

            <div className="d-flex justify-content-between">
                <button className="btn btn-secondary" onClick={prevStep}>Wstecz</button>
                <button className="btn btn-success" onClick={handleSubmit}>Wyślij Wniosek</button>
            </div>
        </div>
    );
};

export default Step4_Summary;
