const STORAGE_KEY = "edushield_students";

export const loadStudents = (defaultStudents = []) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return defaultStudents;

    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load students:", error);
    return defaultStudents;
  }
};

export const saveStudents = (students) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Failed to save students:", error);
  }
};

export const clearStudents = () => {
  localStorage.removeItem(STORAGE_KEY);
};
