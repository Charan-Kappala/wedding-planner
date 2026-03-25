import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Calendar, Wand2, Compass } from 'lucide-react';

const PORTFOLIO = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8uwcP4xHQoVwAAZa0qsNwA4wXXx86qUaQf0H1d7oYgEJd4gjX7FcQNQskLJsR9LEMm0OIdmoMDdcI5Qs8kV9xhrPUE7AbB64vzYzUSE_NHv5wm-z0SJD6smvt5mO6JrLsewySQz4LQFFbIBdYFg7X_IuR65RwHlGoJAJd5X_qQ2cMEW3w2jcXI29CLWaTaBxyoonICGhrnrBSr5axbITqNVWk0KcNvp14ar902zqbw3UKgPrIQzFAaCLKKHndEY0Rts6Vq9ZyrDM',
    alt: 'Luxury garden wedding',
    location: 'Lake Como',
    couple: 'Isabella & Julian',
    offset: 'md:translate-y-12',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKMrUwv-tPUQQOXd1gFrZR7U91902A3m0dQHMQqP8Gguw05TZtV2hhdXinwul_wsN-vdnqfxnoGHeWqbBGXfOHjLwmG9zz0UGQUL9p2PR4WSOqVgHmon4CBy219bcX0f07LfYKt2CS1arGz9Sr-RK166FKXGFbrgDKqtGality8t2xFrgJZz-kZ-dqzsY7NFCAFqsc6mY1dCengW2tpZ9SFufCaX_kf5uyyul9RmQPwoK86AwMkfJlKiiqJeDi0zOO2Hs1ZzuZLpI',
    alt: 'Minimalist modern wedding',
    location: 'Paris',
    couple: 'Claire & Étienne',
    offset: '',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6Du0pI-MUOvbCwSkTg0sZ3nli3VIjRaRo_JssSP9SUkQjhKVJO7P5yowAV5OOKZY29_1SRhzvTlUXG5YXNaKwiUVTo1JPOZ0spjaL3WiUPJoTIJz7goEXd58laLyxx9Rqopq5Q1dHW-6X_yF4m6TuSIFII_OevL4wD6xn1TgaYkkKAcUvMfJiVxgPBYhxbsBJPIXLOUgB0G_8JaXe0yEyGgpXPguDB9V4mg_K_FMKvtW23fhITpqpZ7ifiDSsX6c81F_f80dQy_s',
    alt: 'Desert bohemian wedding',
    location: 'Joshua Tree',
    couple: 'Sloane & Marcus',
    offset: 'md:translate-y-24',
  },
];

