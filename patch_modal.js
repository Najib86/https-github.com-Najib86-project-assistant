const fs = require('fs');
const file = 'src/components/ExportPreviewModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add imports
code = code.replace(
    'Printer, Copy, Check, AlertCircle,', 
    'Printer, Copy, Check, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2,'
);

// Add to Project interface
code = code.replace(
    'title: string;',
    'title: string;\n    academicMetadata?: any;'
);

// Add State and data lists
const stateAndData = `
    const [exportStep, setExportStep] = useState(1);
    const [isSavingMeta, setIsSavingMeta] = useState(false);
    
    // Default form state from metadata
    const meta = project?.academicMetadata || {};
    const [formData, setFormData] = useState({
        fullName: meta?.student?.fullName === "Student Draft" ? "" : (meta?.student?.fullName || ""),
        studentIdNo: meta?.student?.studentIdNo === "N/A" ? "" : (meta?.student?.studentIdNo || ""),
        email: meta?.student?.email || "",
        phone: meta?.student?.phone === "N/A" ? "" : (meta?.student?.phone || ""),
        
        institutionName: meta?.institution?.name === "TBD" ? "" : (meta?.institution?.name || ""),
        faculty: meta?.institution?.faculty === "TBD" ? "" : (meta?.institution?.faculty || ""),
        department: meta?.institution?.department === "TBD" ? "" : (meta?.institution?.department || ""),
        programme: meta?.institution?.programme === "TBD" ? "" : (meta?.institution?.programme || ""),
        graduationYear: meta?.institution?.graduationYear || new Date().getFullYear().toString(),
        
        supervisorTitle: meta?.supervisor?.title || "",
        supervisorName: meta?.supervisor?.name === "Pending" ? "" : (meta?.supervisor?.name || ""),
        supervisorEmail: meta?.supervisor?.email === "N/A" ? "" : (meta?.supervisor?.email || ""),
        
        researchArea: meta?.research?.area || project?.title || "",
        keywords: meta?.research?.keywords?.join(', ') || "",
    });

    const facultiesList = [
        { name: "Faculty of Agricultural Sciences" },
        { name: "Faculty of Arts" },
        { name: "Faculty of Education" },
        { name: "Faculty of Health Sciences" },
        { name: "Faculty of Law" },
        { name: "Faculty of Management Sciences" },
        { name: "Faculty of Sciences" },
        { name: "Faculty of Social Sciences" },
    ];
    
    const departmentsList = [
        { name: "Computer Science" },
        { name: "Information Technology" },
        { name: "Software Engineering" },
        { name: "Business Administration" },
        { name: "Accounting" },
        { name: "Economics" },
        { name: "Mass Communication" },
        { name: "Political Science" },
    ];
    
    const coursesList = [
        "B.Sc. Computer Science",
        "B.Sc. Information Technology",
        "B.Sc. Software Engineering",
        "B.Sc. Business Administration",
    ];

    const universitiesList = [
        { name: "National Open University of Nigeria" },
        { name: "University of Lagos" },
        { name: "Obafemi Awolowo University" },
        { name: "Ahmadu Bello University" },
        { name: "University of Ibadan" },
    ];

    const handleSaveMetadata = async () => {
        setIsSavingMeta(true);
        try {
            const newMeta = {
                student: {
                    fullName: formData.fullName || "Student Draft",
                    studentIdNo: formData.studentIdNo || "N/A",
                    email: formData.email,
                    phone: formData.phone || "N/A"
                },
                institution: {
                    name: formData.institutionName || "TBD",
                    faculty: formData.faculty || "TBD",
                    department: formData.department || "TBD",
                    programme: formData.programme || "TBD",
                    graduationYear: formData.graduationYear || new Date().getFullYear().toString()
                },
                supervisor: {
                    title: formData.supervisorTitle || "",
                    name: formData.supervisorName || "Pending",
                    email: formData.supervisorEmail || "N/A"
                },
                research: {
                    area: formData.researchArea || project?.title || "",
                    keywords: formData.keywords ? formData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []
                }
            };
            
            await fetch(\`/api/projects/\${project.project_id}\`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ academicMetadata: newMeta })
            });
            
            setExportStep(4);
        } catch (e) {
            console.error(e);
            alert("Failed to save details. Skipping to export preview.");
            setExportStep(4);
        } finally {
            setIsSavingMeta(false);
        }
    };
`;

code = code.replace(
    'const [fixMessage, setFixMessage] = useState("");',
    'const [fixMessage, setFixMessage] = useState("");\n' + stateAndData
);

const formUI = `

    if (exportStep < 4) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Finalize Project Details</h2>
                            <p className="text-sm text-gray-400 font-medium">Step {exportStep} of 3 (Optional)</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        {exportStep === 1 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-lg font-bold text-gray-800">Student Information</h3>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
                                    <input
                                        className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Your full legal name"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Student ID / Matric No</label>
                                        <input
                                            className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                            value={formData.studentIdNo}
                                            onChange={(e) => setFormData({ ...formData, studentIdNo: e.target.value })}
                       
