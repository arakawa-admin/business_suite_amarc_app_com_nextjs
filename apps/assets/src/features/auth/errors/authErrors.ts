export class StaffSelectionRequiredError extends Error {
    constructor(message = "Staff selection required") {
        super(message);
        this.name = "StaffSelectionRequiredError";
    }
}

export class CurrentStaffNotFoundError extends Error {
    constructor(message = "Current staff not found") {
        super(message);
        this.name = "CurrentStaffNotFoundError";
    }
}
