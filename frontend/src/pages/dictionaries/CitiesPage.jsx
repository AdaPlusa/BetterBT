import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]); 
  const [formData, setFormData] = useState({ name: '', countryId: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal & Sort
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });
  const [sortOrder, setSortOrder] = useState('asc');
  const { notify } = useNotification();

  useEffect(() => {
    fetchCities();
    fetchCountries();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd pobierania miast.');
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await api.get('/countries');
      setCountries(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd pobierania listy krajów.');
    }
  };

  const handleOpenModal = (city = null) => {
      setError(null);
      if (city) {
          setEditingId(city.id);
          setFormData({ name: city.name, countryId: city.countryId });
      } else {
          setEditingId(null);
          setFormData({ name: '', countryId: '' });
      }
      setShowModal(true);
  };

  const handleCloseModal = () => {
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', countryId: '' });
      setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.countryId) {
      setError("Wybierz kraj z listy!");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/cities/${editingId}`, formData);
      } else {
        await api.post('/cities', formData);
      }
      
      handleCloseModal();
      fetchCities();
      notify(editingId ? "Miasto zaktualizowane!" : "Miasto dodane pomyślnie!");
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu miasta.');
      notify('Wystąpił błąd zapisu.', 'error');
    }
  };

  const handleDeleteClick = (id) => {
      setConfirmModal({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/cities/${confirmModal.id}`);
      fetchCities();
      notify("Miasto zostało usunięte.");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Błąd usuwania miasta.';
      notify(msg, 'error');
    } finally {
        setConfirmModal({ show: false, id: null });
    }
  };

  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedCities = [...cities].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Miasta</h2>
        <button className="btn btn-primary fw-bold shadow-sm" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-lg me-2"></i>Dodaj Miasto
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
                <th className="py-3 fw-bold text-uppercase small">Kraj</th>
                <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {sortedCities.map((city, index) => (
                <tr key={city.id}>
                  <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                  <td className="fw-bold text-dark">{city.name}</td>
                  <td>
                    <span className="badge bg-white text-secondary border">
                      {city.country ? city.country.name : 'Brak danych'}
                    </span>
                  </td>
                  <td className="pe-4 text-end">
                    <button 
                      className="btn btn-sm btn-link text-decoration-none fw-bold me-2"
                      style={{color: 'var(--st-blue)'}}
                      onClick={() => handleOpenModal(city)}
                    >
                      <i className="bi bi-pencil me-1"></i>Edytuj
                    </button>
                    <button 
                      className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                      onClick={() => handleDeleteClick(city.id)}
                    >
                      <i className="bi bi-trash me-1"></i>Usuń
                    </button>
                  </td>
                </tr>
              ))}
                {sortedCities.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    Brak miast. Dodaj pierwsze!
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
                                {editingId ? "Edytuj Miasto" : "Dodaj Miasto"}
                            </h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <div className="modal-body p-4">
                            {error && <div className="alert alert-danger rounded-3 small">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Nazwa Miasta</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg bg-light border-0" 
                                        placeholder="np. Szczecin" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">Wybierz Kraj</label>
                                    <select 
                                        className="form-select form-select-lg bg-light border-0"
                                        value={formData.countryId}
                                        onChange={(e) => setFormData({...formData, countryId: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Wybierz Kraj --</option>
                                        {countries.map(country => (
                                            <option key={country.id} value={country.id}>
                                            {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        {editingId ? 'Zapisz Zmiany' : 'Dodaj Miasto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}

      <ConfirmModal 
        show={confirmModal.show}
        title="Usuń Miasto"
        message="Czy na pewno chcesz usunąć to miasto? Tej operacji nie można cofnąć."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ show: false, id: null })}
      />
    </div>
  );
};

export default CitiesPage;
