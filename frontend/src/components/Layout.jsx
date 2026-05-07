import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatAssistant from "@/components/ChatAssistant";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100" data-testid="app-root">
      <Header />
      <main className="flex-1 pt-20" data-testid="main-content">
        <Outlet />
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
}
