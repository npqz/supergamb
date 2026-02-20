import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface DepositDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositDialog({ isOpen, onClose }: DepositDialogProps) {
  const { t } = useTranslation();
  const [selectedCrypto, setSelectedCrypto] = useState<"USDT" | "BTC" | "ETH" | "LTC">("USDT");
  const [copied, setCopied] = useState(false);

  const cryptoAddresses: Record<"USDT" | "BTC" | "ETH" | "LTC", string> = {
    USDT: "0xbb8e3b1b664024ff44db9366318d99623bd6169b",
    BTC: "bc1qm2d72tec89a4yzpw8u8sxd7n7wh7veyw3zu0lr",
    ETH: "0xdE50c9817500D5a614326519F0Fe3f25426AF0e8",
    LTC: "LT5Pn8eWmjJqQXtHbsuxmXXpCPdYuqWZ8K",
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cryptoAddresses[selectedCrypto]);
    setCopied(true);
    toast.success(t("deposit.addressCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-slate-900 to-purple-950 border border-purple-500/50 rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {t("deposit.title")}
        </h2>

        <div className="mb-6">
          <label className="text-gray-300 block mb-3 text-sm">{t("deposit.selectCrypto")}</label>
          <div className="grid grid-cols-4 gap-3">
            {(["USDT", "BTC", "ETH", "LTC"] as const).map((crypto) => (
              <button
                key={crypto}
                onClick={() => setSelectedCrypto(crypto)}
                className={`py-3 px-4 rounded-lg font-bold transition ${
                  selectedCrypto === crypto
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-slate-800/50 text-gray-400 hover:bg-slate-700/50"
                }`}
              >
                {crypto}
              </button>
            ))}
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 text-sm font-semibold">⚠️ {t("deposit.networkInfo")}</p>
          <p className="text-yellow-300 text-xs mt-2">{t("deposit.networkDesc")}</p>
        </div>

        <div className="mb-6">
          <label className="text-gray-300 block mb-2 text-sm">{t("deposit.depositAddress", { crypto: selectedCrypto })}</label>
          <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4 flex items-center justify-between">
            <code className="text-purple-400 text-sm break-all flex-1">
              {cryptoAddresses[selectedCrypto]}
            </code>
            <button
              onClick={handleCopyAddress}
              className="ml-3 p-2 hover:bg-purple-500/20 rounded transition"
            >
              {copied ? (
                <Check size={20} className="text-green-400" />
              ) : (
                <Copy size={20} className="text-purple-400" />
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">{t("deposit.howToTitle")}</h3>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>{t("deposit.howTo1")}</li>
            <li>{t("deposit.howTo2")}</li>
            <li>{t("deposit.howTo3", { crypto: selectedCrypto })}</li>
            <li>{t("deposit.howTo4")}</li>
            <li>{t("deposit.howTo5")}</li>
          </ol>
        </div>

        <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-xs">
            <strong>{t("deposit.warning")}</strong> {t("deposit.warningText", { crypto: selectedCrypto })}
          </p>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
        >
          {t("deposit.iUnderstand")}
        </Button>
      </div>
    </div>
  );
}
