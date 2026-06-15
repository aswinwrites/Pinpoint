"use client";

import { motion } from "framer-motion";
import type { VehicleType } from "@/types";
import { cn } from "@/lib/utils";

const VEHICLES: { type: VehicleType; emoji: string; label: string }[] = [
  { type: "car", emoji: "🚗", label: "Car" },
  { type: "motorcycle", emoji: "🏍", label: "Bike" },
  { type: "bicycle", emoji: "🚲", label: "Cycle" },
  { type: "other", emoji: "🚘", label: "Other" },
];

interface VehicleTypePickerProps {
  selected: VehicleType;
  onChange: (type: VehicleType) => void;
}

export function VehicleTypePicker({ selected, onChange }: VehicleTypePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {VEHICLES.map(({ type, emoji, label }) => (
        <motion.button
          key={type}
          whileTap={{ scale: 0.94 }}
          onClick={() => onChange(type)}
          className={cn(
            "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-sm font-medium",
            selected === type
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
          )}
        >
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
