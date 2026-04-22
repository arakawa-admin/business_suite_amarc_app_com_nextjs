import type {
    VehicleFormValues,
    VehicleSubmitValues,
} from "../schemas/vehicleSchema";
import type {
    CreateVehicleInput,
    UpdateVehicleInput,
    // Vehicle,
    VehicleDetailItem,
    VehicleDetailRow,
    ReplaceVehicleRemindersInput
} from "../types/vehicleTypes";

function parseYearMonth(value: string | null): Date | null {
    if (!value) return null;

    const [year, month] = value.split("-").map(Number);
    if (!year || !month) return null;

    return new Date(year, month - 1, 1);
}

export function mapVehicleRowToFormValues(
    vehicle: VehicleDetailItem,
): Partial<VehicleFormValues> {
    return {
        registrationNumber: vehicle.registrationNumber,
        departmentId: vehicle.departmentId ?? "",
        manufacturerName: vehicle.manufacturerName ?? "",
        vehicleName: vehicle.vehicleName ?? "",
        typeName: vehicle.typeName ?? "",
        model: vehicle.model ?? "",
        serialNumber: vehicle.serialNumber ?? "",
        firstRegisteredYm: parseYearMonth(vehicle.firstRegisteredYm) ?? undefined,
        ownerName: vehicle.ownerName ?? "",
        isFixedAsset: vehicle.isFixedAsset,
        isRegistered: vehicle.isRegistered,
        voluntaryInsuranceAgencyId: vehicle.voluntaryInsuranceAgencyId ?? "",
        compulsoryInsuranceAgencyName:
            vehicle.compulsoryInsuranceAgencyName ?? "",
        note: vehicle.note ?? "",
        // reminders: reminders.map((row) => ({
        //     dueOn: row.due_on ? new Date(row.due_on) : null,
        //     alertOn: row.alert_on ? new Date(row.alert_on) : null,
        // })),
    };
}

export function mapVehicleSubmitValuesToCreateInput(
    values: VehicleSubmitValues,
    // reminders: VehicleReminderViewRow[] = [],
): CreateVehicleInput {
    return {
        registration_number: values.registrationNumber,
        department_id: values.departmentId,
        manufacturer_name: values.manufacturerName,
        vehicle_name: values.vehicleName,
        type_name: values.typeName,
        model: values.model,
        serial_number: values.serialNumber,
        first_registered_ym: values.firstRegisteredYm,
        owner_name: values.ownerName,
        is_fixed_asset: values.isFixedAsset,
        is_registered: values.isRegistered,
        voluntary_insurance_agency_id: values.voluntaryInsuranceAgencyId,
        // compulsory_insurance_agency_name: values.compulsoryInsuranceAgencyName,
        note: values.note,
    
        // reminders: reminders.map((row) => ({
        //     dueOn: row.due_on ? new Date(row.due_on) : null,
        //     alertOn: row.alert_on ? new Date(row.alert_on) : null,
        // })),
    };
}

export function mapVehicleSubmitValuesToUpdateInput(
    values: VehicleSubmitValues,
): UpdateVehicleInput {
    return {
        registration_number: values.registrationNumber,
        department_id: values.departmentId,
        manufacturer_name: values.manufacturerName,
        vehicle_name: values.vehicleName,
        type_name: values.typeName,
        model: values.model,
        serial_number: values.serialNumber,
        first_registered_ym: values.firstRegisteredYm,
        owner_name: values.ownerName,
        is_fixed_asset: values.isFixedAsset,
        is_registered: values.isRegistered,
        voluntary_insurance_agency_id: values.voluntaryInsuranceAgencyId,
        // compulsory_insurance_agency_name: values.compulsoryInsuranceAgencyName,
        note: values.note,
    };
}

export function mapVehicleRowToDetailItem(
    row: VehicleDetailRow,
): VehicleDetailItem {
    return {
        id: row.id,
        registrationNumber: row.registration_number,
        departmentId: row.department_id,
        departmentName: row.department_name ?? "",
        manufacturerName: row.manufacturer_name,
        vehicleName: row.vehicle_name,
        typeName: row.type_name,
        model: row.model,
        serialNumber: row.serial_number,
        firstRegisteredYm: row.first_registered_ym,
        ownerName: row.owner_name,
        isFixedAsset: row.is_fixed_asset,
        isRegistered: row.is_registered,

        voluntaryInsuranceAgencyId: row.voluntary_insurance_agency_id,
        voluntaryInsuranceCategoryId: row.voluntary_insurance_category_id,
        voluntaryInsuranceCategoryCode: row.voluntary_insurance_category_code,
        voluntaryInsuranceCategoryName: row.voluntary_insurance_category_name,
        voluntaryInsuranceCompanyName: row.voluntary_insurance_company_name,
        voluntaryInsuranceAgencyName: row.voluntary_insurance_agency_name,
        voluntaryInsuranceContactPersonName:
            row.voluntary_insurance_contact_person_name,
        voluntaryInsuranceMobilePhone: row.voluntary_insurance_mobile_phone,
        voluntaryInsuranceTel: row.voluntary_insurance_tel,
        voluntaryInsuranceFax: row.voluntary_insurance_fax,

        compulsoryInsuranceAgencyName: row.compulsory_insurance_agency_name,

        inspectionReminderId: row.inspection_reminder_id,
        inspectionExpiryOn: row.inspection_expiry_on,
        inspectionAlertOn: row.inspection_alert_on,

        voluntaryInsuranceReminderId: row.voluntary_insurance_reminder_id,
        voluntaryInsuranceExpiryOn: row.voluntary_insurance_expiry_on,
        voluntaryInsuranceAlertOn: row.voluntary_insurance_alert_on,

        note: row.note,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
        deletedBy: null,
        deleteReason: null,
    };
}

function formatDateOnly(value: Date | null | undefined): string | null {
    if (!value) return null;

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
export function mapVehicleSubmitValuesToReplaceRemindersInput(
    vehicleId: string,
    values: VehicleSubmitValues,
): ReplaceVehicleRemindersInput {
    return {
        vehicleId,
        reminders: values.reminders.map((row) => ({
            dueOn: formatDateOnly(row.dueOn),
            alertOn: formatDateOnly(row.alertOn),
        })),
    };
}
