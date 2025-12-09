import { useState, useEffect } from 'react';
import api from '../../services/api';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({ name: '', cityId: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHotels();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hotels', formData);
      setFormData({ name: '', cityId: '' });
      fetchHotels();
    } catch (err) {
      console.error(err);
      setError('Błąd dodawania hotelu. Sprawdź ID miasta.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Słownik: Hotele</h2>
      
      <div className="card p-3 mb-4 shadow-sm">
        <h4>Dodaj Nowy Hotel</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nazwa (np. Marriott)" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="col-md-5">
            <input 
              type="number" 
              className="form-control" 
              placeholder="ID Miasta (np. 1)" 
              value={formData.cityId}
              onChange={(e) => setFormData({...formData, cityId: e.target.value})}
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
            <th>Miasto</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr key={hotel.id}>
              <td>{hotel.id}</td>
              <td>{hotel.name}</td>
              <td>{hotel.city ? hotel.city.name : hotel.cityId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HotelsPage;
