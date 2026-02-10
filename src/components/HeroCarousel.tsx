
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const carouselItems = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1523240715634-190ae9be9912?q=80&w=2070&auto=format&fit=crop",
        alt: "Nigerian students collaborating on research",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop",
        alt: "Modern academic research environment",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop",
        alt: "Student working on academic project",
    }
];

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, []);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(nextSlide, 7000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            {carouselItems.map((item, index) => (
                <div
                    key={item.id}
                    className={cn(
                        "absolute inset-0 w-full h-full transition-all duration-[2000ms] ease-in-out transform",
                        index === currentIndex
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-110"
                    )}
                >
                    <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        className="object-cover brightness-[0.95]"
                        priority={index === 0}
                    />
                    {/* Layered overlays for premium glassmorphic feel and text readability */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fafbfc] via-[#fafbfc]/90 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fafbfc] via-transparent to-transparent opacity-80" />
                </div>
            ))}
        </div>
    );
}
