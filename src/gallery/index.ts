import './gallery.css';

export class Gallery {
  container: HTMLElement | null;
  wrapper: HTMLElement | null;
  images: NodeListOf<HTMLElement>;

  constructor() {
    this.container = document.querySelector('.gallery__image__container');
    this.wrapper = document.querySelector('.gallery__wrapper');
    this.images = document.querySelectorAll('.gallery__media__image');
  }

  private clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  applyParallaxEffect() {
    const vw = window.innerWidth;
    const viewportCenter = vw * 0.5;

    this.images.forEach((image) => {
      const parent = image.parentElement as HTMLElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const elementCenter = rect.left + rect.width * 0.5;

      // -1 (left) .. 0 (center) .. 1 (right)
      const t = this.clamp((elementCenter - viewportCenter) / viewportCenter, -1, 1);

      // For CSS: image width 125% (extra 25% => 12.5% each side)
      // translateX(%) is relative to image width (125%), so safe max ~= 10%
      const maxShift = 10;

      const shift = -t * maxShift; // counter-motion
      image.style.transform = `translate3d(${shift}%, 0, 0)`;
    });
  }

  render(container: HTMLElement, scroll: number) {
    container.style.transform = `translateX(${scroll < 0.01 ? 0 : -scroll}px)`;
    this.applyParallaxEffect();
  }
}
