
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function SupervisorDashboard() {
    const students = [
        { id: 101, name: "John Doe", project: "AI in Healthcare", status: "Review Needed", lastUpdate: "1 hour ago" },
        { id: 102, name: "Jane Smith", project: "IoT Agriculture System", status: "Approved", lastUpdate: "1 day ago" },
        { id: 103, name: "Alice Brown", project: "E-commerce Recommendation", status: "Waiting for Student", lastUpdate: "3 days ago" },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
                    <p className="text-gray-500 mt-2">Manage student projects and reviews.</p>
                </div>
                <Button>
                    <Link href="/supervisor/invite">Invite Students</Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Students</p>
                        <h3 className="text-2xl font-bold">12</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Review</p>
                        <h3 className="text-2xl font-bold">3</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Approved Chapters</p>
                        <h3 className="text-2xl font-bold">28</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-full text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Overdue Drafts</p>
                        <h3 className="text-2xl font-bold">2</h3>
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Student Submissions</h2>
                    <Input placeholder="Search students..." className="w-64" />
                </div>
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-gray-500 uppercase text-xs font-medium">
                        <tr>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Project Title</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Last Update</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4">{student.project}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${student.status === "Review Needed" ? "bg-yellow-100 text-yellow-800" :
                                                student.status === "Approved" ? "bg-green-100 text-green-800" :
                                                    "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{student.lastUpdate}</td>
                                <td className="px-6 py-4">
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/supervisor/review/${student.id}`}>Review</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    )
}
