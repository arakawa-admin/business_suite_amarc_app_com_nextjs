"use client";

import { useAuth } from "@/contexts/AuthContext";

import DynamicFormCore from "../_core/DynamicFormCore";
import { useGoogleAccountDefinition } from "./definition";
import { useGoogleAccountDefaults } from "./defaults";
import { useGoogleAccountSchema, type UseGoogleAccountInput } from "./zod";

type Props = {
    onSubmit: (values: UseGoogleAccountInput) => Promise<void>;
};

export default function UseGoogleAccountForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...useGoogleAccountDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<UseGoogleAccountInput>
            definition={useGoogleAccountDefinition}
            schema={useGoogleAccountSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            >
        </DynamicFormCore>
    );
}
