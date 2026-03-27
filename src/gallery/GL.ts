import * as THREE from "three";
import { GLMedia } from "./GLMedia";
import { SettingsUI } from '../ui/SettingsUI';
import type { SliderConfig } from '../ui/SettingsUI';

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
  gui!: SettingsUI;
  params = {
    parallaxIntensity: 0.4,
    uvScale: 0.85,
    shaderMultiplier: 1.0,
  };

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
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
    this.setupGUI();
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

  setupGUI() {
    const isWebGL = true;
    
    const sliders: SliderConfig[] = [
      {
        id: 'parallax-intensity',
        name: 'Parallax Intensity',
        min: 0,
        max: 1,
        step: 0.01,
        value: this.params.parallaxIntensity,
        onChange: (value: number) => {
          this.params.parallaxIntensity = value;
          this.allMedias.forEach((media) => {
            media.parallaxIntensity = value;
          });
        }
      },
      {
        id: 'uv-scale',
        name: 'UV Scale',
        min: 0.7,
        max: 1.0,
        step: 0.01,
        value: this.params.uvScale,
        onChange: (value: number) => {
          this.params.uvScale = value;
          this.allMedias.forEach((media) => {
            if (media.material && media.material.uniforms) {
              media.material.uniforms.uUvScale.value = value;
            }
          });
        }
      },
      {
        id: 'shader-multiplier',
        name: 'Shader Multiplier',
        min: 0,
        max: 2,
        step: 0.1,
        value: this.params.shaderMultiplier,
        onChange: (value: number) => {
          this.params.shaderMultiplier = value;
          this.allMedias.forEach((media) => {
            if (media.material && media.material.uniforms) {
              media.material.uniforms.uShaderMultiplier.value = value;
            }
          });
        }
      }
    ];
    
    this.gui = new SettingsUI(isWebGL, sliders);
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

  destroy() {
    this.allMedias.forEach((media) => media.destroy());
    this.allMedias = [];
    
    if (this.geometry) {
      this.geometry.dispose();
    }
    
    this.scene.remove(this.group);
    
    if (this.gui) {
      this.gui.destroy();
    }
    
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
