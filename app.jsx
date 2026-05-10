/* DEY Marketing — Monfort-style stacking scroll */
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headline": "We build your complete online presence.",
  "sub": "At DEY Marketing, we run high-performance Meta ad campaigns and build sharp, fast websites for brands ready to grow — handled end to end, so you don't have to.",
  "primaryCta": "Book a Strategy Call",
  "secondaryCta": "See Our Work",
  "accent": "#b89968",
  "smoothScroll": true,
  "showCursor": true,
  "stat1Num": "₹10L+",
  "stat1Lbl": "Ad spend managed",
  "stat2Num": "100+",
  "stat2Lbl": "Leads generated",
  "stat3Num": "4.8×",
  "stat3Lbl": "Avg ROAS"
}/*EDITMODE-END*/;

/* Unsplash images */
const HERO_IMG     = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1600&q=80';
const PARALLAX_IMG = 'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=1800&q=80';
const C1_IMG       = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80';
const C2_IMG       = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=700&q=80';
const B_IMG        = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80';

/* Work gallery images */
const W_ASCEND  = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=900&q=80'; /* football turf */
const W_LOOM    = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80';
const W_VERDE   = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80';
const W_SAANVI  = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&q=80';
const W_D2C     = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80';

/* ============== CALENDLY HELPER ============== */
function openCalendly() {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: 'https://calendly.com/deymarketing99/30min' });
  } else {
    window.open('https://calendly.com/deymarketing99/30min', '_blank');
  }
}

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

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      current = lerp(current, target, 0.065);
      if (Math.abs(target - current) < 0.1) current = target;
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

/* Scene progress 0→1 as user scrolls through the scene */
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
      setP(Math.max(0, Math.min(1, scrolled / total)));
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

