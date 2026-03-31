import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { COMMON_TIMEZONES } from '../utils/timezones';

export default function SettingsPage() {
  const { user, updateUser }      = useAuth();
  const [timezone, setTimezone]   = useState(user?.timezone || 'UTC');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  const handleSaveTimezone = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.patch('/auth/timezone', { timezone });
      updateUser({ timezone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:'var(--ink)', marginBottom:4 }}>Settings</h1>
        <p style={{ color:'var(--ink-3)', fontSize:15 }}>Manage your account preferences.</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:24, maxWidth:560 }}>

        {/* Profile card */}
        <section className="card" style={{ padding:28 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Profile</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Row label="Name"  value={user?.name} />
            <Row label="Email" value={user?.email} />
            <Row label="Member since" value={new Date().getFullYear()} />
          </div>
        </section>

        {/* Timezone card */}
        <section className="card" style={{ padding:28 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Timezone</h2>
          <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:18, lineHeight:1.6 }}>
            Your timezone is used to display your availability correctly.
            Guests will see times converted to their own timezone when booking.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Select your timezone</label>
              <select className="form-input" value={timezone} onChange={e => setTimezone(e.target.value)}>
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            {/* Live preview */}
            <div style={{ background:'var(--accent-bg)', borderRadius:'var(--radius)', padding:'12px 16px', fontSize:13 }}>
              <span style={{ color:'var(--ink-3)' }}>Current time in selected zone: </span>
              <span style={{ fontWeight:600, color:'var(--accent)' }}>
                {new Intl.DateTimeFormat('en-US', {
                  timeZone: timezone,
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                  hour12: true, timeZoneName: 'short',
                }).format(new Date())}
              </span>
            </div>

            {error && <div style={{ color:'var(--red)', fontSize:13 }}>{error}</div>}

            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button className="btn btn-primary" onClick={handleSaveTimezone} disabled={saving || timezone === user?.timezone}>
                {saving ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : 'Save timezone'}
              </button>
              {saved && <span style={{ fontSize:13, color:'var(--green)', fontWeight:500 }}>✓ Timezone updated!</span>}
              {timezone === user?.timezone && !saving && (
                <span style={{ fontSize:13, color:'var(--ink-3)' }}>Up to date</span>
              )}
            </div>
          </div>
        </section>

        {/* Scheduling link card */}
        <section className="card" style={{ padding:28 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Your Scheduling Page</h2>
          <p style={{ fontSize:13, color:'var(--ink-3)', marginBottom:16 }}>
            Share these links with anyone to let them book time with you.
            Each link is specific to an event type you've created.
          </p>
          <div style={{ background:'var(--surface-2)', borderRadius:'var(--radius)', padding:'12px 16px', fontSize:13, color:'var(--ink-2)', fontFamily:'monospace' }}>
            {window.location.origin}/book/[event-type-id]
          </div>
          <p style={{ fontSize:12, color:'var(--ink-3)', marginTop:8 }}>
            Copy individual links from the Dashboard → Event Types tab.
          </p>
        </section>

      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:13, color:'var(--ink-3)' }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>{value}</span>
    </div>
  );
}
