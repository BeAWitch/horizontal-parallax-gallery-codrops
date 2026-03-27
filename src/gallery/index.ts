import './gallery.css';
import { SettingsUI } from '../ui/SettingsUI';
import type { SliderConfig } from '../ui/SettingsUI';

export class Gallery {
  container: HTMLElement | null;
  wrapper: HTMLElement | null;
  images: NodeListOf<HTMLElement>;
  gui!: SettingsUI;
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
    const isWebGL = false;
    
    const sliders: SliderConfig[] = [
      {
        id: 'parallax-intensity',
        name: 'Parallax Intensity',
        min: 0,
        max: 30,
        step: 0.1,
        value: this.params.parallaxIntensity,
        onChange: (value: number) => {
          this.params.parallaxIntensity = value;
        }
      },
      {
        id: 'image-scale',
        name: 'Overflow Scale',
        min: 1.0,
        max: 1.6,
        step: 0.01,
        value: this.params.imageScale,
        onChange: (value: number) => {
          this.params.imageScale = value;
          this.updateImageScale(value);
        }
      }
    ];
    
    this.gui = new SettingsUI(isWebGL, sliders);
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
