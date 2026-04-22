import { notFound } from "next/navigation";
import { VehicleForm } from "@/features/vehicles/components/vehicleForm";
import {
    findVehicleById,
    // findVehicleRemindersByVehicleId,
} from "@/features/vehicles/repositories/vehicleRepository";
import {
    // mapVehicleSubmitValuesToUpdateInput,
    mapVehicleRowToFormValues,
    // mapVehicleSubmitValuesToCreateInput
} from "@/features/vehicles/mappers/vehicleMappers";
// import { findInsuranceCategoryList } from "@/features/master/common/insurance-categories/repositories/insuranceCategoryRepository";
import { findLinkedAttachmentsByTarget } from "@/features/attachments/repositories/attachmentLinkRepository";
import { findInsuranceAgencyList } from "@/features/master/common/insurance-agencies/repositories/insuranceAgencyRepository";
import { createAttachmentViewUrl } from "@/features/attachments/repositories/attachmentViewRepository";

import  { Box, Container, Stack } from "@mui/material";
import AssetsBreadcrumbs from "@/components/common/layout/AssetsBreadcrumbs";
import { getMasterDepartments } from "@lib/actions/common/masterDepartment";

export default async function VehicleEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [vehicle,
        // reminders
    ] = await Promise.all([
        findVehicleById(id),
        // findVehicleRemindersByVehicleId(id),
    ]);

    if (!vehicle) {
        notFound();
    }

    const { data: departmentList } = await getMasterDepartments();
    const departmentNameOptions = departmentList.map((item: any) => ({ id: item.id, name: item.name }));

    const voluntaryInsuranceAgencyList = await findInsuranceAgencyList();
    const voluntaryInsuranceAgencyNameOptions = voluntaryInsuranceAgencyList
                                                    .filter(item => item.insuranceCategoryName === "自動車保険")
                                                    .map((item: any) => ({ id: item.id, name: `${item.agencyName}(${item.insuranceCategoryName})` || item.agencyName }));

    const linkedAttachments = await findLinkedAttachmentsByTarget({ targetType: "vehicle", targetId: id });

    const itemsWithViewUrl = await Promise.all(
        linkedAttachments.map(async (item) => {
            const result = await createAttachmentViewUrl(item.attachmentId);

            return {
                attachmentId: item.attachmentId,
                originalFilename: item.originalFilename,
                contentType: item.contentType,
                byteSize: item.byteSize,
                viewUrl: result.viewUrl,
                thumbnailViewUrl: result.thumbnailViewUrl ?? "",
                previewUrl: null,
            };
        }),
    );

    return (
        <Box>
            <Container>
                <Stack spacing={3}>
                    <AssetsBreadcrumbs
                        items={[
                            { title: "車両一覧", href: "/vehicles" },
                            { title: `詳細 (${vehicle.registrationNumber})`, href: `/vehicles/${id}` },
                            { title: `編集` },
                        ]}
                        />

                        <VehicleForm
                            mode="edit"
                            editId={id}
                            defaultValues={mapVehicleRowToFormValues(vehicle
                                // , reminders
                            )}
                            departmentNameOptions={departmentNameOptions}
                            voluntaryInsuranceAgencyNameOptions={voluntaryInsuranceAgencyNameOptions}
                            defaultAttachments={itemsWithViewUrl}
                        />
                </Stack>
            </Container>
        </Box>
    );
}
