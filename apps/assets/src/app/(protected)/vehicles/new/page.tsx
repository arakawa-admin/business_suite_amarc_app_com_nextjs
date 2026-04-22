import { redirect } from "next/navigation";
import { VehicleForm } from "@/features/vehicles/components/vehicleForm";
import { findCurrentStaffOrThrow } from "@/features/auth/repositories/currentStaffRepository";
import { StaffSelectionRequiredError } from "@/features/auth/errors/authErrors";
import  { Box, Container, Stack } from "@mui/material";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";
import { getMasterDepartments } from "@lib/actions/common/masterDepartment";
import { findInsuranceAgencyList } from "@/features/master/common/insurance-agencies/repositories/insuranceAgencyRepository";

export default async function VehicleNewPage() {
    try {
        await findCurrentStaffOrThrow();
    } catch (error) {
        if (error instanceof StaffSelectionRequiredError) {
            redirect(`/select/staff?returnTo=${encodeURIComponent("/vehicles/new")}`);
        }
        throw error;
    }

    const { data: departmentList } = await getMasterDepartments();
    const departmentNameOptions = departmentList.map((item: any) => ({ id: item.id, name: item.name }));

    const voluntaryInsuranceAgencyList = await findInsuranceAgencyList();
    const voluntaryInsuranceAgencyNameOptions = voluntaryInsuranceAgencyList
                                                    .filter(item => item.insuranceCategoryName === "自動車保険")
                                                    .map((item: any) => ({ id: item.id, name: `${item.agencyName}(${item.insuranceCategoryName})` || item.agencyName }));

    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <AssetsBreadcrumbs
                        items={[
                            { title: "車両一覧", href: "/vehicles" },
                            { title: `車両 新規登録` },
                        ]}
                        />
                    <VehicleForm
                        mode="create"
                        departmentNameOptions={departmentNameOptions}
                        voluntaryInsuranceAgencyNameOptions={voluntaryInsuranceAgencyNameOptions}
                    />
                </Stack>
            </Container>
        </Box>
    );
}
