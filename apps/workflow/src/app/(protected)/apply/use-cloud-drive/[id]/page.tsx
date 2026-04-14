import ReadOnlyRendererRevisions from "@/components/apply/parts/ReadOnlyRenderer";

import { useCloudDriveDefinition } from "@/features/apply/use-cloud-drive/definition";
import { useCloudDriveSchema, type UseCloudDriveInput } from "@/features/apply/use-cloud-drive/zod";

import { getApplicationById } from '@/lib/actions/apply/application';
import { ApplicationRevisionType } from "@/schemas/apply/applicationRevisionSchema";

type Props = {
    params: Promise<{
        id: string
    }>;
};

import ApproverArea from "@/components/apply/parts/ApproverArea";
import ApplyBreadcrumbs from "@/components/apply/parts/ApplyBreadcrumbs";
import { ApplicationDeleteButton } from "@/components/apply/buttons/ApplicationDeleteButton";

export default async function UseCloudDriveDetailPage({ params }: Props) {
    const { id } = await params;
    const { data } = await getApplicationById(id);
    if(!data) return;

    const revisionsRaw = data?.application_revisions ?? [];

    // ✅ “関数を渡さない”ために Server で正規化
    const revisions = revisionsRaw
        .map((r: ApplicationRevisionType) => {
            const payload = r.payload ?? {};
            const parsed = useCloudDriveSchema.safeParse(payload);
            return {
                id: String(r.id),
                revision_no: Number(r.revision_no),
                submitted_at: r.submitted_at ?? null,
                payload: (parsed.success ? parsed.data : payload) as UseCloudDriveInput,

                // 表示用
                author_label: data?.author?.staff.name ?? null,
                department_label: data?.department.name ?? null,
            };
        })
        .sort((a, b) => a.revision_no - b.revision_no);


    const APPLY_NAME = "ファイル共有ドライブ使用申請";

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-between" }}>
            <ApplyBreadcrumbs
                items={[
                    { title: APPLY_NAME, href: '/apply/use-cloud-drive' },
                    { title: "申請書 詳細" },
                ]}
                />
            <ApplicationDeleteButton application={data} />
        </div>
        <ApproverArea application={data} />
        <ReadOnlyRendererRevisions<UseCloudDriveInput>
            fields={useCloudDriveDefinition.fields}
            revisions={revisions}
            created_at={data.created_at}
        />
        </>
    );
}
