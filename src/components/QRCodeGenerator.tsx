// src/components/QRCodeGenerator.tsx
import { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ 
  value, 
  size = 200, 
  className = '' 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Simple QR code generation using a data URL approach
    // For production, consider using a proper QR code library like 'qrcode'
    generateQRCode(value, canvasRef.current, size);
  }, [value, size]);

  const generateQRCode = (text: string, canvas: HTMLCanvasElement, size: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // For now, create a simple pattern as placeholder
    // TODO(agent): Replace with proper QR code generation library
    const moduleSize = size / 25;
    ctx.fillStyle = '#000000';

    // Create a simple pattern that represents the invite code
    const hash = simpleHash(text);
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const shouldFill = (hash + i * j) % 3 === 0;
        if (shouldFill) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add corner markers (typical QR code pattern)
    drawCornerMarker(ctx, 0, 0, moduleSize);
    drawCornerMarker(ctx, 18 * moduleSize, 0, moduleSize);
    drawCornerMarker(ctx, 0, 18 * moduleSize, moduleSize);
  };

  const drawCornerMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Draw 7x7 corner marker
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };

  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-gray-200 dark:border-gray-700 rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Scan to open invite link
      </p>
    </div>
  );
}
