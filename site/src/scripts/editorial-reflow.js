/**
 * Editorial text reflow demo — powered by @chenglou/pretext
 * Text reflows around a draggable geometric element without DOM measurement.
 * Uses layoutNextLine() for variable-width per-line layout.
 * Pure arithmetic layout: <0.1ms per reflow.
 */
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

export function init(container) {
  const textEl = container.querySelector('[data-reflow-text]');
  const floatEl = container.querySelector('[data-reflow-float]');
  const sourceText = textEl?.getAttribute('data-reflow-text');
  if (!textEl || !floatEl || !sourceText) return;

  const font = '16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  const lineHeight = 28; // 16px * 1.75

  let prepared = null;
  let isDragging = false;
  let floatX = 0;
  let floatY = 0;

  async function setup() {
    await document.fonts.ready;
    prepared = prepareWithSegments(sourceText, font);

    // Initial float position: top-right area
    const area = container.querySelector('[data-reflow-area]');
    const rect = area.getBoundingClientRect();
    floatX = rect.width - floatEl.offsetWidth - 24;
    floatY = 8;
    floatEl.style.transform = `translate(${floatX}px, ${floatY}px)`;

    reflow();
  }

  function reflow() {
    if (!prepared) return;

    const area = container.querySelector('[data-reflow-area]');
    const areaWidth = area.offsetWidth;
    const floatW = floatEl.offsetWidth;
    const floatH = floatEl.offsetHeight;
    const floatTop = floatY;
    const floatBottom = floatTop + floatH + 16; // 16px margin
    const floatLeft = floatX - 16; // 16px margin
    const floatRight = floatX + floatW + 16;

    // Determine if float is on left or right side
    const isFloatOnRight = floatX > areaWidth / 2;

    function getLineWidth(lineIdx) {
      const lineTop = lineIdx * lineHeight;
      const lineBottom = lineTop + lineHeight;

      // Check if this line overlaps with the float
      if (lineBottom > floatTop && lineTop < floatBottom) {
        if (isFloatOnRight) {
          return Math.max(100, floatLeft);
        } else {
          return Math.max(100, areaWidth - floatRight);
        }
      }
      return areaWidth;
    }

    // Use layoutNextLine for variable-width per-line layout
    const lines = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let lineIdx = 0;
    const maxLines = 50; // safety limit

    while (lineIdx < maxLines) {
      const width = getLineWidth(lineIdx);
      const line = layoutNextLine(prepared, cursor, width);
      if (!line) break;
      lines.push({ ...line, lineWidth: width });
      cursor = line.end;
      lineIdx++;
    }

    // Render lines as positioned spans
    let html = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = i * lineHeight;
      const lineTop = y;
      const lineBottom = y + lineHeight;
      const overlaps = lineBottom > floatTop && lineTop < floatBottom;

      let xOffset = 0;
      if (overlaps && !isFloatOnRight) {
        xOffset = floatRight;
      }

      const text = line.text.replace(/\s+$/, '');
      if (text.length > 0) {
        html += `<span class="reflow-line" style="top:${y}px;left:${xOffset}px">${escapeHtml(text)}</span>`;
      }
    }

    textEl.innerHTML = html;
    textEl.style.height = `${lines.length * lineHeight}px`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Drag interaction
  floatEl.addEventListener('pointerdown', (e) => {
    isDragging = true;
    floatEl.setPointerCapture(e.pointerId);
    floatEl.style.cursor = 'grabbing';
    e.preventDefault();
  });

  floatEl.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const area = container.querySelector('[data-reflow-area]');
    const areaRect = area.getBoundingClientRect();

    floatX = Math.max(0, Math.min(e.clientX - areaRect.left - floatEl.offsetWidth / 2, areaRect.width - floatEl.offsetWidth));
    floatY = Math.max(0, Math.min(e.clientY - areaRect.top - floatEl.offsetHeight / 2, areaRect.height - floatEl.offsetHeight));

    floatEl.style.transform = `translate(${floatX}px, ${floatY}px)`;
    reflow();
  });

  // pointercancel fires when a touch drag turns into a scroll; without it the
  // block stays stuck in the dragging state.
  const endDrag = () => {
    isDragging = false;
    floatEl.style.cursor = 'grab';
  };
  floatEl.addEventListener('pointerup', endDrag);
  floatEl.addEventListener('pointercancel', endDrag);
  floatEl.addEventListener('lostpointercapture', endDrag);

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reflow, 50);
  });

  setup();
}
