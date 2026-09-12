import { AuthProvider, useAuth } from "./auth/auth";
import { Layout, type Page } from "./components/Layout";
import { Login } from "./pages/Login";
import { Schedule } from "./pages/Schedule";
import { useState } from "react";

function Shell() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>("schedule");
  if (!user) return <Login />;
  return (
    <Layout page={page} go={setPage}>
      {page === "schedule" && <Schedule />}
      {page !== "schedule" && (
        <p className="border border-line rounded p-6 text-sm text-ink/60">
          Halaman ini hadir di W2. API-nya sudah hidup — coba via Swagger :8081.
        </p>
      )}
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
