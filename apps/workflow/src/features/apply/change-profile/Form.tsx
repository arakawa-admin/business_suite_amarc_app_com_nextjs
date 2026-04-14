"use client";

import { useAuth } from "@/contexts/AuthContext";

import EmergencyContactsSection from "./sections/EmergencyContactsSection";
import DependentsSection from "./sections/DependentsSection";

import DynamicFormCore from "../_core/DynamicFormCore";
import { changeProfileDefinition } from "./definition";
import { changeProfileDefaults } from "./defaults";
import { changeProfileSchema, type ChangeProfileInput } from "./zod";

type Props = {
    onSubmit: (values: ChangeProfileInput) => Promise<void>;
};

export default function ChangeProfileForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...changeProfileDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<ChangeProfileInput>
            definition={changeProfileDefinition}
            schema={changeProfileSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            slots={{
                emergency_contacts: <EmergencyContactsSection />,
                dependents: <DependentsSection />,
            }}
            >
        </DynamicFormCore>
    );
}
