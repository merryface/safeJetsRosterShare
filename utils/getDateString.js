export default function getDateString(day, end = false) {
  const arr = day.split(', ');
  const month = arr[1].split(' ')[1];
  const monthNum = new Date(`${month} 1, 2022`).getMonth() + 1;
  const dayOfMonth = arr[1].split(' ')[0];
  const year = arr[1].split(' ')[2];
  const date = `${year}-${monthNum}-${dayOfMonth}`;
  const dateObj = new Date(date);
  if (end) dateObj.setHours(23, 59, 59, 999);

  let output = dateObj.toISOString();
  output = output.slice(0, 10).replace(/-/g, '') + output.slice(10);
  output= output.slice(0, -5) + 'Z';
  return output.replace(/:/g, '');
}