import { useState, useEffect } from 'react';
import api from '../../services/api';

const CountriesPage = () => {
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '' });
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
      await api.post('/countries', formData);
      setFormData({ name: '', code: '' }); // Reset formularza
      fetchCountries(); // Odśwież listę
    } catch (err) {
      console.error(err);
      setError('Błąd dodawania kraju.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Słownik: Kraje</h2>
      
      {/* Formularz Dodawania */}
      <div className="card p-3 mb-4 shadow-sm">
        <h4>Dodaj Nowy Kraj</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nazwa (np. Polska)" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Kod (np. PL)" 
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">Dodaj</button>
          </div>
        </form>
      </div>

      {/* Tabela Danych */}
      <table className="table table-striped table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Kod</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => (
            <tr key={country.id}>
              <td>{country.id}</td>
              <td>{country.name}</td>
              <td>{country.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CountriesPage;
