import { useState, useEffect } from 'react';
import api from '../../services/api';

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]); // Przechwujemy listę krajów do dropdownu
  const [formData, setFormData] = useState({ name: '', countryId: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

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
      
      setFormData({ name: '', countryId: '' });
      setEditingId(null);
      setError(null);
      fetchCities();
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu miasta.');
    }
  };

  const handleEdit = (city) => {
    setFormData({ 
      name: city.name, 
      countryId: city.countryId 
    });
    setEditingId(city.id);
    setError(null);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', countryId: '' });
    setEditingId(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to miasto?")) return;
    try {
      await api.delete(`/cities/${id}`);
      fetchCities();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Błąd usuwania miasta.';
      setError(msg);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Miasta</h2>
      </div>

      <div className="row">
        {/* Formularz */}
        <div className="col-lg-4 mb-4">
          <div className="card p-4 h-100 border-0 shadow-sm">
            <h5 className="mb-3 text-uppercase fw-bold text-secondary text-xs" style={{letterSpacing:'1px', fontSize:'0.75rem'}}>
              {editingId ? "Edycja" : "Nowe Miasto"}
            </h5>
            <h3 className="mb-4 text-primary fw-bold">
              {editingId ? "Edytuj Miasto" : "Dodaj Miasto"}
            </h3>
            
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
                {editingId && (
                  <button type="button" className="btn btn-light text-muted" onClick={handleCancelEdit}>
                    Anuluj
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Tabela */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light text-secondary">
                  <tr>
                    <th className="ps-4 py-3 fw-bold text-uppercase small" style={{width: '60px'}}>ID</th>
                    <th className="py-3 fw-bold text-uppercase small">Nazwa</th>
                    <th className="py-3 fw-bold text-uppercase small">Kraj</th>
                    <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {cities.map((city) => (
                    <tr key={city.id}>
                      <td className="ps-4 fw-bold text-muted">#{city.id}</td>
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
                          onClick={() => handleEdit(city)}
                        >
                          Edytuj
                        </button>
                        <button 
                          className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                          onClick={() => handleDelete(city.id)}
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                   {cities.length === 0 && (
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
        </div>
      </div>
    </div>
  );
};

export default CitiesPage;
