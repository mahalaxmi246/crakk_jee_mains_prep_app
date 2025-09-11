// src/pages/Contests.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Play,
  CheckCircle,
  Users,
  Trophy,
} from "lucide-react";

/* Optional: try to use your Auth hook if exported from contexts/AuthContext
   This is a best-effort approach — if your project exports `useAuth` it will be used.
   Otherwise we fallback to a simple localStorage token check. */
let useAuthHook: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useAuthHook = require("../contexts/AuthContext").useAuth;
} catch (e) {
  useAuthHook = null;
}

/* ---------- types ---------- */
type SubjectRange = { start: number; end: number; maxMarks?: number };
type Contest = {
  id: string;
  title: string;
  subtitle?: string;
  focus?: string;
  start_time: string; // ISO
  end_time: string; // ISO
  totalQuestions?: number;
  totalMarks?: number;
  status?: "upcoming" | "ongoing" | "ended";
  banner?: string;
};

type LeaderboardEntry = { rank: number; name: string; marks: number; time?: string };

/* ---------- helpers ---------- */
const now = () => new Date().getTime();
const iso = (deltaMs = 0) => new Date(now() + deltaMs).toISOString();

const computeStatus = (c: Contest) => {
  const nowTs = new Date().getTime();
  const s = new Date(c.start_time).getTime();
  const e = new Date(c.end_time).getTime();
  if (nowTs < s) return "upcoming";
  if (nowTs >= s && nowTs <= e) return "ongoing";
  return "ended";
};

const formatShort = (isoStr?: string) =>
  isoStr ? new Date(isoStr).toLocaleString() : "—";

