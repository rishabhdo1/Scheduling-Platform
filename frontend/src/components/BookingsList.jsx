import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatInTimezone } from '../utils/timezones';

export default function BookingsList() {
  const { user }                      = useAuth();
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [cancelling, setCancelling]   = useState(null);
  const [filter, setFilter]           = useState('upcoming'); // upcoming | past | all

  useEffect(() => {
    api.get('/bookings')
      .then(d => setBookings(d.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.delete(`/bookings/${id}`, { reason: 'Cancelled by host' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status:'cancelled' } : b));
    } catch (err) {
      alert(err.message);
    }
    setCancelling(null);
  };

  const now = new Date();
  const visible = bookings.filter(b => {
    const start = new Date(b.start_time);
    if (filter === 'upcoming') return start >= now && b.status === 'confirmed';
    if (filter === 'past')     return start < now  || b.status === 'cancelled';
    return true;
  });

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:32 }}><div className="spinner" /></div>;

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--surface-2)', padding:4, borderRadius:'var(--radius)', width:'fit-content' }}>
        {['upcoming','past','all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="btn btn-sm"
            style={{
              background: filter===f ? 'var(--surface)' : 'transparent',
              color: filter===f ? 'var(--ink)' : 'var(--ink-3)',
              border: 'none',
              boxShadow: filter===f ? 'var(--shadow-sm)' : 'none',
              textTransform:'capitalize',
            }}>
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 24px', color:'var(--ink-3)' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
          <div style={{ fontWeight:500 }}>No {filter} bookings</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {visible.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              userTimezone={user?.timezone || 'UTC'}
              onCancel={handleCancel}
              cancelling={cancelling === b.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, userTimezone, onCancel, cancelling }) {
  const start     = new Date(b.start_time);
  const isPast    = start < new Date();
  const cancelled = b.status === 'cancelled';

  return (
    <div className="card" style={{
      padding:'16px 20px', display:'flex', alignItems:'flex-start', gap:16,
      opacity: cancelled ? .6 : 1,
    }}>
      {/* Color dot */}
      <div style={{
        width:4, alignSelf:'stretch', borderRadius:99,
        background: cancelled ? 'var(--ink-3)' : (b.color || 'var(--accent)'),
        flexShrink:0,
      }} />

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontWeight:600, fontSize:15 }}>{b.event_title}</span>
          {cancelled
            ? <span className="badge badge-red">Cancelled</span>
            : isPast
            ? <span className="badge" style={{ background:'var(--surface-3)', color:'var(--ink-3)' }}>Past</span>
            : <span className="badge badge-green">Confirmed</span>
          }
        </div>
        <div style={{ fontSize:13, color:'var(--ink-2)', marginTop:4 }}>
          👤 {b.guest_name} · {b.guest_email}
        </div>
        <div style={{ fontSize:13, color:'var(--ink-3)', marginTop:3 }}>
          🕐 {formatInTimezone(b.start_time, userTimezone)}
          {b.guest_timezone && b.guest_timezone !== userTimezone && (
            <span style={{ marginLeft:8, color:'var(--accent)', fontSize:12 }}>
              (Guest: {formatInTimezone(b.start_time, b.guest_timezone)})
            </span>
          )}
        </div>
        {b.notes && (
          <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:4, fontStyle:'italic' }}>
            "{b.notes}"
          </div>
        )}
      </div>

      {/* Actions */}
      {!cancelled && !isPast && (
        <button
          className="btn btn-danger btn-sm"
          style={{ flexShrink:0 }}
          disabled={cancelling}
          onClick={() => onCancel(b.id)}
        >
          {cancelling ? <span className="spinner" style={{ width:14, height:14 }} /> : 'Cancel'}
        </button>
      )}
    </div>
  );
}
