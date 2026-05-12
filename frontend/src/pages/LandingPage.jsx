import { SignUpButton, SignInButton } from "@clerk/react";
import { useState } from "react";
import { Button } from "../components/Button";
import { Link } from "react-router-dom";
import {
  ShieldCheck, BarChart3, Zap, Share2, Users, Lock,
  ArrowRight, CheckCircle, ChevronDown
} from "lucide-react";

const FEATURES = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "from-emerald-400 to-teal-600",
    bg: "bg-emerald-50",
    textColor: "text-emerald-700",
    title: "Secure & Authenticated",
    desc: "Clerk-powered login ensures real respondents. Enable required auth or allow anonymous votes — your call.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: "from-blue-400 to-indigo-600",
    bg: "bg-blue-50",
    textColor: "text-blue-700",
    title: "Deep Analytics",
    desc: "Rich breakdowns per question, per voter. Filter by answer, see who voted what, and publish results publicly.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "from-amber-400 to-orange-600",
    bg: "bg-amber-50",
    textColor: "text-amber-700",
    title: "Real-Time Updates",
    desc: "WebSocket-powered live vote counting. Watch results update instantly without ever refreshing the page.",
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    color: "from-pink-400 to-rose-600",
    bg: "bg-pink-50",
    textColor: "text-pink-700",
    title: "Instant Sharing",
    desc: "One-click shareable links and downloadable QR codes. Share anywhere — WhatsApp, email, social media.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: "from-violet-400 to-purple-600",
    bg: "bg-violet-50",
    textColor: "text-violet-700",
    title: "Community Board",
    desc: "Publish results for the world to see. Explore trending polls from creators worldwide on the community board.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    color: "from-slate-400 to-gray-600",
    bg: "bg-slate-50",
    textColor: "text-slate-700",
    title: "IP-Based Fraud Prevention",
    desc: "Even anonymous votes are tracked by IP to prevent ballot stuffing. One vote per person, always.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create Your Poll", desc: "Set your questions, configure options like auth requirements, expiry time, and whether votes are anonymous." },
  { step: "02", title: "Share The Link", desc: "Get a shareable URL and a QR code instantly. Send it anywhere — social media, email, WhatsApp, or embed it." },
  { step: "03", title: "Watch Results Live", desc: "See votes pour in real-time via WebSockets. Dive into per-option analytics and individual respondent details." },
  { step: "04", title: "Publish & Celebrate", desc: "Publish your final results to the community board for everyone to see, or keep them private forever." },
];

const STATS = [
  { value: "100%", label: "Free to use" },
  { value: "Real-time", label: "WebSocket updates" },
  { value: "IP-Protected", label: "Fraud prevention" },
  { value: "∞", label: "Polls you can create" },
];

const DEMO_OPTIONS = [
  { label: "React + Node.js", pct: 42 },
  { label: "Next.js + Prisma", pct: 28 },
  { label: "Vue + Django", pct: 18 },
  { label: "Angular + .NET", pct: 12 },
];

