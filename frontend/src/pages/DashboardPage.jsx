import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import EventTypeModal      from '../components/EventTypeModal';
import CalendarIntegrations from '../components/CalendarIntegrations';
import AvailabilityEditor  from '../components/AvailabilityEditor';
import BookingsList        from '../components/BookingsList';

const TABS = ['Event Types', 'Availability', 'Bookings', 'Calendars'];

export default function DashboardPage() {
  const { user }                      = useAuth();
  const [tab, setTab]                 = useState(0);
  const [eventTypes, setEventTypes]   = useState([]);
  const [loadingET, setLoadingET]     = useState(true);
  const [modal, setModal]             = useState(null); // null | 'new' | {existing}
  const [toast, setToast]             = useState('');

  useEffect(() => {
    api.get('/event-types')
      .then(d => setEventTypes(d.eventTypes))
      .catch(() => {})
      .finally(() => setLoadingET(false));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleSaved = (et, action) => {
    if (action === 'created') {
      setEventTypes(prev => [et, ...prev]);
    } else {
      setEventTypes(prev => prev.map(e => e.id === et.id ? et : e));
    }
    setModal(null);
    showToast(action === 'created' ? '✓ Event type created' : '✓ Event type updated');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event type? All associated bookings will also be deleted.')) return;
    try {
      await api.delete(`/event-types/${id}`);
      setEventTypes(prev => prev.filter(e => e.id !== id));
      showToast('Event type deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  const bookingLink = (et) => `${window.location.origin}/book/${et.id}`;

  const copyLink = (et) => {
    navigator.clipboard.writeText(bookingLink(et));
    showToast('🔗 Link copied to clipboard!');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:'var(--ink)', marginBottom:4 }}>
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'var(--ink-3)', fontSize:15 }}>
          Manage your scheduling page and calendar integrations.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, marginBottom:28, borderBottom:'2px solid var(--border)', paddingBottom:0 }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding:'8px 20px', fontSize:14, fontWeight:500,
            background:'none', border:'none', cursor:'pointer',
            color: tab===i ? 'var(--accent)' : 'var(--ink-3)',
            borderBottom: tab===i ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom:-2, transition:'all var(--transition)',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Event Types */}
      {tab === 0 && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Event Types</h2>
              <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:2 }}>Define the types of meetings people can book with you.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setModal('new')}>
              + New event type
            </button>
          </div>

          {loadingET ? (
            <div style={{ display:'flex', justifyContent:'center', padding:48 }}><div className="spinner" /></div>
          ) : eventTypes.length === 0 ? (
            <EmptyState
              icon="🗓"
              title="No event types yet"
              desc="Create your first event type to start accepting bookings."
              action={<button className="btn btn-primary" onClick={() => setModal('new')}>Create event type</button>}
            />
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
              {eventTypes.map(et => (
                <EventTypeCard
                  key={et.id}
                  et={et}
                  onEdit={() => setModal(et)}
                  onDelete={() => handleDelete(et.id)}
                  onCopy={() => copyLink(et)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Availability */}
      {tab === 1 && (
        <div>
          <div style={{ marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:700 }}>Weekly Availability</h2>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:2 }}>
              Set the days and hours when people can book you.
              Times are in your timezone ({user?.timezone || 'UTC'}).
            </p>
          </div>
          <div className="card" style={{ padding:24, maxWidth:600 }}>
            <AvailabilityEditor />
          </div>
        </div>
      )}

      {/* Tab 2: Bookings */}
      {tab === 2 && (
        <div>
          <div style={{ marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:700 }}>Your Bookings</h2>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:2 }}>All appointments scheduled with you.</p>
          </div>
          <BookingsList />
        </div>
      )}

      {/* Tab 3: Calendars */}
      {tab === 3 && (
        <div>
          <div style={{ marginBottom:20 }}>
            <h2 style={{ fontSize:18, fontWeight:700 }}>Calendar Integrations</h2>
            <p style={{ fontSize:13, color:'var(--ink-3)', marginTop:2 }}>
              Connect your calendars to automatically sync bookings and send invites.
            </p>
          </div>
          <div style={{ maxWidth:600 }}>
            <CalendarIntegrations />
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <EventTypeModal
          existing={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)',
          background:'var(--ink)', color:'#fff', padding:'12px 24px',
          borderRadius:99, fontSize:14, fontWeight:500,
          boxShadow:'var(--shadow-lg)', zIndex:200,
          animation:'fadeUp .2s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function EventTypeCard({ et, onEdit, onDelete, onCopy }) {
  return (
    <div className="card" style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
      {/* Color bar + title */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:4, height:44, borderRadius:99, background:et.color, flexShrink:0, marginTop:2 }} />
        <div>
          <div style={{ fontWeight:600, fontSize:15, color:'var(--ink)' }}>{et.title}</div>
          <div style={{ fontSize:13, color:'var(--ink-3)', marginTop:2 }}>
            ⏱ {et.duration} min
            {et.location && <span style={{ marginLeft:8 }}>📍 {et.location}</span>}
          </div>
          {et.description && (
            <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:4 }}>{et.description}</div>
          )}
        </div>
      </div>

      {/* Booking link */}
      <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface-2)', borderRadius:8, padding:'8px 12px' }}>
        <span style={{ fontSize:12, color:'var(--ink-3)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          /book/{et.id}
        </span>
        <button className="btn btn-sm btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={onCopy}>
          Copy
        </button>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-ghost btn-sm" style={{ flex:1 }} onClick={onEdit}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--ink-3)' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>{icon}</div>
      <div style={{ fontWeight:600, fontSize:16, color:'var(--ink)', marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:14, marginBottom:24 }}>{desc}</div>
      {action}
    </div>
  );
}
