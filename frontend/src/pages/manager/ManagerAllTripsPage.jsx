import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { generateTripPDF } from '../../utils/pdfGenerator';
import * as XLSX from 'xlsx';

const ManagerAllTripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();
        const data = trips.map(t => ({
            ID: t.id,
            Pracownik: `${t.user?.firstName} ${t.user?.lastName}`,
            Email: t.user?.email,
            Cel: t.purpose,
            Kierunek: t.destination?.name,
            Kraj: t.destination?.country?.name,
            Data_Od: new Date(t.startDate).toLocaleDateString(),
            Data_Do: new Date(t.endDate).toLocaleDateString(),
            Status: t.status?.name,
            Szacowany_Koszt: t.estimatedCost
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Delegacje");
        XLSX.writeFile(wb, "Wszystkie_Delegacje.xlsx");
    };

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await api.get('/trips');
                setTrips(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    if (loading) return <div className="p-5 text-center">Ładowanie...</div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Wszystkie Wnioski Delegacyjne</h2>
                <button className="btn btn-success rounded-pill px-4" onClick={handleExportExcel}>
                    <i className="bi bi-file-earmark-spreadsheet-fill me-2"></i> Eksportuj do Excela
                </button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Pracownik</th>
                                <th>Cel</th>
                                <th>Kierunek</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Akcja</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map(trip => (
                                <tr key={trip.id}>
                                    <td className="ps-4 text-muted bold">#{trip.id}</td>
                                    <td>
                                        <div className="fw-bold">{trip.user?.firstName} {trip.user?.lastName}</div>
                                        <div className="small text-muted">{trip.user?.email}</div>
                                    </td>
                                    <td>{trip.purpose}</td>
                                    <td>{trip.destination?.name} ({trip.destination?.country?.name})</td>
                                    <td>{new Date(trip.startDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge bg-${
                                            trip.statusId === 4 ? 'success' : 
                                            (trip.statusId === 3 ? 'danger' : 
                                            (trip.statusId === 2 ? 'success' : 'secondary'))
                                        }`}>
                                            {trip.status?.name}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        {(trip.statusId === 4 || trip.statusId === 2) && (
                                            <button 
                                                className="btn btn-sm btn-outline-danger me-2" 
                                                onClick={() => generateTripPDF(trip.id)}
                                                title="Pobierz PDF"
                                            >
                                                <i className="bi bi-file-earmark-pdf-fill"></i>
                                            </button>
                                        )}
                                        <button 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(trip.statusId === 5 ? `/manager/settle/${trip.id}` : `/manager/approve/${trip.id}`)}
                                        >
                                            Szczegóły
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {trips.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">Brak wniosków w systemie.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagerAllTripsPage;
