import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.brand}>
        <div style={styles.logo}>Schedulr</div>
        <div style={styles.tagline}>Smart scheduling, done right.</div>
      </div>

      <div className="card" style={styles.card}>
        <h2 style={styles.heading}>Welcome back</h2>
        <p style={{ color:'var(--ink-3)', fontSize:14, marginBottom:28 }}>Sign in to your account</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" required
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop:8 }}>
            {loading ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--ink-3)' }}>
          No account? <Link to="/register" style={{ color:'var(--accent)', fontWeight:500 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap:    { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, background:'var(--surface-2)' },
  brand:   { textAlign:'center', marginBottom:32 },
  logo:    { fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, color:'var(--accent)' },
  tagline: { color:'var(--ink-3)', fontSize:15, marginTop:4 },
  card:    { width:'100%', maxWidth:420, padding:36 },
  heading: { fontSize:24, fontWeight:700, color:'var(--ink)', marginBottom:4 },
  errorBox:{ background:'var(--red-bg)', color:'var(--red)', fontSize:13, padding:'10px 14px', borderRadius:'var(--radius)', marginBottom:16 },
};
