/**
 * CalendarIntegrations.jsx
 * ─────────────────────────
 * Shows the ICS / email-based calendar sync status.
 * No OAuth buttons — just inform the user how it works.
 */

import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const WORKS_WITH = [
  { name: 'Google Calendar', icon: '📅', color: '#4285F4' },
  { name: 'Outlook',         icon: '📆', color: '#0078D4' },
  { name: 'Apple Calendar',  icon: '🗓', color: '#ff3b30' },
  { name: 'Thunderbird',     icon: '⚡', color: '#0a84ff' },
  { name: 'Proton Calendar', icon: '🔐', color: '#6d4aff' },
  { name: 'Any .ics app',    icon: '📎', color: '#22c55e' },
];

export default function CalendarIntegrations() {
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/calendar/status')
      .then(d => setStatus(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Status banner */}
      <div className="card" style={{
        padding: '20px 24px',
        borderLeft: `4px solid ${status?.configured ? 'var(--green)' : 'var(--yellow)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{status?.configured ? '✅' : '⚠️'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {status?.configured
                ? 'Calendar invites are active'
                : 'Email not configured yet'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>
              {status?.configured
                ? 'Both you and your guest receive a .ics calendar invite after every booking.'
                : 'Add EMAIL_USER and EMAIL_PASS to your .env file to enable calendar invites.'}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>How calendar sync works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { step: '1', icon: '📅', text: 'Guest books a slot on your scheduling page' },
            { step: '2', icon: '📧', text: 'Both you and the guest receive a confirmation email' },
            { step: '3', icon: '📎', text: 'The email includes a .ics calendar file attachment' },
            { step: '4', icon: '✅', text: 'Click the attachment → event added to your calendar app instantly' },
          ].map(({ step, icon, text }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent-bg)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>{step}</div>
              <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{icon} {text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Compatible apps */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Works with every calendar app</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
          The .ics format is an open standard (RFC 5545) supported universally.
          No account connection needed — it just works.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {WORKS_WITH.map(app => (
            <div key={app.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 'var(--radius)',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 18 }}>{app.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{app.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Setup instructions */}
      {!status?.configured && (
        <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Quick setup (2 minutes)</h3>
          <ol style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 2, paddingLeft: 20, margin: 0 }}>
            <li>Go to <strong>myaccount.google.com/apppasswords</strong></li>
            <li>Create an App Password for <strong>"Mail"</strong></li>
            <li>Add to your <code style={code}>.env</code> file:</li>
          </ol>
          <pre style={codeBlock}>
{`EMAIL_USER=you@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx`}
          </pre>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 12 }}>
            Restart the server and you're done. Alternatively, see <code style={code}>.env.example</code> for
            Brevo or Resend alternatives.
          </p>
        </div>
      )}

    </div>
  );
}

const code = {
  background: 'var(--surface-2)', padding: '2px 6px',
  borderRadius: 4, fontFamily: 'monospace', fontSize: 13,
};
const codeBlock = {
  background: 'var(--ink)', color: '#e2e8f0',
  padding: '14px 18px', borderRadius: 'var(--radius)',
  fontFamily: 'monospace', fontSize: 13,
  marginTop: 10, overflowX: 'auto',
};
