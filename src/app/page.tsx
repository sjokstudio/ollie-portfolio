"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeTab from "@/components/tabs/HomeTab";
import WorksTab from "@/components/tabs/WorksTab";
import SystemTab from "@/components/tabs/SystemTab";
import { PillNav } from "@/components/PillNav";

export type TabType = "home" | "works" | "system";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isLaunched, setIsLaunched] = useState(false); // Has the user zoomed into the OS?

  // Listen for hash changes to sync tabs, like the original
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["home", "works", "system"].includes(hash)) {
        setActiveTab(hash as TabType);
        if (hash !== "home") setIsLaunched(true);
      } else {
        setActiveTab("home");
      }
    };
    
    // Initial check
    if (window.location.hash) {
      handleHashChange();
    }
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (tab: TabType) => {
    if (tab !== "home") setIsLaunched(true);
    window.location.hash = tab;
  };

  return (
    <main className="w-full min-h-screen relative bg-background">
      {(isLaunched || activeTab !== "home") && <PillNav activeTab={activeTab} onChange={handleTabChange} />}

      <AnimatePresence mode="wait">
        {activeTab === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full absolute inset-0"
          >
            <HomeTab isLaunched={isLaunched} setIsLaunched={setIsLaunched} onGoSystem={() => handleTabChange("system")} />
          </motion.div>
        )}
        
        {activeTab === "works" && (
          <motion.div
            key="works"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full absolute inset-0 overflow-y-auto"
          >
            <WorksTab />
          </motion.div>
        )}

        {activeTab === "system" && (
          <motion.div
            key="system"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full absolute inset-0"
          >
            <SystemTab />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
