import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MiningData from "./pages/MiningData";
import Forecasting from "./pages/Forecasting";
import TechnicalDashboard from "./pages/TechnicalDashboard";
import ProcessDashboard from "./pages/ProcessDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import ContractorRequests from "./pages/ContractorRequests";
import ProvisionDashboard from "./pages/ProvisionDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ContinuousLearning from "./pages/ContinuousLearning";
import SustainableWater from "./pages/SustainableWater";
import SustainabilityInsights from "./pages/SustainabilityInsights";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/mining"
          element={<MiningData />}
        />

        <Route
          path="/forecasting"
          element={<Forecasting />}
        />

        <Route
          path="/technical-dashboard"
          element={<TechnicalDashboard />}
        />

        <Route
          path="/process-dashboard"
          element={<ProcessDashboard />}
        />

        <Route
          path="/contractor-dashboard"
          element={<ContractorDashboard />}
        />

        <Route
          path="/contractor-requests"
          element={<ContractorRequests />}
        />

        <Route
          path="/provision-dashboard"
          element={<ProvisionDashboard />}
        />

        <Route
          path="/analytics"
          element={<AnalyticsDashboard />}
        />

        <Route
          path="/continuous-learning"
          element={<ContinuousLearning />}
        />

        <Route
    path="/sustainable-water"
    element={<SustainableWater />}
/>
        <Route
    path="/sustainability-insights"
    element={<SustainabilityInsights />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;