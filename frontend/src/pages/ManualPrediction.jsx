import { useState } from "react";
import MainLayout from "../layouts/MainLayout";

function ManualPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [formData, setFormData] = useState({
    gender: "Male",
    school: "School A",
    fee_status: "Paid",
    internet: "Yes",
    family_support: "Yes",
    higher_education: "Yes",
    medical: "Good",
    absences: 0,
    failures: 0,
    grade: 7,
  });

  const predictRisk = () => {
    let risk = 0;

    // Final Grade
    if (Number(formData.grade) < 5) {
      risk += 35;
    } else if (Number(formData.grade) < 7) {
      risk += 20;
    }

    // Absences
    if (Number(formData.absences) > 10) {
      risk += 25;
    } else if (Number(formData.absences) > 5) {
      risk += 15;
    }

    // Previous Failures
    if (Number(formData.failures) > 2) {
      risk += 20;
    }

    // Family Support
    if (formData.family_support === "No") {
      risk += 15;
    }

    // Fee Status
    if (formData.fee_status !== "Paid") {
      risk += 10;
    }

    // Internet Access
    if (formData.internet === "No") {
      risk += 5;
    }

    // Higher Education Interest
    if (formData.higher_education === "No") {
      risk += 5;
    }

    // Medical condition
    if (formData.medical === "Poor") {
      risk += 5;
    }

    // Maximum 100%
    if (risk > 100) {
      risk = 100;
    }

    let level = "Low";

    if (risk >= 70) {
      level = "High";
    } else if (risk >= 40) {
      level = "Medium";
    }

    setPrediction({
      risk,
      level,
    });
  };
  return (
    <MainLayout>
      <div style={{ padding: "25px" }}>
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "700",
            marginBottom: "30px",
          }}
        >
          Manual AI Dropout Prediction
        </h1>

        <p
          style={{
            color: "#64748B",
            marginBottom: 30,
          }}
        >
          AI-powered student dropout risk assessment system
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "25px",
          }}
        >
          {/* Left Card */}

          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 20,
              boxShadow: "0 8px 25px rgba(0,0,0,.08)",
            }}
          >
            <h2>Student Details</h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginTop: "25px",
              }}
            >
              <label>Gender</label>

              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value,
                  })
                }
              >
                <option>Male</option>
                <option>Female</option>
              </select>

              <label>School</label>

              <input
                value={formData.school}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    school: e.target.value,
                  })
                }
              />
              <label>Fee Payment Status</label>

              <select
                value={formData.fee_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fee_status: e.target.value,
                  })
                }
              >
                <option>Paid</option>
                <option>Pending</option>
              </select>
              <label>Internet Access</label>

              <select
                value={formData.internet}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    internet: e.target.value,
                  })
                }
              >
                <option>Yes</option>
                <option>No</option>
              </select>
              <label>Family Support</label>

              <select
                value={formData.family_support}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    family_support: e.target.value,
                  })
                }
              >
                <option>Yes</option>
                <option>No</option>
              </select>
              <label>Interested in Higher Education</label>

              <select
                value={formData.higher_education}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    higher_education: e.target.value,
                  })
                }
              >
                <option>Yes</option>
                <option>No</option>
              </select>
              <label>Medical Condition</label>

              <select
                value={formData.medical}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medical: e.target.value,
                  })
                }
              >
                <option>Good</option>
                <option>Poor</option>
              </select>
              <label>Number of Absences</label>

              <input
                type="number"
                value={formData.absences}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    absences: e.target.value,
                  })
                }
              />
              <label>Previous Failures</label>

              <input
                type="number"
                value={formData.failures}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    failures: e.target.value,
                  })
                }
              />
              <label>Final Grade (CGPA)</label>

              <input
                type="number"
                step="0.1"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    grade: e.target.value,
                  })
                }
              />
              <button
                onClick={predictRisk}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#2563EB",
                  color: "#fff",
                  fontSize: "17px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginTop: "25px",
                }}
              >
                🧠 Predict Risk
              </button>
            </div>
          </div>

          {/* Right Card */}

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 4px 15px rgba(0,0,0,.08)",
            }}
          >
            <h2>Prediction Result</h2>

            <p>
              {prediction ? (
                <div>
                  <h1
                    style={{
                      fontSize: 55,
                      color:
                        prediction.level === "High"
                          ? "#DC2626"
                          : prediction.level === "Medium"
                            ? "#F59E0B"
                            : "#16A34A",
                      marginBottom: 10,
                    }}
                  >
                    {prediction.risk}%
                  </h1>

                  <div
                    style={{
                      padding: "8px 16px",
                      display: "inline-block",
                      borderRadius: 30,
                      background:
                        prediction.level === "High"
                          ? "#FEE2E2"
                          : prediction.level === "Medium"
                            ? "#FEF3C7"
                            : "#DCFCE7",

                      color:
                        prediction.level === "High"
                          ? "#DC2626"
                          : prediction.level === "Medium"
                            ? "#D97706"
                            : "#15803D",

                      fontWeight: "bold",
                    }}
                  >
                    {prediction.level} Risk
                  </div>

                  <div
                    style={{
                      marginTop: 30,
                      height: 12,
                      background: "#E5E7EB",
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${prediction.risk}%`,
                        height: "100%",
                        background:
                          prediction.level === "High"
                            ? "#DC2626"
                            : prediction.level === "Medium"
                              ? "#F59E0B"
                              : "#16A34A",
                      }}
                    />
                  </div>

                  <h3 style={{ marginTop: 30 }}>🤖 AI Recommendation</h3>

                  <ul>
                    {prediction.level === "High" && (
                      <>
                        <li>Immediate counselling</li>
                        <li>Parent meeting</li>
                        <li>Weekly attendance monitoring</li>
                      </>
                    )}

                    {prediction.level === "Medium" && (
                      <>
                        <li>Academic mentoring</li>
                        <li>Monthly counselling</li>
                      </>
                    )}

                    {prediction.level === "Low" && (
                      <>
                        <li>Continue regular monitoring</li>
                        <li>Encourage participation</li>
                      </>
                    )}
                  </ul>
                </div>
              ) : (
                <p>No Prediction Yet</p>
              )}
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          ></div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ManualPrediction;
