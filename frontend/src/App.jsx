import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VideoLibrary from './pages/VideoLibrary';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>}
        />

        <Route path="/library" element={
          <ProtectedRoute>
            <VideoLibrary />
          </ProtectedRoute>}
        />

        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>}
        />

        <Route path="/player/:id" element={
          <ProtectedRoute>
            <VideoPlayer />
          </ProtectedRoute>}
        />

        {/* Catch-all */}
        <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />} />
      </Routes>
    </>
  );
}

export default App;