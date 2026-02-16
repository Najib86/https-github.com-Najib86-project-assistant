import Image from "next/image";
import { cn } from "@/lib/utils";

interface LoadingLogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
}

export function LoadingLogo({ className, size = 80, showText = true }: LoadingLogoProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className="relative">
                {/* Pulsing glow background */}
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse" />

                {/* Animated Logo */}
                <div className="relative animate-[bounce_2s_infinite]">
                    <Image
                        src="/logo.png"
                        alt="Loading..."
                        width={size}
                        height={size}
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                </div>
            </div>

            {showText && (
                <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-bold text-indigo-900 animate-pulse tracking-wide">PROCESSING</p>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
