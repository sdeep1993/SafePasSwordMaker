import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Post {
  id: number; title: string; slug: string; status: string; excerpt?: string;
  createdAt: string; updatedAt: string; authorId?: number;
  category?: { id: number; name: string } | null;
  tags?: { id: number; name: string }[];
  author?: { id: number; username: string } | null;
}

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get<Post[]>("/posts").then(setPosts).catch(() => setError("Failed to load posts")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = (p: Post) => user?.role === "admin" || p.authorId === user?.id;

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">Posts</h1>
            <p className="text-muted-foreground text-sm">{posts.length} article{posts.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link href="/admin/posts/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> New Post
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
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
            <p className="text-muted-foreground text-sm">{search ? "No posts match your search." : "No posts yet. Create your first one!"}</p>
            {!search && <Link href="/admin/posts/new"><button className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">Create Post</button></Link>}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <Card key={post.id} className="p-4 bg-card/60 hover:border-border/80 transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full font-semibold",
                        post.status === "published" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                      )}>
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                      {post.category && <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{post.category.name}</span>}
                    </div>
                    <h3 className="font-semibold text-sm truncate">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {post.author?.username || "Unknown"} · {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {post.tags.map(t => (
                          <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {canEdit(post) && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Link>
                      <button onClick={() => deletePost(post.id)} disabled={deleting === post.id}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                        {deleting === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
