"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@mui/material";

import DynamicFormCore from "../_core/DynamicFormCore";
import { usePrivatelyOwnerVehicleDefinition } from "./definition";
import { usePrivatelyOwnerVehicleDefaults } from "./defaults";
import { usePrivatelyOwnerVehicleSchema, type UsePrivatelyOwnerVehicleInput } from "./zod";

type Props = {
    onSubmit: (values: UsePrivatelyOwnerVehicleInput) => Promise<void>;
};

export default function UsePrivatelyOwnerVehicleForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...usePrivatelyOwnerVehicleDefaults,
        author_id: profile.id,
        target_user_id: profile.id
    }

    return (
        <DynamicFormCore<UsePrivatelyOwnerVehicleInput>
            definition={usePrivatelyOwnerVehicleDefinition}
            schema={usePrivatelyOwnerVehicleSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            >
            <Alert
                severity="warning"
                sx={{ mb: 2 }}
                >
                <ul>
                    <li>自動車の整備については日常の点検や手入・整備を確実におこなうこと。</li>
                    <li>
                        【旅費交通費】<span style={{ padding: "0 8px" }}>軽自動車: 燃料費+8円 x 走行距離(km)</span>
                        <span style={{ padding: "0 8px" }}>普通自動車: 燃料費+14円 x 走行距離(km)</span>
                    </li>
                </ul>
            </Alert>
        </DynamicFormCore>
    );
}
