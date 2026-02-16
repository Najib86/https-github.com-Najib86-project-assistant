import { redirect } from "next/navigation";

export default async function ChapterIndexPage(props: { params: Promise<{ projectId: string }> }) {
    const params = await props.params;
    redirect(`/student/project/${params.projectId}`);
}
