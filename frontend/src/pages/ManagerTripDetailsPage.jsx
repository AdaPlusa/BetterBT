import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ManagerTripDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        api.get(`/trips/${id}`)
           .then(res => {
               setTrip(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, [id]);

    const handleApprove = () => {
        if (!window.confirm("Zatwierdzić wniosek?")) return;
        api.patch(`/manager/approve/${id}`)
           .then(() => {
               alert("Zatwierdzono!");
               navigate('/manager');
           })
           .catch(() => alert("Błąd."));
    };

    const handleReject = () => {
        if (!rejectReason) return alert("Podaj powód!");
        api.patch(`/manager/reject/${id}`, { reason: rejectReason })
           .then(() => {
               alert("Odrzucono.");
               navigate('/manager');
           })
           .catch(() => alert("Błąd."));
    };

    const handleSettleApprove = () => {
        if (!window.confirm("Zatwierdzić rozliczenie i zamknąć delegację?")) return;
        api.patch(`/manager/settle-finish/${id}`)
            .then(() => {
                alert("Rozliczenie zatwierdzone!");
                navigate('/manager');
            })
            .catch(err => alert("Błąd: " + err.message));
    };

    const handleSettleReturn = () => {
        if (!window.confirm("Cofnąć do pracownika do poprawy?")) return;
        api.patch(`/manager/settle-return/${id}`)
            .then(() => {
                alert("Zwrócono do poprawy.");
                navigate('/manager');
            })
            .catch(err => alert("Błąd: " + err.message));
    };

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;
    if (!trip) return <div className="p-5 text-center">Nie znaleziono delegacji.</div>;

    const budgetStatus = parseFloat(trip.estimatedCost || 0) > 2000 ? 'warning' : 'success';
    const budgetText = budgetStatus === 'warning' ? 'Wymaga uwagi (> 2000 PLN)' : 'OK (w limicie)';
    const isSettlementPhase = trip.status?.name === 'Wysłana do rozliczenia';

    return (
        <div className="container mt-4 mb-5">
             {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">
                    <button className="btn btn-link text-dark p-0 me-3 text-decoration-none" onClick={() => navigate('/manager')}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    Wniosek #{trip.id}
                </h2>
                <span className={`badge bg-${trip.status?.name === 'Nowa' ? 'warning text-dark' : isSettlementPhase ? 'info text-dark' : 'secondary'} px-3 py-2 fs-6`}>
                    Status: {trip.status?.name}
                </span>
            </div>

            <div className="row g-4">
                {/* Details Column */}
                <div className="col-lg-8">
                    {/* Basic Info */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-primary">Szczegóły Wyjazdu</h5>
                        </div>
                        <div className="card-body">
                            <div className="row mb-3 align-items-center">
                                <div className="col-md-4 text-muted small text-uppercase fw-bold">Pracownik</div>
                                <div className="col-md-8">
                                    <div className="fw-bold fs-5">{trip.user?.firstName} {trip.user?.lastName}</div>
                                    <div className="text-muted small">{trip.user?.email}</div>
                                </div>
                            </div>
                            <div className="row mb-3 align-items-center">
                                <div className="col-md-4 text-muted small text-uppercase fw-bold">Cel Wyjazdu</div>
                                <div className="col-md-8 fst-italic">"{trip.purpose}"</div>
                            </div>
                            <div className="row mb-3 align-items-center">
                                <div className="col-md-4 text-muted small text-uppercase fw-bold">Kierunek</div>
                                <div className="col-md-8 fw-bold text-primary">
                                    <i className="bi bi-geo-alt-fill me-2"></i>
                                    {trip.destination?.country?.name}, {trip.destination?.name}
                                </div>
                            </div>
                            <div className="row mb-3 align-items-center">
                                <div className="col-md-4 text-muted small text-uppercase fw-bold">Termin</div>
                                <div className="col-md-8">
                                    <i className="bi bi-calendar-range me-2 text-muted"></i>
                                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logistics: Transport & Hotel */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="mb-0 fw-bold text-secondary">Logistyka</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="row g-0">
                                {/* Transport Section */}
                                <div className="col-md-6 border-end p-4">
                                     <h6 className="text-uppercase text-muted fw-bold small mb-3">
                                         <i className="bi bi-airplane-engines-fill me-2"></i>Transport
                                     </h6>
                                     {trip.transportRoute ? (
                                         <div className="d-flex align-items-start">
                                             <div>
                                                 <div className="fw-bold fs-5">{trip.transportRoute.provider?.name}</div>
                                                 <div className="small text-muted">{trip.transportRoute.originCityId === 1 ? 'Warszawa' : 'Inne'} <i className="bi bi-arrow-right mx-1"></i> {trip.destination?.name}</div>
                                                 <div className="fw-bold text-success mt-1">{parseFloat(trip.transportRoute.price).toFixed(2)} PLN</div>
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="text-muted fst-italic">Brak szczegółów transportu.</div>
                                     )}
                                </div>
                                
                                {/* Hotel Section */}
                                <div className="col-md-6 p-4">
                                     <h6 className="text-uppercase text-muted fw-bold small mb-3">
                                         <i className="bi bi-building me-2"></i>Hotel
                                     </h6>
                                     {trip.hotel ? (
                                         <div className="d-flex align-items-start">
                                             {trip.hotel.imageUrl ? (
                                                 <img 
                                                     src={trip.hotel.imageUrl} 
                                                     alt="Hotel" 
                                                     className="rounded me-3 object-fit-cover shadow-sm"
                                                     style={{width: '80px', height: '60px'}}
                                                 />
                                             ) : (
                                                  <div className="me-3 bg-light rounded d-flex align-items-center justify-content-center shadow-sm" style={{width: '80px', height: '60px'}}>
                                                      <i className="bi bi-building text-muted"></i>
                                                  </div>
                                             )}
                                             <div>
                                                 <div className="fw-bold">{trip.hotel.name}</div>
                                                 <div className="small text-muted">{trip.hotel.standard} gwiazdki</div>
                                                 <div className="fw-bold text-success mt-1">
                                                     {trip.hotel.price ? `${parseFloat(trip.hotel.price).toFixed(2)} PLN / noc` : 'Cena nieznana'}
                                                 </div>
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="text-muted fst-italic">Brak szczegółów hotelu.</div>
                                     )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SETTLEMENT DETAILS Section */}
                    {trip.settlement && (
                        <div className="card shadow-sm border-0 mb-4 border-top border-5 border-info">
                            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-info">
                                    <i className="bi bi-calculator me-2"></i>Rozliczenie Kosztów
                                </h5>
                                <span className="badge bg-light text-dark border">
                                    Suma: {parseFloat(trip.settlement.totalAmount).toFixed(2)} PLN
                                </span>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light text-secondary text-uppercase small">
                                            <tr>
                                                <th className="ps-4">Opis</th>
                                                <th>Płatnik</th>
                                                <th>Kwota</th>
                                                <th className="text-end pe-4">Dokument</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trip.settlement.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4 fw-medium">{item.description}</td>
                                                    <td>
                                                        <span className={`badge rounded-pill px-3 fw-normal ${item.payer === 'employee' ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                                                            {item.payer === 'employee' ? 'Pracownik' : 'Firma'}
                                                        </span>
                                                    </td>
                                                    <td className="fw-bold">{parseFloat(item.amount).toFixed(2)} PLN</td>
                                                    <td className="text-end pe-4">
                                                        {item.receipt && (
                                                            <a 
                                                                href={`http://localhost:3000${item.receipt.fileUrl}`} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                <i className="bi bi-file-earmark-text me-1"></i> Zobacz
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Budget Column */}
                <div className="col-lg-4">
                     <div className={`card shadow-sm border-0 mb-4 border-start border-4 border-${budgetStatus}`}>
                        <div className="card-body">
                            <h6 className="text-secondary text-uppercase fw-bold small mb-2">Budżet Planowany</h6>
                            <h2 className="fw-bold mb-1 display-6">{trip.estimatedCost ? `${parseFloat(trip.estimatedCost).toFixed(2)} PLN` : '-'}</h2>
                            <div className={`text-${budgetStatus} fw-bold small mt-2`}>
                                <i className={`bi bi-${budgetStatus === 'warning' ? 'exclamation-triangle' : 'check-circle'} me-1`}></i>
                                {budgetText}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card shadow-sm border-0 sticky-top" style={{top: '20px', zIndex: 1}}>
                        <div className="card-body d-grid gap-2 p-4">
                             <div className="text-center mb-3 text-muted small text-uppercase fw-bold">Decyzja Managera</div>
                             
                             {isSettlementPhase ? (
                                 <>
                                     <button className="btn btn-info text-white py-3 fw-bold shadow-sm" onClick={handleSettleApprove}>
                                         <i className="bi bi-check-all me-2"></i> ZATWIERDŹ ROZLICZENIE
                                     </button>
                                     <button className="btn btn-outline-warning py-3 fw-bold" onClick={handleSettleReturn}>
                                         <i className="bi bi-arrow-counterclockwise me-2"></i> COFNIJ DO POPRAWY
                                     </button>
                                 </>
                             ) : (
                                 <>
                                     <button className="btn btn-success py-3 fw-bold shadow-sm" onClick={handleApprove} disabled={trip.status?.name !== 'Nowa'}>
                                         <i className="bi bi-check-lg me-2"></i> AKCEPTUJ WNIOSEK
                                     </button>
                                     <button className="btn btn-outline-danger py-3 fw-bold" onClick={() => setShowRejectModal(true)} disabled={trip.status?.name !== 'Nowa'}>
                                         <i className="bi bi-x-lg me-2"></i> ODRZUĆ
                                     </button>
                                 </>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejection Modal (Bootstrap Style Overlay) */}
            {showRejectModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title fw-bold">Odrzucenie Wniosku</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRejectModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Powód odrzucenia <span className="text-danger">*</span></label>
                                    <textarea 
                                        className="form-control" 
                                        rows="4" 
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Wpisz uzasadnienie..."
                                        autoFocus
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 pb-4 pe-4">
                                <button type="button" className="btn btn-light" onClick={() => setShowRejectModal(false)}>Anuluj</button>
                                <button type="button" className="btn btn-danger px-4 fw-bold" onClick={handleReject}>Potwierdź</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManagerTripDetailsPage;
