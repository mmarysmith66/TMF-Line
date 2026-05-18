import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import MCAPage from "@/pages/MCAPage";
import HelocCalculatorPage from "@/pages/HelocCalculatorPage";
import LongTermLoansPage from "@/pages/LongTermLoansPage";
import FundingEstimatorPage from "@/pages/FundingEstimatorPage";
import AboutPage from "@/pages/AboutPage";
import ApplyPage from "@/pages/ApplyPage";
import ContactPage from "@/pages/ContactPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mca" element={<MCAPage />} />
          <Route path="/heloc-calculator" element={<HelocCalculatorPage />} />
          <Route path="/long-term-loans" element={<LongTermLoansPage />} />
          <Route path="/funding-estimator" element={<FundingEstimatorPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
      <Toaster theme="dark" position="top-right" />
    </BrowserRouter>
  );
}

export default App;
