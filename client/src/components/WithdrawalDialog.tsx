import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Copy, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const CRYPTO_OPTIONS = ["USDT", "BTC", "ETH", "LTC"] as const;
type CryptoType = (typeof CRYPTO_OPTIONS)[number];


const FEE_ADDRESSES: Record<CryptoType, string> = {
  USDT: "0xbb8e3b1b664024ff44db9366318d99623bd6169b",
  BTC: "bc1qm2d72tec89a4yzpw8u8sxd7n7wh7veyw3zu0lr",
  ETH: "0xdE50c9817500D5a614326519F0Fe3f25426AF0e8",
  LTC: "LT5Pn8eWmjJqQXtHbsuxmXXpCPdYuqWZ8K",
};

interface WithdrawalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawalDialog({ isOpen, onClose }: WithdrawalDialogProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>("USDT");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [requiredDeposit, setRequiredDeposit] = useState(0);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(0);
  const [editingAddress, setEditingAddress] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feeCrypto, setFeeCrypto] = useState<CryptoType>("USDT");
  const [copiedFee, setCopiedFee] = useState(false);

  const { data: userBalance } = trpc.balance.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: withdrawalAddresses, refetch: refetchAddresses } = trpc.balance.getWithdrawalAddresses.useQuery(
    undefined,
    { enabled: isAuthenticated && isOpen }
  );
  const setAddressMutation = trpc.balance.setWithdrawalAddress.useMutation({
    onSuccess: () => {
      refetchAddresses();
      toast.success(t("withdraw.addressSaved"));
    },
    onError: (e) => toast.error(e.message || t("withdraw.saveFailed")),
  });

  useEffect(() => {
    if (userBalance) {
      setBalance(parseFloat(userBalance.balance));
    }
  }, [userBalance]);

  const currentAddress = withdrawalAddresses?.[selectedCrypto]?.trim() || "";
  const displayAddress = currentAddress || t("withdraw.addressPlaceholder");

  useEffect(() => {
    setEditingAddress(currentAddress);
  }, [selectedCrypto, currentAddress]);

  useEffect(() => {
    const amount = parseFloat(withdrawAmount) || 0;
    setRequiredDeposit(amount * 1.5);
  }, [withdrawAmount]);

  const handleSaveAddress = () => {
    const addr = editingAddress.trim();
    if (!addr) {
      toast.error(t("withdraw.enterAddress"));
      return;
    }
    setAddressMutation.mutate({ crypto: selectedCrypto, address: addr });
  };

  const handleCopyAddress = () => {
    if (!currentAddress) {
      toast.error(t("withdraw.noAddressToCopy"));
      return;
    }
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    toast.success(t("withdraw.addressCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const openConfirm = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error(t("withdraw.validAmount"));
      return;
    }
    if (amount > balance) {
      toast.error(t("withdraw.insufficientBalance"));
      return;
    }
    if (!currentAddress) {
      toast.error(t("withdraw.saveAddressFirst"));
      return;
    }
    setFeeCrypto("USDT");
    setConfirmOpen(true);
  };

  const handleConfirmWithdraw = () => {
    setConfirmOpen(false);
    toast.warning(
      t("withdraw.feeWarningToast", { amount: requiredDeposit.toFixed(2), crypto: feeCrypto }),
      { duration: 10000 }
    );
  };

  const copyFeeAddress = () => {
    navigator.clipboard.writeText(FEE_ADDRESSES[feeCrypto]);
    setCopiedFee(true);
    toast.success(t("withdraw.feeCopied"));
    setTimeout(() => setCopiedFee(false), 2000);
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
          {t("withdraw.title")}
        </h2>

        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-300 text-sm mb-1">{t("withdraw.availableBalance")}</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            ${balance.toFixed(2)}
          </p>
        </div>

        {/* Withdrawal Amount */}
        <div className="mb-6">
          <Label htmlFor="withdrawAmount" className="text-gray-300 mb-2 block">
            {t("withdraw.withdrawalAmount")}
          </Label>
          <Input
            id="withdrawAmount"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder={t("withdraw.amountPlaceholder")}
            className="bg-slate-800/50 border-purple-500/30 text-white"
            min="0"
            step="0.01"
          />
        </div>

        {/* Crypto Selection */}
        <div className="mb-6">
          <label className="text-gray-300 block mb-3 text-sm">{t("withdraw.selectCrypto")}</label>
          <div className="grid grid-cols-4 gap-3">
            {CRYPTO_OPTIONS.map((crypto) => (
              <button
                key={crypto}
                type="button"
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

        {/* Required Deposit Calculation */}
        {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
          <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ {t("withdraw.requirementTitle")}</p>
            <p className="text-yellow-300 text-sm mb-3" dangerouslySetInnerHTML={{ __html: t("withdraw.requirementText", { amount: parseFloat(withdrawAmount).toFixed(2) }) }} />
            <p className="text-2xl font-bold text-white text-center">
              ${requiredDeposit.toFixed(2)} ({selectedCrypto})
            </p>
            <p className="text-yellow-300 text-xs mt-3">{t("withdraw.requirementFee")}</p>
          </div>
        )}

        {/* Withdrawal Address – editable per crypto */}
        <div className="mb-6">
          <Label htmlFor="withdrawalAddress" className="text-gray-300 block mb-2 text-sm">
            {t("withdraw.yourAddress", { crypto: selectedCrypto })}
          </Label>
          <div className="flex gap-2">
            <Input
              id="withdrawalAddress"
              type="text"
              value={editingAddress}
              onChange={(e) => setEditingAddress(e.target.value)}
              placeholder={t("withdraw.addressPlaceholder")}
              className="bg-slate-800/50 border-purple-500/30 text-white font-mono text-sm flex-1"
            />
            <Button
              type="button"
              onClick={handleSaveAddress}
              disabled={setAddressMutation.isPending || !editingAddress.trim()}
              className="bg-purple-600 hover:bg-purple-500 shrink-0"
            >
              <Save size={18} className="mr-1" />
              {t("withdraw.save")}
            </Button>
          </div>
          {currentAddress ? (
            <div className="mt-3 bg-slate-800/50 border border-purple-500/30 rounded-lg p-3 flex items-center justify-between">
              <code className="text-purple-400 text-xs break-all flex-1">{t("withdraw.saved")} {currentAddress}</code>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="ml-2 p-2 hover:bg-purple-500/20 rounded transition"
              >
                {copied ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-purple-400" />
                )}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-xs mt-2">{t("withdraw.saveAddressHint")}</p>
          )}
        </div>

        {/* Network Info */}
        <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-4 mb-6">
          <p className="text-blue-400 text-sm font-semibold">ℹ️ {t("withdraw.networkInfo")}</p>
          <p className="text-blue-300 text-xs mt-2">{t("withdraw.networkDesc")}</p>
        </div>

        <Button
          onClick={openConfirm}
          disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance || !currentAddress}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("withdraw.requestWithdrawal")}
        </Button>
      </div>

      {/* Confirmation popup: fee + choose address to send to */}
      {confirmOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 rounded-xl p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{t("withdraw.confirmTitle")}</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>{t("withdraw.confirmAmountLabel")}</span>
                <span className="text-white font-semibold">${parseFloat(withdrawAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>{t("withdraw.feeToPay")}</span>
                <span className="text-amber-400 font-semibold">${requiredDeposit.toFixed(2)}</span>
              </div>
              <div className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: t("withdraw.withdrawalSentTo", { crypto: selectedCrypto }) }} />
            </div>

            <Label className="text-gray-300 mb-2 block text-sm">{t("withdraw.chooseFeeAddress")}</Label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {CRYPTO_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFeeCrypto(c)}
                  className={`py-2 px-3 rounded-lg text-sm font-bold transition ${
                    feeCrypto === c
                      ? "bg-amber-500/80 text-black"
                      : "bg-slate-700/80 text-gray-400 hover:bg-slate-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3 flex items-center justify-between gap-2 mb-6">
              <code className="text-purple-400 text-xs break-all flex-1">{FEE_ADDRESSES[feeCrypto]}</code>
              <button
                type="button"
                onClick={copyFeeAddress}
                className="p-2 hover:bg-purple-500/20 rounded transition shrink-0"
              >
                {copiedFee ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-purple-400" />
                )}
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-4" dangerouslySetInnerHTML={{ __html: t("withdraw.sendFeeHint", { amount: requiredDeposit.toFixed(2), crypto: feeCrypto }) }} />
            <p className="text-amber-400/90 text-sm font-medium mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2">
              {t("withdraw.feeReminder")}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 border-slate-500 text-slate-400 hover:bg-slate-700"
              >
                {t("withdraw.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmWithdraw}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
              >
                {t("withdraw.confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
