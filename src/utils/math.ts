import GSAP from "gsap";

export function lerp(p1: number, p2: number, t: number): number {
  return GSAP.utils.interpolate(p1, p2, t);
}

export function clamp(min: number, max: number, value: number): number {
  return GSAP.utils.clamp(min, max, value);
}
