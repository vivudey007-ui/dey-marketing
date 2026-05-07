/* DEY Marketing — Monfort-style stacking scroll */
const { useState, useEffect, useRef, useLayoutEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headline": "We build your complete online presence.",
  "sub": "Performance ads, magnetic web design, and full-stack creative — DEY Marketing turns clicks into customers for ambitious brands across India.",
  "primaryCta": "Start a project",
  "secondaryCta": "View our work",
  "accent": "#b89968",
  "smoothScroll": true,
  "showCursor": true,
  "stat1Num": "12×",
  "stat1Lbl": "Avg. ROAS lift",
  "stat2Num": "₹40Cr+",
  "stat2Lbl": "Ad spend managed",
  "stat3Num": "180+",
  "stat3Lbl": "Brands grown"
}/*EDITMODE-END*/;

const HERO_IMG = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1600&q=80';
const PARALLAX_IMG = 'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=1800&q=80';
const C1_IMG = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80';
const C2_IMG = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=700&q=80';
const B_IMG  = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80';
const W1 = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&q=80';
const W2 = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80';
const W3 = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80';
const W4 = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80';
const W5 = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80';

/* ============== LENIS-STYLE SMOOTH SCROLL ============== */
function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.scrollBehavior = '';
      return;
    }
    let target = window.scrollY;
    let current = window.scrollY;
    let rafId = null;
    let isScrolling = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      current = lerp(current, target, 0.09);
      if (Math.abs(target - current) < 0.1) {
        current = target;
        isScrolling = false;
      } else {
        isScrolling = true;
      }
      window.scrollTo(0, current);
      window.dispatchEvent(new CustomEvent('smoothscroll'));
      rafId = requestAnimationFrame(tick);
    };

    const onWheel = (e) => {
      e.preventDefault();
      target += e.deltaY;
      target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
    };

    const onKey = (e) => {
      const keys = {
        ArrowDown: 80, ArrowUp: -80,
        PageDown: window.innerHeight * 0.85,
        PageUp: -window.innerHeight * 0.85,
        Home: -document.documentElement.scrollHeight,
        End: document.documentElement.scrollHeight,
        Space: window.innerHeight * 0.85,
      };
      if (keys[e.key] !== undefined) {
        e.preventDefault();
        target += keys[e.key];
        target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
      }
    };

    let touchY = 0;
    const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      target += dy * 1.4;
      target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [enabled]);
}

/* Hook: scene progress 0→1 */
function useSceneProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const calc = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = el.offsetHeight - vh;
      const scrolled = -rect.top;
      const prog = Math.max(0, Math.min(1, scrolled / total));
      setP(prog);
    };
    calc();
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('smoothscroll', calc);
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('scroll', calc);
      window.removeEventListener('smoothscroll', calc);
      window.removeEventListener('resize', calc);
    };
  }, []);
  return p;
}

/* ============== SCROLL PROGRESS ============== */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (ref.current) ref.current.style.width = p + '%';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('smoothscroll', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('smoothscroll', onScroll); };
  }, []);
  return (
    <div className="scroll-progress">
      <div className="scroll-progress-bar" ref={ref}></div>
    </div>
  );
}

/* ============== NAV ============== */
function Nav() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 100 && y > lastY + 4) setHidden(true);
      else if (y < lastY - 4 || y < 100) setHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('smoothscroll', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('smoothscroll', onScroll); };
  }, []);

  return (
    <nav className={"nav " + (hidden ? 'hidden' : '')}>
      <div className="nav-logo">
        <span className="orb"></span>
        <span>DEY <em>Marketing</em></span>
      </div>
      <div className="nav-links">
        <a href="#services">Services</a>
        <a href="#work">Work</a>
        <a href="#process">Process</a>
        <a href="#contact">Contact</a>
      </div>
      <a className="nav-cta" href="#contact">
        <span className="dot"></span>Available for Q1
      </a>
    </nav>
  );
}

