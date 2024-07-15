import { isWindowDefined } from "./isWindowDefined";

export function isTouchDevice() {
  if (!isWindowDefined()) return false;

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
