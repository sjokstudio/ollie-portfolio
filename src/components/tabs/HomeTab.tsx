"use client";
import { motion, AnimatePresence } from "framer-motion";
import BootLogin from "@/components/BootLogin";
import DesktopOS from "@/components/desktop/DesktopOS";

export default function HomeTab({
  isLaunched,
  setIsLaunched,
  onGoSystem,
}: {
  isLaunched: boolean;
  setIsLaunched: (val: boolean) => void;
  onGoSystem: () => void;
}) {
  const handleEnter = () => {
    setIsLaunched(true);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Boot / Login (shown when not launched) */}
      {!isLaunched && <BootLogin onEnter={handleEnter} />}

      {/* Desktop OS */}
      <AnimatePresence>
        {isLaunched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50"
          >
            <DesktopOS onGoSystem={onGoSystem} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
