"use client";

import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    softDeletePermitSchema,
    type SoftDeletePermitFormValues,
} from "../schemas/deletePermitSchema";
import { softDeletePermitAction } from "../actions/permitDeleteActions";
import TextareaInputField from "@ui/form/TextareaInputField";

type Props = {
    permitId: string;
};

export function PermitDeleteForm({ permitId }: Props) {
    const methods = useForm<SoftDeletePermitFormValues>({
        resolver: zodResolver(softDeletePermitSchema),
        defaultValues: {
            permitId,
            deleteReason: "",
        },
    });

    const [state, setState] = useState<{
        ok: boolean;
        message: string;
    } | null>(null);
    const [isPending, startTransition] = useTransition();

    const onSubmit = methods.handleSubmit((values) => {
        const ok = window.confirm("この許認可を削除しますか？");
        if (!ok) return;

        startTransition(async () => {
            const result = await softDeletePermitAction(values);
            setState(result);
        });
    });

    return (
        <FormProvider {...methods}>
            <Card>
                <CardContent>
                    <Stack spacing={2} component="form" onSubmit={onSubmit}>
                        <Typography variant="h6" fontWeight={700}>
                            許認可の削除
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            削除すると通常一覧には表示されなくなります。必要に応じて後から復元できます。
                        </Typography>

                        {state && (
                            <Alert severity={state.ok ? "success" : "error"}>
                                {state.message}
                            </Alert>
                        )}

                        <TextareaInputField
                            name="deleteReason"
                            label="削除理由"
                            minRows={3}
                        />

                        <Box>
                            <Button
                                type="submit"
                                color="error"
                                variant="contained"
                                disabled={isPending}
                            >
                                削除する
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </FormProvider>
    );
}
