import { useState, useEffect } from 'react';
import api from '../../services/api';

const CountriesPage = () => {
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [editingId, setEditingId] = useState(null); // ID edytowanego elementu
  const [error, setError] = useState(null);

  // Pobranie danych przy załadowaniu
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Aktualizacja
        await api.put(`/countries/${editingId}`, formData);
      } else {
        // Tworzenie
        await api.post('/countries', formData);
      }
      
      setFormData({ name: '', code: '' }); // Reset formularza
      setEditingId(null); // Wyjście z trybu edycji
      setError(null);
      fetchCountries(); // Odśwież listę
    } catch (err) {
      console.error(err);
      setError('Błąd zapisu (sprawdź czy dane są poprawne).');
    }
  };

  const handleEdit = (country) => {
    setFormData({ name: country.name, code: country.code });
    setEditingId(country.id);
    setError(null);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', code: '' });
    setEditingId(null);
    setError(null);
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten kraj?")) return;

    try {
      await api.delete(`/countries/${id}`);
      fetchCountries();
    } catch (err) {
      console.error(err);
      // Backend zwraca error w json, spróbujmy go wyświetlić
      const msg = err.response?.data?.error || 'Błąd usuwania kraju.';
      setError(msg);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kraje</h2>
      </div>

      <div className="row">
        {/* Formularz */}
        <div className="col-lg-4 mb-4">
          <div className="card p-4 h-100 border-0 shadow-sm">
            <h5 className="mb-3 text-uppercase fw-bold text-secondary text-xs" style={{letterSpacing:'1px', fontSize:'0.75rem'}}>
              {editingId ? "Edycja wpisu" : "Nowy wpis"}
            </h5>
            <h3 className="mb-4 text-primary fw-bold">
              {editingId ? "Edytuj Kraj" : "Dodaj Kraj"}
            </h3>
            
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
              
              <div className="d-grid gap-2">
                <button type="submit" className={`btn btn-lg ${editingId ? 'btn-primary' : 'btn-primary'}`}>
                  {editingId ? 'Zapisz Zmiany' : 'Dodaj Kraj'}
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
                    <th className="py-3 fw-bold text-uppercase small">Kod</th>
                    <th className="py-3 fw-bold text-uppercase small">Kontynent</th>
                    <th className="pe-4 py-3 text-end fw-bold text-uppercase small">Akcje</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {countries.map((country) => (
                    <tr key={country.id}>
                      <td className="ps-4 fw-bold text-muted">#{country.id}</td>
                      <td className="fw-bold text-dark">{country.name}</td>
                      <td><span className="badge bg-light text-dark border">{country.code}</span></td>
                      <td className="text-secondary">{country.continent || '-'}</td>
                      <td className="pe-4 text-end">
                        <button 
                          className="btn btn-sm btn-link text-decoration-none fw-bold me-2" 
                          style={{color: 'var(--st-blue)'}}
                          onClick={() => handleEdit(country)}
                        >
                          Edytuj
                        </button>
                        <button 
                          className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                          onClick={() => handleDelete(country.id)}
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                  {countries.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        Brak krajów w bazie. Dodaj pierwszy!
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

export default CountriesPage;
