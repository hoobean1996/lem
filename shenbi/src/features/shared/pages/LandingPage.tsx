/**
 * Landing Page - Marketing page for selling Shenbi
 */

import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import {
  Sparkles,
  ChevronRight,
  Gamepad2,
  Star,
  Zap,
  Heart,
  Check,
  Play,
  Brain,
  Rocket,
  Shield,
  Clock,
  Monitor,
  Crown,
  Paintbrush,
  Users,
  Building2,
  GraduationCap,
  BarChart3,
  Mail,
  Swords,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      <SEO
        title="Simpler than Scratch - Coding Games for Kids 4-8"
        description="Shenbi is simpler than Scratch. Kids ages 4-8 learn coding through 2D grid puzzle games. Write your first code in 10 minutes. No typing required."
        url="/landing"
      />
      <div className="h-screen overflow-y-auto bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4a7a2a] rounded-xl flex items-center justify-center">
                <Paintbrush className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800">Shenbi</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#why-shenbi"
                className="text-gray-600 hover:text-[#4a7a2a] transition-colors hidden sm:block"
              >
                Why Shenbi
              </a>
              <a
                href="#features"
                className="text-gray-600 hover:text-[#4a7a2a] transition-colors hidden sm:block"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-[#4a7a2a] transition-colors hidden sm:block"
              >
                Pricing
              </a>
              <a
                href="#business"
                className="text-gray-600 hover:text-[#4a7a2a] transition-colors hidden sm:block"
              >
                Business
              </a>
              <Link
                to="/"
                className="px-5 py-2 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a] transition-colors"
              >
                Start Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-[#e8f5e0] via-white to-[#f0f9eb]">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[#4a7a2a] text-sm mb-6 shadow-sm border border-[#e8f5e0]">
                  <Sparkles className="w-4 h-4" />
                  Ages 4-8 | Learn by playing
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                  Simpler than Scratch
                  <br />
                  <span className="text-[#4a7a2a]">Coding Games</span>
                </h1>

                {/* Supporting Copy */}
                <p className="text-lg md:text-xl text-gray-600 mb-4">
                  Scratch too complex? Shenbi uses 2D grid puzzle games to help your child write
                  their first code in 10 minutes.
                </p>
                <p className="text-gray-500 mb-8">
                  No typing required. No complicated interfaces. Just fun puzzles.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-10">
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-8 py-4 bg-[#4a7a2a] text-white rounded-2xl font-bold text-lg hover:bg-[#3a6a1a] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    Start Free
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#demo"
                    className="flex items-center gap-2 px-6 py-4 text-[#4a7a2a] font-medium hover:bg-[#e8f5e0] rounded-2xl transition-all"
                  >
                    <Play className="w-5 h-5" />
                    See How It Works
                  </a>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-10">
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-[#4a7a2a]">50+</div>
                    <div className="text-gray-600 text-sm">Levels</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-[#4a7a2a]">Ages 4-8</div>
                    <div className="text-gray-600 text-sm">Designed For</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-[#4a7a2a]">1000+</div>
                    <div className="text-gray-600 text-sm">Kids Learning</div>
                  </div>
                </div>
              </div>

              {/* Right: Product Visual Placeholder */}
              <div className="relative">
                <div
                  id="demo"
                  className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 aspect-[4/3] flex items-center justify-center"
                >
                  {/* Placeholder for game screenshot/GIF */}
                  <div className="w-full h-full bg-gradient-to-br from-[#f0f9eb] to-[#e8f5e0] rounded-2xl flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 bg-[#4a7a2a] rounded-2xl flex items-center justify-center mb-4">
                      <Gamepad2 className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-[#4a7a2a] font-bold text-lg mb-2">Game Preview</p>
                    <p className="text-gray-500 text-sm">
                      Add screenshot or GIF of the 2D grid game here
                    </p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="w-10 h-10 text-amber-900" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#4a7a2a] rounded-xl flex items-center justify-center shadow-lg">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section - Why Shenbi */}
        <section id="why-shenbi" className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Why Choose Shenbi?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Designed specifically for younger kids who find Scratch overwhelming.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-3">
                {/* Header */}
                <div className="p-6 bg-gray-50 border-b border-gray-100"></div>
                <div className="p-6 bg-gray-50 border-b border-gray-100 text-center">
                  <span className="text-gray-600 font-medium">Scratch</span>
                </div>
                <div className="p-6 bg-[#e8f5e0] border-b border-[#d0e8c0] text-center">
                  <span className="text-[#4a7a2a] font-bold">Shenbi</span>
                </div>

                {/* Interface Row */}
                <div className="p-6 border-b border-gray-100">
                  <span className="font-medium text-gray-800">Interface</span>
                </div>
                <div className="p-6 border-b border-gray-100 text-center">
                  <span className="text-gray-500">Complex, many blocks</span>
                </div>
                <div className="p-6 border-b border-[#d0e8c0] bg-[#f7fbf4] text-center">
                  <span className="text-[#4a7a2a] font-medium">Simple 2D grid</span>
                </div>

                {/* Learning Curve Row */}
                <div className="p-6 border-b border-gray-100">
                  <span className="font-medium text-gray-800">Getting Started</span>
                </div>
                <div className="p-6 border-b border-gray-100 text-center">
                  <span className="text-gray-500">Needs guidance</span>
                </div>
                <div className="p-6 border-b border-[#d0e8c0] bg-[#f7fbf4] text-center">
                  <span className="text-[#4a7a2a] font-medium">10 min to first code</span>
                </div>

                {/* Age Row */}
                <div className="p-6 border-b border-gray-100">
                  <span className="font-medium text-gray-800">Best Age</span>
                </div>
                <div className="p-6 border-b border-gray-100 text-center">
                  <span className="text-gray-500">8+ years old</span>
                </div>
                <div className="p-6 border-b border-[#d0e8c0] bg-[#f7fbf4] text-center">
                  <span className="text-[#4a7a2a] font-medium">4-8 years old</span>
                </div>

                {/* Learning Style Row */}
                <div className="p-6">
                  <span className="font-medium text-gray-800">Learning Style</span>
                </div>
                <div className="p-6 text-center">
                  <span className="text-gray-500">Open-ended (can be confusing)</span>
                </div>
                <div className="p-6 bg-[#f7fbf4] text-center">
                  <span className="text-[#4a7a2a] font-medium">
                    Guided levels (builds confidence)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Comparison Note */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                {/* Placeholder for side-by-side screenshots */}
                Add Scratch vs Shenbi interface comparison screenshots here
              </p>
            </div>
          </div>
        </section>

        {/* Features Section - Streamlined to 4 core features */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How Kids Learn</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Real programming concepts, wrapped in fun gameplay.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature 1: Game-Based Learning */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-[#7dad4c] transition-all">
                <div className="w-14 h-14 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-5">
                  <Gamepad2 className="w-7 h-7 text-[#4a7a2a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Learn by Playing</h3>
                <p className="text-gray-600">
                  Solve puzzle levels and collect stars. Learning feels like playing a game, not
                  sitting in class.
                </p>
              </div>

              {/* Feature 2: Real Programming */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-[#7dad4c] transition-all">
                <div className="w-14 h-14 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-5">
                  <Brain className="w-7 h-7 text-[#4a7a2a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Real Coding Concepts</h3>
                <p className="text-gray-600">
                  Loops, conditionals, functions — the same concepts real programmers use, taught at
                  a kid's pace.
                </p>
              </div>

              {/* Feature 3: Instant Feedback */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-[#7dad4c] transition-all">
                <div className="w-14 h-14 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-5">
                  <Zap className="w-7 h-7 text-[#4a7a2a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">See Results Instantly</h3>
                <p className="text-gray-600">
                  Write code, watch it run immediately. Kids know right away if their solution
                  works.
                </p>
              </div>

              {/* Feature 4: Battle Mode */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-[#7dad4c] transition-all">
                <div className="w-14 h-14 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-5">
                  <Swords className="w-7 h-7 text-[#4a7a2a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Challenge Friends</h3>
                <p className="text-gray-600">
                  Real-time coding battles with friends. Race to solve puzzles and see who codes
                  faster!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - Updated with pain-point format */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                What Parents Say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "My daughter tried Scratch but the interface was too complex — she gave up after 5
                  minutes. With Shenbi, she played for an hour on day one. Now she understands
                  loops!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e8f5e0] rounded-full flex items-center justify-center text-lg">
                    👩
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Parent</div>
                    <div className="text-gray-500 text-xs">Daughter, age 6</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "I was worried 5 is too young to learn coding. Shenbi's level design is clever —
                  my son thinks he's just playing a game. He's learned more than I expected."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e8f5e0] rounded-full flex items-center justify-center text-lg">
                    👨
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Parent</div>
                    <div className="text-gray-500 text-xs">Son, age 5</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Way cheaper than enrichment classes at $200-400/month, and my kid actually wants
                  to practice. That's the difference."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e8f5e0] rounded-full flex items-center justify-center text-lg">
                    👩
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Parent</div>
                    <div className="text-gray-500 text-xs">Son, age 7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Enhanced messaging */}
        <section id="pricing" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Simple Pricing</h2>
              <p className="text-gray-600">
                Start free, upgrade when ready. No credit card required.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Tier */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Free</h3>
                  <div className="text-4xl font-bold text-gray-800">$0</div>
                  <p className="text-gray-500 text-sm">Forever free</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-[#4a7a2a] flex-shrink-0" />
                    <span className="text-gray-700">10+ free levels</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-[#4a7a2a] flex-shrink-0" />
                    <span className="text-gray-700">Maze & turtle adventures</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-[#4a7a2a] flex-shrink-0" />
                    <span className="text-gray-700">Battle mode with friends</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-[#4a7a2a] flex-shrink-0" />
                    <span className="text-gray-700">No credit card needed</span>
                  </li>
                </ul>

                <Link
                  to="/"
                  className="block w-full py-3 text-center bg-white border-2 border-[#4a7a2a] text-[#4a7a2a] rounded-xl font-bold hover:bg-[#f0f9eb] transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Premium Tier */}
              <div className="bg-gradient-to-br from-[#4a7a2a] to-[#3a6a1a] rounded-3xl p-8 text-white relative">
                <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  BEST VALUE
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <div className="text-4xl font-bold">
                    $9.99<span className="text-lg font-normal">/mo</span>
                  </div>
                  <p className="text-white/70 text-sm">Less than $0.35/day</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>All 50+ premium levels</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>Advanced coding concepts</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>New content monthly</span>
                  </li>
                </ul>

                <Link
                  to="/"
                  className="block w-full py-3 text-center bg-white text-[#4a7a2a] rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Start Premium
                </Link>
              </div>
            </div>

            {/* Value Comparison */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Compare: Enrichment classes cost $200-400/month. Shenbi Premium is just $9.99/month.
              </p>
            </div>
          </div>
        </section>

        {/* Business Partnership Section */}
        <section id="business" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8f5e0] rounded-full text-[#4a7a2a] text-sm mb-4">
                <Building2 className="w-4 h-4" />
                For Business
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Partner With Us</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Bring coding education to your students. Perfect for coding schools, enrichment
                centers, and primary schools.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-[#4a7a2a]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Coding Schools</h3>
                <p className="text-gray-600 text-sm">
                  Use Shenbi as your teaching platform. Structured curriculum with 50+ levels.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-[#4a7a2a]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Teacher Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  Track student progress, assign levels, and manage your classrooms easily.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#4a7a2a]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Volume Licensing</h3>
                <p className="text-gray-600 text-sm">
                  Special pricing for schools and organizations. Scale to hundreds of students.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[#4a7a2a] font-medium mb-6">
                Looking for partners to bring coding to more kids
              </p>
              <a
                href="mailto:business@gigaboo.sg"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#4a7a2a] text-white rounded-2xl font-bold text-lg hover:bg-[#3a6a1a] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Contact Us
                <ChevronRight className="w-5 h-5" />
              </a>
              <p className="mt-4 text-gray-500 text-sm">business@gigaboo.sg</p>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 px-4 border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Shield className="w-6 h-6 text-[#4a7a2a]" />
                <span className="text-gray-600 text-sm">Kid-Safe</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Clock className="w-6 h-6 text-[#4a7a2a]" />
                <span className="text-gray-600 text-sm">No Ads</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Monitor className="w-6 h-6 text-[#4a7a2a]" />
                <span className="text-gray-600 text-sm">All Devices</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Heart className="w-6 h-6 text-[#4a7a2a]" />
                <span className="text-gray-600 text-sm">Made with Love</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#4a7a2a] to-[#3a6a1a] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Child's Coding Journey?
            </h2>
            <p className="text-white/80 mb-8">
              Join 1000+ kids learning to code through play. Free to start.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#4a7a2a] rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
            >
              <Rocket className="w-5 h-5" />
              Start Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4a7a2a] rounded-lg flex items-center justify-center">
                <Paintbrush className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Shenbi</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Shenbi. Made with love for young coders.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
