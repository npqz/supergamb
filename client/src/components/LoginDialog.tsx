import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginDialog({ isOpen, onClose, onSuccess }: LoginDialogProps) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const utils = trpc.useUtils();
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success(t("login.loginSuccess"));
      utils.auth.me.invalidate();
      utils.balance.get.invalidate();
      onClose();
      // Reset form
      setUsername("");
      setPassword("");
      // Reload page to update authentication state
      setTimeout(() => window.location.reload(), 500);
    },
    onError: (error) => {
      toast.error(error.message || t("login.loginFailed"));
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success(t("login.registerSuccess"));
      utils.auth.me.invalidate();
      utils.balance.get.invalidate();
      onClose();
      if (onSuccess) onSuccess();
      // Reset form
      setUsername("");
      setPassword("");
      setName("");
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message || t("login.registerFailed"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      loginMutation.mutate({ username, password, rememberMe });
    } else {
      registerMutation.mutate({ username, password, name, email, promoCode });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-slate-900 to-purple-950 border border-purple-500/50 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isLogin ? t("login.welcomeBack") : t("login.createAccount")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-gray-300">{t("login.username")}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="bg-slate-800/50 border-purple-500/30 text-white mt-1"
              placeholder={t("login.usernamePlaceholder")}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <Label htmlFor="name" className="text-gray-300">{t("login.displayName")}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800/50 border-purple-500/30 text-white mt-1"
                  placeholder={t("login.displayNamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-purple-500/30 text-white mt-1"
                  placeholder={t("login.emailPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="promoCode" className="text-gray-300">{t("login.promoCode")}</Label>
                <Input
                  id="promoCode"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="bg-slate-800/50 border-purple-500/30 text-white mt-1"
                  placeholder={t("login.promoPlaceholder")}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="password" className="text-gray-300">{t("login.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-slate-800/50 border-purple-500/30 text-white mt-1"
              placeholder={t("login.passwordPlaceholder")}
            />
          </div>

          {isLogin && (
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-purple-500/30 bg-slate-800/50 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <Label htmlFor="rememberMe" className="text-gray-300 cursor-pointer">
                {t("login.rememberMe")}
              </Label>
            </div>
          )}

          <Button
            type="submit"
            disabled={loginMutation.isPending || registerMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
          >
            {loginMutation.isPending || registerMutation.isPending
              ? t("login.pleaseWait")
              : isLogin
              ? t("login.login")
              : t("login.register")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername("");
              setPassword("");
              setName("");
              setEmail("");
              setPromoCode("");
            }}
            className="text-purple-400 hover:text-purple-300 transition"
          >
            {isLogin ? t("login.noAccount") : t("login.hasAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}
