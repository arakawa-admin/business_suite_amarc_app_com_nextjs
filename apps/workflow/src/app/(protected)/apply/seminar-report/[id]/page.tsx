import ReadOnlyRendererRevisions from "@/components/apply/parts/ReadOnlyRenderer";

import { seminarReportDefinition } from "@/features/apply/seminar-report/definition";
import { seminarReportSchema, type SeminarReportInput } from "@/features/apply/seminar-report/zod";

import { getApplicationById } from '@/lib/actions/apply/application';
import { ApplicationRevisionType } from "@/schemas/apply/applicationRevisionSchema";
import { AttachmentType } from "@/schemas/approval/attachmentSchema";

type Props = {
    params: Promise<{
        id: string
    }>;
};

import ApproverArea from "@/components/apply/parts/ApproverArea";
import ApplyBreadcrumbs from "@/components/apply/parts/ApplyBreadcrumbs";
import { ApplicationDeleteButton } from "@/components/apply/buttons/ApplicationDeleteButton";

export default async function SeminarReportDetailPage({ params }: Props) {
    const { id } = await params;
    const { data } = await getApplicationById(id);
    if(!data) return;

    const revisionsRaw = data?.application_revisions ?? [];

    // ✅ “関数を渡さない”ために Server で正規化
    const revisions = revisionsRaw
        .map((r: ApplicationRevisionType) => {
            const payload = r.payload ?? {};
            // payload を SeminarReportInput として使いたいなら safeParse 推奨
            const parsed = seminarReportSchema.safeParse(payload);
            return {
                id: String(r.id),
                revision_no: Number(r.revision_no),
                submitted_at: r.submitted_at ?? null,
                payload: (parsed.success ? parsed.data : payload) as SeminarReportInput,

                // 表示用
                // created_at: r.created_at,
                    // created_at: r.created_at,
                department_label: data?.department.name ?? null,
                attachments: r.attachments?.map((x) => x.attachment).filter((x): x is AttachmentType => x != null) ?? [],
            };
        })
        .sort((a, b) => a.revision_no - b.revision_no);

    const APPLY_NAME = "講演会/セミナー報告書";

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-between" }}>
            <ApplyBreadcrumbs
                items={[
                    { title: APPLY_NAME, href: '/apply/seminar-report' },
                    { title: "申請書 詳細" },
                ]}
                />
            <ApplicationDeleteButton application={data} />
        </div>
        <ApproverArea application={data} />
        <ReadOnlyRendererRevisions<SeminarReportInput>
            fields={seminarReportDefinition.fields}
            revisions={revisions}
            created_at={data.created_at}
        />
        </>
    );
}
