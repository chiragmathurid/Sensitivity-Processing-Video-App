import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };

    const initials = user?.name
        ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const isActive = (path) => location.pathname === path;

    if (!isLoggedIn) return null; // hide navbar on login/register pages

    return (
        <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', height: 52,
            borderBottom: '0.5px solid var(--color-border-tertiary)',
            background: 'var(--color-background-primary)',
            position: 'sticky', top: 0, zIndex: 100
        }}>
            <Link to="/dashboard" style={{
                fontWeight: 500, fontSize: 15,
                textDecoration: 'none', color: 'var(--color-text-primary)'
            }}>
                VideoApp
            </Link>

            <div style={{ display: 'flex', gap: 4 }}>
                {[
                    { path: '/dashboard', label: 'Dashboard' },
                    { path: '/library', label: 'Library' },
                    { path: '/upload', label: 'Upload' },
                ].map(({ path, label }) => (
                    <Link key={path} to={path} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13,
                        textDecoration: 'none',
                        background: isActive(path) ? 'var(--color-background-secondary)' : 'transparent',
                        color: isActive(path) ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontWeight: isActive(path) ? 500 : 400
                    }}>
                        {label}
                    </Link>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--color-background-info)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 500, color: 'var(--color-text-info)'
                }}>
                    {initials}
                </div>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {user?.name}
                </span>
                <button onClick={handleLogout} style={{
                    fontSize: 13, color: 'var(--color-text-danger)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px'
                }}>
                    Sign out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;