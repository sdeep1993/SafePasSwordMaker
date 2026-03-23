import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle2, Camera, Twitter, Linkedin, Github, User, Eye, EyeOff, Phone, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import PasswordStrength, { isPasswordValid } from "@/components/PasswordStrength";

interface ProfileData {
  id: number; username: string; email: string; role: string; status: string;
  firstName?: string; lastName?: string; phone?: string;
  summary?: string; profilePicture?: string; designation?: string;
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
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "", email: "", phone: "",
    designation: "", summary: "", profilePicture: "",
    twitter: "", linkedin: "", github: "",
    password: "", confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth/login"); return; }
    if (!user) return;
    api.get<ProfileData>(`/users/${user.id}`).then(p => {
      setProfile(p);
      setForm(f => ({
        ...f,
        firstName: p.firstName || "", lastName: p.lastName || "",
        username: p.username || "", email: p.email || "", phone: p.phone || "",
        designation: p.designation || "", summary: p.summary || "",
        profilePicture: p.profilePicture || "",
        twitter: p.twitter || "", linkedin: p.linkedin || "", github: p.github || "",
      }));
    }).catch(() => setError("Failed to load profile")).finally(() => setLoading(false));
  }, [user, authLoading]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, profilePicture: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password && !isPasswordValid(form.password)) { setError("Password does not meet all requirements"); return; }
    setSaving(true); setError(""); setSuccess(false);
    try {
      const body: Record<string, string> = {
        firstName: form.firstName, lastName: form.lastName,
        username: form.username, email: form.email, phone: form.phone,
        designation: form.designation, summary: form.summary,
        profilePicture: form.profilePicture,
        twitter: form.twitter, linkedin: form.linkedin, github: form.github,
      };
      if (form.password) body.password = form.password;
      const updated = await api.put<ProfileData>(`/users/${user!.id}`, body);
      setProfile(updated);
      setEditing(false);
      setSuccess(true);
      setForm(f => ({ ...f, password: "", confirmPassword: "" }));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message || "Failed to save profile"); }
    finally { setSaving(false); }
  };

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
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile?.username} className="w-20 h-20 rounded-2xl object-cover border-2 border-border shrink-0" />
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
                  <p className="text-muted-foreground text-sm mt-0.5">{profile?.email}</p>
                  {profile?.phone && <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" />{profile.phone}</p>}
                  <span className={`inline-block mt-2 text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${profile?.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-primary/10 text-primary"}`}>{profile?.role} · {profile?.status}</span>
                </div>
              </div>
              {profile?.summary && <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{profile.summary}</p>}
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

            {/* Basic info */}
            <Card className="p-5 bg-card/60 border-border space-y-4">
              <h3 className="text-sm font-semibold">Basic Info</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">First Name</label>
                  <input value={form.firstName} onChange={set("firstName")} placeholder="John" className={INPUT} /></div>
                <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Last Name</label>
                  <input value={form.lastName} onChange={set("lastName")} placeholder="Doe" className={INPUT} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Username *</label>
                  <input value={form.username} onChange={set("username")} required className={INPUT} /></div>
                <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Email *</label>
                  <input type="email" value={form.email} onChange={set("email")} required className={INPUT} /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Phone Number</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" className={`${INPUT} pl-9`} /></div></div>
              <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Designation / Title</label>
                <input value={form.designation} onChange={set("designation")} placeholder="e.g. Security Researcher" className={INPUT} /></div>
              <div><label className="block text-xs font-medium mb-1.5 text-muted-foreground">Bio / Summary</label>
                <textarea value={form.summary} onChange={set("summary")} rows={4} placeholder="Tell readers about yourself..."
                  className={`${INPUT} resize-none`} /></div>
            </Card>

            {/* Profile photo */}
            <Card className="p-5 bg-card/60 border-border space-y-3">
              <h3 className="text-sm font-semibold">Profile Photo</h3>
              <div className="flex items-center gap-4">
                {form.profilePicture ? (
                  <img src={form.profilePicture} alt="preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-border shrink-0" onError={e => (e.currentTarget.style.display = "none")} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-border flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full">
                    <Camera className="w-4 h-4" /> Upload Photo
                  </button>
                  <input value={form.profilePicture} onChange={set("profilePicture")} placeholder="Or paste an image URL..." className={`${INPUT} text-xs`} />
                  <p className="text-[11px] text-muted-foreground">Max 2 MB. JPG, PNG, WebP.</p>
                </div>
              </div>
            </Card>

            {/* Social */}
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

            {/* Password change */}
            <Card className="p-5 bg-card/60 border-border space-y-4">
              <h3 className="text-sm font-semibold">Change Password <span className="text-muted-foreground font-normal text-xs">(leave blank to keep current)</span></h3>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">New Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")}
                    placeholder="••••••••" className={`${INPUT} pr-10`} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")}
                    placeholder="••••••••" className={`${INPUT} pr-10`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && form.confirmPassword && (
                  <div className={`flex items-center gap-1.5 text-xs mt-1.5 font-medium ${form.password === form.confirmPassword ? "text-green-400" : "text-red-400"}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {form.password === form.confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </div>
                )}
              </div>
            </Card>

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
