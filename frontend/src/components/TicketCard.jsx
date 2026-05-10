import { Link } from "react-router-dom";
import { decodeHtml } from "../utils";

const STATUS_STYLES = {
  Open: "bg-emerald-100 text-emerald-800",
  Answered: "bg-sky-100 text-sky-800",
  "Customer-Reply": "bg-amber-100 text-amber-800",
  "In Progress": "bg-violet-100 text-violet-800",
  Closed: "bg-slate-200 text-slate-700",
};

export default function TicketCard({ ticket }) {
  const statusClass = STATUS_STYLES[ticket.status] || "bg-slate-100 text-slate-700";

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-400 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-slate-500 mb-1">
            #{ticket.tid} · {ticket.department}
          </div>
          <div className="font-medium text-slate-900 truncate">
            {decodeHtml(ticket.subject) || "(no subject)"}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Last reply: {ticket.lastreply || "—"}
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${statusClass}`}
        >
          {ticket.status}
        </span>
      </div>
    </Link>
  );
}
