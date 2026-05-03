import { useState, useEffect, useRef } from 'react';
import { TweaksPanel, TweakSection, TweakRadio, useTweaks } from './components/TweaksPanel';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement | null }) => void;
    };
  }
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function HeroBg() {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 18;
      my = (e.clientY / window.innerHeight - 0.5) * -12;
      apply();
    };
    const onScroll = () => apply();
    const apply = () => {
      if (!ref.current) return;
      const sy = window.scrollY;
      ref.current.style.transform = `translateY(${sy * 0.35}px) rotateY(${mx}deg) rotateX(${my}deg)`;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: '1200px', zIndex: 0, pointerEvents: 'none' }}>
      <img
        ref={ref}
        src="/assets/design-hero.png"
        alt=""
        style={{
          position: 'absolute', right: '-8%', top: '-12%', width: '72%', height: '130%',
          objectFit: 'cover', willChange: 'transform', transition: 'transform 0.14s ease-out',
          WebkitMaskImage: 'radial-gradient(ellipse 78% 75% at 62% 48%, black 30%, transparent 85%)',
          maskImage: 'radial-gradient(ellipse 78% 75% at 62% 48%, black 30%, transparent 85%)',
        }}
      />
    </div>
  );
}

function Counter({ to, suffix = '', prefix = '', duration = 1800 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !seen.current) {
          seen.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(Math.floor(to * eased));
            if (t < 1) requestAnimationFrame(tick);
            else setVal(to);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

function Nav({ page, onNav }: { page: string; onNav: (p: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'appointments', label: 'Appointments' },
  ];
  return (
    <>
      <nav className="nav">
        <div className="nav-logo" onClick={() => onNav('home')}>
          <img src="/assets/dey-logo.png" alt="DEY Marketing Logo" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 8 }} />
          <span>DEY <em style={{ fontStyle: 'italic', color: '#8d7048' }}>Marketing</em></span>
        </div>
        <div className="nav-links">
          {links.slice(1).map((l) => (
            <button key={l.id} className={`nav-link ${page === l.id ? 'active' : ''}`} onClick={() => onNav(l.id)}>
              {l.label}
            </button>
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
        {links.map((l) => (
          <button key={l.id} className="m-link" onClick={() => { onNav(l.id); setMobileOpen(false); }}>{l.label}</button>
        ))}
      </div>
    </>
  );
}

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
            <a onClick={() => onNav('home')}>Home</a>
            <a onClick={() => onNav('services')}>Services</a>
            <a onClick={() => onNav('about')}>About</a>
            <a onClick={() => onNav('contact')}>Contact</a>
            <a onClick={() => onNav('appointments')}>Appointments</a>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <a>Meta Ads</a>
            <a>Google Ads</a>
            <a>Lead Generation</a>
            <a>E-commerce Scaling</a>
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

function Home({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  return (
    <div className="page">
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <HeroBg />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to right, var(--bg) 38%, rgba(250,248,245,0.55) 65%, transparent 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid">
            <div>
              <div className="eyebrow reveal in">Performance Ads Agency</div>
              <h1 style={{ marginTop: 24 }} className="reveal in">
                We run <span className="accent">high-converting</span> ad campaigns that turn clicks into customers.
              </h1>
              <p className="hero-sub reveal">
                At DEY Marketing, we help ambitious brands scale profitably using data-driven Meta and Google ad strategies — engineered for ROI, not vanity metrics.
              </p>
              <div className="hero-ctas reveal">
                <button className="btn btn-gold" onClick={() => onNav('appointments')}>Book a Strategy Call <span className="arrow">→</span></button>
                <button className="btn btn-ghost" onClick={() => onNav('services')}>Learn More</button>
              </div>
              <div className="hero-meta reveal">
                <div className="hero-meta-item">
                  <span className="num"><Counter to={10} suffix="L+" /></span>
                  <span className="lbl">Ad spend managed</span>
                </div>
                <div className="hero-meta-item">
                  <span className="num"><Counter to={100} suffix="+" /></span>
                  <span className="lbl">Leads generated</span>
                </div>
                <div className="hero-meta-item">
                  <span className="num"><Counter to={4} suffix=".8x" /></span>
                  <span className="lbl">Avg ROAS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="proof-label">Trusted by growing brands across India & beyond</div>
          <div className="proof-row">
            {[
              { num: <>₹<em><Counter to={10} /></em>L+</>, lbl: 'Ad spend managed' },
              { num: <><Counter to={100} />+</>, lbl: 'Leads generated' },
              { num: <><em><Counter to={4} />.8</em>x</>, lbl: 'Average ROAS' },
              { num: <><Counter to={32} /></>, lbl: 'Brands scaled' },
            ].map((c, i) => (
              <div key={i} className="proof-cell reveal">
                <div className="num">{c.num}</div>
                <div className="lbl">{c.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
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
              <div key={i} className="service-card reveal" onClick={() => onNav('services')}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                }}>
                <div className={`service-3d ${s.shape}`}></div>
                <div className="num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="more"><span>Learn more</span><span className="arr">→</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="process">
        <div className="container">
          <div className="section-head reveal" style={{ textAlign: 'center', marginInline: 'auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>The Process</div>
            <h2 style={{ marginTop: 18 }}>Four steps to <em>predictable</em> growth.</h2>
          </div>
          <div className="process-track">
            <div className="process-line"></div>
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

      <section style={{ paddingTop: 60 }}>
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">Client Words</div>
            <h2 style={{ marginTop: 18 }}>Results that <em>speak louder</em> than promises.</h2>
          </div>
          <div className="testimonials-row">
            {[
              { q: 'DEY rebuilt our acquisition engine from the ground up. ROAS went from 1.8x to 5.2x in three months.', n: 'Aanya Mehra', r: 'Founder · Loom & Linen', a: 'A' },
              { q: "They obsess over numbers the way we obsess over product. That's rare. That's why we stayed.", n: 'Vikram Shah', r: 'CMO · Verde Wellness', a: 'V' },
              { q: 'The first agency that actually understood our margin structure before suggesting spend.', n: 'Priya Nair', r: 'Director · Saanvi Studios', a: 'P' },
            ].map((t, i) => (
              <div key={i} className="testimonial reveal">
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

      <section style={{ padding: '40px 0 0' }}>
        <div className="container">
          <div className="final-cta reveal">
            <div className="deco-orb deco-orb-1"></div>
            <div className="deco-orb deco-orb-2"></div>
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

function Services({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  const services = [
    { num: '01 / 04', title: 'Meta Ads', desc: 'We create high-converting Facebook and Instagram campaigns that turn attention into revenue. Full-funnel architecture, daily creative testing, and creative-led iteration — built for performance.', bullets: ['Full-funnel campaign architecture', 'UGC + studio creative production', 'Pixel & Conversions API setup', 'Daily testing & budget reallocation'] },
    { num: '02 / 04', title: 'Google Ads', desc: 'Capture high-intent customers actively searching for your business. Search, Performance Max, YouTube — we build Google ecosystems that compound.', bullets: ['Search & Performance Max campaigns', 'Keyword research & negative lists', 'Landing page optimization', 'Bid strategy & budget pacing'] },
    { num: '03 / 04', title: 'Lead Generation', desc: 'Consistent, qualified leads engineered around your sales motion. We build the lead system, not just the ads.', bullets: ['Offer & funnel architecture', 'Form optimization & lead scoring', 'CRM + automation integration', 'Weekly pipeline reporting'] },
    { num: '04 / 04', title: 'E-commerce Scaling', desc: 'Scale your online store profitably with creative-led, data-driven systems. From ₹5L/mo to ₹50L/mo — engineered for margin.', bullets: ['Catalog & feed optimization', 'Lifecycle email + SMS', 'Creative testing pods', 'Margin-first scaling playbook'] },
  ];
  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Services</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">Built for <em>brands that scale.</em></h1>
          <p className="lede reveal in">Four specialized practices. One performance philosophy. Pick what you need — we'll build it like it's our own brand on the line.</p>
        </div>
      </section>
      {services.map((s, i) => (
        <section key={i} className="service-detail">
          <div className="container">
            <div className="service-detail-grid">
              <div className="reveal">
                <div className="num-large">{s.num}</div>
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
                <ul>{s.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                <button className="btn btn-primary" onClick={() => onNav('appointments')}>Get Started <span className="arrow">→</span></button>
              </div>
              <div className="service-vis reveal">
                <div className="vis-orb" style={{
                  ...(i === 1 ? { borderRadius: 24, transform: 'rotate(-12deg)' } : {}),
                  ...(i === 2 ? { background: 'transparent', border: '36px solid', borderColor: '#d4b483 #b89968 #8d7048 #b89968', boxShadow: '0 30px 60px rgba(58,38,18,0.25)' } : {}),
                  ...(i === 3 ? { width: '70%', height: '40%', borderRadius: 999 } : {}),
                }}></div>
              </div>
            </div>
          </div>
        </section>
      ))}
      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="final-cta reveal">
            <div className="deco-orb deco-orb-1"></div>
            <div className="deco-orb deco-orb-2"></div>
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

function About({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">About</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">About <em>DEY Marketing.</em></h1>
          <p className="lede reveal in">A performance-driven ads agency obsessed with one number: profitable revenue. We build paid acquisition systems for brands that take growth seriously.</p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-stats reveal">
            <div className="about-stat"><div className="num"><em><Counter to={32} /></em></div><div className="lbl">Brands scaled</div></div>
            <div className="about-stat"><div className="num">₹<em><Counter to={10} /></em>L+</div><div className="lbl">Spend managed</div></div>
            <div className="about-stat"><div className="num"><em><Counter to={4} /></em>.8x</div><div className="lbl">Average ROAS</div></div>
          </div>
        </div>
      </section>
      <section style={{ padding: '40px 0' }}>
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
      <section style={{ paddingTop: 40 }}>
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
              <div key={i} className={`value-card ${v.cls} reveal`}>
                <div className="icon-3d"></div>
                <h4>{v.t}</h4>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ paddingTop: 80 }}>
        <div className="container">
          <div className="final-cta reveal">
            <div className="deco-orb deco-orb-1"></div>
            <div className="deco-orb deco-orb-2"></div>
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

function Contact({ onNav }: { onNav: (p: string) => void }) {
  useReveal();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please WhatsApp us directly at +91 93730 69367.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Contact</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">Let's <em>scale</em> your business.</h1>
          <p className="lede reveal in">Tell us about your business, goals, and budget — we'll get back to you with the next steps to grow your brand.</p>
        </div>
      </section>
      <section style={{ paddingTop: 20, paddingBottom: 0 }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info reveal">
              <h3>Get a custom growth plan.</h3>
              <p>Share a few details about your brand and where you'd like to be. We'll come back with the next steps.</p>
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
              <div style={{ marginTop: 28, padding: '16px 18px', borderRadius: 16, background: 'rgba(184, 153, 104, 0.12)', border: '1px solid rgba(184, 153, 104, 0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', flexShrink: 0, boxShadow: '0 0 0 4px rgba(76,175,80,0.15)' }}></span>
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
                    <div className="form-field full">
                      <label>Full Name</label>
                      <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Aanya Mehra" />
                    </div>
                    <div className="form-field full">
                      <label>Email Address</label>
                      <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@brand.com" />
                    </div>
                    <div className="form-field full">
                      <label>Tell us about your business, goals, and monthly ad budget</label>
                      <textarea required value={form.message} onChange={e => set('message', e.target.value)} placeholder="A few sentences about your business, the growth goal you're chasing, and the monthly ad budget you're working with." style={{ minHeight: 160 }} />
                    </div>
                  </div>
                  <div className="form-submit">
                    <span className="note"><span className="pulse"></span>We respond within 24 hours</span>
                    <button type="submit" className="btn btn-gold" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Get My Growth Plan'} <span className="arrow">→</span>
                    </button>
                  </div>
                  {error && <p style={{ marginTop: 12, color: '#c0392b', fontSize: 13 }}>{error}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <div style={{ paddingBottom: 80 }}></div>
    </div>
  );
}

function Appointments() {
  useReveal();
  useEffect(() => {
    const tryInit = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidget({
          url: 'https://calendly.com/deymarketing99/30min?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=b89968',
          parentElement: document.getElementById('calendly-embed'),
        });
      } else {
        setTimeout(tryInit, 500);
      }
    };
    tryInit();
  }, []);

  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Appointments</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">Book a <em>Strategy Call.</em></h1>
          <p className="lede reveal in">Pick a time that works for you — 30 minutes to understand your business and map out a growth plan.</p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="appt-grid">
            <div className="appt-info-card reveal">
              <span className="pill">●&nbsp; Free · 30 Minutes</span>
              <h3>What to expect.</h3>
              <p>A direct conversation about your business and where you'd like to take it — nothing more, nothing less.</p>
              {[
                { shape: '', h: 'Focused discussion', d: 'A clear conversation about your business and growth goals.' },
                { shape: '50%', h: 'Strategic direction', d: 'High-level direction tailored to your niche and stage.' },
                { shape: '50% 14px 50% 14px', h: 'Honest assessment', d: "A straight answer on whether we can help you scale." },
                { shape: '14px 50% 14px 50%', h: 'Next steps', d: "If we're aligned, we'll outline how we move forward together." },
              ].map((f, i) => (
                <div key={i} className="feature">
                  <div className="ic" style={f.shape ? { borderRadius: f.shape } : {}}></div>
                  <div><h4>{f.h}</h4><p>{f.d}</p></div>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 16, background: 'rgba(184, 153, 104, 0.12)', border: '1px solid rgba(184, 153, 104, 0.25)' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, display: 'block' }}>This call is best suited for serious business owners looking to scale with paid ads.</span>
              </div>
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 16, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Prefer to chat first?{' '}
                  <a href="https://wa.me/919373069367" target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: 600, textDecoration: 'none' }}>WhatsApp us →</a>
                </span>
              </div>
            </div>
            <div className="calendar-card reveal" style={{ padding: 0, overflow: 'hidden', minHeight: 680 }}>
              <div
                id="calendly-embed"
                className="calendly-inline-widget"
                data-url="https://calendly.com/deymarketing99/30min?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=b89968"
                style={{ minWidth: 320, height: 680 }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const TWEAK_DEFAULTS = { mood: 'editorial', motion: 'lively', form: 'organic' };

export default function App() {
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
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      document.documentElement.style.setProperty('--cx', `${x}px`);
      document.documentElement.style.setProperty('--cy', `${y}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <Nav page={page} onNav={onNav} />
      <div className="ambient-blob" style={{ position: 'fixed', top: '5%', right: '-8%', width: 380, height: 380, background: 'radial-gradient(circle, #d4b483, transparent 70%)', transform: 'translate(var(--cx,0), var(--cy,0))', transition: 'transform 0.8s ease-out', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }}></div>
      <div className="ambient-blob" style={{ position: 'fixed', top: '60%', left: '-10%', width: 420, height: 420, background: 'radial-gradient(circle, #b89968, transparent 70%)', opacity: 0.35, transform: 'translate(calc(var(--cx,0) * -1), calc(var(--cy,0) * -1))', transition: 'transform 0.8s ease-out', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }}></div>

      {page === 'home' && <Home onNav={onNav} />}
      {page === 'services' && <Services onNav={onNav} />}
      {page === 'about' && <About onNav={onNav} />}
      {page === 'contact' && <Contact onNav={onNav} />}
      {page === 'appointments' && <Appointments />}

      <Footer onNav={onNav} />

      <a href="https://wa.me/919373069367" target="_blank" rel="noreferrer" title="Chat on WhatsApp"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, width: 56, height: 56, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.45)', transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)'; }}>
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
    </>
  );
}
