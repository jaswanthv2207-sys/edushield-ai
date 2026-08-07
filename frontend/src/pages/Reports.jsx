import { useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import useStudents from "../hooks/useStudents";
import RiskBadge from "../components/RiskBadge";

function Reports() {
  const { students } = useStudents();

  const [district, setDistrict] = useState("All");
  const [risk, setRisk] = useState("All");
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const districtMatch = district === "All" || student.district === district;

      const riskMatch =
        risk === "All" ||
        (risk === "High" && student.risk >= 80) ||
        (risk === "Medium" && student.risk >= 50 && student.risk < 80) ||
        (risk === "Low" && student.risk < 50);

      const searchMatch = student.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return districtMatch && riskMatch && searchMatch;
    });
  }, [students, district, risk, search]);

  const highRisk = filteredStudents.filter((s) => s.risk >= 80).length;

  const mediumRisk = filteredStudents.filter(
    (s) => s.risk >= 50 && s.risk < 80,
  ).length;

  const lowRisk = filteredStudents.filter((s) => s.risk < 50).length;

  const averageAttendance =
    filteredStudents.length > 0
      ? (
          filteredStudents.reduce((sum, s) => sum + Number(s.attendance), 0) /
          filteredStudents.length
        ).toFixed(1)
      : 0;

  const generateReport = () => {
    alert("Report Generated Successfully");
  };

  const exportCSV = () => {
    const headers = ["Name", "District", "Attendance", "CGPA", "Risk"];

    const rows = filteredStudents.map((s) => [
      s.name,
      s.district,
      s.attendance,
      s.cgpa,
      s.risk,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "EduShield_Report.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <h1
        style={{
          fontSize: 42,
          marginBottom: 30,
        }}
      >
        Reports
      </h1>

      {/* Statistics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <StatCard
          title="Students"
          value={filteredStudents.length}
          color="#2563EB"
        />

        <StatCard title="High Risk" value={highRisk} color="#DC2626" />

        <StatCard title="Medium Risk" value={mediumRisk} color="#D97706" />

        <StatCard
          title="Avg Attendance"
          value={`${averageAttendance}%`}
          color="#16A34A"
        />
      </div>

      {/* Filters */}

      <div style={card}>
        <div
          style={{
            display: "flex",
            gap: 15,
            flexWrap: "wrap",
            marginBottom: 25,
          }}
        >
          <input
            placeholder="Search Student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={input}
          />

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={input}
          >
            <option>All</option>
            <option>Jaipur</option>
            <option>Kota</option>
            <option>Ajmer</option>
            <option>Jodhpur</option>
            <option>Udaipur</option>
          </select>

          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            style={input}
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button style={primaryBtn} onClick={generateReport}>
            Generate Report
          </button>

          <button style={greenBtn} onClick={exportCSV}>
            Export CSV
          </button>

          <button style={printBtn} onClick={() => window.print()}>
            Print
          </button>
        </div>
        <div
          style={{
            overflowX: "auto",
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
                <th style={th}>Student Name</th>
                <th style={th}>District</th>
                <th style={th}>Attendance</th>
                <th style={th}>CGPA</th>
                <th style={th}>Risk Score</th>
                <th style={th}>Risk Level</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student.id}
                  style={{
                    background: index % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                  }}
                >
                  <td style={td}>{student.name}</td>

                  <td style={td}>{student.district}</td>

                  <td style={td}>{student.attendance}%</td>

                  <td style={td}>{student.cgpa}</td>

                  <td
                    style={{
                      ...td,
                      fontWeight: 700,
                    }}
                  >
                    {student.risk}%
                  </td>

                  <td style={td}>
                    <RiskBadge risk={student.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#64748B",
              }}
            >
              <h2>No Records Found</h2>

              <p>Try changing the filters to view student reports.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}

      <div
        style={{
          marginTop: 25,
          color: "#64748B",
          fontSize: 14,
          textAlign: "center",
        }}
      >
        EduShield AI • Government of Rajasthan • Smart India Hackathon 2026
      </div>
    </MainLayout>
  );
}
function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 25,
        boxShadow: "0 5px 15px rgba(0,0,0,.08)",
      }}
    >
      <h3
        style={{
          color: "#64748B",
          marginBottom: 12,
          fontSize: 15,
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          color,
          fontSize: 38,
          margin: 0,
        }}
      >
        {value}
      </h1>
    </div>
  );
}

const card = {
  background: "#FFFFFF",
  borderRadius: 20,
  padding: 25,
  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
};

const input = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  minWidth: 170,
};

const primaryBtn = {
  background: "#2563EB",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  cursor: "pointer",
};

const greenBtn = {
  background: "#16A34A",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  cursor: "pointer",
};

const printBtn = {
  background: "#334155",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  cursor: "pointer",
};

const th = {
  textAlign: "left",
  padding: 18,
  borderBottom: "2px solid #E2E8F0",
};

const td = {
  padding: 18,
  borderBottom: "1px solid #F1F5F9",
};

export default Reports;
