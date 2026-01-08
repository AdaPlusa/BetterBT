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
                            className={`card h-100 cursor-pointer ${selectedHotelId === hotel.id ? 'border-primary bg-light' : ''}`}
                            onClick={() => handleSelectHotel(hotel)}
                            style={{cursor: 'pointer', borderWidth: selectedHotelId === hotel.id ? '2px' : '1px'}}
                        >
                            {/* Obrazek hotelu (placeholder) */}
                            <div style={{height: '150px', background: '#eee', overflow: 'hidden'}} className="card-img-top d-flex align-items-center justify-content-center text-secondary position-relative">
                                {hotel.imageUrl ? (
                                    <img src={hotel.imageUrl} alt={hotel.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                ) : (
                                    <i className="bi bi-building fs-1"></i>
                                )}
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h6 className="fw-bold">{hotel.name}</h6>
                                    <span className="text-warning">
                                        {'★'.repeat(hotel.stars)}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="mb-0 small text-muted">Cena za noc: {hotel.pricePerNight} PLN</p>
                                    <h4 className="fw-bold text-primary mt-1">
                                        {(hotel.pricePerNight * nights).toFixed(0)} PLN
                                    </h4>
                                    <small className="text-muted">za całość</small>
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
                     <button className="btn btn-link text-muted me-3" onClick={handleSkip}>Nie potrzebuję noclegu</button>
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
