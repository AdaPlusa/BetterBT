import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '2' // Domyślnie User
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/auth/register', formData);
      alert('Rejestracja udana! Możesz się teraz zalogować.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Błąd rejestracji. Sprawdź dane (może email jest już zajęty?).');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: "url('/annie-spratt-qyAka7W5uMY-unsplash.jpg')", 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <h2 className="text-center mb-4">Rejestracja</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Hasło</label>
            <input 
              type="password" 
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Imię</label>
            <input 
              type="text" 
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nazwisko</label>
            <input 
              type="text" 
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rola</label>
            <select 
              className="form-select"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
            >
                <option value="2">Użytkownik (Pracownik)</option>
                <option value="1">Administrator</option>
                <option value="3">Manager</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100">Zarejestruj się</button>
        </form>
        <p className="mt-3 text-center">
          Masz już konto? <a href="/login">Zaloguj się</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
