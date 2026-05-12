import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Link } from "react-router-dom";
import { pollService } from "../services/pollService";
import { Button } from "../components/Button";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, QrCode, ExternalLink, BarChart2, Download, Image as ImageIcon, Check } from "lucide-react";

export default function MyPolls() {
  const { getToken } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [qrCopied, setQrCopied] = useState(null); // pollId

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await pollService.getCreatorPolls(getToken);
        setPolls(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [getToken]);

  const handleClose = async (pollId) => {
    if (!window.confirm("Are you sure you want to close this poll? This will stop all voting.")) return;
    
    try {
      await pollService.closePoll(pollId, getToken);
      setPolls(polls.map(p => p._id === pollId ? { ...p, isActive: false } : p));
      toast.success("Poll closed!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
    </div>
  );

  if (error) return (
    <div className="text-center p-8 text-red-500 font-bold">{error}</div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">My Polls</h1>
          <p className="text-dark/60 mt-1">Manage your created polls and view insights.</p>
        </div>
        <Link to="/">
          <Button>+ Create New</Button>
        </Link>
      </header>

      {polls.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-secondary/10 shadow-sm">
          <p className="text-dark/50">You haven't created any polls yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {polls.map(poll => {
            const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
            const statusText = poll.isPublished ? "Published" : (isExpired || !poll.isActive ? "Closed" : "Active");
            const statusColor = poll.isPublished ? "bg-blue-100 text-blue-700" : (isExpired || !poll.isActive ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700");

            return (
              <div key={poll._id} className="bg-white p-6 rounded-2xl border border-secondary/10 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-lg text-secondary line-clamp-2">{poll.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
                
                <div className="text-xs text-dark/50 flex flex-col gap-1 mt-auto">
                  <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
                  {poll.expiresAt && <span>Expires: {new Date(poll.expiresAt).toLocaleString()}</span>}
                </div>

                <div className="flex gap-2 mt-4">
                  <Link to={`/poll/${poll._id}/analytics`} className="flex-1">
                    <Button variant="secondary" className="w-full text-sm flex items-center justify-center gap-2">
                      <BarChart2 size={16} /> Details
                    </Button>
                  </Link>
                  <div className="flex gap-2 flex-1">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-sm bg-primary/20 hover:bg-primary/40 text-secondary border-none p-2"
                      onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/poll/${poll._id}`);
                          toast.success("Link copied!");
                      }}
                      title="Copy Link"
                    >
                      <Copy size={16} className="mx-auto" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`flex-1 text-sm border-none p-2 transition-colors ${showQR === poll._id ? 'bg-secondary text-primary' : 'bg-primary/20 hover:bg-primary/40 text-secondary'}`}
                      onClick={() => setShowQR(showQR === poll._id ? null : poll._id)}
                      title="Show QR Code"
                    >
                      <QrCode size={16} className="mx-auto" />
                    </Button>
                    {poll.isActive && !poll.isPublished && !isExpired && (
                      <Button 
                        variant="outline" 
                        className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 border-none p-2"
                        onClick={() => handleClose(poll._id)}
                        title="Close Poll"
                      >
                        <span className="text-[10px] font-black">CLOSE</span>
                      </Button>
                    )}
                  </div>
                </div>

                {showQR === poll._id && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-secondary/10 flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-300">
                    <div id={`qr-container-${poll._id}`} className="bg-white p-2 rounded-lg shadow-sm">
                      <QRCodeCanvas 
                        value={`${window.location.origin}/poll/${poll._id}`} 
                        size={120}
                        includeMargin={true}
                      />
                    </div>
                    <div className="flex gap-4 mt-3">
                        <button 
                            onClick={async () => {
                                const container = document.getElementById(`qr-container-${poll._id}`);
                                const canvas = container?.querySelector('canvas');
                                if (!canvas) return;
                                canvas.toBlob(async (blob) => {
                                    try {
                                        const data = [new ClipboardItem({ "image/png": blob })];
                                        await navigator.clipboard.write(data);
                                        setQrCopied(poll._id);
                                        toast.success("QR copied as image!");
                                        setTimeout(() => setQrCopied(null), 2000);
                                    } catch (err) {
                                        toast.error("Failed to copy image.");
                                    }
                                });
                            }} 
                            className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline"
                        >
                            {qrCopied === poll._id ? <Check size={12} /> : <ImageIcon size={12} />} COPY
                        </button>
                        <button 
                            onClick={() => {
                                const container = document.getElementById(`qr-container-${poll._id}`);
                                const canvas = container?.querySelector('canvas');
                                if (!canvas) return;
                                const url = canvas.toDataURL("image/png");
                                const link = document.createElement("a");
                                link.download = `poll-qr-${poll._id}.png`;
                                link.href = url;
                                link.click();
                                toast.success("QR downloaded!");
                            }} 
                            className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline"
                        >
                            <Download size={12} /> DOWNLOAD
                        </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
