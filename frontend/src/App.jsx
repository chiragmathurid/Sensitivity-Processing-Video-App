import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import { useEffect } from 'react';
import { joinUserRoom } from './hooks/useAnalysisSocket';
import VideoLibrary from './pages/VideoLibrary';

function App() {
  useEffect(() => {
    // If user is already logged in (page refresh), re-join their room
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.id) {
      joinUserRoom(user.id);
    }
  }, []);

  return (
    <Routes>
      {/* Public routes — anyone can visit */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — redirect to /login if no token */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/upload" element={
        <ProtectedRoute>
          <Upload />
        </ProtectedRoute>
      } />

      <Route path="/library" element={
        <ProtectedRoute>
          <VideoLibrary />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;