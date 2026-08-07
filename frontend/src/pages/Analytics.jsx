import MainLayout from "../layouts/MainLayout";
import useStudents from "../hooks/useStudents";

import DataTable from "react-data-table-component";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

function Analytics() {
  const { students } = useStudents();

  const totalStudents = students.length;

  const highRisk = students.filter((s) => Number(s.Final_Grade) < 10).length;

  const mediumRisk = students.filter(
    (s) => Number(s.Final_Grade) >= 10 && Number(s.Final_Grade) < 15,
  ).length;

  const lowRisk = students.filter((s) => Number(s.Final_Grade) >= 15).length;

  const pieData = [
    {
      name: "High",
      value: highRisk,
    },
    {
      name: "Medium",
      value: mediumRisk,
    },
    {
      name: "Low",
      value: lowRisk,
    },
  ];

  const COLORS = ["#DC2626", "#F59E0B", "#16A34A"];

  const schoolData = Object.values(
    students.reduce((acc, student) => {
      if (!acc[student.School]) {
        acc[student.School] = {
          school: student.School,

          students: 0,
        };
      }

      acc[student.School].students++;

      return acc;
    }, {}),
  );

  const attendanceData = students

    .slice(0, 20)

    .map((student) => ({
      name: student.Student_ID,

      attendance: 100 - student.Number_of_Absences * 5,
    }));

  const gradeData = [
    {
      grade: "15-20",
      value: students.filter((s) => s.Final_Grade >= 15).length,
    },

    {
      grade: "10-15",
      value: students.filter((s) => s.Final_Grade >= 10 && s.Final_Grade < 15)
        .length,
    },

    {
      grade: "0-10",
      value: students.filter((s) => s.Final_Grade < 10).length,
    },
  ];

  const tableColumns = [
    {
      name: "Student",
      selector: (row) => row.Student_ID,
    },

    {
      name: "School",
      selector: (row) => row.School,
    },

    {
      name: "Grade",
      selector: (row) => row.Final_Grade,
    },

    {
      name: "Risk",
      cell: (row) => {
        const grade = Number(row.Final_Grade);

        let color = "#16A34A";
        let label = "Low";

        if (grade < 10) {
          color = "#DC2626";
          label = "High";
        } else if (grade < 15) {
          color = "#F59E0B";
          label = "Medium";
        }

        return (
          <span
            style={{
              background: color + "22",
              color,
              padding: "6px 14px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        );
      },
    },
  ];

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
            marginBottom: 8,
            fontWeight: 700,
            color: "#0F172A",
          }}
        >
          📊 Analytics Dashboard
        </h1>

        <p
          style={{
            color: "#64748B",
            fontSize: 18,
            margin: 0,
          }}
        >
          AI-powered insights for monitoring student performance and dropout
          risk.
        </p>
      </div>

      {/* Summary Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 30,
          marginBottom: 40,
        }}
      >
        <Card
          icon="👨‍🎓"
          title="Total Students"
          value={totalStudents}
          color="#2563EB"
        />

        <Card icon="🚨" title="High Risk" value={highRisk} color="#DC2626" />

        <Card
          icon="⚠️"
          title="Medium Risk"
          value={mediumRisk}
          color="#F59E0B"
        />

        <Card icon="✅" title="Low Risk" value={lowRisk} color="#16A34A" />
      </div>

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: 25,
        }}
      >
        <div style={chartCard}>
          <h2
            style={{
              marginBottom: 25,
            }}
          >
            🎯 Dropout Risk Distribution
          </h2>

          <ResponsiveContainer width="100%" height={330}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={75}
                outerRadius={120}
                paddingAngle={4}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCard}>
          <h2>Risk by School</h2>

          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={schoolData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="school" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          ...chartCard,

          marginTop: 30,
        }}
      >
        <h2>Attendance vs Dropout</h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#16A34A"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: 25,

          marginTop: 30,
        }}
      >
        <div style={chartCard}>
          <h2>Grade Distribution</h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={gradeData}
                dataKey="value"
                innerRadius={55}
                outerRadius={95}
                label
              >
                {gradeData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCard}>
          <h2>AI Model Accuracy</h2>

          <div
            style={{
              display: "flex",

              justifyContent: "center",

              alignItems: "center",

              height: 250,

              fontSize: 72,

              fontWeight: "700",

              color: "#2563EB",
            }}
          >
            95%
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 35,
        }}
      >
        <h2>Recent AI Predictions</h2>

        <DataTable
          columns={tableColumns}
          data={students.slice(0, 10)}
          pagination
          highlightOnHover
          striped
        />
      </div>
    </MainLayout>
  );
}

function Card({ icon, title, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: 28,
        boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        border: "1px solid #E2E8F0",
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
          fontSize: 42,
          fontWeight: 700,
          color,
          marginTop: 12,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const chartCard = {
  background: "#FFFFFF",
  borderRadius: 24,
  padding: 30,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
  border: "1px solid #E2E8F0",
};

export default Analytics;
