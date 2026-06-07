import React, { useEffect, useState } from "react";
import { Users as UsersIcon, Trash2, Loader2, ShieldAlert, Shield, User, CheckCircle2, Clock } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import {
  getDrupalUsers, setDrupalUserRole, approveDrupalUser, deleteDrupalUser,
  DrupalUser, isDrupalConfigured,
} from "@/lib/drupal";
import { useAuth } from "@/contexts/AuthContext";
import { DrupalNotConfigured } from "@/components/DrupalNotConfigured";
import { cn } from "@/lib/utils";

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<DrupalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "pending">("all");

  const load = () => {
    getDrupalUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { if (isDrupalConfigured()) load(); else setLoading(false); }, []);

  if (!isDrupalConfigured()) return <AdminLayout><DrupalNotConfigured /></AdminLayout>;

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

  const handleDelete = async (user: DrupalUser) => {
    if (user.id === me?.id) { alert("You cannot delete your own account."); return; }
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeleting(user.id);
    try { await deleteDrupalUser(user.id); setUsers(prev => prev.filter(u => u.id !== user.id)); }
    catch (err: any) { alert(err.message || "Failed to delete user"); }
    finally { setDeleting(null); }
  };

  const handleToggleRole = async (user: DrupalUser) => {
    if (user.id === me?.id) { alert("You cannot change your own role."); return; }
    const newRole = user.roles.includes("administrator") ? "contributor" : "administrator";
    setUpdatingRole(user.id);
    try {
      const updated = await setDrupalUserRole(user.id, newRole as "administrator" | "contributor");
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    } catch (err: any) { alert(err.message || "Failed to update role"); }
    finally { setUpdatingRole(null); }
  };

  const handleApprove = async (user: DrupalUser) => {
    setApproving(user.id);
    try {
      const updated = await approveDrupalUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    } catch (err: any) { alert(err.message || "Failed to approve user"); }
    finally { setApproving(null); }
  };

  const pending = users.filter(u => u.status === "pending");
  const displayed = tab === "pending" ? pending : users;
  const isAdmin = (u: DrupalUser) => u.roles.includes("administrator");

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold">Users</h1>
            <p className="text-muted-foreground text-sm">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5" /> {pending.length} pending approval
            </div>
          )}
        </div>

        <div className="flex gap-1 mb-5 p-1 bg-muted rounded-lg w-fit">
          {(["all", "pending"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
                tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t === "pending" ? `Pending (${pending.length})` : "All Users"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : displayed.length === 0 ? (
          <Card className="p-12 text-center bg-card/40">
            <UsersIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">{tab === "pending" ? "No pending approvals." : "No users found."}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {displayed.map(user => (
              <Card key={user.id} className={cn(
                "px-4 py-3.5 bg-card/60 flex items-center gap-4",
                user.status === "pending" && "border-yellow-500/20"
              )}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-border shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">
                      {user.firstName || user.lastName ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : user.username}
                    </span>
                    {user.id === me?.id && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">You</span>}
                    {user.status === "pending" && (
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Pending Approval
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {user.designation && <p className="text-xs text-muted-foreground">{user.designation}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {user.status === "pending" && (
                    <button onClick={() => handleApprove(user)} disabled={approving === user.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all">
                      {approving === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleRole(user)}
                    disabled={updatingRole === user.id || user.id === me?.id}
                    title={user.id === me?.id ? "Cannot change own role" : `Set as ${isAdmin(user) ? "contributor" : "administrator"}`}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                      isAdmin(user) ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20" : "bg-muted text-muted-foreground border-border hover:text-foreground",
                      user.id === me?.id && "opacity-50 cursor-not-allowed"
                    )}>
                    {updatingRole === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                    {isAdmin(user) ? "admin" : "contributor"}
                  </button>
                  <button onClick={() => handleDelete(user)} disabled={deleting === user.id || user.id === me?.id}
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
