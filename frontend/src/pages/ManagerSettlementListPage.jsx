import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ManagerSettlementListPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Status 5 = Do Rozliczenia
        api.get('/manager/pending-trips?statusId=5')
           .then(res => {
               setTrips(res.data);
               setLoading(false);
           })
           .catch(() => setLoading(false));
    }, []);

    return (
        <div className="container mt-4">
            <h3 className="fw-bold mb-4">Wnioski do Rozliczenia</h3>
            <div className="row g-3">
                {trips.map(trip => (
                    <div className="col-md-6 col-lg-4" key={trip.id}>
                         <div className="card shadow-sm border-0 h-100">
                             <div className="card-body">
                                 <div className="d-flex justify-content-between mb-2">
                                     <h5 className="fw-bold">#{trip.id}</h5>
                                     <span className="badge bg-info text-dark">Weryfikacja</span>
                                 </div>
                                 <p className="mb-1 fw-bold">{trip.user?.firstName} {trip.user?.lastName}</p>
                                 <p className="text-muted small">{trip.destination?.name}</p>
                                 <button className="btn btn-dark w-100 mt-3" onClick={() => navigate(`/manager/settle/${trip.id}`)}>
                                     Weryfikuj Rozliczenie
                                 </button>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerSettlementListPage;
