import { useState, useEffect } from 'react';
import api from '../../services/api';

const Step1_General = ({ formData, handleChange, nextStep }) => {
    const [cities, setCities] = useState([]);
    const [filteredOrigins, setFilteredOrigins] = useState([]);
    const [loadingOrigins, setLoadingOrigins] = useState(false);

    useEffect(() => {
        api.get('/cities')
           .then(res => {
               setCities(res.data);
               // FORCE WARSZAWA LOGIC
               const warsaw = res.data.find(c => c.name.toLowerCase() === 'warszawa');
               if (warsaw) {
                   handleChange({ target: { name: 'originCityId', value: warsaw.id } });
               }

               if (!formData.destinationId) {
                   setFilteredOrigins(res.data);
               }
           })
           .catch(err => console.error(err));
    }, []);

    const isValid = formData.destinationId && formData.originCityId && formData.startDate && formData.endDate && formData.purpose;

    return (
        <div className="p-4 bg-white rounded shadow-sm border">
            <h4 className="mb-4 text-primary fw-bold border-bottom pb-2">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Krok 1: Gdzie i po co?
            </h4>
            
            <div className="row g-4">
                {/* Miasto Docelowe */}
                <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary text-uppercase small ls-1">Miasto Docelowe</label>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0 text-primary">
                            <i className="bi bi-pin-map-fill"></i>
                        </span>
                        <select 
                            className="form-select border-start-0 bg-light" 
                            name="destinationId" 
                            value={formData.destinationId} 
                            onChange={handleChange}
                        >
                            <option value="">-- Wybierz Cel --</option>
                            {cities.filter(c => c.name.toLowerCase() !== 'warszawa').map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Miasto Startowe - LOCKED TO WARSZAWA */}
                <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary text-uppercase small ls-1">
                        Miasto Startowe (Baza)
                    </label>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0 text-success">
                            <i className="bi bi-house-lock-fill"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control bg-light border-start-0 fw-bold text-success" 
                            value="Warszawa" 
                            readOnly 
                        />
                         {/* Hidden input to keep logic working if select was relied upon, but formData is already set in useEffect */}
                    </div>
                    <div className="form-text small text-muted"><i className="bi bi-info-circle me-1"></i>Start delegacji zawsze z biura (Warszawa).</div>
                </div>

                {/* Daty */}
                <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary text-uppercase small ls-1">Data Od</label>
                    <input 
                        type="date" 
                        className="form-control form-control-lg bg-light" 
                        name="startDate" 
                        value={formData.startDate} 
                        min={new Date().toISOString().split('T')[0]} // Min today
                        onChange={(e) => {
                            handleChange(e);
                            // If end date is now invalid, clear it
                            if (formData.endDate && e.target.value > formData.endDate) {
                                handleChange({ target: { name: 'endDate', value: '' } });
                            }
                        }} 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary text-uppercase small ls-1">Data Do</label>
                    <input 
                        type="date" 
                        className="form-control form-control-lg bg-light" 
                        name="endDate" 
                        value={formData.endDate} 
                        min={formData.startDate || new Date().toISOString().split('T')[0]} // Min startDate
                        onChange={handleChange} 
                        disabled={!formData.startDate}
                    />
                </div>

                {/* Cel i Opcje */}
                <div className="col-12">
                     <label className="form-label fw-bold text-secondary text-uppercase small ls-1">Cel Wyjazdu</label>
                    <textarea 
                        className="form-control bg-light" 
                        name="purpose" 
                        rows="3"
                        placeholder="Opisz cel delegacji..."
                        value={formData.purpose} 
                        onChange={handleChange} 
                    />
                </div>

                
            </div>

            <div className="d-flex justify-content-end mt-4">
                 <button className="btn btn-primary btn-lg px-5 rounded-pill shadow" onClick={nextStep} disabled={!isValid}>
                    Dalej <i className="bi bi-arrow-right ms-2"></i>
                 </button>
            </div>
        </div>
    );
};

export default Step1_General;
