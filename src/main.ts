import { Gallery } from "./gallery";
import { GL } from "./gallery/GL";
import { clamp, lerp } from "./utils/math";

interface Scroll {
  current: number;
  target: number;
  ease: number;
  limit: number;
}

class App {
  container: HTMLElement | null;
  wrapper: HTMLElement | null;
  images: NodeListOf<HTMLElement>;
  scroll: Scroll;
  gallery!: Gallery;
  gl!: HTMLElement | null;
  canvas!: GL | null;

  constructor() {
    this.container =
      document.querySelector(".gallery__image__container") ||
      document.querySelector(".gallery__image__container__gl");
    this.wrapper =
      document.querySelector(".gallery__wrapper") ||
      document.querySelector(".gallery__wrapper__gl");
    this.images = document.querySelectorAll(".gallery__media__image");
    this.gl = document.getElementById("gl");
    this.scroll = {
      current: 0,
      target: 0,
      ease: 0.07,
      limit: 0,
    };

    this.preloadImages().then(() => {
      document.body.classList.remove("loading");
      this.init();
      this.setLimit();
      this.onResize();
      this.addEventListeners();
      this.render();
    });
  }

  preloadImages(): Promise<void[]> {
    const images = Array.from(document.querySelectorAll("img"));
    const promises = images.map((img) => {
      return new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = img.src;
      });
    });
    return Promise.all(promises);
  }

  init() {
    this.gallery = new Gallery();
    if (this.gl) {
      this.canvas = new GL();
    }
  }

  setLimit() {
    if (!this.container || !this.wrapper) return;
    this.scroll.limit = this.container.scrollWidth - this.wrapper.clientWidth;
  }

  onWheel(e: WheelEvent) {
    this.scroll.target += e.deltaY;
  }

  onResize() {
    this.setLimit();
    this.canvas?.onResize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this), {
      passive: true,
    });
  }

  render() {
    this.scroll.target = clamp(0, this.scroll.limit, this.scroll.target);

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    );

    this.gallery?.render(this.container!, this.scroll.current);
    this.canvas?.render(this.scroll.current);

    requestAnimationFrame(this.render.bind(this));
  }
}

new App();
