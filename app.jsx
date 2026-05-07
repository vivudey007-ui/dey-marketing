// DEY Marketing — App shell with routing + components

const { useState, useEffect, useRef, useMemo } = React;

// ---------- Reveal-on-scroll hook (GSAP, sibling-stagger) ----------
function useReveal() {
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      const triggers = [];
      const unrevd = document.querySelectorAll('.reveal:not(.in)');

      // Group siblings sharing the same direct parent
      const groups = new Map();
      unrevd.forEach((el) => {
        const p = el.parentElement;
        if (!groups.has(p)) groups.set(p, []);
        groups.get(p).push(el);
      });

      groups.forEach((els, parent) => {
        gsap.set(els, { opacity: 0, y: 32, willChange: 'transform,opacity' });
        const t = ScrollTrigger.create({
          trigger: parent, start: 'top 88%', once: true,
          onEnter() {
            gsap.to(els, {
              opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
              stagger: els.length > 1 ? 0.1 : 0,
            });
            els.forEach((el) => el.classList.add('in'));
          },
        });
        triggers.push(t);
      });

      ScrollTrigger.refresh();
      return () => triggers.forEach((t) => t.kill());
    }
    // fallback: IntersectionObserver
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// ---------- Page enter animation ----------
function usePageEnter() {
  useEffect(() => {
    if (!window.gsap) return;
    gsap.fromTo('.page', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, []);
}

// ---------- Section parallax ----------
function useParallax() {
  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const kills = [];

    // Section heads drift gently upward
    document.querySelectorAll('.section-head').forEach((el) => {
      const t = gsap.fromTo(el, { y: 36 }, { y: -18, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.8 },
      });
      kills.push(t.scrollTrigger);
    });

    // Proof cells — staggered y offset
    document.querySelectorAll('.proof-cell').forEach((el, i) => {
      const t = gsap.fromTo(el, { y: 20 + i * 6 }, { y: 0, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1.2 },
      });
      kills.push(t.scrollTrigger);
    });

    // Ambient blobs follow scroll at different speeds
    document.querySelectorAll('.ambient-blob').forEach((el, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      const t = gsap.to(el, { y: dir * 80, ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 },
      });
      kills.push(t.scrollTrigger);
    });

    return () => kills.forEach((t) => t && t.kill());
  }, []);
}

// ---------- Marquee ----------
function Marquee() {
  const text = 'Meta Ads  ·  Web Design  ·  Brand Growth  ·  Performance Marketing  ·  Creative Strategy  ·  ROAS Focused  ·  ';
  return (
    <div className="dey-marquee">
      <div className="dey-marquee-track">
        <span>{text}</span><span>{text}</span>
      </div>
    </div>
  );
}

// ---------- Hero Background Image ----------
function HeroBg() {
  const imgRef = useRef(null);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!imgRef.current) return;

    // Mouse tilt on wrapper (separate from GSAP y)
    const onMove = (e) => {
      if (!wrapRef.current) return;
      const rx = (e.clientX / window.innerWidth - 0.5) * 12;
      const ry = (e.clientY / window.innerHeight - 0.5) * -8;
      wrapRef.current.style.transform = `perspective(1200px) rotateY(${rx}deg) rotateX(${ry}deg)`;
    };
    window.addEventListener('mousemove', onMove);

    // GSAP scroll parallax — image drifts down as hero exits
    let st;
    if (window.gsap && window.ScrollTrigger) {
      st = gsap.to(imgRef.current, {
        y: '42%', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
      });
      // Hero text counter-drifts upward (depth illusion)
      gsap.to('.hero-grid', {
        y: '-12%', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      });
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (st && st.scrollTrigger) st.scrollTrigger.kill();
    };
  }, []);
  return (
    <div ref={wrapRef} style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      zIndex: 0, pointerEvents: 'none',
      transition: 'transform 0.16s ease-out', willChange: 'transform',
    }}>
      <img
        ref={imgRef}
        src="assets/design-hero.png"
        alt=""
        style={{
          position: 'absolute',
          right: '-8%', top: '-12%',
          width: '72%', height: '130%',
          objectFit: 'cover',
          willChange: 'transform',
          transition: 'transform 0.14s ease-out',
          WebkitMaskImage: 'radial-gradient(ellipse 78% 75% at 62% 48%, black 30%, transparent 85%)',
          maskImage: 'radial-gradient(ellipse 78% 75% at 62% 48%, black 30%, transparent 85%)',
        }}
      />
    </div>
  );
}

