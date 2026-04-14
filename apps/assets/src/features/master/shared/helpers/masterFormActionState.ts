import type { MasterFormActionState } from "../types/masterFormActionState";

export function createInitialMasterFormActionState(): MasterFormActionState {
    return {
        ok: true,
        fieldErrors: {},
        formError: null,
    };
}
