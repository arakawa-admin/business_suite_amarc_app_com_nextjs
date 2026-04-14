"use client";
import { useState, useTransition } from "react";
import { Stack, Button, Grid } from "@mui/material";
import { useForm, FormProvider, FieldValues, DefaultValues, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FormDefinition } from "./types";
import FieldRenderer from "./FieldRenderer";

type Props<T extends FieldValues> = {
    definition: FormDefinition<T>;
    schema: z.ZodSchema<T>;
    defaultValues: DefaultValues<T>;
    onSubmit: (values: T) => Promise<void>;
    submitLabel?: string;
    slots?: Record<string, React.ReactNode>;
    children?: React.ReactNode,
};

import DialogConfirm from '@/components/common/dialogs/DialogConfirm';

export default function DynamicFormCore<T extends FieldValues>({
    definition,
    schema,
    defaultValues,
    onSubmit,
    submitLabel = "申請する",
    slots,
    children,
}: Props<T>) {

    const methods = useForm<T>({
        // @ts-expect-error - zodResolver type inference issue with generic types
        resolver: zodResolver(schema) as Resolver<T, any>,
        defaultValues,
        mode: "onBlur",
        reValidateMode: "onBlur",
    });


    const [pending, start] = useTransition();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState({} as T);
    const openConfirm = methods.handleSubmit(() => {
        const formData = methods.getValues();
        setFormData(formData);
        setConfirmOpen(true);
    });
    const onCancel = () => {
        if (pending) return;
        setConfirmOpen(false);
    }
    const onDone = () => {
        if (!formData) return;

        start(async () => {
            await onSubmit(formData);
            setConfirmOpen(false);
        });
    }

    return (
        <>
        <FormProvider {...methods}>
            <form
                onSubmit={openConfirm}
                // handleSubmit(async () => {
                //     // handleSubmitのdataパラメータは使わず、getValues()を使う
                //     const formData = methods.getValues();
                //     setFormData(formData);
                //     handlePost();
                // })}
                >
                <Stack spacing={3}>
                    <Grid container spacing={3}>
                        {definition.fields.map((f, idx) => (
                            <FieldRenderer<T>
                                // key={String(f.name)}
                                key={idx}
                                field={f as any}
                                disabled={pending}
                                slots={slots}
                            />
                        ))}
                    </Grid>

                    {children}

                    {/* TODO 下書きボタン */}

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={pending}
                        sx={{
                            fontWeight: "bold",
                            fontSize: "1.2em",
                            py: 1
                        }}
                        >
                        {submitLabel}
                    </Button>
                </Stack>
            </form>
        </FormProvider>

        <DialogConfirm
            isOpen={confirmOpen}
            onCancel={onCancel}
            onDone={onDone}
            text="この内容で申請しますか？"
            color = "info"
            okText="申請する"
            />
        </>
    );
}
