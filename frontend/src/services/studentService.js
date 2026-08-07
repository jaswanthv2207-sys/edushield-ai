export const calculateRisk = (attendance, cgpa) => {
  let risk = 20;

  if (attendance < 60) risk += 40;
  else if (attendance < 75) risk += 20;

  if (cgpa < 6) risk += 30;
  else if (cgpa < 7) risk += 15;

  return Math.min(risk, 100);
};
