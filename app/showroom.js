'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Sequence from './sequence';

gsap.registerPlugin(ScrollTrigger);
const cars = [
  { number: '01', name: 'Pure adrenaline.', type: 'THE SUPERCAR', scene: 1, detail: 'Low-slung. Sharply sculpted. Impossible to ignore.', description: 'An uncompromising silhouette, a dramatic stance, and a presence that turns every arrival into an occasion.', tags: ['Sculpted silhouette', 'Driver-focused character', 'Statement presence'] },
  { number: '02', name: 'Room for more.', type: 'THE GRAND TOURER', scene: 2, detail: 'A bigger perspective. An unmistakable presence.', description: 'Confident proportions meet an adventurous spirit. For the everyday escape, the long way home, and everything in between.', tags: ['Elevated perspective', 'Versatile character', 'Bold proportions'] },
  { number: '03', name: 'Quietly commanding.', type: 'THE LUXURY SEDAN', scene: 3, detail: 'Understated elegance. Unforgettable arrival.', description: 'Composed lines and a beautifully considered profile. A different expression of performance: the art of arriving with ease.', tags: ['Refined silhouette', 'Composed character', 'Distinctive detailing'] },
];
const subscribeReduced = callback => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const reducedSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Arrow({ diagonal = false }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>;
}
function Mark() {
  return <svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="m3 9 15 19L33 9M10 9l8 10 8-10" stroke="currentColor" strokeWidth="2" /></svg>;
}

