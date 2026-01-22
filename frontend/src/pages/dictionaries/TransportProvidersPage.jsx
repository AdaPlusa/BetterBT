import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../context/NotificationContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const TransportProvidersPage = () => {
    const [providers, setProviders] = useState([]);
    const [types, setTypes] = useState([]);
    
    // Form State
    const [name, setName] = useState('');
    const [typeId, setTypeId] = useState('');

    const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
    const { notify } = useNotification();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [provRes, typesRes] = await Promise.all([
                api.get('/transport-providers'),
                api.get('/transport-types')
            ]);
            setProviders(provRes.data);
            setTypes(typesRes.data);
        } catch (err) {
        } catch (err) {
            notify('Błąd pobierania danych', 'error');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transport-providers', { name, typeId });
            setName('');
            setTypeId('');
            loadData();
            notify('Dodano przewoźnika!');
        } catch (err) {
            notify('Błąd dodawania', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmModal({ show: true, id });
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/transport-providers/${confirmModal.id}`);
            loadData();
            notify("Usunięto przewoźnika.");
        } catch (err) {
            notify('Błąd usuwania (być może jest używany w trasach)', 'error');
        } finally {
            setConfirmModal({ show: false, id: null });
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary fw-bold">Słownik: Przewoźnicy</h2>

            <div className="row">
                {/* FORMULARZ */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0 p-4">
                        <h5 className="mb-3">Nowy Przewoźnik</h5>
                        <form onSubmit={handleAdd}>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Nazwa Firmy</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required
                                    placeholder="np. Ryanair, PKP Intercity"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Typ Transportu</label>
                                <select 
                                    className="form-select bg-light border-0"
                                    value={typeId}
                                    onChange={e => setTypeId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Wybierz Typ --</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn btn-primary w-100 fw-bold">Dodaj</button>
                        </form>
                    </div>
                </div>

                {/* TABELA */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 text-secondary">Lista Przewoźników</h5>
                        </div>
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">Nazwa</th>
                                    <th>Typ</th>
                                    <th className="text-end pe-4">Akcja</th>
                                </tr>
                            </thead>
                            <tbody>
                                {providers.map(p => (
                                    <tr key={p.id}>
                                        <td className="ps-4 fw-bold">{p.name}</td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {p.type?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteClick(p.id)}
                                            >
                                                Usuń
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {providers.length === 0 && <tr><td colSpan="3" className="text-muted text-center py-4">Brak danych</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            
            <ConfirmModal 
                show={confirmModal.show}
                title="Usuń Przewoźnika"
                message="Czy na pewno chcesz usunąć tego przewoźnika?"
                onConfirm={confirmDelete}
                onClose={() => setConfirmModal({ show: false, id: null })}
            />
        </div>
    );
};

export default TransportProvidersPage;
