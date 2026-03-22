import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";

// Page Imports
import Home from "@/pages/Home";
import PasswordGeneratorPage from "@/pages/tools/PasswordGeneratorPage";
import HashGeneratorPage from "@/pages/tools/HashGeneratorPage";
import PinGeneratorPage from "@/pages/tools/PinGeneratorPage";
import PasswordCheckerPage from "@/pages/tools/PasswordCheckerPage";
import Blog from "@/pages/Blog";
import { About, Contact, FAQ, Privacy, Terms } from "@/pages/StaticPages";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tools/password-generator" component={PasswordGeneratorPage} />
        <Route path="/tools/hash-generator" component={HashGeneratorPage} />
        <Route path="/tools/pin-generator" component={PinGeneratorPage} />
        <Route path="/tools/password-checker" component={PasswordCheckerPage} />
        <Route path="/blog" component={Blog} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={FAQ} />
        <Route path="/privacy-policy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
