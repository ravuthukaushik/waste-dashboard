"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import ModelViewer from "@/components/ModelViewer";

export default function HeroSection({ viewer, onSignOut }) {
  return (
    <motion.section
      className="hero-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <div className="hero-section-inner">
        <Navbar viewer={viewer} onSignOut={onSignOut} />

        <div className="hero-section-content">
          <motion.div
            className="hero-section-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut", delay: 0.06 }}
          >
            <p className="eyebrow">IIT Bombay Sustainability Cell</p>
            <h1 className="hero-heading-glow">
              Track Sustainability <br />
              <span>Across Campus</span>
            </h1>
            <p className="hero-section-subtitle">
              IIT Bombay&apos;s flagship inter-hostel competition designed to promote
              sustainable practices across hostels.
            </p>
          </motion.div>

          <motion.div
            className="hero-model-stage"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut", delay: 0.1 }}
          >
            <div className="hero-model-glow" aria-hidden="true" />
            <ModelViewer
              url="/models/earth.glb"
              width="100%"
              height="100%"
              ambientIntensity={1.12}
              keyLightIntensity={1.32}
              fillLightIntensity={0.62}
              rimLightIntensity={0.4}
              autoRotate={false}
              enableHoverRotation
              enableMouseParallax
              enableManualRotation
              enableManualZoom={false}
              showScreenshotButton={false}
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
