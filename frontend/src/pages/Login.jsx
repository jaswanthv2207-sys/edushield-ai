import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (username === "admin" && password === "1234") {
        localStorage.setItem("isLoggedIn", "true");

        toast.success("Login Successful");

        navigate("/dashboard");
      } else {
        toast.error("Invalid Username or Password");
      }

      setLoading(false);
    }, 1200);
  };

  if (localStorage.getItem("isLoggedIn") === "true") {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div style={page}>
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={card}
      >
        <div style={header}>
          <div style={stripe}></div>

          <h1 style={title}>EduShield AI</h1>

          <p style={subtitle}>Government of Rajasthan</p>

          <p style={small}>AI-Based Student Dropout Prediction System</p>
        </div>

        <div style={field}>
          <FaUser style={icon} />

          <input
            style={input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={field}>
          <FaLock style={icon} />

          <input
            style={input}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            style={eyeButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button style={button} onClick={login} disabled={loading}>
          {loading ? "Signing In..." : "Secure Login"}
        </button>

        <div style={footer}>
          <p>🇮🇳 Smart India Hackathon 2026</p>
          <p>EduShield AI v1.0</p>
        </div>
      </motion.div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg,#EAF2FF 0%,#F8FAFC 50%,#EEF6FF 100%)",
};

const card = {
  width: 430,
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(12px)",
  borderRadius: 22,
  padding: 40,
  boxShadow: "0 20px 50px rgba(0,0,0,.12)",
};

const header = {
  textAlign: "center",
  marginBottom: 30,
};

const stripe = {
  height: 6,
  borderRadius: 10,
  background: "linear-gradient(90deg,#FF9933,#FFFFFF,#138808)",
  marginBottom: 25,
};

const title = {
  margin: 0,
  fontSize: 42,
  color: "#0F172A",
};

const subtitle = {
  color: "#2563EB",
  fontWeight: 600,
};

const small = {
  color: "#64748B",
  fontSize: 14,
};

const field = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #CBD5E1",
  borderRadius: 12,
  padding: "0 15px",
  marginTop: 18,
};

const icon = {
  color: "#2563EB",
};

const input = {
  flex: 1,
  border: "none",
  outline: "none",
  padding: 16,
  fontSize: 15,
};

const eyeButton = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#64748B",
};

const button = {
  width: "100%",
  marginTop: 28,
  padding: 16,
  borderRadius: 12,
  border: "none",
  background: "#2563EB",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};

const footer = {
  marginTop: 25,
  textAlign: "center",
  color: "#64748B",
  fontSize: 13,
};

export default Login;
