import { useState, useEffect } from 'react';
import api from '../../services/api';

const Step3_Hotel = ({ formData, handleChange, nextStep, prevStep }) => {
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        api.get('/hotels')
           .then(res => {
               // Filtrowanie hoteli po mieście wybranym w kroku 1
               const cityId = parseInt(formData.destinationId);
               const filtered = res.data.filter(h => h.cityId === cityId);
               setHotels(filtered);
           })
           .catch(err => console.error(err));
    }, [formData.destinationId]);

    return (
        <div>
            <h5>Krok 3: Nocleg</h5>
            <div className="mb-3">
                <label className="form-label">Wybierz Hotel (w mieście docelowym)</label>
                <select 
                    className="form-select" 
                    name="hotelId" 
                    value={formData.hotelId} 
                    onChange={handleChange}
                >
                    <option value="">Brak rezerwacji / Wybierz...</option>
                    {hotels.length > 0 ? (
                        hotels.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))
                    ) : (
                        <option disabled>Brak hoteli w tym mieście</option>
                    )}
                </select>
            </div>
            
            {formData.hotelId && (
                <div className="row">
                    <div className="col-6 mb-3">
                        <label className="form-label">Check-in</label>
                        <input type="date" className="form-control" name="hotelCheckIn" value={formData.hotelCheckIn} onChange={handleChange} />
                    </div>
                     <div className="col-6 mb-3">
                        <label className="form-label">Check-out</label>
                        <input type="date" className="form-control" name="hotelCheckOut" value={formData.hotelCheckOut} onChange={handleChange} />
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

export default Step3_Hotel;
