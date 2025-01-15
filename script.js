import getDateString from './utils/getDateString.js'
import createRandomICalUid from './utils/createRandomICalUid.js';

function downloadICal() {
  const emailText = document.getElementById("rawRoster").value.split('\n');
  const roster = emailText.filter(line => line.match(/^\w{3}, \d{2} \w{3} \d{4} [A-Z]+$/));
  
  console.log('Processing roster entries:', roster);

  let rosterDays = '';
  roster.forEach((day, index) => {
    const match = day.match(/(\w{3}), (\d{2}) (\w{3}) (\d{4}) ([A-Z]+)/);
    if (!match) {
      console.error('Failed to parse date from:', day);
      return;
    }

    const [_, dayOfWeek, dayOfMonth, month, year, dutyStatus] = match;
    
    // Create date object directly from components
    const date = new Date(Date.UTC(
      parseInt(year),
      getMonthNumber(month),
      parseInt(dayOfMonth)
    ));
    
    // Format dates manually to avoid timezone issues
    const startDate = date.getUTCFullYear().toString() +
                     (date.getUTCMonth() + 1).toString().padStart(2, '0') +
                     date.getUTCDate().toString().padStart(2, '0');
    
    // Calculate end date (next day)
    date.setUTCDate(date.getUTCDate() + 1);
    const endDate = date.getUTCFullYear().toString() +
                   (date.getUTCMonth() + 1).toString().padStart(2, '0') +
                   date.getUTCDate().toString().padStart(2, '0');
    
    // Format the display status - if not OFF, show as Duty
    const displayStatus = dutyStatus === 'OFF' ? 'OFF' : 'Duty';
    
    console.log(`Processing entry ${index + 1}:`, {
      original: day,
      startDate,
      endDate,
      dutyStatus,
      displayStatus
    });

    let iCalEvent = `BEGIN:VEVENT
DTSTAMP:${startDate}T000000Z
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
UID:${createRandomICalUid()}
DESCRIPTION:${displayStatus}
SUMMARY:${displayStatus}
LOCATION:Online
END:VEVENT
`;

    rosterDays += iCalEvent;
  });

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//bobbin v0.1//NONSGML iCal Writer//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${rosterDays}END:VCALENDAR`;

  // Create and download the file
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const objectURL = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.download = 'duty.ics';
  downloadLink.href = objectURL;
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Clean up
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(objectURL);
}

// Helper function to convert month name to number (0-based)
function getMonthNumber(monthStr) {
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  return months[monthStr];
}

document.getElementById("downloadiCal").addEventListener("click", () => downloadICal());