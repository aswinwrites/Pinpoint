"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Navigation } from "lucide-react";
import Image from "next/image";
import { getParkingHistory } from "@/storage/parkingRepository";
import { mapsUrl } from "@/lib/geolocation";
import { formatTimestamp, vehicleEmoji } from "@/lib/utils";
import { Analytics } from "@/services/analytics";
import type { ParkingSpot } from "@/types";

export function ParkingHistory() {
  const [history, setHistory] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParkingHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No parking history yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((spot, i) => (
        <motion.div
          key={spot.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-3"
        >
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
            {spot.photo ? (
              <Image
                src={spot.photo}
                alt="Parking"
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {vehicleEmoji(spot.vehicleType)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
              <Clock className="w-3 h-3" />
              {formatTimestamp(spot.createdAt)}
            </div>
            {spot.note && (
              <p className="text-sm font-medium text-gray-800 truncate">{spot.note}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <MapPin className="w-3 h-3" />
              {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
            </div>
          </div>

          {/* Navigate */}
          <a
            href={mapsUrl(spot.latitude, spot.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => Analytics.navigationStarted()}
            className="p-2 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors shrink-0"
            aria-label="Navigate to spot"
          >
            <Navigation className="w-4 h-4" />
          </a>
        </motion.div>
      ))}
    </div>
  );
}
