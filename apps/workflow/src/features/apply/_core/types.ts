import type { Path } from "react-hook-form";

/** definition の対象は Zod infer 型など “任意のオブジェクト” */
export type VisibleIf<T> = {
    name: Path<T>; // 監視するフィールド（TのPath）
    equals: unknown;
};

export type FieldType =
    | "date"
    | "dateRange"
    | "time"
    | "timeRange"
    | "text"
    | "textarea"
    | "number"
    | "switch"
    | "radio"
    | "select"
    | "multiSelect"
    | "file"
    | "items"
    | "staffId"
    | "departmentId"
    | "slot";

export type GridSize = {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
};

export type BaseField<T> = {
    label?: string;
    gridSize?: GridSize|number;
    visibleIf?: VisibleIf<T>;
    disabledIf?: VisibleIf<T>;
    disabled?: boolean;
    display?: DisplayConfig;
};

export type SlotFieldDef<T> = BaseField<T> & {
    type: "slot";
    slotKey: string
    name?: Path<T>;
};

export type ItemsFieldDef<T> = BaseField<T> & {
    type: "items";
    items: Array<{
        before: Array<{ name: Path<T>; type: FieldType; label: string }>;
        after: Array<{ name: Path<T>; type: FieldType; label: string }>;
    }>;
};

export type GroupDef<T> = BaseField<T> & {
    type: "group";
    fields: FieldDef<T>[];
};

export type DisplayConfig = {
    /** payloadの別パスを表示に使う（例: "target_user.name"） */
    labelPath?: string;
    /** 値がidのとき、payload側の辞書からラベル化（例: "target_user.name"） */
    // 今回は labelPath だけで十分。必要なら将来拡張で mapPaths など追加できる。

    visible?: boolean; // 常に表示/非表示（visibleIf より優先）
    gridSize?: GridSize|number; // display時優先

    formatter?: string;
};

/** 通常フィールド */
export type NormalFieldDef<T> = BaseField<T> & {
    type: Exclude<FieldType, "slot" | "items">;

    name?: Path<T>;

    rows?: number;

    inputOptions?: {
        startAdornment?: string;
        endAdornment?: string;
    };

    dateRangeOptions?: {
        fromName?: Path<T>;
        toName?: Path<T>;
        labelStart?: string;
        labelEnd?: string;
        minDate?: Date;
        maxDate?: Date;
        granularity?: "day" | "month" | "year";
    };

    timeRangeOptions?: {
        startName: Path<T>;
        endName: Path<T>;
        labelStart: string;
        labelEnd: string;
        minutesStep?: number;
    };

    radioOptions?: {
        items: { id: string; name: string; subLabel?: string }[];
        row?: boolean;
    };

    selectOptions?: {
        items: { id: string; name?: string; subLabel?: string }[];
    };

    fileOptions?: {
        multiple?: boolean;
        accept?: string;
        maxFiles?: number;
        maxSizeMB?: number;
        previewSize?: number;
    };

    switchOptions?: {
        title?: string;
        label?: { true: string; false: string };
    };

    selectDeptOptions?: {
        includeAll?: boolean;
    },

    selectStaffOptions?: {
        validEmployType?: string;
        includeAll?: boolean;
    },

    display?: DisplayConfig;
};

export type FieldDef<T> =
    | NormalFieldDef<T>
    | SlotFieldDef<T>
    | ItemsFieldDef<T>
    | GroupDef<T>;

export type FormDefinition<T> = {
    formCode: string;
    title: string;
    fields: FieldDef<T>[];
};
