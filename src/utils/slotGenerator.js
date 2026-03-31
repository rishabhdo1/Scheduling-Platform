
function generateSlots(date, startTime, endTime, duration, bookedSlots = [], timezone = 'UTC') {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  // Build window start/end in host's timezone using Intl
  const windowStart = localDateToUTC(date, sh, sm, timezone);
  const windowEnd   = localDateToUTC(date, eh, em, timezone);

  const bookedSet = new Set(bookedSlots.map((t) => new Date(t).getTime()));

  const slots   = [];
  const current = new Date(windowStart);

  while (current.getTime() + duration * 60_000 <= windowEnd.getTime()) {
    if (!bookedSet.has(current.getTime())) {
      slots.push(new Date(current).toISOString());
    }
    current.setTime(current.getTime() + duration * 60_000);
  }

  return slots;
}

/**
 * Converts a local date + hour/min in a given IANA timezone to a UTC Date.
 */
function localDateToUTC(dateStr, hours, minutes, timezone) {
  // Use a reference point: format "2024-06-10T09:00" in the target timezone
  // We find the UTC offset by checking what UTC time corresponds to midnight in that timezone
  const [year, month, day] = dateStr.split('-').map(Number);

  // Build candidate assuming no offset
  const candidate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

  // Determine what local time that UTC corresponds to in the target timezone
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year:    'numeric',
    month:   '2-digit',
    day:     '2-digit',
    hour:    '2-digit',
    minute:  '2-digit',
    hour12:  false,
  }).formatToParts(candidate);

  const p = {};
  for (const part of parts) p[part.type] = part.value;

  const localH  = parseInt(p.hour,   10) % 24;
  const localM  = parseInt(p.minute, 10);
  const localD  = parseInt(p.day,    10);

  // Compute the offset: how many ms is the candidate off from the desired local time
  const desiredTotalMins = hours * 60 + minutes;
  const actualTotalMins  = localH  * 60 + localM;
  let   diffMins         = desiredTotalMins - actualTotalMins;

  // Account for date boundary (e.g. candidate landed on previous/next day)
  const candidateDay = parseInt(String(day).padStart(2, '0'), 10);
  if (localD !== candidateDay) {
    diffMins += (localD < candidateDay ? -1 : 1) * 24 * 60;
  }

  return new Date(candidate.getTime() + diffMins * 60_000);
}

module.exports = { generateSlots, localDateToUTC };
