import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Search, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import { getAllPostsAdmin, deletePost, approvePost, DrupalPost, isDrupalConfigured } from "@/lib/drupal";
import { useAuth } from "@/contexts/AuthContext";
import { DrupalNotConfigured } from "@/components/DrupalNotConfigured";
import { cn } from "@/lib/utils";

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DrupalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"all" | "pending">("all");

  const load = () => {
    setLoading(true);
    getAllPostsAdmin().then(setPosts).catch(() => setError("Failed to load posts")).finally(() => setLoading(false));
  };
  useEffect(() => { if (isDrupalConfigured()) load(); else setLoading(false); }, []);

  if (!isDrupalConfigured()) return <AdminLayout><DrupalNotConfigured /></AdminLayout>;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    try { await deletePost(id); setPosts(prev => prev.filter(p => p.id !== id)); }
    catch (err: any) { alert(err.message || "Delete failed"); }
    finally { setDeleting(null); }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const updated = await approvePost(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, approved: true } : p));
    } catch (err: any) { alert(err.message || "Failed to approve post"); }
    finally { setApproving(null); }
  };

  const pendingPosts = posts.filter(p => !p.approved && p.status === "published");
  const myId = user?.id;

  const filtered = (tab === "pending" ? pendingPosts : posts).filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = (p: DrupalPost) => user?.role === "admin" || p.author?.id === myId;

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">Posts</h1>
            <p className="text-muted-foreground text-sm">{posts.length} article{posts.length !== 1 ? "s" : ""} total</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingPosts.length > 0 && user?.role === "admin" && (
              <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5" /> {pendingPosts.length} awaiting approval
              </div>
            )}
            <Link href="/admin/posts/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> New Post
              </button>
            </Link>
          </div>
        </div>

        {user?.role === "admin" && (
          <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit">
            {(["all", "pending"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
                  tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {t === "pending" ? `Needs Approval (${pendingPosts.length})` : "All Posts"}
              </button>
            ))}
          </div>
        )}

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-card/40">
            <p className="text-muted-foreground text-sm">{search ? "No posts match your search." : tab === "pending" ? "No posts awaiting approval." : "No posts yet. Create your first one!"}</p>
            {!search && tab === "all" && <Link href="/admin/posts/new"><button className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">Create Post</button></Link>}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <Card key={post.id} className={cn("p-4 bg-card/60 hover:border-border/80 transition-all", !post.approved && "border-yellow-500/20")}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-semibold",
                        post.status === "published" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400")}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                      {!post.approved && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Needs Approval
                        </span>
                      )}
                      {post.approved && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                        </span>
                      )}
                      {post.category && <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{post.category.name}</span>}
                    </div>
                    <h3 className="font-semibold text-sm truncate">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {post.author?.name || "Unknown"} · {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {post.tags.map(t => (
                          <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                    {user?.role === "admin" && !post.approved && (
                      <button onClick={() => handleApprove(post.id)} disabled={approving === post.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                        {approving === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Approve
                      </button>
                    )}
                    {canEdit(post) && (
                      <>
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                          {deleting === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
