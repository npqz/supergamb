import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Zap, Shield, Coins, Headphones } from "lucide-react";

export default function FeaturesSection() {
  const { t } = useTranslation();
  const features = [
    { icon: Zap, titleKey: "features.instantEarnings", descKey: "features.instantEarningsDesc" },
    { icon: Coins, titleKey: "features.flexibleDeposits", descKey: "features.flexibleDepositsDesc" },
    { icon: Shield, titleKey: "features.exclusivePromos", descKey: "features.exclusivePromosDesc" },
    { icon: Headphones, titleKey: "features.support247", descKey: "features.support247Desc" },
  ];

  return (
    <motion.section
      id="features"
      className="py-20 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          className="text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {t("features.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{t("brand")}</span>
        </motion.h2>
        <motion.p
          className="text-gray-400 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t("features.subtitle")}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <motion.div
                  className="mb-4 inline-block p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className="text-white" size={24} />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">{t(feature.titleKey)}</h3>
                <p className="text-gray-400">{t(feature.descKey)}</p>
              </motion.div>
            );
          })}
        </div>

        {/* About Section */}
        <motion.div
          className="mt-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">{t("features.aboutTitle")}</h3>
          <p className="text-gray-300 mb-4">{t("features.aboutP1")}</p>
          <p className="text-gray-300">{t("features.aboutP2")}</p>
        </motion.div>
      </div>
    </motion.section>
  );
}