function DemoPoll() {
  const [selected, setSelected] = useState(0);
  const [voted, setVoted] = useState(false);

  const handleVote = () => {
    if (selected !== null) setVoted(true);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {DEMO_OPTIONS.map((opt, i) => (
          <div
            key={opt.label}
            onClick={() => !voted && setSelected(i)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${voted
              ? selected === i
                ? "border-secondary bg-secondary/8 cursor-default"
                : "border-secondary/10 cursor-default opacity-70"
              : selected === i
                ? "border-secondary bg-secondary/5 cursor-pointer shadow-sm"
                : "border-secondary/10 hover:border-secondary/40 cursor-pointer"
              }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected === i ? "border-secondary" : "border-dark/20"
              }`}>
              {selected === i && <div className="w-2 h-2 rounded-full bg-secondary" />}
            </div>
            <span className={`font-semibold text-sm transition-colors ${selected === i ? "text-secondary" : "text-dark/60"
              }`}>{opt.label}</span>
            {voted && (
              <div className="ml-auto flex items-center gap-2">
                <div className="h-1.5 rounded-full bg-secondary/20 w-16 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-700"
                    style={{ width: `${opt.pct}%` }}
                  />
                </div>
                <span className="text-xs text-secondary font-bold w-8 text-right">{opt.pct}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleVote}
        disabled={voted}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${voted
          ? "bg-green-600 text-white cursor-default"
          : "bg-secondary text-primary hover:opacity-90 cursor-pointer shadow-md"
          }`}
      >
        {voted ? "✓ Vote Recorded! (Demo)" : "Submit Vote →"}
      </button>
    </>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-10 pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-blue-400/8 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-secondary/5 rounded-full blur-[80px]" />
          {/* Floating dots */}
          <div className="absolute top-1/4 left-[10%] w-3 h-3 rounded-full bg-secondary/20 animate-[bounce_3s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 right-[12%] w-2 h-2 rounded-full bg-blue-400/30 animate-[bounce_4s_ease-in-out_infinite_0.5s]" />
          <div className="absolute bottom-1/3 left-[15%] w-2 h-2 rounded-full bg-secondary/15 animate-[bounce_5s_ease-in-out_infinite_1s]" />
          <div className="absolute top-2/3 right-[20%] w-4 h-4 rounded-full bg-amber-400/15 animate-[bounce_3.5s_ease-in-out_infinite_1.5s]" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#034F46 1px, transparent 1px), linear-gradient(90deg, #034F46 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 text-secondary font-bold px-4 py-1.5 rounded-full text-sm tracking-wide uppercase animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Now with live leaderboard
          </div>

          <h1 className="hero-heading text-secondary leading-none">
            Polls that{" "}
            <span
              className="relative inline-block"
              style={{
                WebkitTextStroke: "2px #034F46",
                color: "transparent",
              }}
            >
              Actually
            </span>
            <br />
            <span className="italic">Matter.</span>
          </h1>

          <p className="text-dark/60 text-xl leading-relaxed max-w-2xl font-normal">
            Create beautiful, secure, real-time polls in seconds. Share with anyone via link or QR code.
            Get deep analytics on every response.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <SignUpButton mode="modal">
              <button className="group inline-flex items-center gap-2 bg-secondary text-primary px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-1 transition-all duration-300">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <Link to="/news">
              <button className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border-2 border-secondary/15 text-secondary px-8 py-4 rounded-2xl font-bold text-lg hover:border-secondary/40 hover:bg-white transition-all duration-300">
                Explore Community
              </button>
            </Link>
          </div>

          {/* Mini-checklist */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            {["No credit card required", "Unlimited polls", "Real-time results", "Fully free"].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-dark/50 text-sm font-semibold">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-secondary/30 animate-bounce">
          <span className="text-xs font-bold uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      <section className="bg-secondary py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center group cursor-default">
              <p className="text-[#fff] text-3xl font-black font-heading group-hover:scale-110 transition-transform duration-300 inline-block">{s.value}</p>
              <p className="text-[#ffffff80] text-xs font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-secondary/60 font-bold uppercase tracking-widest text-sm">Everything You Need</span>
            <h2 className="text-5xl font-heading text-secondary mt-3">Built for real results.</h2>
            <p className="text-dark/50 mt-4 text-lg max-w-xl mx-auto font-normal">
              Every feature you'd expect from an enterprise poll tool — for free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group bg-white p-8 rounded-3xl border border-secondary/8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 ${f.bg} ${f.textColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{f.title}</h3>
                <p className="text-dark/55 text-sm leading-relaxed font-normal">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-secondary/60 font-bold uppercase tracking-widest text-sm">How It Works</span>
            <h2 className="text-5xl font-heading text-secondary mt-3">From zero to insights.</h2>
            <p className="text-dark/50 mt-4 text-lg max-w-xl mx-auto font-normal">
              Four simple steps from creating a poll to publishing results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                className="flex gap-5 p-6 rounded-3xl border border-secondary/8 bg-primary/30 hover:bg-white hover:shadow-lg transition-all duration-300 group"
              >
                <div className="shrink-0 w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-primary font-black text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-secondary text-lg">{item.title}</h3>
                  <p className="text-dark/55 text-sm mt-1 leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAKE POLL PREVIEW ────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-secondary/60 font-bold uppercase tracking-widest text-sm">Live Demo Preview</span>
            <h2 className="text-5xl font-heading text-secondary">See it in action.</h2>
            <p className="text-dark/55 text-lg leading-relaxed font-normal">
              This is what your voters see. Clean, distraction-free, works on every device.
              No login screens unless you want them.
            </p>
            <div className="flex flex-col gap-3">
              {["Multiple questions in one poll", "Progress saved automatically", "Works on mobile, tablet & desktop", "Instant confirmation on submit"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-dark/70 font-semibold text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <SignUpButton mode="modal">
              <button className="self-start inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                Create Your First Poll
                <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
          </div>

          {/* Interactive demo poll card */}
          <div className="bg-white rounded-3xl border-2 border-secondary/10 shadow-2xl p-8 flex flex-col gap-6 animate-float">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-primary font-black text-sm">P</span>
              </div>
              <span className="font-black text-secondary">Pollify</span>
              <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Active</span>
            </div>

            <div>
              <h3 className="font-bold text-secondary text-xl">What's your preferred tech stack?</h3>
              <p className="text-dark/50 text-sm mt-1">Question 1 of 2 · Required</p>
            </div>

            <DemoPoll />
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div
            style={{
              backgroundImage: "linear-gradient(#FFFFEB 1px, transparent 1px), linear-gradient(90deg, #FFFFEB 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <h2 className="text-6xl font-heading text-[#fff] leading-tight">
            Ready to poll
            <br />
            <span className="italic">the world?</span>
          </h2>
          <p className="text-[#ffffffb3] text-lg font-normal max-w-lg">
            Join Pollify today. Create your first poll in under 60 seconds.
            No credit card. No setup. Just polls.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="group inline-flex items-center gap-2 bg-primary text-secondary px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white transition-colors shadow-xl">
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <Link to="/news">
              <button className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-primary px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors">
                Browse Community
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-secondary/5 border-t border-secondary/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-primary font-black text-sm">P</span>
            </div>
            <span className="font-black text-secondary text-lg">Pollify</span>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-dark/50">
            <Link to="/news" className="hover:text-secondary transition-colors">Community</Link>
            <SignInButton mode="modal">
              <button className="hover:text-secondary transition-colors">Sign In</button>
            </SignInButton>
          </div>
          <p className="text-dark/40 text-sm font-normal">
            © {new Date().getFullYear()} Pollify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
