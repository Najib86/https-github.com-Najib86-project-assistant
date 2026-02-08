
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BookOpen, FolderOpen, PenTool, MessageSquare, Settings } from "lucide-react"

const sidebarItems = [
    { href: "/student", icon: FolderOpen, label: "Projects" },
    { href: "/student/chapter-writer", icon: PenTool, label: "Chapter Writer" },
    { href: "/student/questionnaire", icon: MessageSquare, label: "Questionnaire" },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r px-4 py-6 hidden md:block">
                <h1 className="text-xl font-bold mb-8 px-2 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                    ProjectAssistant
                </h1>
                <nav className="space-y-2">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                                // Add active state logic here if needed
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t">
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
                        >
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
