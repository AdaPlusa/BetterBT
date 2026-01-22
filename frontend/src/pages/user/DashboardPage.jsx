import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        usersCount: 0,
        activeTripsCount: 0,
        pendingTripsCount: 0,
        citiesCount: 0,
        hotelsCount: 0
    });
    const [userStats, setUserStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });
    
    const [recentTrips, setRecentTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState('');
    const roleId = sessionStorage.getItem('roleId');

    useEffect(() => {
        if (roleId === '3') {
            navigate('/manager');
        }
    }, [roleId, navigate]);

    useEffect(() => {
        const checkRoleAndLoadData = async () => {
             // roleId used from component scope
            const userStr = sessionStorage.getItem('user');
            let user = null;
            let admin = false;

            if (userStr) {
                user = JSON.parse(userStr);
                setUserName(user.firstName || 'Użytkowniku');
            }

            if (roleId === '1' ) {
                admin = true;
                setIsAdmin(true);
            } else if (roleId === '3') {
                setLoading(false); 
                return;
            } else {
                setIsAdmin(false);
            }

       try {
                if (admin) {
                     // === DANE ADMINA (Wersja Uproszczona) ===
                    
                    // 1. Pobieramy dane RÓWNOLEGLE (wszystkie naraz)
                    // TERAZ: Pobieramy tylko liczniki (stats) i 5 ostatnich delegacji
                    const [statsRes, tripsRes] = await Promise.all([
                        api.get('/manager/stats'),
                        api.get('/trips?limit=5')
                    ]);

                    const statsData = statsRes.data;
                    const recentTripsData = tripsRes.data;
            
                    setStats({
                        usersCount: statsData.usersCount || 0,
                        activeTripsCount: statsData.toApprove || 0, // 'toApprove' to są 'Nowe' (statusId=1)
                        totalTripsCount: statsData.total || 0,
                        citiesCount: statsData.citiesCount || 0,
                        hotelsCount: statsData.hotelsCount || 0
                    });

                    setRecentTrips(recentTripsData);

                } else {
                    // === DANE PRACOWNIKA ===
                    if (!user) return;
                    const res = await api.get(`/trips?userId=${user.id}`);
                    const myTrips = res.data || [];

                    const pending = myTrips.filter(t => t.statusId === 1).length;
                    const approved = myTrips.filter(t => t.statusId === 2).length;
                    const rejected = myTrips.filter(t => t.statusId === 3).length;

                    setUserStats({ pending, approved, rejected });
                    setRecentTrips([...myTrips].sort((a, b) => b.id - a.id).slice(0, 3));
                }
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkRoleAndLoadData();
    }, []);

    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('pl-PL') : '-';
    
    const getStatusBadge = (statusName) => {
        switch(statusName) {
            case 'Nowa': return 'warning text-dark';
            case 'Zatwierdzona': return 'success';
            case 'Odrzucona': return 'danger';
            case 'Rozliczona': return 'secondary';
            default: return 'light text-dark';
        }
    };

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;

    // --- WIDOK ADMINA ---
    if (isAdmin) {
        return (
            <div className="container mt-4">
                <h2 className="mb-4 text-primary fw-bold">Pulpit Administratora</h2>
                <div className="row g-4 mb-5">
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
                            <div className="card-body">
                                <h6 className="text-secondary text-uppercase fw-bold small">Użytkownicy</h6>
                                <h2 className="display-6 fw-bold text-dark my-2">{stats.usersCount}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
                            <div className="card-body">
                                <h6 className="text-secondary text-uppercase fw-bold small">Aktywne (Nowe)</h6>
                                <h2 className="display-6 fw-bold text-dark my-2">{stats.activeTripsCount}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                            <div className="card-body">
                                <h6 className="text-secondary text-uppercase fw-bold small">Wszystkie Delegacje</h6>
                                <h2 className="display-6 fw-bold text-dark my-2">{stats.totalTripsCount}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
                            <div className="card-body">
                                <h6 className="text-secondary text-uppercase fw-bold small">Baza Wiedzy</h6>
                                <div className="d-flex align-items-baseline gap-2">
                                    <h3 className="mb-0 fw-bold">{stats.citiesCount}</h3> <span className="text-muted small">Miast</span>
                                    <h3 className="mb-0 fw-bold">{stats.hotelsCount}</h3> <span className="text-muted small">Hoteli</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="mb-0 fw-bold text-secondary">Ostatnie Wnioski</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">Kto?</th>
                                    <th>Gdzie?</th>
                                    <th>Kiedy?</th>
                                    <th className="text-end pe-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTrips.map(trip => (
                                    <tr key={trip.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold">{trip.user?.firstName} {trip.user?.lastName}</div>
                                            <small className="text-muted">{trip.user?.email}</small>
                                        </td>
                                        <td><span className="fw-bold text-primary">{trip.destination?.name}</span></td>
                                        <td>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</td>
                                        <td className="text-end pe-4">
                                            <span className={`badge bg-${getStatusBadge(trip.status?.name)} rounded-pill px-3`}>{trip.status?.name}</span>
                                        </td>
                                    </tr>
                                ))}
                                {recentTrips.length === 0 && <tr><td colSpan="4" className="text-center py-4">Brak danych</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- WIDOK PRACOWNIKA ---
    return (
        <div className="container mt-4">
            <div className="mb-5 p-4 rounded-3 text-white shadow-sm d-flex align-items-center justify-content-between" 
                 style={{ background: 'linear-gradient(135deg, #0072DE 0%, #00C6FB 100%)' }}>
                <div>
                    <h1 className="fw-bold mb-1">Cześć, {userName}! 👋</h1>
                    <p className="mb-0 opacity-75">Gotowy na kolejną podróż?</p>
                </div>
                <div className="text-end d-none d-md-block">
                    <span className="h1 fw-bold opacity-50"><i className="bi bi-airplane-engines"></i></span>
                </div>
            </div>

            {/* SEKCJA NA SKRÓTY */}
            <h5 className="fw-bold text-secondary mb-3">Na Skróty</h5>
            <div className="row g-3 mb-5">
                <div className="col-md-6">
                    <Link to="/trip-wizard" className="text-decoration-none">
                        <div className="card border-0 shadow-sm p-3 h-100 text-center hover-scale" style={{transition: 'transform 0.2s'}}> 
                            <div className="card-body">
                                <div className="display-4 text-primary mb-3">+</div>
                                <h4 className="fw-bold text-dark">Złóż Nowy Wniosek</h4>
                                <small className="text-muted">Kreator krok po kroku</small>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-6">
                    <Link to="/my-trips?filter=settle" className="text-decoration-none">
                        <div className="card border-0 shadow-sm p-3 h-100 text-center hover-scale" style={{transition: 'transform 0.2s', background: '#e8f5e9'}}>
                            <div className="card-body">
                                <div className="display-4 text-success mb-3">€</div>
                                <h4 className="fw-bold text-dark">Rozlicz Delegację</h4>
                                <small className="text-muted">Lista wniosków do rozliczenia</small>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* TWOJE STATUSY */}
            <h5 className="fw-bold text-secondary mb-3">Twój Status</h5>
            <div className="row g-3 mb-5">
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3 border-top border-4 border-warning">
                        <h3 className="fw-bold text-dark mb-0">{userStats.pending}</h3>
                        <small className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.7rem'}}>Oczekujące</small>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3 border-top border-4 border-success">
                        <h3 className="fw-bold text-dark mb-0">{userStats.approved}</h3>
                        <small className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.7rem'}}>Zatwierdzone</small>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3 border-top border-4 border-danger">
                        <h3 className="fw-bold text-dark mb-0">{userStats.rejected}</h3>
                        <small className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.7rem'}}>Odrzucone</small>
                    </div>
                </div>
            </div>

            {/* OSTATNIE AKTYWNOŚCI */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-secondary">Twoje Ostatnie Wnioski</h5>
                    <Link to="/my-trips?filter=all" className="text-decoration-none small text-primary fw-bold cursor-pointer">Zobacz wszystkie</Link>
                </div>
                <div className="table-responsive">
                    <table className="table mb-0 align-middle">
                        <thead className="text-secondary bg-light small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3">Cel & Kierunek</th>
                                <th className="py-3">Data</th>
                                <th className="text-end pe-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTrips.map(trip => (
                                <tr key={trip.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{trip.destination?.name}</div>
                                        <small className="text-muted">{trip.purpose}</small>
                                    </td>
                                    <td>
                                        <div className="text-dark small fw-bold">
                                            {formatDate(trip.startDate)}
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <span className={`badge bg-${getStatusBadge(trip.status?.name)} rounded-pill`}>
                                            {trip.status?.name}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentTrips.length === 0 && (
                                <tr><td colSpan="3" className="text-center py-4 text-muted">Jeszcze nie podróżowałeś!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
