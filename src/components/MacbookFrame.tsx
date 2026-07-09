"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function MacbookFrame({
  children,
  isZooming,
}: {
  children: ReactNode;
  isZooming: boolean;
}) {
  return (
    <motion.div
      className="relative w-[90vw] max-w-[800px] aspect-[16/10] mx-auto perspective-1000"
      initial={{ scale: 1 }}
      animate={
        isZooming
          ? {
              scale: [1, 1.2, 5],
              y: [0, 50, 200],
              opacity: [1, 1, 0],
            }
          : { scale: 1, y: 0, opacity: 1 }
      }
      transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Outer aluminum bezel */}
      <div className="absolute inset-0 bg-[#1a1a1a] rounded-[24px] p-[16px] shadow-2xl border border-[#333]">
        {/* Notch */}
        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-[#000] rounded-b-[12px] z-20"></div>

        {/* Screen */}
        <div className="relative w-full h-full bg-black rounded-[8px] overflow-hidden border border-[#222]">
          {children}
        </div>
      </div>
      
      {/* Bottom base lip */}
      <div className="absolute -bottom-[12px] left-[5%] right-[5%] h-[12px] bg-[#222] rounded-b-[16px] blur-[1px]"></div>
    </motion.div>
  );
}
