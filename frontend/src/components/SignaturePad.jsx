import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

export default function SignaturePad({ value, onChange, testid = "signature-pad" }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const [hasStrokes, setHasStrokes] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      // preserve existing drawing
      const dataUrl = hasStrokes ? canvas.toDataURL() : null;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = "#fafafa";
      if (dataUrl) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = dataUrl;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastRef.current = pos(e);
  };
  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    if (!hasStrokes) setHasStrokes(true);
  };
  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onChange && onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
    onChange && onChange("");
  };

  return (
    <div className="relative" data-testid={testid}>
      <canvas
        ref={canvasRef}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        className="w-full h-44 bg-[#0c0c0e] border border-white/[0.08] rounded-xl cursor-crosshair touch-none"
        style={{ touchAction: "none" }}
      />
      {!hasStrokes && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-600 text-sm">
          Sign here
        </div>
      )}
      <button
        type="button"
        onClick={clear}
        data-testid="signature-clear"
        className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[0.7rem] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
      >
        <Eraser className="h-3 w-3" /> Clear
      </button>
    </div>
  );
}
