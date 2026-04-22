export type Vehicle = {
    id: string;
    registrationNumber: string;
    departmentId: string | null;
    departmentName?: string;
    manufacturerName: string | null;
    vehicleName: string | null;
    typeName: string | null;
    model: string | null;
    serialNumber: string | null;
    firstRegisteredYm: string | null;
    ownerName: string | null;
    isFixedAsset: boolean;
    isRegistered: boolean;
    voluntaryInsuranceAgencyId: string | null;
    voluntaryInsuranceAgencyName?: string | null;
    compulsoryInsuranceAgencyName: string | null;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    deletedBy: string | null;
    deleteReason: string | null;
};

export type VehicleListItem = {
    id: string;
    registrationNumber: string;
    departmentId: string | null;
    departmentName: string;
    manufacturerName: string | null;
    vehicleName: string | null;
    typeName: string | null;
    model: string | null;
    serialNumber: string | null;
    firstRegisteredYm: string | null;
    ownerName: string | null;
    isFixedAsset: boolean;
    isRegistered: boolean;

    voluntaryInsuranceAgencyId: string | null;
    voluntaryInsuranceCategoryId: string | null;
    voluntaryInsuranceCategoryCode: string | null;
    voluntaryInsuranceCategoryName: string | null;
    voluntaryInsuranceCompanyName: string | null;
    voluntaryInsuranceAgencyName: string | null;
    voluntaryInsuranceContactPersonName: string | null;
    voluntaryInsuranceMobilePhone: string | null;
    voluntaryInsuranceTel: string | null;
    voluntaryInsuranceFax: string | null;

    compulsoryInsuranceAgencyName: string | null;

    inspectionReminderId: string | null;
    inspectionExpiryOn: string | null;
    inspectionAlertOn: string | null;

    voluntaryInsuranceReminderId: string | null;
    voluntaryInsuranceExpiryOn: string | null;
    voluntaryInsuranceAlertOn: string | null;

    note: string | null;
    createdAt: string;
    updatedAt: string;

    deletedAt: string | null;
    deletedBy: string | null;
    deleteReason: string | null;
};

export type VehicleDetailItem = VehicleListItem & {
    departmentName: string;
    voluntaryInsuranceCategoryId: string | null;
    voluntaryInsuranceCategoryCode: string | null;
    voluntaryInsuranceCategoryName: string | null;
    voluntaryInsuranceCompanyName: string | null;
    voluntaryInsuranceAgencyName: string | null;
    voluntaryInsuranceContactPersonName: string | null;
    voluntaryInsuranceMobilePhone: string | null;
    voluntaryInsuranceTel: string | null;
    voluntaryInsuranceFax: string | null;
};

export type VehicleReminderTypeCode =
    | "vehicle_inspection_expiry"
    | "vehicle_insurance_expiry";

export type VehicleReminderFormValues = {
    dueOn?: Date | null;
    alertOn?: Date | null;
    reminderTypeCode?: VehicleReminderTypeCode;
};

export type VehicleAttachmentFormValues = {
    attachmentId: string;
    originalFilename: string;
    contentType: string | null;
    byteSize: number;
    storageKey?: string | null;
    previewUrl?: string | null;
    viewUrl?: string | null;
};

export type DepartmentOption = {
    value: string;
    label: string;
};

export type InsuranceAgencyOption = {
    value: string;
    label: string;
};


export type CreateVehicleInput = {
    registration_number: string;
    department_id: string | null;
    manufacturer_name: string | null;
    vehicle_name: string | null;
    type_name: string | null;
    model: string | null;
    serial_number: string | null;
    first_registered_ym: string | null;
    owner_name: string | null;
    is_fixed_asset: boolean;
    is_registered: boolean;
    voluntary_insurance_agency_id: string | null;
    voluntary_insurance_agency_name?: string;
    // compulsory_insurance_agency_name: string | null;
    note: string | null;
};

