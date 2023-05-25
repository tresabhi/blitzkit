export default function last5AM() {
  const fiveAM = new Date();
  fiveAM.setHours(5, 0, 0, 0); // Set the time to 5:00 AM today

  if (fiveAM > new Date()) {
    // If it's now before 5:00 AM, go back one day
    fiveAM.setDate(fiveAM.getDate() - 1);
  }

  return fiveAM;
}
