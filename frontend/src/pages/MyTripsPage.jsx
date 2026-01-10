import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const MyTripsPage = () => {
    const location = useLocation();
    // Default filter from URL or 'all'
    const getInitialFilter = () => {
        const params = new URLSearchParams(location.search);
        return params.get('filter') || 'all';
    };

    const [trips, setTrips] = useState([]);
    const [filter, setFilter] = useState(getInitialFilter); 
    const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setFilter(getInitialFilter());
    }, [location.search]);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
                if (!userStr) {
                    console.warn("MyTripsPage: No user logged in.");
                    setLoading(false);
                    return;
                }
                const user = JSON.parse(userStr);
                console.log("MyTripsPage: Fetching for user", user.id);

                const res = await api.get(`/trips?userId=${user.id}`);
                console.log("MyTripsPage: Loaded trips", res.data);
                setTrips(res.data);
            } catch (error) {
                console.error("Error fetching trips:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    // Filter Definitions
    const statusFilters = {
        all: [], // No filter ID means all
        settle: [2], // Zatwierdzona (Do rozliczenia)
        finished: [4], // Rozliczona
        in_progress: [1, 2, 5, 6], // Nowa, Zatwierdzona, Wysłana, Do poprawki
        attention: [3, 6] // Odrzucona, Do poprawki
    };

    const getFilteredTrips = () => {
        let filtered = [...trips];

        // 1. Status Filter
        const allowedStatuses = statusFilters[filter];
        if (allowedStatuses && allowedStatuses.length > 0) {
            filtered = filtered.filter(t => allowedStatuses.includes(t.statusId));
        }

        // 2. Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Handle date strings
                if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }

                if (valA < valB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusBadge = (statusName) => {
        switch(statusName) {
            case 'Nowa': return 'warning text-dark';
            case 'Zatwierdzona': return 'success'; // Ready to settle
            case 'Wysłana do rozliczenia': return 'info text-dark';
            case 'Odrzucona': return 'danger';
            case 'Do poprawki': return 'danger';
            case 'Rozliczona': return 'secondary';
            default: return 'light text-dark';
        }
    };

    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('pl-PL') : '-';

    const processedTrips = getFilteredTrips();

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Moje Delegacje</h2>
                <Link to="/trip-wizard" className="btn btn-primary shadow-sm">
                    <i className="bi bi-plus-lg me-2"></i>Nowy Wniosek
                </Link>
            </div>

            {/* FILTRY - TABS */}
            <ul className="nav nav-pills mb-4 shadow-sm bg-white p-2 rounded">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Wszystkie
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${filter === 'settle' ? 'active' : ''}`}
                        onClick={() => setFilter('settle')}
                    >
                        Do Rozliczenia
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${filter === 'in_progress' ? 'active' : ''}`}
                        onClick={() => setFilter('in_progress')}
                    >
                        W trakcie
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${filter === 'attention' ? 'active btn-outline-danger text-danger' : 'text-danger'}`}
                        onClick={() => setFilter('attention')}
                    >
                        <i className="bi bi-exclamation-triangle me-1"></i> Wymagające uwagi!
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${filter === 'finished' ? 'active' : ''}`}
                        onClick={() => setFilter('finished')}
                    >
                        Zakończone
                    </button>
                </li>
            </ul>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="ps-4 py-3" style={{cursor: 'pointer'}} onClick={() => handleSort('id')}>
                                    # {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-3" style={{cursor: 'pointer'}} onClick={() => handleSort('destination.name')}>
                                    Cel & Kierunek
                                </th>
                                <th className="py-3" style={{cursor: 'pointer'}} onClick={() => handleSort('startDate')}>
                                    Termin {sortConfig.key === 'startDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-3" style={{cursor: 'pointer'}} onClick={() => handleSort('estimatedCost')}>
                                    Koszt (Est.)
                                </th>
                                <th className="py-3" style={{cursor: 'pointer'}} onClick={() => handleSort('status.name')}>
                                    Status
                                </th>
                                <th className="text-end pe-4 py-3">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedTrips.map((trip, index) => (
                                <tr key={trip.id}>
                                    <td className="ps-4 fw-bold text-muted small">{index + 1}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{trip.destination?.name}</div>
                                        <small className="text-muted">{trip.purpose}</small>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column small">
                                            <span>Od: {formatDate(trip.startDate)}</span>
                                            <span>Do: {formatDate(trip.endDate)}</span>
                                        </div>
                                    </td>
                                    <td className="fw-bold text-secondary">
                                        {trip.estimatedCost ? `${trip.estimatedCost} PLN` : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge bg-${getStatusBadge(trip.status?.name)} rounded-pill`}>
                                            {trip.status?.name}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        {(trip.statusId === 2 || trip.statusId === 6) && (
                                            <Link 
                                                to={`/settlement/${trip.id}`} 
                                                className="btn btn-sm btn-success fw-bold me-2"
                                            >
                                                Rozlicz
                                            </Link>
                                        )}
                                        <Link 
                                            to={`/trips/${trip.id}`} 
                                            className="btn btn-sm btn-outline-primary fw-bold"
                                        >
                                            Podgląd
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {processedTrips.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Brak delegacji spełniających kryteria.
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

export default MyTripsPage;
