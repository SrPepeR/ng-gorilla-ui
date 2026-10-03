/** Contrast ratio between two CSS colors as rendered by the browser (WCAG 2.x formula). */
export function contrastRatio(foreground: string, background: string, scope: Element): number {
  const [high, low] = [luminance(foreground, scope), luminance(background, scope)].sort(
    (a, b) => b - a,
  );
  return (high + 0.05) / (low + 0.05);
}

function luminance(color: string, scope: Element): number {
  const probe = document.createElement('span');
  probe.style.color = color;
  scope.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();

  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context) {
    return 0;
  }
  context.fillStyle = computed;
  context.fillRect(0, 0, 1, 1);
  const channels = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3), (value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
