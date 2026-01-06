import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const DashboardPage = () => {
    // === STAN DANYCH ===
    const [stats, setStats] = useState({
        usersCount: 0,
        activeTripsCount: 0,
        pendingTripsCount: 0,
        citiesCount: 0,
        hotelsCount: 0
    });
    const [recentTrips, setRecentTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // === POBIERANIE DANYCH ===
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Używamy Promise.allSettled, żeby błąd jednego zapytania nie wysadził całego dashboardu
                const results = await Promise.allSettled([
                    api.get('/users'),
                    api.get('/trips'),
                    api.get('/cities'),
                    api.get('/hotels')
                ]);

                // Wyniki: results[0] = users, results[1] = trips, itd.
                const users = results[0].status === 'fulfilled' ? results[0].value.data : [];
                const trips = results[1].status === 'fulfilled' ? results[1].value.data : [];
                const cities = results[2].status === 'fulfilled' ? results[2].value.data : [];
                const hotels = results[3].status === 'fulfilled' ? results[3].value.data : [];

                if (results[0].status === 'rejected') console.error("Error fetching users:", results[0].reason);
                if (results[1].status === 'rejected') console.error("Error fetching trips:", results[1].reason);

                // --- OBLICZENIA STATYSTYK ---
                const now = new Date();

                // 1. Aktywne Delegacje
                const activeTrips = trips.filter(t => {
                    const statusOk = t.status?.name === 'Zatwierdzona';
                    const start = new Date(t.startDate);
                    const end = new Date(t.endDate);
                    return statusOk && now >= start && now <= end;
                });

                // 2. Oczekujące
                const pendingTrips = trips.filter(t => t.status?.name === 'Nowa');

                setStats({
                    usersCount: users.length,
                    activeTripsCount: activeTrips.length,
                    pendingTripsCount: pendingTrips.length,
                    citiesCount: cities.length,
                    hotelsCount: hotels.length
                });

                // --- TABELA ---
                const sortedTrips = [...trips].sort((a, b) => b.id - a.id);
                setRecentTrips(sortedTrips.slice(0, 5));

            } catch (error) {
                console.error("Critical dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const formatDate = (dateStr) => {
        if(!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pl-PL');
    };

    const getStatusBadge = (statusName) => {
        switch(statusName) {
            case 'Nowa': return 'warning text-dark';
            case 'Zatwierdzona': return 'success';
            case 'Odrzucona': return 'danger';
            case 'Rozliczona': return 'secondary';
            default: return 'light text-dark';
        }
    };

    if (loading) return <div className="p-5 text-center">Ładowanie pulpitu...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-primary fw-bold">Pulpit Nawigacyjny</h2>

            {/* STATYSTYKI */}
            <div className="row g-4 mb-5">
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
                        <div className="card-body">
                            <h6 className="text-secondary text-uppercase fw-bold small">Liczba Użytkowników</h6>
                            <h2 className="display-6 fw-bold text-dark my-2">{stats.usersCount}</h2>
                            <small className="text-muted">Pracowników w bazie</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
                        <div className="card-body">
                            <h6 className="text-secondary text-uppercase fw-bold small">Aktywne Delegacje</h6>
                            <h2 className="display-6 fw-bold text-dark my-2">{stats.activeTripsCount}</h2>
                            <small className="text-muted">Obecnie w podróży</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                        <div className="card-body">
                            <h6 className="text-secondary text-uppercase fw-bold small">Oczekujące Wnioski</h6>
                            <h2 className="display-6 fw-bold text-dark my-2">{stats.pendingTripsCount}</h2>
                            <small className="text-muted">Wymaga akceptacji</small>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
                        <div className="card-body">
                            <h6 className="text-secondary text-uppercase fw-bold small">Baza Wiedzy</h6>
                            <div className="d-flex align-items-baseline gap-2">
                                <h3 className="mb-0 fw-bold">{stats.citiesCount}</h3> 
                                <span className="text-muted small">Miast</span>
                                <span className="text-muted mx-1">/</span>
                                <h3 className="mb-0 fw-bold">{stats.hotelsCount}</h3>
                                <span className="text-muted small">Hoteli</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABELA - BEZ PRZYCISKU NOWY ETAP */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-0">
                    <h5 className="mb-0 fw-bold text-secondary">Ostatnie Wnioski</h5>
                    {/* Przycisk usunięty zgodnie z życzeniem */}
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
                                        <div className="fw-bold text-dark">
                                            {trip.user?.firstName} {trip.user?.lastName}
                                        </div>
                                        <small className="text-muted">{trip.user?.email}</small>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-primary">{trip.destination?.name}</div>
                                        <small className="text-muted">Cel: {trip.purpose}</small>
                                    </td>
                                    <td>
                                        <div className="text-dark">
                                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <span className={`badge bg-${getStatusBadge(trip.status?.name)} rounded-pill px-3`}>
                                            {trip.status?.name}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentTrips.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        Brak wniosków w systemie.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
