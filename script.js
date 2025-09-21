import createRandomICalUid from './utils/createRandomICalUid.js';

// Source of truth: codes → full descriptions
const keyDescription = {
  D:   'Duty',
  TRT: 'Training Travel',
  INI: 'Type Rating Initial',
  REC: 'Sim Recurrent Training',
  GRT: 'Ground Recurrent Training',
  BT:  'Base Training',
  OGD: 'Office Ground Duties'
};

// Derived set of codes to include
const includeCodes = new Set(Object.keys(keyDescription));

function parseRosterLines(text) {
  const rx = /^\w{3}, (\d{2}) (\w{3}) (\d{4}) ([A-Z]+)$/;
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};

  const entries = [];
  for (const line of text.split('\n').map(s => s.trim()).filter(Boolean)) {
    const m = line.match(rx);
    if (!m) continue;
    const [, dd, mon, yyyy, code] = m;
    const date = new Date(Date.UTC(+yyyy, months[mon], +dd));
    entries.push({ date, code });
  }
  entries.sort((a, b) => a.date - b.date);
  return entries;
}

function groupRuns(entries) {
  const runs = [];
  if (entries.length === 0) return runs;

  let start = entries[0].date;
  let end = entries[0].date;
  let code = entries[0].code;

  for (let i = 1; i < entries.length; i++) {
    const cur = entries[i];
    const nextDay = new Date(end.getTime());
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const isConsecutive = cur.date.getTime() === nextDay.getTime();
    const sameCode = cur.code === code;

    if (isConsecutive && sameCode) {
      end = cur.date;
    } else {
      runs.push({ start, end, code });
      start = cur.date;
      end = cur.date;
      code = cur.code;
    }
  }
  runs.push({ start, end, code });
  return runs;
}

function formatDateAsYYYYMMDD(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function downloadICalFromText(raw) {
  const entries = parseRosterLines(raw);
  const runs = groupRuns(entries).filter(r => includeCodes.has(r.code));

  let events = '';
  for (const r of runs) {
    const dtStart = formatDateAsYYYYMMDD(r.start);
    const dtEndExclusive = new Date(r.end.getTime());
    dtEndExclusive.setUTCDate(dtEndExclusive.getUTCDate() + 1);
    const dtEnd = formatDateAsYYYYMMDD(dtEndExclusive);

    const fullText = keyDescription[r.code];

    events += `BEGIN:VEVENT
DTSTAMP:${dtStart}T000000Z
DTSTART;VALUE=DATE:${dtStart}
DTEND;VALUE=DATE:${dtEnd}
UID:${createRandomICalUid()}
SUMMARY:${fullText}
DESCRIPTION:${fullText}
END:VEVENT
`;
  }

  const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//bobbin v0.3//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}END:VCALENDAR`;

  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = 'duty.ics';
  a.href = url;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Button hook
document.getElementById('downloadiCal').addEventListener('click', () => {
  const raw = document.getElementById('rawRoster').value;
  downloadICalFromText(raw);
});
