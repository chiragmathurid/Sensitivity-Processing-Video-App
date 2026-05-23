import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // If no token exists, kick the user to /login immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — render the actual page
  return children;
}

export default ProtectedRoute;