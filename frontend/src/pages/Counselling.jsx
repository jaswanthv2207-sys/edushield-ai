import React, { useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import useStudents from "../hooks/useStudents";

// Helper function to dynamically generate AI recommendations
function getRecommendations(student) {
  if (!student) return [];
  const recs = [];
  const grade = Number(student.Final_Grade || 0);
  const absences = Number(student.Number_of_Absences || 0);

  if (grade < 5) {
    recs.push("Immediate 1-on-1 academic intervention required.");
    recs.push("Schedule emergency parent-teacher conference.");
  } else if (grade < 10) {
    recs.push("Assign remedial tutoring in weak subject areas.");
  }

  if (absences > 5) {
    recs.push("Conduct attendance review and verify home situation.");
  }

  if (student.Family_Support === "No" || student.Family_Support === "Low") {
    recs.push("Provide active school-based mentorship and counseling.");
  }

  if (recs.length === 0) {
    recs.push("Regular bi-weekly check-ins to monitor progress.");
  }

  return recs;
}

function Counselling() {
  const { students = [] } = useStudents();

  // ----------------------------
  // Filters
  // ----------------------------
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ----------------------------
  // Selected Student & Form States
  // ----------------------------
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [counsellor, setCounsellor] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [priority, setPriority] = useState("High");
  const [notes, setNotes] = useState("");

  // ----------------------------
  // High Risk Students Filter
  // ----------------------------
  const highRiskStudents = useMemo(() => {
    return students.filter((student) => {
      const grade = Number(student.Final_Grade);

      if (grade >= 10) return false;

      const matchesSearch = student.Student_ID?.toLowerCase().includes(
        search.toLowerCase(),
      );

      if (statusFilter === "All" || statusFilter === "Pending") {
        return matchesSearch;
      }

      if (statusFilter === "Assigned") {
        return false;
      }

      return matchesSearch;
    });
  }, [students, search, statusFilter]);

  // ----------------------------
  // Dashboard Statistics
  // ----------------------------
  const totalCases = highRiskStudents.length;
  const pendingCases = highRiskStudents.length;
  const assignedCases = 0;
  const emergencyCases = highRiskStudents.filter(
    (student) => Number(student.Final_Grade) < 5,
  ).length;

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setCounsellor("");
    setMeetingDate("");
    setPriority(Number(student.Final_Grade) < 5 ? "Emergency" : "High");
    setNotes("");
  };

  const handleAssignCounsellor = () => {
    if (!counsellor) {
      alert("Please select a counsellor");
      return;
    }
    alert(`Counsellor ${counsellor} assigned successfully!`);
  };

  const handleSaveNotes = () => {
    if (!notes.trim()) {
      alert("Please write some notes before saving.");
      return;
    }
    alert("Counselling Notes Saved Successfully");
  };

  return (
    <MainLayout>
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 35,
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: 8,
            }}
          >
            🫂 Counselling Management
          </h1>
          <p style={{ color: "#64748B", fontSize: 17, margin: 0 }}>
            Monitor high-risk students and assign counselling sessions.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "16px 24px",
            borderRadius: 18,
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 30px rgba(0,0,0,.05)",
          }}
        >
          <div style={{ fontSize: 13, color: "#64748B" }}>
            Government of Rajasthan
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#2563EB" }}>
            EduShield AI
          </div>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
          marginBottom: 35,
        }}
      >
        <StatCard
          icon="👨‍🎓"
          title="High Risk Students"
          value={totalCases}
          color="#DC2626"
        />
        <StatCard
          icon="⏳"
          title="Pending Cases"
          value={pendingCases}
          color="#F59E0B"
        />
        <StatCard
          icon="✅"
          title="Assigned"
          value={assignedCases}
          color="#16A34A"
        />
        <StatCard
          icon="🚨"
          title="Emergency"
          value={emergencyCases}
          color="#991B1B"
        />
      </div>

      {/* ================= FILTER SECTION ================= */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
            flexWrap: "wrap",
            gap: 15,
          }}
        >
          <h2 style={{ margin: 0 }}>Student Search</h2>
          <span
            style={{
              background: "#DBEAFE",
              color: "#2563EB",
              padding: "8px 16px",
              borderRadius: 30,
              fontWeight: 600,
            }}
          >
            {highRiskStudents.length} Students Found
          </span>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <input
            style={{ ...input, flex: 1, marginBottom: 0 }}
            placeholder="Search Student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ ...input, width: "auto", marginBottom: 0 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
          </select>
        </div>
      </div>

      {/* ================= STUDENTS TABLE ================= */}
      <div style={{ ...card, marginTop: 35 }}>
        <h2 style={{ marginBottom: 25 }}>High Risk Student List</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Student ID</th>
                <th style={th}>School</th>
                <th style={th}>Grade</th>
                <th style={th}>Attendance</th>
                <th style={th}>Priority</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskStudents.map((student) => {
                const grade = Number(student.Final_Grade);
                const attendance = Math.max(
                  0,
                  100 - Number(student.Number_of_Absences || 0) * 5,
                );
                const isEmergency = grade < 5;
                const priorityLabel = isEmergency ? "Emergency" : "High";
                const priorityColor = isEmergency ? "#DC2626" : "#F59E0B";

                return (
                  <tr key={student.Student_ID}>
                    <td style={td}>
                      <b>{student.Student_ID}</b>
                    </td>
                    <td style={td}>{student.School}</td>
                    <td style={td}>{grade}</td>
                    <td style={td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 100,
                            height: 8,
                            background: "#E2E8F0",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${attendance}%`,
                              height: "100%",
                              background:
                                attendance > 75
                                  ? "#16A34A"
                                  : attendance > 50
                                    ? "#F59E0B"
                                    : "#DC2626",
                            }}
                          />
                        </div>
                        <span>{attendance}%</span>
                      </div>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          background: priorityColor + "22",
                          color: priorityColor,
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {priorityLabel}
                      </span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          background: "#FEF3C7",
                          color: "#D97706",
                          padding: "6px 14px",
                          borderRadius: 20,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        Pending
                      </span>
                    </td>
                    <td style={td}>
                      <button
                        style={assignBtn}
                        onClick={() => handleSelectStudent(student)}
                      >
                        View & Assign
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {highRiskStudents.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 50,
              color: "#64748B",
              fontSize: 18,
            }}
          >
            🎉 No High Risk Students Found
          </div>
        )}
      </div>

      {/* ================= DETAILED VIEW (WHEN STUDENT IS SELECTED) ================= */}
      {selectedStudent && (
        <div style={{ marginTop: 40 }}>
          {/* Profile & Risk Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 25,
            }}
          >
            {/* Student Profile */}
            <div style={card}>
              <h2 style={{ marginTop: 0, marginBottom: 20 }}>
                👤 Student Profile ({selectedStudent.Student_ID})
              </h2>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={label}>School</td>
                    <td style={value}>{selectedStudent.School || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={label}>Gender</td>
                    <td style={value}>{selectedStudent.Gender || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={label}>Final Grade</td>
                    <td style={value}>{selectedStudent.Final_Grade}</td>
                  </tr>
                  <tr>
                    <td style={label}>Absences</td>
                    <td style={value}>
                      {selectedStudent.Number_of_Absences || 0}
                    </td>
                  </tr>
                  <tr>
                    <td style={label}>Family Support</td>
                    <td style={value}>
                      {selectedStudent.Family_Support || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td style={label}>Internet Access</td>
                    <td style={value}>
                      {selectedStudent.Internet_Access || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td style={label}>Medical Status</td>
                    <td style={value}>
                      {selectedStudent.Medical_Status || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td style={label}>Fees Status</td>
                    <td style={value}>
                      {selectedStudent.Fees_Paid_Status || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI Risk Analysis */}
            <div style={card}>
              <h2 style={{ marginTop: 0, marginBottom: 25 }}>
                🤖 AI Risk Analysis
              </h2>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "#FEE2E2",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "10px solid #DC2626",
                  }}
                >
                  <h1 style={{ margin: 0, color: "#DC2626", fontSize: 42 }}>
                    92%
                  </h1>
                  <p style={{ margin: 0, color: "#64748B", fontWeight: 600 }}>
                    HIGH RISK
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 30 }}>
                <p style={{ margin: "0 0 8px 0" }}>
                  <b>Model Confidence</b>
                </p>
                <div
                  style={{
                    width: "100%",
                    height: 12,
                    background: "#E2E8F0",
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "95%",
                      height: "100%",
                      background: "#2563EB",
                    }}
                  />
                </div>
                <p style={{ color: "#64748B", marginTop: 8, fontSize: 14 }}>
                  Confidence Level: 95%
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations & Counsellor Assignment */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 25,
              marginTop: 25,
            }}
          >
            {/* AI Recommendations */}
            <div style={card}>
              <h2 style={{ marginTop: 0, marginBottom: 20 }}>
                🧠 AI Recommendations
              </h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {getRecommendations(selectedStudent).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#F8FAFC",
                      padding: 14,
                      borderRadius: 12,
                      borderLeft: "5px solid #2563EB",
                      fontSize: 15,
                      color: "#1E293B",
                    }}
                  >
                    ✅ {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Counsellor Assignment */}
            <div style={card}>
              <h2 style={{ marginTop: 0, marginBottom: 20 }}>
                👨‍🏫 Assign Counsellor
              </h2>

              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Choose Counsellor
              </label>
              <select
                style={input}
                value={counsellor}
                onChange={(e) => setCounsellor(e.target.value)}
              >
                <option value="">Select Counsellor</option>
                <option value="Dr. Meera Sharma">Dr. Meera Sharma</option>
                <option value="Mrs. Kavitha Rao">Mrs. Kavitha Rao</option>
                <option value="Mr. Rakesh Kumar">Mr. Rakesh Kumar</option>
                <option value="Dr. Priya Menon">Dr. Priya Menon</option>
              </select>

              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Meeting Date
              </label>
              <input
                type="date"
                style={input}
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />

              <label style={{ fontWeight: 600, fontSize: 14 }}>Priority</label>
              <select
                style={input}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Emergency">Emergency</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <button
                style={{ ...assignBtn, width: "100%", marginTop: 10 }}
                onClick={handleAssignCounsellor}
              >
                Save Assignment
              </button>
            </div>
          </div>

          {/* Counselling Notes */}
          <div style={{ marginTop: 25 }}>
            <div style={card}>
              <h2 style={{ marginTop: 0, marginBottom: 15 }}>
                📝 Counselling Notes
              </h2>
              <textarea
                rows={5}
                placeholder="Write counselling observations, follow-up actions, parent meeting notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #CBD5E1",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  fontSize: 15,
                }}
              />
              <button
                style={{ ...assignBtn, marginTop: 15 }}
                onClick={handleSaveNotes}
              >
                💾 Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

/* ===========================
   COMPONENTS & STYLES
=========================== */

function StatCard({ icon, title, value, color }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 22,
        padding: 24,
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px rgba(0,0,0,.06)",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ color: "#64748B", fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 36, marginTop: 8, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

const card = {
  background: "#FFFFFF",
  borderRadius: 20,
  padding: 25,
  border: "1px solid #E2E8F0",
  boxShadow: "0 10px 25px rgba(0,0,0,.05)",
};

const input = {
  width: "100%",
  padding: 12,
  marginTop: 6,
  marginBottom: 16,
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  fontSize: 15,
  boxSizing: "border-box",
};

const th = {
  textAlign: "left",
  padding: 16,
  background: "#F8FAFC",
  borderBottom: "2px solid #E2E8F0",
  color: "#475569",
  fontWeight: 700,
};

const td = {
  padding: 16,
  borderBottom: "1px solid #F1F5F9",
};

const assignBtn = {
  background: "#2563EB",
  color: "#FFFFFF",
  border: "none",
  padding: "10px 20px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const label = {
  width: "45%",
  padding: "10px 0",
  fontWeight: 600,
  color: "#475569",
  borderBottom: "1px solid #E2E8F0",
};

const value = {
  padding: "10px 0",
  color: "#0F172A",
  borderBottom: "1px solid #E2E8F0",
};

export default Counselling;
