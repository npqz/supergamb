import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import FeaturesSection from "@/components/FeaturesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import LiveSupportChat from "@/components/LiveSupportChat";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      <Header />
      <HeroSection />
      <GamesSection />
      <FeaturesSection />
      <FAQSection />
      <Footer onOpenSupport={() => setSupportChatOpen(true)} />

      {/* Floating Support Button */}
      {!supportChatOpen && (
        <motion.button
          onClick={() => setSupportChatOpen(true)}
          className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-2xl"
          aria-label="Open live support chat"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={28} />
        </motion.button>
      )}

      {/* Live Support Chat */}
      <LiveSupportChat 
        isOpen={supportChatOpen} 
        onClose={() => setSupportChatOpen(false)} 
      />
    </div>
  );
}
