import { useState } from "react";
import { useAuth } from "@clerk/react";
import { pollService } from "../services/pollService";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, ExternalLink, Download, Image as ImageIcon, Trophy } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePoll() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdPollId, setCreatedPollId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const qrRef = useRef(null);
  const [title, setTitle] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", isRequired: false, options: [{ text: "" }, { text: "" }] },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { text: "", isRequired: false, options: [{ text: "" }, { text: "" }] }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ text: "" });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(newQuestions);
  };

  const updateQuestionText = (index, text) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const updateQuestionRequired = (index, isRequired) => {
    const newQuestions = [...questions];
    newQuestions[index].isRequired = isRequired;
    setQuestions(newQuestions);
  };

  const updateOptionText = (qIndex, oIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = text;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { title, questions, requiresAuth, isAnonymous };
      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString();
      }
      const response = await pollService.createPoll(payload, getToken);
      setCreatedPollId(response.data._id);
      setTitle("");
      setRequiresAuth(false);
      setIsAnonymous(false);
      setExpiresAt("");
      setQuestions([{ text: "", isRequired: false, options: [{ text: "" }, { text: "" }] }]);
      toast.success("Poll created successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (createdPollId) {
    const shareUrl = `${window.location.origin}/poll/${createdPollId}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyQR = async () => {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return;

      try {
        canvas.toBlob(async (blob) => {
          try {
            const data = [new ClipboardItem({ "image/png": blob })];
            await navigator.clipboard.write(data);
            setQrCopied(true);
            toast.success("QR Code copied as image!");
            setTimeout(() => setQrCopied(false), 2000);
          } catch (err) {
            toast.error("Failed to copy image. Try downloading instead.");
          }
        });
      } catch (err) {
        toast.error("Error generating image.");
      }
    };

    const handleDownloadQR = () => {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `poll-qr-${createdPollId}.png`;
      link.href = url;
      link.click();
      toast.success("QR Code downloaded!");
    };

    return (
      <div className="max-w-xl mx-auto p-8 mt-10 bg-white rounded-3xl border-2 border-secondary shadow-2xl text-center flex flex-col gap-6">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">🎉</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-secondary">Poll Created!</h2>
          <p className="text-dark/70 mt-1">Your poll is live and ready for responses.</p>
        </div>

        <div className="flex flex-col gap-6 items-center">
          {/* QR Code Section */}
          <div className="flex flex-col items-center gap-3">
            <div ref={qrRef} className="p-4 bg-white rounded-2xl border-2 border-secondary/10 shadow-sm relative group">
              <QRCodeCanvas
                value={shareUrl}
                size={180}
                level="H"
                includeMargin={true}
                className="mx-auto"
              />
              <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-4">
                <button
                  onClick={handleCopyQR}
                  className="p-3 bg-white text-secondary rounded-full hover:scale-110 transition-transform"
                  title="Copy QR as Image"
                >
                  {qrCopied ? <Check size={24} /> : <ImageIcon size={24} />}
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="p-3 bg-white text-secondary rounded-full hover:scale-110 transition-transform"
                  title="Download QR Image"
                >
                  <Download size={24} />
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleCopyQR} className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline">
                {qrCopied ? <Check size={12} /> : <ImageIcon size={12} />} COPY QR
              </button>
              <button onClick={handleDownloadQR} className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline">
                <Download size={12} /> DOWNLOAD QR
              </button>
            </div>
          </div>

          {/* Link Section */}
          <div className="w-full bg-primary/30 p-4 rounded-xl border border-secondary/20 flex flex-col gap-3">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider block text-left">Shareable Link</span>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-white/50 border-none outline-none text-left font-mono text-sm p-3 rounded-lg overflow-hidden text-ellipsis"
              />
              <button
                onClick={handleCopy}
                className="bg-secondary text-primary p-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center min-w-[48px]"
                title="Copy Link"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <Button className="flex items-center justify-center gap-2" onClick={() => window.open(shareUrl, '_blank')}>
              View Poll <ExternalLink size={18} />
            </Button>
            <Button variant="secondary" className="flex items-center justify-center gap-2" onClick={() => navigate(`/poll/${createdPollId}/analytics`)}>
              Leaderboard <Trophy size={18} />
            </Button>
          </div>
          <Button variant="outline" className="border-none bg-primary/10 text-secondary hover:bg-primary/30" onClick={() => {
            setCreatedPollId(null);
            setCopied(false);
            setQrCopied(false);
          }}>
            Create Another Poll
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-secondary">Create a New Poll</h1>
        <p className="text-dark/60 mt-2">Gather insights from your community in seconds.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-white p-6 rounded-2xl border-2 border-secondary/10 shadow-sm flex flex-col gap-6">
          <Input
            label="Poll Title"
            placeholder="e.g., Which coffee do you prefer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-3 p-4 bg-primary/20 rounded-xl border border-secondary/5">
            <div className="flex items-center gap-3">
              <input
                id="requiresAuth"
                type="checkbox"
                checked={requiresAuth}
                onChange={(e) => setRequiresAuth(e.target.checked)}
                className="w-5 h-5 rounded border-secondary text-secondary focus:ring-secondary"
              />
              <label htmlFor="requiresAuth" className="text-sm font-semibold text-secondary cursor-pointer flex flex-col">
                Require Authentication
                <span className="text-xs font-normal text-dark/50">Users must sign in with before voting.</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="isAnonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded border-secondary text-secondary focus:ring-secondary"
              />
              <label htmlFor="isAnonymous" className="text-sm font-semibold text-secondary cursor-pointer flex flex-col">
                Anonymous Responses
                <span className="text-xs font-normal text-dark/50">Hide user identities in the results, even if authenticated.</span>
              </label>
            </div>
          </div>

          <Input
            label="Expiry Time (Optional)"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-6">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-2xl border-2 border-secondary/10 shadow-sm flex flex-col gap-4 relative group">
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold"
                >
                  Remove
                </button>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    label={`Question ${qIndex + 1}`}
                    placeholder="Enter your question"
                    value={question.text}
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id={`required-${qIndex}`}
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={(e) => updateQuestionRequired(qIndex, e.target.checked)}
                    className="w-4 h-4 rounded border-secondary text-secondary focus:ring-secondary"
                  />
                  <label htmlFor={`required-${qIndex}`} className="text-sm font-semibold text-secondary cursor-pointer">
                    Mandatory
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-secondary">Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Option ${oIndex + 1}`}
                      value={option.text}
                      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                      required
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-red-400 hover:text-red-600 px-2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="text-secondary text-sm font-bold mt-2 hover:underline w-fit"
                >
                  + Add Option
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-secondary/10 sticky bottom-6 shadow-lg">
          <Button type="button" variant="secondary" onClick={addQuestion}>
            + Add Question
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Poll"}
          </Button>
        </div>
      </form>
    </div>
  );
}
