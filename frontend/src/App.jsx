import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home — coming soon</h1>} />
      <Route path="/login" element={<h1>Login — coming soon</h1>} />
      <Route path="/register" element={<h1>Register — coming soon</h1>} />
      <Route path="/dashboard" element={<h1>Dashboard — coming soon</h1>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App