export default function Showroom() {
  const root = useRef(null);
  const dialog = useRef(null);
  const lenis = useRef(null);
  const triggerButton = useRef(null);
  const progressBar = useRef(null);
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, () => false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const motion = motionEnabled && !reduced;
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [chapter, setChapter] = useState(1);
  const [modalMode, setModalMode] = useState('visit');
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState('All vehicles');

  useEffect(() => {
    if (!motion) return;
    const smooth = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, anchors: true });
    lenis.current = smooth;
    smooth.on('scroll', ScrollTrigger.update);
    const tick = time => smooth.raf(time * 1000);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); smooth.destroy(); lenis.current = null; };
  }, [motion]);

  useEffect(() => {
    const context = gsap.context(() => {
      if (!motion) return;
      gsap.fromTo('.hero-title span', { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: 'power3.out' });
      gsap.utils.toArray('[data-reveal]').forEach(element => {
        gsap.fromTo(element, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
      });
    }, root);
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { cancelAnimationFrame(refresh); context.revert(); };
  }, [motion]);

  const updateProgress = useCallback((scene, progress) => {
    setChapter(previous => previous === scene ? previous : scene);
    if (progressBar.current) progressBar.current.style.transform = `scaleX(${progress})`;
  }, []);

  function navigate(event, target) {
    setMenuOpen(false);
    if (lenis.current) { event.preventDefault(); lenis.current.scrollTo(target, { duration: 1.5 }); }
  }
  function openModal(index, mode, event) {
    triggerButton.current = event.currentTarget;
    setSelected(index); setModalMode(mode); setSaved(false);
    lenis.current?.stop();
    dialog.current.showModal();
  }
  function closeModal() { dialog.current.close(); }
  function onClose() { lenis.current?.start(); triggerButton.current?.focus(); }
  function saveBrief(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const content = `CAR VILLA — YOUR VISIT BRIEF\n\nName: ${data.get('name') || 'Guest'}\nCollection: ${cars[selected].type}\nPreferred visit: ${data.get('date') || 'To be arranged'}\nNotes: ${data.get('notes') || 'None'}\n\nThis is a personal planning brief, not a confirmed appointment.\nCar Villa is a concept showroom. No enquiry has been sent.\n`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'car-villa-visit-brief.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setSaved(true);
  }

  return <div ref={root} className="showroom">
    <a className="skip-link" href="#collection">Skip to the collection</a>
    <header className="site-header">
      <a href="#home" className="brand" aria-label="Car Villa home" onClick={event => navigate(event, '#home')}><Mark /><span>CAR VILLA<small>THE ART OF THE DRIVE</small></span></a>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
        <a href="#experience" onClick={event => navigate(event, '#experience')}>The experience</a>
        <a href="#collection" onClick={event => navigate(event, '#collection')}>The collection</a>
        <a href="#philosophy" onClick={event => navigate(event, '#philosophy')}>Our philosophy</a>
      </nav>
      <button className="header-cta" onClick={event => openModal(0, 'visit', event)}>Plan your visit <Arrow diagonal /></button>
      <button className="menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'} <span>{menuOpen ? '−' : '+'}</span></button>
    </header>

    <main>
      <Sequence motion={motion} onProgress={updateProgress}>
        <div className="hero-topline"><span><i /> A WORLD OF EXTRAORDINARY MACHINES</span><span>EST. FOR THE ENTHUSIAST</span></div>
        <div className="hero-copy"><p className="eyebrow">CURATED CARS. UNCOMMON CHARACTER.</p><h1 className="hero-title"><span>BEYOND THE</span><span className="outline-word">ORDINARY.</span></h1></div>
        <div className="hero-bottom">
          <div><p>Some things are better experienced.</p><p>Step inside. Find what moves you.</p><a className="text-link" href="#chapter-2" onClick={event => navigate(event, '#chapter-2')}>Enter the showroom <Arrow diagonal /></a></div>
          <a href="#chapter-2" className="scroll-cue" aria-label="Scroll to explore the showroom" onClick={event => navigate(event, '#chapter-2')}><span className="scroll-line" /> SCROLL TO DISCOVER</a>
          <div className="hero-index"><span>01 — 03</span><small>THREE EXPRESSIONS.<br />ONE OBSESSION.</small></div>
        </div>
        <span className="hero-side-note">THE CAR VILLA COLLECTION — VOL. 01</span>
        <div className="hero-chapter" aria-live="polite"><p className="eyebrow">{cars[chapter - 1].number} / {cars[chapter - 1].type}</p><h2 key={chapter}>{cars[chapter - 1].name}</h2><button className="text-link" onClick={event => openModal(chapter - 1, 'car', event)}>Discover the character <Arrow diagonal /></button></div>
        <div className="cinema-controls"><span className="cinema-now">{String(chapter).padStart(2, '0')} <span>/ 03</span></span><div className="cinema-track"><span ref={progressBar} /></div><nav aria-label="Showroom chapters">{cars.map(car => <a key={car.scene} href={`#chapter-${car.scene}`} aria-label={`Chapter ${car.number}: ${car.type}`} aria-current={chapter === car.scene ? 'step' : undefined} onClick={event => navigate(event, `#chapter-${car.scene}`)}>{car.number}</a>)}</nav><button aria-pressed={!motion} onClick={() => setMotionEnabled(value => !value)} disabled={reduced}><span className={motion ? 'motion-dot active' : 'motion-dot'} /> MOTION {motion ? 'ON' : 'OFF'}</button></div>
      </Sequence>

      <section className="intro section-pad" id="experience">
        <div className="section-label"><span>01 / THE EXPERIENCE</span><span>DESIGNED TO MOVE YOU ↘</span></div>
        <div className="intro-grid"><h2 data-reveal>A car is a machine.<br />Until it becomes<br /><em>a feeling.</em></h2><div className="intro-aside" data-reveal><span className="tiny-cross">✳</span><p>The first glance. The perfect line.<br />The moment you know.</p><p>Welcome to Car Villa. A considered collection of automotive character, brought together for one reason: the love of the drive.</p><a className="text-link dark" href="#chapter-1" onClick={event => navigate(event, '#chapter-1')}>Take a closer look <Arrow diagonal /></a></div></div>
        <div className="intro-foot"><span>YOUR SCROLL. YOUR PACE.</span><span>THREE CHAPTERS TO EXPLORE</span></div>
      </section>

      <section className="collection section-pad" id="collection">
        <div className="section-label"><span>02 / THE COLLECTION</span><span>DIFFERENT BY DESIGN</span></div>
        <div className="collection-heading"><h2 data-reveal>Find your<br /><em>kind of extraordinary.</em></h2><p data-reveal>Three distinct personalities.<br />One place to discover yours.</p></div>
        <div className="collection-filters" role="group" aria-label="Filter vehicle collection">{['All vehicles', 'Performance', 'Grand touring', 'Luxury'].map(label => <button key={label} aria-pressed={filter === label} onClick={() => { setFilter(label); requestAnimationFrame(() => ScrollTrigger.refresh()); }}>{label}{label === 'All vehicles' && <sup>03</sup>}</button>)}</div>
        <div className="car-grid">{cars.filter((car, index) => filter === 'All vehicles' || ['Performance', 'Grand touring', 'Luxury'][index] === filter).map(car => <button className="car-card" key={car.scene} onClick={event => openModal(car.scene - 1, 'car', event)}><div className="card-image" style={{ backgroundImage: `url(/media/poster-${car.scene}.webp)` }}><span className="card-tag">{car.type}</span><span className="card-plus">↗</span></div><div className="card-bottom"><h3>{car.name}</h3><span>{car.number}</span></div><p>{car.detail}</p></button>)}</div>
        <p className="collection-note">An editorial collection. Vehicle imagery is illustrative; availability and specifications are not advertised.</p>
      </section>

      <section id="philosophy" className="philosophy section-pad">
        <div className="section-label"><span>03 / THE CAR VILLA PHILOSOPHY</span><span>PASSION, IN EVERY DETAIL</span></div>
        <div className="philosophy-grid"><div className="philosophy-art" data-reveal><div className="art-crop" /><span>LOOK CLOSER.<br />FEEL MORE.</span><small>CV / DETAIL STUDY 001</small></div><div className="philosophy-copy" data-reveal><p className="eyebrow">MORE THAN WHAT YOU DRIVE.</p><h2>It’s what<br />drives <em>you.</em></h2><p>We believe a great car does more than take you somewhere. It makes the journey matter.</p><p>Car Villa is an invitation to slow down, notice the details, and discover the character behind the silhouette. From the unmistakably bold to the beautifully restrained.</p><div className="principle"><span>01</span><p>Character over convention.</p></div><div className="principle"><span>02</span><p>Every detail has a purpose.</p></div><div className="principle"><span>03</span><p>The experience comes first.</p></div></div></div>
      </section>

      <section className="visit" id="visit"><div className="visit-background" /><div className="visit-copy" data-reveal><p className="eyebrow">THE NEXT CHAPTER IS YOURS.</p><h2>Don’t just<br />imagine <em>it.</em></h2><p>Find the car that feels like you.</p><button className="pill-button" onClick={event => openModal(0, 'visit', event)}>Plan your showroom visit <Arrow diagonal /></button></div><div className="visit-caption"><span>CAR VILLA</span><span>A DIFFERENT WAY TO DISCOVER.</span></div></section>
    </main>

    <footer className="site-footer"><div className="footer-top"><a href="#home" className="brand" onClick={event => navigate(event, '#home')}><Mark /><span>CAR VILLA<small>THE ART OF THE DRIVE</small></span></a><p>For the love of the drive.</p><a href="#home" className="back-top" onClick={event => navigate(event, '#home')}>Back to top ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} CAR VILLA</span><span>CONCEPT SHOWROOM · INDEPENDENT AUTOMOTIVE PRESENTATION</span><button aria-pressed={!motion} disabled={reduced} onClick={() => setMotionEnabled(value => !value)}>MOTION {motion ? 'ON' : 'OFF'}</button></div></footer>

    <dialog ref={dialog} className="detail-dialog" aria-label={modalMode === 'car' ? cars[selected].name : 'Plan your showroom visit'} onClose={onClose} onClick={event => { if (event.target === dialog.current) closeModal(); }}>
      <div className="dialog-inner" data-lenis-prevent><button className="dialog-close" aria-label="Close details" onClick={closeModal}>✕</button><div className="dialog-image" style={{ backgroundImage: `url(/media/poster-${selected + 1}.webp)` }} /><div className="dialog-content">
        <p className="eyebrow">CAR VILLA / {modalMode === 'car' ? 'THE COLLECTION' : 'YOUR NEXT CHAPTER'}</p><h2>{modalMode === 'car' ? cars[selected].name : 'Make it personal.'}</h2>
        {modalMode === 'car' ? <><p>{cars[selected].description}</p><ul>{cars[selected].tags.map(tag => <li key={tag}>{tag}</li>)}</ul><p className="dialog-note">Concept imagery. Model details, pricing, and availability are not confirmed.</p><button className="pill-button" onClick={() => setModalMode('visit')}>Plan around this car <Arrow diagonal /></button></> : <form onSubmit={saveBrief}><p>Create a personal visit brief to keep your ideas in one place.</p><label>Your name<input name="name" autoComplete="name" placeholder="How should we address you?" maxLength={100} /></label><label>Your interest<select value={selected} onChange={event => setSelected(Number(event.target.value))}>{cars.map((car, index) => <option key={car.scene} value={index}>{car.type}</option>)}</select></label><label>Preferred date<input type="date" name="date" min={new Date().toLocaleDateString('en-CA')} /></label><label>Anything on your mind?<textarea name="notes" rows={2} maxLength={1000} placeholder="What matters to you in your next car?" /></label><button className="pill-button" type="submit">Download your visit brief <Arrow diagonal /></button><p className="dialog-note">Your brief stays on your device. This does not send an enquiry or confirm an appointment.</p>{saved && <p className="save-success" role="status">Your brief is ready. Check your downloads.</p>}</form>}
      </div></div>
    </dialog>
  </div>;
}
