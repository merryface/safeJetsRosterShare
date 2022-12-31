export default function createRandomICalUid() {
  const randomNumber = Math.random();
  const hexString = randomNumber.toString(16);
  const uid = `${hexString}`;

  return uid;
}