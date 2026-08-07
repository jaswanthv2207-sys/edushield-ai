import { useEffect, useState } from "react";
import { getStudents } from "../services/studentService";

export default function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const data = await getStudents();
      console.log(JSON.stringify(data[0], null, 2));

      setStudents(data);

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refreshStudents: fetchStudents,
  };
}
