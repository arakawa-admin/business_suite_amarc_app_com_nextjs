"use client";
import { useAuth } from "@/contexts/AuthContext";
import SkillsSection from "./sections/SkillsSection";

import DynamicFormCore from "../_core/DynamicFormCore";
import { endTrialEmploymentDefinition } from "./definition";
import { endTrialEmploymentDefaults } from "./defaults";
import { endTrialEmploymentSchema, type EndTrialEmploymentInput } from "./zod";

type Props = {
    onSubmit: (values: EndTrialEmploymentInput) => Promise<void>;
};

export default function EndTrialEmploymentForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...endTrialEmploymentDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<EndTrialEmploymentInput>
            definition={endTrialEmploymentDefinition}
            schema={endTrialEmploymentSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            slots={{
                skills: <SkillsSection />,
            }}
            >
        </DynamicFormCore>
    );
}
