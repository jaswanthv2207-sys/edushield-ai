import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import RiskBadge from "../components/RiskBadge";
import { predictStudent } from "../services/studentService";

function Prediction() {
  const { state: student } = useLocation();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function runPrediction() {
      if (!student) {
        window.location.href = "/students";
        return;
      }

      try {
        const response = await predictStudent(student);

        console.log("Prediction Result:", response);

        setResult(response);
      } catch (err) {
        console.error(err);
        setError("Prediction failed.");
      } finally {
        setLoading(false);
      }
    }

    runPrediction();
  }, [student]);

  return (
    <MainLayout>
      <h1
        style={{
          fontSize: 40,
          fontWeight: 700,
          marginBottom: 30,
        }}
      >
        AI Dropout Prediction
      </h1>
      {loading && (
        <div
          style={{
            background: "#fff",
            padding: 40,
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h2>Running AI Prediction...</h2>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#991B1B",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h2>{error}</h2>
        </div>
      )}

      {!loading && result && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: 30,
          }}
        >
          {/* LEFT PANEL */}

          <div style={card}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: 25,
              }}
            >
              Student Information
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                <tr>
                  <td style={infoLabel}>Student ID</td>
                  <td style={infoValue}>{student.Student_ID}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Name</td>
                  <td style={infoValue}>{student.Name}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>School</td>
                  <td style={infoValue}>{student.School}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Gender</td>
                  <td style={infoValue}>{student.Gender}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Address</td>
                  <td style={infoValue}>{student.Address}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Absences</td>
                  <td style={infoValue}>{student.Number_of_Absences}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Failures</td>
                  <td style={infoValue}>{student.Number_of_Failures}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Final Grade</td>
                  <td style={infoValue}>{student.Final_Grade}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Fees Paid</td>
                  <td style={infoValue}>{student.Fees_Paid_Status}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Family Support</td>
                  <td style={infoValue}>{student.Family_Support}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Internet Access</td>
                  <td style={infoValue}>{student.Internet_Access}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Higher Education</td>
                  <td style={infoValue}>{student.Wants_Higher_Education}</td>
                </tr>

                <tr>
                  <td style={infoLabel}>Medical Status</td>
                  <td style={infoValue}>{student.Medical_Status}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* RIGHT PANEL */}

          <div style={card}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: 25,
              }}
            >
              AI Prediction Result
            </h2>

            <div
              style={{
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  width: 170,
                  height: 170,
                  margin: "0 auto",
                  borderRadius: "50%",
                  border: "12px solid",
                  borderColor:
                    result.risk_assessment?.risk_score > 70
                      ? "#DC2626"
                      : result.risk_assessment?.risk_score > 40
                        ? "#F59E0B"
                        : "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: 50,
                    color:
                      result.risk_assessment?.risk_score > 70
                        ? "#DC2626"
                        : result.risk_assessment?.risk_score > 40
                          ? "#F59E0B"
                          : "#16A34A",
                  }}
                >
                  {result.risk_assessment?.risk_score ?? "--"}%
                </h1>

                <span
                  style={{
                    color: "#64748B",
                    fontSize: 14,
                  }}
                >
                  AI Score
                </span>
              </div>

              <div style={{ marginTop: 15 }}>
                <RiskBadge
                  risk={
                    result.risk_assessment?.risk_tier?.includes("High")
                      ? "High"
                      : result.risk_assessment?.risk_tier?.includes("Medium")
                        ? "Medium"
                        : "Low"
                  }
                />
              </div>

              <h2 style={{ marginTop: 20 }}>
                {result.risk_assessment?.risk_tier}
              </h2>

              <div
                style={{
                  marginTop: 15,
                  background: "#F8FAFC",
                  padding: 20,
                  borderRadius: 12,
                  textAlign: "left",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                  }}
                >
                  Prediction Summary
                </h3>

                <p>
                  The AI model analyzed attendance, academic performance,
                  socio-economic background, family support and behavioural
                  indicators to estimate the probability of student dropout.
                </p>
              </div>

              <div
                style={{
                  marginTop: 25,
                  background: "#F8FAFC",
                  borderRadius: 14,
                  padding: 18,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#64748B",
                    fontSize: 15,
                  }}
                >
                  AI Confidence
                </div>

                <h1
                  style={{
                    color: "#2563EB",
                    margin: "10px 0",
                    fontSize: 36,
                  }}
                >
                  {result.risk_assessment?.confidence_score ?? 95}%
                </h1>

                <div
                  style={{
                    width: "100%",
                    height: 14,
                    background: "#E2E8F0",
                    borderRadius: 20,
                    marginTop: 20,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${result.risk_assessment?.confidence_score ?? 95}%`,
                      height: "100%",
                      background: "#2563EB",
                      borderRadius: 20,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #E2E8F0",
                marginBottom: 25,
              }}
            />

            <div
              style={{
                background: "#EFF6FF",
                padding: 18,
                borderRadius: 12,
                marginBottom: 25,
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Counselling Status
              </h3>

              <p>{result.counselling_system?.status}</p>
            </div>
            <h3>AI Risk Factors</h3>

            {result.risk_assessment?.risk_factors?.length ? (
              <ul
                style={{
                  paddingLeft: 20,
                  lineHeight: 1.8,
                }}
              >
                {result.risk_assessment.risk_factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            ) : (
              <p>No risk factors returned by the model.</p>
            )}

            <br />

            <h3>Recommended Actions</h3>

            {result.counselling_system?.recommended_actions?.length ? (
              <ul
                style={{
                  paddingLeft: 20,
                  lineHeight: 1.8,
                }}
              >
                {result.counselling_system.recommended_actions.map(
                  (action, index) => (
                    <li key={index}>{action}</li>
                  ),
                )}
              </ul>
            ) : (
              <p>No recommendations available.</p>
            )}

            <br />

            <h3>Counsellor Guidance</h3>

            {result.counselling_system?.counselor_guidance_notes?.length ? (
              <ul
                style={{
                  paddingLeft: 20,
                  lineHeight: 1.8,
                }}
              >
                {result.counselling_system.counselor_guidance_notes.map(
                  (note, index) => (
                    <li key={index}>{note}</li>
                  ),
                )}
              </ul>
            ) : (
              <p>No guidance available.</p>
            )}
            <hr style={{ marginTop: 30 }} />

            <p
              style={{
                color: "#64748B",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Prediction generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

const card = {
  background: "#FFFFFF",
  borderRadius: 20,
  padding: 35,
  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
};

const infoLabel = {
  width: "45%",
  padding: "12px 0",
  fontWeight: "600",
  color: "#475569",
  borderBottom: "1px solid #E2E8F0",
};

const infoValue = {
  padding: "12px 0",
  color: "#0F172A",
  borderBottom: "1px solid #E2E8F0",
};

export default Prediction;
