import { useState, useEffect, useRef, useCallback } from 'react';
import { TweaksPanel, TweakSection, TweakRadio, useTweaks } from './components/TweaksPanel';

declare global {
  interface Window {
    Calendly?: { initInlineWidget: (opts: { url: string; parentElement: HTMLElement | null }) => void };
  }
}

/* ─── Custom Cursor ─── */
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.11;
      ring.current.y += (pos.current.y - ring.current.y) * 0.11;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px,${ring.current.y}px) translate(-50%,-50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    const onHover = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const isClickable = t.closest('button,a,[role="button"],input,textarea,select,.service-card,.testimonial,.value-card');
      dotRef.current?.classList.toggle('cursor-hover', !!isClickable);
      ringRef.current?.classList.toggle('cursor-hover', !!isClickable);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', onHover);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', onHover);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ─── Cinematic Intro ─── */
function CinematicIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => { setPhase(3); onDone(); }, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);
  return (
    <div className={`cinematic-intro phase-${phase}`}>
      <div className="cin-orb" />
      <div className="cin-logo">
        <span className="cin-serif">DEY</span>
        <em className="cin-italic">Marketing</em>
      </div>
      <div className="cin-line" />
    </div>
  );
}

/* ─── Floating Particles ─── */
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 3 + (i % 5) * 2,
    x: 5 + (i * 37 + 11) % 90,
    y: 5 + (i * 53 + 7) % 90,
    dur: 8 + (i % 6) * 2.5,
    delay: -(i * 1.3),
    opacity: 0.12 + (i % 4) * 0.06,
  }));
  return (
    <div className="particles-field" aria-hidden>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size,
          left: `${p.x}%`, top: `${p.y}%`,
          opacity: p.opacity,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Reveal ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

/* ─── 3D Tilt Hook ─── */
function use3DTilt() {
  return useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientY - r.top) / r.height - 0.5) * -16;
    const y = ((e.clientX - r.left) / r.width - 0.5) * 16;
    el.style.transform = `perspective(900px) rotateX(${x}deg) rotateY(${y}deg) translateY(-6px) scale(1.02)`;
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
}

function resetTilt(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = '';
}

/* ─── Hero Background ─── */
function HeroBg() {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 22;
      my = (e.clientY / window.innerHeight - 0.5) * -14;
      apply();
    };
    const onScroll = () => apply();
    const apply = () => {
      if (!ref.current) return;
      const sy = window.scrollY;
      ref.current.style.transform = `translateY(${sy * 0.38}px) rotateY(${mx}deg) rotateX(${my}deg) scale(1.04)`;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('scroll', onScroll); };
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1400px', zIndex: 0, pointerEvents: 'none' }}>
      <img ref={ref} src="/assets/design-hero.png" alt="" style={{
        position: 'absolute', right: '-8%', top: '-12%', width: '72%', height: '130%',
        objectFit: 'cover', willChange: 'transform', transition: 'transform 0.18s ease-out',
        WebkitMaskImage: 'radial-gradient(ellipse 78% 75% at 62% 48%, black 30%, transparent 85%)',
        maskImage: 'radial-gradient(ellipse 78% 75% at 62% 48%, black 30%, transparent 85%)',
      }} />
    </div>
  );
}

/* ─── Nav ─── */
function Nav({ page, onNav }: { page: string; onNav: (p: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'appointments', label: 'Appointments' },
  ];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo" onClick={() => onNav('home')}>
          <img src="/assets/dey-logo.png" alt="DEY Marketing Logo" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 8 }} />
          <span>DEY <em style={{ fontStyle: 'italic', color: '#8d7048' }}>Marketing</em></span>
        </div>
        <div className="nav-links">
          {links.slice(1).map(l => (
            <button key={l.id} className={`nav-link ${page === l.id ? 'active' : ''}`} onClick={() => onNav(l.id)}>{l.label}</button>
          ))}
        </div>
        <button className="nav-cta" onClick={() => onNav('appointments')}>
          <span className="dot"></span>Book Now
        </button>
        <button className="nav-mobile-toggle" onClick={() => setMobileOpen(true)}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect width="16" height="1.5" rx="0.75" fill="#1a130d"/>
            <rect y="5" width="16" height="1.5" rx="0.75" fill="#1a130d"/>
            <rect y="10" width="16" height="1.5" rx="0.75" fill="#1a130d"/>
          </svg>
        </button>
      </nav>
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <button className="close-mob" onClick={() => setMobileOpen(false)}>×</button>
        {links.map(l => (
          <button key={l.id} className="m-link" onClick={() => { onNav(l.id); setMobileOpen(false); }}>{l.label}</button>
        ))}
      </div>
    </>
  );
}

