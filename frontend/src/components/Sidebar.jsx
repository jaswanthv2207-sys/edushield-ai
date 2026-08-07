import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaUserGraduate,
  FaRobot,
  FaChartBar,
  FaComments,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaShieldAlt,
} from "react-icons/fa";

const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaHome />,
  },
  {
    name: "Students",
    path: "/students",
    icon: <FaUserGraduate />,
  },
  {
    name: "AI Prediction",
    path: "/prediction",
    icon: <FaRobot />,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <FaChartBar />,
  },
  {
    name: "Counselling",
    path: "/counselling",
    icon: <FaComments />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FaFileAlt />,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar") === "collapsed";
  });

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };
  <div
    style={{
      textAlign: "right",
    }}
  >
    <div
      style={{
        fontWeight: 600,
        fontSize: 18,
      }}
    >
      {dateTime.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </div>
  </div>;

  return (
    <div
      style={{
        width: collapsed ? 85 : 290,
        transition: "0.3s",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        padding: "20px",
        boxSizing: "border-box",
        background: "linear-gradient(180deg,#0B1F45 0%,#102A5C 100%)",
        color: "white",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          marginBottom: 35,
        }}
      >
        {!collapsed && (
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              🛡 EduShield AI
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#94A3B8",
              }}
            >
              Government of Rajasthan
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            border: "none",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            fontSize: 22,
          }}
        >
          <FaBars />
        </button>
      </div>

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
            boxShadow: isActive ? "0 10px 25px rgba(37,99,235,.35)" : "none",
            transform: isActive ? "translateX(4px)" : "translateX(0)",
            transition: ".25s",
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.classList.contains("active")) {
              e.currentTarget.style.background = "#1E3A8A";
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.classList.contains("active")) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          {item.icon}

          {!collapsed && (
            <span
              style={{
                transition: "0.3s",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </span>
          )}
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

        {!collapsed && "Logout"}
      </button>
    </div>
  );
}

export default Sidebar;
