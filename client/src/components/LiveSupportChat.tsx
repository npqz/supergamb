import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageCircle, Send } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface LiveSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveSupportChat({ isOpen, onClose }: LiveSupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Add bot auto-response
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Our Support System Is Currently Down Will Be Up Soon",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-gradient-to-br from-slate-900 to-purple-950 border border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={24} className="text-white" />
            <h3 className="text-white font-bold">Live Support</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Welcome to SuperGamb Support</p>
              <p className="text-sm mt-2">Send us a message!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-slate-800 text-gray-200"
                  }`}
                >
                  {message.sender === "bot" && (
                    <p className="text-xs font-bold mb-1 text-purple-400">Bot</p>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/30">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-800/50 border-purple-500/30 text-white"
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send size={20} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