/* ─── Footer ─── */
function Footer({ onNav }: { onNav: (p: string) => void }) {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand footer-col">
            <div className="serif-mark">
              <span className="mini-orb"></span>
              DEY <em style={{ fontStyle: 'italic', color: '#8d7048' }}>Marketing</em>
            </div>
            <p>Strategy. Creative. Growth. We build performance ad systems that turn clicks into customers — for ambitious brands ready to scale.</p>
          </div>
          <div className="footer-col">
            <h5>Navigate</h5>
            {['home','services','about','contact','appointments'].map(p => (
              <a key={p} onClick={() => onNav(p)} style={{ cursor: 'pointer' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</a>
            ))}
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            {['Meta Ads','Google Ads','Lead Generation','E-commerce Scaling'].map(s => <a key={s}>{s}</a>)}
          </div>
          <div className="footer-col">
            <h5>Connect</h5>
            <a href="https://instagram.com/deymarketing" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="mailto:deymarketing99@gmail.com">deymarketing99@gmail.com</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 DEY Marketing — All rights reserved</span>
          <span>Strategy · Creative · Growth</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Home ─── */
function Home({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  const tilt = use3DTilt();
  return (
    <div className="page depth-scene">
      {/* Hero */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <HeroBg />
        <div className="hero-gradient-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid">
            <div>
              <div className="eyebrow reveal in">Performance Ads Agency</div>
              <h1 className="reveal in hero-h1" style={{ marginTop: 24 }}>
                We run <span className="accent">high-converting</span> ad campaigns that turn clicks into customers.
              </h1>
              <p className="hero-sub reveal">
                At DEY Marketing, we help ambitious brands scale profitably using data-driven Meta and Google ad strategies — engineered for ROI, not vanity metrics.
              </p>
              <div className="hero-ctas reveal">
                <button className="btn btn-gold" onClick={() => onNav('appointments')}>Book a Strategy Call <span className="arrow">→</span></button>
                <button className="btn btn-ghost" onClick={() => onNav('services')}>Explore Services</button>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll depth hint */}
        <div className="scroll-hint reveal in">
          <span className="scroll-line" />
          <span className="scroll-label">scroll</span>
        </div>
      </section>

      {/* Services */}
      <section className="depth-layer">
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">Our Services</div>
            <h2 style={{ marginTop: 18 }}>Everything you need to <em>scale profitably</em>.</h2>
            <p>Four specialized practice areas, one obsession: predictable revenue from paid acquisition.</p>
          </div>
          <div className="services-grid">
            {[
              { num: '01', title: 'Meta Ads', desc: 'Facebook & Instagram campaigns engineered for full-funnel performance.', shape: '' },
              { num: '02', title: 'Google Ads', desc: 'Capture high-intent buyers actively searching for what you sell.', shape: 'shape-cube' },
              { num: '03', title: 'Lead Generation', desc: 'Consistent, qualified pipeline — built around your sales motion.', shape: 'shape-torus' },
              { num: '04', title: 'E-commerce Scaling', desc: 'Profitable growth systems for DTC brands ready for the next level.', shape: 'shape-pill' },
            ].map((s, i) => (
              <div key={i} className="service-card reveal tilt-card" onClick={() => onNav('services')}
                onMouseMove={tilt} onMouseLeave={resetTilt}
                style={{ transitionProperty: 'transform, box-shadow, border-color', transitionDuration: '0.55s', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}>
                <div className={`service-3d ${s.shape}`} />
                <div className="card-depth-gradient" />
                <div className="num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="more"><span>Learn more</span><span className="arr">→</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="process depth-layer">
        <div className="container">
          <div className="section-head reveal" style={{ textAlign: 'center', marginInline: 'auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>The Process</div>
            <h2 style={{ marginTop: 18 }}>Four steps to <em>predictable</em> growth.</h2>
          </div>
          <div className="process-track">
            <div className="process-line" />
            <div className="process-steps">
              {[
                { n: 'I', t: 'Strategy', d: 'Audit, ICP mapping, channel architecture.' },
                { n: 'II', t: 'Launch', d: 'Creative production, tracking, campaign build.' },
                { n: 'III', t: 'Optimize', d: 'Daily review, creative testing, budget shifts.' },
                { n: 'IV', t: 'Scale', d: 'Compound winners, expand channels, retain.' },
              ].map((s, i) => (
                <div key={i} className="process-step reveal">
                  <div className="marker">{s.n}</div>
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="depth-layer" style={{ paddingTop: 60 }}>
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">Client Words</div>
            <h2 style={{ marginTop: 18 }}>Results that <em>speak louder</em> than promises.</h2>
          </div>
          <div className="testimonials-row">
            {[
              { q: 'DEY rebuilt our acquisition engine from the ground up. ROAS jumped in three months — the system they built still runs itself.', n: 'Aanya Mehra', r: 'Founder · Loom & Linen', a: 'A' },
              { q: "They obsess over numbers the way we obsess over product. That's rare. That's why we stayed.", n: 'Vikram Shah', r: 'CMO · Verde Wellness', a: 'V' },
              { q: 'The first agency that actually understood our margin structure before suggesting spend.', n: 'Priya Nair', r: 'Director · Saanvi Studios', a: 'P' },
            ].map((t, i) => (
              <div key={i} className="testimonial reveal tilt-card"
                onMouseMove={tilt} onMouseLeave={resetTilt}
                style={{ transitionProperty: 'transform', transitionDuration: '0.55s', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}>
                <div className="quote-mark">"</div>
                <blockquote>{t.q}</blockquote>
                <div className="author">
                  <div className="avatar">{t.a}</div>
                  <div className="who"><strong>{t.n}</strong><span>{t.r}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="depth-layer" style={{ padding: '40px 0 0' }}>
        <div className="container">
          <div className="final-cta reveal">
            <div className="deco-orb deco-orb-1" />
            <div className="deco-orb deco-orb-2" />
            <h2>Ready to scale <em>your brand?</em></h2>
            <p>Book a free 30-minute audit. Walk away with a roadmap — even if we don't work together.</p>
            <div className="btns">
              <button className="btn btn-gold" onClick={() => onNav('appointments')}>Book a Call <span className="arrow">→</span></button>
              <button className="btn btn-ghost" onClick={() => onNav('contact')}>Send a Message</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Services ─── */
function Services({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  const tilt = use3DTilt();
  const services = [
    { num: '01 / 04', title: 'Meta Ads', desc: 'We create high-converting Facebook and Instagram campaigns that turn attention into revenue. Full-funnel architecture, daily creative testing, and creative-led iteration — built for performance.', bullets: ['Full-funnel campaign architecture', 'UGC + studio creative production', 'Pixel & Conversions API setup', 'Daily testing & budget reallocation'] },
    { num: '02 / 04', title: 'Google Ads', desc: 'Capture high-intent customers actively searching for your business. Search, Performance Max, YouTube — we build Google ecosystems that compound.', bullets: ['Search & Performance Max campaigns', 'Keyword research & negative lists', 'Landing page optimization', 'Bid strategy & budget pacing'] },
    { num: '03 / 04', title: 'Lead Generation', desc: 'Consistent, qualified leads engineered around your sales motion. We build the lead system, not just the ads.', bullets: ['Offer & funnel architecture', 'Form optimization & lead scoring', 'CRM + automation integration', 'Weekly pipeline reporting'] },
    { num: '04 / 04', title: 'E-commerce Scaling', desc: 'Scale your online store profitably with creative-led, data-driven systems. From ₹5L/mo to ₹50L/mo — engineered for margin.', bullets: ['Catalog & feed optimization', 'Lifecycle email + SMS', 'Creative testing pods', 'Margin-first scaling playbook'] },
  ];
  return (
    <div className="page depth-scene">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Services</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">Built for <em>brands that scale.</em></h1>
          <p className="lede reveal in">Four specialized practices. One performance philosophy. Pick what you need — we'll build it like it's our own brand on the line.</p>
        </div>
      </section>
      {services.map((s, i) => (
        <section key={i} className="service-detail depth-layer">
          <div className="container">
            <div className="service-detail-grid">
              <div className="reveal">
                <div className="num-large">{s.num}</div>
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
                <ul>{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                <button className="btn btn-primary" onClick={() => onNav('appointments')}>Get Started <span className="arrow">→</span></button>
              </div>
              <div className="service-vis reveal tilt-card" onMouseMove={tilt} onMouseLeave={resetTilt}
                style={{ transitionProperty: 'transform', transitionDuration: '0.55s', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}>
                <div className="vis-orb" style={{
                  ...(i === 1 ? { borderRadius: 24, transform: 'rotate(-12deg)' } : {}),
                  ...(i === 2 ? { background: 'transparent', border: '36px solid', borderColor: '#d4b483 #b89968 #8d7048 #b89968', boxShadow: '0 30px 60px rgba(58,38,18,0.25)' } : {}),
                  ...(i === 3 ? { width: '70%', height: '40%', borderRadius: 999 } : {}),
                }} />
              </div>
            </div>
          </div>
        </section>
      ))}
      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="final-cta reveal">
            <div className="deco-orb deco-orb-1" />
            <div className="deco-orb deco-orb-2" />
            <h2>Let's <em>build it</em> together.</h2>
            <p>Free audit. Honest roadmap. No pitch deck.</p>
            <div className="btns">
              <button className="btn btn-gold" onClick={() => onNav('appointments')}>Book a Strategy Call <span className="arrow">→</span></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── About ─── */
function About({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  const tilt = use3DTilt();
  return (
    <div className="page depth-scene">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">About</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">About <em>DEY Marketing.</em></h1>
          <p className="lede reveal in">A performance-driven ads agency obsessed with one number: profitable revenue. We build paid acquisition systems for brands that take growth seriously.</p>
        </div>
      </section>
      <section className="depth-layer" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="section-head reveal" style={{ maxWidth: 820 }}>
            <div className="eyebrow">Our Mission</div>
            <h2 style={{ marginTop: 18 }}>We help brands grow <em>profitably</em> — through systems, not guesswork.</h2>
            <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.6 }}>
              Most agencies celebrate impressions. We celebrate margin. DEY was founded on the belief that paid media should pay for itself — and then some. That means understanding your unit economics before we touch a single ad set, and reporting on what actually moves your business: contribution margin, payback period, LTV.
            </p>
          </div>
        </div>
      </section>
      <section className="depth-layer" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">What Makes Us Different</div>
            <h2 style={{ marginTop: 18 }}>Three things we won't compromise on.</h2>
          </div>
          <div className="values-grid">
            {[
              { t: 'Data-first approach', d: 'Every decision starts with numbers. We build dashboards before we build campaigns, and let attribution drive strategy.', cls: 'v-1' },
              { t: 'ROI over vanity', d: "We don't care about reach if reach doesn't pay. Margin is our north star — yours should be too.", cls: 'v-2' },
              { t: 'Scalable systems', d: 'Random creative wins fade. Systems compound. We build playbooks your team can run for years.', cls: 'v-3' },
            ].map((v, i) => (
              <div key={i} className={`value-card ${v.cls} reveal tilt-card`} onMouseMove={tilt} onMouseLeave={resetTilt}
                style={{ transitionProperty: 'transform', transitionDuration: '0.55s', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}>
                <div className="icon-3d" />
                <h4>{v.t}</h4>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="depth-layer" style={{ paddingTop: 80 }}>
        <div className="container">
          <div className="final-cta reveal">
            <div className="deco-orb deco-orb-1" />
            <div className="deco-orb deco-orb-2" />
            <h2>Want to <em>work with us?</em></h2>
            <p>We take on a limited number of clients each quarter. Tell us about your brand.</p>
            <div className="btns">
              <button className="btn btn-gold" onClick={() => onNav('appointments')}>Book a Strategy Call <span className="arrow">→</span></button>
              <button className="btn btn-ghost" onClick={() => onNav('contact')}>Send a Brief</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Contact ─── */
function Contact({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch { setError('Something went wrong. Please WhatsApp us directly at +91 93730 69367.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page depth-scene">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Contact</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">Let's <em>scale</em> your business.</h1>
          <p className="lede reveal in">Tell us about your business, goals, and budget — we'll get back to you with the next steps.</p>
        </div>
      </section>
      <section className="depth-layer" style={{ paddingTop: 20, paddingBottom: 0 }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info reveal">
              <h3>Get a custom growth plan.</h3>
              <p>Share a few details about your brand and where you'd like to be.</p>
              {[
                { lbl: 'Email', val: 'deymarketing99@gmail.com' },
                { lbl: 'Phone', val: '+91 93730 69367' },
                { lbl: 'Location', val: 'Mumbai & Pune' },
                { lbl: 'Hours', val: 'Mon — Fri · 10:00 AM — 7:00 PM' },
              ].map((item, i) => (
                <div key={i} className="info-item">
                  <span className="lbl">{item.lbl}</span>
                  <span className="val">{item.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 28, padding: '16px 18px', borderRadius: 16, background: 'rgba(184,153,104,0.12)', border: '1px solid rgba(184,153,104,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', flexShrink: 0, boxShadow: '0 0 0 4px rgba(76,175,80,0.15)' }} />
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>For faster response, message us on <strong style={{ color: 'var(--ink-1)' }}>WhatsApp</strong>.</span>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-ghost" onClick={() => onNav('appointments')}>Or book a strategy call <span className="arrow">→</span></button>
              </div>
            </div>
            <div className="contact-form reveal">
              {submitted ? (
                <div className="form-success">
                  <div className="check">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M6 14L11.5 19L22 8" stroke="#1a130d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Thanks, {form.name || 'we got it'}.</h3>
                  <p>We'll review your details and come back within 24 hours with the next steps.</p>
                  <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}>Send another</button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="form-grid">
                    <div className="form-field full"><label>Full Name</label><input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Aanya Mehra" /></div>
                    <div className="form-field full"><label>Email Address</label><input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@brand.com" /></div>
                    <div className="form-field full"><label>Tell us about your business, goals, and monthly ad budget</label><textarea required value={form.message} onChange={e => set('message', e.target.value)} placeholder="A few sentences about your business, the growth goal you're chasing, and the monthly ad budget you're working with." style={{ minHeight: 160 }} /></div>
                  </div>
                  <div className="form-submit">
                    <span className="note"><span className="pulse" />We respond within 24 hours</span>
                    <button type="submit" className="btn btn-gold" disabled={submitting}>{submitting ? 'Sending…' : 'Get My Growth Plan'} <span className="arrow">→</span></button>
                  </div>
                  {error && <p style={{ marginTop: 12, color: '#c0392b', fontSize: 13 }}>{error}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <div style={{ paddingBottom: 80 }} />
    </div>
  );
}

/* ─── Appointments ─── */
function Appointments() {
  useReveal();
  useEffect(() => {
    const tryInit = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidget({ url: 'https://calendly.com/deymarketing99/30min?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=b89968', parentElement: document.getElementById('calendly-embed') });
      } else { setTimeout(tryInit, 500); }
    };
    tryInit();
  }, []);
  return (
    <div className="page depth-scene">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Appointments</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">Book a <em>Strategy Call.</em></h1>
          <p className="lede reveal in">Pick a time that works for you — 30 minutes to understand your business and map out a growth plan.</p>
        </div>
      </section>
      <section className="depth-layer" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="appt-grid">
            <div className="appt-info-card reveal">
              <span className="pill">●&nbsp; Free · 30 Minutes</span>
              <h3>What to expect.</h3>
              <p>A direct conversation about your business and where you'd like to take it.</p>
              {[
                { shape: '', h: 'Focused discussion', d: 'A clear conversation about your business and growth goals.' },
                { shape: '50%', h: 'Strategic direction', d: 'High-level direction tailored to your niche and stage.' },
                { shape: '50% 14px 50% 14px', h: 'Honest assessment', d: "A straight answer on whether we can help you scale." },
                { shape: '14px 50% 14px 50%', h: 'Next steps', d: "If we're aligned, we'll outline how we move forward together." },
              ].map((f, i) => (
                <div key={i} className="feature">
                  <div className="ic" style={f.shape ? { borderRadius: f.shape } : {}} />
                  <div><h4>{f.h}</h4><p>{f.d}</p></div>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 16, background: 'rgba(184,153,104,0.12)', border: '1px solid rgba(184,153,104,0.25)' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, display: 'block' }}>Best suited for serious business owners looking to scale with paid ads.</span>
              </div>
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 16, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>Prefer to chat first? <a href="https://wa.me/919373069367" target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: 600, textDecoration: 'none' }}>WhatsApp us →</a></span>
              </div>
            </div>
            <div className="calendar-card reveal" style={{ padding: 0, overflow: 'hidden', minHeight: 680 }}>
              <div id="calendly-embed" className="calendly-inline-widget" data-url="https://calendly.com/deymarketing99/30min" style={{ minWidth: 320, height: 680 }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Root App ─── */
const TWEAK_DEFAULTS = { mood: 'editorial', motion: 'lively', form: 'organic' };

export default function App() {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState('home');
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const onNav = (p: string) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.dataset.mood = t.mood;
    document.body.dataset.motion = t.motion;
    document.body.dataset.form = t.form;
  }, [t.mood, t.motion, t.form]);

  useEffect(() => {
    let cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      cx = (e.clientX / window.innerWidth - 0.5) * 30;
      cy = (e.clientY / window.innerHeight - 0.5) * 30;
      document.documentElement.style.setProperty('--cx', `${cx}px`);
      document.documentElement.style.setProperty('--cy', `${cy}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* Scroll-linked perspective depth */
  useEffect(() => {
    const onScroll = () => {
      const layers = document.querySelectorAll<HTMLElement>('.depth-layer');
      layers.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const z = Math.max(-60, Math.min(0, center * 0.04));
        const scale = 1 + Math.max(0, Math.min(0.02, (-center) * 0.00004));
        el.style.transform = `translateZ(${z}px) scale(${scale})`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [page]);

  return (
    <>
      <CustomCursor />
      {!ready && <CinematicIntro onDone={() => setReady(true)} />}
      <div className={`site-wrapper ${ready ? 'site-ready' : ''}`}>
        {/* Ambient blobs */}
        <div className="ambient-blob ab-1" />
        <div className="ambient-blob ab-2" />
        <Particles />

        <Nav page={page} onNav={onNav} />

        <div className="perspective-root">
          {page === 'home' && <Home onNav={onNav} />}
          {page === 'services' && <Services onNav={onNav} />}
          {page === 'about' && <About onNav={onNav} />}
          {page === 'contact' && <Contact onNav={onNav} />}
          {page === 'appointments' && <Appointments />}
        </div>

        <Footer onNav={onNav} />

        {/* WhatsApp FAB */}
        <a href="https://wa.me/919373069367" target="_blank" rel="noreferrer" title="Chat on WhatsApp" className="whatsapp-fab">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        <TweaksPanel title="Tweaks">
          <TweakSection label="Mood" />
          <TweakRadio label="Palette" value={t.mood} options={[{ value: 'editorial', label: 'Editorial' }, { value: 'studio', label: 'Studio' }, { value: 'nocturne', label: 'Nocturne' }]} onChange={v => setTweak('mood', v)} />
          <TweakSection label="Motion" />
          <TweakRadio label="Energy" value={t.motion} options={[{ value: 'calm', label: 'Calm' }, { value: 'lively', label: 'Lively' }, { value: 'cinematic', label: 'Cinematic' }]} onChange={v => setTweak('motion', v)} />
          <TweakSection label="Form Language" />
          <TweakRadio label="Shape" value={t.form} options={[{ value: 'organic', label: 'Organic' }, { value: 'geometric', label: 'Geometric' }]} onChange={v => setTweak('form', v)} />
        </TweaksPanel>
      </div>
    </>
  );
}
