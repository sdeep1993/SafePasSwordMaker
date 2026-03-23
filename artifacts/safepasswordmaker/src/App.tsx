import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

import Home from "@/pages/Home";
import PasswordGeneratorPage from "@/pages/tools/PasswordGeneratorPage";
import HashGeneratorPage from "@/pages/tools/HashGeneratorPage";
import PinGeneratorPage from "@/pages/tools/PinGeneratorPage";
import PasswordCheckerPage from "@/pages/tools/PasswordCheckerPage";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import { About, Contact, FAQ, Privacy, Terms } from "@/pages/StaticPages";

import AdminLogin from "@/pages/admin/Login";
import AdminSetup from "@/pages/admin/Setup";
import ContributorLogin from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/admin/Dashboard";
import Posts from "@/pages/admin/Posts";
import CreateEditPost from "@/pages/admin/CreateEditPost";
import Tags from "@/pages/admin/Tags";
import Categories from "@/pages/admin/Categories";
import Users from "@/pages/admin/Users";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem("spm_theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return null;
}

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
  if (!user) { window.location.href = "/auth/login"; return null; }
  if (adminOnly && user.role !== "admin") { window.location.href = "/admin"; return null; }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Auth / Setup pages — no Layout wrapper */}
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/auth/login" component={ContributorLogin} />
      <Route path="/auth/register" component={Register} />

      {/* Protected admin + profile pages — AdminLayout embedded in each page */}
      <Route path="/admin" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/admin/posts/new" component={() => <ProtectedRoute component={CreateEditPost} />} />
      <Route path="/admin/posts/:id/edit" component={() => <ProtectedRoute component={CreateEditPost} />} />
      <Route path="/admin/posts" component={() => <ProtectedRoute component={Posts} />} />
      <Route path="/admin/tags" component={() => <ProtectedRoute component={Tags} />} />
      <Route path="/admin/categories" component={() => <ProtectedRoute component={Categories} adminOnly />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={Users} adminOnly />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />

      {/* Public site — wrapped in the main site Layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/tools/password-generator" component={PasswordGeneratorPage} />
            <Route path="/tools/hash-generator" component={HashGeneratorPage} />
            <Route path="/tools/pin-generator" component={PinGeneratorPage} />
            <Route path="/tools/password-checker" component={PasswordCheckerPage} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/blog" component={Blog} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/faq" component={FAQ} />
            <Route path="/privacy-policy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeInit />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
