import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../context/ThemeContext';

const AnimatedAvatar: React.FC = () => {
  const avatarRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!avatarRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });
    
    // Continuous rotation for outer orbital rings
    tl.to(".orbital-ring-1", {
      rotation: 360,
      duration: 15,
      ease: "none",
      transformOrigin: "center center"
    }, 0);

    tl.to(".orbital-ring-2", {
      rotation: -360,
      duration: 20,
      ease: "none",
      transformOrigin: "center center"
    }, 0);

    tl.to(".orbital-ring-3", {
      rotation: 360,
      duration: 12,
      ease: "none",
      transformOrigin: "center center"
    }, 0);

    // Inner core rotations
    tl.to(".core-ring-1", {
      rotation: -360,
      duration: 8,
      ease: "none",
      transformOrigin: "center center"
    }, 0);

    tl.to(".core-ring-2", {
      rotation: 360,
      duration: 6,
      ease: "none",
      transformOrigin: "center center"
    }, 0);

    // Pulsating energy waves
    tl.to(".energy-wave-1", {
      scale: 1.3,
      opacity: 0.8,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "center center"
    }, 0);

    tl.to(".energy-wave-2", {
      scale: 1.2,
      opacity: 0.6,
      duration: 4,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "center center"
    }, 1);

    tl.to(".energy-wave-3", {
      scale: 1.15,
      opacity: 0.4,
      duration: 5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "center center"
    }, 2);

    // Floating particles animation
    tl.to(".particle", {
      y: -10,
      x: 5,
      scale: 1.2,
      opacity: 0.9,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.3,
      transformOrigin: "center center"
    }, 0);

    // Core breathing effect
    tl.to(".ai-core", {
      scale: 1.1,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "center center"
    }, 0);

    // Neural network lines animation
    tl.to(".neural-line", {
      strokeDashoffset: -100,
      duration: 4,
      ease: "none",
      repeat: -1,
      stagger: 0.5
    }, 0);

    return () => {
      tl.kill();
    };
  }, []);

  const colors = theme === 'dark' 
    ? {
        primary: '#00E5FF',
        secondary: '#40C4FF',
        tertiary: '#0288D1',
        quaternary: '#01579B',
        accent: '#00BCD4',
        glow: '#00E5FF',
        neural: '#80DEEA'
      }
    : {
        primary: '#0288D1',
        secondary: '#0277BD',
        tertiary: '#01579B',
        quaternary: '#004D40',
        accent: '#00ACC1',
        glow: '#0288D1',
        neural: '#4DD0E1'
      };

  return (
    <div className="flex justify-center mb-8">
      <div className="relative">
        <svg
          ref={avatarRef}
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="drop-shadow-2xl"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="1"/>
              <stop offset="30%" stopColor={colors.secondary} stopOpacity="0.9"/>
              <stop offset="70%" stopColor={colors.tertiary} stopOpacity="0.7"/>
              <stop offset="100%" stopColor={colors.quaternary} stopOpacity="0.5"/>
            </radialGradient>

            <radialGradient id="energyGradient" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor={colors.glow} stopOpacity="0"/>
              <stop offset="60%" stopColor={colors.primary} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={colors.accent} stopOpacity="0.8"/>
            </radialGradient>

            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.neural} stopOpacity="0.8"/>
              <stop offset="50%" stopColor={colors.primary} stopOpacity="0.6"/>
              <stop offset="100%" stopColor={colors.accent} stopOpacity="0.9"/>
            </linearGradient>
          </defs>
          
          {/* Energy waves */}
          <circle
            cx="70"
            cy="70"
            r="65"
            fill="url(#energyGradient)"
            className="energy-wave-1"
            filter="url(#glow)"
            opacity="0.3"
          />
          
          <circle
            cx="70"
            cy="70"
            r="55"
            fill="none"
            stroke={colors.glow}
            strokeWidth="1"
            opacity="0.4"
            className="energy-wave-2"
            filter="url(#glow)"
          />

          <circle
            cx="70"
            cy="70"
            r="45"
            fill="none"
            stroke={colors.primary}
            strokeWidth="0.5"
            opacity="0.3"
            className="energy-wave-3"
          />
          
          {/* Orbital rings with unique patterns */}
          <circle
            cx="70"
            cy="70"
            r="52"
            fill="none"
            stroke="url(#neuralGradient)"
            strokeWidth="3"
            strokeDasharray="15 8 5 8 3 8"
            opacity="0.8"
            className="orbital-ring-1"
            filter="url(#innerGlow)"
          />
          
          <circle
            cx="70"
            cy="70"
            r="46"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="2.5"
            strokeDasharray="12 6 8 6 4 6"
            opacity="0.7"
            className="orbital-ring-2"
          />

          <circle
            cx="70"
            cy="70"
            r="40"
            fill="none"
            stroke={colors.tertiary}
            strokeWidth="2"
            strokeDasharray="10 4 6 4 2 4"
            opacity="0.6"
            className="orbital-ring-3"
          />
          
          {/* Neural network lines */}
          <path
            d="M 30 70 Q 50 50 70 70 Q 90 90 110 70"
            fill="none"
            stroke={colors.neural}
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.5"
            className="neural-line"
          />

          <path
            d="M 70 30 Q 90 50 70 70 Q 50 90 70 110"
            fill="none"
            stroke={colors.neural}
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.5"
            className="neural-line"
          />

          <path
            d="M 45 45 Q 70 60 95 45 Q 80 70 95 95 Q 70 80 45 95 Q 60 70 45 45"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.4"
            className="neural-line"
          />
          
          {/* Core rings */}
          <circle
            cx="70"
            cy="70"
            r="32"
            fill="none"
            stroke={colors.primary}
            strokeWidth="3"
            strokeDasharray="20 10"
            opacity="0.9"
            className="core-ring-1"
            filter="url(#innerGlow)"
          />
          
          <circle
            cx="70"
            cy="70"
            r="26"
            fill="none"
            stroke={colors.accent}
            strokeWidth="2.5"
            strokeDasharray="15 8"
            opacity="0.8"
            className="core-ring-2"
          />
          
          {/* AI Core */}
          <circle
            cx="70"
            cy="70"
            r="20"
            fill="url(#coreGradient)"
            className="ai-core"
            opacity="0.95"
            filter="url(#innerGlow)"
          />
          
          <circle
            cx="70"
            cy="70"
            r="14"
            fill={colors.primary}
            opacity="0.9"
            className="ai-core"
          />
          
          <circle
            cx="70"
            cy="70"
            r="8"
            fill={colors.glow}
            opacity="1"
            filter="url(#innerGlow)"
          />

          <circle
            cx="70"
            cy="70"
            r="4"
            fill="white"
            opacity="0.9"
          />
          
          {/* Floating particles */}
          <circle cx="70" cy="35" r="2" fill={colors.primary} opacity="0.8" className="particle orbital-ring-1"/>
          <circle cx="105" cy="70" r="1.5" fill={colors.secondary} opacity="0.7" className="particle orbital-ring-2"/>
          <circle cx="70" cy="105" r="2" fill={colors.accent} opacity="0.8" className="particle orbital-ring-1"/>
          <circle cx="35" cy="70" r="1.5" fill={colors.glow} opacity="0.9" className="particle orbital-ring-2"/>
          
          <circle cx="90" cy="50" r="1" fill={colors.neural} opacity="0.6" className="particle orbital-ring-3"/>
          <circle cx="50" cy="90" r="1" fill={colors.primary} opacity="0.6" className="particle orbital-ring-3"/>
          <circle cx="50" cy="50" r="1" fill={colors.accent} opacity="0.7" className="particle core-ring-1"/>
          <circle cx="90" cy="90" r="1" fill={colors.secondary} opacity="0.7" className="particle core-ring-1"/>

          {/* Data nodes */}
          <rect x="68" y="25" width="4" height="4" rx="2" fill={colors.primary} opacity="0.8" className="particle"/>
          <rect x="111" y="68" width="3" height="3" rx="1.5" fill={colors.accent} opacity="0.7" className="particle"/>
          <rect x="68" y="111" width="4" height="4" rx="2" fill={colors.secondary} opacity="0.8" className="particle"/>
          <rect x="25" y="68" width="3" height="3" rx="1.5" fill={colors.glow} opacity="0.9" className="particle"/>
        </svg>
      </div>
    </div>  
  );
};

export default AnimatedAvatar;