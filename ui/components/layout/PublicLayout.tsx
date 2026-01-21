import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidget } from "@/ui/components/chat/ChatWidget";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
