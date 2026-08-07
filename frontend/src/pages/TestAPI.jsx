import { useEffect, useState } from "react";
import API from "../api/api";

function TestAPI() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/students")
      .then((res) => {
        console.log(res.data);
        setStudents(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h1>Loading...</h1>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Backend Connected ✅</h1>

      <pre>{JSON.stringify(students, null, 2)}</pre>
    </div>
  );
}

export default TestAPI;
