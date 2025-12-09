import { useState, useEffect } from 'react';
import api from '../../services/api';

const Step2_Transport = ({ formData, handleChange, nextStep, prevStep, setFormData }) => {
    const [transportTypes, setTransportTypes] = useState([]);

    useEffect(() => {
        api.get('/transport-types')
           .then(res => setTransportTypes(res.data))
           .catch(err => console.error(err));
    }, []);

    const handleTransportToggle = (e) => {
        // Jeśli odznaczamy, czyścimy też ID transportu
        if (!e.target.checked) {
             setFormData(prev => ({ ...prev, transportType: false, transportCost: '' }));
        } else {
             handleChange(e);
        }
    };

    return (
        <div>
            <h5>Krok 2: Transport</h5>
            <div className="form-check mb-3">
                <input 
                    className="form-check-input" 
                    type="checkbox" 
                    name="transportType" 
                    checked={formData.transportType} 
                    onChange={handleTransportToggle} 
                    id="transportCheck"
                />
                <label className="form-check-label" htmlFor="transportCheck">
                Potrzebuję rezerwacji transportu
                </label>
            </div>

            {formData.transportType && (
                <div className="card card-body mb-3 bg-light">
                     <div className="mb-3">
                        <label className="form-label">Szacowany koszt</label>
                        <input type="number" className="form-control" name="transportCost" value={formData.transportCost} onChange={handleChange} />
                    </div>
                </div>
            )}
            
            <div className="d-flex justify-content-between">
                <button className="btn btn-secondary" onClick={prevStep}>Wstecz</button>
                <button className="btn btn-primary" onClick={nextStep}>Dalej</button>
            </div>
        </div>
    );
};

export default Step2_Transport;
