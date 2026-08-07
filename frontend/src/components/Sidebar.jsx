import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserGraduate,
  FaRobot,
  FaChartBar,
  FaComments,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
  { name: "Students", path: "/students", icon: <FaUserGraduate /> },
  { name: "AI Prediction", path: "/prediction", icon: <FaRobot /> },
  { name: "Analytics", path: "/analytics", icon: <FaChartBar /> },
  { name: "Counselling", path: "/counselling", icon: <FaComments /> },
  { name: "Reports", path: "/reports", icon: <FaFileAlt /> },
];

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

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

      <hr
        style={{
          margin: "25px 0",
          borderColor: "#334155",
        }}
      />

      <button
        onClick={logout}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "14px",
          border: "none",
          borderRadius: "10px",
          background: "#DC2626",
          color: "white",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
        }}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
