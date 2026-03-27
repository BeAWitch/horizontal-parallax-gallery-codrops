import './gallery.css';
import GUI from "lil-gui";

export class Gallery {
  container: HTMLElement | null;
  wrapper: HTMLElement | null;
  images: NodeListOf<HTMLElement>;
  gui!: GUI;
  params = {
    parallaxIntensity: 10,
    imageScale: 1.25,
  };

  constructor() {
    this.container = document.querySelector('.gallery__image__container');
    this.wrapper = document.querySelector('.gallery__wrapper');
    this.images = document.querySelectorAll('.gallery__media__image');
    
    // Only setup GUI if we actually have DOM elements for this gallery
    if (this.container) {
      this.setupGUI();
      this.updateImageScale(this.params.imageScale);
    }
  }

  setupGUI() {
    this.gui = new GUI({ title: '2D/DOM Parallax Settings' });

    this.gui
      .add(this.params, "parallaxIntensity", 0, 30, 0.1)
      .name("Parallax Intensity");

    this.gui
      .add(this.params, "imageScale", 1.0, 1.6, 0.01)
      .name("Image Overflow Scale")
      .onChange((value: number) => {
        this.updateImageScale(value);
      });
  }

  updateImageScale(scale: number) {
    const widthPercentage = scale * 100;
    const leftPercentage = -((scale - 1) / 2) * 100;
    
    this.images.forEach((image) => {
      image.style.width = `${widthPercentage}%`;
      image.style.left = `${leftPercentage}%`;
    });
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

      // For CSS: image width uses params.imageScale
      const maxShift = this.params.parallaxIntensity;

      const shift = -t * maxShift; // counter-motion
      image.style.transform = `translate3d(${shift}%, 0, 0)`;
    });
  }

  render(container: HTMLElement, scroll: number) {
    if (!container) return;
    container.style.transform = `translateX(${scroll < 0.01 ? 0 : -scroll}px)`;
    this.applyParallaxEffect();
  }

  destroy() {
    if (this.gui) {
      this.gui.destroy();
    }
  }
}
