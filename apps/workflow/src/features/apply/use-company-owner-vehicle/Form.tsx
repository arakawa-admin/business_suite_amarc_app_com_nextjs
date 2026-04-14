"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@mui/material";

import DynamicFormCore from "../_core/DynamicFormCore";
import { useCompanyOwnerVehicleDefinition } from "./definition";
import { useCompanyOwnerVehicleDefaults } from "./defaults";
import { useCompanyOwnerVehicleSchema, type UseCompanyOwnerVehicleInput } from "./zod";

type Props = {
    onSubmit: (values: UseCompanyOwnerVehicleInput) => Promise<void>;
};

export default function UseCompanyOwnerVehicleForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...useCompanyOwnerVehicleDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<UseCompanyOwnerVehicleInput>
            definition={useCompanyOwnerVehicleDefinition}
            schema={useCompanyOwnerVehicleSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            >
            <Alert
                severity="warning"
                sx={{ mb: 2 }}
                >
                <ul>
                    <li>1. 社有車の使用は、申請した本人以外の者に運転させてはならない。</li>
                    <li>2. 社有車に備え付けの日常点検には、使用時の日付、使用者氏名、返却時の走行距離を記入しておくこと。</li>
                    <li>3. 燃料は、満タン状態で借り受け、満タン状態で返却すること。</li>
                </ul>
            </Alert>
        </DynamicFormCore>
    );
}
