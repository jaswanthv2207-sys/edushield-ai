import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { calculateRisk } from "../services/studentService";

import RiskBadge from "../components/RiskBadge";
import MainLayout from "../layouts/MainLayout";
import useStudents from "../hooks/useStudents";

function Students() {
  const navigate = useNavigate();

  const { students, setStudents } = useStudents();

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    attendance: "",
    cgpa: "",
    district: "",
  });

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addStudent = () => {
    if (
      !newStudent.name ||
      !newStudent.attendance ||
      !newStudent.cgpa ||
      !newStudent.district
    ) {
      alert("Please fill all fields.");
      return;
    }

    setStudents([
      ...students,
      {
        id: Date.now(),
        ...newStudent,
        attendance: Number(newStudent.attendance),
        cgpa: Number(newStudent.cgpa),
        risk: calculateRisk(
          Number(newStudent.attendance),
          Number(newStudent.cgpa),
        ),
      },
    ]);

    setNewStudent({
      name: "",
      attendance: "",
      cgpa: "",
      district: "",
    });

    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: 450,
              background: "white",
              borderRadius: 15,
              padding: 30,
            }}
          >
            <h2>Add Student</h2>

            <input
              placeholder="Student Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  name: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Attendance"
              value={newStudent.attendance}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  attendance: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="CGPA"
              value={newStudent.cgpa}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  cgpa: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="District"
              value={newStudent.district}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  district: e.target.value,
                })
              }
              style={inputStyle}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 25,
              }}
            >
              <button onClick={() => setShowModal(false)} style={cancelBtn}>
                Cancel
              </button>

              <button onClick={addStudent} style={saveBtn}>
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
          Students
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 25,
          }}
        >
          <input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 350,
              padding: 14,
              borderRadius: 10,
              border: "1px solid #CBD5E1",
            }}
          />

          <button style={saveBtn} onClick={() => setShowModal(true)}>
            + Add Student
          </button>
          <button
            onClick={() => {
              if (window.confirm("Clear all students?")) {
                localStorage.removeItem("students");
                window.location.reload();
              }
            }}
            style={{
              background: "#DC2626",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Reset
          </button>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#F8FAFC",
                }}
              >
                <th style={th}>Name</th>
                <th style={th}>Attendance</th>
                <th style={th}>CGPA</th>
                <th style={th}>District</th>
                <th style={th}>Risk</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => {
                return (
                  <tr
                    key={student.id}
                    style={{
                      background: index % 2 === 0 ? "white" : "#F8FAFC",
                    }}
                  >
                    <td style={td}>{student.name}</td>
                    <td style={td}>{student.attendance}%</td>
                    <td style={td}>{student.cgpa}</td>
                    <td style={td}>{student.district}</td>

                    <td style={td}>
                      <RiskBadge risk={student.risk} />
                    </td>

                    <td style={td}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <button
                          style={predictBtn}
                          onClick={() =>
                            navigate("/prediction", {
                              state: student,
                            })
                          }
                        >
                          Predict
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm("Delete this student?")) {
                              setStudents(
                                students.filter((s) => s.id !== student.id),
                              );
                            }
                          }}
                          style={{
                            background: "#DC2626",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </MainLayout>
    </>
  );
}

const th = {
  padding: 18,
  textAlign: "left",
};

const td = {
  padding: 18,
};

const inputStyle = {
  width: "100%",
  padding: 12,
  marginTop: 15,
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  boxSizing: "border-box",
};

const saveBtn = {
  background: "#2563EB",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: 10,
  cursor: "pointer",
};

const cancelBtn = {
  padding: "12px 22px",
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  cursor: "pointer",
};

const predictBtn = {
  background: "#2563EB",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
};

export default Students;
