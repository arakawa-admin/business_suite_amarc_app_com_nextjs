"use server";

import { getMasterFormApproversByDeptIdAndFormId } from "@/lib/actions/apply/masterFormApprover";
import { getMasterFormViewersByDeptIdAndFormId } from "@/lib/actions/apply/masterFormViewer";

import { getMasterStatusByCode } from "@/lib/actions/apply/masterStatus";
import { getApplicationById, cancelApplicationById } from "@/lib/actions/apply/application";

import { createApprovalOrder, updateApprovalOrder } from "@/lib/actions/apply/approvalOrder";
import { createApprovalViewer } from "@/lib/actions/apply/approvalViewer";

export async function createApplicationApproversAndViewers({
    application_id,
    department_id,
    apply_form_id
}: {
    application_id: string,
    department_id: string,
    apply_form_id: string
} ){
    try {
        // ** 承認者登録 ** //
        const initial_status_id = await getMasterStatusByCode("pending").then((res) => res.data?.id)
        if(!initial_status_id) return { ok: false as const, error: "初期ステータスを取得できません" }
        const other_status_id = await getMasterStatusByCode("waiting").then((res) => res.data?.id)
        if(!other_status_id) return { ok: false as const, error: "待機ステータスを取得できません" }

        const { data: approvers } = await getMasterFormApproversByDeptIdAndFormId(department_id, apply_form_id);
        if(approvers?.length==0) return { ok: false as const, error: "承認者を取得できず申請できません" }
        // TODO 第一承認者が部門長の場合はここに差し込む
        // TODO master_apply_formにフラグを設ける
        approvers?.map(async (approver, i) => {
            await createApprovalOrder({
                application_id,
                approver_user_id: approver.approver_user_id,
                sequence: approver.sequence,
                status_id: i==0 ? initial_status_id : other_status_id,
            })
        })


        // ** 閲覧者登録 ** //
        const { data: viewers } = await getMasterFormViewersByDeptIdAndFormId(department_id, apply_form_id);
        // if(viewers?.length==0) return { ok: false as const, error: "閲覧者を取得できず申請できません" }
        viewers?.map(async (viewer) => {
            await createApprovalViewer({
                application_id,
                viewer_user_id: viewer.viewer_user_id,
                is_commented: false,
            })
        })
        return { ok: true as const }
    } catch (error) {
        return { ok: false as const, error: `承認及び閲覧者の保存に失敗しました${error}` };
    }
}


export async function cancelApplication(application_id: string){
    try {
        // ** 申請書取り下げ ** //
        await cancelApplicationById(application_id);

        // ** 承認フロー取り下げ ** //
        const res = await getApplicationById(application_id);

        if (!res.ok) return { ok: false as const, error: "申請書の詳細取得に失敗しました" };
        if (!res.data) return { ok: false as const, error: "申請書が見つかりません" };
        const { approval_orders } = res.data;

        const cancelled_status_id = await getMasterStatusByCode("cancelled").then((res) => res.data?.id)
        if(!cancelled_status_id) return { ok: false as const, error: "取消ステータスを取得できません" }

        approval_orders?.map(async (order) => {
            if(['waiting', 'pending', 'return'].includes(order.status.code)) {
                await updateApprovalOrder(
                    order.id,
                    { status_id: cancelled_status_id }
                );
            }
        })
        return { ok: true as const, data: undefined };
    } catch (error) {
        return { ok: false as const, error: `申請書の取り下げに失敗しました${error}` };
    }
}
