import { Trash2Icon, Undo2Icon } from 'lucide-react';
import { getStroke } from 'perfect-freehand';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

// Aspect ratios for landscape and portrait orientations.
const LANDSCAPE_RATIO = 3 / 2;
const PORTRAIT_RATIO = 1 / 1;

interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface SignatureData {
  svg: string;
  bbox: { x: number; y: number; width: number; height: number };
}

interface SignatureCanvasProps {
  onSignatureChange: (data: SignatureData | null) => void;
  tapToSignLabel?: string;
  undoLabel?: string;
  clearLabel?: string;
  className?: string;
}

function getStrokeOptions(scale: number) {
  return {
    size: 4 * scale,
    thinning: 0.7,
    smoothing: 0.5,
    streamline: 0.4,
    easing: (t: number) => Math.sin((t * Math.PI) / 2),
    simulatePressure: true,
    start: {
      taper: 12 * scale,
      easing: (t: number) => t * t * t,
      cap: true,
    },
    end: {
      taper: 10 * scale,
      easing: (t: number) => t,
      cap: true,
    },
  };
}

function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) {
    return '';
  }

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q'],
  );

  d.push('Z');
  return d.join(' ');
}

function renderStrokesToCanvas(
  canvas: HTMLCanvasElement,
  allStrokes: Point[][],
  strokeScale: number,
  currentStroke?: Point[],
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const color = getComputedStyle(canvas).color || '#000';
  const opts = getStrokeOptions(strokeScale);

  const render = (points: Point[]) => {
    const stroke = getStroke(
      points.map((p) => [p.x, p.y, p.pressure]),
      opts,
    );
    const pathData = getSvgPathFromStroke(stroke);
    if (!pathData) {
      return;
    }
    const path = new Path2D(pathData);
    ctx.fillStyle = color;
    ctx.fill(path);
  };

  for (const s of allStrokes) {
    render(s);
  }
  if (currentStroke && currentStroke.length > 0) {
    render(currentStroke);
  }
}

function computeOutput(allStrokes: Point[][], strokeScale: number): SignatureData | null {
  if (allStrokes.length === 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const paths: string[] = [];
  const opts = getStrokeOptions(strokeScale);

  for (const points of allStrokes) {
    const stroke = getStroke(
      points.map((p) => [p.x, p.y, p.pressure]),
      opts,
    );
    const pathData = getSvgPathFromStroke(stroke);
    if (!pathData) {
      continue;
    }
    paths.push(pathData);

    for (const [x, y] of stroke) {
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }
  }

  if (paths.length === 0) {
    return null;
  }

  const padding = 4;
  const bbox = {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };

  return { svg: paths.join(' '), bbox };
}

function SignatureCanvas({
  onSignatureChange,
  tapToSignLabel,
  undoLabel,
  clearLabel,
  className,
}: SignatureCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Point[][]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  // strokeScale tracks the DPR-aware scale at which strokes were recorded,
  // so computeOutput uses the same stroke size as the canvas rendering.
  const strokeScaleRef = useRef(1);

  const [strokeCount, setStrokeCount] = useState(0);

  // ResizeObserver: sets canvas resolution from the container and picks the
  // aspect ratio based on whether the viewport is landscape or portrait.
  // Strokes are NOT rescaled — clearing on resize would confuse users, and
  // the SVG output is auto-cropped via bbox so the extra space is harmless.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cssW = entry.contentRect.width;
        const dpr = window.devicePixelRatio || 1;
        const isLandscape = window.innerWidth >= window.innerHeight;
        const ratio = isLandscape ? LANDSCAPE_RATIO : PORTRAIT_RATIO;
        const cssH = cssW / ratio;

        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        canvas.style.height = `${cssH}px`;

        strokeScaleRef.current = dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        renderStrokesToCanvas(canvas, strokesRef.current, strokeScaleRef.current);
      }
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Re-render on theme changes (light/dark).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const observer = new MutationObserver(() => {
      renderStrokesToCanvas(canvas, strokesRef.current, strokeScaleRef.current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    renderStrokesToCanvas(canvas, strokesRef.current, strokeScaleRef.current, currentStrokeRef.current);
  }, []);

  // Map a pointer event into canvas pixel coordinates.
  const getPointerPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0, pressure: 0.5 };
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      canvas.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      currentStrokeRef.current = [getPointerPos(e)];
      redraw();
    },
    [getPointerPos, redraw],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) {
        return;
      }
      e.preventDefault();
      currentStrokeRef.current.push(getPointerPos(e));
      redraw();
    },
    [getPointerPos, redraw],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) {
      return;
    }
    isDrawingRef.current = false;
    const finished = [...currentStrokeRef.current];
    currentStrokeRef.current = [];
    if (finished.length > 0) {
      strokesRef.current = [...strokesRef.current, finished];
      setStrokeCount(strokesRef.current.length);
      onSignatureChange(computeOutput(strokesRef.current, strokeScaleRef.current));
      redraw();
    }
  }, [redraw, onSignatureChange]);

  const handleUndo = useCallback(() => {
    trackEvent('guestbook_signature_undo');
    strokesRef.current = strokesRef.current.slice(0, -1);
    const count = strokesRef.current.length;
    setStrokeCount(count);
    onSignatureChange(count > 0 ? computeOutput(strokesRef.current, strokeScaleRef.current) : null);
    redraw();
  }, [redraw, onSignatureChange]);

  const handleClear = useCallback(() => {
    trackEvent('guestbook_signature_clear');
    strokesRef.current = [];
    setStrokeCount(0);
    onSignatureChange(null);
    redraw();
  }, [redraw, onSignatureChange]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair rounded-md border bg-muted text-foreground"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {strokeCount === 0 && tapToSignLabel && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            {tapToSignLabel}
          </div>
        )}
      </div>

      {strokeCount > 0 && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleUndo}>
            <Undo2Icon />
            {undoLabel}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            <Trash2Icon />
            {clearLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default SignatureCanvas;
