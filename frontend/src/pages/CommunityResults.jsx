import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pollService } from "../services/pollService";
import { Button } from "../components/Button";
import { Search, Users, Trophy, ChevronRight, UserCircle2, Calendar } from "lucide-react";

export default function CommunityResults() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const fetchPolls = async (query = "") => {
    setLoading(true);
    try {
      const response = await pollService.getPublishedPolls(query);
      setPolls(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPolls(search);
  };

  if (error) return (
    <div className="text-center p-8 text-red-500 font-bold">{error}</div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-10">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black text-secondary tracking-tight">Community Results</h1>
        <p className="text-dark/60 text-lg max-w-2xl mx-auto">
          Explore what the world is thinking. Browse through published poll results and discover community insights.
        </p>
      </header>

      <div className="relative max-w-2xl mx-auto w-full">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            placeholder="Search polls by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-32 py-5 bg-white rounded-3xl border-2 border-secondary/10 shadow-xl focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all text-lg font-medium outline-none"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-secondary transition-colors" size={28} />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-secondary text-primary px-6 py-2.5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-md"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary"></div>
          <p className="font-bold text-secondary animate-pulse">Fetching latest insights...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.length === 0 ? (
            <div className="col-span-full text-center p-20 bg-white rounded-[40px] border-2 border-dashed border-secondary/20">
               <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary/40">
                  <Search size={40} />
               </div>
               <h3 className="text-2xl font-bold text-secondary">No published polls found</h3>
               <p className="text-dark/50 mt-2">Try a different search term or check back later.</p>
            </div>
          ) : (
            polls.map(poll => (
              <div key={poll._id} className="group bg-white p-1 rounded-[32px] border-2 border-secondary/5 shadow-sm hover:shadow-2xl hover:border-secondary/20 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                <div className="p-6 flex flex-col h-full gap-5">
                    <div className="flex justify-between items-start">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                           Published
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-dark/40">
                            <Calendar size={14} />
                            {new Date(poll.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-secondary line-clamp-2 min-h-14 group-hover:text-dark transition-colors">
                        {poll.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-secondary/5">
                        {poll.createdBy?.imageUrl ? (
                            <img src={poll.createdBy.imageUrl} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border-2 border-white shadow-sm">
                                <UserCircle2 size={24} />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-secondary/40 uppercase tracking-tighter">Created By</span>
                            <span className="text-sm font-bold text-dark">{poll.createdBy?.firstName} {poll.createdBy?.lastName}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <Link to={`/poll/${poll._id}/analytics`} className="flex-1">
                            <Button className="w-full rounded-2xl group/btn flex items-center justify-center gap-2 py-3">
                                View Results <Trophy size={18} className="group-hover/btn:rotate-12 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && polls.length > 0 && (
          <footer className="text-center py-10 border-t-2 border-secondary/5 mt-10">
              <p className="text-dark/40 font-bold text-sm">Showing {polls.length} community insights</p>
          </footer>
      )}
    </div>
  );
}
