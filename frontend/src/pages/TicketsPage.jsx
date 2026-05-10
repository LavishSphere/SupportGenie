import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import TicketCard from "../components/TicketCard";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api
      .listTickets()
      .then((data) => {
        if (!cancelled) setTickets(data.tickets || []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) navigate("/login", { replace: true });
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Your tickets</h2>
        {!loading && (
          <span className="text-sm text-slate-500">{tickets.length} total</span>
        )}
      </div>

      {loading && <div className="text-slate-500">Loading…</div>}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="text-slate-500 bg-white border border-slate-200 rounded-lg p-8 text-center">
          No tickets yet.
        </div>
      )}

      <div className="space-y-3">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
