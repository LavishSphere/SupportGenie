import { Outlet, Link, useNavigate } from "react-router-dom";
import { getUser, clearSession } from "../auth";

export default function Layout() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/tickets" className="text-lg font-semibold text-slate-900">
            SupportGenie
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user && <span className="text-slate-600">{user.email}</span>}
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
