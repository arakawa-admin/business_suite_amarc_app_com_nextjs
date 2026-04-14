"use client";
import { Button } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";

import DynamicFormCore from "../_core/DynamicFormCore";
import { reEmploymentDefinition } from "./definition";
import { reEmploymentDefaults } from "./defaults";
import { reEmploymentSchema, type ReEmploymentInput } from "./zod";

import AgreeField from "@ui/form/AgreeField";

type Props = {
    onSubmit: (values: ReEmploymentInput) => Promise<void>;
};

export default function ReEmploymentForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...reEmploymentDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<ReEmploymentInput>
            definition={reEmploymentDefinition}
            schema={reEmploymentSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            slots={{
                agreeTerms: (
                    <AgreeField name="agreeTerms">
                        <Button target="_blank" rel="noreferrer"
                            href="https://drive.google.com/file/d/0B9BJnpRX6pAgS3NVRXJMLTAyams">
                            規程規定（対象者は必ず一読ください）
                        </Button>
                        に同意します。再雇用の条件等については、会社の定めるところに合意し、会社の規則を遵守し誠実に勤務します。また、配置転換または短時間勤務に応じることや、必要な場合には会社が指定する医療機関の診断書の提出に応じることを誓います。
                    </AgreeField>
                ),
            }}

            // TODO 申請後に総務が書く「健康状態」とか 要チェック？
            >
        </DynamicFormCore>
    );
}
