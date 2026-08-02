import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, List, Star, Image as ImageIcon, MessageSquareText, Plus, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { pollService } from "../services/pollService";
import Button from "../components/ui/Button";
import { CATEGORIES } from "../constants";

const TYPES = {
  yesno: { label: "Yes / No", Icon: CircleCheck },
  single: { label: "Single Choice", Icon: List },
  rating: { label: "Rating", Icon: Star },
  image: { label: "Image", Icon: ImageIcon },
  open: { label: "Open Ended", Icon: MessageSquareText },
};

const MAX_IMAGES = 4;

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function CreatePoll() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("General");
  const [type, setType] = useState("yesno");
  const [options, setOptions] = useState(["", ""]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateOption = (i, v) => setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (i) => setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const onImageAdd = (e) => {
    const files = [...e.target.files];
    setImages((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
    e.target.value = "";
  };
  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!question.trim()) return setError("Please write a question first.");

    if (type === "single" && options.map((o) => o.trim()).filter(Boolean).length < 2) {
      return setError("Add at least 2 options.");
    }
    if (type === "image" && images.length < 2) return setError("Please add at least 2 images.");

    setSubmitting(true);
    try {
      const payload = {
        title: question.trim(),
        type,
        category,
        status: "published",
      };
      if (type === "single") payload.options = options.map((o) => o.trim()).filter(Boolean);
      if (type === "image") {
        payload.options = await Promise.all(
          images.map(async (file) => ({ text: "", image: { url: await readAsDataUrl(file) } }))
        );
      }
      await pollService.create(payload);
      toast.success("Poll published!");
      navigate("/my-polls");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create poll.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-6">Create a poll</h1>

      <form onSubmit={submit} className="glass-card p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to ask the community?"
            rows={3}
            required
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-zinc-900">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Poll type</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TYPES).map(([value, { label, Icon }]) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all border ${
                  type === value
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-muted hover:bg-surface-light"
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {type === "single" && (
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
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="p-2.5 rounded-xl hover:bg-surface-light text-muted"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-sm text-primary mt-2 hover:underline"
            >
              <Plus className="w-4 h-4" /> Add option
            </button>
          </div>
        )}

        {type === "image" && (
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Images (2–4)</label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden bg-surface-light border border-border"
                >
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    title="Remove"
                    className="absolute top-1.5 right-1.5 w-6 h-6 grid place-items-center rounded-lg bg-black/60 text-white hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="aspect-square rounded-xl border border-dashed border-border grid place-items-center cursor-pointer hover:bg-surface-light">
                  <div className="flex flex-col items-center gap-1 text-muted">
                    <Plus size={16} />
                    <span className="text-[10px] font-medium">Add</span>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={onImageAdd} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-muted mt-2">
              {images.length}/4 selected. You need at least 2. Add one at a time or many together; tap × to remove.
            </p>
          </div>
        )}

        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? "Creating..." : "Publish poll"}
        </Button>
      </form>
    </div>
  );
}
