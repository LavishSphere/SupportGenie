import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";

function ConversationItem({ author, message, date }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-medium text-slate-700">{author}</span>
        {date && <span>{date}</span>}
      </div>
      <div className="text-sm text-slate-800 whitespace-pre-wrap">{message}</div>
    </div>
  );
}

function AiPanel({ title, text, loading, error, onRun, ctaLabel }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-900">{title}</h3>
        <button
          onClick={onRun}
          disabled={loading}
          className="text-sm bg-slate-900 text-white rounded-md px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating…" : ctaLabel}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {text && (
        <div className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-md p-3">
          {text}
        </div>
      )}
      {!text && !error && !loading && (
        <div className="text-sm text-slate-500">
          Click the button to generate.
        </div>
      )}
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getTicket(id)
      .then((data) => {
        if (!cancelled) setTicket(data.ticket);
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
  }, [id, navigate]);

  const handleSummarize = async () => {
    setSummaryError(null);
    setSummaryLoading(true);
    try {
      const data = await api.summarizeTicket(id);
      setSummary(data.summary || "");
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSuggest = async () => {
    setReplyError(null);
    setReplyLoading(true);
    try {
      const data = await api.suggestReply(id);
      setReply(data.suggested_reply || "");
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleCopyReply = async () => {
    if (reply) await navigator.clipboard.writeText(reply);
  };

  if (loading) return <div className="text-slate-500">Loading…</div>;
  if (error)
    return (
      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        {error}
      </div>
    );
  if (!ticket) return null;

  const replies =
    ticket.replies && typeof ticket.replies === "object"
      ? ticket.replies.reply || []
      : [];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/tickets" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to tickets
        </Link>
      </div>

      <div>
        <div className="text-xs text-slate-500 mb-1">
          #{ticket.tid} · {ticket.deptname || ticket.department} · {ticket.status}
        </div>
        <h1 className="text-xl font-semibold text-slate-900">{ticket.subject}</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <AiPanel
          title="AI Summary"
          text={summary}
          loading={summaryLoading}
          error={summaryError}
          onRun={handleSummarize}
          ctaLabel="Summarize"
        />
        <div className="space-y-2">
          <AiPanel
            title="Suggested reply"
            text={reply}
            loading={replyLoading}
            error={replyError}
            onRun={handleSuggest}
            ctaLabel="Suggest"
          />
          {reply && (
            <button
              onClick={handleCopyReply}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Copy to clipboard
            </button>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Conversation</h2>
        <div className="space-y-3">
          <ConversationItem
            author={ticket.name || "Customer"}
            message={ticket.message}
            date={ticket.date}
          />
          {replies.map((r, idx) => (
            <ConversationItem
              key={idx}
              author={r.admin || r.name || "User"}
              message={r.message}
              date={r.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
