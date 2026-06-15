"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Camera, FileText, Check, X, RotateCcw,
  Loader2, ChevronLeft, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleTypePicker } from "@/components/VehicleTypePicker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { saveSpot } from "@/storage/parkingRepository";
import { Analytics } from "@/services/analytics";
import type { VehicleType, SaveFlowState } from "@/types";

const STEPS = ["location", "photo", "note", "saving"] as const;

interface SaveFlowProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export function SaveFlow({ onSuccess, onCancel }: SaveFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<SaveFlowState>({
    step: "location",
    note: "",
    vehicleType: "car",
    vehicleName: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { requestLocation, loading: locLoading, error: locError } = useGeolocation();

  const step = STEPS[stepIndex];

  const goNext = useCallback(() => {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  // ── Step: Location ───────────────────────────────────────────────────────

  const handleGetLocation = async () => {
    const coords = await requestLocation();
    if (coords) {
      setState((s) => ({ ...s, coordinates: coords }));
      goNext();
    }
  };

  // ── Step: Camera ─────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported on this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;

      // videoRef is always mounted (video element renders unconditionally, hidden via CSS)
      // so this is safe to call immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setCameraActive(true);
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Enable it in your browser settings, or continue without a photo.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Couldn't access camera. You can still save without a photo.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhotoPreview(dataUrl);
    setState((s) => ({ ...s, photo: dataUrl }));
    stopCamera();
    Analytics.photoCaptured();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setPhotoPreview(null);
    setState((s) => ({ ...s, photo: undefined }));
    startCamera();
  }, [startCamera]);

  const skipPhoto = useCallback(() => {
    stopCamera();
    goNext();
  }, [stopCamera, goNext]);

  const handlePhotoStep = useCallback(async () => {
    if (!cameraActive && !photoPreview) {
      await startCamera();
    }
  }, [cameraActive, photoPreview, startCamera]);

  // ── Step: Save ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!state.coordinates) return;
    setState((s) => ({ ...s, step: "saving" }));

    try {
      await saveSpot({
        latitude: state.coordinates.latitude,
        longitude: state.coordinates.longitude,
        photo: state.photo,
        note: state.note || undefined,
        vehicleType: state.vehicleType,
        vehicleName: state.vehicleName || undefined,
      });

      Analytics.parkingSaved(!!state.note, !!state.photo);
      onSuccess();
    } catch {
      setState((s) => ({ ...s, step: "note", error: "Failed to save. Please try again." }));
    }
  };

  // ── When photo step becomes active ───────────────────────────────────────
  const onPhotoStepMount = useCallback(() => {
    if (!photoPreview) {
      startCamera();
    }
  }, [photoPreview, startCamera]);

  const progressPct = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#07071a" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3" style={{ background: "#07071a" }}>
        <button
          onClick={stepIndex === 0 ? onCancel : goBack}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          {stepIndex === 0 ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <div className="mt-1.5 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="absolute inset-0 flex flex-col"
          >
            {step === "location" && (
              <LocationStep
                onGetLocation={handleGetLocation}
                loading={locLoading}
                error={locError}
              />
            )}
            {step === "photo" && (
              <PhotoStep
                videoRef={videoRef}
                cameraActive={cameraActive}
                photoPreview={photoPreview}
                cameraError={cameraError}
                onCapture={capturePhoto}
                onRetake={retakePhoto}
                onSkip={skipPhoto}
                onNext={() => { stopCamera(); goNext(); }}
                onMount={onPhotoStepMount}
              />
            )}
            {step === "note" && (
              <NoteStep
                note={state.note}
                vehicleType={state.vehicleType}
                vehicleName={state.vehicleName}
                error={state.error}
                onNoteChange={(note) => setState((s) => ({ ...s, note }))}
                onVehicleTypeChange={(t) => setState((s) => ({ ...s, vehicleType: t }))}
                onVehicleNameChange={(n) => setState((s) => ({ ...s, vehicleName: n }))}
                onSave={handleSave}
              />
            )}
            {step === "saving" && <SavingStep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-step components ──────────────────────────────────────────────────────

function LocationStep({
  onGetLocation,
  loading,
  error,
}: {
  onGetLocation: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8"
      >
        <MapPin className="w-12 h-12 text-indigo-400" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-3">Get your location</h2>
      <p className="text-gray-400 mb-10 leading-relaxed">
        PinPoint needs your GPS coordinates to pin your parking spot.
      </p>

      {error && (
        <div className="flex items-start gap-2 bg-red-900/30 border border-red-800/50 rounded-2xl p-4 mb-6 text-left w-full">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onGetLocation}
        disabled={loading}
        className="btn-gradient w-full rounded-2xl py-4 text-white font-bold text-base flex items-center justify-center gap-2.5 disabled:opacity-60"
        style={{ boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Getting location…</>
        ) : (
          <><MapPin className="w-4 h-4" /> Use My Location</>
        )}
      </motion.button>
    </div>
  );
}

function PhotoStep({
  videoRef,
  cameraActive,
  photoPreview,
  cameraError,
  onCapture,
  onRetake,
  onSkip,
  onNext,
  onMount,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraActive: boolean;
  photoPreview: string | null;
  cameraError: string | null;
  onCapture: () => void;
  onRetake: () => void;
  onSkip: () => void;
  onNext: () => void;
  onMount: () => void;
}) {
  // Trigger camera on mount (useEffect runs after render, avoiding SSR issues)
  useEffect(() => { onMount(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full">
      {/* Viewfinder */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Always mounted so videoRef is available before cameraActive flips */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full"
          style={{
            display: cameraActive && !photoPreview ? "block" : "none",
            objectFit: "contain",   // no crop = no fake zoom
            background: "#000",
          }}
        />

        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoPreview}
            alt="Captured photo"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {!cameraActive && !photoPreview && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <Camera className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm">{cameraError}</p>
          </div>
        )}

        {/* Viewfinder guide overlay */}
        {cameraActive && !photoPreview && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-md" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-md" />
            <div className="absolute bottom-20 left-4 w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-md" />
            <div className="absolute bottom-20 right-4 w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-md" />
          </div>
        )}
      </div>

      {/* Camera controls */}
      <div className="bg-gray-950 px-6 py-6 flex items-center justify-between gap-4">
        {cameraActive && !photoPreview && (
          <>
            <button onClick={onSkip} className="text-gray-400 text-sm hover:text-white transition-colors">
              Skip photo
            </button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCapture}
              className="w-16 h-16 rounded-full bg-white border-4 border-gray-600 shadow-xl flex items-center justify-center"
              aria-label="Capture photo"
            >
              <Camera className="w-7 h-7 text-gray-900" />
            </motion.button>
            <div className="w-16" />
          </>
        )}

        {photoPreview && (
          <>
            <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={onRetake}>
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button className="flex-1" onClick={onNext}>
              <Check className="w-4 h-4" />
              Use Photo
            </Button>
          </>
        )}

        {cameraError && (
          <Button className="w-full" onClick={onSkip}>
            Continue without photo
          </Button>
        )}
      </div>
    </div>
  );
}

function NoteStep({
  note,
  vehicleType,
  vehicleName,
  error,
  onNoteChange,
  onVehicleTypeChange,
  onVehicleNameChange,
  onSave,
}: {
  note: string;
  vehicleType: VehicleType;
  vehicleName: string;
  error?: string;
  onNoteChange: (v: string) => void;
  onVehicleTypeChange: (v: VehicleType) => void;
  onVehicleNameChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-8 overflow-y-auto" style={{ background: "#07071a" }}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Almost done ✨</h2>
        <p style={{ color: "rgba(255,255,255,0.45)" }}>Drop a note so you find it faster.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Vehicle type
          </label>
          <VehicleTypePicker selected={vehicleType} onChange={onVehicleTypeChange} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Vehicle name <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <Input
            placeholder="e.g. White Innova, KA-01-AB-1234"
            value={vehicleName}
            onChange={(e) => onVehicleNameChange(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Parking note <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <Input
            placeholder="e.g. B2 near pillar 17, near elevator"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500"
            maxLength={100}
            autoFocus
          />
          <p className="text-xs text-gray-600 mt-1.5">
            Suggestions: "B2 near pillar 17" · "Near blue gate" · "Level 3, row D"
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="mt-auto pt-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          className="btn-gradient w-full rounded-2xl py-4 text-white font-bold text-base flex items-center justify-center gap-2.5"
          style={{ boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
        >
          <Check className="w-5 h-5" />
          Save Parking Spot
        </motion.button>
      </div>
    </div>
  );
}

function SavingStep() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-10 h-10 text-indigo-400" />
      </motion.div>
      <p className="text-gray-400 mt-4">Saving your spot…</p>
    </div>
  );
}
