import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Tag { id: number; name: string }
interface Category { id: number; name: string }

export default function CreateEditPost() {
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCats, setAllCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Tag[]>("/tags"),
      api.get<Category[]>("/categories"),
    ]).then(([tags, cats]) => { setAllTags(tags); setAllCats(cats); });

    if (isEdit) {
      setLoading(true);
      api.get<any>(`/posts/${params.id}`).then(p => {
        setTitle(p.title); setContent(p.content); setExcerpt(p.excerpt || "");
        setImage(p.image || ""); setStatus(p.status);
        if (p.categoryId) setCategoryId(p.categoryId);
        if (p.tags) setSelectedTags(p.tags.map((t: Tag) => t.id));
      }).catch(() => setError("Failed to load post")).finally(() => setLoading(false));
    }
  }, [params.id, isEdit]);

  const toggleTag = (id: number) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("Title and content are required"); return; }
    setSaving(true); setError(""); setSuccess(false);
    try {
      const body = { title, content, excerpt, image, status, categoryId: categoryId || null, tagIds: selectedTags };
      if (isEdit) {
        await api.put(`/posts/${params.id}`, body);
      } else {
        await api.post("/posts", body);
      }
      setSuccess(true);
      setTimeout(() => navigate("/admin/posts"), 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <button onClick={() => navigate("/admin/posts")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Posts
        </button>
        <h1 className="text-2xl font-display font-bold mb-6">{isEdit ? "Edit Post" : "Create New Post"}</h1>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Saved! Redirecting…
              </div>
            )}

            <Card className="p-5 bg-card/60 border-border space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="My awesome article..."
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Excerpt</label>
                <input value={excerpt} onChange={e => setExcerpt(e.target.value)}
                  placeholder="Short summary shown in the blog list..."
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Hero Image URL</label>
                <input value={image} onChange={e => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </Card>

            <Card className="p-5 bg-card/60 border-border">
              <label className="block text-sm font-medium mb-1.5">Content * <span className="text-muted-foreground font-normal">(Markdown supported: ## Heading, **bold**, `code`, - list)</span></label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={16}
                placeholder="Write your article here using Markdown..."
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono resize-y" />
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 bg-card/60 border-border">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">No category</option>
                  {allCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Card>
              <Card className="p-5 bg-card/60 border-border">
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="flex gap-2">
                  {(["draft", "published"] as const).map(s => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className={cn("flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                        status === s ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-border/80")}>
                      {s}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {allTags.length > 0 && (
              <Card className="p-5 bg-card/60 border-border">
                <label className="block text-sm font-medium mb-3">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        selectedTags.includes(tag.id) ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
                      {tag.name}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Create Post"}
              </button>
              <button type="button" onClick={() => navigate("/admin/posts")}
                className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
