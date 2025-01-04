import getDateString from './utils/getDateString.js'
import createRandomICalUid from './utils/createRandomICalUid.js';

async function downloadICal() {
  const emailText = document.getElementById("rawRoster").value.split('\n')
  const roster = emailText.filter(line => line.match(/^\w{3}, \d{2} \w{3} \d{4}/));
  
  let rosterDays = '' 
  roster.forEach(day => {
    const Startdate = getDateString(day, false).slice(0, 8);  // Get only the YYYYMMDD part
    const endDate = getDateString(day, true).slice(0, 8);      // Get only the YYYYMMDD part and increment by 1 day

    let iCalEvent = `BEGIN:VEVENT
DTSTAMP:${Startdate}T000000Z
DTSTART;VALUE=DATE:${Startdate}
DTEND;VALUE=DATE:${endDate}
UID:${createRandomICalUid()}
DESCRIPTION:${day.slice(-3)}
SUMMARY:${day.slice(-3)}
LOCATION:Online
END:VEVENT
`

    rosterDays += iCalEvent
  });

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//bobbin v0.1//NONSGML iCal Writer//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`+rosterDays+`END:VCALENDAR`

  // Create a Blob from the iCalendar content
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });

  // Generate a unique filename
  const filename = `duty-${Date.now()}.ics`;

  // Send the Blob to the server and get the URL of the uploaded file
  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: blob,
    headers: {
      'Content-Disposition': `attachment; filename=${filename}`
    }
  });
  const fileUrl = await response.text();

  // Create a link element to use for the download
  const downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = fileUrl;
  downloadLink.style.display = 'none';

  // Add the link to the DOM and click it to trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Remove the link from the DOM
  document.body.removeChild(downloadLink);
}

document.getElementById("downloadiCal").addEventListener("click", () => downloadICal())
