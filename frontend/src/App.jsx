import { Show } from "@clerk/react";
import CreatePoll from "./pages/CreatePoll.jsx";
import VotePoll from "./pages/VotePoll.jsx";
import MyPolls from "./pages/MyPolls.jsx";
import PollAnalytics from "./pages/PollAnalytics.jsx";
import CommunityResults from "./pages/CommunityResults.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Navbar from "./components/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen bg-primary font-sans text-dark selection:bg-secondary/20">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#034F46",
            color: "#FFFFEB",
            fontWeight: 700,
            fontSize: "14px",
            borderRadius: "12px",
          },
          success: {
            iconTheme: { primary: "#FFFFEB", secondary: "#034F46" },
          },
          error: {
            style: {
              background: "#dc2626",
              color: "#fff",
            },
          },
        }}
      />

      <Navbar />

      <Routes>
        {/* Landing page — shown when signed out at root */}
        <Route
          path="/"
          element={
            <>
              <Show when="signed-out">
                <LandingPage />
              </Show>
              <Show when="signed-in">
                <main className="container mx-auto px-4 py-6 sm:py-10">
                  <CreatePoll />
                </main>
              </Show>
            </>
          }
        />

        {/* Protected pages */}
        <Route
          path="/my-polls"
          element={
            <Show when="signed-in">
              <main className="container mx-auto px-4 py-6 sm:py-10">
                <MyPolls />
              </main>
            </Show>
          }
        />

        {/* Public pages */}
        <Route path="/poll/:pollId" element={
          <main className="container mx-auto px-4 py-6 sm:py-10">
            <VotePoll />
          </main>
        } />
        <Route path="/poll/:pollId/analytics" element={
          <main className="container mx-auto px-4 py-6 sm:py-10">
            <PollAnalytics />
          </main>
        } />
        <Route path="/news" element={
          <main className="container mx-auto px-4 py-6 sm:py-10">
            <CommunityResults />
          </main>
        } />

        {/* Fallback — also show landing page */}
        <Route
          path="*"
          element={
            <Show when="signed-out">
              <LandingPage />
            </Show>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

