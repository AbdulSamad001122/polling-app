import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { pollService } from "../services/pollService";
import { Button } from "../components/Button";
import toast from "react-hot-toast";
import { Users, Clock, Activity, Trophy, UserCircle2 } from "lucide-react";
import { io } from "socket.io-client";

export default function PollAnalytics() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { getToken, isLoaded } = useAuth();
  const [poll, setPoll] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState("leaderboard"); // "leaderboard" | "insights"
  const [selectedRespondent, setSelectedRespondent] = useState(null);
  const [filterQuestionId, setFilterQuestionId] = useState("all");
  const [filterOptionId, setFilterOptionId] = useState("all");

  useEffect(() => {
    if (!isLoaded) return;
    
    const fetchData = async () => {
      try {
        const pollRes = await pollService.getPoll(pollId);
        setPoll(pollRes.data);
        
        const analyticsRes = await pollService.getPollAnalytics(pollId, getToken);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000");

    socket.on("connect", () => {
        setIsLive(true);
        socket.emit("joinPoll", pollId);
    });

    socket.on("disconnect", () => {
        setIsLive(false);
    });

    socket.on("pollUpdated", () => {
        fetchData();
        toast.success("New vote permanently submitted!", { icon: "🔥", id: "vote-toast" });
    });

    socket.on("liveOptionUpdate", (data) => {
        setAnalytics(prev => {
            if (!prev) return prev;
            const newAnalytics = { ...prev };
            newAnalytics.questions = newAnalytics.questions.map(q => {
                if (q.questionId === data.questionId) {
                    const newQ = { ...q, options: q.options.map(o => ({ ...o, voters: [...(o.voters || [])] })) };
                    const option = newQ.options.find(o => o._id === data.optionId);
                    if (option) {
                        if (data.action === "select") {
                            option.count++;
                            newQ.totalAnswers++;
                            if (!option.voters.some(v => v.id === data.user.id)) {
                                option.voters.push(data.user);
                            }
                        } else if (data.action === "deselect") {
                            option.count = Math.max(0, option.count - 1);
                            newQ.totalAnswers = Math.max(0, newQ.totalAnswers - 1);
                            option.voters = option.voters.filter(v => v.id !== data.user.id);
                        }
                    }
                    return newQ;
                }
                return q;
            });
            return newAnalytics;
        });
    });

    return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("pollUpdated");
        socket.off("liveOptionUpdate");
        socket.disconnect();
    };
  }, [pollId, getToken, isLoaded]);

  const executePublish = async () => {
    setPublishing(true);
    setShowConfirm(false);
    try {
      await pollService.publishPoll(pollId, getToken);
      setPoll({ ...poll, isPublished: true, isActive: false });
      toast.success("Poll results published successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const executeClose = async () => {
    setClosing(true);
    setShowCloseConfirm(false);
    try {
      await pollService.closePoll(pollId, getToken);
      setPoll({ ...poll, isActive: false });
      toast.success("Poll closed successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setClosing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-xl mx-auto p-8 mt-10 bg-white rounded-3xl border-2 border-red-100 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-dark/70 mt-2">{error}</p>
        <Button className="mt-6" onClick={() => navigate("/my-polls")}>Back to My Polls</Button>
    </div>
  );

  return (
    <>
    {showConfirm && (
      <div className="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
          <h3 className="text-xl font-bold text-secondary mb-2">Publish Results?</h3>
          <p className="text-dark/70 mb-6">Are you sure? This will permanently close the poll and make the results public for anyone with the link.</p>
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={executePublish}>Yes, Publish</Button>
          </div>
        </div>
      </div>
    )}

    {showCloseConfirm && (
      <div className="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
          <h3 className="text-xl font-bold text-secondary mb-2">Close Poll?</h3>
          <p className="text-dark/70 mb-6">This will stop all voting immediately. You can still view analytics and publish results later if you wish.</p>
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={executeClose}>Close Poll</Button>
          </div>
        </div>
      </div>
    )}
    
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-secondary/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
        <div className="pl-4">
          <h1 className="text-2xl font-bold text-dark">{poll.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-dark/60">
            <span className="flex items-center gap-1.5 font-bold bg-primary/30 px-3 py-1 rounded-full"><Users className="w-4 h-4 text-secondary"/> {analytics.totalResponses} Responses</span>
            {poll.expiresAt && <span className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4"/> Ends: {new Date(poll.expiresAt).toLocaleDateString()}</span>}
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${poll.isPublished ? "bg-blue-100 text-blue-700" : (poll.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}`}>
              {poll.isPublished ? "Published" : (poll.isActive ? "Active" : "Closed")}
            </span>
            {isLive && poll.isActive && !poll.isPublished && (
                <span className="flex items-center gap-1.5 font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full animate-pulse border border-red-200 shadow-sm">
                    <Activity className="w-4 h-4" /> Live
                </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-secondary/20 hover:bg-primary/20 text-dark"
              onClick={() => window.open(`/poll/${poll._id}`, '_blank')}
            >
              View Public Page
            </Button>
            {!poll.isPublished && poll.isActive && (
              <Button variant="secondary" onClick={() => setShowCloseConfirm(true)} disabled={closing} className="border-red-500/50 text-red-600 hover:bg-red-50">
                {closing ? "Closing..." : "Close Poll"}
              </Button>
            )}
            {!poll.isPublished && (
              <Button onClick={() => setShowConfirm(true)} disabled={publishing} className="shadow-lg shadow-secondary/20">
                {publishing ? "Publishing..." : "Publish Results"}
              </Button>
            )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border-2 border-secondary/10 shadow-sm w-fit mx-auto md:mx-0">
        <button 
          onClick={() => setActiveTab("leaderboard")}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "leaderboard" ? "bg-secondary text-white shadow-md" : "text-dark/60 hover:text-dark hover:bg-primary/20"}`}
        >
          Leaderboard
        </button>
        <button 
          onClick={() => {
              setActiveTab("insights");
              setSelectedRespondent(null);
          }}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "insights" ? "bg-secondary text-white shadow-md" : "text-dark/60 hover:text-dark hover:bg-primary/20"}`}
        >
          Deep Insights
        </button>
      </div>

      {activeTab === "leaderboard" ? (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 border-b-2 border-secondary/10 pb-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                <Trophy className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-dark">{poll.isActive && !poll.isPublished ? "Live Leaderboard" : "Poll Leaderboard"}</h2>
                <p className="text-sm font-medium text-dark/50">
                    {poll.isActive && !poll.isPublished 
                        ? "Watch users interact with your poll in real-time" 
                        : "Detailed breakdown of the final poll results"}
                </p>
            </div>
        </div>

        {analytics.questions.map((q) => {
            // Sort options by count descending
            const sortedOptions = [...q.options].sort((a, b) => b.count - a.count);

            return (
                <div key={q.questionId} className="bg-white p-6 rounded-3xl border-2 border-secondary/10 shadow-sm flex flex-col gap-6">
                    <h3 className="font-bold text-secondary text-xl">{q.text}</h3>
                    <p className="text-sm font-bold text-dark/50 uppercase tracking-wider">{q.totalAnswers} total interactions</p>
                    
                    <div className="flex flex-col">
                        {/* Table Header */}
                        <div className="hidden md:grid md:grid-cols-[60px_2fr_3fr_minmax(150px,1fr)] gap-4 items-center px-4 pb-3 border-b-2 border-secondary/10 text-sm font-bold text-dark/50 uppercase tracking-wider">
                            <div>Rank</div>
                            <div>Option</div>
                            <div>Votes</div>
                            <div>Voters</div>
                        </div>

                        {/* Table Body */}
                        {sortedOptions.map((opt, index) => {
                            const percentage = q.totalAnswers > 0 ? Math.round((opt.count / q.totalAnswers) * 100) : 0;
                            return (
                                <div key={opt._id} className="grid grid-cols-1 md:grid-cols-[60px_2fr_3fr_minmax(150px,1fr)] gap-4 md:gap-4 items-center p-4 border-b border-secondary/5 hover:bg-primary/5 transition-colors">
                                    {/* Rank */}
                                    <div className="font-black text-2xl text-secondary/30 hidden md:block">
                                        #{index + 1}
                                    </div>
                                    
                                    {/* Option Text */}
                                    <div className="font-bold text-dark text-lg flex items-center gap-3">
                                        <span className="md:hidden font-black text-secondary/50">#{index + 1}</span>
                                        {opt.text}
                                    </div>

                                    {/* Progress Bar & Count */}
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-secondary">{opt.count} PTS</span>
                                            <span className="text-dark/50">{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-primary/20 rounded-full h-3">
                                            <div className="bg-linear-to-r from-secondary to-[#046e62] h-3 rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Voters Avatars */}
                                    <div className="flex flex-wrap items-center pt-2 md:pt-0">
                                        {opt.voters?.length > 0 ? (
                                            <div className="flex -space-x-3 rtl:space-x-reverse">
                                                {opt.voters.slice(0, 5).map((voter, i) => (
                                                    voter.imageUrl ? (
                                                        <img key={`${voter.id}-${i}`} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" src={voter.imageUrl} alt={voter.name} title={voter.name} />
                                                    ) : (
                                                        <div key={`${voter.id}-${i}`} className="w-8 h-8 rounded-full border-2 border-white bg-secondary/10 flex items-center justify-center shadow-sm" title={voter.name}>
                                                            <UserCircle2 className="w-5 h-5 text-secondary/60" />
                                                        </div>
                                                    )
                                                ))}
                                                {opt.voters.length > 5 && (
                                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary/50 text-secondary font-bold text-xs flex items-center justify-center z-10 shadow-sm">
                                                        +{opt.voters.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-dark/30 uppercase tracking-widest">No votes</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>
      ) : (
        <DeepInsightsView 
            poll={poll} 
            analytics={analytics} 
            filterQuestionId={filterQuestionId}
            setFilterQuestionId={setFilterQuestionId}
            filterOptionId={filterOptionId}
            setFilterOptionId={setFilterOptionId}
            selectedRespondent={selectedRespondent}
            setSelectedRespondent={setSelectedRespondent}
        />
      )}
    </div>
    </>
  );
}

function DeepInsightsView({ poll, analytics, filterQuestionId, setFilterQuestionId, filterOptionId, setFilterOptionId, selectedRespondent, setSelectedRespondent }) {
    const filteredRespondents = analytics?.respondents?.filter(r => {
        if (filterQuestionId === "all") return true;
        const answer = r.answers.find(a => a.questionId === filterQuestionId);
        if (filterOptionId === "all") {
            return !!answer; // Only show people who answered this question
        }
        return answer && answer.optionId === filterOptionId;
    }) || [];

    return (
        <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar / Filters & List */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-3xl border-2 border-secondary/10 shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold text-secondary text-lg">Filter Responses</h3>
                    <div className="flex flex-col gap-3">
                        <select 
                            className="w-full p-3 rounded-xl border-2 border-secondary/10 bg-primary/10 text-sm font-medium focus:outline-none focus:border-secondary"
                            value={filterQuestionId}
                            onChange={(e) => {
                                setFilterQuestionId(e.target.value);
                                setFilterOptionId("all");
                                setSelectedRespondent(null);
                            }}
                        >
                            <option value="all">All Questions</option>
                            {poll.questions.map(q => (
                                <option key={q._id} value={q._id}>{q.text}</option>
                            ))}
                        </select>
                        
                        {filterQuestionId !== "all" && (
                            <select 
                                className="w-full p-3 rounded-xl border-2 border-secondary/10 bg-primary/10 text-sm font-medium focus:outline-none focus:border-secondary animate-in fade-in zoom-in"
                                value={filterOptionId}
                                onChange={(e) => {
                                    setFilterOptionId(e.target.value);
                                    setSelectedRespondent(null);
                                }}
                            >
                                <option value="all">Any Option</option>
                                {poll.questions.find(q => q._id === filterQuestionId)?.options.map(opt => (
                                    <option key={opt._id} value={opt._id}>{opt.text}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="bg-white p-3 rounded-3xl border-2 border-secondary/10 shadow-sm flex flex-col gap-2 flex-1 overflow-y-auto max-h-[500px]">
                    <h3 className="font-bold text-secondary text-sm px-3 py-2 uppercase tracking-wider">Respondents ({filteredRespondents.length})</h3>
                    {filteredRespondents.map(respondent => (
                        <button 
                            key={respondent.id}
                            onClick={() => setSelectedRespondent(respondent)}
                            className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${selectedRespondent?.id === respondent.id ? "bg-secondary text-white shadow-md" : "hover:bg-primary/20 text-dark"}`}
                        >
                            {respondent.user.imageUrl ? (
                                <img src={respondent.user.imageUrl} className="w-10 h-10 rounded-full border-2 border-white/50 object-cover bg-white" />
                            ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center">
                                    <UserCircle2 className="w-6 h-6" />
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold truncate">{respondent.user.name}</span>
                                <span className={`text-xs truncate ${selectedRespondent?.id === respondent.id ? "text-white/70" : "text-dark/50"}`}>
                                    {new Date(respondent.votedAt).toLocaleString()}
                                </span>
                            </div>
                        </button>
                    ))}
                    {filteredRespondents.length === 0 && (
                        <div className="p-4 text-center text-dark/50 text-sm font-medium">No respondents match this filter.</div>
                    )}
                </div>
            </div>

            {/* Main Content / Respondent Details */}
            <div className="w-full md:w-2/3">
                {selectedRespondent ? (
                    <div className="bg-white p-8 rounded-3xl border-2 border-secondary/10 shadow-sm flex flex-col gap-8 h-full animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-4 border-b-2 border-secondary/10 pb-6">
                            {selectedRespondent.user.imageUrl ? (
                                <img src={selectedRespondent.user.imageUrl} className="w-16 h-16 rounded-full border-4 border-primary object-cover shadow-sm bg-white" />
                            ) : (
                                <div className="w-16 h-16 rounded-full border-4 border-primary bg-secondary/10 flex items-center justify-center shadow-sm">
                                    <UserCircle2 className="w-10 h-10 text-secondary" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-dark">{selectedRespondent.user.name}</h2>
                                <p className="text-sm font-bold text-dark/50 uppercase tracking-wider">Submitted on {new Date(selectedRespondent.votedAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <h3 className="font-black text-secondary text-xl">Submission Details</h3>
                            {poll.questions.map((q, index) => {
                                const answer = selectedRespondent.answers.find(a => a.questionId === q._id);
                                const selectedOption = answer ? q.options.find(opt => opt._id === answer.optionId) : null;
                                
                                return (
                                    <div key={q._id} className="flex flex-col gap-2 p-4 rounded-2xl bg-primary/5 border border-secondary/5">
                                        <div className="font-bold text-dark text-sm">
                                            <span className="text-secondary/50 mr-2">Q{index + 1}.</span> 
                                            {q.text}
                                        </div>
                                        {selectedOption ? (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                                <span className="font-medium text-secondary text-lg">{selectedOption.text}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-dark/20"></div>
                                                <span className="font-medium text-dark/40 italic">Skipped</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-3xl border-2 border-secondary/10 shadow-sm flex flex-col items-center justify-center gap-4 h-full min-h-[400px] text-center">
                        <div className="w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center text-secondary/40">
                            <Users className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-dark/50">Select a Respondent</h3>
                        <p className="text-sm text-dark/40 max-w-xs">Click on any user from the list to view their complete response profile.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
