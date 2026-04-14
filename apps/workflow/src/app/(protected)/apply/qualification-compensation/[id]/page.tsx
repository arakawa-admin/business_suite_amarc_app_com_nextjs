import ReadOnlyRendererRevisions from "@/components/apply/parts/ReadOnlyRenderer";

import { qualificationCompensationDefinition } from "@/features/apply/qualification-compensation/definition";
import { qualificationCompensationSchema, type QualificationCompensationInput } from "@/features/apply/qualification-compensation/zod";

import { getApplicationById } from '@/lib/actions/apply/application';

import { ApplicationRevisionType } from "@/schemas/apply/applicationRevisionSchema";
import { AttachmentType } from "@/schemas/approval/attachmentSchema";

import SkillsSectionReadOnly from "@/features/apply/qualification-compensation/sections/SkillsSectionReadOnly";

type Props = {
    params: Promise<{
        id: string
    }>;
};
import ApproverArea from "@/components/apply/parts/ApproverArea";
import ApplyBreadcrumbs from "@/components/apply/parts/ApplyBreadcrumbs";
import { ApplicationDeleteButton } from "@/components/apply/buttons/ApplicationDeleteButton";

export default async function QualificationCompensationDetailPage({ params }: Props) {
    const { id } = await params;
    const { data } = await getApplicationById(id);
    if(!data) return;

    const revisionsRaw = data?.application_revisions ?? [];

    // ✅ “関数を渡さない”ために Server で正規化
    const revisions = revisionsRaw
        .map((r: ApplicationRevisionType) => {
            const payload = r.payload ?? {};
            const parsed = qualificationCompensationSchema.safeParse(payload);
            return {
                id: String(r.id),
                revision_no: Number(r.revision_no),
                submitted_at: r.submitted_at ?? null,
                payload: (parsed.success ? parsed.data : payload) as QualificationCompensationInput,

                // 表示用
                // created_at: r.created_at,
                author_label: data?.author?.staff.name ?? null,
                department_label: data?.department.name ?? null,
                attachments: r.attachments?.map((x) => x.attachment).filter((x): x is AttachmentType => x != null) ?? [],
            };
        })
        .sort((a, b) => a.revision_no - b.revision_no);

    type RevisionAttachment = {
        id: string;
        attachment: AttachmentType;
    };
    const revisionAttachments: RevisionAttachment[] =
        (revisions
            .flatMap((r) => (r.payload as any)?.revision_attachments ?? [])
            .map((ra: any) => {
                if (!ra?.id || !ra?.attachment) return null;
                return { id: ra.id, attachment: ra.attachment as AttachmentType };
            })
            .filter((v): v is RevisionAttachment => v != null)) ?? [];

    const APPLY_NAME = "変更届";

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-between" }}>
            <ApplyBreadcrumbs
                items={[
                    { title: APPLY_NAME, href: '/apply/qualification-compensation' },
                    { title: "申請書 詳細" },
                ]}
                />
            <ApplicationDeleteButton application={data} />
        </div>
        <ApproverArea application={data} />
        <ReadOnlyRendererRevisions<QualificationCompensationInput>
            fields={qualificationCompensationDefinition.fields}
            revisions={revisions}
            created_at={data.created_at}
            slots={{
                skills: (
                    <SkillsSectionReadOnly
                        skills={revisions.map(r => r.payload.skills).filter(Boolean)[0]}
                        revision_attachments={revisionAttachments}
                        />
                ),
            }}
        />
        </>
    );
}
