'use client';

import {useEffect, useRef} from 'react';
import Image from 'next/image';
import {sitePath} from '@/lib/catalog';

const FRAME_COUNT = 180;
const FRAMES_PER_SHEET = 8;
const SHEET_COUNT = Math.ceil(FRAME_COUNT / FRAMES_PER_SHEET);
type DecodedSheet = {image: CanvasImageSource; dispose: () => void};

async function decodeSheet(blob: Blob): Promise<DecodedSheet> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    return {image: bitmap, dispose: () => bitmap.close()};
  }
  const url = URL.createObjectURL(blob);
  const image = new window.Image();
  try {
    image.src = url;
    await image.decode();
    return {image, dispose: () => {image.src = ''; URL.revokeObjectURL(url);}};
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/** Eight frames per atlas; at most three decoded atlases and two requests. */
export default function OrangeSequence({sectionId, lang}: {sectionId: string; lang: 'it' | 'en'}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const section = document.getElementById(sectionId);
    if (!host || !canvas || !section) return;
    const context = canvas.getContext('2d', {alpha: false});
    if (!context) return;

    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const variant = mobile ? 'mobile' : 'desktop';
    const frameWidth = mobile ? 360 : 640;
    const frameHeight = mobile ? 405 : 720;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
    const cache = new Map<number, DecodedSheet>();
    const pending = new Map<number, AbortController>();
    const failures = new Map<number, number>();
    const retryAfter = new Map<number, number>();
    const retries = new Set<ReturnType<typeof setTimeout>>();
    let disposed = false;
    let visible = true;
    let raf = 0;
    let frame = 0;
    let target = 0;
    let playhead = 0;
    let lastTime = 0;
    let painted = -1;
    let direction = 1;
    const enabled = () => !disposed && visible && !document.hidden && !motion.matches && !connection?.saveData;
    const wanted = () => {
      const sheet = Math.floor(frame / FRAMES_PER_SHEET);
      return [sheet, sheet + direction, sheet - direction].filter(n => n >= 0 && n < SHEET_COUNT);
    };
    const schedule = () => {
      if (!raf && enabled()) raf = requestAnimationFrame(render);
    };
    const clear = () => {
      pending.forEach(controller => controller.abort());
      cache.forEach(sheet => sheet.dispose());
      cache.clear();
    };
    const fetchSheet = async (index: number) => {
      const controller = new AbortController();
      pending.set(index, controller);
      try {
        const response = await fetch(sitePath(`/sequences/orange/atlas-${variant}/sheet-${String(index).padStart(2, '0')}.webp`), {signal: controller.signal});
        if (!response.ok) throw new Error(`Atlas ${response.status}`);
        const decoded = await decodeSheet(await response.blob());
        if (controller.signal.aborted || !enabled() || !wanted().includes(index)) {
          decoded.dispose();
        } else {
          cache.set(index, decoded);
        }
      } catch {
        if (!controller.signal.aborted && !disposed) {
          failures.set(index, (failures.get(index) ?? 0) + 1);
          retryAfter.set(index, performance.now() + 800);
          // A failed request never clears the poster or the last good frame.
          if (failures.get(index)! < 2) {
            const timer = setTimeout(() => {retries.delete(timer); schedule();}, 800);
            retries.add(timer);
          }
        }
      } finally {
        pending.delete(index);
        schedule();
      }
    };
    function render(time: number) {
      raf = 0;
      if (!enabled() || !host || !canvas || !context) return;
      const delta = Math.min(64, lastTime ? time - lastTime : 16);
      lastTime = time;
      playhead += (target - playhead) * (1 - Math.exp(-delta / 85));
      if (Math.abs(target - playhead) < .05) playhead = target;
      frame = Math.round(playhead);
      const desired = wanted();
      for (const [index, sheet] of cache) {
        if (!desired.includes(index)) {sheet.dispose(); cache.delete(index);}
      }
      for (const [index, controller] of pending) {
        if (!desired.includes(index)) controller.abort();
      }
      const sheet = cache.get(desired[0]);
      if (sheet && painted !== frame) {
        const tile = frame % FRAMES_PER_SHEET;
        context.drawImage(sheet.image, (tile % 4) * frameWidth, Math.floor(tile / 4) * frameHeight,
          frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
        painted = frame;
        host.dataset.ready = 'true';
        host.dataset.frame = String(frame);
      }
      for (const index of desired) {
        if (pending.size >= 2) break;
        if (!cache.has(index) && !pending.has(index) && (failures.get(index) ?? 0) < 2 && time >= (retryAfter.get(index) ?? 0)) void fetchSheet(index);
      }
      if (playhead !== target) schedule();
    }
    function readScroll() {
      if (!section) return;
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / distance));
      const next = Math.round(Math.max(0, Math.min(1, (progress - .025) / .95)) * (FRAME_COUNT - 1));
      if (next !== target) direction = next > target ? 1 : -1;
      target = next;
      schedule();
    }
    function resize() {
      if (!host || !canvas) return;
      const width = Math.max(1, Math.round(Math.min(frameWidth, host.clientWidth * Math.min(devicePixelRatio || 1, 2))));
      canvas.width = width;
      canvas.height = Math.round(width * frameHeight / frameWidth);
      painted = -1;
      delete host.dataset.ready;
      readScroll();
    }
    function preferenceChanged() {
      if (!enabled()) {
        cancelAnimationFrame(raf); raf = 0;
        clear();
        if (motion.matches || connection?.saveData) {
          delete host!.dataset.ready;
          painted = -1;
        }
      } else readScroll();
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      preferenceChanged();
    }, {rootMargin: '200px'});
    observer.observe(section);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    window.addEventListener('scroll', readScroll, {passive: true});
    window.addEventListener('resize', resize, {passive: true});
    document.addEventListener('visibilitychange', preferenceChanged);
    motion.addEventListener('change', preferenceChanged);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      retries.forEach(clearTimeout);
      clear();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', preferenceChanged);
      motion.removeEventListener('change', preferenceChanged);
    };
  }, [sectionId]);

  return <div className="orange-sequence">
    <div className="orange-sequence-media" ref={hostRef}>
      <picture className="orange-sequence-poster">
        <source media="(max-width: 760px)" srcSet={sitePath('/sequences/orange/poster-mobile.webp')}/>
        <Image unoptimized src={sitePath('/sequences/orange/poster-desktop.webp')}
          width={640} height={720} loading="eager" fetchPriority="high"
          alt={lang === 'it' ? 'Un’arancia sopra un bicchiere: scorri per scoprire gli spicchi e il succo.' : 'An orange above a glass: scroll to reveal its segments and juice.'}/>
      </picture>
      <canvas ref={canvasRef} aria-hidden="true"/>
    </div>
  </div>;
}
