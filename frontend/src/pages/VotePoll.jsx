import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, Show, SignInButton, useUser } from "@clerk/react";
import { pollService } from "../services/pollService";
import { Button } from "../components/Button";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export default function VotePoll() {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [voted, setVoted] = useState(false);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [socket, setSocket] = useState(null);
  
  // Stable ID for anonymous users during the session
  const anonymousId = React.useMemo(() => `anon-${Math.random().toString(36).substring(2, 11)}`, []);

  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL || "http://localhost:3000");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await pollService.getPoll(pollId);
        setPoll(response.data);
        if (response.data.isPublished) {
           const analyticsRes = await pollService.getPollAnalytics(pollId, getToken);
           setAnalytics(analyticsRes.data);
        }
        
        // Check localStorage for previous vote
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        if (votedPolls[pollId]) {
            setHasAlreadyVoted(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  const handleOptionToggle = (questionId, optionId) => {
    const oldOptionId = answers[questionId];
    
    const userInfo = user ? {
      id: user.id,
      name: user.fullName || user.username || "Anonymous",
      imageUrl: user.imageUrl
    } : { id: anonymousId, name: "Anonymous", imageUrl: null };

    if (oldOptionId === optionId) {
      // Deselect the current option
      const newAnswers = { ...answers };
      delete newAnswers[questionId];
      setAnswers(newAnswers);

      if (socket && !hasAlreadyVoted && !voted) {
        socket.emit("liveToggle", { pollId, questionId, optionId: oldOptionId, user: userInfo, action: "deselect" });
      }
    } else {
      // Select new option
      setAnswers({ ...answers, [questionId]: optionId });

      if (socket && !hasAlreadyVoted && !voted) {
        if (oldOptionId) {
          socket.emit("liveToggle", { pollId, questionId, optionId: oldOptionId, user: userInfo, action: "deselect" });
        }
        socket.emit("liveToggle", { pollId, questionId, optionId, user: userInfo, action: "select" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const missingRequired = poll.questions.find(q => q.isRequired && !answers[q._id]);
    if (missingRequired) {
      toast.error(`Please answer the mandatory question: "${missingRequired.text}"`);
      return;
    }

    setSubmitting(true);
    try {
      const voteData = {
        answers: Object.entries(answers).map(([qId, oId]) => ({
          questionId: qId,
          optionId: oId,
        })),
      };
      await pollService.submitVote(pollId, voteData, getToken);
      setVoted(true);
      
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      votedPolls[pollId] = true;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
      
      toast.success("Vote submitted successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
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
        <Button className="mt-6" onClick={() => navigate("/")}>Go Home</Button>
    </div>
  );

  const isAuthRequired = poll.requiresAuth;
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const isPublished = poll.isPublished;

  if (isPublished && analytics) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-secondary">{poll.title} (Results)</h1>
          <p className="text-dark/60 mt-2">Total Responses: {analytics.totalResponses}</p>
        </header>
        <div className="flex flex-col gap-6">
          {analytics.questions.map((q) => (
            <div key={q.questionId} className="bg-white p-6 rounded-2xl border-2 border-secondary/10 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-secondary text-lg">{q.text}</h3>
              <p className="text-xs text-dark/50 mb-2">{q.totalAnswers} answers</p>
              <div className="flex flex-col gap-3">
                {q.options.map((opt, i) => {
                  const percentage = q.totalAnswers > 0 ? Math.round((opt.count / q.totalAnswers) * 100) : 0;
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-dark">{opt.text}</span>
                        <span className="text-secondary font-bold">{percentage}% ({opt.count})</span>
                      </div>
                      <div className="w-full bg-primary/20 rounded-full h-2.5">
                        <div className="bg-secondary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (voted || hasAlreadyVoted) return (
    <div className="max-w-xl mx-auto p-8 mt-10 bg-white rounded-3xl border-2 border-secondary shadow-2xl text-center flex flex-col gap-6">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-secondary">✅</span>
        </div>
        <h2 className="text-3xl font-bold text-secondary">Thank You!</h2>
        <p className="text-dark/70">Your vote has been recorded successfully.</p>
        {hasAlreadyVoted && !voted && (
            <p className="text-xs text-orange-500 font-bold">You have already voted on this poll previously.</p>
        )}
        <Button className="mt-4" onClick={() => navigate("/")}>Create Your Own Poll</Button>
    </div>
  );

  if (isExpired || !poll.isActive) {
    return (
      <div className="max-w-xl mx-auto p-8 mt-10 bg-white rounded-3xl border-2 border-secondary/20 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-secondary">Poll Closed</h2>
        <p className="text-dark/70 mt-2">This poll is no longer accepting responses.</p>
        <Button className="mt-6" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const PollForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {poll.questions.map((question) => (
        <div key={question._id} className="bg-white p-6 rounded-2xl border-2 border-secondary/10 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-secondary text-lg">
            {question.text} {question.isRequired && <span className="text-red-500">*</span>}
          </h3>
          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <label 
                key={option._id} 
                className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-secondary/20 hover:bg-primary/10 cursor-pointer transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  handleOptionToggle(question._id, option._id);
                }}
              >
                <input
                  type="radio"
                  name={question._id}
                  className="w-4 h-4 text-secondary focus:ring-secondary border-secondary/30 pointer-events-none"
                  readOnly
                  checked={answers[question._id] === option._id}
                />
                <span className="text-dark/80 font-medium">{option.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Vote"}
      </Button>
    </form>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-secondary">{poll.title}</h1>
        <p className="text-dark/60 mt-2">By {poll.createdBy?.firstName} {poll.createdBy?.lastName}</p>
      </header>

      {isAuthRequired ? (
        <>
          <Show when="signed-in">
            <PollForm />
          </Show>
          <Show when="signed-out">
            <div className="bg-primary/20 p-8 rounded-3xl border-2 border-secondary/10 text-center flex flex-col gap-4">
              <h3 className="text-xl font-bold text-secondary">Authentication Required</h3>
              <p className="text-dark/70">The creator of this poll requires you to sign in before voting.</p>
              <div className="mt-2">
                <SignInButton mode="modal">
                  <Button>Sign In to Vote</Button>
                </SignInButton>
              </div>
            </div>
          </Show>
        </>
      ) : (
        <PollForm />
      )}
    </div>
  );
}
