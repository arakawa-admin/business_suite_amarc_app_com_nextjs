import ReadOnlyRendererRevisions from "@/components/apply/parts/ReadOnlyRenderer";

import { changeProfileDefinition } from "@/features/apply/change-profile/definition";
import { changeProfileSchema, type ChangeProfileInput } from "@/features/apply/change-profile/zod";

import EmergencyContactsSectionReadOnly from "@/features/apply/change-profile/sections/EmergencyContactsSectionReadOnly";
import DependentsSectionReadOnly from "@/features/apply/change-profile/sections/DependentsSectionReadOnly";

import { getApplicationById } from '@/lib/actions/apply/application';

type Props = {
    params: Promise<{
        id: string
    }>;
};
import ApproverArea from "@/components/apply/parts/ApproverArea";
import ApplyBreadcrumbs from "@/components/apply/parts/ApplyBreadcrumbs";
import { ApplicationDeleteButton } from "@/components/apply/buttons/ApplicationDeleteButton";

export default async function ChangeProfileDetailPage({ params }: Props) {
    const { id } = await params;
    const { data } = await getApplicationById(id);
    if(!data) return;

    const revisionsRaw = data?.application_revisions ?? [];

    // ✅ “関数を渡さない”ために Server で正規化
    const revisions = revisionsRaw
        .map((r: any) => {
        const payload = r.payload ?? {};

        // payload を ChangeProfileInput として使いたいなら safeParse 推奨
        const parsed = changeProfileSchema.safeParse(payload);
        return {
            id: String(r.id),
            revision_no: Number(r.revision_no),
            submitted_at: r.submitted_at ?? null,
            payload: (parsed.success ? parsed.data : payload) as ChangeProfileInput,

            // 表示用
            author_label: data?.author?.staff.name ?? null,
            department_label: data?.department.name ?? null,
        };
        })
        .sort((a, b) => a.revision_no - b.revision_no);

    const APPLY_NAME = "変更届";

    return (
        <>
        <div style={{display: "flex", justifyContent: "space-between" }}>
            <ApplyBreadcrumbs
                items={[
                    { title: APPLY_NAME, href: '/apply/change-profile' },
                    { title: "申請書 詳細" },
                ]}
                />
            <ApplicationDeleteButton application={data} />
        </div>
        <ApproverArea application={data} />
        <ReadOnlyRendererRevisions<ChangeProfileInput>
            fields={changeProfileDefinition.fields}
            revisions={revisions}
            created_at={data.created_at}

            slots={{
                emergency_contacts: (
                    <EmergencyContactsSectionReadOnly value={revisions.map(r => r.payload.emergency_contacts).filter(Boolean)[0]} />
                ),
                dependents: (
                    <DependentsSectionReadOnly value={revisions.map(r => r.payload.dependents).filter(Boolean)[0]} />
                ),
            }}
        />
        </>
    );
}
