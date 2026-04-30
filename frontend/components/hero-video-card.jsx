"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function HeroVideoCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className="hero-ambient hero-video-shell"
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
      aria-hidden="true"
    >
      {mounted ? (
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => {}}
        >
          <source src="/earth.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="hero-video hero-video-placeholder" />
      )}
      <div className="hero-video-overlay" />
    </motion.div>
  );
}
