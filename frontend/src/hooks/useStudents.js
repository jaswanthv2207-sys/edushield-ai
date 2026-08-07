import { useEffect, useState } from "react";
import initialStudents from "../data/students";
import { loadStudents, saveStudents } from "../utils/storage";

export default function useStudents() {
  const [students, setStudents] = useState(() => loadStudents(initialStudents));

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  return {
    students,
    setStudents,
  };
}
