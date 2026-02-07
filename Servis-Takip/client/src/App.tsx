import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { checkAuth } from "@/lib/store";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import NewRecordPage from "@/pages/new-record";
import RecordDetailPage from "@/pages/record-detail";
import StockPage from "@/pages/stock";
import CustomersPage from "@/pages/customers";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!checkAuth()) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/yeni">
        {() => <ProtectedRoute component={NewRecordPage} />}
      </Route>
      <Route path="/kayit/:id">
        {() => <ProtectedRoute component={RecordDetailPage} />}
      </Route>
      <Route path="/stok">
        {() => <ProtectedRoute component={StockPage} />}
      </Route>
      <Route path="/musteriler">
        {() => <ProtectedRoute component={CustomersPage} />}
      </Route>
      <Route path="/raporlar">
        {() => <ProtectedRoute component={ReportsPage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;