import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { FileText, Tag, FolderOpen, Users, PenSquare, ArrowRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/Card";
import { getDrupalStats, isDrupalConfigured } from "@/lib/drupal";
import { useAuth } from "@/contexts/AuthContext";
import { DrupalNotConfigured } from "@/components/DrupalNotConfigured";

interface Stats { posts: number; tags: number; categories: number; users: number }

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ posts: 0, tags: 0, categories: 0, users: 0 });

  useEffect(() => {
    if (!isDrupalConfigured()) return;
    getDrupalStats()
      .then(s => setStats(s))
      .catch(() => {});
  }, []);

  if (!isDrupalConfigured()) {
    return <AdminLayout><DrupalNotConfigured /></AdminLayout>;
  }

  const cards = [
    { label: "Total Posts", value: stats.posts, icon: FileText, href: "/admin/posts", color: "text-blue-400" },
    { label: "Tags", value: stats.tags, icon: Tag, href: "/admin/tags", color: "text-green-400" },
    { label: "Categories", value: stats.categories, icon: FolderOpen, href: "/admin/categories", color: "text-yellow-400" },
    ...(user?.role === "admin" ? [{ label: "Users", value: stats.users, icon: Users, href: "/admin/users", color: "text-purple-400" }] : []),
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold">Welcome back, {user?.username}</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your content.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => (
            <Link key={c.href} href={c.href}>
              <Card className="p-5 hover:border-primary/40 transition-all cursor-pointer group bg-card/60">
                <c.icon className={`w-6 h-6 ${c.color} mb-3`} />
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{c.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/admin/posts/new">
            <Card className="p-4 hover:border-primary/40 transition-all cursor-pointer group bg-card/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <PenSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">Write New Post</p>
                <p className="text-xs text-muted-foreground">Create and publish a new article</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors shrink-0" />
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="p-4 hover:border-primary/40 transition-all cursor-pointer group bg-card/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">Edit Your Profile</p>
                <p className="text-xs text-muted-foreground">Update bio, photo, social links</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors shrink-0" />
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