/* ============== SCROLL PROGRESS BAR ============== */
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
        <img src="assets/dey-logo.png" alt="DEY" style={{ height: 30, width: 30, objectFit: 'contain', borderRadius: 8, flex: 'none' }} />
        <span>DEY <em>Marketing</em></span>
      </div>
      <div className="nav-links">
        <a href="#services">Services</a>
        <a href="#work">Work</a>
        <a href="#process">Process</a>
        <a href="#contact">Contact</a>
      </div>
      <button className="nav-cta" onClick={openCalendly}>
        <span className="dot"></span>Book a Call
      </button>
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
              <span className="eyebrow">Meta Ads · Web Design · Mumbai &amp; Pune</span>
              <h1>{renderedWords}</h1>
              <p className="hero-sub">{sub}</p>
              <div className="hero-ctas">
                <button className="btn btn-gold" onClick={openCalendly}>{primary}<span className="arr">→</span></button>
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
                  <span className="ph-label">Campaign · Meta Ads</span>
                </div>
              </div>
              <div className="hero-card c2" style={{ transform: `rotate(${-4 + p * 6}deg) translateY(${p * 60}px)` }}>
                <div className="ph" style={{ backgroundImage: `url(${C2_IMG})` }}>
                  <span className="ph-label">Web · Ascend Arena</span>
                </div>
              </div>
              <div className="hero-card c3" style={{ transform: `rotate(${3 - p * 8}deg) translate(${p * 30}px, ${p * -20}px)` }}>
                <div className="num"><em>4.8×</em></div>
                <div className="lbl">Avg ROAS</div>
                <div className="delta">▲ 32 brands scaled</div>
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
  const items = ['Meta Ads', '★', 'Web Design', '★', 'Brand Growth', '★', 'Performance Marketing', '★', 'Creative Strategy', '★', 'ROAS Focused', '★'];
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
            <p>Two focused practices. One performance philosophy. Ads that bring people in, websites that convert them — handled end to end so your brand stays consistent.</p>
          </div>
          <div className="bento">
            <div className="bento-card b-meta-ads" onMouseMove={onMove}>
              <div className="float-orb"></div>
              <div>
                <span className="num">01 / Performance</span>
                <h3>Meta &amp; Instagram <em>ads</em></h3>
                <p>Full-funnel Facebook &amp; Instagram campaigns — creatives, targeting, Pixel setup, and daily optimisation. Built for ROAS, not vanity metrics.</p>
              </div>
              <div className="more" onClick={openCalendly}><span>Get started</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-web-design" onMouseMove={onMove}>
              <div className="float-orb cube"></div>
              <div>
                <span className="num">02 / Build</span>
                <h3>Web <em>design</em></h3>
                <p>Sharp, fast, branded websites deployed in days — connected to your ad funnel from day one.</p>
              </div>
              <div className="more" onClick={openCalendly}><span>See builds</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-strategy" onMouseMove={onMove}>
              <div>
                <span className="num">03 / Creative</span>
                <h3><em>Ad</em> creatives</h3>
                <p>Creatives designed and built by us — static, motion, and UGC. Made to stop the thumb.</p>
              </div>
              <div className="more" onClick={openCalendly}><span>See examples</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-creative" onMouseMove={onMove}>
              <div>
                <span className="num">04 / Funnel</span>
                <h3>Landing <em>pages</em></h3>
                <p>High-converting landing pages that match your ad creative — built to close, not just look good.</p>
              </div>
              <div className="more" onClick={openCalendly}><span>View examples</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-stat-roas" onMouseMove={onMove}>
              <div>
                <span className="num">05 / Outcome</span>
                <h3><em>4.8×</em> avg ROAS</h3>
              </div>
              <div className="more" onClick={openCalendly}><span>See case studies</span><span className="arr">→</span></div>
            </div>
            <div className="bento-card b-image">
              <div className="ph" style={{ backgroundImage: `url(${B_IMG})` }}>
                <span className="tag">Trusted by 32+ brands</span>
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
          <h2>Ads and websites that <em>work together</em>, not against each other.</h2>
          <p>Most agencies run your ads and send traffic to a website that doesn't convert. We fix both. Great traffic means nothing if your website loses people the moment they land — so we handle both ends of the funnel.</p>
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
    { n: 'Step 01', t: 'Strategy', d: 'Audit creative, media, and funnel. ICP mapping, channel architecture, targets set.' },
    { n: 'Step 02', t: 'Launch', d: 'Creative production, tracking setup, Pixel + Conversions API, campaign build.' },
    { n: 'Step 03', t: 'Optimise', d: 'Daily review, creative testing, budget reallocation. Nothing set-and-forget.' },
    { n: 'Step 04', t: 'Scale', d: 'Compound winners, expand channels, iterate weekly. Keep what works, kill what doesn\'t.' },
  ];
  return (
    <section ref={ref} id="process" className="scene scene-process">
      <div className="scene-pin">
        <div className="process-inner" style={{ opacity, transform: `translateY(${y}px)` }}>
          <div className="scene-head">
            <div>
              <span className="eyebrow">Process · 03</span>
              <h2>Four steps to <em>predictable</em> growth.</h2>
            </div>
            <p>We embed with you from week one and keep iterating long after launch — because the work isn't done when it ships, it's done when it pays.</p>
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

/* ============== WHAT WE BUILD ============== */
function WorkScene() {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  const enter = Math.min(1, p * 1.5);
  const caps = [
    {
      num: '01',
      label: 'Meta & Google Ads',
      body: 'We don\'t just run ads. We build full-funnel campaigns — audience research, creative strategy, copy, testing, and daily optimisation. Every rupee is tracked.',
      tag: 'Performance Marketing',
    },
    {
      num: '02',
      label: 'Web Design & Landing Pages',
      body: 'Most agencies send your ad traffic to a website that doesn\'t convert. We fix both ends. We design and build fast, sharp websites that turn clicks into customers.',
      tag: 'Web Design',
    },
    {
      num: '03',
      label: 'Full-Funnel Growth',
      body: 'Ads and website working together — that\'s when growth compounds. We handle the complete online presence so you don\'t have to stitch it together yourself.',
      tag: 'End-to-End',
    },
  ];
  return (
    <section ref={ref} id="work" className="scene scene-tall scene-work">
      <div className="scene-pin">
        <div className="work-head" style={{ opacity: enter }}>
          <div>
            <span className="eyebrow">What We Do · 04</span>
            <h2>We build the <em>whole thing</em>.</h2>
          </div>
          <p style={{ maxWidth: 380, fontSize: 15, color: 'var(--ink-3)' }}>Not just ads. Not just websites. Both — done right.</p>
        </div>
        <div className="work-track-wrap">
          <div className="work-track" style={{ transform: 'translateX(0)' }}>
            { /* Real client work */ }
            <div className="work-card">
              <div className="ph" style={{ backgroundImage: `url(${W_ASCEND})` }}></div>
              <div className="meta">
                <span className="kind">Web Design · Sports</span>
                <div className="name">Ascend Arena</div>
                <div className="row"><span>Pune · 2025</span><span style={{ color: 'var(--gold-light)' }}>FIFA-approved turf</span></div>
              </div>
            </div>
            { /* Capability cards */ }
            {caps.map((c, i) => (
              <div className="work-card cap-card" key={i}>
                <div className="cap-num">{c.num}</div>
                <div className="meta" style={{ padding: '32px 28px' }}>
                  <span className="kind">{c.tag}</span>
                  <div className="name" style={{ marginBottom: 14 }}>{c.label}</div>
                  <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.75 }}>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== VIDEO SCENE ============== */
function VideoScene() {
  const ref = useRef(null);
  const vidRef = useRef(null);
  const p = useSceneProgress(ref);
  const enter = Math.min(1, p * 2);
  const bgScale = 1 + p * 0.08;

  /* sync video playback position to scroll progress */
  useEffect(() => {
    const vid = vidRef.current;
    if (!vid || !vid.duration) return;
    vid.currentTime = p * vid.duration;
  }, [p]);

  return (
    <section ref={ref} className="scene scene-tall scene-video">
      <div className="scene-pin">
        <video ref={vidRef} className="vid-bg" src="assets/ascend-tunnel.mp4" muted playsInline preload="auto" style={{ transform: `scale(${bgScale})` }} />
        <div className="vid-overlay"></div>
        <div className="vid-inner" style={{ opacity: enter, transform: `translateY(${(1-enter)*50}px)` }}>
          <span className="eyebrow">The Work · 05</span>
          <h2>Every brand has a <em>story worth telling.</em></h2>
          <p>We make sure the right people see it.</p>
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
    { q: 'DEY took our FIFA-approved turf concept and turned it into a real brand online. The website, the ads — everything looked premium from day one. Bookings came in before we even officially launched.', who: 'Ishan', role: 'Co-founder · Ascend Arena', initials: 'I' },
    { q: 'We needed something that matched the quality of our facility. DEY delivered exactly that — a website that looks world-class and campaigns that actually fill our slots. Best decision we made for the business.', who: 'Siddhant', role: 'Co-founder · Ascend Arena', initials: 'S' },
  ];
  return (
    <section ref={ref} className="scene scene-tests">
      <div className="scene-pin">
        <div className="tests-inner" style={{ opacity: enter }}>
          <div className="scene-head">
            <div>
              <span className="eyebrow">Client Words · 05</span>
              <h2>Results that <em>speak</em>.</h2>
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
          <span className="eyebrow">Let's <em>grow</em> · 06</span>
          <h2>Ready to scale <em>your brand?</em></h2>
          <p>Book a free 30-minute strategy call. Walk away with a roadmap — even if we don't work together.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={openCalendly}>Book a Strategy Call<span className="arr">→</span></button>
            <a className="btn btn-ghost" style={{ color: 'var(--cream)', borderColor: 'rgba(245,239,228,0.4)' }} href="mailto:deymarketing99@gmail.com">deymarketing99@gmail.com<span className="arr">→</span></a>
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
              <img src="assets/dey-logo.png" alt="DEY" style={{ height: 32, width: 32, objectFit: 'contain', borderRadius: 8 }} />
              <span>DEY <em>Marketing</em></span>
            </div>
            <p>Ads that bring people in. Websites that convert them. We build the full online presence for brands ready to grow.</p>
          </div>
          <div className="foot-col">
            <h5>Navigate</h5>
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="foot-col">
            <h5>Services</h5>
            <a href="#services">Meta Ads</a>
            <a href="#services">Web Design</a>
            <a href="#services">Ad Creatives</a>
            <a href="#services">Landing Pages</a>
          </div>
          <div className="foot-col">
            <h5>Connect</h5>
            <a href="https://instagram.com/deymarketing" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="mailto:deymarketing99@gmail.com">deymarketing99@gmail.com</a>
            <a href="tel:+919373069367">+91 93730 69367</a>
            <a>Mumbai &amp; Pune</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 DEY MARKETING — ALL RIGHTS RESERVED</span>
          <span>STRATEGY · CREATIVE · GROWTH</span>
        </div>
      </div>
    </footer>
  );
}

/* ============== PEARL CURSOR ============== */
function Cursor({ enabled }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mx=0, my=0, rx=0, ry=0, rafId;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.classList.add('visible');
      ring.classList.add('visible');
    };
    const onOver = (e) => {
      if (e.target.closest('a,button,.bento-card,.work-card,.test,.proc-step,.nav-cta'))
        ring.classList.add('pull');
      else ring.classList.remove('pull');
    };
    const onLeave = () => { dot.classList.remove('visible'); ring.classList.remove('visible'); };
    const tick = () => {
      rx += (mx - rx) * 0.10; ry += (my - ry) * 0.10;
      dot.style.transform  = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      rafId = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);
  if (!enabled) return null;
  return (<><div ref={dotRef} className="cursor-dot"></div><div ref={ringRef} className="cursor-ring"></div></>);
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
      <VideoScene />
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
