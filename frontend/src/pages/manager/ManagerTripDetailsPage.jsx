import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useNotification } from '../../context/NotificationContext';

const ManagerTripDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notify } = useNotification();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
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
        api.patch(`/manager/approve/${id}`)
           .then(() => {
               notify("Wniosek został zatwierdzony!");
               navigate('/manager');
           })
           .catch(() => notify("Wystąpił błąd podczas zatwierdzania.", "error"));
    };

    const handleReject = () => {
        if (!rejectReason) return notify("Podaj powód odrzucenia!", "error");
        api.patch(`/manager/reject/${id}`, { reason: rejectReason })
           .then(() => {
               notify("Wniosek został odrzucony.");
               navigate('/manager');
           })
           .catch(() => notify("Wystąpił błąd podczas odrzucania.", "error"));
    };

    const handleSettleApprove = () => {
        if (!window.confirm("Zatwierdzić rozliczenie i zamknąć delegację?")) return;
        api.patch(`/manager/settle-finish/${id}`)
            .then(() => {
                notify("Rozliczenie zatwierdzone pomyślnie!");
                navigate('/manager');
            })
            .catch(err => notify("Błąd: " + err.message, "error"));
    };

    const handleSettleReturn = () => {
        if (!window.confirm("Cofnąć do pracownika do poprawy?")) return;
        api.patch(`/manager/settle-return/${id}`)
            .then(() => {
                notify("Wniosek zwrócony do poprawy.");
                navigate('/manager');
            })
            .catch(err => notify("Błąd: " + err.message, "error"));
    };

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;
    if (!trip) return <div className="p-5 text-center">Nie znaleziono delegacji.</div>;

    // Calculate Total Estimated Cost (Matches User Settlement Logic)
    const calculateTotalCost = () => {
        let total = 0;
        const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        const nights = Math.max(0, days - 1); // Hotel nights = days - 1
        
        // 1. Hotel
        if (trip.hotel?.price) {
            total += parseFloat(trip.hotel.price) * nights;
        }

        // 2. Transport
        if (trip.transportRoute?.price) {
            total += parseFloat(trip.transportRoute.price);
        }

        // 3. Diets
        const perDiemRate = trip.destination?.country?.perDiemRate ? parseFloat(trip.destination.country.perDiemRate) : 45;
        total += perDiemRate * days;

        return { total, days, nights };
    };

    const { total: estimatedTotal, days, nights } = calculateTotalCost();
    
    // Use Final Settlement Amount if available, otherwise Estimated
    const finalCost = trip.settlement?.totalAmount ? parseFloat(trip.settlement.totalAmount) : null;
    const displayedCost = finalCost || estimatedTotal;
    const isOverBudget = displayedCost > 5000;
    
    const budgetStatus = isOverBudget ? 'warning' : 'success';
    const budgetText = isOverBudget ? 'Wymaga uwagi (> 5000 PLN)' : 'OK (w limicie)';
    const isSettlementPhase = trip.status?.name === 'Wysłana do rozliczenia' || trip.status?.name === 'Rozliczona'; // Check status logic

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
                                <div className="col-md-8 fst-italic">{trip.purpose}</div>
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
                                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()} <span className="text-muted ms-2">({days} dni)</span>
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
                                         <i className={`bi ${trip.transportRoute.transportTypeId === 1 ? 'bi-airplane' : 'bi-train-front'} fs-4`}></i>Transport
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
                                               
                                                 <div className="fw-bold text-success mt-1">
                                                     {trip.hotel.price ? `${parseFloat(trip.hotel.price).toFixed(2)} PLN / noc` : 'Cena nieznana'}
                                                 </div>
                                                  {/* Show calculated nights cost */}
                                                  {trip.hotel.price && (
                                                      <div className="small text-muted mt-1">
                                                          Razem: {(parseFloat(trip.hotel.price) * nights).toFixed(2)} PLN ({nights} nocy)
                                                      </div>
                                                  )}
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
                                            {trip.settlement.items?.map((item, idx) => {
                                                // Fallback: check if payer is set, OR if description implies Company
                                                const isEmployer = item.payer === 'employer' || item.description?.startsWith('[Firma]'); 
                                                const badgeClass = isEmployer ? 'bg-info text-dark' : 'bg-warning text-dark';
                                                const payerLabel = isEmployer ? 'Firma' : 'Pracownik';

                                                return (
                                                    <tr key={idx}>
                                                        <td className="ps-4 fw-medium">{item.description}</td>
                                                        <td>
                                                            <span className={`badge rounded-pill px-3 fw-normal ${badgeClass}`}>
                                                                {payerLabel}
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
                                                );
                                            })}
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
                            <h6 className="text-secondary text-uppercase fw-bold small mb-2">
                                {finalCost ? 'Całkowity Koszt (Rozliczenie)' : 'Budżet Planowany (Estymacja)'}
                            </h6>
                            <h2 className="fw-bold mb-1 display-6">{displayedCost.toFixed(2)} PLN</h2>
                            <div className={`text-${budgetStatus} fw-bold small mt-2`}>
                                <i className={`bi bi-${budgetStatus === 'warning' ? 'exclamation-triangle' : 'check-circle'} me-1`}></i>
                                {budgetText}
                            </div>
                             {finalCost && estimatedTotal !== finalCost && (
                                <div className="mt-3 pt-3 border-top bg-light rounded p-2 d-flex justify-content-between align-items-center">
                                    <span className="text-secondary fw-bold small text-uppercase">
                                        <i className="bi bi-clipboard-data me-2"></i>Planowano
                                    </span>
                                    <span className="fs-5 fw-bold text-dark">{estimatedTotal.toFixed(2)} PLN</span>
                                </div>
                            )}
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
                                     <button className="btn btn-success py-3 fw-bold shadow-sm" onClick={() => setShowApproveModal(true)} disabled={trip.status?.name !== 'Nowa'}>
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

            {/* Approval Modal */}
            <ConfirmModal 
                show={showApproveModal}
                title="Zatwierdzenie Wniosku"
                message="Czy na pewno chcesz zatwierdzić ten wniosek delegacyjny?"
                confirmLabel="Zatwierdź"
                variant="success"
                icon="bi-check-circle"
                onClose={() => setShowApproveModal(false)}
                onConfirm={handleApprove}
            />

            {/* Rejection Modal */}
            <ConfirmModal 
                show={showRejectModal}
                title="Odrzucenie Wniosku"
                // Message optional, using children for textarea
                confirmLabel="Potwierdź Odrzucenie"
                variant="danger"
                icon="bi-x-circle"
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleReject}
            >
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
            </ConfirmModal>
        </div>
    );
};
export default ManagerTripDetailsPage;
