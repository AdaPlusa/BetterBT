import { useState, useEffect } from 'react';
import api from '../../services/api';

const Step1_General = ({ formData, handleChange, nextStep }) => {
    const [cities, setCities] = useState([]);

    useEffect(() => {
        api.get('/cities')
           .then(res => setCities(res.data))
           .catch(err => console.error(err));
    }, []);

    const isValid = formData.destinationId && formData.startDate && formData.endDate && formData.purpose;

    return (
        <div>
            <h5>Krok 1: Gdzie i po co?</h5>
            <div className="mb-3">
                <label className="form-label">Miasto Docelowe</label>
                <select 
                    className="form-select" 
                    name="destinationId" 
                    value={formData.destinationId} 
                    onChange={handleChange}
                >
                    <option value="">Wybierz miasto...</option>
                    {cities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Data Od</label>
                <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Data Do</label>
                <input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Cel Wyjazdu</label>
                <textarea className="form-control" name="purpose" value={formData.purpose} onChange={handleChange} />
            </div>
            <div className="d-flex justify-content-end">
                 <button className="btn btn-primary" onClick={nextStep} disabled={!isValid}>Dalej</button>
            </div>
        </div>
    );
};

export default Step1_General;
