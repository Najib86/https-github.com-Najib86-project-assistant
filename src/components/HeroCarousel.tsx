
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const carouselItems = [
    {
        id: 1,
        image: "/hero-bg-1.png",
        alt: "Student focused on digital research",
    },
    {
        id: 2,
        image: "/hero-bg-2.png",
        alt: "Modern academic workspace",
    },
    {
        id: 3,
        image: "/hero-bg-3.png",
        alt: "Academic transformation and success",
    },
    {
        id: 4,
        image: "/nigerian_students_collaborating_1771014595962.png",
        alt: "Collaborative research session",
    },
    {
        id: 5,
        image: "/nigerian_research_students_library_1771014722629.png",
        alt: "Library research and study",
    }
];

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    useEffect(() => {
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
                        className="object-cover brightness-100"
                        priority={index === 0}
                    />
                    {/* Layered overlays for premium glassmorphic feel and text readability */}
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fafbfc]/90 via-[#fafbfc]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fafbfc] via-transparent to-transparent opacity-60" />
                </div>
            ))}
        </div>
    );
}
