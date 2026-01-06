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

            setFormData({ name: '', typeId: '' }); // Reset
            setEditingId(null);
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

    const handleEdit = (provider) => {
        setEditingId(provider.id);
        setFormData({
            name: provider.name,
            typeId: provider.typeId || provider.type?.id || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', typeId: '' });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary fw-bold">Transport</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4">
                {/* FORMULARZ (Lewa kolumna) */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4">
                        <h4 className="fw-bold mb-4">
                            {editingId ? 'Edytuj Przewoźnika' : 'Dodaj Przewoźnika'}
                        </h4>
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
                                {editingId && (
                                    <button type="button" className="btn btn-light text-muted" onClick={handleCancelEdit}>
                                        Anuluj
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* TABELA (Prawa kolumna) */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="bg-light text-secondary">
                                    <tr>
                                        <th className="ps-4 py-3 fw-bold text-uppercase small" style={{width: '60px'}}>ID</th>
                                        <th className="py-3 fw-bold text-uppercase small">Przewoźnik</th>
                                        <th className="py-3 fw-bold text-uppercase small">Rodzaj</th>
                                        <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="border-top-0">
                                    {providers.map((p) => (
                                        <tr key={p.id} className={editingId === p.id ? 'table-warning' : ''}>
                                            <td className="ps-4 fw-bold text-muted">#{p.id}</td>
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
                                                    onClick={() => handleEdit(p)}
                                                >
                                                    EDYTUJ
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    USUŃ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {providers.length === 0 && (
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
                </div>
            </div>
        </div>
    );
};

export default TransportPage;
