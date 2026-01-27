import * as THREE from "three";
import { GLMedia } from "./GLMedia";

export interface Sizes {
  width: number;
  height: number;
}

export class GL {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  geometry!: THREE.PlaneGeometry;
  group: THREE.Group;
  screen: Sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  medias!: HTMLElement[];
  allMedias!: GLMedia[];

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const fov = 2 * Math.atan(this.screen.height / 2 / 100) * (180 / Math.PI);

    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.screen.width / this.screen.height,
      0.01,
      1000,
    );
    this.camera.position.set(0, 0, 100);
    this.group = new THREE.Group();
    this.medias = Array.from(
      document.querySelectorAll(".gallery__media__image__gl"),
    );
    this.createGeometry();
    this.createGallery();
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
  }
  createGallery() {
    this.allMedias = this.medias.map((media) => {
      return new GLMedia({
        scene: this.group,
        element: media,
        viewport: this.screen,
        camera: this.camera,
        geometry: this.geometry,
        renderer: this.renderer,
      });
    });

    this.scene.add(this.group);
  }

  onResize(
    viewport: Sizes = { width: window.innerWidth, height: window.innerHeight },
  ) {
    this.screen = viewport;

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.fov =
      2 * Math.atan(this.screen.height / 2 / 100) * (180 / Math.PI);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.allMedias.forEach((media) => {
      media.onResize(this.screen);
    });
  }

  render(scroll: number) {
    this.allMedias.forEach((media) => {
      media.render(scroll);
    });
    this.renderer.render(this.scene, this.camera);
  }
}
