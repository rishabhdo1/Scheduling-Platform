import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/settings',  label: 'Settings',  icon: '⚙' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--accent)' }}>
            Schedulr
          </div>
          <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:2 }}>Smart Scheduling</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'20px 12px', display:'flex', flexDirection:'column', gap:4 }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 'var(--radius)',
              fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--ink-2)',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              transition: 'all var(--transition)',
              textDecoration: 'none',
            })}>
              <span style={{ fontSize:16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:2 }}>{user?.name}</div>
          <div style={{ fontSize:12, color:'var(--ink-3)', marginBottom:12, wordBreak:'break-all' }}>{user?.email}</div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width:'100%' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, padding:'36px 40px', maxWidth:'100%', overflowX:'hidden' }}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
