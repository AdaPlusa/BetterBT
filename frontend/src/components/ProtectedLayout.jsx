import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const ProtectedLayout = () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="container pb-5">
        <Outlet />
      </div>
    </>
  );
};

export default ProtectedLayout;
