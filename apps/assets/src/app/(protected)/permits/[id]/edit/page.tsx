import { notFound } from "next/navigation";
import { PermitForm } from "@/features/permits/components/permitForm";
import {
    findPermitById,
    findPermitRemindersByPermitId,
} from "@/features/permits/repositories/permitRepository";
import { mapPermitRowToFormValues } from "@/features/permits/mappers/permitMappers";
import { findPermitLabelOptions } from "@/features/permits/repositories/permitRepository";
import { findPermitCategoryList } from "@/features/master/permit-categories/repositories/permitCategoryRepository";
import  { Box, Container, Stack } from "@mui/material";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";

export default async function PermitEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [permit, reminders] = await Promise.all([
        findPermitById(id),
        findPermitRemindersByPermitId(id),
    ]);

    if (!permit) {
        notFound();
    }

    const permitCategoryList = await findPermitCategoryList();
    const categoryNameOptions = permitCategoryList.map((item) => ({ id: item.id, name: item.name }));
    const subjectNameOptions = await findPermitLabelOptions('subject_name');
    const businessNameOptions = await findPermitLabelOptions('business_name');
    const intervalLabelOptions = await findPermitLabelOptions('required_interval_label');

    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <AssetsBreadcrumbs
                        items={[
                            { title: "許認可一覧", href: "/permits" },
                            { title: `詳細 (${permit.permit_number})`, href: `/permits/${id}` },
                            { title: `編集` },
                        ]}
                        />
                        <PermitForm
                            mode="edit"
                            editId={id}
                            defaultValues={mapPermitRowToFormValues(permit, reminders)}
                            categoryNameOptions={categoryNameOptions}
                            subjectNameOptions={subjectNameOptions}
                            businessNameOptions={businessNameOptions}
                            intervalLabelOptions={intervalLabelOptions}
                        />
                </Stack>
            </Container>
        </Box>
    );
}
