
"use client";

import { useState, useEffect } from "react";
import {
    X, FileText, Download, Loader2,
    Printer, Copy, Check, AlertCircle,
    ShieldCheck, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateNOUProject, ValidationResult } from "@/lib/validations/nou-project";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";

interface Chapter {
    chapter_id: number;
    title: string | null;
    chapterNumber: number;
    content: string | null;
    status: string;
}

interface Project {
    project_id: number;
    title: string;
    chapters: Chapter[];
}

interface Props {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportPreviewModal({ project, isOpen, onClose }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPdfExporting, setIsPdfExporting] = useState(false);
    const [isBatchExporting, setIsBatchExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [copied, setCopied] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [showValidation, setShowValidation] = useState(false);

    useEffect(() => {
        if (isOpen && project) {
            setValidation(validateNOUProject(project));
        }
    }, [isOpen, project]);

    if (!isOpen) return null;

    const sortedChapters = [...project.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

    const handleDownload = () => {
        setIsDownloading(true);
        window.location.href = `/api/export/docx?projectId=${project.project_id}`;
        setTimeout(() => setIsDownloading(false), 2000);
    };

    const handlePdfExport = async (returnBlob = false) => {
        if (!returnBlob) setIsPdfExporting(true);
        const element = document.querySelector(".printable") as HTMLElement;
        if (!element) return null;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            if (returnBlob) {
                return pdf.output("blob");
            }

            pdf.save(`${project.title.replace(/ /g, "_")}.pdf`);
            return null;
        } catch (error) {
            console.error("PDF Export failed:", error);
            return null;
        } finally {
            if (!returnBlob) setIsPdfExporting(false);
        }
    };

    const handleBatchExport = async () => {
        setIsBatchExporting(true);
        setExportProgress(10);

        try {
            const zip = new JSZip();
            const fileName = project.title.replace(/ /g, "_");

            // 1. Generate PDF
            setExportProgress(30);
            const pdfBlob = await handlePdfExport(true);
            if (pdfBlob) {
                zip.file(`${fileName}.pdf`, pdfBlob);
            }

            // 2. Fetch Word Doc
            setExportProgress(60);
            const wordResponse = await fetch(`/api/export/docx?projectId=${project.project_id}`);
            if (wordResponse.ok) {
                const wordBlob = await wordResponse.blob();
                zip.file(`${fileName}.docx`, wordBlob);
            }

            // 3. Document structure as JSON (for backup/template)
            setExportProgress(80);
            zip.file(`${fileName}_structure.json`, JSON.stringify(project, null, 2));

            // Generate ZIP
            setExportProgress(90);
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}_package.zip`;
            link.click();
            window.URL.revokeObjectURL(url);

            setExportProgress(100);
        } catch (error) {
            console.error("Batch Export failed:", error);
        } finally {
            setTimeout(() => {
                setIsBatchExporting(false);
                setExportProgress(0);
            }, 1000);
        }
    };

    const handleSaveTemplate = async () => {
        setIsSavingTemplate(true);
        try {
            const response = await fetch("/api/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${project.title} Structure`,
                    description: `Template based on ${project.title}`,
                    type: "project",
                    content: {
                        title: project.title,
                        chapters: project.chapters.map(c => ({
                            title: c.title,
                            chapterNumber: c.chapterNumber
                        }))
                    }
                }),
            });

            if (response.ok) {
                alert("Template saved successfully!");
            }
        } catch (error) {
            console.error("Template save failed:", error);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleCopy = () => {
        const fullContent = sortedChapters.map(c => `Chapter ${c.chapterNumber}: ${c.title || ""}\n\n${c.content || ""}`).join("\n\n---\n\n");
        navigator.clipboard.writeText(fullContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        const printContent = document.querySelector(".printable")?.innerHTML;
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${project.title}</title>
                        <style>
                            @page { margin: 2.54cm; }
                            body { 
                                font-family: 'Times New Roman', serif; 
                                font-size: 12pt; 
                                line-height: 2.0; 
                                color: black;
                                margin: 0;
                                padding: 2cm;
                            }
                            h1 { text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 2em; }
                            h2 { font-size: 14pt; margin-top: 2em; border-bottom: 2px solid #000; padding-bottom: 0.5em; text-transform: uppercase; }
                            h3 { font-size: 12pt; margin-top: 1.5em; }
                            p { margin-bottom: 1em; text-align: justify; }
                            .section-break { page-break-before: always; }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                        <script>
                            window.onload = () => {
                                window.print();
                                window.onafterprint = () => window.close();
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl h-[95vh] bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="p-6 md:px-10 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Project Export Center</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">NOU Guidelines Compliant</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveTemplate}
                            disabled={isSavingTemplate}
                            className="rounded-xl flex gap-2 border-indigo-200 text-indigo-600"
                        >
                            {isSavingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                            Save Structure as Template
                        </Button>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
                        <Button
                            variant={showValidation ? "default" : "outline"}
                            onClick={() => setShowValidation(!showValidation)}
                            className="rounded-xl flex gap-2"
                        >
                            {validation?.isValid ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                            Academic Audit
                        </Button>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className="rounded-xl"
                            title="Copy text"
                        >
                            {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrint}
                            className="rounded-xl"
                            title="Print"
                        >
                            <Printer className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-xl"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar / Validation Report */}
                    {showValidation && (
                        <div className="w-80 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto p-6 animate-in slide-in-from-left duration-300">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Academic Audit</h3>

                            <div className="space-y-6">
                                {/* Status Card */}
                                <div className={`p-4 rounded-2xl border ${validation?.isValid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {validation?.isValid ? <ShieldCheck className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                        <span className="font-black uppercase text-[10px] tracking-wider">Status</span>
                                    </div>
                                    <p className="text-sm font-bold">{validation?.isValid ? "Compliant with NOU Guide" : "Action Needed"}</p>
                                </div>

                                {/* Metric: Page Count */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Estimated Pages</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black">{validation?.metrics.totalPageEstimate || 0}</span>
                                        <span className="text-[10px] font-bold text-gray-400">Target: 40-60</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${(validation?.metrics.totalPageEstimate || 0) >= 40 && (validation?.metrics.totalPageEstimate || 0) <= 60 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                            style={{ width: `${Math.min(((validation?.metrics.totalPageEstimate || 0) / 60) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Metric: Abstract */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Abstract Words</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black">{validation?.metrics.abstractWordCount || 0}</span>
                                        <span className="text-[10px] font-bold text-gray-400">Max: 400</span>
                                    </div>
                                    <p className={`text-[10px] font-bold mt-1 ${(validation?.metrics.abstractWordCount || 0) > 400 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {(validation?.metrics.abstractWordCount || 0) > 400 ? "Too long" : "Length OK"}
                                    </p>
                                </div>

                                {/* Errors/Warnings */}
                                {((validation?.errors?.length || 0) > 0 || (validation?.warnings?.length || 0) > 0) && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                        {validation?.errors?.map((err, i) => (
                                            <div key={i} className="flex gap-2 text-xs text-red-600 font-bold leading-tight">
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                <span>{err}</span>
                                            </div>
                                        ))}
                                        {validation?.warnings?.map((warn, i) => (
                                            <div key={i} className="flex gap-2 text-xs text-amber-600 font-bold leading-tight">
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                <span>{warn}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-20 bg-gray-50/30 dark:bg-gray-900/30">
                        <div className="max-w-[800px] mx-auto bg-white dark:bg-gray-900 shadow-xl shadow-indigo-50/20 dark:shadow-none border border-gray-100 dark:border-gray-800 p-12 md:p-20 rounded-[2rem] min-h-screen printable">
                            {/* Document Mockup */}
                            <div className="text-center mb-24 space-y-8">
                                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                                    {project.title}
                                </h1>
                                <div className="h-1.5 w-24 bg-indigo-600 mx-auto rounded-full" />
                                <div className="space-y-1">
                                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Academic Research Thesis</p>
                                    <p className="text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest">National Open University of Nigeria</p>
                                </div>
                            </div>

                            {/* Chapters Content */}
                            <div className="space-y-32">
                                {sortedChapters.map(chapter => (
                                    <div key={chapter.chapter_id} className="space-y-10 group">
                                        <div className="text-center space-y-2">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Chapter {chapter.chapterNumber}</p>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                                {chapter.title || "Untitled"}
                                            </h2>
                                        </div>

                                        {chapter.content ? (
                                            <div
                                                className="prose prose-indigo dark:prose-invert max-w-none prose-p:leading-[2.0] prose-p:text-gray-700 dark:prose-p:text-gray-300 font-serif text-lg text-justify"
                                                dangerouslySetInnerHTML={{ __html: chapter.content }}
                                            />
                                        ) : (
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
                                                <p className="text-sm text-gray-400 font-bold italic">This chapter is currently empty.</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-40 pt-10 border-t border-gray-100 dark:border-gray-800 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
                                Faculty of Social Sciences Guide Applied
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:px-10 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 z-10">
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
                            Exported files include professional formatting and pagination.
                        </p>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto items-center">
                        {isBatchExporting && (
                            <div className="flex flex-col items-end mr-4 min-w-[150px]">
                                <span className="text-[10px] font-black uppercase text-indigo-600 mb-1">Building Package: {exportProgress}%</span>
                                <div className="w-32 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                                </div>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            onClick={handleBatchExport}
                            disabled={isBatchExporting}
                            className="flex-1 sm:flex-none rounded-xl font-bold h-14 px-6 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm md:text-base"
                        >
                            {isBatchExporting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Zipping...</>
                            ) : (
                                <><Download className="mr-2 h-4 w-4" /> Download Package (ZIP)</>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handlePdfExport(false)}
                            disabled={isPdfExporting || isBatchExporting}
                            className="flex-1 sm:flex-none rounded-xl font-bold h-14 px-6 border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm md:text-base"
                        >
                            {isPdfExporting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rendering PDF...</>
                            ) : (
                                <><Eye className="mr-2 h-4 w-4" /> PDF Only</>
                            )}
                        </Button>

                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading || isBatchExporting}
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black h-14 px-10 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98] text-sm md:text-base"
                        >
                            {isDownloading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</>
                            ) : (
                                <><Download className="mr-2 h-4 w-4" /> Word Only</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
