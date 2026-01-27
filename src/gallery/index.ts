import "./gallery.css";

export class Gallery {
  container: HTMLElement | null;
  wrapper: HTMLElement | null;
  images: NodeListOf<HTMLElement>;

  constructor() {
    this.container = document.querySelector(".gallery__image__container");
    this.wrapper = document.querySelector(".gallery__wrapper");
    this.images = document.querySelectorAll(".gallery__media__image");
  }

  applyParallaxEffect() {
    this.images.forEach((image) => {
      const parent = image.parentElement as HTMLElement;
      if (!parent) return;

      let { left } = parent.getBoundingClientRect();
      left -= window.innerWidth * 0.25;

      image.style.transform = `translateX(${left * -0.025}%)`;
    });
  }

  render(container: HTMLElement, scroll: number) {
    if (container) {
      container.style.transform = `translateX(${scroll < 0.01 ? 0 : -scroll}px)`;
    }

    this.applyParallaxEffect();
  }
}
