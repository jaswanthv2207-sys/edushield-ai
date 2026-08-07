import { useState } from "react";
import { useLocation } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import RiskBadge from "../components/RiskBadge";
import api from "../services/api";

function Prediction() {
  const { state } = useLocation();

  const [school, setSchool] = useState(state?.school || "School A");
  const [gender, setGender] = useState(state?.gender || "Male");
  const [feesPaid, setFeesPaid] = useState("Paid");
  const [internet, setInternet] = useState("Yes");
  const [familySupport, setFamilySupport] = useState("Yes");
  const [higherEducation, setHigherEducation] = useState("Yes");
  const [medical, setMedical] = useState("Good");

  const [absences, setAbsences] = useState(state ? 100 - state.attendance : 0);

  const [failures, setFailures] = useState(0);

  const [finalGrade, setFinalGrade] = useState(state?.cgpa || "");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);

    const payload = {
      Student_ID: state?.id || "STU101",
      School: school,
      Gender: gender,
      Fees_Paid_Status: feesPaid,
      Internet_Access: internet,
      Family_Support: familySupport,
      Wants_Higher_Education: higherEducation,
      Medical_Status: medical,
      Number_of_Absences: Number(absences),
      Number_of_Failures: Number(failures),
      Final_Grade: Number(finalGrade),
    };

    console.log("Sending:", payload);

    try {
      const response = await api.post("/predict", payload);

      console.log("Backend Response:", response.data);

      setResult(response.data);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.log(error.response.data);
      }

      console.log(error.response);

      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Prediction Failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <h1
        style={{
          fontSize: 42,
          marginBottom: 35,
        }}
      >
        AI Dropout Prediction
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 30,
        }}
      >
        {/* LEFT */}

        <div style={card}>
          {state && (
            <div
              style={{
                background: "#EFF6FF",
                padding: 20,
                borderRadius: 12,
                marginBottom: 25,
              }}
            >
              <h3>{state.name}</h3>

              <p>
                <b>District:</b> {state.district}
              </p>

              <p>
                <b>Attendance:</b> {state.attendance}%
              </p>

              <p>
                <b>CGPA:</b> {state.cgpa}
              </p>
            </div>
          )}

          <h2>Student Details</h2>

          <label style={label}>Gender</label>

          <select
            style={input}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
          </select>

          <label style={label}>School</label>

          <input
            style={input}
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />

          <label style={label}>Fee Payment Status</label>

          <select
            style={input}
            value={feesPaid}
            onChange={(e) => setFeesPaid(e.target.value)}
          >
            <option>Paid</option>
            <option>Unpaid</option>
          </select>

          <label style={label}>Internet Access</label>

          <select
            style={input}
            value={internet}
            onChange={(e) => setInternet(e.target.value)}
          >
            <option>Yes</option>
            <option>No</option>
          </select>

          <label style={label}>Family Support</label>

          <select
            style={input}
            value={familySupport}
            onChange={(e) => setFamilySupport(e.target.value)}
          >
            <option>Yes</option>
            <option>No</option>
          </select>

          <label style={label}>Interested in Higher Education</label>

          <select
            style={input}
            value={higherEducation}
            onChange={(e) => setHigherEducation(e.target.value)}
          >
            <option>Yes</option>
            <option>No</option>
          </select>

          <label style={label}>Medical Condition</label>

          <select
            style={input}
            value={medical}
            onChange={(e) => setMedical(e.target.value)}
          >
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>

          <label style={label}>Number of Absences</label>

          <input
            type="number"
            style={input}
            value={absences}
            onChange={(e) => setAbsences(e.target.value)}
          />

          <label style={label}>Previous Failures</label>

          <input
            type="number"
            style={input}
            value={failures}
            onChange={(e) => setFailures(e.target.value)}
          />

          <label style={label}>Final Grade (CGPA)</label>

          <input
            type="number"
            step="0.1"
            style={input}
            value={finalGrade}
            onChange={(e) => setFinalGrade(e.target.value)}
          />

          <button style={button} onClick={predict} disabled={loading}>
            {loading ? "Predicting..." : "Predict Risk"}
          </button>
        </div>

        {/* RIGHT */}

        <div style={card}>
          <h2>Prediction Result</h2>

          {!result ? (
            <div
              style={{
                marginTop: 120,
                textAlign: "center",
                color: "#64748B",
              }}
            >
              <h3>No Prediction Yet</h3>

              <p>
                Fill the student details and click
                <b> Predict Risk</b>.
              </p>
            </div>
          ) : (
            <div
              style={{
                marginTop: 25,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 25,
                }}
              >
                <h1
                  style={{
                    fontSize: 60,
                    margin: 0,
                    color:
                      (result.risk_assessment?.risk_score ?? 0) >= 80
                        ? "#DC2626"
                        : (result.risk_assessment?.risk_score ?? 0) >= 50
                          ? "#D97706"
                          : "#16A34A",
                  }}
                >
                  {result.risk_assessment?.risk_score ?? "--"}%
                </h1>

                <div style={{ marginTop: 15 }}>
                  <RiskBadge risk={result.risk_assessment?.risk_score ?? 0} />
                </div>

                <h2 style={{ marginTop: 20 }}>
                  {result.risk_assessment?.risk_tier}
                </h2>
              </div>

              <hr />

              <div style={{ marginTop: 25 }}>
                <div
                  style={{
                    background: "#EFF6FF",
                    padding: 15,
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  <h3>Status</h3>

                  <p>{result.counselling_system?.status}</p>
                </div>
                <h3>AI Analysis</h3>

                {result.risk_assessment?.risk_factors?.length ? (
                  <ul>
                    {result.risk_assessment.risk_factors.map((factor) => (
                      <li key={factor}>{factor}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No detailed reasons returned by the model.</p>
                )}

                <br />

                <h3>Recommendations</h3>

                {result.counselling_system?.recommended_actions?.length ? (
                  <ul>
                    {result.counselling_system.recommended_actions.map(
                      (recommendation) => (
                        <li key={recommendation}>{recommendation}</li>
                      ),
                    )}
                  </ul>
                ) : (
                  <ul>
                    <li>Assign Counsellor</li>
                    <li>Monitor Attendance</li>
                    <li>Inform Parents</li>
                    <li>Academic Mentoring</li>
                  </ul>
                )}

                <br />

                <h3>Government Intervention</h3>

                <ul>
                  {result.counselling_system?.counselor_guidance_notes?.map(
                    (note) => (
                      <li key={note}>{note}</li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

const card = {
  background: "#fff",
  borderRadius: 20,
  padding: 35,
  boxShadow: "0 5px 15px rgba(0,0,0,.08)",
};

const label = {
  display: "block",
  marginTop: 18,
  marginBottom: 6,
  fontWeight: "600",
  color: "#334155",
  fontSize: "14px",
};

const input = {
  width: "100%",
  padding: 15,
  marginTop: 15,
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  fontSize: 15,
  boxSizing: "border-box",
};

const button = {
  marginTop: 25,
  background: "#2563EB",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "15px 35px",
  cursor: "pointer",
  fontSize: 16,
};

export default Prediction;
