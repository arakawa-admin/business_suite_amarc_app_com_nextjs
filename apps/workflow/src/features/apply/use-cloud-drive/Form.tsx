"use client";

import { useAuth } from "@/contexts/AuthContext";

import DynamicFormCore from "../_core/DynamicFormCore";
import { useCloudDriveDefinition } from "./definition";
import { useCloudDriveDefaults } from "./defaults";
import { useCloudDriveSchema, type UseCloudDriveInput } from "./zod";

type Props = {
    onSubmit: (values: UseCloudDriveInput) => Promise<void>;
};

export default function UseCloudDriveForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...useCloudDriveDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<UseCloudDriveInput>
            definition={useCloudDriveDefinition}
            schema={useCloudDriveSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            >
        </DynamicFormCore>
    );
}
