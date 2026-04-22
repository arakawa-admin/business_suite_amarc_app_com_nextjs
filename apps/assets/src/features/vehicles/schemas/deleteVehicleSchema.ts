import { z } from "zod";

export const softDeleteVehicleSchema = z.object({
    vehicleId: z.uuid(),
    deleteReason: z
        .string()
        .trim()
        .max(500, "削除理由は500文字以内で入力してください。")
        .transform((v) => (v && v.length > 0 ? v : "")),
});

export type SoftDeleteVehicleFormValues = z.infer<typeof softDeleteVehicleSchema>;
