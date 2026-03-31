import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const COLORS = ['#5b4fff','#ef4444','#22c55e','#f59e0b','#06b6d4','#ec4899','#8b5cf6','#f97316'];

export default function EventTypeModal({ existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '', description: '', duration: 30, color: '#5b4fff', location: '',
    ...existing,
  });
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      let result;
      if (existing?.id) {
        result = await api.patch(`/event-types/${existing.id}`, form);
        onSaved(result.eventType, 'updated');
      } else {
        result = await api.post('/event-types', form);
        onSaved(result.eventType, 'created');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card" style={modal}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700 }}>
            {existing?.id ? 'Edit event type' : 'New event type'}
          </h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--ink-3)', lineHeight:1 }}>×</button>
        </div>

        {error && <div style={errBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="e.g. 30-min intro call" required
              value={form.title} onChange={set('title')} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="What's this meeting about?" rows={2}
              value={form.description || ''} onChange={set('description')}
              style={{ resize:'vertical' }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Duration (minutes) *</label>
              <input className="form-input" type="number" min={5} max={480} required
                value={form.duration} onChange={set('duration')} />
            </div>
            <div className="form-group">
              <label className="form-label">Location / Link</label>
              <input className="form-input" placeholder="Zoom link or address"
                value={form.location || ''} onChange={set('location')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Colour</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width:28, height:28, borderRadius:'50%', background:c, border:'none',
                    cursor:'pointer', outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                    outlineOffset: 2, transition:'outline var(--transition)',
                  }} />
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : (existing?.id ? 'Save changes' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay = {
  position:'fixed', inset:0, background:'rgba(0,0,0,.45)', backdropFilter:'blur(4px)',
  display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20,
};
const modal = { width:'100%', maxWidth:520, padding:32, animation:'fadeUp .2s ease' };
const errBox = { background:'var(--red-bg)', color:'var(--red)', fontSize:13, padding:'10px 14px', borderRadius:'var(--radius)', marginBottom:8 };
