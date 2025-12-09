import { useState, useEffect } from 'react';
import api from '../../services/api';

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({ name: '', countryId: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCities();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cities', formData);
      setFormData({ name: '', countryId: '' });
      fetchCities();
    } catch (err) {
      console.error(err);
      setError('Błąd dodawania miasta. Sprawdź ID kraju.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Słownik: Miasta</h2>
      
      <div className="card p-3 mb-4 shadow-sm">
        <h4>Dodaj Nowe Miasto</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nazwa Szczecin" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="col-md-5">
            <input 
              type="number" 
              className="form-control" 
              placeholder="ID Kraju (np. 1)" 
              value={formData.countryId}
              onChange={(e) => setFormData({...formData, countryId: e.target.value})}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">Dodaj</button>
          </div>
        </form>
      </div>

      <table className="table table-striped table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Kraj</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.id}>
              <td>{city.id}</td>
              <td>{city.name}</td>
              <td>{city.country ? city.country.name : city.countryId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CitiesPage;
