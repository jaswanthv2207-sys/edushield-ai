import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import useStudents from "../hooks/useStudents";
import RiskBadge from "../components/RiskBadge";

function Counselling() {
  const { students } = useStudents();

  const [showModal, setShowModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [counsellor, setCounsellor] = useState("");

  const [meetingDate, setMeetingDate] = useState("");

  const [priority, setPriority] = useState("High");

  const [notes, setNotes] = useState("");

  const highRiskStudents = students.filter((s) => s.risk >= 80);

  return (
    <>
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: 500,
              background: "#fff",
              borderRadius: 18,
              padding: 30,
            }}
          >
            <h2>Assign Counsellor</h2>

            <p>
              <b>Student:</b> {selectedStudent?.name}
            </p>

            <label>Counsellor</label>

            <select
              style={input}
              value={counsellor}
              onChange={(e) => setCounsellor(e.target.value)}
            >
              <option value="">Select Counsellor</option>
              <option>Dr. Sharma</option>
              <option>Mrs. Kavitha</option>
              <option>Mr. Rakesh</option>
            </select>

            <label>Meeting Date</label>

            <input
              type="date"
              style={input}
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />

            <label>Priority</label>

            <select
              style={input}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label>Notes</label>

            <textarea
              rows={4}
              style={input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  alert("Counsellor Assigned Successfully");

                  setCounsellor("");
                  setMeetingDate("");
                  setPriority("High");
                  setNotes("");
                  setSelectedStudent(null);

                  setShowModal(false);
                }}
                style={assignBtn}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <MainLayout>
        <h1
          style={{
            fontSize: 42,
            marginBottom: 30,
          }}
        >
          Counselling Management
        </h1>

        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 30,
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h2>High Risk Students</h2>

          <table
            style={{
              width: "100%",
              marginTop: 25,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={th}>Student</th>
                <th style={th}>District</th>
                <th style={th}>Attendance</th>
                <th style={th}>Risk</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {highRiskStudents.map((student) => (
                <tr key={student.id}>
                  <td style={td}>{student.name}</td>
                  <td style={td}>{student.district}</td>
                  <td style={td}>{student.attendance}%</td>

                  <td style={td}>
                    <RiskBadge risk={student.risk} />
                  </td>

                  <td style={td}>
                    <span
                      style={{
                        background: "#FEF3C7",
                        color: "#D97706",
                        padding: "8px 14px",
                        borderRadius: 20,
                        fontWeight: 600,
                      }}
                    >
                      Pending
                    </span>
                  </td>

                  <td style={td}>
                    <button
                      style={assignBtn}
                      onClick={() => {
                        setSelectedStudent(student);

                        // Reset the form every time the modal opens
                        setCounsellor("");
                        setMeetingDate("");
                        setPriority("High");
                        setNotes("");

                        setShowModal(true);
                      }}
                    >
                      Assign Counsellor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {highRiskStudents.length === 0 && (
            <div
              style={{
                marginTop: 40,
                textAlign: "center",
                color: "#64748B",
              }}
            >
              🎉 No High Risk Students
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}

const th = {
  textAlign: "left",
  padding: 18,
  borderBottom: "1px solid #E2E8F0",
};

const td = {
  padding: 18,
  borderBottom: "1px solid #F1F5F9",
};

const assignBtn = {
  background: "#2563EB",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: 12,
  marginTop: 8,
  marginBottom: 18,
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  boxSizing: "border-box",
};

export default Counselling;
