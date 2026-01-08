import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const MyTripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [filter, setFilter] = useState('all'); // all, future, finished
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);

                const res = await api.get(`/trips?userId=${user.id}`);
                setTrips(res.data);
            } catch (error) {
                console.error("Error fetching trips:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const now = new Date();

    const filteredTrips = trips.filter(trip => {
        const endDate = new Date(trip.endDate);
        if (filter === 'future') return endDate >= now;
        if (filter === 'finished') return endDate < now;
        return true;
    });

    const getStatusBadge = (statusName) => {
        switch(statusName) {
            case 'Nowa': return 'warning text-dark';
            case 'Zatwierdzona': return 'success';
            case 'Odrzucona': return 'danger';
            case 'Rozliczona': return 'secondary';
            default: return 'light text-dark';
        }
    };

    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('pl-PL') : '-';

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Moje Delegacje</h2>
                <Link to="/trip-wizard" className="btn btn-primary shadow-sm">
                    <i className="bi bi-plus-lg me-2"></i>Nowy Wniosek
                </Link>
            </div>

            {/* FILTRY */}
            <div className="btn-group mb-4 shadow-sm" role="group">
                <button 
                    type="button" 
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setFilter('all')}
                >
                    Wszystkie
                </button>
                <button 
                    type="button" 
                    className={`btn ${filter === 'future' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setFilter('future')}
                >
                    Nadchodzące
                </button>
                <button 
                    type="button" 
                    className={`btn ${filter === 'finished' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setFilter('finished')}
                >
                    Zakończone
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="ps-4 py-3">ID</th>
                                <th className="py-3">Cel & Kierunek</th>
                                <th className="py-3">Termin</th>
                                <th className="py-3">Koszt (Est.)</th>
                                <th className="py-3">Status</th>
                                <th className="text-end pe-4 py-3">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map(trip => (
                                <tr key={trip.id}>
                                    <td className="ps-4 fw-bold text-muted small">#{trip.id}</td>
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
                                        <Link 
                                            to={`/trips/${trip.id}`} 
                                            className="btn btn-sm btn-outline-primary fw-bold"
                                        >
                                            Podgląd
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredTrips.length === 0 && (
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
