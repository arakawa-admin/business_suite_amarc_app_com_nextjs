"use client";

import { useAuth } from "@/contexts/AuthContext";
import BreaktimesSection from "./sections/BreaktimesSection";
import SkillsSection from "./sections/SkillsSection";

import DynamicFormCore from "../_core/DynamicFormCore";
import { partTimeEmploymentDefinition } from "./definition";
import { partTimeEmploymentDefaults } from "./defaults";
import { partTimeEmploymentSchema, type PartTimeEmploymentInput } from "./zod";

type Props = {
    onSubmit: (values: PartTimeEmploymentInput) => Promise<void>;
};

export default function PartTimeEmploymentForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...partTimeEmploymentDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<PartTimeEmploymentInput>
            definition={partTimeEmploymentDefinition}
            schema={partTimeEmploymentSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            slots={{
                breaktimes: <BreaktimesSection />,
                skills: <SkillsSection />,
            }}
            >
        </DynamicFormCore>
    );
}
