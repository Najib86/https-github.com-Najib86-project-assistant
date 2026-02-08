
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="shadow-sm rounded-lg p-2 bg-indigo-50">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email to sign in to your dashboard
                </p>
            </div>
            <div className="w-full space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white"
                        id="email"
                        placeholder="m@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 bg-white"
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
                    />
                </div>
                <Button className="w-full" asChild>
                    <Link href="/student">
                        Sign In with Email
                    </Link>
                </Button>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                    Sign up
                </Link>
            </p>
        </div>
    )
}
