import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Camera, Twitter, Linkedin, Github, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";

interface ProfileData {
  id: number; username: string; email: string; role: string;
  summary?: string; profilePicture?: string; designation?: string;
  twitter?: string; linkedin?: string; github?: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    username: "", email: "", designation: "", summary: "",
    profilePicture: "", twitter: "", linkedin: "", github: "",
    password: "", confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth/login"); return; }
    if (!user) return;
    api.get<ProfileData>(`/users/${user.id}`).then(p => {
      setProfile(p);
      setForm({
        username: p.username || "", email: p.email || "",
        designation: p.designation || "", summary: p.summary || "",
        profilePicture: p.profilePicture || "",
        twitter: p.twitter || "", linkedin: p.linkedin || "", github: p.github || "",
        password: "", confirmPassword: "",
      });
    }).catch(() => setError("Failed to load profile")).finally(() => setLoading(false));
  }, [user, authLoading]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setSaving(true); setError(""); setSuccess(false);
    try {
      const body: Record<string, string> = {
        username: form.username, email: form.email,
        designation: form.designation, summary: form.summary,
        profilePicture: form.profilePicture,
        twitter: form.twitter, linkedin: form.linkedin, github: form.github,
      };
      if (form.password) body.password = form.password;
      const updated = await api.put<ProfileData>(`/users/${user!.id}`, body);
      setProfile(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message || "Failed to save profile"); }
    finally { setSaving(false); }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  if (loading || authLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold">Your Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Edit Profile
            </button>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile saved successfully!
          </div>
        )}

        {!editing ? (
          /* ---- View mode ---- */
          <div className="space-y-5">
            <Card className="p-6 bg-card/60 border-border">
              <div className="flex items-start gap-5">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile?.username} className="w-20 h-20 rounded-2xl object-cover border-2 border-border shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-muted border-2 border-border flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold">{profile?.username}</h2>
                  {profile?.designation && <p className="text-primary text-sm font-medium mt-0.5">{profile.designation}</p>}
                  <p className="text-muted-foreground text-sm mt-0.5">{profile?.email}</p>
                  <span className="inline-block mt-2 text-[11px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold capitalize">{profile?.role}</span>
                </div>
              </div>
              {profile?.summary && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{profile.summary}</p>
              )}
            </Card>

            <Card className="p-5 bg-card/60 border-border">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Social Links</p>
              <div className="space-y-2">
                {[
                  { icon: Twitter, label: "Twitter", val: profile?.twitter, color: "text-[#1DA1F2]" },
                  { icon: Linkedin, label: "LinkedIn", val: profile?.linkedin, color: "text-[#0A66C2]" },
                  { icon: Github, label: "GitHub", val: profile?.github, color: "text-foreground" },
                ].map(({ icon: Icon, label, val, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${val ? color : "text-muted-foreground/40"}`} />
                    {val ? (
                      <a href={val} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{val}</a>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">Not set</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          /* ---- Edit mode ---- */
          <form onSubmit={save} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <Card className="p-5 bg-card/60 border-border space-y-4">
              <h3 className="text-sm font-semibold">Basic Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Username</label>
                  <input {...field("username")} required className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Email</label>
                  <input type="email" {...field("email")} required className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Designation / Role Title</label>
                <input {...field("designation")} placeholder="e.g. Security Researcher" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Profile Picture URL</label>
                <div className="flex gap-3 items-center">
                  {form.profilePicture ? (
                    <img src={form.profilePicture} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" onError={e => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <input {...field("profilePicture")} placeholder="https://..." className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Bio / Summary</label>
                <textarea {...field("summary")} rows={4} placeholder="Tell readers about yourself..."
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
            </Card>

            <Card className="p-5 bg-card/60 border-border space-y-4">
              <h3 className="text-sm font-semibold">Social Links</h3>
              {[
                { key: "twitter", icon: Twitter, label: "Twitter URL", placeholder: "https://twitter.com/username" },
                { key: "linkedin", icon: Linkedin, label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username" },
                { key: "github", icon: Github, label: "GitHub URL", placeholder: "https://github.com/username" },
              ].map(({ key, icon: Icon, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input {...field(key as keyof typeof form)} type="url" placeholder={placeholder}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              ))}
            </Card>

            <Card className="p-5 bg-card/60 border-border space-y-4">
              <h3 className="text-sm font-semibold">Change Password <span className="text-muted-foreground font-normal text-xs">(leave blank to keep current)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">New Password</label>
                  <input type="password" {...field("password")} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Confirm Password</label>
                  <input type="password" {...field("confirmPassword")} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            </Card>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Profile
              </button>
              <button type="button" onClick={() => { setEditing(false); setError(""); }}
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
