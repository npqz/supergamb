import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Dices, CircleDot, Coins, Circle, Sparkles, Gamepad2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import LoginDialog from "./LoginDialog";

type GameId = "slots" | "dice" | "roulette" | "blackjack" | "coinflip" | "wheel";

const GAME_TAB_KEYS: { id: GameId; labelKey: string; icon: React.ReactNode }[] = [
  { id: "slots", labelKey: "games.slots", icon: <Sparkles className="w-4 h-4" /> },
  { id: "dice", labelKey: "games.dice", icon: <Dices className="w-4 h-4" /> },
  { id: "roulette", labelKey: "games.roulette", icon: <CircleDot className="w-4 h-4" /> },
  { id: "blackjack", labelKey: "games.blackjack", icon: <Gamepad2 className="w-4 h-4" /> },
  { id: "coinflip", labelKey: "games.coinflip", icon: <Coins className="w-4 h-4" /> },
  { id: "wheel", labelKey: "games.wheel", icon: <Circle className="w-4 h-4" /> },
];

const BET_CHIPS = [10, 25, 50, 100, 250, 500];

export default function GamesSection() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [activeGame, setActiveGame] = useState<GameId>("slots");
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Fetch user balance from database
  const { data: userBalance, refetch: refetchBalance } = trpc.balance.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateBalanceMutation = trpc.balance.update.useMutation();
  const playGameMutation = trpc.game.play.useMutation();

  useEffect(() => {
    if (userBalance) {
      setBalance(parseFloat(userBalance.balance));
    }
  }, [userBalance]);

  // Check if user is authenticated before allowing gameplay
  const checkAuth = () => {
    if (!isAuthenticated) {
      toast.error(t("games.pleaseLogin"));
      setLoginDialogOpen(true);
      return false;
    }
    return true;
  };

  // Slots Game
  const symbols = ["🍒", "🍋", "🍊", "🎰", "💎", "⭐"];
  const [slotReels, setSlotReels] = useState(["🎰", "🎰", "🎰"]);

  const playSlots = async () => {
    if (!checkAuth()) return;

    if (balance < betAmount) {
      toast.error(t("games.insufficientBalance"));
      return;
    }

    setIsSpinning(true);
    setGameResult(null);
    const newBalance = balance - betAmount;
    setBalance(newBalance);

    setTimeout(async () => {
      const newReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ];
      setSlotReels(newReels);

      let winAmount = 0;
      let message = "";

      if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
        winAmount = betAmount * 10;
        message = `🎉 JACKPOT! You won $${winAmount}!`;
      } else if (newReels[0] === newReels[1] || newReels[1] === newReels[2]) {
        winAmount = betAmount * 2;
        message = `✨ You won $${winAmount}!`;
      } else {
        message = t("games.tryAgain");
      }

      const finalBalance = newBalance + winAmount;
      setBalance(finalBalance);
      setGameResult(message);

      await updateBalanceMutation.mutateAsync({ newBalance: finalBalance.toFixed(2) });
      await playGameMutation.mutateAsync({
        gameType: "slots",
        betAmount: betAmount.toString(),
        winAmount: winAmount.toString(),
        result: JSON.stringify({ reels: newReels }),
      });
      refetchBalance();

      setIsSpinning(false);
    }, 1000);
  };

  // Dice Game (Stake/Roobet/Rainbet style: roll 0–100, Over/Under target, multiplier from win chance)
  const [diceRollOver, setDiceRollOver] = useState(true);
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [diceMessage, setDiceMessage] = useState("");

  const diceWinChance = diceRollOver
    ? (100 - diceTarget) / 100
    : diceTarget / 100;
  const diceMultiplier = diceWinChance > 0
    ? Math.min(0.99 / diceWinChance, 99)
    : 0;

  const playDice = async () => {
    if (!checkAuth()) return;
    if (balance < betAmount) {
      toast.error(t("games.insufficientBalance"));
      return;
    }

    setIsSpinning(true);
    setDiceMessage("");
    const newBalance = balance - betAmount;
    setBalance(newBalance);

    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 10000) / 100;
      setDiceResult(roll);

      const win =
        diceRollOver ? roll > diceTarget : roll < diceTarget;
      const winAmount = win
        ? Math.floor(betAmount * diceMultiplier * 100) / 100
        : 0;
      const finalBalance = newBalance + winAmount;
      setBalance(finalBalance);

      if (win) {
        setDiceMessage(t("games.diceWin", {
          roll: roll.toFixed(2),
          direction: diceRollOver ? t("games.rollOver") : t("games.rollUnder"),
          target: diceTarget,
          amount: winAmount.toFixed(2),
          mult: diceMultiplier.toFixed(2),
        }));
      } else {
        setDiceMessage(t("games.diceLose", {
          roll: roll.toFixed(2),
          direction: diceRollOver ? t("games.rollUnder") : t("games.rollOver"),
          target: diceTarget,
        }));
      }

      await updateBalanceMutation.mutateAsync({ newBalance: finalBalance.toFixed(2) });
      await playGameMutation.mutateAsync({
        gameType: "dice",
        betAmount: betAmount.toString(),
        winAmount: winAmount.toFixed(2),
        result: JSON.stringify({ roll, target: diceTarget, over: diceRollOver, multiplier: diceMultiplier }),
      });
      refetchBalance();
      setIsSpinning(false);
    }, 800);
  };

  // Roulette Game
  const [rouletteNumber, setRouletteNumber] = useState(0);
  const [rouletteColor, setRouletteColor] = useState<"red" | "black" | "green">("green");
  const [rouletteMessage, setRouletteMessage] = useState("");

  const playRoulette = async () => {
    if (!checkAuth()) return;

    if (balance < betAmount) {
      toast.error(t("games.insufficientBalance"));
      return;
    }

    setIsSpinning(true);
    setGameResult(null);
    const newBalance = balance - betAmount;
    setBalance(newBalance);

    setTimeout(async () => {
      const number = Math.floor(Math.random() * 37);
      let color: "red" | "black" | "green" = "black";

      if (number === 0) {
        color = "green";
      } else if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number)) {
        color = "red";
      }

      setRouletteNumber(number);
      setRouletteColor(color);

      let winAmount = 0;
      let message = "";

      if (number === 0) {
        winAmount = betAmount * 35;
        message = `🎯 GREEN ZERO! You won $${winAmount}!`;
      } else if (color === "red") {
        winAmount = betAmount * 2;
        message = `🔴 Red ${number}! You won $${winAmount}!`;
      } else {
        message = `⚫ Black ${number}. Try again!`;
      }

      const finalBalance = newBalance + winAmount;
      setBalance(finalBalance);
      setRouletteMessage(message);

      await updateBalanceMutation.mutateAsync({ newBalance: finalBalance.toFixed(2) });
      await playGameMutation.mutateAsync({
        gameType: "roulette",
        betAmount: betAmount.toString(),
        winAmount: winAmount.toString(),
        result: JSON.stringify({ number, color }),
      });
      refetchBalance();

      setIsSpinning(false);
    }, 1500);
  };

  // Blackjack Game
  const [dealerCards, setDealerCards] = useState<string[]>([]);
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [blackjackMessage, setBlackjackMessage] = useState("");
  const [blackjackInProgress, setBlackjackInProgress] = useState(false);

  const getCardValue = (card: string) => {
    if (["J", "Q", "K"].includes(card)) return 10;
    if (card === "A") return 11;
    return parseInt(card);
  };

  const calculateTotal = (cards: string[]) => {
    let total = cards.reduce((sum, card) => sum + getCardValue(card), 0);
    let aces = cards.filter((c) => c === "A").length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  const dealBlackjack = async () => {
    if (!checkAuth()) return;

    if (balance < betAmount) {
      toast.error(t("games.insufficientBalance"));
      return;
    }

    const newBalance = balance - betAmount;
    setBalance(newBalance);

    const cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const dealerHand = [cards[Math.floor(Math.random() * cards.length)]];
    const playerHand = [
      cards[Math.floor(Math.random() * cards.length)],
      cards[Math.floor(Math.random() * cards.length)],
    ];

    setDealerCards(dealerHand);
    setPlayerCards(playerHand);
    setDealerTotal(calculateTotal(dealerHand));
    setPlayerTotal(calculateTotal(playerHand));
    setBlackjackMessage("");
    setBlackjackInProgress(true);
  };

  const hitBlackjack = () => {
    const cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const newCard = cards[Math.floor(Math.random() * cards.length)];
    const newPlayerCards = [...playerCards, newCard];
    setPlayerCards(newPlayerCards);
    const newTotal = calculateTotal(newPlayerCards);
    setPlayerTotal(newTotal);

    if (newTotal > 21) {
      standBlackjack(newPlayerCards);
    }
  };

  const standBlackjack = async (currentPlayerCards = playerCards) => {
    const cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    let newDealerCards = [...dealerCards];
    let newDealerTotal = calculateTotal(newDealerCards);

    while (newDealerTotal < 17) {
      const newCard = cards[Math.floor(Math.random() * cards.length)];
      newDealerCards.push(newCard);
      newDealerTotal = calculateTotal(newDealerCards);
    }

    setDealerCards(newDealerCards);
    setDealerTotal(newDealerTotal);

    const playerFinalTotal = calculateTotal(currentPlayerCards);
    let winAmount = 0;
    let message = "";

    if (playerFinalTotal > 21) {
      message = `You bust. Dealer: ${newDealerTotal}, You: ${playerFinalTotal}`;
    } else if (newDealerTotal > 21) {
      winAmount = betAmount * 2;
      message = `Dealer busts! You won $${winAmount}!`;
    } else if (playerFinalTotal > newDealerTotal) {
      winAmount = betAmount * 2;
      message = `You win! You won $${winAmount}!`;
    } else if (playerFinalTotal === newDealerTotal) {
      winAmount = betAmount;
      message = t("games.pushBetReturned");
    } else {
      message = `You lose. Dealer: ${newDealerTotal}, You: ${playerFinalTotal}`;
    }

    const finalBalance = balance + winAmount;
    setBalance(finalBalance);
    setBlackjackMessage(message);
    setBlackjackInProgress(false);

    await updateBalanceMutation.mutateAsync({ newBalance: finalBalance.toFixed(2) });
    await playGameMutation.mutateAsync({
      gameType: "blackjack",
      betAmount: betAmount.toString(),
      winAmount: winAmount.toString(),
      result: JSON.stringify({ dealerCards: newDealerCards, playerCards: currentPlayerCards }),
    });
    refetchBalance();
  };

  // Coin Flip Game
  const [coinChoice, setCoinChoice] = useState<"heads" | "tails" | null>(null);
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  const [coinMessage, setCoinMessage] = useState("");

  const playCoinFlip = async () => {
    if (!checkAuth()) return;
    if (coinChoice === null) {
      toast.error(t("games.pickHeadsOrTails"));
      return;
    }
    if (balance < betAmount) {
      toast.error(t("games.insufficientBalance"));
      return;
    }

    setIsSpinning(true);
    setCoinMessage("");
    const newBalance = balance - betAmount;
    setBalance(newBalance);

    setTimeout(async () => {
      const result: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
      setCoinResult(result);

      const win = result === coinChoice;
      const winAmount = win ? betAmount * 2 : 0;
      const finalBalance = newBalance + winAmount;
      setBalance(finalBalance);
      setCoinMessage(win ? `🎉 ${result.toUpperCase()}! You won $${winAmount}!` : `😔 It was ${result}. Try again!`);

      await updateBalanceMutation.mutateAsync({ newBalance: finalBalance.toFixed(2) });
      await playGameMutation.mutateAsync({
        gameType: "coinflip",
        betAmount: betAmount.toString(),
        winAmount: winAmount.toString(),
        result: JSON.stringify({ choice: coinChoice, result }),
      });
      refetchBalance();
      setIsSpinning(false);
    }, 1200);
  };

  // Wheel Game (multiplier wheel)
  const WHEEL_SEGMENTS = [1, 2, 2, 3, 1.5, 5, 1, 2, 10, 1, 1.5, 3];
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelMultiplier, setWheelMultiplier] = useState(0);
  const [wheelMessage, setWheelMessage] = useState("");

  const playWheel = async () => {
    if (!checkAuth()) return;
    if (balance < betAmount) {
      toast.error(t("games.insufficientBalance"));
      return;
    }

    setIsSpinning(true);
    setWheelMessage("");
    const newBalance = balance - betAmount;
    setBalance(newBalance);

    const spins = 5 + Math.random() * 4;
    const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const multiplier = WHEEL_SEGMENTS[segmentIndex];
    const degPerSegment = 360 / WHEEL_SEGMENTS.length;
    const targetDeg = 360 * spins + (segmentIndex * degPerSegment + degPerSegment / 2);

    setWheelRotation(targetDeg);

    setTimeout(async () => {
      const winAmount = Math.floor(betAmount * multiplier * 100) / 100;
      const finalBalance = newBalance + winAmount;
      setBalance(finalBalance);
      setWheelMultiplier(multiplier);
      setWheelMessage(multiplier >= 5 ? `🔥 ${multiplier}x! You won $${winAmount}!` : `You got ${multiplier}x — $${winAmount} won!`);

      await updateBalanceMutation.mutateAsync({ newBalance: finalBalance.toFixed(2) });
      await playGameMutation.mutateAsync({
        gameType: "wheel",
        betAmount: betAmount.toString(),
        winAmount: winAmount.toString(),
        result: JSON.stringify({ multiplier }),
      });
      refetchBalance();
      setIsSpinning(false);
    }, 4000);
  };

  const BetControls = () => (
    <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <p className="text-gray-400 text-sm font-medium mb-2">{t("games.betAmountLabel")}</p>
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {BET_CHIPS.map((chip, i) => (
          <motion.button
            key={chip}
            type="button"
            onClick={() => setBetAmount(chip)}
            disabled={!isAuthenticated || chip > balance}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              betAmount === chip
                ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/30"
                : "bg-slate-700/80 text-gray-300 hover:bg-slate-600 disabled:opacity-40"
            } ${betAmount === chip ? "animate-chip-glow" : ""}`}
          >
            ${chip}
          </motion.button>
        ))}
      </div>
      <div className="flex items-center gap-3 max-w-xs mx-auto">
        <input
          type="range"
          min="10"
          max={Math.min(500, Math.max(100, balance))}
          step="10"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none bg-slate-700 accent-purple-500 transition-opacity"
          disabled={!isAuthenticated}
        />
        <motion.span key={betAmount} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-white font-mono font-bold w-14 inline-block">${betAmount}</motion.span>
      </div>
    </motion.div>
  );

  return (
    <>
      <motion.section
        id="games"
        className="py-24 px-4 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Play Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500">Games</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Provably fair games with instant payouts. Pick a game and place your bet.
            </p>
          </motion.div>

          <AnimatePresence>
            {!isAuthenticated && (
              <motion.div
                className="relative overflow-hidden bg-slate-800/60 border border-slate-600/50 rounded-2xl p-10 mb-10 text-center backdrop-blur-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10" />
                <Lock className="relative mx-auto mb-4 text-violet-400" size={52} />
                <h3 className="relative text-2xl font-bold text-white mb-2">Login to play</h3>
                <p className="relative text-slate-400 mb-6">Sign in or register to play and track your balance.</p>
                <motion.div className="relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setLoginDialogOpen(true)}
                    className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-violet-500/20"
                  >
                    Login / Register
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Tabs */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {GAME_TAB_KEYS.map(({ id, labelKey, icon }, i) => (
              <motion.button
                key={id}
                type="button"
                onClick={() => setActiveGame(id)}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.04 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors ${
                  activeGame === id
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                }`}
              >
                {icon}
                {t(labelKey)}
              </motion.button>
            ))}
          </motion.div>

          {/* Game Area */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-slate-600/50 bg-slate-900/80 shadow-2xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-fuchsia-950/20 pointer-events-none" />
            <div className="relative p-8 md:p-10">
            {/* Balance */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <motion.div
                key={balance}
                className="px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 animate-balance-pulse"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">{t("games.balance")}</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">${balance.toFixed(2)}</p>
              </motion.div>
            </div>

            {/* Slots Game */}
            <AnimatePresence mode="wait">
              {activeGame === "slots" && (
                <motion.div
                  className="text-center"
                  key="slots"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex justify-center gap-3 sm:gap-4 mb-8">
                    {slotReels.map((symbol, index) => (
                      <motion.div
                        key={`${index}-${symbol}-${slotReels.join("")}`}
                        className={`rounded-xl w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center text-4xl sm:text-5xl shadow-xl border-2 transition-colors duration-300 ${
                          isSpinning ? "border-violet-400/60 bg-violet-500/20 animate-pulse" : "border-slate-600 bg-slate-800/90"
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                      >
                        {symbol}
                      </motion.div>
                    ))}
                  </div>
                  <AnimatePresence>
                    {gameResult && (
                      <motion.div
                        className="mb-6 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-lg text-violet-300 animate-result-pop"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {gameResult}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <BetControls />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={playSlots}
                      disabled={isSpinning || !isAuthenticated}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-10 py-6 text-lg rounded-xl disabled:opacity-50 w-full sm:w-auto"
                    >
                      {isSpinning ? "Spinning..." : `Spin — $${betAmount}`}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dice Game (Stake/Roobet style) */}
            <AnimatePresence mode="wait">
              {activeGame === "dice" && (
                <motion.div
                  className="text-center max-w-md mx-auto"
                  key="dice"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex gap-2 justify-center mb-4">
                    <button
                      type="button"
                      onClick={() => setDiceRollOver(true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${diceRollOver ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
                    >
                      {t("games.rollOver")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiceRollOver(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${!diceRollOver ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
                    >
                      {t("games.rollUnder")}
                    </button>
                  </div>
                  <div className="mb-2 text-slate-400 text-sm">
                    {diceRollOver ? t("games.rollOverTarget", { target: diceTarget }) : t("games.rollUnderTarget", { target: diceTarget })}
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={diceTarget}
                    onChange={(e) => setDiceTarget(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-slate-600 accent-amber-500 mb-4"
                  />
                  <div className="flex justify-between text-sm text-slate-400 mb-6">
                    <span>{t("games.winChance")}: {(diceWinChance * 100).toFixed(2)}%</span>
                    <span>{t("games.multiplier")}: {diceMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="mb-6">
                    <motion.div
                      key={diceResult ?? "wait"}
                      className={`w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-mono font-bold shadow-xl border-2 transition-colors ${
                        isSpinning ? "border-amber-400/60 bg-amber-500/20" : "border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800"
                      }`}
                      initial={{ rotate: 0, scale: 0.9 }}
                      animate={{ rotate: 360, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      {isSpinning ? "…" : diceResult != null ? diceResult.toFixed(2) : "0.00"}
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {diceMessage && (
                      <motion.div
                        className="mb-6 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-lg text-amber-300 animate-result-pop"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {diceMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <BetControls />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={playDice}
                      disabled={isSpinning || !isAuthenticated}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-10 py-6 text-lg rounded-xl disabled:opacity-50"
                    >
                      {isSpinning ? t("games.rolling") : `${t("games.roll")} — $${betAmount}`}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Roulette Game */}
            <AnimatePresence mode="wait">
              {activeGame === "roulette" && (
                <motion.div
                  className="text-center"
                  key="roulette"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8">
                    <motion.div
                      key={`${rouletteNumber}-${rouletteColor}`}
                      className={`w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl border-4 border-slate-600 ${
                        rouletteColor === "red"
                          ? "bg-red-600"
                          : rouletteColor === "green"
                          ? "bg-emerald-600"
                          : "bg-slate-800"
                      }`}
                      initial={{ scale: 0.5, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    >
                      <span className="text-white drop-shadow">{rouletteNumber}</span>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {rouletteMessage && (
                      <motion.div
                        className="mb-6 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-lg text-slate-200 animate-result-pop"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {rouletteMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <BetControls />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={playRoulette}
                      disabled={isSpinning || !isAuthenticated}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-10 py-6 text-lg rounded-xl disabled:opacity-50"
                    >
                      {isSpinning ? "Spinning..." : `Spin — $${betAmount}`}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Blackjack Game */}
            <AnimatePresence mode="wait">
              {activeGame === "blackjack" && (
                <motion.div
                  className="text-center"
                  key="blackjack"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-8">
                    <motion.div
                      className="rounded-xl bg-slate-800/60 border border-slate-600/50 p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">Dealer</h4>
                      <div className="flex justify-center gap-2 mb-2 flex-wrap">
                        {dealerCards.map((card, index) => (
                          <motion.div
                            key={`d-${index}-${card}`}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="rounded-lg w-14 h-20 sm:w-16 sm:h-24 flex items-center justify-center text-xl sm:text-2xl font-bold bg-white text-slate-900 shadow-lg border border-slate-200"
                          >
                            {card}
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-slate-400 text-sm font-mono">Total: {dealerTotal}</p>
                    </motion.div>
                    <motion.div
                      className="rounded-xl bg-slate-800/60 border border-slate-600/50 p-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h4 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">You</h4>
                      <div className="flex justify-center gap-2 mb-2 flex-wrap">
                        {playerCards.map((card, index) => (
                          <motion.div
                            key={`p-${index}-${card}`}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.08 }}
                            className="rounded-lg w-14 h-20 sm:w-16 sm:h-24 flex items-center justify-center text-xl sm:text-2xl font-bold bg-white text-slate-900 shadow-lg border border-slate-200"
                          >
                            {card}
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-slate-400 text-sm font-mono">Total: {playerTotal}</p>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {blackjackMessage && (
                      <motion.div
                        className="mb-6 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-lg text-violet-300 animate-result-pop"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {blackjackMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <BetControls />
                  <div className="flex justify-center gap-4 flex-wrap">
                    {!blackjackInProgress ? (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={dealBlackjack}
                          disabled={!isAuthenticated}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-6 text-lg rounded-xl"
                        >
                          Deal — ${betAmount}
                        </Button>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={hitBlackjack} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl">Hit</Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={() => standBlackjack()} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-xl">Stand</Button>
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Coin Flip Game */}
            <AnimatePresence mode="wait">
              {activeGame === "coinflip" && (
                <motion.div
                  className="text-center"
                  key="coinflip"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8 flex justify-center gap-6">
                    <motion.button
                      type="button"
                      onClick={() => setCoinChoice("heads")}
                      disabled={isSpinning || !isAuthenticated}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-2xl w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-4xl border-2 transition-colors ${
                        coinChoice === "heads" ? "border-amber-400 bg-amber-500/30" : "border-slate-600 bg-slate-800/80 hover:border-slate-500"
                      }`}
                    >
                      👑
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setCoinChoice("tails")}
                      disabled={isSpinning || !isAuthenticated}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-2xl w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-4xl border-2 transition-colors ${
                        coinChoice === "tails" ? "border-amber-400 bg-amber-500/30" : "border-slate-600 bg-slate-800/80 hover:border-slate-500"
                      }`}
                    >
                      🦅
                    </motion.button>
                  </div>
                  <AnimatePresence mode="wait">
                    {coinResult && (
                      <motion.div
                        key={coinResult}
                        className="mb-4 text-5xl inline-block"
                        initial={{ scale: 0, rotateY: 0 }}
                        animate={{ scale: 1, rotateY: 1080 }}
                        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
                      >
                        {coinResult === "heads" ? "👑" : "🦅"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {coinMessage && (
                      <motion.div
                        className="mb-6 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-lg text-amber-300 animate-result-pop"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {coinMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <BetControls />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={playCoinFlip}
                      disabled={isSpinning || coinChoice === null || !isAuthenticated}
                      className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-semibold px-10 py-6 text-lg rounded-xl disabled:opacity-50"
                    >
                      {isSpinning ? "Flipping..." : `Flip — $${betAmount}`}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wheel Game */}
            <AnimatePresence mode="wait">
              {activeGame === "wheel" && (
                <motion.div
                  className="text-center"
                  key="wheel"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8 relative inline-block">
                    <motion.div
                      className="w-56 h-56 sm:w-72 sm:h-72 rounded-full border-8 border-slate-600 overflow-hidden"
                      style={{
                        background: `conic-gradient(${WHEEL_SEGMENTS.map((mult, i) => {
                          const hue = (i * 360) / WHEEL_SEGMENTS.length;
                          return `hsl(${hue}, 60%, 45%) ${(i / WHEEL_SEGMENTS.length) * 360}deg ${((i + 1) / WHEEL_SEGMENTS.length) * 360}deg`;
                        }).join(", ")})`,
                      }}
                      animate={{ rotate: wheelRotation }}
                      transition={{ duration: isSpinning ? 4 : 0, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                    <motion.div
                      className="absolute inset-0 flex items-start justify-center pt-2 pointer-events-none"
                      animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0, repeatDelay: 0.2 }}
                    >
                      <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {wheelMessage && (
                      <motion.div
                        className="mb-6 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-lg text-cyan-300 animate-result-pop"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {wheelMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <BetControls />
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={playWheel}
                      disabled={isSpinning || !isAuthenticated}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-10 py-6 text-lg rounded-xl disabled:opacity-50"
                    >
                      {isSpinning ? "Spinning..." : `Spin — $${betAmount}`}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Login Dialog */}
      <LoginDialog 
        isOpen={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)}
        onSuccess={() => {
          setLoginDialogOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}
