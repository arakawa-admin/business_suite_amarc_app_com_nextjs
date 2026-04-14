"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Paper, Slider, Typography } from "@mui/material";

import DynamicFormCore from "../_core/DynamicFormCore";
import { seminarReportDefinition } from "./definition";
import { seminarReportDefaults } from "./defaults";
import { seminarReportSchema, type SeminarReportInput } from "./zod";

type Props = {
    onSubmit: (values: SeminarReportInput) => Promise<void>;
};

export default function SeminarReportForm({ onSubmit }: Props) {

    const { profile } = useAuth();
    if(!profile) { return }

    const defaultValues = {
        ...seminarReportDefaults,
        author_id: profile.id
    }

    return (
        <DynamicFormCore<SeminarReportInput>
            definition={seminarReportDefinition}
            schema={seminarReportSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitLabel="申請する"
            slots={{
                point: (
                    <Paper sx={{ p: 3 }} variant="outlined">
                        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                            今回のセミナーは何点でしたか？
                        </Typography>
                        <Slider
                            name={"point"}
                            defaultValue={10}
                            step={1}
                            marks
                            min={0}
                            max={10}
                            valueLabelDisplay="on"
                            />
                        </Paper>
                ),
            }}
            >
        </DynamicFormCore>
    );
}
