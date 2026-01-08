import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ManagerDashboardPage = () => {
    const [pendingTrips, setPendingTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const navigate = useNavigate();

    // Fetch data
    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = () => {
        setLoading(true);
        // userId from token is used by backend optionally, or we can pass it if needed. 
        // For now, let's assume the backend endpoint handles "show me what I need to approve" logic.
        const userId = localStorage.getItem('userId');
        api.get(`/manager/pending-trips?userId=${userId}`)
           .then(res => {
               setPendingTrips(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    };

    const handleApprove = (id) => {
        if (!window.confirm("Czy na pewno chcesz zatwierdzić ten wniosek?")) return;
        
        api.patch(`/manager/approve/${id}`)
           .then(() => {
               alert("Wniosek zatwierdzony!");
               fetchTrips();
           })
           .catch(err => alert("Błąd zatwierdzania: " + err.message));
    };

    const handleRejectClick = (id) => {
        setRejectingId(id);
        setRejectReason('');
    };

    const confirmReject = () => {
        if (!rejectReason) return alert("Podaj powód odrzucenia!");
        
        api.patch(`/manager/reject/${rejectingId}`, { reason: rejectReason })
           .then(() => {
               alert("Wniosek odrzucony.");
               setRejectingId(null);
               fetchTrips();
           })
           .catch(err => alert("Błąd odrzucania: " + err.message));
    };

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 fw-bold text-primary">
                <i className="bi bi-briefcase-fill me-2"></i>
                Panel Managera
            </h2>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <>
                    {pendingTrips.length === 0 ? (
                        <div className="alert alert-success d-flex align-items-center">
                            <i className="bi bi-check-circle-fill fs-3 me-3"></i>
                            <div>
                                <strong>Brak oczekujących wniosków.</strong>
                                <div className="small">Wszystkie delegacje zostały obsłużone. Dobra robota!</div>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {pendingTrips.map(trip => (
                                <div className="col-md-6 col-lg-4" key={trip.id}>
                                    <div className="card h-100 shadow-sm border-0">
                                        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                                            <div>
                                                <h6 className="card-subtitle text-muted text-uppercase small ls-1 mb-1">Wnioskodawca</h6>
                                                <h5 className="mb-0 fw-bold text-dark">{trip.user?.firstName} {trip.user?.lastName}</h5>
                                            </div>
                                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                                                <i className="bi bi-hourglass-split me-1"></i> Oczekuje
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <div className="d-flex align-items-center mb-3">
                                               <div className="bg-light p-2 rounded me-3 text-center" style={{minWidth: '60px'}}>
                                                   <div className="fw-bold fs-4">{new Date(trip.startDate).getDate()}</div>
                                                   <small className="text-uppercase text-muted" style={{fontSize: '10px'}}>
                                                       {new Date(trip.startDate).toLocaleString('pl-PL', { month: 'short' })}
                                                   </small>
                                               </div>
                                               <div className="flex-grow-1">
                                                   <h5 className="text-primary fw-bold mb-0">{trip.destination?.name}</h5>
                                                   <div className="small text-muted">{trip.destination?.country?.name || "Kraj"}</div>
                                               </div>
                                            </div>

                                            <p className="card-text text-muted mb-3 bg-light p-2 rounded small">
                                                <i className="bi bi-chat-quote-fill me-2 opacity-50"></i>
                                                {trip.purpose}
                                            </p>

                                            <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
                                                 <div>
                                                     <div className="small text-muted text-uppercase">Szacowany Koszt</div>
                                                     <div className="fw-bold fs-5 text-dark">
                                                         {trip.estimatedCost ? `${parseFloat(trip.estimatedCost).toFixed(2)} PLN` : '-'}
                                                     </div>
                                                 </div>
                                                 <button 
                                                    className="btn btn-sm btn-outline-primary rounded-pill"
                                                    onClick={() => navigate(`/trips/${trip.id}`)}
                                                 >
                                                     Szczegóły <i className="bi bi-arrow-right"></i>
                                                 </button>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-white border-top-0 d-flex gap-2 pb-3">
                                            {rejectingId === trip.id ? (
                                                <div className="w-100">
                                                    <input 
                                                        type="text" 
                                                        className="form-control mb-2" 
                                                        placeholder="Powód odrzucenia..."
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-danger btn-sm flex-grow-1" onClick={confirmReject}>Potwierdź</button>
                                                        <button className="btn btn-secondary btn-sm flex-grow-1" onClick={() => setRejectingId(null)}>Anuluj</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button 
                                                        className="btn btn-success flex-grow-1"
                                                        onClick={() => handleApprove(trip.id)}
                                                    >
                                                        <i className="bi bi-check-lg me-1"></i> Zatwierdź
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger flex-grow-1"
                                                        onClick={() => handleRejectClick(trip.id)}
                                                    >
                                                        <i className="bi bi-x-lg me-1"></i> Odrzuć
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManagerDashboardPage;
