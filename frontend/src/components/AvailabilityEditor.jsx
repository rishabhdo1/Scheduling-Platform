import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const DEFAULT_HOURS = { start_time:'09:00', end_time:'17:00' };

export default function AvailabilityEditor() {
  const [slots, setSlots]     = useState(
    DAYS.map((_, i) => ({ day_of_week: i, enabled: i >= 1 && i <= 5, ...DEFAULT_HOURS }))
  );
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/availability/' + 'me') // placeholder — needs userId
      .then(() => {})
      .catch(() => {});
  }, []);

  const toggle = (i) => setSlots(s => s.map((d,idx) => idx===i ? { ...d, enabled:!d.enabled } : d));
  const setTime = (i, key) => (e) => setSlots(s => s.map((d,idx) => idx===i ? { ...d, [key]:e.target.value } : d));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const enabled = slots.filter(s => s.enabled);
      await Promise.all(enabled.map(s =>
        api.post('/availability', {
          day_of_week: s.day_of_week,
          start_time:  s.start_time + ':00',
          end_time:    s.end_time   + ':00',
        })
      ));
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
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
        {slots.map((slot, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:14, padding:'12px 16px',
            borderRadius:'var(--radius)', border:'1.5px solid',
            borderColor: slot.enabled ? 'var(--accent)' : 'var(--border)',
            background: slot.enabled ? 'var(--accent-bg)' : 'var(--surface-2)',
            transition:'all var(--transition)',
          }}>
            {/* Toggle */}
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', minWidth:110 }}>
              <span style={toggleStyle(slot.enabled)} onClick={() => toggle(i)}>
                <span style={knobStyle(slot.enabled)} />
              </span>
              <span style={{ fontSize:14, fontWeight:500, color: slot.enabled ? 'var(--ink)' : 'var(--ink-3)' }}>
                {DAYS[i].slice(0,3)}
              </span>
            </label>

            {slot.enabled ? (
              <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                <input type="time" className="form-input" style={{ maxWidth:130 }}
                  value={slot.start_time} onChange={setTime(i,'start_time')} />
                <span style={{ color:'var(--ink-3)', fontSize:13 }}>to</span>
                <input type="time" className="form-input" style={{ maxWidth:130 }}
                  value={slot.end_time} onChange={setTime(i,'end_time')} />
              </div>
            ) : (
              <span style={{ fontSize:13, color:'var(--ink-3)' }}>Unavailable</span>
            )}
          </div>
        ))}
      </div>

      {error && <div style={{ color:'var(--red)', fontSize:13, marginBottom:12 }}>{error}</div>}

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : 'Save availability'}
        </button>
        {saved && <span style={{ fontSize:13, color:'var(--green)', fontWeight:500 }}>✓ Saved!</span>}
      </div>
    </div>
  );
}

const toggleStyle = (on) => ({
  width:36, height:20, borderRadius:99, cursor:'pointer',
  background: on ? 'var(--accent)' : 'var(--surface-3)',
  display:'flex', alignItems:'center', padding:'2px 3px',
  transition:'background var(--transition)', flexShrink:0,
});
const knobStyle = (on) => ({
  width:16, height:16, borderRadius:'50%', background:'#fff',
  transform: on ? 'translateX(16px)' : 'translateX(0)',
  transition:'transform var(--transition)',
  boxShadow:'0 1px 4px rgba(0,0,0,.2)',
});
