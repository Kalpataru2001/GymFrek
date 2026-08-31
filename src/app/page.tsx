'use client';

import Link from 'next/link';

// ─── Feature Card ────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-orange-400 hover:shadow-orange-100 hover:shadow-lg transition-all duration-300 cursor-default">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Step Card ───────────────────────────────────────────────────────────────
interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-14 h-14 rounded-full bg-orange-500 text-white font-extrabold text-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
        {step}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}

// ─── Level Card ──────────────────────────────────────────────────────────────
interface LevelCardProps {
  level: string;
  emoji: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

function LevelCard({ level, emoji, description, features, highlight }: LevelCardProps) {
  return (
    <div
      className={`rounded-2xl p-8 border-2 transition-all duration-300 ${
        highlight
          ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-100'
          : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
      }`}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h3
        className={`text-2xl font-extrabold mb-2 ${highlight ? 'text-orange-600' : 'text-gray-900'}`}
      >
        {level}
      </h3>
      <p className="text-gray-500 text-sm mb-5 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-orange-500 font-bold">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-16 py-5">
        <span className="text-2xl font-extrabold text-white tracking-tight">
          Gym<span className="text-orange-500">Frek</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full transition-colors shadow-md"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-orange-600 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-400 rounded-full opacity-5 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold tracking-widest uppercase">
            Your Ultimate Fitness Companion
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Transform
            </span>{' '}
            Your Body,
            <br />
            Elevate Your Life
          </h1>

          {/* Subtext */}
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Get personalized workout plans, track your nutrition, and monitor your progress — all in
            one beautifully designed, completely free platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-8 py-4 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Your Journey
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5"
            >
              Learn More
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex justify-center animate-bounce">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. STATS BAR
      ══════════════════════════════════════════ */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-800">
          {[
            { value: '50+', label: 'Exercises' },
            { value: '3', label: 'Fitness Levels' },
            { value: '100%', label: 'Free' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-4 sm:py-0">
              <span className="text-4xl font-extrabold text-orange-500">{value}</span>
              <span className="text-gray-400 text-sm mt-1 font-medium tracking-wide uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. FEATURES SECTION
      ══════════════════════════════════════════ */}
      <section id="features" className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-14">
            <span className="inline-block mb-3 text-orange-500 font-semibold text-sm uppercase tracking-widest">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
              Everything You Need
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              All the tools to build your perfect physique, in one place.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="🏋️"
              title="Smart Workout Plans"
              description="AI-powered workout plans tailored to your fitness level, goals, and available equipment."
            />
            <FeatureCard
              icon="🥗"
              title="Nutrition Calculator"
              description="Calculate your daily macros and calories based on your body metrics and fitness goals."
            />
            <FeatureCard
              icon="🍎"
              title="Food Database"
              description="Search from 300,000+ foods with complete nutritional info. Log meals with ease."
            />
            <FeatureCard
              icon="📊"
              title="Progress Tracking"
              description="Beautiful charts and analytics to visualize your strength, weight, and body changes over time."
            />
            <FeatureCard
              icon="💪"
              title="Exercise Library"
              description="50+ exercises with detailed instructions, muscle groups targeted, and video demonstrations."
            />
            <FeatureCard
              icon="🏅"
              title="Achievements"
              description="Earn badges, maintain streaks, and unlock milestones to stay motivated on your journey."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block mb-3 text-orange-500 font-semibold text-sm uppercase tracking-widest">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
              How It Works
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
            <StepCard
              step={1}
              title="Set Your Profile"
              description="Tell us about your age, weight, height, and fitness goals to get a fully personalized experience."
            />
            <StepCard
              step={2}
              title="Get Your Plan"
              description="Receive a customized workout and nutrition plan matched to your level — Beginner, Intermediate, or Advanced."
            />
            <StepCard
              step={3}
              title="Track & Grow"
              description="Log your workouts and meals daily. Watch your progress charts climb as you hit new milestones."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. FITNESS LEVELS
      ══════════════════════════════════════════ */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block mb-3 text-orange-500 font-semibold text-sm uppercase tracking-widest">
              For Every Level
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
              Your Level, Your Plan
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              Whether you&apos;re just starting out or pushing your limits, GymFrek adapts to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LevelCard
              level="Beginner"
              emoji="🌱"
              description="Perfect if you're new to fitness. We'll guide you every step of the way with safe, effective workouts."
              features={[
                'Foundation bodyweight exercises',
                'Simple 3-day workout split',
                'Basic macro tracking',
                'Step-by-step instructions',
              ]}
            />
            <LevelCard
              level="Intermediate"
              emoji="🔥"
              description="You've got the basics down. Time to level up with progressive overload and smarter nutrition."
              features={[
                '4-day hypertrophy program',
                'Progressive overload tracking',
                'Detailed macro breakdown',
                'Cardio integration',
              ]}
              highlight
            />
            <LevelCard
              level="Advanced"
              emoji="⚡"
              description="Pushing peak performance. Advanced periodization, optimized nutrition, and elite-level analytics."
              features={[
                '5-6 day advanced splits',
                'Periodization & deloads',
                'Advanced body recomposition',
                'Performance analytics',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. CTA SECTION
      ══════════════════════════════════════════ */}
      <section className="relative bg-gray-900 py-28 px-6 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-semibold tracking-widest uppercase">
            Get Started Today
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Start?
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of people transforming their bodies with GymFrek. It&apos;s free, and always will be.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            Create Free Account
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-gray-950 border-t border-gray-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Gym<span className="text-orange-500">Frek</span>
            </span>
            <p className="text-gray-500 text-sm mt-1">Transform Your Body, Elevate Your Life.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-300 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-gray-300 transition-colors">
              Sign up
            </Link>
            <span>© {new Date().getFullYear()} GymFrek</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
