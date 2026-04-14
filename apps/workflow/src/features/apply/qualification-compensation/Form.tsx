"use client";
import { useAuth } from "@/contexts/AuthContext";
import SkillsSection from "./sections/SkillsSection";

import DynamicFormCore from "../_core/DynamicFormCore";
import { qualificationCompensationDefinition } from "./definition";
import { qualificationCompensationDefaults } from "./defaults";
import { qualificationCompensationSchema, type QualificationCompensationInput } from "./zod";

type Props = {
    onSubmit: (values: QualificationCompensationInput) => Promise<void>;
};

export default function QualificationCompensationForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...qualificationCompensationDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<QualificationCompensationInput>
            definition={qualificationCompensationDefinition}
            schema={qualificationCompensationSchema}
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
