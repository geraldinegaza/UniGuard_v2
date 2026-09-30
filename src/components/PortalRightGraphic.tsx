import React, { useState } from 'react';
import { ExternalLink, Radio, Shield, Waves, MapPin, Eye, Activity } from 'lucide-react';

interface PortalRightGraphicProps {
  className?: string;
}

export const PortalRightGraphic: React.FC<PortalRightGraphicProps> = ({ className = '' }) => {
  const [activeView, setActiveView] = useState<'hologram' | 'ground_photo'>('hologram');

  return (
    <div className={`relative w-full h-full min-h-[580px] overflow-hidden select-none bg-white ${className}`}>
      
      {/* ========================================================================= */}
      {/* 1. Organic Fluid Splash Silhouette (Faithful copy of reference shape)     */}
      {/* ========================================================================= */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 540 640"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep Navy/Indigo/Purple Gradient matching reference screenshot */}
          <linearGradient id="fluidWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14154c" />
            <stop offset="35%" stopColor="#1b1a6a" />
            <stop offset="70%" stopColor="#282282" />
            <stop offset="100%" stopColor="#382fa0" />
          </linearGradient>

          {/* Radial glow for bottom pedestal ambience */}
          <radialGradient id="pedestalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1b1a6a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* The Giant Organic Splash Wave cutting into the white card from the right */}
        <path
          d="M 230,0 
             C 270,40 330,60 410,20 
             C 450,0 490,-10 540,0 
             L 540,640 
             L 210,640 
             C 170,580 135,530 160,470 
             C 175,435 210,420 215,370 
             C 220,315 160,285 135,230 
             C 115,185 140,135 180,95 
             C 220,55 200,20 230,0 Z"
          fill="url(#fluidWaveGrad)"
        />

        {/* Detached organic splash droplet (Top-left of wave curve, exact reference detail) */}
        <path
          d="M 105,375 
             C 95,355 105,335 120,335 
             C 135,335 145,355 135,375 
             C 125,395 115,395 105,375 Z"
          fill="url(#fluidWaveGrad)"
          transform="rotate(-15, 120, 365)"
        />

        {/* Smaller detached fluid droplet lower down */}
        <circle cx="85" cy="445" r="9" fill="url(#fluidWaveGrad)" />
        <circle cx="95" cy="465" r="5" fill="url(#fluidWaveGrad)" />

        {/* Floating small circular splash accent */}
        <circle cx="510" cy="180" r="14" fill="#252175" opacity="0.8" />
        <circle cx="495" cy="140" r="6" fill="#322a90" opacity="0.6" />
      </svg>

      {/* ========================================================================= */}
      {/* 2. Interactive Switcher: DRRM 3D Hologram vs. Authentic PNA Ground Photo   */}
      {/* ========================================================================= */}
      <div className="absolute top-5 right-5 z-40 flex items-center gap-1.5 p-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-cyan-500/30 shadow-xl">
        <button
          type="button"
          onClick={() => setActiveView('hologram')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'hologram'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>DRRM Sentinel</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView('ground_photo')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'ground_photo'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>PNA Ground Zero</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. SCENE A: 3D Holographic DRRM Sentinel & Curved Displays (Style Copy)   */}
      {/* ========================================================================= */}
      {activeView === 'hologram' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          
          {/* Atmospheric ambient lighting inside wave */}
          <div className="absolute right-12 top-1/3 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute right-24 bottom-24 w-72 h-72 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

          {/* 3D Container with perspective */}
          <div className="relative w-full max-w-[460px] h-[540px] flex flex-col items-center justify-center translate-x-8 sm:translate-x-12">
            
            {/* ------------------------------------------------------------- */}
            {/* FLOATING CURVED HOLOGRAPHIC PANELS (Surrounding center)       */}
            {/* ------------------------------------------------------------- */}
            
            {/* TOP/BACK CURVED DISPLAY: Real-time Telemetry & Charts */}
            <div className="absolute top-16 z-10 w-[240px] p-3 rounded-2xl bg-[#0e1e4a]/85 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] text-white transform -rotate-1 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-cyan-300 uppercase">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Lingayen Gulf Radar</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-200">SIGNAL #2</span>
              </div>
              {/* Gauges & Bar chart imitation matching reference screenshot */}
              <div className="flex items-end justify-between gap-1.5 h-12 pt-1 px-1">
                <div className="w-4 bg-cyan-500/40 rounded-t h-5/6 flex items-end">
                  <div className="w-full bg-cyan-300 rounded-t h-3/4 animate-pulse" />
                </div>
                <div className="w-4 bg-cyan-500/40 rounded-t h-full flex items-end">
                  <div className="w-full bg-cyan-400 rounded-t h-4/5" />
                </div>
                <div className="w-4 bg-cyan-500/40 rounded-t h-2/3 flex items-end">
                  <div className="w-full bg-cyan-300 rounded-t h-1/2" />
                </div>
                <div className="w-4 bg-cyan-500/40 rounded-t h-4/5 flex items-end">
                  <div className="w-full bg-cyan-200 rounded-t h-full" />
                </div>
                {/* Circular Mini Gauge */}
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-cyan-400/80 flex items-center justify-center ml-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center text-[8px] font-mono text-cyan-200">
                    88%
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between text-[8px] text-cyan-300/80 font-mono">
                <span>SURGE: +2.1M</span>
                <span>TIDE: PEAK</span>
              </div>
            </div>

            {/* LEFT CURVED HOLOGRAPHIC PANEL: Telemetry Stream */}
            <div className="absolute left-2 top-32 z-20 w-[150px] p-2.5 rounded-2xl bg-cyan-950/70 backdrop-blur-md border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.35)] text-white transform -rotate-12 hover:scale-105 transition-transform duration-300">
              <div className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-300 animate-ping" />
                <span>Sensor Grid</span>
              </div>
              <div className="space-y-1.5 text-[8px] font-mono text-cyan-100/90 leading-tight">
                <div className="h-1.5 w-full bg-cyan-400/70 rounded-full" />
                <div className="h-1.5 w-4/5 bg-cyan-400/50 rounded-full" />
                <div className="h-1.5 w-full bg-cyan-400/80 rounded-full" />
                <div className="h-1.5 w-3/5 bg-cyan-400/60 rounded-full" />
                <div className="h-1.5 w-5/6 bg-cyan-400/90 rounded-full" />
              </div>
              <div className="mt-2 text-[8px] font-mono text-cyan-200 bg-cyan-900/70 px-1 py-0.5 rounded text-center">
                MDRRMO FEED OK
              </div>
            </div>

            {/* RIGHT CURVED HOLOGRAPHIC PANEL: Surge Wave Line Graph */}
            <div className="absolute right-0 top-36 z-20 w-[155px] p-2.5 rounded-2xl bg-[#14285b]/85 backdrop-blur-md border border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.35)] text-white transform rotate-12 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between text-[9px] font-bold text-blue-300 uppercase tracking-wider mb-1">
                <span>Wave Height</span>
                <span className="text-[8px] text-cyan-300 font-mono">2.1m</span>
              </div>
              {/* SVG Mountain / Wave Trend Graph matching reference */}
              <svg className="w-full h-10 text-cyan-400" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="waveFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,35 Q 25,5 50,22 T 100,8 L 100,40 L 0,40 Z"
                  fill="url(#waveFillGrad)"
                />
                <path
                  d="M 0,35 Q 25,5 50,22 T 100,8"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="22" r="2.5" fill="#ffffff" />
                <circle cx="100" cy="8" r="2.5" fill="#38bdf8" />
              </svg>
              <div className="text-[8px] text-blue-200/90 font-mono text-right mt-1">
                LINGAYEN BEACH
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 3D SENTINEL / BOT (Center Avatar matching reference)          */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-30 flex flex-col items-center mt-4">
              
              {/* Floating Animation Wrapper */}
              <div className="animate-bounce" style={{ animationDuration: '3.5s' }}>
                
                {/* Robot Head */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-300 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-center border-2 border-white">
                  
                  {/* Glowing Blue/Cyan Curved Visor */}
                  <div className="w-16 h-10 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-600 shadow-[inset_0_0_10px_rgba(255,255,255,0.7),0_0_18px_rgba(6,182,212,0.9)] flex items-center justify-center relative overflow-hidden">
                    {/* Visor Glare */}
                    <div className="absolute top-1 left-2 w-10 h-1.5 rounded-full bg-white/70 blur-[0.5px]" />
                    {/* Animated Eye Scanning Line */}
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping" />
                  </div>

                  {/* Ear details */}
                  <div className="absolute -left-1 w-2 h-6 rounded-r bg-slate-300 border-l border-slate-400" />
                  <div className="absolute -right-1 w-2 h-6 rounded-l bg-slate-300 border-r border-slate-400" />
                </div>

                {/* Robot Torso */}
                <div className="relative -mt-3 w-28 h-20 rounded-3xl bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 shadow-xl border border-white/60 mx-auto flex flex-col items-center pt-2">
                  {/* DRRM Chest Reactor / Shield Logo */}
                  <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.8)] flex items-center justify-center text-cyan-300">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  {/* Floating glow under torso */}
                  <div className="w-16 h-2 rounded-full bg-cyan-400/60 blur-sm mt-2" />
                </div>

              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* 3D GLOWING PEDESTAL & LIGHT COLUMNS (Reference Exact Feature) */}
            {/* ------------------------------------------------------------- */}
            <div className="relative -mt-6 z-10 flex flex-col items-center">
              
              {/* Glowing vertical beam streaming upwards */}
              <div className="w-32 h-16 bg-gradient-to-t from-cyan-400/35 to-transparent blur-md" />

              {/* Concentric 3D Neon Rings on Pedestal */}
              <div className="relative -mt-6 w-48 h-16">
                {/* Outer Perspective Ring (Cyan & Violet) */}
                <div className="absolute inset-0 rounded-[100%] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 p-[3px] shadow-[0_0_30px_rgba(6,182,212,0.8)] transform -rotate-x-60">
                  <div className="w-full h-full rounded-[100%] bg-[#0f1738] flex items-center justify-center">
                    {/* Inner glowing white ring */}
                    <div className="w-32 h-9 rounded-[100%] border-2 border-cyan-200 bg-white/95 shadow-[0_0_18px_#ffffff]" />
                  </div>
                </div>

                {/* Lower tiered ring for 3D thickness */}
                <div className="absolute top-3 inset-x-2 h-14 rounded-[100%] border-2 border-purple-500/50 bg-purple-950/50 -z-10 shadow-[0_10px_20px_rgba(147,51,234,0.4)]" />
              </div>

              {/* Floating Bottom Light Cylinders (Matching WordPress-style cylinders at bottom of reference) */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-4 rounded-[100%] border border-cyan-400 bg-cyan-400/30 shadow-[0_0_12px_#06b6d4]" />
                  <div className="w-10 h-7 bg-gradient-to-b from-cyan-400/25 to-transparent border-x border-cyan-400/30" />
                </div>

                <div className="flex flex-col items-center -translate-y-2">
                  <div className="w-16 h-5 rounded-[100%] border-2 border-cyan-300 bg-cyan-300/40 shadow-[0_0_18px_#22d3ee]" />
                  <div className="w-14 h-9 bg-gradient-to-b from-cyan-400/35 to-transparent border-x border-cyan-300/40" />
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-4 rounded-[100%] border border-purple-400 bg-purple-400/30 shadow-[0_0_12px_#c084fc]" />
                  <div className="w-10 h-7 bg-gradient-to-b from-purple-400/25 to-transparent border-x border-purple-400/30" />
                </div>
              </div>

            </div>

          </div>

          {/* Floating Telemetry Coordinates at bottom */}
          <div className="absolute bottom-5 right-8 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-cyan-500/20 text-[10px] text-cyan-200 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>LINGAYEN MDRRMO • 16.0272° N, 120.2281° E</span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCENE B: Authentic PNA Article Flood Image (User's Verified Source)    */}
      {/* https://www.pna.gov.ph/articles/1236742                                  */}
      {/* ========================================================================= */}
      {activeView === 'ground_photo' && (
        <div className="absolute inset-0 z-30 flex items-center justify-end p-4 sm:p-6 select-text">
          <div className="relative w-full max-w-[430px] rounded-3xl overflow-hidden bg-slate-900 border-2 border-cyan-400/50 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            
            {/* The PNA Image */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                src="/kristine-pangasinan-hd.jpg"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== 'https://files01.pna.gov.ph/ograph/2024/10/24/kristine-pangasinan.jpg') {
                    target.src = 'https://files01.pna.gov.ph/ograph/2024/10/24/kristine-pangasinan.jpg';
                  } else {
                    target.src = '/baha.jpg';
                  }
                }}
                alt="Storm surge in Lingayen Beach during STS Kristine (PNA Article #1236742)"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              {/* Coordinate badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/20 text-white text-[10px] font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>Lingayen Beach Bay Walk</span>
              </div>
            </div>

            {/* Content card */}
            <div className="p-4 bg-slate-950 text-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Actual Storm Surge Event</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">PNA Ref #1236742</span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 leading-snug">
                Midnight Storm Surge Inundates Lingayen Bay Walk
              </h4>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Documented effects of Severe Tropical Storm Kristine, high tide, and southwest monsoon along Lingayen Gulf. UniGuard connects residents directly with LDRRMC responders during peak surge events.
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Photo: Lingayen MDRRMO / PNA</span>
                <a
                  href="https://www.pna.gov.ph/articles/1236742"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                >
                  <span>Read PNA Dispatch</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
