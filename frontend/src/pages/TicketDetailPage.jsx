import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { decodeHtml } from "../utils";

function ConversationItem({ author, message, date }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-medium text-slate-700">{author}</span>
        {date && <span>{date}</span>}
      </div>
      <div className="text-sm text-slate-800 whitespace-pre-wrap">{decodeHtml(message)}</div>
    </div>
  );
}

function SummaryPanel({ ticketId }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.summarizeTicket(ticketId);
      setText(data.summary || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-900">AI Summary</h3>
        <button
          onClick={handleRun}
          disabled={loading}
          className="text-sm bg-slate-900 text-white rounded-md px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating…" : text ? "Regenerate" : "Summarize"}
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
        <div className="text-sm text-slate-500">Click Summarize to generate.</div>
      )}
    </div>
  );
}

function SuggestReplyPanel({ ticketId, onPosted }) {
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [posted, setPosted] = useState(false);

  const handleSuggest = async () => {
    setError(null);
    setPosted(false);
    setGenerating(true);
    try {
      const data = await api.suggestReply(ticketId);
      setDraft(data.suggested_reply || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!draft.trim()) return;
    setError(null);
    setPosting(true);
    try {
      await api.postReply(ticketId, draft);
      setPosted(true);
      setDraft("");
      onPosted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900">Suggested reply</h3>
        <button
          onClick={handleSuggest}
          disabled={generating || posting}
          className="text-sm bg-slate-900 text-white rounded-md px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? "Generating…" : draft ? "Regenerate" : "Suggest"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {posted && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          Reply posted to WHMCS.
        </div>
      )}

      {(draft || generating) && (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={generating || posting}
          rows={8}
          placeholder={generating ? "Generating…" : ""}
          className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 disabled:opacity-60"
        />
      )}

      {draft && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Edit before posting if needed</span>
          <button
            onClick={handlePost}
            disabled={posting || !draft.trim()}
            className="text-sm bg-emerald-600 text-white rounded-md px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? "Posting…" : "Post Reply"}
          </button>
        </div>
      )}

      {!draft && !generating && !error && !posted && (
        <div className="text-sm text-slate-500">
          Click Suggest to generate a draft you can edit and post.
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

  const loadTicket = useCallback(
    (signal) => {
      setLoading(true);
      api
        .getTicket(id)
        .then((data) => {
          if (signal?.aborted) return;
          setTicket(data.ticket);
          setError(null);
        })
        .catch((err) => {
          if (signal?.aborted) return;
          if (err.status === 401) navigate("/login", { replace: true });
          else setError(err.message);
        })
        .finally(() => {
          if (!signal?.aborted) setLoading(false);
        });
    },
    [id, navigate]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    loadTicket(ctrl.signal);
    return () => ctrl.abort();
  }, [loadTicket]);

  if (loading && !ticket) return <div className="text-slate-500">Loading…</div>;
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
        <h1 className="text-xl font-semibold text-slate-900">{decodeHtml(ticket.subject)}</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SummaryPanel ticketId={id} />
        <SuggestReplyPanel ticketId={id} onPosted={() => loadTicket()} />
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Conversation</h2>
        <div className="space-y-3">
          <ConversationItem
            author={decodeHtml(ticket.name) || "Customer"}
            message={ticket.message}
            date={ticket.date}
          />
          {replies.map((r, idx) => (
            <ConversationItem
              key={idx}
              author={decodeHtml(r.admin || r.name) || "User"}
              message={r.message}
              date={r.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
