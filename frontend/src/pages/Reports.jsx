import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
      const districtMatch = district === "All" || student.School === district;

      const grade = Number(student.Final_Grade);

      const riskMatch =
        risk === "All" ||
        (risk === "High" && grade < 10) ||
        (risk === "Medium" && grade >= 10 && grade < 15) ||
        (risk === "Low" && grade >= 15);

      const searchMatch = student.Student_ID.toLowerCase().includes(
        search.toLowerCase(),
      );

      return districtMatch && riskMatch && searchMatch;
    });
  }, [students, district, risk, search]);

  const highRisk = filteredStudents.filter(
    (s) => Number(s.Final_Grade) < 10,
  ).length;

  const mediumRisk = filteredStudents.filter(
    (s) => Number(s.Final_Grade) >= 10 && Number(s.Final_Grade) < 15,
  ).length;

  const lowRisk = filteredStudents.filter(
    (s) => Number(s.Final_Grade) >= 15,
  ).length;

  const averageAttendance =
    filteredStudents.length > 0
      ? (
          filteredStudents.reduce(
            (sum, s) => sum + (100 - Number(s.Number_of_Absences) * 5),
            0,
          ) / filteredStudents.length
        ).toFixed(1)
      : 0;

  const generateReport = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text("Government of Rajasthan", 20, 20);

    doc.setFontSize(16);
    doc.text("EduShield AI", 20, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text("AI-based Dropout Prediction & Counselling System", 20, 42);

    doc.line(20, 46, 190, 46);

    doc.setFontSize(14);

    doc.text("AI Report Summary", 20, 60);

    doc.setFontSize(11);

    doc.text(`Total Students : ${filteredStudents.length}`, 20, 72);

    doc.text(`High Risk Students : ${highRisk}`, 20, 82);

    doc.text(`Medium Risk Students : ${mediumRisk}`, 20, 92);

    doc.text(`Low Risk Students : ${lowRisk}`, 20, 102);

    doc.text(`Average Attendance : ${averageAttendance}%`, 20, 112);

    doc.text("AI Model Accuracy : 95%", 20, 122);

    doc.setFont("helvetica", "bold");

    doc.text("AI Recommendations", 20, 140);

    doc.setFont("helvetica", "normal");

    doc.text("• Weekly attendance monitoring", 25, 150);

    doc.text("• Counselling for high-risk students", 25, 160);

    doc.text("• Parent awareness meetings", 25, 170);

    doc.text("• Financial aid review", 25, 180);

    doc.text("• Academic remedial classes", 25, 190);

    autoTable(doc, {
      startY: 205,

      head: [["Student ID", "School", "Grade", "Attendance", "Risk"]],

      body: filteredStudents.slice(0, 15).map((student) => {
        const grade = Number(student.Final_Grade);

        const attendance = 100 - Number(student.Number_of_Absences) * 5;

        let risk = "Low";

        if (grade < 10) risk = "High";
        else if (grade < 15) risk = "Medium";

        return [
          student.Student_ID,
          student.School,
          grade,
          attendance + "%",
          risk,
        ];
      }),
    });

    doc.save("EduShield_AI_Report.pdf");
  };
  const exportCSV = () => {
    const headers = [
      "Student ID",
      "School",
      "Attendance",
      "Final Grade",
      "Risk",
    ];

    const rows = filteredStudents.map((student) => {
      const grade = Number(student.Final_Grade);

      const attendance = 100 - Number(student.Number_of_Absences) * 5;

      let risk = "Low";

      if (grade < 10) risk = "High";
      else if (grade < 15) risk = "Medium";

      return [student.Student_ID, student.School, attendance, grade, risk];
    });

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
      <div
        style={{
          marginBottom: 35,
        }}
      >
        <h1
          style={{
            fontSize: 42,
            fontWeight: 700,
            marginBottom: 8,
            color: "#0F172A",
          }}
        >
          📄 Reports Dashboard
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#64748B",
            margin: 0,
          }}
        >
          Generate AI-powered reports for students, schools and districts.
        </p>
      </div>

      {/* Summary Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 25,
          marginBottom: 35,
        }}
      >
        <ReportCard
          icon="📄"
          title="Total Reports"
          value="254"
          color="#2563EB"
        />

        <ReportCard
          icon="📅"
          title="Generated Today"
          value="12"
          color="#16A34A"
        />

        <ReportCard icon="⏳" title="Pending" value="4" color="#F59E0B" />

        <ReportCard icon="✅" title="Completed" value="238" color="#10B981" />
      </div>
      {/* Filters */}

      <div style={card}>
        <h2 style={{ marginBottom: 25 }}>Report Filters</h2>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            style={input}
            placeholder="Search Student ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            style={input}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="All">All Schools</option>
            <option value="School_A">School A</option>
            <option value="School_B">School B</option>
          </select>

          <select
            style={input}
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
          >
            <option value="All">All Risk</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
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
      </div>
      {/* Report Statistics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 25,
          marginTop: 35,
          marginBottom: 35,
        }}
      >
        <StatCard title="High Risk Students" value={highRisk} color="#DC2626" />

        <StatCard
          title="Medium Risk Students"
          value={mediumRisk}
          color="#F59E0B"
        />

        <StatCard title="Low Risk Students" value={lowRisk} color="#16A34A" />

        <StatCard
          title="Average Attendance"
          value={`${averageAttendance}%`}
          color="#2563EB"
        />
      </div>
      <div style={card}>
        <h2 style={{ marginBottom: 25 }}>Student Report</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={th}>Student ID</th>
              <th style={th}>School</th>
              <th style={th}>Grade</th>
              <th style={th}>Attendance</th>
              <th style={th}>Risk</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.slice(0, 15).map((student) => {
              const grade = Number(student.Final_Grade);

              const attendance = 100 - Number(student.Number_of_Absences) * 5;

              let risk = "Low";

              if (grade < 10) risk = "High";
              else if (grade < 15) risk = "Medium";

              return (
                <tr key={student.Student_ID}>
                  <td style={td}>{student.Student_ID}</td>

                  <td style={td}>{student.School}</td>

                  <td style={td}>{grade}</td>

                  <td style={td}>{attendance}%</td>

                  <td style={td}>
                    <RiskBadge risk={risk} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 25,
          marginTop: 35,
        }}
      >
        {/* AI Summary */}

        <div style={card}>
          <h2 style={{ marginBottom: 20 }}>📊 AI Report Summary</h2>

          <div
            style={{
              lineHeight: 2,
              fontSize: 16,
            }}
          >
            <p>
              <strong>Total Students Analyzed:</strong>{" "}
              {filteredStudents.length}
            </p>

            <p>
              <strong>High Risk Students:</strong> {highRisk}
            </p>

            <p>
              <strong>Medium Risk Students:</strong> {mediumRisk}
            </p>

            <p>
              <strong>Low Risk Students:</strong> {lowRisk}
            </p>

            <p>
              <strong>Average Attendance:</strong> {averageAttendance}%
            </p>

            <p>
              <strong>AI Model Accuracy:</strong> 95%
            </p>
          </div>
        </div>

        {/* Download Panel */}

        <div style={card}>
          <h2 style={{ marginBottom: 25 }}>📥 Export Reports</h2>

          <button
            style={{
              ...primaryBtn,
              width: "100%",
              marginBottom: 15,
            }}
            onClick={exportCSV}
          >
            Download CSV
          </button>

          <button
            style={{
              ...greenBtn,
              width: "100%",
              marginBottom: 15,
            }}
            onClick={() => window.print()}
          >
            Print Report
          </button>

          <button
            style={{
              ...printBtn,
              width: "100%",
            }}
            onClick={generateReport}
          >
            Generate AI Report
          </button>
        </div>
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

function ReportCard({ icon, title, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        padding: 28,
        border: "1px solid #E2E8F0",
        boxShadow: "0 8px 20px rgba(0,0,0,.06)",
      }}
    >
      <div
        style={{
          fontSize: 34,
          marginBottom: 18,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#64748B",
          fontSize: 15,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 42,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
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
