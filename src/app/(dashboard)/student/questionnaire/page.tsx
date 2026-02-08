
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash, GripVertical, CheckCircle } from "lucide-react"

export default function QuestionnaireBuilder() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Research Questionnaire</h1>
                    <p className="text-gray-500 mt-2">Design your data collection instrument.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline">
                        Save Draft
                    </Button>
                    <Button>
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Demographics Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Section A: Demographics</h2>
                <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-md">
                        <span className="font-semibold w-8 text-center text-gray-400">1</span>
                        <span className="flex-1">Gender (Male / Female)</span>
                        <Button size="icon" variant="ghost" className="h-4 w-4 text-red-500">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-md">
                        <span className="font-semibold w-8 text-center text-gray-400">2</span>
                        <span className="flex-1">Age Range</span>
                        <Button size="icon" variant="ghost" className="h-4 w-4 text-red-500">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-indigo-600 hover:text-indigo-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Demographic Field
                    </Button>
                </div>
            </div>

            {/* Research Questions Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Section B: Research Questions (Likert Scale)</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white border border-l-4 border-l-indigo-500 p-4 rounded-md shadow-sm">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">I find it difficult to maintain academic tone.</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 uppercase">
                                <span className="bg-gray-100 px-2 py-1 rounded">Strongly Agree</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">Agree</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">Disagree</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">Strongly Disagree</span>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 bg-white border border-gray-200 p-4 rounded-md shadow-sm">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">AI tools help structure my thoughts better.</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 uppercase">
                                <span className="bg-gray-100 px-2 py-1 rounded">Strongly Agree</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">Agree</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">Disagree</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">Strongly Disagree</span>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex justify-center p-4 border border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                        <div className="text-center">
                            <PlusCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500 font-medium">Add New Question</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
