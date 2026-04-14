"use server";

import { revalidatePath } from "next/cache";
import {
    createPermit,
    createPermitReminders,
    replacePermitReminders,
    updatePermit,
} from "../repositories/permitRepository";
import {
    createPermitSchema,
    type PermitSubmitValues,
} from "../schemas/permitSchema";
import {
    mapPermitSubmitValuesToCreateInput,
    mapPermitSubmitValuesToReplaceRemindersInput,
    mapPermitSubmitValuesToUpdateInput,
} from "../mappers/permitMappers";

export async function permitCreateAction(
    values: PermitSubmitValues,
): Promise<{ id: string }> {
    const parsed = createPermitSchema.safeParse(values);

    if (!parsed.success) {
        throw new Error("入力内容を確認してください。");
    }

    const permit = await createPermit(
        mapPermitSubmitValuesToCreateInput(parsed.data),
    );

    const reminderInput = mapPermitSubmitValuesToReplaceRemindersInput(
        permit.id,
        parsed.data,
    );

    await createPermitReminders(permit.id, reminderInput.reminders);

    revalidatePath("/permits");
    return permit;
}

export async function permitEditAction(
    values: PermitSubmitValues,
    permitId: string,
): Promise<void> {
    const parsed = createPermitSchema.safeParse(values);

    if (!parsed.success) {
        throw new Error("入力内容を確認してください。");
    }

    await updatePermit(
        permitId,
        mapPermitSubmitValuesToUpdateInput(parsed.data),
    );

    await replacePermitReminders(
        mapPermitSubmitValuesToReplaceRemindersInput(permitId, parsed.data),
    );

    revalidatePath("/permits");
    revalidatePath(`/permits/${permitId}`);
    revalidatePath(`/permits/${permitId}/edit`);
}