/* ============== HERO ============== */
function Hero() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const heroOpacity = 1 - p * 1.4;
  const heroScale = 1 - p * 0.08;
  const heroY = -p * 80;
  const bgY = p * 200;

  const headline = (window.tweaks?.headline) || TWEAK_DEFAULTS.headline;
  const sub = (window.tweaks?.sub) || TWEAK_DEFAULTS.sub;
  const primary = (window.tweaks?.primaryCta) || TWEAK_DEFAULTS.primaryCta;
  const secondary = (window.tweaks?.secondaryCta) || TWEAK_DEFAULTS.secondaryCta;

  const words = headline.split(/(\s+)/);
  const wordCount = headline.split(/\s+/).length;
  let realIdx = 0;
  const renderedWords = words.map((w, i) => {
    if (/^\s+$/.test(w)) return w;
    const isItalic = realIdx === Math.floor(wordCount / 2) || /complete|magnetic|deeper/i.test(w);
    const delay = realIdx * 0.08;
    realIdx++;
    return (
      <span key={i} className={"word " + (isItalic ? 'it' : '')}>
        <span style={{ animationDelay: delay + 's' }}>{w}</span>
      </span>
    );
  });

  return (
    <section ref={ref} className="scene scene-tall hero">
      <div className="scene-pin" style={{ opacity: heroOpacity, transform: `translateY(${heroY}px) scale(${heroScale})` }}>
        <div className="hero-bg">
          <div className="hero-bg-img" style={{ '--hero-img': `url(${HERO_IMG})`, transform: `translateY(${bgY}px) scale(${1 + p * 0.1})` }}></div>
          <div className="hero-orb a" style={{ transform: `translate(${p * -60}px, ${p * 40}px)` }}></div>
          <div className="hero-orb b" style={{ transform: `translate(${p * 80}px, ${p * -60}px)` }}></div>
        </div>
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Performance × Brand · Bengaluru</span>
              <h1>{renderedWords}</h1>
              <p className="hero-sub">{sub}</p>
              <div className="hero-ctas">
                <a className="btn btn-gold" href="#contact">{primary}<span className="arr">→</span></a>
                <a className="btn btn-ghost" href="#work">{secondary}<span className="arr">→</span></a>
              </div>
              <div className="hero-meta">
                <div>
                  <div className="num"><em>{TWEAK_DEFAULTS.stat1Num}</em></div>
                  <span className="lbl">{TWEAK_DEFAULTS.stat1Lbl}</span>
                </div>
                <div>
                  <div className="num">{TWEAK_DEFAULTS.stat2Num}</div>
                  <span className="lbl">{TWEAK_DEFAULTS.stat2Lbl}</span>
                </div>
                <div>
                  <div className="num"><em>{TWEAK_DEFAULTS.stat3Num}</em></div>
                  <span className="lbl">{TWEAK_DEFAULTS.stat3Lbl}</span>
                </div>
              </div>
            </div>

            <div className="hero-stage">
              <div className="hero-card c1" style={{ transform: `rotate(${2 - p * 4}deg) translateY(${p * -40}px)` }}>
                <div className="ph" style={{ backgroundImage: `url(${C1_IMG})` }}>
                  <span className="ph-label">Campaign · Spring '25</span>
                </div>
              </div>
              <div className="hero-card c2" style={{ transform: `rotate(${-4 + p * 6}deg) translateY(${p * 60}px)` }}>
                <div className="ph" style={{ backgroundImage: `url(${C2_IMG})` }}>
                  <span className="ph-label">Web · Saanvi Studio</span>
                </div>
              </div>
              <div className="hero-card c3" style={{ transform: `rotate(${3 - p * 8}deg) translate(${p * 30}px, ${p * -20}px)` }}>
                <div className="num"><em>12.4×</em></div>
                <div className="lbl">Q4 ROAS</div>
                <div className="delta">▲ 184% YoY</div>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-hint" style={{ opacity: 1 - p * 2 }}>
          <span>Scroll to descend</span>
          <div className="line"></div>
        </div>
      </div>
    </section>
  );
}

