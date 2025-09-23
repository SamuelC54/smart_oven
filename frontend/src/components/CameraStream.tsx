import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Camera, CameraOff, RotateCcw, Download, Settings } from "lucide-react";
import {
  useCameraInfo,
  useCameraStart,
  useCameraStop,
  getCameraStreamUrl,
  getCameraSnapshotUrl,
} from "../services/api/useOvenApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CameraStreamProps {
  className?: string;
  showControls?: boolean;
  quality?: number;
  onQualityChange?: (quality: number) => void;
}

export function CameraStream({
  className = "",
  showControls = true,
  quality = 85,
  onQualityChange,
}: CameraStreamProps) {
  const [currentQuality, setCurrentQuality] = useState(quality);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const queryClient = useQueryClient();

  // API hooks
  const { data: cameraInfo, isLoading: cameraInfoLoading } = useCameraInfo();
  const startCamera = useCameraStart();
  const stopCamera = useCameraStop();

  // Stream URL
  const streamUrl = getCameraStreamUrl(currentQuality);

  // Handle stream start
  const handleStartStream = async () => {
    try {
      await startCamera.mutateAsync();
      setIsStreaming(true);
      setStreamError(null);

      // Refresh camera info
      queryClient.invalidateQueries({ queryKey: ["camera", "info"] });

      toast.success("Camera started successfully");
    } catch (error) {
      console.error("Failed to start camera:", error);
      toast.error("Failed to start camera");
      setStreamError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Handle stream stop
  const handleStopStream = async () => {
    try {
      await stopCamera.mutateAsync();
      setIsStreaming(false);
      setStreamError(null);

      // Refresh camera info
      queryClient.invalidateQueries({ queryKey: ["camera", "info"] });

      toast.success("Camera stopped");
    } catch (error) {
      console.error("Failed to stop camera:", error);
      toast.error("Failed to stop camera");
    }
  };

  // Handle quality change
  const handleQualityChange = (newQuality: number[]) => {
    const qualityValue = newQuality[0];
    setCurrentQuality(qualityValue);
    onQualityChange?.(qualityValue);

    // If streaming, restart with new quality
    if (isStreaming && imgRef.current) {
      imgRef.current.src = getCameraStreamUrl(qualityValue);
    }
  };

  // Handle image load/error
  const handleImageLoad = () => {
    setStreamError(null);
  };

  const handleImageError = () => {
    setStreamError("Failed to load camera stream");
    setIsStreaming(false);
  };

  // Handle snapshot download
  const handleSnapshot = async () => {
    try {
      const response = await fetch(getCameraSnapshotUrl());
      if (!response.ok) {
        throw new Error("Failed to capture snapshot");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oven-snapshot-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Snapshot downloaded");
    } catch (error) {
      console.error("Failed to capture snapshot:", error);
      toast.error("Failed to capture snapshot");
    }
  };

  // Auto-start stream if camera is available
  useEffect(() => {
    if (cameraInfo?.data?.camera_available && !isStreaming && !streamError) {
      handleStartStream();
    }
  }, [cameraInfo]);

  const cameraAvailable = cameraInfo?.data?.camera_available;
  const cameraStreamingStatus = cameraInfo?.data?.is_streaming;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Oven Camera
            {cameraAvailable ? (
              <Badge variant="outline" className="text-green-600">
                Available
              </Badge>
            ) : (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </CardTitle>

          {showControls && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {isStreaming ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopStream}
                  disabled={stopCamera.isPending}
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartStream}
                  disabled={startCamera.isPending || !cameraAvailable}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && showControls && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Stream Quality: {currentQuality}%
              </label>
              <Slider
                value={[currentQuality]}
                onValueChange={handleQualityChange}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSnapshot}
                disabled={!isStreaming}
              >
                <Download className="h-4 w-4 mr-2" />
                Snapshot
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (imgRef.current) {
                    imgRef.current.src = streamUrl;
                  }
                }}
                disabled={!isStreaming}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Camera Stream */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {cameraInfoLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground">Loading camera...</div>
            </div>
          ) : !cameraAvailable ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <CameraOff className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="text-muted-foreground">
                  Camera not available
                </div>
                <div className="text-sm text-muted-foreground">
                  Check camera connection and permissions
                </div>
              </div>
            </div>
          ) : streamError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <CameraOff className="h-12 w-12 mx-auto text-red-500" />
                <div className="text-red-500">Stream Error</div>
                <div className="text-sm text-muted-foreground">
                  {streamError}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartStream}
                  disabled={startCamera.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : isStreaming ? (
            <img
              ref={imgRef}
              src={streamUrl}
              alt="Oven Camera Stream"
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="text-muted-foreground">Camera ready</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartStream}
                  disabled={startCamera.isPending}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Stream
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Status Info */}
        {cameraInfo?.data && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Status: {cameraStreamingStatus ? "Streaming" : "Stopped"}</div>
            {cameraInfo.data.resolution && (
              <div>
                Resolution: {cameraInfo.data.resolution[0]}x
                {cameraInfo.data.resolution[1]}
              </div>
            )}
            {cameraInfo.data.framerate && (
              <div>Frame Rate: {cameraInfo.data.framerate}fps</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