export type UpdateVehicleInput = {
    registration_number: string;
    department_id: string | null;
    manufacturer_name: string | null;
    vehicle_name: string | null;
    type_name: string | null;
    model: string | null;
    serial_number: string | null;
    first_registered_ym: Date | string | null;
    owner_name: string | null;
    is_fixed_asset: boolean;
    is_registered: boolean;
    voluntary_insurance_agency_id: string | null;
    voluntary_insurance_agency_name?: string;
    // compulsory_insurance_agency_name: string | null;
    note: string | null;
};

export type ReplaceVehicleRemindersInput = {
    vehicleId: string;
    reminders: {
        dueOn: string | null;
        alertOn: string | null;
        reminderTypeCode?: VehicleReminderTypeCode;
    }[];
};

export type SoftDeleteVehicleInput = {
    vehicleId: string;
    deletedBy: string;
    deleteReason?: string | null;
};

export type HardDeleteVehicleCheckResult = {
    vehicleId: string;
    reminderCount: number;
    renewalLogCount: number;
    canHardDelete: boolean;
};

export type VehicleDetailRow = {
    id: string;
    registration_number: string;
    department_id: string | null;
    department_name: string | null;
    manufacturer_name: string | null;
    vehicle_name: string | null;
    type_name: string | null;
    model: string | null;
    serial_number: string | null;
    first_registered_ym: string | null;
    owner_name: string | null;
    is_fixed_asset: boolean;
    is_registered: boolean;

    voluntary_insurance_agency_id: string | null;
    voluntary_insurance_category_id: string | null;
    voluntary_insurance_category_code: string | null;
    voluntary_insurance_category_name: string | null;
    voluntary_insurance_company_name: string | null;
    voluntary_insurance_agency_name: string | null;
    voluntary_insurance_contact_person_name: string | null;
    voluntary_insurance_mobile_phone: string | null;
    voluntary_insurance_tel: string | null;
    voluntary_insurance_fax: string | null;

    compulsory_insurance_agency_name: string | null;

    inspection_reminder_id: string | null;
    inspection_expiry_on: string | null;
    inspection_alert_on: string | null;

    voluntary_insurance_reminder_id: string | null;
    voluntary_insurance_expiry_on: string | null;
    voluntary_insurance_alert_on: string | null;

    note: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    deleted_at: string | null;
};

import { type CommentListItem } from "@/features/vehicles/comments/repositories/commentRepository";
export type VehicleReminderViewRow = {
    id: string;
    target_type: "vehicle";
    vehicle_id: string;
    reminder_type_code: string;
    reminder_type_name: string;
    due_on: string | null;
    alert_on: string | null;
    completed_on: string | null;
    reminder_created_at: string;
    reminder_created_by: string | null;
    reminder_updated_at: string;
    reminder_updated_by: string | null;

    registration_number: string;
    department_id: string | null;
    department_name: string | null;
    manufacturer_name: string | null;
    vehicle_name: string | null;
    type_name: string | null;
    model: string | null;
    serial_number: string | null;
    first_registered_ym: string | null;
    owner_name: string | null;
    is_fixed_asset: boolean;
    is_registered: boolean;
    voluntary_insurance_agency_id: string | null;
    voluntary_insurance_category_id: string | null;
    voluntary_insurance_category_code: string | null;
    voluntary_insurance_category_name: string | null;
    voluntary_insurance_company_name: string | null;
    voluntary_insurance_agency_name: string | null;
    voluntary_insurance_contact_person_name: string | null;
    voluntary_insurance_mobile_phone: string | null;
    voluntary_insurance_tel: string | null;
    voluntary_insurance_fax: string | null;
    // compulsory_insurance_agency_name: string | null;
    vehicle_note: string | null;
    vehicle_created_at: string;
    vehicle_updated_at: string;
    comment_count: number;

    comments: CommentListItem[];
};