/* ============== MARQUEE ============== */
function Marquee() {
  const items = ['Performance Ads', '★', 'Web Design', '★', 'SEO', '★', 'Branding', '★', 'Content', '★', 'Email & CRM', '★'];
  const all = [...items, ...items, ...items];
  return (
    <div className="marquee-band">
      <div className="marquee-track">
        {all.map((x, i) => (
          <span key={i} className={x === '★' ? 'star' : ''}>{x}</span>
        ))}
      </div>
    </div>
  );
}

/* ============== SERVICES (BENTO) ============== */
function ServicesScene() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const enter = Math.min(1, p * 2);
  const exit = Math.max(0, (p - 0.6) * 2.5);
  const opacity = enter - exit;
  const scale = 0.9 + enter * 0.1 - exit * 0.05;
  const y = (1 - enter) * 100;

  const onMove = (e) => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  };

  return (
    <section ref={ref} id="services" className="scene scene-services">
      <div className="scene-pin">
        <div className="services-inner" style={{ opacity, transform: `translateY(${y}px) scale(${scale})` }}>
          <div className="scene-head">
            <div>
              <span className="eyebrow">Services · 01</span>
              <h2>What we <em>do</em>.</h2>
            </div>
            <p>Six disciplines, one pursuit: turn paid attention into compounding revenue. We run media, build sites, ship creative, and keep the whole machine learning every week.</p>
          </div>
          <div className="bento">
            <div className="bento-card b-meta-ads" onMouseMove={onMove}>
              <div className="float-orb"></div>
              <div>
                <span className="num">01 / Performance</span>
                <h3>Meta &amp; Google <em>ads</em></h3>
                <p>Full-funnel paid media — research, creative, build, launch, scale. Reporting you can actually read.</p>
              </div>
              <div className="more"><span>Capabilities &amp; case studies</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-web-design" onMouseMove={onMove}>
              <div className="float-orb cube"></div>
              <div>
                <span className="num">02 / Build</span>
                <h3>Web <em>design</em></h3>
              </div>
              <div className="more"><span>See builds</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-strategy" onMouseMove={onMove}>
              <div>
                <span className="num">03 / Strategy</span>
                <h3><em>Brand</em> strategy</h3>
                <p>Positioning, messaging, the through-line that makes every ad work harder.</p>
              </div>
              <div className="more"><span>Approach</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-creative" onMouseMove={onMove}>
              <div>
                <span className="num">04 / Creative</span>
                <h3>Content &amp; <em>creative</em></h3>
                <p>Static, motion, UGC. Made to be scrolled past — designed to stop the thumb anyway.</p>
              </div>
              <div className="more"><span>Reels &amp; ads</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-stat-roas" onMouseMove={onMove}>
              <div>
                <span className="num">05 / Outcome</span>
                <h3><em>4.8×</em> avg ROAS</h3>
              </div>
              <div className="more"><span>Last 90 days</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-image">
              <div className="ph" style={{ backgroundImage: `url(${B_IMG})` }}>
                <span className="tag">Recent · Aether D2C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== PARALLAX ============== */
function ParallaxScene() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const bgY = (p - 0.5) * 200;
  const bgScale = 1 + p * 0.15;
  const opacity = Math.min(1, p * 2);
  return (
    <section ref={ref} className="scene scene-parallax">
      <div className="scene-pin">
        <div className="parallax-bg" style={{ '--parallax-img': `url(${PARALLAX_IMG})`, transform: `translateY(${bgY}px) scale(${bgScale})` }}></div>
        <div className="parallax-inner" style={{ opacity }}>
          <span className="eyebrow">Manifesto · 02</span>
          <h2>Marketing that <em>compounds</em>, not campaigns that <em>conclude</em>.</h2>
          <p>The brands we work with are building decade-long businesses. So we don't ship one-shot launches — we build engines: creative systems, paid media flywheels, websites that improve every month they're live.</p>
        </div>
      </div>
    </section>
  );
}

