
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, ExternalLink, Plus, Loader2 } from "lucide-react";

interface Paper {
    paperId: string;
    title: string;
    year: number;
    url: string;
    abstract: string;
    authors: { name: string }[];
}

interface Props {
    projectId: number;
    initialQuery?: string;
    onAddCitation?: (citation: any) => void;
}

export default function LiteratureDiscovery({ projectId, initialQuery = "", onAddCitation }: Props) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearching(true);
        try {
            const res = await fetch(`/api/literature/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (res.ok && data.data) {
                setResults(data.data);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToReferences = (paper: Paper) => {
        if (onAddCitation) {
            const citation = {
                title: paper.title,
                author: paper.authors.map(a => a.name).join(", "),
                year: paper.year?.toString() || new Date().getFullYear().toString(),
                url: paper.url,
                source: "Semantic Scholar"
            };
            onAddCitation(citation);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Research Assistant</h2>
                    <p className="text-sm text-gray-500">Find relevant papers for your project</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        placeholder="Search for topics, keywords..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={loading} className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
            </form>

            <div className="space-y-4">
                {searching && !loading && results.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">No papers found. Try simpler keywords.</p>
                )}

                {results.map((paper) => (
                    <div key={paper.paperId} className="group p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">
                                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                        {paper.title}
                                        <ExternalLink className="h-3 w-3 opacity-50" />
                                    </a>
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">
                                    {paper.authors?.slice(0, 3).map(a => a.name).join(", ")} {paper.authors?.length > 3 ? "et al." : ""} • {paper.year}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">{paper.abstract}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToReferences(paper)}
                                className="shrink-0 h-8 gap-1.5 text-xs font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
