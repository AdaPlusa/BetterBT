import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      // Zapisujemy token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user)); 
      localStorage.setItem('roleId', response.data.user.roleId); // Zapisujemy ROLĘ dla UI
      
      // Przekieruj na dashboard
      // Przekieruj na dashboard
      // Używamy window.location.href aby wymusić odświeżenie App.jsx i pobranie nowej roli
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError('Błąd logowania. Sprawdź email i hasło.');
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
        <h2 className="text-center mb-4">Logowanie</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Hasło</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Zaloguj się</button>
        </form>
        <p className="mt-3 text-center">
          Nie masz konta? <a href="/register">Zarejestruj się</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
