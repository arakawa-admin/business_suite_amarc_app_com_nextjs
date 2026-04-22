import { z } from "zod";

import { masterCommonSchema } from "../../../shared/schemas/masterCommonSchema";

export const insuranceCategorySchema = masterCommonSchema.extend({
    updateNote: z.string().max(1000),
    accidentInternalNote: z.string().max(1000),
    accidentExternalNote: z.string().max(1000),
});
