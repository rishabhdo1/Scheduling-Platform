import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { COMMON_TIMEZONES, guessTimezone, formatDate, formatTime } from '../utils/timezones';

const STEPS = { SELECT_DATE: 0, SELECT_TIME: 1, CONFIRM: 2, SUCCESS: 3 };

export default function BookingPage() {
  const { eventTypeId }         = useParams();
  const [eventType, setEventType] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [step, setStep]           = useState(STEPS.SELECT_DATE);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timezone, setTimezone]   = useState(guessTimezone());
  const [slots, setSlots]         = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({ guestName:'', guestEmail:'', notes:'' });
  const [booking, setBooking]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load event type
  useEffect(() => {
    api.get(`/event-types/${eventTypeId}`)
      .then(d => setEventType(d.eventType))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventTypeId]);

  // Load slots when date or timezone changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    api.get(`/bookings/slots/${eventTypeId}?date=${selectedDate}&timezone=${encodeURIComponent(timezone)}`)
      .then(d => setSlots(d.availableSlots))
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, timezone, eventTypeId]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(STEPS.SELECT_TIME);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(STEPS.CONFIRM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError('');
    try {
      const res = await api.post('/bookings', {
        eventTypeId,
        guestName:     form.guestName,
        guestEmail:    form.guestEmail,
        guestTimezone: timezone,
        startTime:     selectedSlot.utc,
        notes:         form.notes,
      });
      setBooking(res.booking);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageShell><div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{ width:32, height:32 }} /></div></PageShell>;
  if (error)   return <PageShell><div style={{ textAlign:'center', padding:80, color:'var(--red)' }}>{error}</div></PageShell>;
  if (!eventType) return null;

  return (
    <PageShell>
      <div style={styles.container}>
        {/* Left panel — event info */}
        <div style={styles.leftPanel}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background: eventType.color || 'var(--accent)', flexShrink:0 }} />
            <span style={{ fontSize:13, color:'var(--ink-3)', fontWeight:500 }}>Meeting</span>
          </div>

          <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--ink)', marginBottom:8, lineHeight:1.2 }}>
            {eventType.title}
          </div>

          <div style={styles.infoRow}>
            <span>⏱</span>
            <span>{eventType.duration} minutes</span>
          </div>
          {eventType.location && (
            <div style={styles.infoRow}>
              <span>📍</span>
              <span>{eventType.location}</span>
            </div>
          )}
          {eventType.description && (
            <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.7, marginTop:16 }}>
              {eventType.description}
            </p>
          )}

          {/* Timezone selector */}
          <div style={{ marginTop:28 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:.6, marginBottom:8 }}>
              Your timezone
            </div>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="form-input"
              style={{ fontSize:13 }}
            >
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          {/* Breadcrumb */}
          {step > STEPS.SELECT_DATE && (
            <div style={{ marginTop:24, padding:'14px 16px', background:'var(--accent-bg)', borderRadius:'var(--radius)', fontSize:13 }}>
              {selectedDate && (
                <div style={{ color:'var(--ink-2)', marginBottom:4 }}>
                  📅 {formatDate(selectedDate + 'T12:00:00Z')}
                </div>
              )}
              {selectedSlot && (
                <div style={{ color:'var(--accent)', fontWeight:600 }}>
                  🕐 {selectedSlot.guestTime}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel — steps */}
        <div style={styles.rightPanel}>

          {/* STEP 0: Date picker */}
          {step === STEPS.SELECT_DATE && (
            <div>
              <StepHeader title="Select a date" />
              <MiniCalendar onSelect={handleDateSelect} selectedDate={selectedDate} />
            </div>
          )}

          {/* STEP 1: Time slots */}
          {step === STEPS.SELECT_TIME && (
            <div>
              <StepHeader
                title={formatDate(selectedDate + 'T12:00:00Z')}
                back={() => { setStep(STEPS.SELECT_DATE); setSelectedDate(''); }}
              />
              {loadingSlots ? (
                <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" /></div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--ink-3)' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>😔</div>
                  No available slots on this day.
                  <br />
                  <button className="btn btn-ghost btn-sm" style={{ marginTop:12 }} onClick={() => { setStep(STEPS.SELECT_DATE); setSelectedDate(''); }}>
                    Pick another date
                  </button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8 }}>
                  {slots.map((slot, i) => (
                    <button key={i} className="btn btn-ghost" onClick={() => handleSlotSelect(slot)}
                      style={{ justifyContent:'center', fontWeight:500 }}>
                      {slot.guestTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Confirm */}
          {step === STEPS.CONFIRM && (
            <div>
              <StepHeader
                title="Enter your details"
                back={() => setStep(STEPS.SELECT_TIME)}
              />
              {submitError && <div style={{ background:'var(--red-bg)', color:'var(--red)', fontSize:13, padding:'10px 14px', borderRadius:'var(--radius)', marginBottom:16 }}>{submitError}</div>}
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="form-group">
                  <label className="form-label">Your name *</label>
                  <input className="form-input" placeholder="Jane Doe" required
                    value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email address *</label>
                  <input className="form-input" type="email" placeholder="jane@example.com" required
                    value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Additional notes</label>
                  <textarea className="form-input" placeholder="Anything you'd like to share beforehand?" rows={3}
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ resize:'vertical' }} />
                </div>

                <div style={{ background:'var(--surface-2)', borderRadius:'var(--radius)', padding:'12px 16px', fontSize:13, color:'var(--ink-2)', marginTop:4 }}>
                  <strong>Booking summary:</strong><br />
                  📅 {formatDate(selectedDate + 'T12:00:00Z')}<br />
                  🕐 {selectedSlot?.guestTime} ({timezone})
                </div>

                <button className="btn btn-primary btn-lg" type="submit" disabled={submitting} style={{ marginTop:4 }}>
                  {submitting ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : 'Confirm booking'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === STEPS.SUCCESS && (
            <div style={{ textAlign:'center', padding:'32px 16px' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, marginBottom:8 }}>
                You're booked!
              </h2>
              <p style={{ color:'var(--ink-2)', fontSize:14, marginBottom:24, lineHeight:1.7 }}>
                A confirmation has been sent to <strong>{form.guestEmail}</strong>.
              </p>
              <div style={{ background:'var(--accent-bg)', borderRadius:'var(--radius)', padding:'16px 20px', fontSize:14, textAlign:'left', marginBottom:24 }}>
                <div style={{ fontWeight:600, marginBottom:8 }}>{eventType.title}</div>
                {booking?.guestTime && (
                  <div style={{ color:'var(--ink-2)' }}>🕐 {booking.guestTime}</div>
                )}
                {booking?.hostTime && booking.hostTime !== booking.guestTime && (
                  <div style={{ color:'var(--ink-3)', fontSize:13, marginTop:4 }}>Host's time: {booking.hostTime}</div>
                )}
                {eventType.location && (
                  <div style={{ color:'var(--ink-2)', marginTop:4 }}>📍 {eventType.location}</div>
                )}
                {booking?.emailSent && (
                  <div style={{ color:'var(--green)', marginTop:8, fontSize:13 }}>
                    📧 Calendar invite sent to {form.guestEmail}
                  </div>
                )}
              </div>
              <button className="btn btn-ghost" onClick={() => window.location.reload()}>
                Book another time
              </button>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}

// ── Sub-components ──────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--surface-2)', display:'flex', flexDirection:'column' }}>
      <header style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'16px 32px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--accent)' }}>Schedulr</div>
      </header>
      <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'40px 20px' }}>
        {children}
      </div>
    </div>
  );
}

function StepHeader({ title, back }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
      {back && (
        <button onClick={back} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-3)', fontSize:18, lineHeight:1, padding:4 }}>
          ←
        </button>
      )}
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700 }}>{title}</h3>
    </div>
  );
}

