import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RotateCw, ZoomIn, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ImagePreprocessorProps {
  image: string;
  onProcess: (processedImage: string) => void;
  onCancel: () => void;
}

export const ImagePreprocessor = ({ image, onProcess, onCancel }: ImagePreprocessorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      applyFilters();
    };
    img.src = image;
  }, [image]);

  useEffect(() => {
    if (imgRef.current) {
      applyFilters();
    }
  }, [rotation, scale]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate canvas size based on rotation
    const isRotated = rotation % 180 !== 0;
    const width = isRotated ? img.height : img.width;
    const height = isRotated ? img.width : img.height;

    canvas.width = width * scale;
    canvas.height = height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

    // Restore context
    ctx.restore();
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setScale(1);
  };

  const handleProcess = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const processedImage = canvas.toDataURL("image/png");
    onProcess(processedImage);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Enhance Image</h3>
          <p className="text-sm text-muted-foreground">
            Adjust settings for better OCR accuracy
          </p>
        </div>
        <Sparkles className="w-6 h-6 text-primary" />
      </div>

      {/* Canvas Preview */}
      <div className="flex justify-center bg-muted/30 rounded-lg p-4 overflow-auto max-h-[400px]">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto border border-border rounded shadow-lg"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Rotation */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Rotation</Label>
          <Button
            onClick={handleRotate}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Rotate 90°
          </Button>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              <ZoomIn className="w-4 h-4 inline mr-1" />
              Scale
            </Label>
            <span className="text-sm text-muted-foreground">{scale.toFixed(1)}x</span>
          </div>
          <Slider
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Reset
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleProcess} className="flex-1">
          Process OCR
        </Button>
      </div>
    </Card>
  );
};
