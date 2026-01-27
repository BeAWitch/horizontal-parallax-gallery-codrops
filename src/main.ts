import "./gallery/gallery.css";
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
  scroll: Scroll;

  constructor() {
    this.container = document.querySelector(".gallery__image__container");
    this.wrapper = document.querySelector(".gallery__wrapper");
    this.scroll = {
      current: 0,
      target: 0,
      ease: 0.07,
      limit: 0,
    };

    this.setLimit();
    this.addEventListeners();
    this.render();
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
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this), {
      passive: true,
    });
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

    if (this.container) {
      this.container.style.transform = `translateX(${-this.scroll.current}px)`;
    }

    requestAnimationFrame(this.render.bind(this));
  }
}

new App();
