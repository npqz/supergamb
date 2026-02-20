import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
  const faqs = faqKeys.map((q, i) => ({
    question: t(`faq.${q}`),
    answer: t(`faq.a${i + 1}`),
  }));

  return (
    <motion.section
      id="faq"
      className="py-20 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          className="text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {t("faq.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{t("faq.questions")}</span>
        </motion.h2>
        <motion.p
          className="text-gray-400 text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t("faq.subtitle")}
        </motion.p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg overflow-hidden hover:border-purple-500/50 transition"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <motion.button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-purple-500/5 transition"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <h3 className="text-lg font-bold text-white pr-4">{faq.question}</h3>
                <ChevronDown
                  size={24}
                  className={`text-purple-400 flex-shrink-0 transition-transform ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    className="px-6 py-4 border-t border-purple-500/20 bg-purple-500/5"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
