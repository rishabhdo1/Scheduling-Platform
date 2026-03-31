import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COMMON_TIMEZONES, guessTimezone } from '../utils/timezones';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ name:'', email:'', password:'', timezone: guessTimezone() });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.timezone);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={styles.wrap}>
      <div style={styles.brand}>
        <div style={styles.logo}>Schedulr</div>
        <div style={styles.tagline}>Set up your scheduling page in minutes.</div>
      </div>

      <div className="card" style={styles.card}>
        <h2 style={styles.heading}>Create your account</h2>
        <p style={{ color:'var(--ink-3)', fontSize:14, marginBottom:28 }}>Free forever. No credit card needed.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" placeholder="Jane Doe" required
              value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="jane@example.com" required
              value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password <span style={{ color:'var(--ink-3)', fontWeight:400 }}>(min 8 chars)</span></label>
            <input className="form-input" type="password" placeholder="••••••••" required minLength={8}
              value={form.password} onChange={set('password')} />
          </div>
          <div className="form-group">
            <label className="form-label">Your timezone</label>
            <select className="form-input" value={form.timezone} onChange={set('timezone')}>
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop:8 }}>
            {loading ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--ink-3)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--accent)', fontWeight:500 }}>Sign in</Link>
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
  card:    { width:'100%', maxWidth:460, padding:36 },
  heading: { fontSize:24, fontWeight:700, color:'var(--ink)', marginBottom:4 },
  errorBox:{ background:'var(--red-bg)', color:'var(--red)', fontSize:13, padding:'10px 14px', borderRadius:'var(--radius)', marginBottom:16 },
};
