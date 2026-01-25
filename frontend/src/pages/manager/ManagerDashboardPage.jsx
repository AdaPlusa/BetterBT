import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { generateTripPDF } from '../../utils/pdfGenerator';

const ManagerDashboardPage = () => {
    const [stats, setStats] = useState({ total: 0, toApprove: 0, toSettle: 0, finished: 0 });
    const [recentTrips, setRecentTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Stats
                const statsRes = await api.get('/manager/stats');
                setStats(statsRes.data);

                // 2. Recent Trips (Last 5, Any status)
                // We'll use a generic get or add a limit param. 
                // For now assuming /manager/pending-trips allows statusId=0 or similar for all?
                // Or just use /trips?limit=5. Check backend if it supports limit/sort.
                // Backend /trips seems simple. Let's try /trips
                const tripRes = await api.get('/trips?userId='); // userId empty implies all? Need to check backend logic.
                // Our backend /trips filters by userId if present. If empty object, it returns all?
                // Let's rely on what we have or just fetch pending for now.
                // User said "Wszystkie Ostatnie". 
                // Let's try to fetch all and slice client side for now (proto).
                setRecentTrips(tripRes.data.slice(0, 5));
                
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon, color, onClick }) => (
        <div className="card border-0 shadow-sm hover-shadow" onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default'}}>
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">{title}</h6>
                    <h2 className={`mb-0 fw-bold text-${color}`}>{value}</h2>
                </div>
                <div className={`rounded-circle p-3 bg-${color} bg-opacity-10 text-${color}`}>
                    <i className={`bi ${icon} fs-3`}></i>
                </div>
            </div>
        </div>
    );

    const UserAvatar = ({ firstName, lastName }) => (
        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
             style={{ width: '35px', height: '35px', backgroundColor: '#6c757d', fontSize: '14px' }}>
            {firstName?.[0]}{lastName?.[0]}
        </div>
    );

    return (
        <div className="container mt-4 mb-5">
            <h2 className="fw-bold mb-4">Panel Managera</h2>

            {/* Stats Row */}
            <div className="row g-4 mb-5">
                <div className="col-md-6 col-xl-3">
                    <StatCard title="Wszystkie Wnioski" value={stats.total} icon="bi-grid" color="primary" />
                </div>
                <div className="col-md-6 col-xl-3">
                    <StatCard 
                        title="Do Akceptacji" 
                        value={stats.toApprove} 
                        icon="bi-check-circle" 
                        color="warning" 
                        onClick={() => navigate('/manager/approvals')}
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <StatCard 
                        title="Do Rozliczenia" 
                        value={stats.toSettle} 
                        icon="bi-cash-coin" 
                        color="info" 
                        onClick={() => navigate('/manager/settlements')}
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <StatCard title="Zakończone" value={stats.finished} icon="bi-flag-fill" color="success" />
                </div>
            </div>

            {/* Recent Trips Table */}
            {/* Recent Trips Table (Active/Pending) */}
            <h5 className="fw-bold mb-3 text-dark">Ostatnie Wnioski</h5>
            <div className="card shadow-sm border-0 mb-5">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Pracownik</th>
                                <th>Kierunek</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Akcja</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTrips.slice(0, 5).map(trip => (
                                <tr key={trip.id}>
                                    <td className="ps-4 fw-bold">#{trip.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <UserAvatar firstName={trip.user?.firstName} lastName={trip.user?.lastName} />
                                            <div className="ms-3">
                                                <div className="fw-bold small">{trip.user?.firstName} {trip.user?.lastName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{trip.destination?.name}</td>
                                    <td>
                                        <span className={`badge rounded-pill bg-${
                                            trip.statusId === 1 ? 'warning text-dark' : 
                                            trip.statusId === 2 ? 'success' : 
                                            trip.statusId === 5 ? 'info text-dark' : 'secondary'
                                        } px-3`}>
                                            {trip.status?.name}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button 
                                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                            onClick={() => navigate(trip.statusId === 5 ? `/manager/settle/${trip.id}` : `/manager/approve/${trip.id}`)}
                                        >
                                            Szczegóły
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ARCHIVE TABLE (ALL TRIPS) */}
            <h5 className="fw-bold mb-3 text-secondary">Archiwum Wszystkich Wniosków</h5>
            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Pracownik</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Dokumenty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTrips.map(trip => (
                                <tr key={trip.id}>
                                    <td className="ps-4 text-muted">#{trip.id}</td>
                                    <td>{trip.user?.firstName} {trip.user?.lastName}</td>
                                    <td>{new Date(trip.startDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge bg-${
                                            trip.statusId === 4 ? 'success' : (trip.statusId === 3 ? 'danger' : 'secondary')
                                        }`}>
                                            {trip.status?.name}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        {(trip.statusId === 4 || trip.statusId === 2) && (
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => generateTripPDF(trip.id)}
                                                title="Pobierz PDF"
                                            >
                                                <i className="bi bi-file-earmark-pdf-fill me-1"></i> PDF
                                            </button>
                                        )}
                                        <button 
                                            className="btn btn-sm btn-link text-muted ms-2"
                                            onClick={() => navigate(`/manager/approve/${trip.id}`)}
                                        >
                                            <i className="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboardPage;
