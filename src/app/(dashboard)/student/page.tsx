
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PenLine, FileText, CheckCircle } from "lucide-react"

export default function StudentDashboard() {
    const chapters = [
        { id: 1, title: "Introduction", status: "Completed", progress: 100 },
        { id: 2, title: "Literature Review", status: "In Progress", progress: 60 },
        { id: 3, title: "Methodology", status: "Not Started", progress: 0 },
        { id: 4, title: "Data Analysis", status: "Not Started", progress: 0 },
        { id: 5, title: "Conclusion", status: "Not Started", progress: 0 },
    ]

    const overallProgress = chapters.reduce((acc, curr) => acc + curr.progress, 0) / chapters.length

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Final Year Project</h1>
                    <p className="text-gray-500 mt-2">B.Sc. Computer Science - May 2026</p>
                </div>
                <Button asChild>
                    <Link href="/student/chapter-writer">
                        <PenLine className="mr-2 h-4 w-4" />
                        Continue Writing
                    </Link>
                </Button>
            </div>

            {/* Overview Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-700">Project Progress</h2>
                    <span className="text-indigo-600 font-bold">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-50 p-2 rounded-md">
                                <FileText className="h-6 w-6 text-indigo-600" />
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${chapter.status === "Completed" ? "bg-green-100 text-green-700" :
                                chapter.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-500"
                                }`}>
                                {chapter.status}
                            </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Chapter {chapter.id}: {chapter.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">Draft and refine your project content.</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Last updated: 2 days ago</span>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/student/chapter-writer?chapter=${chapter.id}`}>
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
