import DataTable from "react-data-table-component";
import { useMemo, useState } from "react";
import {
  FaSearch,
  FaRobot,
  FaEye,
  FaFileDownload,
  FaUsers,
  FaExclamationTriangle,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import RiskBadge from "../components/RiskBadge";
import MainLayout from "../layouts/MainLayout";
import useStudents from "../hooks/useStudents";

function Students() {
  const { students, loading, error, refreshStudents } = useStudents();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      return (
        student.Name.toLowerCase().includes(search.toLowerCase()) ||
        student.Student_ID.toLowerCase().includes(search.toLowerCase()) ||
        student.School.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [students, search]);

  const totalStudents = students.length;

  const exportCSV = () => {
    const csv = [
      ["Student ID", "Name", "School", "Grade", "Absences"],
      ...filteredStudents.map((s) => [
        s.Student_ID,
        s.Name,
        s.School,
        s.Final_Grade,
        s.Number_of_Absences,
      ]),
    ];

    const blob = new Blob([csv.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "students.csv";

    a.click();
  };

  const columns = [
    {
      name: "Student ID",
      selector: (row) => row.Student_ID,
      sortable: true,
      width: "140px",
    },

    {
      name: "Name",
      selector: (row) => row.Name,
      sortable: true,
    },

    {
      name: "School",
      selector: (row) => row.School,
      sortable: true,
    },

    {
      name: "Grade",
      selector: (row) => row.Final_Grade,
      sortable: true,
    },

    {
      name: "Absences",
      selector: (row) => row.Number_of_Absences,
      sortable: true,
    },

    {
      name: "Risk",
      cell: (row) => {
        let risk = "Low";

        if (row.Number_of_Absences >= 12 || row.Final_Grade < 10) {
          risk = "High";
        } else if (row.Number_of_Absences >= 6 || row.Final_Grade < 13) {
          risk = "Medium";
        }

        return <RiskBadge risk={risk} />;
      },
      sortable: true,
    },

    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            title="Predict Dropout Risk"
            style={iconButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2563EB";
            }}
            onClick={() =>
              navigate("/prediction", {
                state: row,
              })
            }
          >
            <FaRobot />
          </button>

          <button
            title="View Student"
            style={iconButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2563EB";
            }}
            onClick={() => setSelectedStudent(row)}
          >
            <FaEye />
          </button>
        </div>
      ),
    },
  ];

  const [showModal, setShowModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [newStudent, setNewStudent] = useState({
    name: "",
    attendance: "",
    cgpa: "",
    district: "",
  });

  if (loading) {
    return <h2 style={{ padding: 30 }}>Loading students...</h2>;
  }

  if (error) {
    return <h2 style={{ padding: 30 }}>Error: {error}</h2>;
  }

  console.log(students);

  const highRisk = students.filter(
    (s) => s.Number_of_Absences >= 12 || s.Final_Grade < 10,
  ).length;

  const mediumRisk = students.filter(
    (s) =>
      (s.Number_of_Absences >= 6 && s.Number_of_Absences < 12) ||
      (s.Final_Grade >= 10 && s.Final_Grade < 13),
  ).length;

  const lowRisk = students.length - highRisk - mediumRisk;

  const addStudent = () => {
    alert("Backend integration coming next.");
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

      {selectedStudent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: 600,
              background: "white",
              borderRadius: 18,
              padding: 30,
              boxShadow: "0 20px 50px rgba(0,0,0,.25)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Student Profile</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 15,
                marginTop: 20,
              }}
            >
              <Info label="Student ID" value={selectedStudent.Student_ID} />
              <Info label="Name" value={selectedStudent.Name} />
              <Info label="School" value={selectedStudent.School} />
              <Info label="Gender" value={selectedStudent.Gender} />
              <Info label="Grade" value={selectedStudent.Final_Grade} />
              <Info
                label="Absences"
                value={selectedStudent.Number_of_Absences}
              />
              <Info
                label="Attendance"
                value={selectedStudent.Attendance_Rate}
              />
              <Info
                label="Family Income"
                value={selectedStudent.Family_Income}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 25,
              }}
            >
              <button onClick={() => setSelectedStudent(null)} style={saveBtn}>
                Close
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
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <StudentCard
            title="Total Students"
            value={totalStudents}
            color="#2563EB"
            icon={<FaUsers />}
          />

          <StudentCard
            title="High Risk"
            value={highRisk}
            color="#DC2626"
            icon={<FaExclamationTriangle />}
          />

          <StudentCard
            title="Medium Risk"
            value={mediumRisk}
            color="#F59E0B"
            icon={<FaChartLine />}
          />

          <StudentCard
            title="Low Risk"
            value={lowRisk}
            color="#16A34A"
            icon={<FaCheckCircle />}
          />
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#F8FAFC",
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
              }}
            >
              <FaSearch />

              <input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
              }}
            >
              <button onClick={() => setShowModal(true)} style={saveBtn}>
                + Add Student
              </button>

              <button
                style={{
                  background: "#E2E8F0",
                  color: "#334155",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>

              <button
                onClick={exportCSV}
                style={{
                  background: "#2563EB",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <FaFileDownload /> Export CSV
              </button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredStudents}
            pagination
            highlightOnHover
            striped
            responsive
            persistTableHead
          />
        </div>
      </MainLayout>
    </>
  );
}

function StudentCard({ title, value, color, icon }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 5px 15px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          fontSize: 28,
          color,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#64748B",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <h2
        style={{
          margin: 0,
          color,
          fontSize: 34,
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        padding: 15,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          color: "#64748B",
          fontSize: 13,
          marginBottom: 5,
        }}
      >
        {label}
      </div>

      <b>{value || "-"}</b>
    </div>
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

const iconButton = {
  width: 40,
  height: 40,
  borderRadius: 10,
  border: "none",
  background: "#2563EB",
  color: "white",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 16,
  transition: "0.25s",
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
