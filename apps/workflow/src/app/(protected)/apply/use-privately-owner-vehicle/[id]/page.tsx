import ReadOnlyRendererRevisions from "@/components/apply/parts/ReadOnlyRenderer";

import { usePrivatelyOwnerVehicleDefinition } from "@/features/apply/use-privately-owner-vehicle/definition";
import { usePrivatelyOwnerVehicleSchema, type UsePrivatelyOwnerVehicleInput } from "@/features/apply/use-privately-owner-vehicle/zod";

import { getApplicationById } from '@/lib/actions/apply/application';

import { ApplicationRevisionType } from "@/schemas/apply/applicationRevisionSchema";
import { AttachmentType } from "@/schemas/approval/attachmentSchema";

import AttachmentSectionReadOnly from "@/features/apply/use-privately-owner-vehicle/sections/AttachmentSectionReadOnly";

type Props = {
    params: Promise<{
        id: string
    }>;
};

import ApproverArea from "@/components/apply/parts/ApproverArea";
import ApplyBreadcrumbs from "@/components/apply/parts/ApplyBreadcrumbs";
import { ApplicationDeleteButton } from "@/components/apply/buttons/ApplicationDeleteButton";

export default async function UsePrivatelyOwnerVehicleDetailPage({ params }: Props) {
    const { id } = await params;
    const { data } = await getApplicationById(id);
    if(!data) return;

    const revisionsRaw = data?.application_revisions ?? [];

    // ✅ “関数を渡さない”ために Server で正規化
    const revisions = revisionsRaw
        .map((r: ApplicationRevisionType) => {
            const payload = r.payload ?? {};
            const parsed = usePrivatelyOwnerVehicleSchema.safeParse(payload);
            return {
                id: String(r.id),
                revision_no: Number(r.revision_no),
                submitted_at: r.submitted_at ?? null,
                payload: (parsed.success ? parsed.data : payload) as UsePrivatelyOwnerVehicleInput,

                // 表示用
                // created_at: r.created_at,
                author_label: data?.author?.staff.name ?? null,
                department_label: data?.department.name ?? null,
                attachments: r.attachments?.map((x) => x.attachment).filter((x): x is AttachmentType => x != null) ?? [],
            };
        })
        .sort((a, b) => a.revision_no - b.revision_no);


    const APPLY_NAME = "個人所有車使用許可申請";

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-between" }}>
            <ApplyBreadcrumbs
                items={[
                    { title: APPLY_NAME, href: '/apply/use-privately-owner-vehicle' },
                    { title: "申請書 詳細" },
                ]}
                />
            <ApplicationDeleteButton application={data} />
        </div>
        <ApproverArea application={data} />
        <ReadOnlyRendererRevisions<UsePrivatelyOwnerVehicleInput>
            fields={usePrivatelyOwnerVehicleDefinition.fields}
            revisions={revisions}
            created_at={data.created_at}
            slots={{
                license: (
                    <AttachmentSectionReadOnly type="免許証" revisions={revisions} />
                ),
                inspection: (
                    <AttachmentSectionReadOnly type="車検証" revisions={revisions} />
                ),
                insurance: (
                    <AttachmentSectionReadOnly type="任意保険証" revisions={revisions} />
                ),
            }}
        />
        </>
    );
}