function OrbStage() { return null; }

// ---------- Counter ----------
function Counter({ to, suffix = '', prefix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const seen = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !seen.current) {
          seen.current = true;
          const start = performance.now();
          const tick = (now) => {
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

// ---------- Nav ----------
function Nav({ page, onNav }) {
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
          <img src="assets/dey-logo.png" alt="DEY Marketing Logo" style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 8 }} />
          <span>DEY <em style={{ fontStyle: 'italic', color: '#8d7048' }}>Marketing</em></span>
        </div>
        <div className="nav-links">
          {links.slice(1).map((l) => (
            <button
              key={l.id}
              className={`nav-link ${page === l.id ? 'active' : ''}`}
              onClick={() => onNav(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button className="nav-cta" onClick={() => onNav('appointments')}>
          <span className="dot"></span>
          Book Now
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
          <button key={l.id} className="m-link" onClick={() => { onNav(l.id); setMobileOpen(false); }}>
            {l.label}
          </button>
        ))}
      </div>
    </>
  );
}

// ---------- Footer ----------
function Footer({ onNav }) {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand footer-col">
            <div className="serif-mark">
              <span className="mini-orb"></span>
              DEY <em style={{ fontStyle: 'italic', color: '#8d7048' }}>Marketing</em>
            </div>
            <p>Ads that bring people in. Websites that convert them. We build the full online presence for brands ready to grow.</p>
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
            <a onClick={() => onNav('services')}>Meta Ads</a>
            <a onClick={() => onNav('services')}>Web Design</a>
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

// ---------- HOME ----------
function Home({ onNav }) {
  useReveal();
  usePageEnter();
  useParallax();
  return (
    <div className="page">
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <HeroBg />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(to right, var(--bg) 38%, rgba(250,248,245,0.55) 65%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid">
            <div>
              <div className="eyebrow reveal in">Ads · Web Design · Growth</div>
              <h1 style={{ marginTop: 24 }} className="reveal in">
                We build your <span className="accent">complete online presence</span> — ads that convert and websites that close.
              </h1>
              <p className="hero-sub reveal">
                At DEY Marketing, we run high-performance Meta ad campaigns and build sharp, fast websites for brands ready to grow — handled end to end, so you don't have to.
              </p>
              <div className="hero-ctas reveal">
                <button className="btn btn-gold" onClick={() => onNav('appointments')}>
                  Book a Strategy Call <span className="arrow">→</span>
                </button>
                <button className="btn btn-ghost" onClick={() => onNav('services')}>
                  Learn More
                </button>
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
            <OrbStage />
          </div>
        </div>
      </section>

      <Marquee />

      {/* Social proof */}
      <section className="proof" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="proof-label">Trusted by growing brands across India & beyond</div>
          <div className="proof-row">
            <div className="proof-cell reveal">
              <div className="num">₹<em><Counter to={10} /></em>L+</div>
              <div className="lbl">Ad spend managed</div>
            </div>
            <div className="proof-cell reveal">
              <div className="num"><Counter to={100} />+</div>
              <div className="lbl">Leads generated</div>
            </div>
            <div className="proof-cell reveal">
              <div className="num"><em><Counter to={4} />.8</em>x</div>
              <div className="lbl">Average ROAS</div>
            </div>
            <div className="proof-cell reveal">
              <div className="num"><Counter to={32} /></div>
              <div className="lbl">Brands scaled</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section>
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">Our Services</div>
            <h2 style={{ marginTop: 18 }}>Everything you need to <em>grow online</em>.</h2>
            <p>Two focused practices. Ads that convert and websites that close.</p>
          </div>
          <div className="services-grid">
            {[
              { num: '01', title: 'Meta Ads', desc: 'Facebook & Instagram campaigns engineered for full-funnel performance — creatives, targeting, and ROAS, handled end to end.', shape: '' },
              { num: '02', title: 'Web Design', desc: 'Fast, branded websites and landing pages built to look sharp and convert — deployed in days, not months.', shape: 'shape-cube' },
            ].map((s, i) => (
              <div key={i} className="service-card reveal" onClick={() => onNav('services')}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const xp = (e.clientX - r.left) / r.width - 0.5;
                  const yp = (e.clientY - r.top) / r.height - 0.5;
                  e.currentTarget.style.transform = `perspective(900px) rotateY(${xp * 10}deg) rotateX(${-yp * 7}deg) translateY(-4px) translateZ(8px)`;
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                }}>
                <div className={`service-3d ${s.shape}`}></div>
                <div className="num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="more">
                  <span>Learn more</span>
                  <span className="arr">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
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

      {/* Testimonials */}
      <section style={{ paddingTop: 60 }}>
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">Client Words</div>
            <h2 style={{ marginTop: 18 }}>Results that <em>speak louder</em> than promises.</h2>
          </div>
          <div className="testimonials-row">
            {[
              { q: 'DEY rebuilt our acquisition engine from the ground up. ROAS went from 1.8x to 5.2x in three months.', n: 'Aanya Mehra', r: 'Founder · Loom & Linen', a: 'A' },
              { q: 'They obsess over numbers the way we obsess over product. That\'s rare. That\'s why we stayed.', n: 'Vikram Shah', r: 'CMO · Verde Wellness', a: 'V' },
              { q: 'The first agency that actually understood our margin structure before suggesting spend.', n: 'Priya Nair', r: 'Director · Saanvi Studios', a: 'P' },
            ].map((t, i) => (
              <div key={i} className="testimonial reveal">
                <div className="quote-mark">"</div>
                <blockquote>{t.q}</blockquote>
                <div className="author">
                  <div className="avatar">{t.a}</div>
                  <div className="who">
                    <strong>{t.n}</strong>
                    <span>{t.r}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '40px 0 0' }}>
        <div className="container">
          <div className="final-cta reveal">
            <div className="deco-orb deco-orb-1"></div>
            <div className="deco-orb deco-orb-2"></div>
            <h2>Ready to scale <em>your brand?</em></h2>
            <p>Book a free 30-minute audit. Walk away with a roadmap — even if we don't work together.</p>
            <div className="btns">
              <button className="btn btn-gold" onClick={() => onNav('appointments')}>
                Book a Call <span className="arrow">→</span>
              </button>
              <button className="btn btn-ghost" onClick={() => onNav('contact')}>
                Send a Message
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- SERVICES ----------
function Services({ onNav }) {
  useReveal();
  usePageEnter();
  const services = [
    {
      num: '01 / 02',
      title: 'Meta Ads',
      desc: 'We create high-converting Facebook and Instagram campaigns that turn attention into revenue. Full-funnel architecture, daily creative testing, and creative-led iteration — built for performance, not vanity metrics.',
      bullets: ['Full-funnel campaign architecture', 'Ad creatives designed and built by us', 'Pixel & Conversions API setup', 'Daily optimisation & budget reallocation'],
    },
    {
      num: '02 / 02',
      title: 'Web Design',
      desc: 'Sharp, fast, branded websites and landing pages — built from scratch, deployed in days. Designed to look great and built to convert, whether it\'s a landing page for your ad or a full business website.',
      bullets: ['Custom design — no templates', 'Mobile-first, lightning-fast', 'Connected to your ad funnel', 'Deployed and live within days'],
    },
  ];
  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Services</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">
            Built for <em>brands that scale.</em>
          </h1>
          <p className="lede reveal in">
            Two focused practices. One performance philosophy. Ads that bring people in, websites that convert them.
          </p>
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
                <ul>
                  {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
                <button className="btn btn-primary" onClick={() => onNav('appointments')}>
                  Get Started <span className="arrow">→</span>
                </button>
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
              <button className="btn btn-gold" onClick={() => onNav('appointments')}>
                Book a Strategy Call <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- ABOUT ----------
function About({ onNav }) {
  useReveal();
  usePageEnter();
  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">About</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">
            About <em>DEY Marketing.</em>
          </h1>
          <p className="lede reveal in">
            A performance-driven ads agency obsessed with one number: profitable revenue. We build paid acquisition systems for brands that take growth seriously.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-stats reveal">
            <div className="about-stat">
              <div className="num"><em><Counter to={32} /></em></div>
              <div className="lbl">Brands scaled</div>
            </div>
            <div className="about-stat">
              <div className="num">₹<em><Counter to={10} /></em>L+</div>
              <div className="lbl">Spend managed</div>
            </div>
            <div className="about-stat">
              <div className="num"><em><Counter to={4} /></em>.8x</div>
              <div className="lbl">Average ROAS</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="section-head reveal" style={{ maxWidth: 820 }}>
            <div className="eyebrow">Our Mission</div>
            <h2 style={{ marginTop: 18 }}>
              We build your brand online — <em>ads and the website</em> to back them up.
            </h2>
            <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.6 }}>
              Most agencies run your ads and send traffic to a website that doesn't convert. We fix both. DEY was built around the idea that ads and web design have to work together — great traffic means nothing if your website loses people the moment they land. So we handle both: campaigns that bring the right people in, and websites built to turn them into customers.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="section-head reveal">
            <div className="eyebrow">What Makes Us Different</div>
            <h2 style={{ marginTop: 18 }}>What we actually do differently.</h2>
          </div>
          <div className="values-grid">
            {[
              { t: 'Ads that actually convert', d: 'We build full-funnel Meta campaigns — creatives, targeting, copy, and daily optimisation. Not just set-and-forget.', cls: 'v-1' },
              { t: 'Websites built for growth', d: 'We design and build fast, branded websites that are connected to your ad funnel from day one — not an afterthought.', cls: 'v-2' },
              { t: 'Everything under one roof', d: 'No juggling three agencies. We handle ads and web design together, so your brand stays consistent and nothing slips through the cracks.', cls: 'v-3' },
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
              <button className="btn btn-gold" onClick={() => onNav('appointments')}>
                Book a Strategy Call <span className="arrow">→</span>
              </button>
              <button className="btn btn-ghost" onClick={() => onNav('contact')}>
                Send a Brief
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- CONTACT ----------
function Contact({ onNav }) {
  useReveal();
  usePageEnter();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
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
          <h1 style={{ marginTop: 20 }} className="reveal in">
            Let's <em>scale</em> your business.
          </h1>
          <p className="lede reveal in">
            Tell us about your business, goals, and budget — we'll get back to you with the next steps to grow your brand.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20, paddingBottom: 0 }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info reveal">
              <h3>Get a custom growth plan.</h3>
              <p>Share a few details about your brand and where you'd like to be. We'll come back with the next steps.</p>
              <div className="info-item">
                <span className="lbl">Email</span>
                <span className="val">deymarketing99@gmail.com</span>
              </div>
              <div className="info-item">
                <span className="lbl">Phone</span>
                <span className="val">+91 93730 69367</span>
              </div>
              <div className="info-item">
                <span className="lbl">Location</span>
                <span className="val">Mumbai &amp; Pune</span>
              </div>
              <div className="info-item">
                <span className="lbl">Hours</span>
                <span className="val">Mon — Fri · 10:00 AM — 7:00 PM</span>
              </div>
              <div style={{ marginTop: 28, padding: '16px 18px', borderRadius: 16, background: 'rgba(184, 153, 104, 0.12)', border: '1px solid rgba(184, 153, 104, 0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', flexShrink: 0, boxShadow: '0 0 0 4px rgba(76,175,80,0.15)' }}></span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>For faster response, message us on <strong style={{ color: 'var(--ink-1)' }}>WhatsApp</strong>.</span>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-ghost" onClick={() => onNav('appointments')}>
                  Or book a strategy call <span className="arrow">→</span>
                </button>
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
                  <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}>
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="form-grid">
                    <div className="form-field full">
                      <label>Full Name</label>
                      <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Aanya Mehra" />
                    </div>
                    <div className="form-field full">
                      <label>Email Address</label>
                      <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@brand.com" />
                    </div>
                    <div className="form-field full">
                      <label>Tell us about your business, goals, and monthly ad budget</label>
                      <textarea required value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="A few sentences about your business, the growth goal you're chasing, and the monthly ad budget you're working with." style={{ minHeight: 160 }} />
                    </div>
                  </div>
                  <div className="form-submit">
                    <span className="note"><span className="pulse"></span>We respond within 24 hours</span>
                    <button type="submit" className="btn btn-gold" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Get My Growth Plan'} <span className="arrow">→</span>
                    </button>
                  </div>
                  {error && (
                    <p style={{ marginTop: 12, color: '#c0392b', fontSize: 13 }}>{error}</p>
                  )}
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

// ---------- APPOINTMENTS ----------
function Appointments({ onNav }) {
  useReveal();
  usePageEnter();

  useEffect(() => {
    if (window.Calendly) {
      window.Calendly.initInlineWidget({
        url: 'https://calendly.com/deymarketing99/30min',
        parentElement: document.getElementById('calendly-embed'),
        prefill: {},
        utm: {},
      });
    }
  }, []);

  return (
    <div className="page">
      <section className="page-header">
        <div className="container">
          <div className="eyebrow reveal in">Appointments</div>
          <h1 style={{ marginTop: 20 }} className="reveal in">
            Book a <em>Strategy Call.</em>
          </h1>
          <p className="lede reveal in">
            Pick a time that works for you — 30 minutes to understand your business and map out a growth plan.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="appt-grid">
            <div className="appt-info-card reveal">
              <span className="pill">●  Free · 30 Minutes</span>
              <h3>What to expect.</h3>
              <p>A direct conversation about your business and where you'd like to take it — nothing more, nothing less.</p>
              <div className="feature">
                <div className="ic"></div>
                <div>
                  <h4>Focused discussion</h4>
                  <p>A clear conversation about your business and growth goals.</p>
                </div>
              </div>
              <div className="feature">
                <div className="ic" style={{ borderRadius: '50%' }}></div>
                <div>
                  <h4>Strategic direction</h4>
                  <p>High-level direction tailored to your niche and stage.</p>
                </div>
              </div>
              <div className="feature">
                <div className="ic" style={{ borderRadius: '50% 14px 50% 14px' }}></div>
                <div>
                  <h4>Honest assessment</h4>
                  <p>A straight answer on whether we can help you scale.</p>
                </div>
              </div>
              <div className="feature">
                <div className="ic" style={{ borderRadius: '14px 50% 14px 50%' }}></div>
                <div>
                  <h4>Next steps</h4>
                  <p>If we're aligned, we'll outline how we move forward together.</p>
                </div>
              </div>
              <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 16, background: 'rgba(184, 153, 104, 0.12)', border: '1px solid rgba(184, 153, 104, 0.25)' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, display: 'block' }}>
                  This call is best suited for serious business owners looking to scale with paid ads.
                </span>
              </div>
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 16, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Prefer to chat first?{' '}
                  <a href="https://wa.me/919373069367" target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: 600, textDecoration: 'none' }}>
                    WhatsApp us →
                  </a>
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

// ---------- App ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood": "editorial",
  "motion": "lively",
  "form": "organic"
}/*EDITMODE-END*/;

function App() {
  const [page, setPage] = useState('home');
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const onNav = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 120);
  };

  // Apply tweak modes to body
  useEffect(() => {
    document.body.dataset.mood = t.mood;
    document.body.dataset.motion = t.motion;
    document.body.dataset.form = t.form;
  }, [t.mood, t.motion, t.form]);

  // Cursor parallax for ambient blobs
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      document.documentElement.style.setProperty('--cx', `${x}px`);
      document.documentElement.style.setProperty('--cy', `${y}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Cursor ring + laggy follow
  useEffect(() => {
    if ('ontouchstart' in window) return;
    const ring = document.createElement('div');
    ring.id = 'dey-cursor-ring';
    const lbl = document.createElement('div');
    lbl.id = 'dey-cursor-label';
    document.body.appendChild(ring);
    document.body.appendChild(lbl);

    let mx = 0, my = 0, rx = 0, ry = 0, raf;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);
    (function loop() {
      rx += (mx - rx) * 0.08; ry += (my - ry) * 0.08;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      lbl.style.left = rx + 'px'; lbl.style.top = ry + 'px';
      raf = requestAnimationFrame(loop);
    })();
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      ring.remove(); lbl.remove();
    };
  }, []);

  // Cursor hover labels (re-bound on page change)
  useEffect(() => {
    const ring = document.getElementById('dey-cursor-ring');
    const lbl = document.getElementById('dey-cursor-label');
    if (!ring || !lbl) return;
    const map = [
      ['.btn-gold,.btn-primary,.nav-cta', 'BOOK NOW'],
      ['.service-card', 'EXPLORE'],
      ['.testimonial', 'READ'],
      ['.btn-ghost', 'LEARN MORE'],
      ['.nav-link', 'GO'],
      ['.footer-brand', 'HOME'],
    ];
    const set = (on, text) => {
      ring.classList.toggle('cursor-hover', on);
      lbl.textContent = text || '';
      lbl.classList.toggle('visible', on && !!text);
    };
    const over = (e) => { for (const [sel, t] of map) { if (e.target.closest(sel)) { set(true, t); return; } } };
    const out  = (e) => { for (const [sel]    of map) { if (e.target.closest(sel)) { set(false, ''); return; } } };
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => { document.removeEventListener('mouseover', over); document.removeEventListener('mouseout', out); };
  }, [page]);

  return (
    <>
      <Nav page={page} onNav={onNav} />
      {/* Ambient floating blobs */}
      <div className="ambient-blob" style={{ top: '5%', right: '-8%', width: 380, height: 380, background: 'radial-gradient(circle, #d4b483, transparent 70%)', transform: 'translate(var(--cx,0), var(--cy,0))', transition: 'transform 0.8s ease-out' }}></div>
      <div className="ambient-blob" style={{ top: '60%', left: '-10%', width: 420, height: 420, background: 'radial-gradient(circle, #b89968, transparent 70%)', opacity: 0.35, transform: 'translate(calc(var(--cx,0) * -1), calc(var(--cy,0) * -1))', transition: 'transform 0.8s ease-out' }}></div>

      {page === 'home' && <Home onNav={onNav} />}
      {page === 'services' && <Services onNav={onNav} />}
      {page === 'about' && <About onNav={onNav} />}
      {page === 'contact' && <Contact onNav={onNav} />}
      {page === 'appointments' && <Appointments onNav={onNav} />}

      <Footer onNav={onNav} />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/919373069367"
        target="_blank"
        rel="noreferrer"
        title="Chat on WhatsApp"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#25d366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)'; }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Mood" />
        <TweakRadio
          label="Palette"
          value={t.mood}
          options={[
            { value: 'editorial', label: 'Editorial' },
            { value: 'studio', label: 'Studio' },
            { value: 'nocturne', label: 'Nocturne' },
          ]}
          onChange={(v) => setTweak('mood', v)}
        />
        <TweakSection label="Motion" />
        <TweakRadio
          label="Energy"
          value={t.motion}
          options={[
            { value: 'calm', label: 'Calm' },
            { value: 'lively', label: 'Lively' },
            { value: 'cinematic', label: 'Cinematic' },
          ]}
          onChange={(v) => setTweak('motion', v)}
        />
        <TweakSection label="Form Language" />
        <TweakRadio
          label="Shape"
          value={t.form}
          options={[
            { value: 'organic', label: 'Organic' },
            { value: 'geometric', label: 'Geometric' },
          ]}
          onChange={(v) => setTweak('form', v)}
        />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
