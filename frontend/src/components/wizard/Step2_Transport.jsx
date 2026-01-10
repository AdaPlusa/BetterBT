import { useState, useEffect } from 'react';
import api from '../../services/api';

const Step2_Transport = ({ formData, setFormData, nextStep, prevStep }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRouteId, setSelectedRouteId] = useState(null); // ID wybranej trasy lub 'car'

    useEffect(() => {
        if (!formData.originCityId || !formData.destinationId) {
            setLoading(false);
            return;
        }

        api.get(`/available-routes?fromCityId=${formData.originCityId}&toCityId=${formData.destinationId}`)
           .then(res => {
               setRoutes(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, [formData.originCityId, formData.destinationId]);

    const handleSelectRoute = (route) => {
        setSelectedRouteId(route.id);
        setFormData(prev => ({
            ...prev,
            transportType: 'public', // lub ID typu
            transportProviderId: route.providerId,
            transportTypeId: route.transportTypeId,
            transportCost: route.price * 2, // Cena x2 (Tam i z powrotem)
            transportDetails: `${route.transportType?.name} ${route.provider?.name}`
        }));
    };

    const handleSelectCar = () => {
        setSelectedRouteId('car');
        setFormData(prev => ({
            ...prev,
            transportType: 'car',
            transportProviderId: null,
            transportTypeId: null, // lub specyficzny ID dla auta
            transportCost: 0,
            transportDetails: 'Samochód Służbowy'
        }));
    };

    const handleSkip = () => {
        setSelectedRouteId(null);
        setFormData(prev => ({
            ...prev,
            transportType: null,
            transportCost: 0,
            transportDetails: 'Brak transportu'
        }));
        nextStep();
    };

    return (
        <div>
            <h5 className="mb-4">Krok 2: Wybierz Transport</h5>
            
            {loading && <div className="text-center py-4">Szukanie połączeń...</div>}
            
            {!loading && (
                <div className="row g-3">
                    {/* LISTA TRAS Z BAZY */}
                    {routes.map(route => (
                        <div className="col-md-6" key={route.id}>
                            <div 
                                className={`card h-100 cursor-pointer ${selectedRouteId === route.id ? 'border-primary bg-light' : 'border-secondary'}`} 
                                onClick={() => handleSelectRoute(route)}
                                style={{cursor: 'pointer', borderWidth: selectedRouteId === route.id ? '2px' : '1px'}}
                            >
                                <div className="card-body d-flex align-items-center justify-content-between">
                                    <div>
                                        <h5 className="card-title fw-bold">
                                            {route.transportType?.name} <span className="text-muted small">({route.provider?.name})</span>
                                        </h5>
                                        <p className="card-text text-muted mb-0">Czas: ~3h</p> {/* Mock czasu */}
                                    </div>
                                    <div className="text-end">
                                        <h4 className="fw-bold text-primary mb-0">{route.price * 2} {route.currency}</h4>
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                            {route.price} x 2 (Powrót)
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* SAMOCHÓD SŁUŻBOWY */}
                    {/* <div className="col-md-6">
                        <div 
                            className={`card h-100 cursor-pointer ${selectedRouteId === 'car' ? 'border-primary bg-light' : 'border-secondary'}`} 
                            onClick={handleSelectCar}
                             style={{cursor: 'pointer', borderWidth: selectedRouteId === 'car' ? '2px' : '1px'}}
                        >
                            <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 className="card-title fw-bold">Samochód Służbowy</h5>
                                    <p className="card-text text-muted mb-0">Paliwo wg ryczałtu</p>
                                </div>
                                <div className="text-end">
                                    <h4 className="fw-bold text-success mb-0">0 PLN</h4>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            )}

            {!loading && routes.length === 0 && (
                <div className="alert alert-info mt-3">
                    Brak zdefiniowanych połączeń publicznych dla tej trasy. Wybierz samochód służbowy lub pomiń.
                </div>
            )}

            <div className="d-flex justify-content-between mt-5">
                <button className="btn btn-outline-secondary" onClick={prevStep}>Wstecz</button>
                <div>
                     <button className="btn btn-link text-muted me-3" onClick={handleSkip}>Pomiń ten krok</button>
                     <button 
                        className="btn btn-primary px-4" 
                        onClick={nextStep} 
                        disabled={!selectedRouteId}
                    >
                        Wybierz i Przejdź Dalej
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step2_Transport;
