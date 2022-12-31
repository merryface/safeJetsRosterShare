function downloadICal(events) {
  let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My Calendar//NONSGML v1.0//EN`;

  // Loop through the events and add them to the iCalendar content
  for (const event of events) {
    icalContent += `
BEGIN:VEVENT
UID:${event.uid}
DTSTAMP:${event.dtstamp}
DTSTART:${event.dtstart}
DTEND:${event.dtend}
SUMMARY:${event.summary}
LOCATION:${event.location}
END:VEVENT`;
  }

  icalContent += `
END:VCALENDAR`;

  // Create a Blob from the iCalendar content
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });

  // Create a link element to use for the download
  const downloadLink = document.createElement('a');
  downloadLink.download = 'duty.ics';
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.style.display = 'none';

  // Add the link to the DOM and click it to trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Remove the link from the DOM
  document.body.removeChild(downloadLink);
}

function createRandomICalUid() {
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();

  // Convert the number to a hexadecimal string
  const hexString = randomNumber.toString(16);

  // Use the hexadecimal string to create an iCal event UID
  const uid = `${hexString}@example.com`;

  return uid;
}

function getDateString(str) {
  // Split the string into an array of substrings using a comma and a space as the delimiter
  const arr = str.split(', ');

  // Extract the day of the week (e.g., "Wed") and the month (e.g., "Jan") from the array
  const dayOfWeek = arr[0];
  const month = arr[1].split(' ')[1];

  // Convert the month to its numeric equivalent (e.g., "Jan" becomes "01")
  const monthNum = new Date(`${month} 1, 2022`).getMonth() + 1;

  // Extract the day of the month (e.g., "04") and the year (e.g., "2023") from the array
  const dayOfMonth = arr[1].split(' ')[0];
  const year = arr[1].split(' ')[2];

  // Create a date string in the format "YYYY-MM-DD"
  const date = `${year}-${monthNum}-${dayOfMonth}`;

  // Create a Date object for the date
  const dateObj = new Date(date);

  // Convert the Date object to an ISO-formatted string
  return dateObj.toISOString();
}



const events = [
  {
    uid: '1234567890',
    dtstamp: '20220101T080000Z',
    dtstart: '20220101T090000Z',
    dtend: '20220101T100000Z',
    summary: 'Meeting with John',
    location: 'Online'
  },
  {
    uid: '2345678901',
    dtstamp: '20220101T090000Z',
    dtstart: '20220101T100000Z',
    dtend: '20220101T110000Z',
    summary: 'Meeting with Jane',
    location: 'Online'
  }
];

document.getElementById("downloadiCal").addEventListener("click", () => {
  let emailText = document.getElementById("rawRoster").value.split('\n')
  const roster = emailText.filter(line => line.match(/^\w{3}, \d{2} \w{3} \d{4}/));

  const dutyDays = []
  roster.forEach(day => {
    const date = getDateString(day);
    const dateObj = new Date(date);
    const dtstamp = dateObj.toISOString();
    const dtend = dateObj.toISOString() + 1;

    let iCalEvent = {
      uid: createRandomICalUid(),
      dtstamp,
      dtstart: dtstamp,
      dtend: dtend,
      summary: day.slice(-3),
      location: 'SafeJets'
    }

    dutyDays.push(iCalEvent)
    downloadICal(dutyDays)
  });
})

