export const COMMON_TIMEZONES = [
  { value: 'Pacific/Honolulu',   label: 'Hawaii (UTC-10)' },
  { value: 'America/Anchorage',  label: 'Alaska (UTC-9)' },
  { value: 'America/Los_Angeles',label: 'Pacific Time (UTC-8/7)' },
  { value: 'America/Denver',     label: 'Mountain Time (UTC-7/6)' },
  { value: 'America/Chicago',    label: 'Central Time (UTC-6/5)' },
  { value: 'America/New_York',   label: 'Eastern Time (UTC-5/4)' },
  { value: 'America/Sao_Paulo',  label: 'Brasília (UTC-3)' },
  { value: 'Europe/London',      label: 'London (UTC+0/1)' },
  { value: 'Europe/Paris',       label: 'Central European (UTC+1/2)' },
  { value: 'Europe/Istanbul',    label: 'Istanbul (UTC+3)' },
  { value: 'Asia/Dubai',         label: 'Dubai (UTC+4)' },
  { value: 'Asia/Kolkata',       label: 'India (UTC+5:30)' },
  { value: 'Asia/Dhaka',         label: 'Bangladesh (UTC+6)' },
  { value: 'Asia/Bangkok',       label: 'Bangkok (UTC+7)' },
  { value: 'Asia/Singapore',     label: 'Singapore (UTC+8)' },
  { value: 'Asia/Tokyo',         label: 'Tokyo (UTC+9)' },
  { value: 'Australia/Sydney',   label: 'Sydney (UTC+10/11)' },
  { value: 'Pacific/Auckland',   label: 'Auckland (UTC+12/13)' },
  { value: 'UTC',                label: 'UTC' },
];

export function guessTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatInTimezone(isoString, timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone:  timezone,
      weekday:   'short',
      month:     'short',
      day:       'numeric',
      hour:      '2-digit',
      minute:    '2-digit',
      timeZoneName: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatDate(isoString) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(isoString));
}

export function formatTime(isoString, timezone = 'UTC') {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(isoString));
}
