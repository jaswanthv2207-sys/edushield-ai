import MainLayout from "../layouts/MainLayout";
import useStudents from "../hooks/useStudents";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Analytics() {
  const { students } = useStudents();

  const highRisk = students.filter((s) => s.risk >= 80).length;
  const mediumRisk = students.filter((s) => s.risk >= 50 && s.risk < 80).length;
  const lowRisk = students.filter((s) => s.risk < 50).length;

  const pieData = [
    { name: "High", value: highRisk },
    { name: "Medium", value: mediumRisk },
    { name: "Low", value: lowRisk },
  ];

  const COLORS = ["#DC2626", "#F59E0B", "#16A34A"];

  const districtData = Object.values(
    students.reduce((acc, student) => {
      if (!acc[student.district]) {
        acc[student.district] = {
          district: student.district,
          students: 0,
        };
      }

      acc[student.district].students++;

      return acc;
    }, {}),
  );

  const attendanceData = students.map((student) => ({
    name: student.name.split(" ")[0],
    attendance: student.attendance,
  }));

  return (
    <MainLayout>
      <h1
        style={{
          fontSize: 42,
          marginBottom: 35,
        }}
      >
        Analytics Dashboard
      </h1>

      {/* Summary Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
          marginBottom: 35,
        }}
      >
        <Card title="Total Students" value={students.length} />

        <Card title="High Risk" value={highRisk} color="#DC2626" />

        <Card title="Medium Risk" value={mediumRisk} color="#D97706" />

        <Card title="Low Risk" value={lowRisk} color="#16A34A" />
      </div>

      {/* Charts */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 25,
        }}
      >
        {/* Pie */}

        <div style={chartCard}>
          <h2>Risk Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={110}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* District */}

        <div style={chartCard}>
          <h2>Students by District</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="district" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="students" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance */}

      <div
        style={{
          ...chartCard,
          marginTop: 30,
        }}
      >
        <h2>Attendance Distribution</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="attendance" fill="#16A34A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </MainLayout>
  );
}

function Card({ title, value, color = "#111827" }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 25,
        boxShadow: "0 5px 15px rgba(0,0,0,.08)",
      }}
    >
      <h3
        style={{
          color: "#64748B",
          marginBottom: 15,
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          fontSize: 42,
          color,
        }}
      >
        {value}
      </h1>
    </div>
  );
}

const chartCard = {
  background: "white",
  borderRadius: 20,
  padding: 25,
  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
};

export default Analytics;
