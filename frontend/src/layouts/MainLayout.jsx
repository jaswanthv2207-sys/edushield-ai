import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MainLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <div
      style={{
        background: "#F3F4F6",
        minHeight: "100vh",
      }}
    >
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        style={{
          marginLeft: "270px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <main
          style={{
            flex: 1,
            padding: "40px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
