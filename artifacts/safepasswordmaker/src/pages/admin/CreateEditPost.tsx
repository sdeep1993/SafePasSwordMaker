import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import {
  getTags, getCategories, getPostBySlug, getAllPostsAdmin,
  createPost, updatePost, isDrupalConfigured, DrupalTaxonomyTerm,
} from "@/lib/drupal";
import { DrupalNotConfigured } from "@/components/DrupalNotConfigured";
import { cn } from "@/lib/utils";

export default function CreateEditPost() {
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [allTags, setAllTags] = useState<DrupalTaxonomyTerm[]>([]);
  const [allCats, setAllCats] = useState<DrupalTaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isDrupalConfigured()) return;
    Promise.all([getTags(), getCategories()]).then(([tags, cats]) => {
      setAllTags(tags);
      setAllCats(cats);
    });

    if (isEdit && params.id) {
      setLoading(true);
      getAllPostsAdmin().then(posts => {
        const p = posts.find(x => x.id === params.id);
        if (p) {
          setTitle(p.title);
          setContent(p.content);
          setExcerpt(p.excerpt || "");
          setImageUrl(p.image || "");
          setStatus(p.status);
          if (p.category) setCategoryId(p.category.id);
          setSelectedTags(p.tags.map(t => t.id));
        } else {
          setError("Post not found");
        }
      }).catch(() => setError("Failed to load post")).finally(() => setLoading(false));
    }
  }, [params.id, isEdit]);

  if (!isDrupalConfigured()) return <AdminLayout><DrupalNotConfigured /></AdminLayout>;

  const toggleTag = (id: string) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("Title and content are required"); return; }
    setSaving(true); setError(""); setSuccess(false);
    try {
      const payload = {
        title,
        content,
        excerpt,
        imageUrl,
        status: status === "published",
        categoryId: categoryId || undefined,
        tagIds: selectedTags,
      };
      if (isEdit && params.id) {
        await updatePost(params.id, payload);
      } else {
        await createPost(payload);
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
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </Card>

            <Card className="p-5 bg-card/60 border-border">
              <label className="block text-sm font-medium mb-1.5">
                Content * <span className="text-muted-foreground font-normal">(Markdown: ## Heading, **bold**, `code`, - list)</span>
              </label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={16}
                placeholder="Write your article here using Markdown..."
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono resize-y" />
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 bg-card/60 border-border">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
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
