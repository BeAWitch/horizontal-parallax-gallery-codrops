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
  objectUrls: string[] = [];
  rafId: number = 0;

  constructor() {
    this.container =
      document.querySelector(".gallery__image__container") ||
      document.querySelector(".gallery__image__container__gl");
    this.wrapper =
      document.querySelector(".gallery__wrapper") ||
      document.querySelector(".gallery__wrapper__gl");
    this.images = document.querySelectorAll(".gallery__media__image") as NodeListOf<HTMLElement> || document.querySelectorAll(".gallery__media__image__gl") as NodeListOf<HTMLElement>;
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
      this.initFolderInput();
      this.render();
    });
  }

  initFolderInput() {
    const folderInput = document.getElementById('folder-input') as HTMLInputElement;
    if (!folderInput) return;

    folderInput.addEventListener('change', async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        alert("No images found in the selected folder.");
        folderInput.value = '';
        return;
      }

      imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      this.updateImages(imageFiles);
      folderInput.value = ''; // Reset to allow selecting the same folder again
    });
  }

  updateImages(imageFiles: File[]) {
    // Stop rendering
    cancelAnimationFrame(this.rafId);

    // Cleanup old GL instance
    if (this.canvas) {
      this.canvas.destroy();
      this.canvas = null;
    }

    // Revoke old blob URLs
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls = [];

    // Generate new HTML
    const isGL = !!this.gl;
    const mediaClass = isGL ? 'gallery__media__gl' : 'gallery__media';
    const imageClass = isGL ? 'gallery__media__image__gl' : 'gallery__media__image';

    let html = '';
    imageFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      this.objectUrls.push(url);
      html += `
        <picture class="${mediaClass}">
          <img src="${url}" alt="${file.name}" class="${imageClass}" draggable="false" loading="lazy" />
        </picture>
      `;
    });

    if (this.container) {
      this.container.innerHTML = html;
    }

    // Refresh image list and re-init
    this.images = document.querySelectorAll(`.${imageClass}`) as NodeListOf<HTMLElement>;
    document.body.classList.add("loading");

    // Reset scroll positions
    this.scroll.target = 0;
    this.scroll.current = 0;
    if (this.container) {
      this.container.style.transform = `translateX(0px)`;
    }

    this.preloadImages().then(() => {
      document.body.classList.remove("loading");
      this.init();
      this.setLimit();
      this.onResize();
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

    this.rafId = requestAnimationFrame(this.render.bind(this));
  }
}

new App();
