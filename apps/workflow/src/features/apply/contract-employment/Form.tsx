"use client";

import { useAuth } from "@/contexts/AuthContext";
import SkillsSection from "./sections/SkillsSection";

import DynamicFormCore from "../_core/DynamicFormCore";
import { contractEmploymentDefinition } from "./definition";
import { contractEmploymentDefaults } from "./defaults";
import { contractEmploymentSchema, type ContractEmploymentInput } from "./zod";

type Props = {
    onSubmit: (values: ContractEmploymentInput) => Promise<void>;
};

export default function ContractEmploymentForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...contractEmploymentDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<ContractEmploymentInput>
            definition={contractEmploymentDefinition}
            schema={contractEmploymentSchema}
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
