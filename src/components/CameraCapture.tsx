import { useState, useRef, useEffect } from "react";
import { Camera, X, Circle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

export const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    requestCameraAccess();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const requestCameraAccess = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setHasPermission(false);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take photos",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/png");
      
      // Stop the camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      onCapture(imageDataUrl);
      toast({
        title: "Photo captured!",
        description: "Adjust the image before processing",
      });
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onCancel();
  };

  if (hasPermission === false) {
    return (
      <Card className="p-8 bg-gradient-to-b from-card to-card/50">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <Camera className="w-10 h-10 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-foreground">
              Camera Access Required
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Please allow camera access in your browser settings to take photos
            </p>
          </div>
          <Button onClick={handleCancel} variant="outline">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  if (hasPermission === null) {
    return (
      <Card className="p-8 bg-gradient-to-b from-card to-card/50">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Requesting camera access...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleCancel}
          variant="outline"
          size="icon"
          className="h-12 w-12"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={capturePhoto}
          size="icon"
          className="h-16 w-16 rounded-full"
        >
          <Circle className="h-8 w-8" />
        </Button>
        
        <Button
          onClick={toggleCamera}
          variant="outline"
          size="icon"
          className="h-12 w-12"
        >
          <RotateCw className="h-5 w-5" />
        </Button>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Position text clearly in frame for best results
      </p>
    </div>
  );
};
