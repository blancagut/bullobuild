"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) {
    return (
      <div className={cn("aspect-square bg-white/5 flex items-center justify-center text-gray-600", className)}>
        No images
      </div>
    );
  }

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Main image */}
      <div className="relative aspect-square bg-white/5 overflow-hidden group">
        <Image
          src={images[active]}
          alt={`${alt} — image ${active + 1}`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
        <button
          onClick={() => setZoomed(true)}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Zoom image"
        >
          <ZoomIn size={16} />
        </button>
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 px-2 py-0.5">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 w-16 h-16 bg-white/5 border-2 transition-colors overflow-hidden",
                i === active ? "border-[#F2B705]" : "border-transparent hover:border-white/30"
              )}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-full max-w-3xl aspect-square">
            <Image
              src={images[active]}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