function MiniCalendar({ onSelect, selectedDate }) {
  const today    = new Date();
  today.setHours(0,0,0,0);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = n => String(n).padStart(2,'0');
  const toISO = (d) => `${cursor.year}-${pad(cursor.month+1)}-${pad(d)}`;
  const isToday = (d) => toISO(d) === today.toISOString().slice(0,10);
  const isPast  = (d) => new Date(cursor.year, cursor.month, d) < today;
  const isSelected = (d) => toISO(d) === selectedDate;

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAY_ABBR    = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const prevMonth = () => {
    if (cursor.month === 0) setCursor({ year: cursor.year - 1, month: 11 });
    else setCursor(c => ({ ...c, month: c.month - 1 }));
  };
  const nextMonth = () => {
    if (cursor.month === 11) setCursor({ year: cursor.year + 1, month: 0 });
    else setCursor(c => ({ ...c, month: c.month + 1 }));
  };

  return (
    <div style={{ userSelect:'none' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <span style={{ fontWeight:600, fontSize:14 }}>
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </span>
        <button onClick={nextMonth} style={navBtn}>›</button>
      </div>

      {/* Day names */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
        {DAY_ABBR.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'var(--ink-3)', padding:'4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const past   = isPast(d);
          const sel    = isSelected(d);
          const tod    = isToday(d);
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => !past && onSelect(toISO(d))}
              style={{
                aspectRatio:'1', borderRadius:8, border:'none',
                fontSize:13, fontWeight: sel || tod ? 600 : 400,
                cursor: past ? 'default' : 'pointer',
                background: sel ? 'var(--accent)' : tod ? 'var(--accent-bg)' : 'transparent',
                color: sel ? '#fff' : past ? 'var(--surface-3)' : tod ? 'var(--accent)' : 'var(--ink)',
                transition:'all var(--transition)',
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtn = {
  background:'none', border:'none', cursor:'pointer',
  fontSize:20, color:'var(--ink-2)', padding:'4px 8px',
  borderRadius:6, lineHeight:1,
};

const styles = {
  container: {
    display:'flex', gap:0, width:'100%', maxWidth:820,
    background:'var(--surface)', borderRadius:'var(--radius-lg)',
    boxShadow:'var(--shadow-lg)', overflow:'hidden',
    minHeight:520,
  },
  leftPanel: {
    width:280, flexShrink:0,
    background:'var(--surface-2)', borderRight:'1px solid var(--border)',
    padding:32,
  },
  rightPanel: {
    flex:1, padding:32, minWidth:0,
  },
  infoRow: {
    display:'flex', alignItems:'center', gap:8,
    fontSize:13, color:'var(--ink-2)', marginTop:8,
  },
};
