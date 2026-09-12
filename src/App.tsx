import { AuthProvider, useAuth } from "./auth/auth";
import { Layout, type Page } from "./components/Layout";
import { Attendance } from "./pages/Attendance";
import { Login } from "./pages/Login";
import { Reports } from "./pages/Reports";
import { Schedule } from "./pages/Schedule";
import { Shifts } from "./pages/Shifts";
import { useState } from "react";

function Shell() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>("schedule");
  if (!user) return <Login />;
  return (
    <Layout page={page} go={setPage}>
      {page === "schedule" && <Schedule />}
      {page === "shifts" && <Shifts />}
      {page === "attendance" && <Attendance />}
      {page === "reports" && <Reports />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
