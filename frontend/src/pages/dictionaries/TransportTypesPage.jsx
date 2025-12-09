import { useState, useEffect } from 'react';
import api from '../../services/api';

const TransportTypesPage = () => {
  const [types, setTypes] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await api.get('/transport-types');
      setTypes(response.data);
    } catch (err) {
      console.error(err);
      setError('Błąd pobierania typów transportu.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transport-types', { name });
      setName('');
      fetchTypes();
    } catch (err) {
      console.error(err);
      setError('Błąd dodawania typu transportu.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Słownik: Typy Transportu</h2>
      
      <div className="card p-3 mb-4 shadow-sm">
        <h4>Dodaj Nowy Typ</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-10">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nazwa (np. Pociąg, Samolot)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr key={type.id}>
              <td>{type.id}</td>
              <td>{type.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransportTypesPage;
