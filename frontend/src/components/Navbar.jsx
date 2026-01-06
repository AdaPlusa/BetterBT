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
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom px-4 mb-4">
      <div className="container-fluid position-relative">
        
        {/* Toggler on the Left (Mobile) */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Centered Brand */}
        <Link 
            className="navbar-brand fw-bold d-flex align-items-center gap-2 position-absolute start-50 translate-middle-x" 
            to="/" 
            style={{ letterSpacing: '0.5px' }}
        >
          <img src="/logo.png" alt="Better BT Logo" style={{ height: '32px', width: 'auto' }} />
          <span>BETTER BT</span>
        </Link>
        
        {/* Helper div to push content right if needed */}
        <div className="d-lg-none" style={{ width: '56px' }}></div> 

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-3">
             {/* Linki ogólne */}
            
             
             {/* Link dla Usera */}
             {!isAdmin && (
               <li className="nav-item">
                 <Link className="nav-link" to="/trip-wizard">Nowa Delegacja</Link>
               </li>
             )}
  
             {/* Linki Admina */}
             {isAdmin && (
               <>
                 <li className="nav-item border-start ps-3 ms-2 border-secondary d-none d-lg-block"></li>
                 <li className="nav-item"><span className="nav-link text-white-50 text-uppercase small fw-bold">Admin</span></li>
                 <li className="nav-item"><Link className="nav-link" to="/countries">Kraje</Link></li>
                 <li className="nav-item"><Link className="nav-link" to="/cities">Miasta</Link></li>
                 <li className="nav-item"><Link className="nav-link" to="/hotels">Hotele</Link></li>
                 <li className="nav-item"><Link className="nav-link" to="/transport">Transport</Link></li>
                 <li className="nav-item"><Link className="nav-link" to="/routes">Cennik Tras</Link></li>
                 <li className="divider border-bottom my-2 mx-2"></li>
                 <li className="nav-item"><Link className="nav-link fw-bold text-primary" to="/users">Użytkownicy</Link></li>
               </>
             )}
             
             {/* Przycisk Wyloguj */}
             <li className="nav-item ms-lg-3">
               <button 
                 className="btn btn-outline-light btn-sm px-4" 
                 onClick={handleLogout}
               >
                   Wyloguj
               </button>
             </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
