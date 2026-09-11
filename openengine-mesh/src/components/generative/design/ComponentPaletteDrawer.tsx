import React, { useState, useMemo } from 'react';
import {
  Box,
  Search,
  GripVertical,
  Plus,
} from 'lucide-react';

export interface ComponentBlock {
  id: string;
  name: string;
  category:
    | 'Navigation'
    | 'Hero'
    | 'Features'
    | 'Pricing'
    | 'Forms'
    | 'Commerce'
    | 'Stats'
    | 'Testimonials'
    | 'Submersion'
    | 'Footers';
  desc: string;
  html: string;
}

export const RICH_COMPONENT_PALETTE: ComponentBlock[] = [
  // --- Navigation ---
  {
    id: 'nav-glass',
    name: 'Glassmorphic Navbar',
    category: 'Navigation',
    desc: 'Sticky frosted bar with brand emblem, route anchors, and action CTA',
    html: `\n<!-- Navigation Bar -->\n<nav class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-stone-200/80 px-6 py-3.5 flex items-center justify-between shadow-2xs">\n  <div class="flex items-center space-x-2">\n    <div class="w-3 h-3 rounded-full bg-[#0ABAB5] animate-pulse"></div>\n    <span class="font-bold text-sm tracking-tight text-stone-900">Petri Studio</span>\n  </div>\n  <div class="hidden md:flex items-center space-x-6 text-xs font-semibold text-stone-600">\n    <a href="/" class="hover:text-teal-600 transition-colors">Overview</a>\n    <a href="/features" class="hover:text-teal-600 transition-colors">Features</a>\n    <a href="/pricing" class="hover:text-teal-600 transition-colors">Pricing</a>\n    <a href="/app" class="hover:text-teal-600 transition-colors">Scorebook</a>\n  </div>\n  <button class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition">Get Started</button>\n</nav>\n`,
  },
  {
    id: 'nav-sidebar',
    name: 'Dashboard Nav Strip',
    category: 'Navigation',
    desc: 'Sub-bar with search field, active breadcrumb route, and profile avatar',
    html: `\n<!-- Sub-Navigation Header -->\n<div class="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs my-2 rounded-xl">\n  <div class="flex items-center space-x-2 font-mono text-stone-500">\n    <span>Workspace</span>\n    <span>/</span>\n    <span class="font-bold text-stone-900">Live Production</span>\n  </div>\n  <div class="flex items-center space-x-3">\n    <input type="text" placeholder="Quick search..." class="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs" />\n    <div class="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">JD</div>\n  </div>\n</div>\n`,
  },

  // --- Hero Sections ---
  {
    id: 'hero-gradient',
    name: 'Radiant Hero Banner',
    category: 'Hero',
    desc: 'High-conversion headline with Tiffany teal pill tag, subtitle, and dual buttons',
    html: `\n<!-- Hero Section -->\n<section class="py-16 px-6 text-center bg-gradient-to-b from-teal-50/70 via-white to-stone-50 rounded-3xl border border-teal-100/80 my-6 shadow-xs">\n  <span class="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-3.5 py-1 rounded-full mb-4">Zero-Latency AI Architecture</span>\n  <h1 class="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">Next-Generation Systems <br/><span class="text-teal-600">Built for Autonomous Teams</span></h1>\n  <p class="mt-4 text-stone-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">Continuous latent cognitive state assessment across 16 core competencies with slippage and guessing calibration.</p>\n  <div class="mt-8 flex items-center justify-center gap-4">\n    <button class="px-6 py-3 bg-[#0ABAB5] hover:bg-teal-600 text-white text-xs font-semibold rounded-2xl shadow-md transition">Launch Application</button>\n    <button class="px-6 py-3 bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-2xl hover:bg-stone-50 transition shadow-2xs">Documentation &rarr;</button>\n  </div>\n</section>\n`,
  },
  {
    id: 'hero-split',
    name: 'Split Media Hero',
    category: 'Hero',
    desc: 'Two-column layout with left-aligned value proposition and right preview card',
    html: `\n<!-- Split Media Hero -->\n<section class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 px-6 my-6 bg-white rounded-3xl border border-stone-200 shadow-2xs">\n  <div class="space-y-4">\n    <div class="inline-flex items-center space-x-2 text-xs font-mono text-teal-600 bg-teal-50 px-3 py-1 rounded-full font-semibold">Bilingual Cohort Modeling</div>\n    <h1 class="text-3xl md:text-4xl font-black text-stone-900">Measure Longitudinal Learning Velocity</h1>\n    <p class="text-xs text-stone-600 leading-relaxed">Turn classroom attendance and diagnostic results into actionable intervention trajectories.</p>\n    <div class="pt-2 flex gap-3">\n      <button class="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl">Start Cohort</button>\n      <button class="px-5 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl">View Demo</button>\n    </div>\n  </div>\n  <div class="p-6 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 space-y-3 font-mono text-xs shadow-xl">\n    <div class="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-2">\n      <span>DINA Vector Pipeline</span>\n      <span class="text-emerald-400">99.8% Online</span>\n    </div>\n    <div class="text-teal-400 font-bold text-2xl">849 Profiles Processed</div>\n    <p class="text-[11px] text-stone-400">EM log-likelihood convergence reached at iteration 42.</p>\n  </div>\n</section>\n`,
  },

  // --- Features & Bento ---
  {
    id: 'features-bento',
    name: '3-Card Bento Grid',
    category: 'Features',
    desc: 'Asymmetrical bento cards featuring icons, badges, and key technical highlights',
    html: `\n<!-- Bento Feature Grid -->\n<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">\n  <div class="md:col-span-2 p-8 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-3">\n    <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-base mb-2">✦</div>\n    <h3 class="text-lg font-bold text-stone-900">Deterministic Cognitive Diagnostic Engine</h3>\n    <p class="text-xs text-stone-600 leading-relaxed">Model multiple latent attributes concurrently with our proprietary calibrated Bayesian estimation loop.</p>\n    <div class="pt-3 grid grid-cols-3 gap-3">\n      <div class="p-3 bg-stone-50 rounded-xl text-center"><div class="text-[10px] text-stone-400 font-mono">Precision</div><div class="text-base font-bold text-teal-600">0.96</div></div>\n      <div class="p-3 bg-stone-50 rounded-xl text-center"><div class="text-[10px] text-stone-400 font-mono">Recall</div><div class="text-base font-bold text-teal-600">0.92</div></div>\n      <div class="p-3 bg-stone-50 rounded-xl text-center"><div class="text-[10px] text-stone-400 font-mono">Speed</div><div class="text-base font-bold text-teal-600">&lt; 5ms</div></div>\n    </div>\n  </div>\n  <div class="p-8 bg-stone-900 text-white rounded-3xl shadow-lg space-y-3 flex flex-col justify-between">\n    <div>\n      <div class="text-[10px] font-mono text-teal-400 font-bold uppercase mb-2">Security Standard</div>\n      <h3 class="text-lg font-bold">End-to-End Local Privacy</h3>\n      <p class="text-xs text-stone-300 mt-2 leading-relaxed">Zero student data ever touches external cloud LLM APIs without operator approval.</p>\n    </div>\n    <div class="text-[11px] font-mono text-emerald-400 pt-4 border-t border-stone-800">✓ FERPA & GDPR Verified</div>\n  </div>\n</div>\n`,
  },
  {
    id: 'feature-card-single',
    name: 'Feature Highlight Card',
    category: 'Features',
    desc: 'Clean elevated card with icon badge and micro-interaction',
    html: `\n<!-- Feature Card -->\n<div class="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-teal-400 transition-all my-4">\n  <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm mb-3">✦</div>\n  <h3 class="text-base font-bold text-stone-900">Quantum Psychometric Scoring</h3>\n  <p class="text-xs text-stone-600 mt-2 leading-relaxed">Continuous latent cognitive state assessment across 16 curriculum competencies.</p>\n</div>\n`,
  },

  // --- Pricing ---
  {
    id: 'pricing-tiered',
    name: '3-Tier Pricing Table',
    category: 'Pricing',
    desc: 'Pricing grid with highlighted center card, feature checklist, and checkout CTA',
    html: `\n<!-- Pricing Table -->\n<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">\n  <div class="p-8 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-6">\n    <div>\n      <h4 class="text-base font-bold text-stone-900">Pilot</h4>\n      <div class="text-2xl font-black mt-2">฿14,500 <span class="text-xs font-normal text-stone-400">/ term</span></div>\n    </div>\n    <ul class="text-xs text-stone-600 space-y-2.5">\n      <li>✓ Up to 150 profiles</li>\n      <li>✓ Standard DINA estimation</li>\n      <li>✓ CSV export</li>\n    </ul>\n    <button class="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl">Choose Pilot</button>\n  </div>\n  <div class="p-8 bg-stone-900 text-white rounded-3xl shadow-xl space-y-6 border-2 border-teal-500 relative">\n    <span class="absolute top-4 right-4 bg-teal-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">Popular</span>\n    <div>\n      <h4 class="text-base font-bold">Institutional</h4>\n      <div class="text-2xl font-black mt-2 text-teal-400">฿38,000 <span class="text-xs font-normal text-stone-400">/ term</span></div>\n    </div>\n    <ul class="text-xs text-stone-300 space-y-2.5">\n      <li>✓ Up to 1,500 profiles</li>\n      <li>✓ Real-time Q-Matrix prior calibration</li>\n      <li>✓ Rclone multi-cloud sync</li>\n      <li>✓ Dedicated counselor dashboard</li>\n    </ul>\n    <button class="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl shadow-md">Deploy Institutional</button>\n  </div>\n  <div class="p-8 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-6">\n    <div>\n      <h4 class="text-base font-bold text-stone-900">Enterprise</h4>\n      <div class="text-2xl font-black mt-2">Custom</div>\n    </div>\n    <ul class="text-xs text-stone-600 space-y-2.5">\n      <li>✓ Unlimited profiles</li>\n      <li>✓ Dedicated self-hosted container</li>\n      <li>✓ 24/7 SLA Engineering</li>\n    </ul>\n    <button class="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl">Contact Sales</button>\n  </div>\n</div>\n`,
  },

  // --- Forms & Auth ---
  {
    id: 'form-contact',
    name: 'Modern Contact Form',
    category: 'Forms',
    desc: 'Clean input fields with name, email, subject, message, and submit button',
    html: `\n<!-- Contact Form -->\n<div class="max-w-xl mx-auto p-8 bg-white rounded-3xl border border-stone-200 shadow-xs my-8 space-y-4">\n  <div class="text-center space-y-1">\n    <h3 class="text-xl font-bold text-stone-900">Request Institutional Demonstration</h3>\n    <p class="text-xs text-stone-500">Connect with the BBS Momentum curriculum engineering team.</p>\n  </div>\n  <div class="space-y-3 pt-2">\n    <input type="text" placeholder="Full Name" class="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 outline-none" />\n    <input type="email" placeholder="Institutional Email (@school.edu)" class="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 outline-none" />\n    <textarea rows="3" placeholder="Tell us about your student cohort size..." class="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 outline-none"></textarea>\n    <button class="w-full py-3 bg-[#0ABAB5] hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm transition">Schedule Consultation</button>\n  </div>\n</div>\n`,
  },
  {
    id: 'form-newsletter',
    name: 'Newsletter Capture Bar',
    category: 'Forms',
    desc: 'Single-line newsletter subscription box with instant feedback badge',
    html: `\n<!-- Newsletter Capture -->\n<div class="p-8 bg-stone-900 text-white rounded-3xl my-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">\n  <div>\n    <h4 class="text-lg font-bold">Subscribe to EDM Research Briefs</h4>\n    <p class="text-xs text-stone-400 mt-0.5">Bi-weekly insights on psychometric modeling and student mastery.</p>\n  </div>\n  <div class="flex items-center space-x-2 w-full md:w-auto">\n    <input type="email" placeholder="Enter your email" class="px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-400 outline-none w-64" />\n    <button class="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl whitespace-nowrap">Subscribe</button>\n  </div>\n</div>\n`,
  },

  // --- Commerce ---
  {
    id: 'commerce-product-card',
    name: 'Product Catalog Card',
    category: 'Commerce',
    desc: 'E-commerce card with product image badge, price, star rating, and add-to-cart button',
    html: `\n<!-- Product Card -->\n<div class="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 my-4 max-w-xs">\n  <div class="h-44 bg-stone-100 rounded-2xl flex items-center justify-center text-5xl">🌿</div>\n  <div class="flex items-center justify-between text-xs">\n    <span class="font-mono text-emerald-700 text-[10px] font-semibold uppercase">Organic Canvas</span>\n    <span class="text-amber-500 font-bold">★ 4.9</span>\n  </div>\n  <h4 class="font-bold text-sm text-stone-900">EcoPetri Sustainable Tote</h4>\n  <p class="text-xs text-stone-500 line-clamp-2">Handmade with zero-waste organic hemp and recycled brass zippers.</p>\n  <div class="flex items-center justify-between pt-2 border-t border-stone-100">\n    <span class="text-base font-black text-stone-900">฿890</span>\n    <button class="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl">Add to Cart</button>\n  </div>\n</div>\n`,
  },

  // --- Stats & Metrics ---
  {
    id: 'stats-kpi-row',
    name: '3-Card Metric KPI Grid',
    category: 'Stats',
    desc: '3 KPI blocks with uppercase label, bold metric, and trend percentage',
    html: `\n<!-- Metric Stat Grid -->\n<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">\n  <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">\n    <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Active Students</div>\n    <div class="text-3xl font-black text-stone-900 mt-1">849</div>\n    <div class="text-[11px] text-emerald-600 font-medium mt-0.5">↑ 100% Synced from BBS</div>\n  </div>\n  <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">\n    <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Query Latency</div>\n    <div class="text-3xl font-black text-teal-600 mt-1">&lt; 5 ms</div>\n    <div class="text-[11px] text-stone-500 font-medium mt-0.5">Pre-computed cache</div>\n  </div>\n  <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">\n    <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Data Security</div>\n    <div class="text-3xl font-black text-indigo-600 mt-1">AES-256</div>\n    <div class="text-[11px] text-indigo-500 font-medium mt-0.5">Client Encrypted</div>\n  </div>\n</div>\n`,
  },
  {
    id: 'stats-table-students',
    name: 'Live Student Roster Table',
    category: 'Stats',
    desc: 'Dense responsive data table with mastery progress bar and status pills',
    html: `\n<!-- Student Cohort Table -->\n<div class="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden my-6">\n  <div class="p-4 border-b border-stone-100 flex items-center justify-between">\n    <h4 class="text-xs font-bold text-stone-900">Student Psychometric Trajectories</h4>\n    <span class="text-[10px] text-stone-400 font-mono">Live RAG Matrix</span>\n  </div>\n  <table class="w-full text-left text-xs font-sans">\n    <thead class="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase border-b border-stone-200">\n      <tr>\n        <th class="px-4 py-2.5">Name</th>\n        <th class="px-4 py-2.5">Grade</th>\n        <th class="px-4 py-2.5">Mastery</th>\n        <th class="px-4 py-2.5">Status</th>\n      </tr>\n    </thead>\n    <tbody class="divide-y divide-stone-100 text-stone-700">\n      <tr>\n        <td class="px-4 py-3 font-semibold">Sirapop Chaiprasert</td>\n        <td class="px-4 py-3 text-stone-500">Grade 9 STEM</td>\n        <td class="px-4 py-3"><div class="w-24 bg-stone-200 h-2 rounded-full overflow-hidden"><div class="bg-teal-500 h-full w-[94%]"></div></div></td>\n        <td class="px-4 py-3"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-semibold">Mastered</span></td>\n      </tr>\n      <tr>\n        <td class="px-4 py-3 font-semibold">Nutthida Somboon</td>\n        <td class="px-4 py-3 text-stone-500">Grade 10 Humanities</td>\n        <td class="px-4 py-3"><div class="w-24 bg-stone-200 h-2 rounded-full overflow-hidden"><div class="bg-teal-500 h-full w-[82%]"></div></div></td>\n        <td class="px-4 py-3"><span class="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] rounded-full font-semibold">On Track</span></td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n`,
  },

  // --- Testimonials ---
  {
    id: 'testimonial-quote',
    name: 'Leadership Testimonial Card',
    category: 'Testimonials',
    desc: 'Editorial quote card with author avatar and institutional title',
    html: `\n<!-- Testimonial -->\n<div class="p-6 bg-stone-50 rounded-2xl border border-stone-200 my-6 shadow-2xs space-y-4">\n  <p class="text-xs text-stone-700 leading-relaxed italic">"Petri Design and the Momentum EDM engine transformed how our bilingual department visualizes student trajectory. We identify curriculum gaps weeks before traditional midterm testing."</p>\n  <div class="flex items-center space-x-3 pt-1 border-t border-stone-200/60">\n    <div class="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">JS</div>\n    <div>\n      <div class="text-xs font-bold text-stone-900">Dr. J. Sadol</div>\n      <div class="text-[10px] text-stone-500">Academic Director · Bangkok Bilingual School</div>\n    </div>\n  </div>\n</div>\n`,
  },

  // --- Submersion 3D Visualizers ---
  {
    id: 'submersion-wave-lupi',
    name: 'Lieflat Lupi Editorial Wave',
    category: 'Submersion',
    desc: 'Fifty Cohorts, One Wave ridge streamline with waterline threshold',
    html: `\n<!-- Lieflat Lupi Editorial Wave -->\n<div class="p-6 bg-[#090D14] text-white rounded-3xl border border-stone-800 my-6 shadow-xl">\n  <div class="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">\n    <div>\n      <span class="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">Lieflat Lupi Editorial</span>\n      <h3 class="text-sm font-bold text-stone-100">Fifty Cohorts, One Wave</h3>\n    </div>\n    <span class="text-[10px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded-full border border-stone-800">Waterline: 0.0σ</span>\n  </div>\n  <div class="h-36 relative flex items-end justify-between px-2 overflow-hidden">\n    <div class="absolute inset-x-0 top-1/2 border-b border-dashed border-teal-500/60 z-10 flex items-center justify-between text-[9px] font-mono text-teal-400 px-1">\n      <span>RISK WATERLINE (Z = 0)</span>\n      <span>ELEVATION THRESHOLD</span>\n    </div>\n    <svg viewBox="0 0 500 120" class="w-full h-full">\n      <path d="M 0,80 Q 80,20 160,70 T 320,40 T 500,90 L 500,120 L 0,120 Z" fill="rgba(10,186,181,0.15)" />\n      <path d="M 0,80 Q 80,20 160,70 T 320,40 T 500,90" fill="none" stroke="#0ABAB5" stroke-width="2" />\n      <path d="M 0,95 Q 90,40 180,85 T 340,55 T 500,105" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="2 3" />\n    </svg>\n  </div>\n</div>\n`,
  },

  // --- Footers ---
  {
    id: 'footer-columns',
    name: 'Multi-Column Sitemap Footer',
    category: 'Footers',
    desc: 'Corporate sitemap footer with newsletter field, copyright, and social links',
    html: `\n<!-- Footer -->\n<footer class="bg-stone-900 text-stone-400 py-12 px-8 rounded-3xl border border-stone-800 my-8 text-xs">\n  <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">\n    <div class="space-y-2">\n      <div class="text-white font-bold text-sm">Petri Design</div>\n      <p class="text-[11px] text-stone-500">Autonomous local-first generative design system for modern teams.</p>\n    </div>\n    <div class="space-y-2">\n      <div class="font-bold text-stone-200">Product</div>\n      <div class="space-y-1 text-[11px]">\n        <div><a href="/" class="hover:text-white">Overview</a></div>\n        <div><a href="/features" class="hover:text-white">Features Bento</a></div>\n        <div><a href="/pricing" class="hover:text-white">Pricing Plans</a></div>\n      </div>\n    </div>\n    <div class="space-y-2">\n      <div class="font-bold text-stone-200">Resources</div>\n      <div class="space-y-1 text-[11px]">\n        <div><a href="#" class="hover:text-white">Documentation</a></div>\n        <div><a href="#" class="hover:text-white">API Reference</a></div>\n        <div><a href="#" class="hover:text-white">Rclone Sync</a></div>\n      </div>\n    </div>\n    <div class="space-y-2">\n      <div class="font-bold text-stone-200">Institutional</div>\n      <div class="text-[11px] text-stone-500">Bangkok Bilingual School · Academic AY2026</div>\n    </div>\n  </div>\n  <div class="pt-6 flex items-center justify-between text-[10px] font-mono">\n    <span>© 2026 Zero Petri Engine. All rights reserved.</span>\n    <span>SHA-256 Gate Active</span>\n  </div>\n</footer>\n`,
  },
];

