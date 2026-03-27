import * as THREE from "three";
import vertex from "../shaders/mediaVertex.glsl";
import fragment from "../shaders/mediaFragment.glsl";

interface Props {
  scene: THREE.Group;
  element: HTMLElement;
  viewport: { width: number; height: number };
  camera: THREE.PerspectiveCamera;
  geometry: THREE.PlaneGeometry;
  renderer: THREE.WebGLRenderer;
}

export class GLMedia {
  camera: THREE.PerspectiveCamera;
  element: HTMLElement;
  scene: THREE.Group;
  geometry: THREE.PlaneGeometry;
  renderer: THREE.WebGLRenderer;
  material!: THREE.ShaderMaterial;
  texture: THREE.Texture | null = null;
  textureState: 'unloaded' | 'loading' | 'loaded' = 'unloaded';
  viewport!: { width: number; height: number };
  bounds!: DOMRect;
  mesh!: THREE.Mesh;
  parallaxIntensity: number;

  constructor({ scene, element, viewport, camera, geometry, renderer }: Props) {
    this.scene = scene;
    this.element = element;
    this.viewport = viewport;
    this.camera = camera;
    this.geometry = geometry;
    this.renderer = renderer;

    this.parallaxIntensity = 0.4;
    this.bounds = this.element.getBoundingClientRect();
    this.createMesh();
  }

  createMesh() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uResolution: {
          value: new THREE.Vector2(
            this.bounds?.width || 1,
            this.bounds?.height || 1,
          ),
        },
        uImageResolution: { value: new THREE.Vector2(1, 1) },
        uParallax: { value: 0 },
        uUvScale: { value: 0.85 },
        uShaderMultiplier: { value: 1.0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  loadTexture() {
    if (this.textureState !== 'unloaded') return;
    this.textureState = 'loading';

    this.texture = new THREE.TextureLoader().load(
      this.element.getAttribute("src") as string,
      (text) => {
        this.textureState = 'loaded';
        const material = this.mesh?.material as THREE.ShaderMaterial;
        if (material?.uniforms?.uImageResolution) {
          material.uniforms.uImageResolution.value.set(
            text.image.width,
            text.image.height,
          );
        }
      },
      undefined,
      () => {
        this.textureState = 'unloaded'; // Reset on error
      }
    );

    this.material.uniforms.uTexture.value = this.texture;
  }

  unloadTexture() {
    if (this.textureState === 'unloaded') return;
    
    if (this.texture) {
      this.texture.dispose();
    }
    this.texture = null;
    if (this.material?.uniforms?.uTexture) {
      this.material.uniforms.uTexture.value = null;
    }
    this.textureState = 'unloaded';
  }

  updateScale() {
    this.bounds = this.element.getBoundingClientRect();
    this.mesh?.scale.set(this.bounds.width, this.bounds.height, 1);
    this.material?.uniforms.uResolution.value.set(
      this.bounds.width,
      this.bounds.height,
    );
  }

  updatePosition(scroll: number) {
    const x =
      this.bounds.left -
      scroll -
      this.viewport.width / 2 +
      this.bounds.width / 2;
    const y =
      -this.bounds.top + this.viewport.height / 2 - this.bounds.height / 2;

    this.mesh.position.set(x, y, 0);
  }

  updateParallax(scroll: number) {
    if (!this.bounds) return;

    const { innerWidth } = window;

    const elementLeft = this.bounds.left - scroll;
    const elementRight = elementLeft + this.bounds.width;

    if (elementRight >= 0 && elementLeft <= innerWidth) {
      // Calculate parallax value based on element position in viewport
      // Range from -1 to 1 as element moves through viewport
      const elementCenter = elementLeft + this.bounds.width / 2;
      const viewportCenter = innerWidth / 2;
      const distance = (elementCenter - viewportCenter) / innerWidth;

      // UV parallax with stronger effect
      const parallaxValue = distance * this.parallaxIntensity;
      this.material.uniforms.uParallax.value = parallaxValue;
    }
  }

  checkVisibility(scroll: number) {
    if (!this.bounds) return;

    const { innerWidth } = window;
    const elementLeft = this.bounds.left - scroll;
    const elementRight = elementLeft + this.bounds.width;
    
    // Load textures for images that are within 1.5 screen widths of the viewport
    const threshold = innerWidth * 1.5;
    const inView = elementRight >= -threshold && elementLeft <= innerWidth + threshold;

    if (inView && this.textureState === 'unloaded') {
      this.loadTexture();
    } else if (!inView && (this.textureState === 'loaded' || this.textureState === 'loading')) {
      this.unloadTexture();
    }
  }

  render(scroll: number) {
    this.checkVisibility(scroll);
    this.updateParallax(scroll);
    this.updatePosition(scroll);
  }

  onResize(viewport: { width: number; height: number }) {
    this.viewport = viewport;
    this.updateScale();
  }

  destroy() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.texture) {
      this.texture.dispose();
    }
  }
}
