
const bookedByDoctor = {
  "ahmed-raza": ["09:30 AM", "11:00 AM"],
  "amara-khan": ["09:00 AM", "10:30 AM"],
  "imran-siddiqui": ["10:00 AM"],
  "sana-malik": ["09:00 AM", "09:30 AM", "10:00 AM"],
  "bilal-hussain": ["11:30 AM"],
  "tariq-mehmood": ["10:00 AM", "10:30 AM"],
};

export function getBookedSlots(doctorId) {
  return bookedByDoctor[doctorId] ?? [];
}