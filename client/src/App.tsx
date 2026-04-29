import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssessmentProvider } from "@/lib/AssessmentContext";
import Welcome from "@/pages/Welcome";
import CandidateDetails from "@/pages/CandidateDetails";
import SectionA from "@/pages/SectionA";
import SectionB from "@/pages/SectionB";
import SectionC from "@/pages/SectionC";
import Done from "@/pages/Done";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/details" component={CandidateDetails} />
      <Route path="/section-a" component={SectionA} />
      <Route path="/section-b" component={SectionB} />
      <Route path="/section-c" component={SectionC} />
      <Route path="/done" component={Done} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AssessmentProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </AssessmentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
