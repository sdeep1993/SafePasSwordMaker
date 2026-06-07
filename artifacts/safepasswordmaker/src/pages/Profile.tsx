import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle2, Camera, Twitter, Linkedin, Github, User, Eye, EyeOff, Phone, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { getDrupalUserByUuid, updateDrupalUserProfile, isDrupalConfigured } from "@/lib/drupal";
import AdminLayout from "@/components/AdminLayout";
import PasswordStrength, { isPasswordValid } from "@/components/PasswordStrength";
import { DrupalNotConfigured } from "@/components/DrupalNotConfigured";

interface ProfileData {
  id: string; username: string; email: string; role: string; status: string;
  firstName?: string; lastName?: string; phone?: string;
  bio?: string; avatar?: string; designation?: string;
  twitter?: string; linkedin?: string; github?: string;
}

const INPUT = "w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "",
    designation: "", bio: "", avatar: "",
    twitter: "", linkedin: "", github: "",
    password: "", confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth/login"); return; }
    if (!user || !isDrupalConfigured()) { setLoading(false); return; }
    getDrupalUserByUuid(user.id).then(p => {
      setProfile({
        id: p.id, username: p.username, email: p.email,
        role: p.roles.includes("administrator") ? "admin" : "contributor",
        status: p.status,
        firstName: p.firstName, lastName: p.lastName, phone: p.phone,
        bio: p.bio, avatar: p.avatar, designation: p.designation,
        twitter: p.twitter, linkedin: p.linkedin, github: p.github,
      });
      setForm(f => ({
        ...f,
        firstName: p.firstName || "", lastName: p.lastName || "", phone: p.phone || "",
        designation: p.designation || "", bio: p.bio || "", avatar: p.avatar || "",
        twitter: p.twitter || "", linkedin: p.linkedin || "", github: p.github || "",
      }));
    }).catch(() => setError("Failed to load profile")).finally(() => setLoading(false));
  }, [user, authLoading]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password && !isPasswordValid(form.password)) { setError("Password does not meet all requirements"); return; }
    if (!user) return;
    setSaving(true); setError(""); setSuccess(false);
    try {
      await updateDrupalUserProfile(user.id, {
        firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        designation: form.designation, bio: form.bio,
        twitter: form.twitter, linkedin: form.linkedin, github: form.github,
      });
      setProfile(prev => prev ? { ...prev, ...form, summary: form.bio, profilePicture: form.avatar } : prev);
      setEditing(false);
      setSuccess(true);
      setForm(f => ({ ...f, password: "", confirmPassword: "" }));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message || "Failed to save profile"); }
    finally { setSaving(false); }
  };

  if (!isDrupalConfigured()) return <AdminLayout><DrupalNotConfigured /></AdminLayout>;

  if (loading || authLoading) {
    return <AdminLayout><div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold">Your Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile saved successfully!
          </div>
        )}

        {!editing ? (
          <div className="space-y-5">
            <Card className="p-6 bg-card/60 border-border">
              <div className="flex items-start gap-5">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile?.username} className="w-20 h-20 rounded-2xl object-cover border-2 border-border shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-muted border-2 border-border flex items-center justify-center shrink-0">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold">
                    {profile?.firstName || profile?.lastName
                      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
                      : profile?.username}
                  </h2>
                  {profile?.designation && <p className="text-primary text-sm font-medium mt-0.5">{profile.designation}</p>}
                  <p className="text-muted-foreground text-sm mt-0.5">{profile?.email || user?.email}</p>
                  {profile?.phone && <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" />{profile.phone}</p>}
                  <span className={`inline-block mt-2 text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${profile?.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-primary/10 text-primary"}`}>
                    {profile?.role || user?.role} · {profile?.status || "active"}
                  </span>
                </div>
              </div>
              {profile?.bio && <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{profile.bio}</p>}
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
                    {val ? <a href={val} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{val}</a>
                      : <span className="text-sm text-muted-foreground/50">Not set</span>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <Card className="p-5 bg-card/60 border-border space-y-4">
              <h3 className="text-sm font-semibold">Basic Info</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">First Name</label>
                  <input value={form.firstName} onChange={set("firstName")} placeholder="John" className={INPUT} /></div>
                <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Last Name</label>
                  <input value={form.lastName} onChange={set("lastName")} placeholder="Doe" className={INPUT} /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Phone Number</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" className={`${INPUT} pl-9`} /></div></div>
              <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Designation / Title</label>
                <input value={form.designation} onChange={set("designation")} placeholder="e.g. Security Researcher" className={INPUT} /></div>
              <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Bio / Summary</label>
                <textarea value={form.bio} onChange={set("bio")} rows={4} placeholder="Tell readers about yourself..."
                  className={`${INPUT} resize-none`} /></div>
            </Card>

            <Card className="p-5 bg-card/60 border-border space-y-3">
              <h3 className="text-sm font-semibold">Social Links</h3>
              {[
                { key: "twitter", icon: Twitter, placeholder: "https://twitter.com/username" },
                { key: "linkedin", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
                { key: "github", icon: Github, placeholder: "https://github.com/username" },
              ].map(({ key, icon: Icon, placeholder }) => (
                <div key={key} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="url" value={form[key as keyof typeof form]} onChange={set(key as keyof typeof form)}
                    placeholder={placeholder} className={`${INPUT} pl-9`} />
                </div>
              ))}
            </Card>

            <div className="mt-2 p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                To change your password or email, use the <a href={`${import.meta.env.VITE_DRUPAL_URL || ""}/user`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Drupal user panel</a>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Profile
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
