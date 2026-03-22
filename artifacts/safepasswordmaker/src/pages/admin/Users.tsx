import React, { useEffect, useState } from "react";
import { Users as UsersIcon, Trash2, Loader2, ShieldAlert, Shield, User } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface UserRow {
  id: number; username: string; email: string; role: string;
  designation?: string; profilePicture?: string; createdAt: string;
}

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);

  const load = () => api.get<UserRow[]>("/users").then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  if (me?.role !== "admin") {
    return (
      <AdminLayout>
        <Card className="p-12 text-center max-w-md bg-card/60">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="font-bold mb-1">Admin Only</h2>
          <p className="text-sm text-muted-foreground">Only administrators can manage users.</p>
        </Card>
      </AdminLayout>
    );
  }

  const deleteUser = async (id: number) => {
    if (id === me?.id) { alert("You cannot delete your own account."); return; }
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeleting(id);
    try { await api.delete(`/users/${id}`); setUsers(prev => prev.filter(u => u.id !== id)); }
    catch (err: any) { alert(err.message || "Failed to delete user"); }
    finally { setDeleting(null); }
  };

  const toggleRole = async (user: UserRow) => {
    const newRole = user.role === "admin" ? "contributor" : "admin";
    if (user.id === me?.id) { alert("You cannot change your own role."); return; }
    setUpdatingRole(user.id);
    try {
      const updated = await api.put<UserRow>(`/users/${user.id}`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: updated.role } : u));
    } catch (err: any) { alert(err.message || "Failed to update role"); }
    finally { setUpdatingRole(null); }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">Users</h1>
          <p className="text-muted-foreground text-sm">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : users.length === 0 ? (
          <Card className="p-12 text-center bg-card/40">
            <UsersIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No users found.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <Card key={user.id} className="px-4 py-3.5 bg-card/60 flex items-center gap-4">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-border shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">{user.username}</span>
                    {user.id === me?.id && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">You</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {user.designation && <p className="text-xs text-muted-foreground">{user.designation}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleRole(user)} disabled={updatingRole === user.id || user.id === me?.id}
                    title={user.id === me?.id ? "Cannot change own role" : `Set as ${user.role === "admin" ? "contributor" : "admin"}`}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                      user.role === "admin"
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground",
                      user.id === me?.id && "opacity-50 cursor-not-allowed"
                    )}>
                    {updatingRole === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                    {user.role}
                  </button>
                  <button onClick={() => deleteUser(user.id)} disabled={deleting === user.id || user.id === me?.id}
                    title={user.id === me?.id ? "Cannot delete own account" : "Delete user"}
                    className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40">
                    {deleting === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