const SERVICES = [
  {
    icon: Compass,
    title: 'Full Production',
    desc: 'End-to-end design and management, ensuring a cohesive aesthetic across every touchpoint.',
    offset: '',
  },
  {
    icon: Wand2,
    title: 'Aesthetic Styling',
    desc: 'Visual storytelling through floral architecture, lighting design, and textile curation.',
    offset: 'sm:mt-8',
  },
  {
    icon: Globe,
    title: 'Destination Mastery',
    desc: "Global logistics for unions celebrated in the world's most breathtaking locales.",
    offset: '',
  },
  {
    icon: Calendar,
    title: 'The Final Prelude',
    desc: 'Detailed coordination for the final 60 days to ensure a flawless execution of your vision.',
    offset: 'sm:mt-8',
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background text-on-surface font-body">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl">
        <div className="flex justify-between items-center px-8 py-6 max-w-screen-2xl mx-auto">
          <div className="font-headline italic text-2xl tracking-tighter text-on-surface">
            Vows &amp; Plans
          </div>
          <div className="hidden md:flex items-center gap-12">
            {['Services', 'Portfolio', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-label text-on-surface-variant uppercase tracking-[0.1rem] text-xs hover:text-primary transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </div>
          <Link
            to="/register"
            className="gold-gradient text-on-primary rounded-full px-8 py-3 text-xs font-label tracking-widest uppercase editorial-shadow transition-transform active:scale-95"
          >
            Start Planning
          </Link>
        </div>
      </nav>

      <main className="pt-24">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden px-8">
          <div className="absolute inset-0 z-0">
            <img
              alt="Elegant outdoor wedding reception"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBco4ullLhAG9bGLPds-ys8lr0h63hZ1o_dmvAxzughXrxAbVZ5U4_9VucBk9exxwDl0z2QrmIMmM9xspaNX0afuZK9lIvQtzuvqPTiChMLiXNAqnhLPzMVSfUMkP3Jqdc2qFh2pZ2abdH_PORVYwWs31fo8U0bz8qm7j-o6t0W3WFMDtzjQonu8lzfuNm8pzyItG5JtBfJcRNuLUGiLa1__9dvt9iBmwTxv6oK7OsDTsmTLR17KtB5HXgIC5JWV0shERJD1rGsKs8"
            />
            <div className="absolute inset-0 bg-stone-900/30 mix-blend-multiply" />
          </div>
          <div className="relative z-10 text-center max-w-4xl">
            <h1 className="font-headline text-6xl md:text-8xl text-surface mb-8 leading-tight tracking-tight">
              Curating <br />
              <span className="italic">Unforgettable</span> Unions
            </h1>
            <p className="font-body text-surface/90 text-lg md:text-xl tracking-wide max-w-2xl mx-auto mb-12 font-light">
              A bespoke planning experience for couples who value architectural precision and romantic soul.
            </p>
            <Link
              to="/register"
              className="inline-block gold-gradient text-on-primary rounded-full px-10 py-4 text-sm font-label tracking-widest uppercase editorial-shadow"
            >
              Start Planning
            </Link>
          </div>
        </section>

        {/* ── Services ────────────────────────────────────────────── */}
        <section id="services" className="py-32 px-8 bg-surface">
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              <div className="md:col-span-5 pt-12">
                <span className="font-label text-primary text-xs uppercase tracking-[0.2rem] block mb-6">
                  Our Expertise
                </span>
                <h2 className="font-headline text-5xl md:text-6xl text-on-surface mb-8 leading-tight">
                  Crafting the <br />Atmosphere of Love
                </h2>
                <p className="font-body text-on-surface-variant text-lg leading-relaxed mb-12">
                  From venue scouting in the rolling hills of Tuscany to the final touch of a hand-calligraphed place card, we manage every nuance with quiet authority.
                </p>
                <Link
                  to="/register"
                  className="inline-block border-b border-primary text-primary font-label uppercase tracking-widest text-xs pb-1 hover:opacity-70 transition-opacity"
                >
                  View all services
                </Link>
              </div>

              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {SERVICES.map(({ icon: Icon, title, desc, offset }) => (
                  <div
                    key={title}
                    className={`bg-surface-container-low p-10 rounded-lg editorial-shadow transition-transform hover:-translate-y-2 ${offset}`}
                  >
                    <Icon className="text-primary mb-6 h-8 w-8" strokeWidth={1.5} />
                    <h3 className="font-headline text-2xl mb-4">{title}</h3>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Portfolio ───────────────────────────────────────────── */}
        <section id="portfolio" className="py-32 px-8 bg-surface-container-low">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div>
                <span className="font-label text-primary text-xs uppercase tracking-[0.2rem] block mb-6">
                  Gallery
                </span>
                <h2 className="font-headline text-5xl md:text-7xl text-on-surface">The Portfolio</h2>
              </div>
              <p className="font-body text-on-surface-variant max-w-sm italic">
                Explore our curated selection of recent unions, each reflecting the unique soul of the couple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:pb-24">
              {PORTFOLIO.map(({ src, alt, location, couple, offset }) => (
                <div
                  key={couple}
                  className={`group relative overflow-hidden rounded-lg aspect-[3/4] ${offset}`}
                >
                  <img
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <span className="font-label text-white/70 text-[10px] uppercase tracking-widest block mb-2">
                      {location}
                    </span>
                    <h4 className="font-headline text-white text-3xl">{couple}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonial ─────────────────────────────────────────── */}
        <section className="py-48 px-8 bg-surface">
          <div className="max-w-4xl mx-auto text-center">
            <span className="font-headline text-6xl text-primary/20 block mb-12 leading-none">"</span>
            <p className="font-headline text-3xl md:text-4xl text-on-surface leading-relaxed italic mb-12">
              The Digital Atelier didn't just plan a wedding; they choreographed a masterpiece. Every moment felt deeply intentional and effortlessly beautiful.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-outline-variant" />
              <span className="font-label text-on-surface-variant text-xs uppercase tracking-widest">
                Elena &amp; Thomas, 2023
              </span>
              <div className="h-px w-12 bg-outline-variant" />
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section className="py-32 px-8 bg-surface-container">
          <div className="max-w-screen-xl mx-auto rounded-lg overflow-hidden">
            <div className="bg-[#1c1810] py-24 px-8 text-center">
              <h2 className="font-headline text-4xl md:text-6xl text-surface mb-8">
                Ready to Begin Your Story?
              </h2>
              <p className="font-body text-surface/50 mb-12 max-w-xl mx-auto uppercase tracking-[0.2rem] text-xs">
                Start planning your perfect day today.
              </p>
              <Link
                to="/register"
                className="inline-block gold-gradient text-on-primary rounded-full px-12 py-5 text-sm font-label tracking-widest uppercase editorial-shadow"
              >
                Create Your Account
              </Link>
              <p className="mt-6">
                <Link
                  to="/login"
                  className="font-label text-[10px] uppercase tracking-widest text-surface/40 hover:text-surface/70 transition-colors border-b border-surface/20 pb-0.5"
                >
                  Already have an account? Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-stone-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 max-w-screen-2xl mx-auto border-t border-outline-variant/10">
          <div className="md:col-span-1">
            <div className="font-headline italic text-xl text-on-surface mb-6">
              Vows &amp; Plans
            </div>
            <p className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant leading-loose">
              Defining the intersection of<br />romance and high design.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label text-primary text-[10px] uppercase tracking-widest mb-2">Connect</span>
            {['Instagram', 'Pinterest', 'Facebook'].map((s) => (
              <a key={s} href="#" className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">{s}</a>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label text-primary text-[10px] uppercase tracking-widest mb-2">Explore</span>
            <Link to="/register" className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Get Started</Link>
            <Link to="/login" className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Sign In</Link>
            <a href="#" className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label text-primary text-[10px] uppercase tracking-widest mb-2">Legal</span>
            <a href="#" className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
        <div className="px-12 py-8 border-t border-outline-variant/10 text-center">
          <p className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant/50">
            © {new Date().getFullYear()} Vows &amp; Plans. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
