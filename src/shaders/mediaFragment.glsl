precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform float uParallax;
uniform float uUvScale;
uniform float uShaderMultiplier;

vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageResolution) {
  vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}


void main() {
  vec2 uv = coverUv(vUv, uResolution, uImageResolution);

  // Apply parallax effect (horizontal instead of vertical)
  uv.x += uParallax * uShaderMultiplier; // Increased multiplier from 0.5 to 1.0 for stronger effect

  // Scale UV to create "parent container" effect
  // This makes the texture slightly smaller, creating space for parallax movement
  uv -= 0.5;
  uv *= uUvScale; // Increased from 0.92 to allow more parallax movement
  uv += 0.5;

  vec3 col = texture2D(uTexture, uv).rgb;

  gl_FragColor = vec4(col, 1.);
}
