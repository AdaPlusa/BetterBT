import { useState, useEffect } from 'react';
import api from '../../services/api';

const Step3_Hotel = ({ formData, handleChange, nextStep, prevStep, setFormData }) => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHotelId, setSelectedHotelId] = useState(null);

    // Oblicz liczbę nocy
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const nights = duration > 0 ? duration : 1; // Minimum 1 noc

    useEffect(() => {
        if (!formData.destinationId) return;

        api.get(`/hotels?cityId=${formData.destinationId}`)
           .then(res => {
               // Mockowanie cen i gwiazdek, bo baza tego nie ma
               const enriched = res.data.map(h => ({
                   ...h,
                   stars: Math.floor(Math.random() * 3) + 3, // 3-5 gwiazdek
                   pricePerNight: Math.floor(Math.random() * 200) + 150 // 150-350 PLN
               }));
               setHotels(enriched);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, [formData.destinationId]);

    const handleSelectHotel = (hotel) => {
        setSelectedHotelId(hotel.id);
        const totalPrice = hotel.pricePerNight * nights;
        setFormData(prev => ({
            ...prev,
            hotelId: hotel.id,
            hotelName: hotel.name,
            hotelCost: totalPrice,
            hotelCheckIn: formData.startDate,
            hotelCheckOut: formData.endDate
        }));
    };

    const handleSkip = () => {
        setFormData(prev => ({
            ...prev,
            hotelId: null,
            hotelName: null,
            hotelCost: 0
        }));
        nextStep();
    };

    return (
        <div>
            <h5 className="mb-4">Krok 3: Wybierz Nocleg</h5>
            <p className="text-muted">Liczba nocy: <strong>{nights}</strong> (w terminie {formData.startDate} - {formData.endDate})</p>

            {loading && <div className="text-center">Szukanie hoteli...</div>}

            <div className="row g-3">
                {!loading && hotels.map(hotel => (
                    <div className="col-md-4" key={hotel.id}>
                        <div 
                            className={`card h-100 overflow-hidden ${selectedHotelId === hotel.id ? 'border-primary shadow' : ''}`}
                            onClick={() => handleSelectHotel(hotel)}
                            style={{cursor: 'pointer', borderWidth: selectedHotelId === hotel.id ? '3px' : '1px', transition: 'all 0.2s'}}
                        >
                            {/* Obrazek hotelu */}
                            <div style={{height: '180px'}} className="position-relative bg-light">
                                {hotel.imageUrl ? (
                                    <img src={hotel.imageUrl} alt={hotel.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-black-50">
                                        <i className="bi bi-building fs-1"></i>
                                    </div>
                                )}
                                
                                <div className="position-absolute top-0 end-0 p-2">
                                     <span className="badge bg-white text-dark shadow-sm">
                                        {'★'.repeat(hotel.stars)}
                                     </span>
                                </div>

                                {selectedHotelId === hotel.id && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{background: 'rgba(0, 114, 222, 0.2)'}}>
                                        <i className="bi bi-check-circle-fill text-primary" style={{fontSize: '4rem', textShadow: '0 0 10px white'}}></i>
                                    </div>
                                )}
                            </div>

                            <div className="card-body d-flex flex-column">
                                <h5 className="fw-bold mb-1">{hotel.name}</h5>
                                <p className="text-muted small mb-auto">Cena za noc: {hotel.pricePerNight} PLN</p>
                                
                                <hr className="my-3 opacity-25"/>

                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="small text-muted">
                                        Za {nights} {nights === 1 ? 'noc' : 'noce'}
                                    </div>
                                    <div className="fw-bold text-primary fs-4">
                                        {(hotel.pricePerNight * nights).toFixed(0)} <small className="fs-6 text-muted">PLN</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && hotels.length === 0 && (
                <div className="alert alert-warning mt-3">Brak hoteli w tym mieście.</div>
            )}

            <div className="d-flex justify-content-between mt-5">
                <button className="btn btn-outline-secondary" onClick={prevStep}>Wstecz</button>
                <div>
                    
                     <button 
                        className="btn btn-primary px-4" 
                        onClick={nextStep} 
                        disabled={!selectedHotelId}
                    >
                        Zatwierdź i Przejdź Dalej
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step3_Hotel;
