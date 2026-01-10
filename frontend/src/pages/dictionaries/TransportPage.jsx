import { useState, useEffect } from 'react';
import axios from 'axios';

// Konfiguracja Axios
const API_URL = 'http://localhost:3000';
const api = axios.create({ baseURL: API_URL });

const TransportPage = () => {
    // Stan
    const [providers, setProviders] = useState([]);
    const [types, setTypes] = useState([]);
    const [formData, setFormData] = useState({ name: '', typeId: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    // Modal & Sort
    const [showModal, setShowModal] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc');

    // Pobieranie danych
    const fetchData = async () => {
        try {
            const [typesRes, providersRes] = await Promise.all([
                api.get('/transport-types'),
                api.get('/transport-providers')
            ]);
            setTypes(typesRes.data);
            setProviders(providersRes.data);
        } catch (err) {
            console.error(err);
            setError("Błąd pobierania danych.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (provider = null) => {
        setError(null);
        if (provider) {
            setEditingId(provider.id);
            setFormData({
                name: provider.name,
                typeId: provider.typeId || provider.type?.id || ''
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', typeId: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', typeId: '' });
        setError(null);
    };

    // Obsługa Formularza
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.typeId) {
                alert("Wypełnij nazwę i wybierz typ!");
                return;
            }

            if (editingId) {
                // UPDATE
                await api.put(`/transport-providers/${editingId}`, formData);
            } else {
                // CREATE
                await api.post('/transport-providers', formData);
            }

            handleCloseModal();
            fetchData(); // Odśwież
        } catch (err) {
            console.error(err);
            alert("Błąd zapisu przewoźnika.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno usunąć tego przewoźnika?")) return;
        try {
            await api.delete(`/transport-providers/${id}`);
            fetchData();
        } catch (err) {
            alert("Nie można usunąć. Prawdopodobnie jest używany.");
        }
    };

    const handleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const sortedProviders = [...providers].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold">Transport</h2>
                <button className="btn btn-primary fw-bold shadow-sm" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i>Dodaj Przewoźnika
                </button>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="ps-4 py-3 fw-bold text-uppercase small" style={{width: '60px'}}>No</th>
                                <th 
                                    className="py-3 fw-bold text-uppercase small cursor-pointer"
                                    onClick={handleSort}
                                    style={{cursor: 'pointer'}}
                                >
                                    Przewoźnik
                                    {sortOrder === 'asc' ? <i className="bi bi-sort-alpha-down ms-1"></i> : <i className="bi bi-sort-alpha-up ms-1"></i>}
                                </th>
                                <th className="py-3 fw-bold text-uppercase small">Rodzaj</th>
                                <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {sortedProviders.map((p, index) => (
                                <tr key={p.id}>
                                    <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                    <td className="fw-bold text-dark">{p.name}</td>
                                    <td>
                                        {p.type ? (
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                                                {p.type.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted small">-</span>
                                        )}
                                    </td>
                                    <td className="pe-4 text-end">
                                        <button 
                                            className="btn btn-sm btn-link text-primary text-decoration-none fw-bold me-2"
                                            onClick={() => handleOpenModal(p)}
                                        >
                                            <i className="bi bi-pencil me-1"></i>EDYTUJ
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            <i className="bi bi-trash me-1"></i>USUŃ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sortedProviders.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        Brak przewoźników. Dodaj pierwszego!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <>
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">
                                    {editingId ? "Edytuj Przewoźnika" : "Dodaj Przewoźnika"}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">Nazwa Firmy / Przewoźnika</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg bg-light border-0" 
                                            placeholder="np. LOT, PKP Intercity" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label text-muted small fw-bold">Typ Transportu</label>
                                        <select 
                                            className="form-select form-select-lg bg-light border-0"
                                            value={formData.typeId}
                                            onChange={(e) => setFormData({...formData, typeId: e.target.value})}
                                        >
                                            <option value="">-- Wybierz Typ --</option>
                                            {types.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <div className="form-text mt-2">
                                            <small>Nie widzisz typu? Dodaj go w bazie (np. Samolot, Pociąg).</small>
                                        </div>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn btn-lg ${editingId ? 'btn-warning text-white' : 'btn-primary'} fw-bold shadow-sm`}>
                                            {editingId ? 'Zapisz Zmiany' : 'Dodaj Przewoźnika'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default TransportPage;
