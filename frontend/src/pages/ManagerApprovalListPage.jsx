import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const ManagerApprovalListPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Status 1 = Do Akceptacji
        api.get('/manager/pending-trips?statusId=1')
           .then(res => {
               setTrips(res.data);
               setLoading(false);
           })
           .catch(() => setLoading(false));
    }, []);

    return (
        <div className="container mt-4">
            <h3 className="fw-bold mb-4">Wnioski do Akceptacji</h3>
            {/* List/Grid of trips similar to simple dashboard */}
            <div className="row g-3">
                {trips.map(trip => (
                    <div className="col-md-6 col-lg-4" key={trip.id}>
                        <div className="card shadow-sm border-0 h-100">
                             <div className="card-body">
                                 <h5 className="fw-bold">Wniosek #{trip.id}</h5>
                                 <p className="mb-1">{trip.user?.firstName} {trip.user?.lastName}</p>
                                 <p className="text-muted small">Do: {trip.destination?.name}</p>
                                 <button className="btn btn-warning w-100 mt-2" onClick={() => navigate(`/manager/approve/${trip.id}`)}>
                                     Rozpatrz
                                 </button>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerApprovalListPage;
