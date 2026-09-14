import { AuthProvider, useAuth } from "./auth/auth";
import { Layout, type Page } from "./components/Layout";
import { Attendance } from "./pages/Attendance";
import { Login } from "./pages/Login";
import { Reports } from "./pages/Reports";
import { Schedule } from "./pages/Schedule";
import { Shifts } from "./pages/Shifts";
import { useState } from "react";

const PAGE_KEY = "shiftbase_page";
const PAGES: Page[] = ["schedule", "shifts", "attendance", "reports"];

function Shell() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem(PAGE_KEY);
    return PAGES.includes(saved as Page) ? (saved as Page) : "schedule";
  });
  function go(p: Page) {
    localStorage.setItem(PAGE_KEY, p);
    setPage(p);
  }
  if (!user) return <Login />;
  return (
    <Layout page={page} go={go}>
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
