/**
 * Page motion: one-time scroll reveals for every [data-reveal] element, plus the hero photo drift.
 * Timing, distance and stagger live in src/styles/tokens.css; the hidden states live in global.css.
 * Does nothing when the visitor prefers reduced motion, so content shows at once and stays still.
 */
declare global {
  interface Window {
    dinkwellMotion?: boolean;
  }
}

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The inline script in BaseLayout drops .js if this file never loads, so content can't stay hidden.
window.dinkwellMotion = true;

/** After the reveal has played, hand the element back to its own styles (hover transitions etc.). */
const settle = (el: HTMLElement, targets: HTMLElement[]) => {
  el.removeAttribute('data-reveal');
  el.removeAttribute('data-reveal-delay');
  el.classList.remove('is-revealed');
  for (const t of targets) {
    t.style.removeProperty('--reveal-i');
    t.style.removeProperty('will-change');
  }
};

const reveal = (el: HTMLElement) => {
  const mode = el.dataset.reveal;
  const base = Number(el.dataset.revealDelay) || 0;
  const items = mode === 'stagger' || mode === 'lines' ? (Array.from(el.children) as HTMLElement[]) : [el];
  // Lines move their inner span; everything else moves itself.
  const movers = mode === 'lines' ? items.map((line) => (line.firstElementChild as HTMLElement) ?? line) : items;

  items.forEach((item, i) => item.style.setProperty('--reveal-i', String(base + i)));
  movers.forEach((m) => (m.style.willChange = mode === 'lines' ? 'transform' : 'transform, opacity'));
  el.classList.add('is-revealed');

  const transitions = el.getAnimations({ subtree: true }).filter((a) => a instanceof CSSTransition);
  Promise.allSettled(transitions.map((a) => a.finished)).then(() => settle(el, [...items, ...movers]));
};

if (root.classList.contains('js') && !reduced) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Reveal on entry, and also anything already scrolled past (e.g. after a jump to #booking).
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          observer.unobserve(entry.target);
          reveal(entry.target as HTMLElement);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => observer.observe(el));

  // Hero photo drift: the only scroll-linked effect. Runs only while the hero is on screen.
  const photo = document.querySelector<HTMLElement>('[data-parallax]');
  const ratio = parseFloat(getComputedStyle(root).getPropertyValue('--motion-drift')) || 0;
  if (photo && ratio) {
    let frame = 0;
    const update = () => {
      frame = 0;
      photo.style.translate = `0 ${(scrollY * ratio).toFixed(1)}px`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        photo.style.willChange = 'translate, scale';
        addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        photo.style.removeProperty('will-change');
        removeEventListener('scroll', onScroll);
      }
    }).observe(photo);
  }
}

export {};
