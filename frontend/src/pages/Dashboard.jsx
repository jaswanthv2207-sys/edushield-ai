import CountUp from "react-countup";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDistrictAnalytics } from "../services/analyticsService";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FaUsers,
  FaUserGraduate,
  FaMoneyBillWave,
  FaTriangleExclamation,
} from "react-icons/fa6";

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDistrictAnalytics();
        console.log(data);
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <h2>Loading Dashboard...</h2>
      </MainLayout>
    );
  }

  const summary = analytics.summary;

  const schoolData = analytics.school_metrics;

  const pieData = [
    {
      name: "Historical Dropouts",
      value: summary.historical_dropouts,
    },
    {
      name: "Fee Defaulters",
      value: summary.students_with_unpaid_fees,
    },
    {
      name: "Chronically Absent",
      value: summary.students_chronically_absent,
    },
  ];

  const COLORS = ["#2563EB", "#F59E0B", "#DC2626"];

  return (
    <MainLayout>
      <h1
        style={{
          marginBottom: 30,
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        Government Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
        }}
      >
        <Card
          title="Students"
          value={summary.total_students_monitored}
          color="#2563EB"
          icon={<FaUsers />}
        />

        <Card
          title="Historical Dropouts"
          value={summary.historical_dropouts}
          color="#DC2626"
          icon={<FaUserGraduate />}
        />

        <Card
          title="Unpaid Fees"
          value={summary.students_with_unpaid_fees}
          color="#F59E0B"
          icon={<FaMoneyBillWave />}
        />

        <Card
          title="Chronic Absences"
          value={summary.students_chronically_absent}
          color="#8B5CF6"
          icon={<FaTriangleExclamation />}
        />
      </div>

      <h2 style={{ marginTop: 45 }}>School Analytics</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: 25,
          marginTop: 20,
        }}
      >
        <div style={card}>
          <h3>Students per School</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={schoolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="School" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_students" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3>Dropout Indicators</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={110} label>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 25,
          marginTop: 25,
        }}
      >
        <div style={card}>
          <h3>Average Final Grade</h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={schoolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="School" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_final_grade" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3>Average Absences</h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={schoolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="School" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_absences" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 25,
          marginTop: 25,
        }}
      >
        <div style={card}>
          <h3>🏆 Government Insights</h3>

          <ul
            style={{
              lineHeight: 2,
              paddingLeft: 20,
            }}
          >
            <li>
              Total Students Monitored:
              <b> {summary.total_students_monitored}</b>
            </li>

            <li>
              Historical Dropouts:
              <b> {summary.historical_dropouts}</b>
            </li>

            <li>
              Students with Unpaid Fees:
              <b> {summary.students_with_unpaid_fees}</b>
            </li>

            <li>
              Chronically Absent Students:
              <b> {summary.students_chronically_absent}</b>
            </li>
          </ul>
        </div>

        <div style={card}>
          <h3>🚨 Recommended Government Actions</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <ActionCard
              color="#DC2626"
              text="Identify students with chronic absenteeism."
            />

            <ActionCard
              color="#F59E0B"
              text="Counsel families with unpaid fees."
            />

            <ActionCard
              color="#2563EB"
              text="Increase monitoring in vulnerable schools."
            />

            <ActionCard
              color="#16A34A"
              text="Reward schools with strong academic performance."
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Card({ title, value, color, icon }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#ffffff,#f8fafc)",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 10px 30px rgba(37,99,235,.08)",
        border: "1px solid #E2E8F0",
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: 30,
          color,
          marginBottom: 18,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <p
        style={{
          color: "#64748B",
          margin: 0,
          marginBottom: 15,
        }}
      >
        {title}
      </p>

      {/* Value */}
      <h1
        style={{
          color,
          margin: 0,
          fontSize: 42,
        }}
      >
        {value}
      </h1>
    </div>
  );
}

function ActionCard({ color, text }) {
  return (
    <div
      style={{
        borderLeft: `6px solid ${color}`,
        background: "#F8FAFC",
        padding: 15,
        borderRadius: 10,
      }}
    >
      {text}
    </div>
  );
}

const card = {
  background: "#FFFFFF",
  borderRadius: 18,
  padding: 25,
  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
};

const th = {
  padding: 18,
  textAlign: "left",
  background: "#2563EB",
  color: "white",
};

const td = {
  padding: 18,
  borderBottom: "1px solid #E2E8F0",
};

export default Dashboard;
