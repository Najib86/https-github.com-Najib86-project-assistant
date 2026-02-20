
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, X, CheckCircle2, AlertCircle, Image as ImageIcon, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ResearchUploadFormProps {
    category: "science" | "engineering" | "professional";
    categoryLabel: string;
}

interface UploadedFile {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export default function ResearchUploadForm({ category, categoryLabel }: ResearchUploadFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");

    const [formData, setFormData] = useState({
        researchType: "Experimental",
        abstract: "",
    });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                fetch(`/api/projects?studentId=${user.id}`)
                    .then(res => res.json())
                    .then(data => setProjects(data))
                    .catch(err => console.error("Error fetching projects:", err));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        setUploadingFiles(true);
        const newFiles = [...files];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const data = new FormData();
            data.append("file", file);

            try {
                const res = await fetch("/api/research/upload", {
                    method: "POST",
                    body: data,
                });

                if (res.ok) {
                    const uploaded = await res.json();
                    newFiles.push(uploaded);
                } else {
                    const err = await res.json();
                    alert(`Failed to upload ${file.name}: ${err.error}`);
                }
            } catch (error) {
                console.error(error);
                alert(`Error uploading ${file.name}`);
            }
        }

        setFiles(newFiles);
        setUploadingFiles(false);
        // Reset input
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (status: "draft" | "submitted") => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/research/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category,
                    ...formData,
                    projectId: selectedProjectId || null,
                    status,
                    files
                }),
            });

            if (res.ok) {
                router.push("/student/dashboard");
                router.refresh();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during submission.");
        } finally {
            setIsLoading(false);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
        if (type.includes("pdf")) return <FileText className="h-4 w-4" />;
        if (type.includes("csv") || type.includes("sheet") || type.includes("excel")) return <FileCode className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                        {categoryLabel}
                    </span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Research Submission</h1>
                <p className="text-gray-500 font-medium">Upload your research materials, datasets, and supporting documents.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-100/20 overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Project Linkage */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Link to Project (Optional)</label>
                        <select
                            className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold cursor-pointer text-gray-700"
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value === "" ? "" : parseInt(e.target.value))}
                        >
                            <option value="">Standalone Research (Not linked to a project)</option>
                            {projects.map(p => (
                                <option key={p.project_id} value={p.project_id}>{p.title}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">
                            Linking to a project allows AI to automatically analyze and incorporate this data into your project chapters.
                        </p>
                    </div>

                    {/* Research Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Research Type</label>
                        <select
                            className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold cursor-pointer text-gray-700"
                            value={formData.researchType}
                            onChange={e => setFormData({ ...formData, researchType: e.target.value })}
                        >
                            <option value="Experimental">Experimental</option>
                            <option value="Survey">Survey</option>
                            <option value="Simulation">Simulation</option>
                            <option value="Field Study">Field Study</option>
                        </select>
                    </div>



                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Abstract / Description</label>
                        <textarea
                            className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold placeholder:text-gray-300 min-h-[150px] resize-none"
                            placeholder="Briefly describe your research..."
                            value={formData.abstract}
                            onChange={e => setFormData({ ...formData, abstract: e.target.value })}
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Research Materials & Files</label>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1.5">
                                <AlertCircle className="h-3 w-3" />
                                Multiple files allowed, max 20MB each
                            </span>
                        </div>

                        <div className="relative group">
                            <input
                                type="file"
                                id="research-files"
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                                disabled={uploadingFiles}
                            />
                            <label
                                htmlFor="research-files"
                                className={cn(
                                    "flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-500",
                                    uploadingFiles ? "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed" : "bg-gray-50 border-gray-100 hover:border-indigo-300 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/50"
                                )}
                            >
                                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Upload className={cn("h-8 w-8", uploadingFiles ? "animate-bounce text-gray-400" : "text-indigo-600")} />
                                </div>
                                <p className="text-base font-black text-gray-900">Drag & drop or Click to upload</p>
                                <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">Images, PDFs, Datasets (CSV/XLSX)</p>
                            </label>
                        </div>

                        {/* File Preview List */}
                        {files.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                {files.map((file, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between group border border-gray-100 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm border border-gray-100">
                                                {getFileIcon(file.fileType)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate pr-4">{file.fileName}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    {/* Design Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-40 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Auto-saving local draft
                        </span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            onClick={() => handleSubmit("draft")}
                            disabled={isLoading}
                            className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 hover:bg-white"
                        >
                            Save as Draft
                        </Button>
                        <Button
                            onClick={() => handleSubmit("submitted")}
                            disabled={isLoading || files.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-10 font-black text-sm shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95 flex-1 sm:flex-none"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Submit Research
                                    <CheckCircle2 className="h-5 w-5" />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
