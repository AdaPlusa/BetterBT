import { Link } from 'react-router-dom';

const Navbar = () => {
  // Pobieramy rolę z pamięci przeglądarki
  const roleId = localStorage.getItem('roleId'); 
  const isAdmin = roleId === '1';

  const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-primary px-3 mb-3">
        <Link className="navbar-brand" to="/">Better BT</Link>
        <div className="navbar-nav">
           {/* Te linki widzi każdy zalogowany */}
           <Link className="nav-link" to="/">Pulpit</Link>
           
           {/* Link widoczny TYLKO dla zwykłego USERA (nie dla Admina) */}
           {!isAdmin && (
             <Link className="nav-link" to="/trip-wizard">Nowa Delegacja</Link>
           )}

           {/* Te linki widzi TYLKO ADMIN (roleId === 1) */}
           {isAdmin && (
             <>
               <span className="nav-link disabled text-white mx-2">| ADMIN:</span>
               <Link className="nav-link" to="/countries">Kraje</Link>
               <Link className="nav-link" to="/cities">Miasta</Link>
               <Link className="nav-link" to="/hotels">Hotele</Link>
             </>
           )}
           
           {/* Przycisk Wyloguj */}
           <button className="nav-link btn btn-danger text-white ms-3 border-0 bg-transparent" onClick={handleLogout}>
                Wyloguj
           </button>
        </div>
      </nav>
  );
};

export default Navbar;
