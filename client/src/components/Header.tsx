import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import LoginDialog from "./LoginDialog";
import DepositDialog from "./DepositDialog";
import WithdrawalDialog from "./WithdrawalDialog";

const LANGUAGE_MAP: Record<string, string> = {
  EN: "en",
  ES: "es",
  DE: "de",
  FR: "fr",
  IT: "it",
  PT: "pt",
  HI: "hi",
};
const LANG_CODES = ["EN", "ES", "DE", "FR", "IT", "PT", "HI"] as const;
const LANG_NAMES: Record<string, string> = {
  EN: "English",
  ES: "Español",
  DE: "Deutsch",
  FR: "Français",
  IT: "Italiano",
  PT: "Português",
  HI: "Hindi",
};

export default function Header() {
  const { t, i18n } = useTranslation();
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const currentLangCode = Object.entries(LANGUAGE_MAP).find(
    ([, lng]) => lng === (i18n.language || "").split("-")[0]
  )?.[0] ?? "EN";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLanguageOpen(false);
      }
    };
    if (languageOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [languageOpen]);

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleRegister = () => {
    setLoginDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {t("brand")}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#games" className="text-gray-300 hover:text-white transition">{t("header.games")}</a>
            <a href="#features" className="text-gray-300 hover:text-white transition">{t("header.features")}</a>
            <a href="#faq" className="text-gray-300 hover:text-white transition">{t("header.faq")}</a>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative hidden sm:block" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLanguageOpen((open) => !open)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-gray-300 hover:text-white transition"
              >
                <Globe size={18} />
                <span className="text-sm">{currentLangCode}</span>
              </button>
              {languageOpen && (
                <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-purple-500/30 rounded-lg shadow-xl py-2 min-w-40 z-50">
                  {LANG_CODES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        const lng = LANGUAGE_MAP[code];
                        i18n.changeLanguage(lng).then(() => {
                          setLanguageOpen(false);
                        });
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-purple-500/20 transition ${
                        currentLangCode === code ? "text-purple-400" : "text-gray-300"
                      }`}
                    >
                      {LANG_NAMES[code]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  onClick={() => setDepositDialogOpen(true)}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10 flex items-center gap-2"
                >
                  <ArrowDownToLine size={16} />
                  {t("header.deposit")}
                </Button>
                <Button
                  onClick={() => setWithdrawalDialogOpen(true)}
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2"
                >
                  <ArrowUpFromLine size={16} />
                  {t("header.withdraw")}
                </Button>
                <span className="text-gray-300 text-sm">
                  {t("header.welcome", { name: user?.name || user?.username || t("header.player") })}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  {t("header.logout")}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="hidden sm:inline-flex border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  {t("header.login")}
                </Button>
                <Button
                  onClick={handleRegister}
                  className="hidden sm:inline-flex bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {t("header.register")}
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-purple-500/20 py-4 px-4">
            <nav className="flex flex-col gap-4">
              <a href="#games" className="text-gray-300 hover:text-white transition">{t("header.games")}</a>
              <a href="#features" className="text-gray-300 hover:text-white transition">{t("header.features")}</a>
              <a href="#faq" className="text-gray-300 hover:text-white transition">{t("header.faq")}</a>
              <div className="pt-4 border-t border-purple-500/20 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-300 text-sm">
                      {t("header.welcome", { name: user?.name || user?.username || t("header.player") })}
                    </span>
                    <Button
                      onClick={() => setDepositDialogOpen(true)}
                      variant="outline"
                      className="border-green-500/50 text-green-400 flex items-center gap-2 justify-center"
                    >
                      <ArrowDownToLine size={16} />
                      {t("header.deposit")}
                    </Button>
                    <Button
                      onClick={() => setWithdrawalDialogOpen(true)}
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-400 flex items-center gap-2 justify-center"
                    >
                      <ArrowUpFromLine size={16} />
                      {t("header.withdraw")}
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="border-purple-500/50 text-purple-400"
                    >
                      {t("header.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleLogin}
                      variant="outline"
                      className="border-purple-500/50 text-purple-400"
                    >
                      {t("header.login")}
                    </Button>
                    <Button
                      onClick={handleRegister}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {t("header.register")}
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Login/Register Dialog */}
      <LoginDialog 
        isOpen={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Deposit Dialog */}
      <DepositDialog 
        isOpen={depositDialogOpen} 
        onClose={() => setDepositDialogOpen(false)}
      />

      {/* Withdrawal Dialog */}
      <WithdrawalDialog 
        isOpen={withdrawalDialogOpen} 
        onClose={() => setWithdrawalDialogOpen(false)}
      />
    </>
  );
}
