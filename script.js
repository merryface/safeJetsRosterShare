import getDateString from './utils/getDateString.js'
import createRandomICalUid from './utils/createRandomICalUid.js';

function downloadICal() {
  const emailText = document.getElementById("rawRoster").value.split('\n')
  const roster = emailText.filter(line => line.match(/^\w{3}, \d{2} \w{3} \d{4}/));
  
  let rosterDays = '' 
  roster.forEach(day => {
    const Startdate = getDateString(day, false);
    const endDate = getDateString(day, true);

    let iCalEvent = `BEGIN:VEVENT
DTSTAMP:${Startdate}
DTSTART:${Startdate}
DTEND:${endDate}
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

   // Create an object URL from the Blob
   const objectURL = URL.createObjectURL(blob);
 
   // Create a link element to use for the download
   const downloadLink = document.createElement('a');
   downloadLink.download = 'duty.ics';
   downloadLink.href = objectURL;
   downloadLink.style.display = 'none';
 
   // Add the link to the DOM and click it to trigger the download
   document.body.appendChild(downloadLink);
   downloadLink.click();
 
   // Set the "Content-Disposition" header to "inline"
   const headers = new Headers();
   headers.set('Content-Disposition', 'inline');
 
   // Fetch the ics file and serve it with the "Content-Disposition" header
   fetch(objectURL, { headers })
     .then(response => {
       // Remove the link from the DOM
       document.body.removeChild(downloadLink);
 
       // Revoke the object URL
       URL.revokeObjectURL(objectURL);
     })
     .catch(error => {
       console.error(error);
     });

}

document.getElementById("downloadiCal").addEventListener("click", () => downloadICal())