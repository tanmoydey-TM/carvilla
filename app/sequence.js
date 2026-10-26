'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// One original video frame per image. Decode only a small moving window.
export default function Sequence({ motion, onProgress, children }) {
  const section = useRef(null);
  const canvas = useRef(null);
  const notify = useRef(onProgress);
  useEffect(() => { notify.current = onProgress; }, [onProgress]);

  useEffect(() => {
    if (!motion) return;
    const root = section.current;
    const surface = canvas.current;
    const context = surface.getContext('2d', { alpha: false });
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const count = 406;
    const cache = new Map();
    const pending = new Set();
    const failed = new Set();
    const abort = new AbortController();
    let wanted = 0;
    let disposed = false;
    let active = false;
    let raf = 0;
    let lastDrawn = -1;

    function draw() {
      raf = 0;
      if (disposed) return;
      let frame = cache.get(wanted);
      if (!frame) {
        const nearest = [...cache.keys()].sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted))[0];
        frame = cache.get(nearest);
      }
      if (!frame) return;
      const box = surface.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.round(box.width * ratio);
      const height = Math.round(box.height * ratio);
      if (!width || !height) return;
      if (surface.width !== width || surface.height !== height) { surface.width = width; surface.height = height; }
      const scale = mobile ? width / frame.width : Math.max(width / frame.width, height / frame.height);
      context.fillStyle = '#080e13';
      context.fillRect(0, 0, width, height);
      context.drawImage(frame, (width - frame.width * scale) / 2, (height - frame.height * scale) / 2, frame.width * scale, frame.height * scale);
      surface.style.opacity = '1';
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(draw); }
    async function load(index) {
      pending.add(index);
      try {
        const scene = index < 158 ? 1 : index < 282 ? 2 : 3;
        const localFrame = index - (scene === 1 ? 0 : scene === 2 ? 158 : 282);
        const response = await fetch(`/media/scene-${scene}/${mobile ? 'mobile' : 'desktop'}/${String(localFrame).padStart(4, '0')}.webp`, { signal: abort.signal });
        if (!response.ok) { failed.add(index); return; }
        const bitmap = await createImageBitmap(await response.blob());
        if (disposed || !active) { bitmap.close(); return; }
        cache.set(index, bitmap);
        if (cache.size > 20) {
          const distant = [...cache.keys()].sort((a, b) => Math.abs(b - wanted) - Math.abs(a - wanted));
          for (const key of distant.slice(0, cache.size - 20)) { cache.get(key).close(); cache.delete(key); }
        }
        if (index === wanted || lastDrawn < 0) { schedule(); lastDrawn = index; }
      } catch (error) {
        if (error.name !== 'AbortError') failed.add(index);
      } finally {
        pending.delete(index);
        if (active && !disposed) pump();
      }
    }
    function pump() {
      if (!active || disposed) return;
      const candidates = [wanted];
      for (let offset = 1; offset <= 5; offset++) candidates.push(wanted + offset, wanted - offset);
      for (const index of candidates) {
        if (pending.size >= 2) break;
        if (index >= 0 && index < count && !cache.has(index) && !pending.has(index) && !failed.has(index)) load(index);
      }
    }
    const timeline = { frame: 0 };
    const tween = gsap.to(timeline, {
      frame: count - 1, ease: 'none',
      onUpdate() {
        wanted = Math.round(timeline.frame);
        const scene = wanted < 158 ? 1 : wanted < 282 ? 2 : 3;
        root.style.setProperty('--intro-opacity', String(Math.max(0, 1 - wanted / 45)));
        root.style.setProperty('--chapter-opacity', String(Math.min(1, Math.max(0, (wanted - 45) / 25))));
        root.dataset.intro = wanted < 45 ? 'true' : 'false';
        notify.current?.(scene, wanted / (count - 1));
        schedule(); pump();
      },
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.35,
      },
    });
    const observer = new IntersectionObserver(entries => {
      active = entries[0].isIntersecting;
      if (active) { schedule(); pump(); }
      else { cache.forEach(frame => frame.close()); cache.clear(); lastDrawn = -1; }
    }, { rootMargin: '350px 0px' });
    observer.observe(root);
    const resize = new ResizeObserver(schedule);
    resize.observe(surface);
    return () => {
      disposed = true; abort.abort(); observer.disconnect(); resize.disconnect();
      tween.scrollTrigger?.kill(); tween.kill(); cancelAnimationFrame(raf);
      cache.forEach(frame => frame.close());
    };
  }, [motion]);

  return <section ref={section} className={`sequence hero-tour ${motion ? '' : 'sequence-still'}`} id="home" aria-label="Car Villa cinematic showroom hero">
    <span id="chapter-1" className="chapter-anchor anchor-one" /><span id="chapter-2" className="chapter-anchor anchor-two" /><span id="chapter-3" className="chapter-anchor anchor-three" />
    <div className="sequence-stage hero" style={{ backgroundImage: `url(/media/${motion ? 'scene-1/desktop/0000' : 'poster-1'}.webp)` }}>
      {motion && <canvas ref={canvas} aria-hidden="true" />}<div className="sequence-shade" />{children}
    </div>
  </section>;
}
