import { useState, useEffect } from 'react';
import api from '../../services/api';

const CountriesPage = () => {
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '', continent: '', perDiemRate: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);

  // Sorting state
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries');
      setCountries(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd pobierania krajów.');
    }
  };

  const handleOpenModal = (country = null) => {
      setError(null);
      if (country) {
          // Edit Mode
          setEditingId(country.id);
          setFormData({
              name: country.name,
              code: country.code,
              continent: country.continent,
              perDiemRate: country.perDiemRate || ''
          });
      } else {
          // Add Mode
          setEditingId(null);
          setFormData({ name: '', code: '', continent: '', perDiemRate: '' });
      }
      setShowModal(true);
  };

  const handleCloseModal = () => {
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', code: '', continent: '', perDiemRate: '' });
      setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/countries/${editingId}`, formData);
      } else {
        await api.post('/countries', formData);
      }
      
      handleCloseModal();
      fetchCountries();
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu (sprawdź czy dane są poprawne).');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten kraj?")) return;

    try {
      await api.delete(`/countries/${id}`);
      fetchCountries();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Błąd usuwania kraju.';
      alert(msg); // Alert for delete error is better than setting modal error if modal is closed
    }
  };

  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedCountries = [...countries].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Kraje</h2>
        <button className="btn btn-primary fw-bold shadow-sm" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-lg me-2"></i>Dodaj Kraj
        </button>
      </div>

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
                    Nazwa 
                    {sortOrder === 'asc' ? <i className="bi bi-sort-alpha-down ms-1"></i> : <i className="bi bi-sort-alpha-up ms-1"></i>}
                </th>
                <th className="py-3 fw-bold text-uppercase small">Kod</th>
                <th className="py-3 fw-bold text-uppercase small">Kontynent</th>
                <th className="py-3 fw-bold text-uppercase small">Dieta</th>
                <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {sortedCountries.map((country, index) => (
                <tr key={country.id}>
                  <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                  <td className="fw-bold text-dark">{country.name}</td>
                  <td><span className="badge bg-light text-dark border">{country.code}</span></td>
                  <td className="text-secondary">{country.continent || '-'}</td>
                  <td className="fw-bold text-primary">{country.perDiemRate ? `${country.perDiemRate} PLN` : '-'}</td>
                  <td className="pe-4 text-end">
                    <button 
                      className="btn btn-sm btn-link text-decoration-none fw-bold me-2" 
                      style={{color: 'var(--st-blue)'}}
                      onClick={() => handleOpenModal(country)}
                    >
                      <i className="bi bi-pencil me-1"></i>Edytuj
                    </button>
                    <button 
                      className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                      onClick={() => handleDelete(country.id)}
                    >
                      <i className="bi bi-trash me-1"></i>Usuń
                    </button>
                  </td>
                </tr>
              ))}
              {sortedCountries.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Brak krajów w bazie. Dodaj pierwszy!
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
                                {editingId ? "Edytuj Kraj" : "Dodaj Kraj"}
                            </h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <div className="modal-body p-4">
                            {error && <div className="alert alert-danger rounded-3 small">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Nazwa Kraju</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg bg-light border-0" 
                                        placeholder="np. Polska" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Kod Kraju</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg bg-light border-0" 
                                        placeholder="np. PL" 
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">Kontynent</label>
                                    <select 
                                        className="form-select form-select-lg bg-light border-0" 
                                        value={formData.continent || ''}
                                        onChange={(e) => setFormData({...formData, continent: e.target.value})}
                                    >
                                        <option value="">-- Wybierz Kontynent --</option>
                                        {["Afryka", "Ameryka Południowa", "Ameryka Północna", "Antarktyda", "Australia i Oceania", "Azja", "Europa"].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">Stawka Diety (PLN)</label>
                                    <input 
                                        type="number" 
                                        className="form-control form-control-lg bg-light border-0" 
                                        placeholder="np. 300" 
                                        value={formData.perDiemRate || ''}
                                        onChange={(e) => setFormData({...formData, perDiemRate: e.target.value})}
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        {editingId ? 'Zapisz Zmiany' : 'Dodaj Kraj'}
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

export default CountriesPage;
