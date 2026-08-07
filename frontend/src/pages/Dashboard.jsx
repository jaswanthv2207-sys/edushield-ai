import MainLayout from "../layouts/MainLayout";
import RiskBadge from "../components/RiskBadge";
import useStudents from "../hooks/useStudents";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { students } = useStudents();

  const navigate = useNavigate();

  const stats = [
    {
      value: students.length,
      label: "Students",
    },
    {
      value: students.filter((s) => s.risk >= 80).length,
      label: "High Risk",
    },
    {
      value: students.filter((s) => s.risk >= 50 && s.risk < 80).length,
      label: "Medium Risk",
    },
    {
      value: students.filter((s) => s.risk < 50).length,
      label: "Low Risk",
    },
  ];

  const highRiskStudents = students
    .filter((student) => student.risk >= 80)
    .slice(0, 5);

  return (
    <MainLayout>
      <h1
        style={{
          fontSize: "46px",
          fontWeight: "700",
          color: "#0F172A",
          marginBottom: "40px",
          letterSpacing: "-1px",
        }}
      >
        Dashboard
      </h1>

      <p
        style={{
          color: "#64748B",
          marginTop: "-20px",
          marginBottom: "35px",
          fontSize: "18px",
        }}
      >
        Government of Rajasthan • AI-based Student Dropout Prediction System
      </p>

      {/* Stats Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "25px",
        }}
      >
        {stats.map((item) => (
          <div
            key={item.label}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "35px",
              minHeight: "150px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,.08)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "52px",
                fontWeight: "700",
                color: "#0F172A",
              }}
            >
              {item.value}
            </h2>

            <p
              style={{
                marginTop: "14px",
                color: "#64748B",
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "35px",
          marginBottom: "35px",
        }}
      >
        <button style={button} onClick={() => navigate("/students")}>
          ➕ Add Student
        </button>

        <button style={button} onClick={() => navigate("/prediction")}>
          🤖 Run AI Prediction
        </button>

        <button style={button} onClick={() => navigate("/analytics")}>
          📊 View Analytics
        </button>

        <button style={button} onClick={() => navigate("/reports")}>
          📄 Export Report
        </button>
      </div>

      {/* High Risk Table */}

      <div
        style={{
          marginTop: "45px",
          background: "#fff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            marginBottom: "25px",
          }}
        >
          High Risk Students
        </h2>

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
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Attendance</th>
              <th style={thStyle}>CGPA</th>
              <th style={thStyle}>Risk</th>
            </tr>
          </thead>

          <tbody>
            {highRiskStudents.map((student, index) => (
              <tr
                key={student.name}
                style={{
                  background: index % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                }}
              >
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: "600",
                  }}
                >
                  {student.name}
                </td>
                <td style={tdStyle}>{student.attendance}</td>
                <td style={tdStyle}>{student.cgpa}</td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: "700",
                    color:
                      parseInt(student.risk) > 85
                        ? "#DC2626"
                        : parseInt(student.risk) > 75
                          ? "#F59E0B"
                          : "#16A34A",
                  }}
                >
                  <RiskBadge risk={student.risk} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

const thStyle = {
  padding: "18px",
  textAlign: "left",
  background: "#F8FAFC",
  color: "#475569",
  fontWeight: "700",
  fontSize: "15px",
  borderBottom: "2px solid #E2E8F0",
};

const tdStyle = {
  padding: "18px",
  fontSize: "15px",
  color: "#334155",
  borderBottom: "1px solid #E2E8F0",
};

export default Dashboard;

const buttonStyle = {
  background: "#2563EB",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
};

const button = {
  background: "#2563EB",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "12px 22px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 15,
  marginRight: 15,
};
