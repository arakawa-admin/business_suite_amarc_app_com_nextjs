import ReadOnlyRendererRevisions from "@/components/apply/parts/ReadOnlyRenderer";

import { useGoogleAccountDefinition } from "@/features/apply/use-google-account/definition";
import { useGoogleAccountSchema, type UseGoogleAccountInput } from "@/features/apply/use-google-account/zod";

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

export default async function UseGoogleAccountDetailPage({ params }: Props) {
    const { id } = await params;
    const { data } = await getApplicationById(id);
    if(!data) return;

    const revisionsRaw = data?.application_revisions ?? [];

    // ✅ “関数を渡さない”ために Server で正規化
    const revisions = revisionsRaw
        .map((r: ApplicationRevisionType) => {
            const payload = r.payload ?? {};
            // payload を UseGoogleAccountInput として使いたいなら safeParse 推奨
            const parsed = useGoogleAccountSchema.safeParse(payload);
            return {
                id: String(r.id),
                revision_no: Number(r.revision_no),
                submitted_at: r.submitted_at ?? null,
                payload: (parsed.success ? parsed.data : payload) as UseGoogleAccountInput,

                // 表示用
                // created_at: r.created_at,
                author_label: data?.author?.staff.name ?? null,
                department_label: data?.department.name ?? null,
            };
        })
        .sort((a, b) => a.revision_no - b.revision_no);


    const APPLY_NAME = "googleアカウント個人端末使用申請";

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-between" }}>
            <ApplyBreadcrumbs
                items={[
                    { title: APPLY_NAME, href: '/apply/use-google-account' },
                    { title: "申請書 詳細" },
                ]}
                />
            <ApplicationDeleteButton application={data} />
        </div>
        <ApproverArea application={data} />
        <ReadOnlyRendererRevisions<UseGoogleAccountInput>
            fields={useGoogleAccountDefinition.fields}
            revisions={revisions}
            created_at={data.created_at}
        />
        </>
    );
}
