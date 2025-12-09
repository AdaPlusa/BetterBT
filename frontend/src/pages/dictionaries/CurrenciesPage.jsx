import { useState, useEffect } from 'react';
import api from '../../services/api';

const CurrenciesPage = () => {
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/currencies');
      setCurrencies(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd pobierania walut.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/currencies', formData);
      setFormData({ name: '', code: '' });
      fetchCurrencies();
    } catch (err) {
      console.error(err);
      setError('Błąd dodawania waluty.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Słownik: Waluty</h2>
      
      <div className="card p-3 mb-4 shadow-sm">
        <h4>Dodaj Nową Walutę</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nazwa (np. Polski Złoty)" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Kod (np. PLN)" 
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

      <table className="table table-striped table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Kod</th>
          </tr>
        </thead>
        <tbody>
          {currencies.map((currency) => (
            <tr key={currency.id}>
              <td>{currency.id}</td>
              <td>{currency.name}</td>
              <td>{currency.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CurrenciesPage;
