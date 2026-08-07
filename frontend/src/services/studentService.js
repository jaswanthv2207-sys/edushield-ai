import API from "./api";

/* ===========================
   Get All Students
=========================== */
export async function getStudents() {
  const response = await API.get("/api/students");
  return response.data;
}

/* ===========================
   Get Single Student
=========================== */
export async function getStudent(studentId) {
  const response = await API.get(`/api/students/${studentId}`);
  return response.data;
}

/* ===========================
   Delete Student
=========================== */
export async function deleteStudent(studentId) {
  const response = await API.delete(`/api/students/${studentId}`);
  return response.data;
}

/* ===========================
   Predict Student Risk
=========================== */
export async function predictStudent(student) {
  const payload = {
    Student_ID: student.Student_ID,
    School: student.School,

    Gender:
      student.Gender === "M"
        ? "Male"
        : student.Gender === "F"
          ? "Female"
          : student.Gender,

    Fees_Paid_Status: student.Fees_Paid_Status?.toLowerCase().includes("paid")
      ? "Paid"
      : "Unpaid",

    Internet_Access:
      student.Internet_Access?.toLowerCase() === "yes" ? "Yes" : "No",

    Family_Support:
      student.Family_Support?.toLowerCase() === "yes" ? "Yes" : "No",

    Wants_Higher_Education:
      student.Wants_Higher_Education?.toLowerCase() === "yes" ? "Yes" : "No",

    Medical_Status:
      student.Medical_Status === "healthy" ? "Good" : student.Medical_Status,

    Number_of_Absences: student.Number_of_Absences,
    Number_of_Failures: student.Number_of_Failures,
    Final_Grade: student.Final_Grade,
  };

  console.log("Payload being sent:");
  console.log(payload);

  const response = await API.post("/predict", payload);

  console.log("Backend Response:");
  console.log(response.data);

  return response.data;
}
