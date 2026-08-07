import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUserGraduate,
  FaRobot,
  FaChartBar,
  FaComments,
  FaFileAlt,
} from "react-icons/fa";

const menu = [
  { name: "Dashboard", path: "/", icon: <FaHome /> },
  { name: "Students", path: "/students", icon: <FaUserGraduate /> },
  { name: "AI Prediction", path: "/prediction", icon: <FaRobot /> },
  { name: "Analytics", path: "/analytics", icon: <FaChartBar /> },
  { name: "Counselling", path: "/counselling", icon: <FaComments /> },
  { name: "Reports", path: "/reports", icon: <FaFileAlt /> },
];

function Sidebar() {
  return (
    <div
      style={{
        width: 290,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "#0F172A",
        color: "white",
        overflowY: "auto",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>EduShield AI</h2>

      {menu.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "white",
            textDecoration: "none",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "10px",
            background: isActive ? "#2563EB" : "transparent",
          })}
        >
          {item.icon}
          {item.name}
        </NavLink>
      ))}
    </div>
  );
}

export default Sidebar;
