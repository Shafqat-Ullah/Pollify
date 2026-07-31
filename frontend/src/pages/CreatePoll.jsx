import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { pollService } from "../services/pollService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const TYPES = [
  { value: "single", label: "Single Choice" },
  { value: "multiple", label: "Multiple Choice" },
  { value: "text", label: "Text Poll" },
];

export default function CreatePoll() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  const updateOption = (i, value) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  };
  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (i) => setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (status) => {
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim()) return toast.error("Give your poll a title.");
    if (cleanOptions.length < 2) return toast.error("Add at least 2 options.");

    setLoading(true);
    try {
      const { data } = await pollService.create({
        title: title.trim(),
        description: description.trim(),
        type,
        options: cleanOptions,
        isAnonymous,
        expiresAt: expiresAt || undefined,
        status,
      });
      toast.success(status === "published" ? "Poll published!" : "Draft saved.");
      navigate(`/polls/${data.poll._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create poll.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-6">Create a poll</h1>

      <div className="glass-card p-6 space-y-5">
        <Input label="Title" placeholder="What should we ask?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add context for your poll..."
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Poll type</label>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Options</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="input-field flex-1"
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="p-2.5 rounded-xl hover:bg-surface-light text-muted">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addOption} className="flex items-center gap-1.5 text-sm text-primary mt-2 hover:underline">
            <Plus className="w-4 h-4" /> Add option
          </button>
        </div>

        <Input
          label="Expires at (optional)"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="accent-emerald-500" />
          Make this poll anonymous
        </label>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={() => submit("draft")} loading={loading} className="flex-1">
            Save as draft
          </Button>
          <Button onClick={() => submit("published")} loading={loading} className="flex-1">
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
