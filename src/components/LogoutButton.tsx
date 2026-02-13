"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
    variant?: "default" | "outline" | "ghost";
    showIcon?: boolean;
    children?: React.ReactNode;
}

export function LogoutButton({ 
    variant = "ghost", 
    showIcon = true,
    children = "Sign Out"
}: LogoutButtonProps) {
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/login" });
    };

    return (
        <Button 
            variant={variant} 
            onClick={handleLogout}
            className="gap-2"
        >
            {showIcon && <LogOut className="h-4 w-4" />}
            {children}
        </Button>
    );
}
