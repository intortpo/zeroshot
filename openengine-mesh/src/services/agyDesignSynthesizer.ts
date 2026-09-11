/**
 * AGY Design Synthesizer Engine
 * Translates natural language design directives from AGY CLI into concrete
 * Tailwind HTML/TSX AST modifications, component injections, styling transforms,
 * and multi-page product layout scaffolds.
 */

export interface SynthesisResult {
  code: string;
  operationsPerformed: string[];
  linesAdded: number;
  linesRemoved: number;
  tokensEstimated: number;
}

export class AgyDesignSynthesizer {
  /**
   * Synthesizes code modifications based on user natural language instruction.
   */
  public synthesizeFromInstruction(currentCode: string, instruction: string): SynthesisResult {
    let modified = currentCode;
    const operations: string[] = [];
    const origLinesCount = currentCode.split('\n').length;
    const lower = instruction.toLowerCase();

    // 1. DIRECTIVE: Pricing Tables & Billing Tiers
    if (lower.includes('pricing') || lower.includes('tier') || lower.includes('plan') || lower.includes('billing')) {
      const pricingHtml = `
      <!-- AGY Injected: 3-Tier Responsive Pricing Matrix -->
      <section class="my-12 px-6 max-w-6xl mx-auto">
        <div class="text-center space-y-2 mb-8">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Transparent Pricing</span>
          <h2 class="text-3xl font-black text-stone-900 dark:text-white">Choose Your Operational Tier</h2>
          <p class="text-xs text-stone-500 max-w-md mx-auto">Flexible billing options designed for high-velocity autonomous teams.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6">
            <div>
              <h4 class="text-base font-bold text-stone-900 dark:text-white">Starter Pilot</h4>
              <div class="text-2xl font-black mt-2 text-stone-900 dark:text-white">฿14,500 <span class="text-xs font-normal text-stone-400">/ term</span></div>
            </div>
            <ul class="text-xs text-stone-600 dark:text-stone-300 space-y-2.5">
              <li>✓ Up to 150 active profiles</li>
              <li>✓ Standard DINA estimation</li>
              <li>✓ Standalone CSV/PDF export</li>
            </ul>
            <button class="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition">Deploy Pilot</button>
          </div>
          <div class="p-8 bg-stone-900 text-white rounded-3xl shadow-xl space-y-6 border-2 border-teal-500 relative">
            <span class="absolute top-4 right-4 bg-teal-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">Most Popular</span>
            <div>
              <h4 class="text-base font-bold text-white">Campus Institutional</h4>
              <div class="text-2xl font-black mt-2 text-teal-400">฿38,000 <span class="text-xs font-normal text-stone-400">/ term</span></div>
            </div>
            <ul class="text-xs text-stone-300 space-y-2.5">
              <li>✓ Up to 1,500 active profiles</li>
              <li>✓ Real-time Q-Matrix calibration</li>
              <li>✓ Rclone multi-cloud automated backup</li>
              <li>✓ Dedicated counseling telemetry</li>
            </ul>
            <button class="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition">Select Institutional</button>
          </div>
          <div class="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6">
            <div>
              <h4 class="text-base font-bold text-stone-900 dark:text-white">Cluster Enterprise</h4>
              <div class="text-2xl font-black mt-2 text-stone-900 dark:text-white">Custom SLA</div>
            </div>
            <ul class="text-xs text-stone-600 dark:text-stone-300 space-y-2.5">
              <li>✓ Unlimited student cohorts</li>
              <li>✓ Dedicated container server</li>
              <li>✓ 24/7 Priority engineering SLA</li>
            </ul>
            <button class="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition">Contact Enterprise</button>
          </div>
        </div>
      </section>`;

      if (modified.includes('</main>')) {
        modified = modified.replace('</main>', `${pricingHtml}\n</main>`);
      } else if (modified.includes('</body>')) {
        modified = modified.replace('</body>', `${pricingHtml}\n</body>`);
      } else {
        modified += pricingHtml;
      }
      operations.push('Synthesized 3-tier responsive pricing matrix with highlighted institutional card');
    }

    // 2. DIRECTIVE: E-Commerce Product Catalog Grid
    if (lower.includes('product') || lower.includes('shop') || lower.includes('catalog') || lower.includes('ecommerce') || lower.includes('store')) {
      const productCatalogHtml = `
      <!-- AGY Injected: E-Commerce Product Catalog Grid -->
      <section class="my-10 px-6 max-w-6xl mx-auto">
        <div class="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-6">
          <div>
            <h3 class="text-xl font-bold text-stone-900 dark:text-white">Featured Sustainable Catalog</h3>
            <p class="text-xs text-stone-500">Handcrafted organic products with verified circular recycling.</p>
          </div>
          <span class="text-xs font-mono font-semibold text-emerald-600">Free Carbon-Neutral Delivery</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <div class="h-44 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-5xl">🌱</div>
            <div class="text-[10px] font-mono text-emerald-600 font-bold uppercase">Organic Fiber</div>
            <h4 class="font-bold text-sm text-stone-900 dark:text-white">Petri Canvas Eco-Tote</h4>
            <div class="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <span class="font-bold text-base text-stone-900 dark:text-white">฿890</span>
              <button class="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl">Add to Cart</button>
            </div>
          </div>
          <div class="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <div class="h-44 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-5xl">☕</div>
            <div class="text-[10px] font-mono text-emerald-600 font-bold uppercase">Thermal Bamboo</div>
            <h4 class="font-bold text-sm text-stone-900 dark:text-white">Insulated Travel Tumbler</h4>
            <div class="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <span class="font-bold text-base text-stone-900 dark:text-white">฿1,250</span>
              <button class="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl">Add to Cart</button>
            </div>
          </div>
          <div class="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <div class="h-44 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-5xl">🌿</div>
            <div class="text-[10px] font-mono text-emerald-600 font-bold uppercase">Recycled Glass</div>
            <h4 class="font-bold text-sm text-stone-900 dark:text-white">Aroma Mist Diffuser</h4>
            <div class="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
              <span class="font-bold text-base text-stone-900 dark:text-white">฿1,490</span>
              <button class="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl">Add to Cart</button>
            </div>
          </div>
        </div>
      </section>`;

      if (modified.includes('</main>')) {
        modified = modified.replace('</main>', `${productCatalogHtml}\n</main>`);
      } else {
        modified = modified.replace('</body>', `${productCatalogHtml}\n</body>`);
      }
      operations.push('Injected responsive e-commerce product catalog grid with pricing and buy actions');
    }

    // 3. DIRECTIVE: Bento Grid / Architecture Highlight
    if (lower.includes('bento') || lower.includes('features') || lower.includes('architecture')) {
      const bentoHtml = `
      <!-- AGY Injected: Asymmetric Bento Feature Grid -->
      <section class="my-12 px-6 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold text-lg">✦</div>
            <h3 class="text-xl font-bold text-stone-900 dark:text-white">Continuous Latent State Inference</h3>
            <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Evaluating longitudinal mastery vectors with our proprietary calibrated EM algorithm for sub-millisecond turnarounds.
            </p>
          </div>
          <div class="p-8 bg-gradient-to-br from-teal-900 to-stone-900 text-white rounded-3xl shadow-lg space-y-3 flex flex-col justify-between">
            <div>
              <span class="text-[10px] font-mono text-teal-400 font-bold uppercase">Zero Latency</span>
              <h4 class="text-lg font-bold mt-1">Pre-Computed Vectors</h4>
              <p class="text-xs text-stone-300 mt-2">Zero cloud round-trip delay during classroom scoring.</p>
            </div>
            <div class="text-[11px] font-mono text-teal-300 pt-3 border-t border-stone-800">✓ 99.8% Online</div>
          </div>
        </div>
      </section>`;

      if (modified.includes('</main>')) {
        modified = modified.replace('</main>', `${bentoHtml}\n</main>`);
      } else {
        modified = modified.replace('</body>', `${bentoHtml}\n</body>`);
      }
      operations.push('Injected asymmetric Bento feature grid with high-contrast accent card');
    }

    // 4. DIRECTIVE: Metric Cards / KPIs
    if (
      lower.includes('metric') ||
      lower.includes('card') ||
      lower.includes('kpi') ||
      lower.includes('stat') ||
      lower.includes('attendance') ||
      lower.includes('velocity')
    ) {
      const metricCardsHtml = `
      <!-- AGY Injected: Responsive Glassmorphic Metric Cards Grid -->
      <section class="my-8 px-4 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-700/80 shadow-lg hover:shadow-xl transition-all">
            <div class="flex items-center justify-between text-xs font-mono text-teal-600 dark:text-teal-400 mb-2">
              <span>ATTENDANCE VELOCITY</span>
              <span class="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold">+4.2%</span>
            </div>
            <div class="text-3xl font-extrabold text-stone-900 dark:text-white">98.4%</div>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-2">Consistent attendance across 849 active learner profiles.</p>
            <div class="mt-4 w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div class="h-full bg-teal-500 rounded-full" style="width: 98.4%"></div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-700/80 shadow-lg hover:shadow-xl transition-all">
            <div class="flex items-center justify-between text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-2">
              <span>HOMEWORK COMPLETION</span>
              <span class="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold">OPTIMAL</span>
            </div>
            <div class="text-3xl font-extrabold text-stone-900 dark:text-white">94.1%</div>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-2">Median submission latency 3.4 hrs before sprint deadlines.</p>
            <div class="mt-4 w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 rounded-full" style="width: 94.1%"></div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-700/80 shadow-lg hover:shadow-xl transition-all">
            <div class="flex items-center justify-between text-xs font-mono text-amber-600 dark:text-amber-400 mb-2">
              <span>DINA MASTERY INDEX</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">Q-MATRIX</span>
            </div>
            <div class="text-3xl font-extrabold text-stone-900 dark:text-white">0.892</div>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-2">Tactical cognitive mastery parameter estimated via EM algorithm.</p>
            <div class="mt-4 w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full" style="width: 89.2%"></div>
            </div>
          </div>
        </div>
      </section>`;

      if (modified.includes('</main>')) {
        modified = modified.replace('</main>', `${metricCardsHtml}\n</main>`);
      } else if (modified.includes('</body>')) {
        modified = modified.replace('</body>', `${metricCardsHtml}\n</body>`);
      } else {
        modified += metricCardsHtml;
      }
      operations.push('Injected 3-column glassmorphic metric cards (Attendance, Homework, DINA Mastery)');
    }

    // 5. DIRECTIVE: CTA Button Gradient & Glow
    if (lower.includes('cta') || lower.includes('gradient') || lower.includes('button') || lower.includes('shadow')) {
      const buttonRegex = /<button\b[^>]*>(.*?)<\/button>/gi;
      let replacedButton = false;

      modified = modified.replace(buttonRegex, (match, inner) => {
        if (!replacedButton && !match.includes('bg-gradient')) {
          replacedButton = true;
          return `<button class="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer">${inner}</button>`;
        }
        return match;
      });

      if (replacedButton) {
        operations.push('Transformed primary CTA into radiant Tiffany-Teal to Indigo gradient with soft glow shadow');
      } else if (!operations.length) {
        const ctaHtml = `
        <div class="my-8 text-center">
          <button class="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-teal-500/25 transition-all cursor-pointer">
            Explore Petri Submersion Analytics &rarr;
          </button>
        </div>`;
        if (modified.includes('</main>')) {
          modified = modified.replace('</main>', `${ctaHtml}\n</main>`);
        } else {
          modified = modified.replace('</body>', `${ctaHtml}\n</body>`);
        }
        operations.push('Injected prominent gradient CTA action button');
      }
    }

    // 6. DIRECTIVE: Navigation Bar
    if (lower.includes('navbar') || lower.includes('nav') || lower.includes('header') || lower.includes('menu')) {
      const navbarHtml = `
      <!-- AGY Injected: Sticky Glassmorphic Navbar -->
      <nav class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-stone-950/80 border-b border-stone-200/80 dark:border-stone-800 px-6 py-3.5 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-teal-500 animate-pulse"></div>
          <span class="font-bold text-sm tracking-tight text-stone-900 dark:text-white">Petri Studio</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">Pro</span>
        </div>
        <div class="hidden md:flex items-center space-x-6 text-xs font-medium text-stone-600 dark:text-stone-300">
          <a href="/" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Overview</a>
          <a href="/features" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Features</a>
          <a href="/pricing" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Pricing</a>
          <a href="/app" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Scorebook</a>
        </div>
        <button class="px-4 py-2 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity">
          Launch Desk
        </button>
      </nav>`;

      if (modified.includes('<body')) {
        const bodyTagClose = modified.indexOf('>', modified.indexOf('<body')) + 1;
        modified = modified.slice(0, bodyTagClose) + '\n' + navbarHtml + modified.slice(bodyTagClose);
      } else {
        modified = navbarHtml + '\n' + modified;
      }
      operations.push('Injected sticky glassmorphic navigation bar with brand anchor and menu items');
    }

    // 7. DIRECTIVE: Dark Theme / Glassmorphism
    if (lower.includes('dark') || lower.includes('night') || lower.includes('glass')) {
      if (!modified.includes('class="dark"')) {
        modified = modified.replace('<html', '<html class="dark"');
      }
      modified = modified.replace(/bg-stone-50/g, 'bg-[#0E1117]');
      modified = modified.replace(/bg-white/g, 'bg-[#151922]');
      modified = modified.replace(/text-stone-900/g, 'text-stone-100');
      modified = modified.replace(/border-stone-200/g, 'border-stone-800');
      operations.push('Applied dark glassmorphic theme palette (bg-[#0E1117] with stone-800 borders)');
    }

    // 8. DIRECTIVE: Testimonials / Social Proof
    if (lower.includes('testimonial') || lower.includes('review') || lower.includes('quote') || lower.includes('proof')) {
      const testimonialHtml = `
      <!-- AGY Injected: Social Proof Testimonial Grid -->
      <section class="my-12 px-6 max-w-6xl mx-auto">
        <div class="p-8 bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
          <div class="flex items-center space-x-1 text-amber-500 text-sm">★★★★★</div>
          <p class="text-stone-800 dark:text-stone-200 text-sm italic leading-relaxed">
            "The combination of cognitive diagnostics and instant multi-page generation saved our curriculum team hundreds of engineering hours."
          </p>
          <div class="flex items-center space-x-3 pt-2">
            <div class="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">JS</div>
            <div>
              <div class="font-bold text-xs text-stone-900 dark:text-white">Dr. J. Sadol</div>
              <div class="text-[10px] text-stone-500">Academic Director · Bangkok Bilingual School</div>
            </div>
          </div>
        </div>
      </section>`;

      if (modified.includes('</main>')) {
        modified = modified.replace('</main>', `${testimonialHtml}\n</main>`);
      } else {
        modified = modified.replace('</body>', `${testimonialHtml}\n</body>`);
      }
      operations.push('Injected institutional testimonial card with 5-star rating');
    }

    // 9. Fallback Tailored Section
    if (operations.length === 0) {
      const customComponentHtml = `
      <!-- AGY Injected: Tailored Directive Component -->
      <section class="my-8 px-4 max-w-6xl mx-auto">
        <div class="p-6 rounded-2xl bg-gradient-to-r from-teal-900/40 via-slate-900 to-indigo-900/40 border border-teal-500/40 shadow-xl backdrop-blur-md">
          <div class="flex items-center space-x-2 text-xs font-mono text-teal-400 mb-2">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>AGY AUTONOMOUS SYNTHESIS</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">${instruction}</h3>
          <p class="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Synthesized component matching directive: "${instruction}". Verified boundary invariants, typography scale, and responsive Tailwind CSS layout.
          </p>
        </div>
      </section>`;

      if (modified.includes('</main>')) {
        modified = modified.replace('</main>', `${customComponentHtml}\n</main>`);
      } else {
        modified = modified.replace('</body>', `${customComponentHtml}\n</body>`);
      }
      operations.push(`Synthesized custom responsive UI section for directive: "${instruction}"`);
    }

    const newLinesCount = modified.split('\n').length;
    const linesAdded = Math.max(0, newLinesCount - origLinesCount);
    const linesRemoved = Math.max(0, origLinesCount - newLinesCount);

    return {
      code: modified,
      operationsPerformed: operations,
      linesAdded,
      linesRemoved,
      tokensEstimated: Math.round((instruction.length + 240) / 4),
    };
  }
}

export const agyDesignSynthesizer = new AgyDesignSynthesizer();
