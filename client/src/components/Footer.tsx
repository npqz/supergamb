import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";

interface FooterProps {
  onOpenSupport?: () => void;
}

export default function Footer({ onOpenSupport }: FooterProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-purple-500/20 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
              {t("brand")}
            </h3>
            <p className="text-gray-400 text-sm">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t("footer.main")}</h4>
            <ul className="space-y-2">
              <li><a href="#games" className="text-gray-400 hover:text-purple-400 transition">{t("footer.games")}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.slots")}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.promotions")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.aboutUs")}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.careers")}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.blog")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={onOpenSupport} className="text-gray-400 hover:text-purple-400 transition flex items-center gap-2">
                  <MessageCircle size={16} />
                  {t("footer.liveSupport")}
                </button>
              </li>
              <li><a href="#faq" className="text-gray-400 hover:text-purple-400 transition">{t("footer.faq")}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.contact")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.terms")}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.privacy")}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition">{t("footer.responsibleGaming")}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-purple-500/20 pt-8 text-center">
          <p className="text-gray-400 text-sm">{t("footer.copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
}
