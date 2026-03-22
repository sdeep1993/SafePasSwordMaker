import React, { useEffect, useState } from "react";
import { Tag as TagIcon, Plus, Pencil, Trash2, Loader2, Check, X, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

interface Tag { id: number; name: string; slug: string }

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.get<Tag[]>("/tags").then(setTags).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addTag = async () => {
    if (!newName.trim()) return;
    setAdding(true); setError("");
    try {
      const tag = await api.post<Tag>("/tags", { name: newName.trim() });
      setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (err: any) { setError(err.message || "Failed to add tag"); }
    finally { setAdding(false); }
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(true); setError("");
    try {
      const tag = await api.put<Tag>(`/tags/${id}`, { name: editName.trim() });
      setTags(prev => prev.map(t => t.id === id ? tag : t));
      setEditId(null);
    } catch (err: any) { setError(err.message || "Failed to update tag"); }
    finally { setSaving(false); }
  };

  const deleteTag = async (id: number) => {
    if (!confirm("Delete this tag?")) return;
    await api.delete(`/tags/${id}`);
    setTags(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">Tags</h1>
          <p className="text-muted-foreground text-sm">{tags.length} tag{tags.length !== 1 ? "s" : ""}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Add tag */}
        <Card className="p-4 bg-card/60 border-border mb-5">
          <label className="block text-sm font-medium mb-2">Add New Tag</label>
          <div className="flex gap-2">
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTag()}
              placeholder="Tag name..."
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button onClick={addTag} disabled={adding || !newName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add
            </button>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : tags.length === 0 ? (
          <Card className="p-10 text-center bg-card/40">
            <TagIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No tags yet. Add one above.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {tags.map(tag => (
              <Card key={tag.id} className="px-4 py-3 bg-card/60 flex items-center gap-3">
                <TagIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                {editId === tag.id ? (
                  <>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(tag.id); if (e.key === "Escape") setEditId(null); }}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <button onClick={() => saveEdit(tag.id)} disabled={saving}
                      className="p-1.5 rounded hover:bg-green-500/10 text-green-400 transition-colors">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditId(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">{tag.name}</span>
                    <span className="text-xs text-muted-foreground font-mono hidden sm:block">{tag.slug}</span>
                    <button onClick={() => { setEditId(tag.id); setEditName(tag.name); }}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteTag(tag.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
