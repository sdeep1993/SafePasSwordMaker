import React, { useEffect, useState } from "react";
import { FolderOpen, Plus, Pencil, Trash2, Loader2, Check, X, AlertCircle, ShieldAlert } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import { getCategories, createTerm, updateTerm, deleteTerm, isDrupalConfigured, DrupalTaxonomyTerm } from "@/lib/drupal";
import { useAuth } from "@/contexts/AuthContext";
import { DrupalNotConfigured } from "@/components/DrupalNotConfigured";

export default function Categories() {
  const { user } = useAuth();
  const [cats, setCats] = useState<DrupalTaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getCategories().then(setCats).catch(() => setError("Failed to load categories")).finally(() => setLoading(false));
  };
  useEffect(() => { if (isDrupalConfigured()) load(); else setLoading(false); }, []);

  if (!isDrupalConfigured()) return <AdminLayout><DrupalNotConfigured /></AdminLayout>;

  if (user?.role !== "admin") {
    return (
      <AdminLayout>
        <Card className="p-12 text-center max-w-md bg-card/60">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="font-bold mb-1">Admin Only</h2>
          <p className="text-sm text-muted-foreground">Only administrators can manage categories.</p>
        </Card>
      </AdminLayout>
    );
  }

  const addCat = async () => {
    if (!newName.trim()) return;
    setAdding(true); setError("");
    try {
      const cat = await createTerm("categories", newName.trim());
      setCats(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (err: any) { setError(err.message || "Failed to add category"); }
    finally { setAdding(false); }
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true); setError("");
    try {
      const cat = await updateTerm("categories", id, editName.trim());
      setCats(prev => prev.map(c => c.id === id ? cat : c));
      setEditId(null);
    } catch (err: any) { setError(err.message || "Failed to update category"); }
    finally { setSaving(false); }
  };

  const deleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try { await deleteTerm("categories", id); setCats(prev => prev.filter(c => c.id !== id)); }
    catch (err: any) { alert(err.message || "Failed to delete category"); }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">Categories</h1>
          <p className="text-muted-foreground text-sm">{cats.length} categor{cats.length !== 1 ? "ies" : "y"}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <Card className="p-4 bg-card/60 border-border mb-5">
          <label className="block text-sm font-medium mb-2">Add New Category</label>
          <div className="flex gap-2">
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCat()}
              placeholder="Category name..."
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button onClick={addCat} disabled={adding || !newName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add
            </button>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : cats.length === 0 ? (
          <Card className="p-10 text-center bg-card/40">
            <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No categories yet. Add one above.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {cats.map(cat => (
              <Card key={cat.id} className="px-4 py-3 bg-card/60 flex items-center gap-3">
                <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                {editId === cat.id ? (
                  <>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(cat.id); if (e.key === "Escape") setEditId(null); }}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <button onClick={() => saveEdit(cat.id)} disabled={saving} className="p-1.5 rounded hover:bg-green-500/10 text-green-400 transition-colors">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditId(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground font-mono hidden sm:block">{cat.slug}</span>
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCat(cat.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
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
