import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const TripDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/trips/${id}`);
                setTrip(res.data);
            } catch (error) {
                console.error("Error fetching trip details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('pl-PL') : '-';

    if (loading) return <div className="p-5 text-center">Ładowanie szczegółów...</div>;
    if (!trip) return <div className="p-5 text-center text-danger">Nie znaleziono w wniosku.</div>;

    const isRejected = trip.status?.name === 'Odrzucona';

    return (
        <div className="container mt-4">
            <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-3">
                <i className="bi bi-arrow-left me-2"></i>Wróć
            </button>

            {/* ERROR / REJECTION REASON */}
            {isRejected && (
                <div className="alert alert-danger shadow-sm border-danger border-2 mb-4" role="alert">
                    <h5 className="alert-heading fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>Wniosek Odrzucony</h5>
                    <hr />
                    <p className="mb-0">
                        <strong>Powód odrzucenia: </strong> 
                        {trip.rejectionReason || "Brak podanego powodu."}
                    </p>
                </div>
            )}

            {/* PAPER LIKE CONTAINER */}
            <div className="card border-0 shadow-lg p-5" style={{ background: '#fff', borderRadius: '2px', minHeight: '600px' }}>
                
                {/* HEAD */}
                <div className="border-bottom pb-4 mb-4 d-flex justify-content-between align-items-start">
                    <div>
                        <h1 className="display-6 fw-bold text-dark">Wniosek Delegacyjny #{trip.id}</h1>
                        
                    </div>
                    <div className={`badge bg-${isRejected ? 'danger' : (trip.status?.name === 'Zatwierdzona' ? 'success' : 'warning')} fs-6 px-4 py-2`}>
                        {trip.status?.name?.toUpperCase()}
                    </div>
                </div>

                {/* BODY */}
                <div className="row g-5">
                    {/* LEFT COLUMN */}
                    <div className="col-md-6">
                        <h5 className="text-secondary text-uppercase fw-bold small border-bottom pb-2 mb-3">Dane Podstawowe</h5>
                        
                        <div className="mb-3">
                            <label className="text-muted small d-block">Pracownik</label>
                            <span className="fw-bold fs-5">{trip.user?.firstName} {trip.user?.lastName}</span>
                        </div>

                        <div className="mb-3">
                            <label className="text-muted small d-block">Cel Podróży</label>
                            <span className="fw-bold">{trip.purpose}</span>
                        </div>

                        <div className="row">
                            <div className="col-6">
                                <label className="text-muted small d-block">Data Rozpoczęcia</label>
                                <span className="fw-bold">{formatDate(trip.startDate)}</span>
                            </div>
                            <div className="col-6">
                                <label className="text-muted small d-block">Data Zakończenia</label>
                                <span className="fw-bold">{formatDate(trip.endDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-md-6">
                        <h5 className="text-secondary text-uppercase fw-bold small border-bottom pb-2 mb-3">Szczegóły Logistyczne</h5>

                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-geo-alt-fill text-primary me-2 fs-5"></i>
                                <span className="fw-bold fs-5">{trip.destination?.name}</span>
                            </div>
                            <small className="text-muted">{trip.destination?.country?.name}</small>
                        </div>

                        {/* TRANSPORT INFO */}
                        {trip.transports && trip.transports.length > 0 && (
                            <div className="mb-3 p-3 bg-light rounded">
                                <h6 className="fw-bold mb-2"><i className="bi bi-airplane-fill me-2"></i>Transport</h6>
                                {trip.transports.map(t => (
                                    <div key={t.id} className="small">
                                        {t.provider?.name} {t.type?.name ? `(${t.type.name})` : ''} - <span className="fw-bold">{t.cost} PLN</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* HOTEL INFO */}
                        {trip.accommodations && trip.accommodations.length > 0 && (
                            <div className="mb-3 p-3 bg-light rounded">
                                <h6 className="fw-bold mb-2"><i className="bi bi-building me-2"></i>Nocleg</h6>
                                {trip.accommodations.map(a => (
                                    <div key={a.id} className="small">
                                        {a.hotel?.name} <br/>
                                        <span className="text-muted">{formatDate(a.checkIn)} - {formatDate(a.checkOut)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                {/* COST SECTION */}
                <div className="mt-5 pt-4 border-top">
                    <div className="d-flex justify-content-end align-items-center gap-5">
                         {trip.settlement && (
                            <div className="text-end">
                                <h6 className="text-secondary text-uppercase small fw-bold">Całkowity Koszt (Rozliczenie)</h6>
                                <h2 className="fw-bold text-success">{parseFloat(trip.settlement.totalAmount).toFixed(2)} PLN</h2>
                            </div>
                         )}
                        <div className="text-end">
                            <h6 className="text-muted text-uppercase small">Szacunkowy Koszt (Plan)</h6>
                            <h2 className="fw-bold text-primary">{trip.estimatedCost ? `${parseFloat(trip.estimatedCost).toFixed(2)} PLN` : "Brak danych"}</h2>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TripDetailsPage;
