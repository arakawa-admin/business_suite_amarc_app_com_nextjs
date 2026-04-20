import { redirect } from "next/navigation";
import { PermitForm } from "@/features/permits/components/permitForm";
import { findCurrentStaffOrThrow } from "@/features/auth/repositories/currentStaffRepository";
import { StaffSelectionRequiredError } from "@/features/auth/errors/authErrors";
import { findPermitLabelOptions } from "@/features/permits/repositories/permitRepository";
import { findPermitCategoryList } from "@/features/master/permit/permit-categories/repositories/permitCategoryRepository";
import  { Box, Container, Stack } from "@mui/material";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";

export default async function PermitNewPage() {
    try {
        await findCurrentStaffOrThrow();
    } catch (error) {
        if (error instanceof StaffSelectionRequiredError) {
            redirect(`/select/staff?returnTo=${encodeURIComponent("/permits/new")}`);
        }
        throw error;
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
                            { title: `許認可 新規登録` },
                        ]}
                        />
                    <PermitForm
                        mode="create"
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
