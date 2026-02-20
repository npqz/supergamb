import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {t("hero.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{t("brand")}</span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                {t("hero.subtitle")}
              </p>
            </div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">54,806</div>
                <div className="text-sm text-gray-400">{t("hero.playersOnline")}</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">51M+</div>
                <div className="text-sm text-gray-400">{t("hero.registeredPlayers")}</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">$32.5B+</div>
                <div className="text-sm text-gray-400">{t("hero.paidToPlayers")}</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                  {t("hero.ctaReward")}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg"
                >
                  {t("hero.learnMore")}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Image/Animation */}
          <motion.div
            className="relative h-96 md:h-full flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Animated Character Placeholder */}
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Animated Wheels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-around px-8">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-80 animate-spin"
                      style={{ animationDuration: `${3 + i * 0.5}s` }}
                    ></div>
                  ))}
                </div>

                {/* Money Bag Icon */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold text-yellow-900 animate-bounce">
                    $
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/30 to-transparent rounded-full blur-2xl"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