const relativeStartIn = (isoStr: string) => {
  const diff = new Date(isoStr).getTime() - now();
  if (diff <= 0) return "Started";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / (60 * 24))}d`;
};

// parse "Rank: 12" from subtitle if present
const parseRankFromSubtitle = (subtitle?: string) => {
  if (!subtitle) return "—";
  const m = subtitle.match(/Rank[:\s]+(\d+)/i);
  return m ? m[1] : "—";
};

/* ---------- mocked data (wireframe-friendly) ---------- */
const MOCK_CONTESTS: Contest[] = [
  {
    id: "c-weekly-01",
    title: "Weekly Challenge — JEE Advanced",
    subtitle: "Focused on advanced problems, 60 Qs",
    focus: "JEE Advanced",
    start_time: iso(-1000 * 60 * 60 * 2), // started 2h ago
    end_time: iso(1000 * 60 * 60 * 1), // ends in 1h
    totalQuestions: 60,
    totalMarks: 240,
  },
  {
    id: "c-mini-02",
    title: "Mini Weekly — JEE Mains",
    subtitle: "30 Qs, quick practice",
    focus: "JEE Mains",
    start_time: iso(1000 * 60 * 60 * 24), // tomorrow
    end_time: iso(1000 * 60 * 60 * 26),
    totalQuestions: 30,
    totalMarks: 120,
  },
  {
    id: "c-past-03",
    title: "Past Year Chemistry Set",
    subtitle: "Selected problems from previous years",
    focus: "Chemistry",
    start_time: iso(-1000 * 60 * 60 * 72), // 3 days ago
    end_time: iso(-1000 * 60 * 60 * 70),
    totalQuestions: 20,
    totalMarks: 80,
  },
];

const MOCK_MY_CONTESTS: Contest[] = [
  {
    id: "my-c-1",
    title: "My Attempt — JEE Mock #9",
    subtitle: "Submitted — Rank: 12",
    focus: "All",
    start_time: iso(-1000 * 60 * 60 * 100),
    end_time: iso(-1000 * 60 * 60 * 98),
  },
  {
    id: "my-c-2",
    title: "Practice Set — Mechanics",
    subtitle: "In progress",
    focus: "Physics",
    start_time: iso(-1000 * 60 * 60 * 5),
    end_time: iso(1000 * 60 * 60 * 2),
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Aadhya", marks: 280, time: "2h 12m" },
  { rank: 2, name: "Rohit", marks: 275, time: "1h 50m" },
  { rank: 3, name: "Meera", marks: 270, time: "2h 5m" },
];

/* ---------- Component ---------- */
export default function Contests(): JSX.Element {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "upcoming" | "ended">("all");
  const [search, setSearch] = useState("");
  const [myContests, setMyContests] = useState<Contest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [registerModalContest, setRegisterModalContest] = useState<Contest | null>(null);
  const [leaderboardModalContest, setLeaderboardModalContest] = useState<Contest | null>(null);
  const [showMyContestsModal, setShowMyContestsModal] = useState(false);

  // Try to resolve auth state (best-effort)
  const auth = useAuthHook ? useAuthHook() : { user: null, isAuthenticated: !!localStorage.getItem("auth_token") };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (false) {
          /* supabase branch removed in this build — keep mock fallback */
        } else {
          if (mounted) {
            setContests(MOCK_CONTESTS);
            setMyContests(MOCK_MY_CONTESTS);
            setLeaderboard(MOCK_LEADERBOARD);
          }
        }
      } catch (err) {
        console.error("load contests failed", err);
        if (mounted) {
          setContests(MOCK_CONTESTS);
          setMyContests(MOCK_MY_CONTESTS);
          setLeaderboard(MOCK_LEADERBOARD);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // attach computed status
  const contestsWithStatus = useMemo(
    () => contests.map((c) => ({ ...c, status: computeStatus(c) })),
    [contests]
  );

  // filtered list by tab/search
  const filtered = useMemo(() => {
    const base = contestsWithStatus.filter((c) =>
      `${c.title} ${c.subtitle ?? ""}`.toLowerCase().includes(search.toLowerCase())
    );
    switch (activeTab) {
      case "active":
        return base.filter((c) => c.status === "ongoing");
      case "upcoming":
        return base.filter((c) => c.status === "upcoming");
      case "ended":
        return base.filter((c) => c.status === "ended");
      default:
        return base;
    }
  }, [contestsWithStatus, activeTab, search]);

  /* placeholders to send to summary/detailed pages so they don't crash */
  const emptyAnswers: Record<number, string> = {};
  const emptyScores: Record<string, number> = {};
  const emptyTimeSpent = 0;

  // ----------------- join handler (navigates to your registered test route) -----------------
  const handleJoinNow = (contest: Contest) => {
    const sid = `contest_${contest.id}_start_time`;
    const answersKey = `contest_${contest.id}_answers`;
    const submittedKey = `contest_${contest.id}_submitted_answers`;
    const visitedKey = `contest_${contest.id}_visited_questions`;

    if (!localStorage.getItem(sid)) {
      localStorage.setItem(sid, Date.now().toString());
    }
    if (!localStorage.getItem(answersKey)) localStorage.setItem(answersKey, JSON.stringify({}));
    if (!localStorage.getItem(submittedKey)) localStorage.setItem(submittedKey, JSON.stringify({}));
    if (!localStorage.getItem(visitedKey)) localStorage.setItem(visitedKey, JSON.stringify([1]));

    // navigate to the test route you already registered in App.tsx (/contests/:contestId/test)
    navigate(`/contests/${contest.id}/test`, { state: { contest } });
  };
  // ----------------------------------------------------------------------------------------------

  // ----------------- register handler (upcoming contests) -----------------
  const handleRegister = (contest: Contest) => {
    if (!auth || !auth.isAuthenticated) {
      // not authenticated — redirect to auth flow
      navigate("/auth/callback");
      return;
    }

    // register (simple localStorage flag for demo). Replace this with real API call.
    const regKey = `contest_${contest.id}_registered`;
    localStorage.setItem(regKey, JSON.stringify({ registeredAt: Date.now() }));

    // close modal
    setRegisterModalContest(null);

    // For demo: navigate to test (or change to a details page if you'd prefer)
    navigate(`/contests/${contest.id}/test`, { state: { contest } });
  };
  // ----------------------------------------------------------------------------------------------

  // ----------------- leaderboard modal data helper -----------------
  // In a real app we'd fetch the contest-specific leaderboard; here we use page-level mock.
  const openLeaderboard = (contest: Contest) => {
    setLeaderboardModalContest(contest);
  };
  // ----------------------------------------------------------------------------------------------

  // helper to check if registered (demo)
  const isRegistered = (contestId: string) => !!localStorage.getItem(`contest_${contestId}_registered`);

  // find the latest upcoming contest (the nearest start_time in the future)
  const getLatestUpcoming = () => {
    const upcoming = contestsWithStatus
      .filter((c) => c.status === "upcoming")
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="bg-white rounded-2xl p-8 mb-8 text-center border border-gray-100 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Challenge Yourself</h1>
          <p className="text-lg text-gray-600 mt-2">Climb the Leaderboard — improve your rank with timed contests</p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* HERO: open modal for latest upcoming contest */}
            <button
              onClick={() => {
                const latest = getLatestUpcoming();
                if (latest) {
                  setRegisterModalContest(latest);
                } else {
                  // fallback: if there's no upcoming contest show first contest or a message
                  const fallback = contestsWithStatus.find((c) => c.status === "ongoing") ?? contestsWithStatus[0] ?? null;
                  if (fallback) {
                    setRegisterModalContest(fallback as Contest);
                  } else {
                    alert("No contests available right now.");
                  }
                }
              }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 transition-colors"
            >
              <Play size={18} />
              <span className="font-medium">Register for Upcoming Contest</span>
            </button>

            <button
              className="inline-flex items-center space-x-2 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
              onClick={() => setActiveTab("upcoming")}
              aria-label="View upcoming contests"
            >
              <Calendar size={16} />
              <span className="text-sm text-gray-700">View upcoming</span>
            </button>
          </div>
        </div>

        {/* Tabs + search */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2">
            {(["all", "active", "upcoming", "ended"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === t ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                aria-pressed={activeTab === t}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contests..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contest cards grid */}
        {loading ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">Loading contests…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {filtered.map((c) => (
                <article key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{c.subtitle}</p>
                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1"><Clock size={14} /> {relativeStartIn(c.start_time)}</span>
                          <span className="inline-flex items-center gap-1"><Calendar size={14} /> {formatShort(c.start_time)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${c.status === "ongoing" ? "bg-green-50 text-green-700" : c.status === "upcoming" ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-700"}`}>
                          {c.status}
                        </div>

                        <div className="mt-4 flex flex-col items-end gap-2">
                          {/* For the main contest list: ended contests show Leaderboard button, upcoming show Register (modal), ongoing show Join Now */}

                          {c.status === "ongoing" && (
                            <button
                              onClick={() => handleJoinNow(c)}
                              className="text-sm inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Play size={14} />
                              <span>Join Now</span>
                            </button>
                          )}

                          {c.status === "upcoming" && (
                            // per-contest register (opens modal for that contest)
                            <button
                              onClick={() => setRegisterModalContest(c)}
                              className="text-sm inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Play size={14} />
                              <span>{isRegistered(c.id) ? "Registered" : "Register Now"}</span>
                            </button>
                          )}

                          {c.status === "ended" && (
                            <button
                              onClick={() => openLeaderboard(c)}
                              className="text-sm inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Trophy size={14} />
                              <span>Leaderboard</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Bottom split: My Contests + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: My Contests (span 2 cols on desktop) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">My Contests</h4>

                  {/* OPEN modal showing all my contests */}
                  <button
                    onClick={() => setShowMyContestsModal(true)}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {myContests.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 border border-gray-100 text-center text-gray-600">You have no contests yet</div>
                  ) : (
                    myContests.map((m) => (
                      <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{m.title}</h5>
                          <p className="text-sm text-gray-500">{m.subtitle}</p>
                          <div className="text-xs text-gray-400 mt-2">{formatShort(m.start_time)}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* show rank value instead of underline */}
                          <div className="text-sm text-gray-700">Rank: <span className="font-medium">{parseRankFromSubtitle(m.subtitle)}</span></div>

                          {/* Summary button for My Contests (navigates to ContestSummaryPage) */}
                          <Link
                            to={`/contests/${m.id}/summary`}
                            state={{
                              contest: m,
                              answers: emptyAnswers,
                              scores: emptyScores,
                              timeSpent: emptyTimeSpent,
                            }}
                            className="text-sm px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium"
                          >
                            Summary
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right column: Leaderboard (sidebar) */}
              <aside className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Trophy size={18} /> Leaderboard</h4>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div key={entry.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-800">
                          {entry.rank}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                          <div className="text-xs text-gray-500">Time: {entry.time}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{entry.marks} M</div>
                    </div>
                  ))}

                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-medium border border-gray-200">You</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Your Name</div>
                          <div className="text-xs text-gray-500">Rank: —</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">— M</div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      {/* Register modal */}
      {registerModalContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-modal-title"
            className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h2 id="register-modal-title" className="text-xl font-semibold text-gray-900">{registerModalContest.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{registerModalContest.subtitle}</p>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <div className="font-medium text-gray-800">Start</div>
                  <div className="text-gray-600">{formatShort(registerModalContest.start_time)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">End</div>
                  <div className="text-gray-600">{formatShort(registerModalContest.end_time)}</div>
                </div>

                <div>
                  <div className="font-medium text-gray-800">Questions</div>
                  <div className="text-gray-600">{registerModalContest.totalQuestions ?? "—"}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Marks</div>
                  <div className="text-gray-600">{registerModalContest.totalMarks ?? "—"}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <div><span className="font-medium">Focus:</span> {registerModalContest.focus ?? "General"}</div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setRegisterModalContest(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => registerModalContest && handleRegister(registerModalContest)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard modal for ended contests */}
      {leaderboardModalContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leaderboard-modal-title"
            className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 id="leaderboard-modal-title" className="text-xl font-semibold text-gray-900">{leaderboardModalContest.title} — Leaderboard</h2>
                  <p className="text-sm text-gray-600 mt-1">{leaderboardModalContest.subtitle}</p>
                </div>
                <div className="text-sm text-gray-500">{formatShort(leaderboardModalContest.start_time)}</div>
              </div>

              <div className="mt-4 space-y-3">
                {leaderboard.length === 0 ? (
                  <div className="text-sm text-gray-600">No leaderboard data</div>
                ) : (
                  leaderboard.map((e) => (
                    <div key={e.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-800">{e.rank}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{e.name}</div>
                          <div className="text-xs text-gray-500">Time: {e.time}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{e.marks} M</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setLeaderboardModalContest(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Close
              </button>

              <button
                onClick={() => {
                  // Open the test page for this contest WITHOUT timer: pass noTimer flag in state
                  if (leaderboardModalContest) {
                    navigate(`/contests/${leaderboardModalContest.id}/test`, { state: { contest: leaderboardModalContest, noTimer: true } });
                    setLeaderboardModalContest(null);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                View Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Contests modal (View all) */}
      {showMyContestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">All My Contests</h2>
                <button onClick={() => setShowMyContestsModal(false)} className="text-sm text-gray-500">Close</button>
              </div>

              <div className="mt-4 space-y-3">
                {myContests.length === 0 ? (
                  <div className="text-sm text-gray-600">You haven't participated in any contests yet.</div>
                ) : (
                  myContests.map((m) => (
                    <div key={m.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{m.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{m.subtitle}</div>
                        <div className="text-xs text-gray-400 mt-2">{formatShort(m.start_time)}</div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-gray-700">Rank: <span className="font-medium">{parseRankFromSubtitle(m.subtitle)}</span></div>
                        <Link
                          to={`/contests/${m.id}/summary`}
                          state={{
                            contest: m,
                            answers: emptyAnswers,
                            scores: emptyScores,
                            timeSpent: emptyTimeSpent,
                          }}
                          onClick={() => setShowMyContestsModal(false)}
                          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium text-sm"
                        >
                          Summary
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex items-center justify-end gap-3">
              <button onClick={() => setShowMyContestsModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