/* ============== PROCESS ============== */
function ProcessScene() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const enter = Math.min(1, p * 2);
  const exit = Math.max(0, (p - 0.6) * 2.5);
  const opacity = enter - exit;
  const y = (1 - enter) * 60;
  const steps = [
    { n: 'Step 01', t: 'Discover', d: 'Audit creative, media, funnel. Find the leaks. Set the targets.' },
    { n: 'Step 02', t: 'Design', d: 'Brand system, site architecture, creative testing matrix.' },
    { n: 'Step 03', t: 'Deploy', d: 'Launch campaigns, ship the site, instrument every step.' },
    { n: 'Step 04', t: 'Compound', d: "Weekly iteration sprints. Scale what works. Kill what doesn't." },
  ];
  return (
    <section ref={ref} id="process" className="scene scene-process">
      <div className="scene-pin">
        <div className="process-inner" style={{ opacity, transform: `translateY(${y}px)` }}>
          <div className="scene-head">
            <div>
              <span className="eyebrow">Process · 03</span>
              <h2>How we <em>work</em>.</h2>
            </div>
            <p>Four phases that compound. We embed with you in week one and keep iterating long after launch — because the work isn't done when it ships, it's done when it pays.</p>
          </div>
          <div className="process">
            {steps.map((s, i) => (
              <div className="proc-step" key={i}>
                <span className="dot"></span>
                <div className="num">{s.n}</div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== WORK (horizontal track) ============== */
function WorkScene() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const works = [
    { img: W1, kind: 'Performance · Beauty', name: 'Saanvi Studio', loc: 'Mumbai · 2024', metric: '7.4× ROAS' },
    { img: W2, kind: 'Web · Hospitality', name: 'Auro Resorts', loc: 'Goa · 2024', metric: '+312% bookings' },
    { img: W3, kind: 'Branding · F&B', name: 'Loom Coffee', loc: 'Bengaluru · 2025', metric: 'Full identity' },
    { img: W4, kind: 'Performance · D2C', name: 'Aether Wellness', loc: 'Delhi · 2024', metric: '12.1× ROAS' },
    { img: W5, kind: 'Web · Fashion', name: 'House of Verma', loc: 'Jaipur · 2025', metric: 'Shopify Plus' },
  ];
  const enter = Math.min(1, p * 1.5);
  const trackX = -(p) * 1600;
  return (
    <section ref={ref} id="work" className="scene scene-tall scene-work">
      <div className="scene-pin">
        <div className="work-head" style={{ opacity: enter }}>
          <div>
            <span className="eyebrow">Selected Work · 04</span>
            <h2>Recent <em>builds</em>.</h2>
          </div>
          <p style={{ maxWidth: 380, fontSize: 15, color: 'var(--ink-3)' }}>A slice of the last twelve months. Scroll →</p>
        </div>
        <div className="work-track-wrap">
          <div className="work-track" style={{ transform: `translateX(${trackX}px)` }}>
            {works.map((w, i) => (
              <div className="work-card" key={i}>
                <div className="ph" style={{ backgroundImage: `url(${w.img})` }}></div>
                <div className="meta">
                  <span className="kind">{w.kind}</span>
                  <div className="name">{w.name}</div>
                  <div className="row"><span>{w.loc}</span><span style={{ color: 'var(--gold-light)' }}>{w.metric}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== TESTIMONIALS ============== */
function TestsScene() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const enter = Math.min(1, p * 2);
  const tests = [
    { q: 'They rebuilt our funnel and our brand voice in the same quarter. Revenue followed.', who: 'Aanya M.', role: 'Founder · Saanvi Studio', initials: 'AM' },
    { q: 'The website conversion rate doubled the month after launch. Six months in, still climbing.', who: 'Rohan K.', role: 'CEO · Auro Resorts', initials: 'RK' },
    { q: "Every week we get a real report — not a slide deck. They're obsessed with what actually moved.", who: 'Priya S.', role: 'CMO · Aether Wellness', initials: 'PS' },
  ];
  return (
    <section ref={ref} className="scene scene-tests">
      <div className="scene-pin">
        <div className="tests-inner" style={{ opacity: enter }}>
          <div className="scene-head">
            <div>
              <span className="eyebrow">Voices · 05</span>
              <h2>What founders <em>say</em>.</h2>
            </div>
            <p>The work speaks loudest through the people we ship it for.</p>
          </div>
          <div className="tests">
            {tests.map((t, i) => (
              <div className="test" key={i}>
                <div className="qm">"</div>
                <blockquote>{t.q}</blockquote>
                <div className="who">
                  <div className="avatar">{t.initials}</div>
                  <div>
                    <strong>{t.who}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== FINAL CTA ============== */
function CtaScene() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const enter = Math.min(1, p * 2);
  return (
    <section ref={ref} id="contact" className="scene scene-cta">
      <div className="scene-pin">
        <div className="cta-inner" style={{ opacity: enter, transform: `translateY(${(1-enter) * 60}px)` }}>
          <span className="eyebrow">Let's <em>build</em> · 06</span>
          <h2>Your next <em>chapter</em> starts with one conversation.</h2>
          <p>Tell us what you're working on. We'll come back within 48 hours with a candid read and — if it's a fit — a path forward.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-gold" href="mailto:hello@deymarketing.in">hello@deymarketing.in<span className="arr">→</span></a>
            <a className="btn btn-ghost" style={{ color: 'var(--cream)', borderColor: 'rgba(245,239,228,0.4)' }} href="#">Book a 30-min intro<span className="arr">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== FOOTER ============== */
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="mark">
              <span className="orb"></span>
              <span>DEY <em>Marketing</em></span>
            </div>
            <p>A boutique performance &amp; brand studio working with ambitious founders across India and the GCC.</p>
          </div>
          <div className="foot-col">
            <h5>Studio</h5>
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="foot-col">
            <h5>Connect</h5>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
            <a href="#">Behance</a>
          </div>
          <div className="foot-col">
            <h5>Office</h5>
            <a>Indiranagar, Bengaluru</a>
            <a>hello@deymarketing.in</a>
            <a>+91 80 4000 0000</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2025 DEY MARKETING</span>
          <span>BUILT WITH CARE · BENGALURU</span>
        </div>
      </div>
    </footer>
  );
}

/* ============== CUSTOM CURSOR ============== */
function Cursor({ enabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    let visible = false;
    const onMove = (e) => {
      if (!visible) { el.classList.add('visible'); visible = true; }
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    };
    const onOver = (e) => {
      if (e.target.closest('a,button,.bento-card,.work-card,.test')) el.classList.add('hover');
      else el.classList.remove('hover');
    };
    const onLeave = () => { el.classList.remove('visible'); visible = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);
  if (!enabled) return null;
  return <div ref={ref} className="cursor"></div>;
}

/* ============== APP ============== */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => {
    window.tweaks = t;
    document.documentElement.style.setProperty('--gold', t.accent);
  }, [t]);

  useSmoothScroll(t.smoothScroll !== false);

  return (
    <>
      <div className="grain"></div>
      <ScrollProgress />
      <Nav />
      <Hero />
      <Marquee />
      <ServicesScene />
      <ParallaxScene />
      <ProcessScene />
      <WorkScene />
      <TestsScene />
      <CtaScene />
      <Footer />
      <Cursor enabled={t.showCursor !== false} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero copy">
          <TweakText label="Headline" value={t.headline} onChange={v => setTweak('headline', v)} />
          <TweakText label="Subheadline" value={t.sub} onChange={v => setTweak('sub', v)} />
          <TweakText label="Primary CTA" value={t.primaryCta} onChange={v => setTweak('primaryCta', v)} />
          <TweakText label="Secondary CTA" value={t.secondaryCta} onChange={v => setTweak('secondaryCta', v)} />
        </TweakSection>
        <TweakSection label="Motion">
          <TweakToggle label="Smooth scroll" value={t.smoothScroll} onChange={v => setTweak('smoothScroll', v)} />
          <TweakToggle label="Custom cursor" value={t.showCursor} onChange={v => setTweak('showCursor', v)} />
        </TweakSection>
        <TweakSection label="Brand">
          <TweakColor label="Accent" value={t.accent} onChange={v => setTweak('accent', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
