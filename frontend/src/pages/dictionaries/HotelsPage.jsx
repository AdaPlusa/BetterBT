import { useState, useEffect } from 'react';
import api from '../../services/api';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Stan formularza
  const [formData, setFormData] = useState({ name: '', cityId: '' });
  const [selectedCountryId, setSelectedCountryId] = useState(''); // Do filtrowania miast w formularzu
  
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHotels();
    fetchCountries();
    fetchCities();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get('/hotels');
      setHotels(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd pobierania hoteli.');
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await api.get('/countries');
      setCountries(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCities = async () => {
    try {
      const res = await api.get('/cities');
      setCities(res.data);
    } catch (err) { console.error(err); }
  };

  // Filtrowanie miast na podstawie wybranego kraju w formularzu
  const availableCities = cities.filter(c => c.countryId === parseInt(selectedCountryId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cityId) {
      setError("Wybierz miasto!");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/hotels/${editingId}`, formData);
      } else {
        await api.post('/hotels', formData);
      }
      
      setFormData({ name: '', cityId: '' });
      setSelectedCountryId('');
      setEditingId(null);
      setError(null);
      fetchHotels();
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu hotelu.');
    }
  };

  const handleEdit = (hotel) => {
    // Musimy znaleźć kraj, do którego należy miasto hotelu, aby ustawić dropdown
    // hotel.city może być populated, jeśli nie, szukamy w liście cities
    const city = cities.find(c => c.id === hotel.cityId) || (hotel.city);
    
    if (city) {
      setSelectedCountryId(city.countryId);
    }

    setFormData({ name: hotel.name, cityId: hotel.cityId });
    setEditingId(hotel.id);
    setError(null);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', cityId: '' });
    setSelectedCountryId('');
    setEditingId(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten hotel?")) return;
    try {
      await api.delete(`/hotels/${id}`);
      fetchHotels();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Błąd usuwania hotelu.';
      setError(msg);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hotele</h2>
      </div>

      <div className="row">
        {/* Formularz */}
        <div className="col-lg-4 mb-4">
          <div className="card p-4 h-100 border-0 shadow-sm">
            <h5 className="mb-3 text-uppercase fw-bold text-secondary text-xs" style={{letterSpacing:'1px', fontSize:'0.75rem'}}>
              {editingId ? "Edycja" : "Nowy Hotel"}
            </h5>
            <h3 className="mb-4 text-primary fw-bold">
              {editingId ? "Edytuj Hotel" : "Dodaj Hotel"}
            </h3>
            
            {error && <div className="alert alert-danger rounded-3 small">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Nazwa Hotelu</label>
                <input 
                  type="text" 
                  className="form-control form-control-lg bg-light border-0" 
                  placeholder="np. Marriott" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Kraj</label>
                <select 
                  className="form-select form-select-lg bg-light border-0"
                  value={selectedCountryId}
                  onChange={(e) => {
                    setSelectedCountryId(e.target.value);
                    setFormData({...formData, cityId: ''});
                  }}
                  required
                >
                  <option value="">-- Wybierz Kraj --</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold">Miasto</label>
                <select 
                  className="form-select form-select-lg bg-light border-0"
                  value={formData.cityId}
                  onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                  required
                  disabled={!selectedCountryId}
                >
                  <option value="">-- Wybierz Miasto --</option>
                  {availableCities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-lg">
                  {editingId ? 'Zapisz Zmiany' : 'Dodaj Hotel'}
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
                    <th className="py-3 fw-bold text-uppercase small">Miasto</th>
                    <th className="py-3 fw-bold text-uppercase small">Kraj</th>
                    <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {hotels.map((hotel) => {
                    const city = hotel.city || cities.find(c => c.id === hotel.cityId);
                    const countryName = city?.country?.name || countries.find(c => c.id === city?.countryId)?.name || '-';

                    return (
                      <tr key={hotel.id}>
                        <td className="ps-4 fw-bold text-muted">#{hotel.id}</td>
                        <td className="fw-bold text-dark">{hotel.name}</td>
                        <td><span className="badge bg-white text-secondary border">{city ? city.name : hotel.cityId}</span></td>
                        <td><small className="text-secondary fw-bold">{countryName}</small></td>
                        <td className="pe-4 text-end">
                          <button 
                            className="btn btn-sm btn-link text-decoration-none fw-bold me-2"
                            style={{color: 'var(--st-blue)'}}
                            onClick={() => handleEdit(hotel)}
                          >
                            Edytuj
                          </button>
                          <button 
                            className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                            onClick={() => handleDelete(hotel.id)}
                          >
                            Usuń
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                   {hotels.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        Brak hoteli. Dodaj pierwszy!
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

export default HotelsPage;