interface ComponentPaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertComponent: (html: string, name: string) => void;
}

export const ComponentPaletteDrawer: React.FC<ComponentPaletteDrawerProps> = ({
  isOpen,
  onInsertComponent,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Navigation',
    'Hero',
    'Features',
    'Pricing',
    'Forms',
    'Commerce',
    'Stats',
    'Testimonials',
    'Submersion',
    'Footers',
  ];

  const filteredComponents = useMemo(() => {
    return RICH_COMPONENT_PALETTE.filter((comp) => {
      const matchCat = selectedCategory === 'All' || comp.category === selectedCategory;
      const matchSearch =
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <aside className="w-72 border-r border-stone-200 bg-white flex flex-col shrink-0 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-xs text-stone-900">Component Palette</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
          {RICH_COMPONENT_PALETTE.length} Blocks
        </span>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-stone-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Filter components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-2 border-b border-stone-100 flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredComponents.map((comp) => (
          <div
            key={comp.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/html', comp.html);
              e.dataTransfer.setData('text/plain', comp.html);
              e.dataTransfer.setData('text/component-name', comp.name);
            }}
            className="p-3 bg-stone-50 hover:bg-teal-50/50 border border-stone-200 hover:border-teal-300 rounded-2xl cursor-grab active:cursor-grabbing transition-all group shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <GripVertical className="w-3.5 h-3.5 text-stone-400 group-hover:text-teal-600" />
                <span className="font-semibold text-xs text-stone-800 group-hover:text-teal-900">
                  {comp.name}
                </span>
              </div>
              <button
                onClick={() => onInsertComponent(comp.html, comp.name)}
                className="p-1 rounded-lg bg-white border border-stone-200 text-stone-500 hover:text-teal-600 hover:border-teal-300 opacity-0 group-hover:opacity-100 transition shadow-2xs"
                title="Insert at bottom of canvas"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-stone-500 leading-normal pl-5">{comp.desc}</p>
          </div>
        ))}

        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-xs text-stone-400">
            No components match "{searchQuery}"
          </div>
        )}
      </div>
    </aside>
  );
};
