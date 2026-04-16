"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Stack,
	Typography,
} from "@mui/material";

import PreviewGrid from "./file/PreviewGrid";
import type { UploadPreviewItem, UploadedFilePayload } from "./file/types";
import { compressImage } from "../../lib/file/compressImage";
import {
	compressPdf,
	generateImageThumb,
	generatePdfThumb,
} from "../../lib/file/pdfToThumbnail";

type PresignResponse = {
	storageBucket: string;
	original: {
		storageKey: string;
		uploadUrl: string;
	};
	thumbnail: {
		storageKey: string;
		uploadUrl: string;
	};
};

type RegisterResponse = {
	attachmentId: string;
};

type PreparedUpload = {
	originalFile: File;
	thumbnailFile: File;
	previewUrl: string | null;
	originalFilename: string;
	contentType: string | null;
	byteSize: number;
	thumbnailContentType: string | null;
	thumbnailByteSize: number | null;
};

type Props<TItem> = {
	value: TItem[];
	onChange: (next: TItem[]) => void;

	getId: (item: TItem) => string;
	getPreviewUrl?: (item: TItem) => string | null | undefined;
	toPreviewItem: (item: TItem) => UploadPreviewItem | null;
	createItemFromUploadResult: (payload: UploadedFilePayload) => TItem;

	maxFiles?: number;
	maxSizeMB?: number;
	accept?: string;

	presignEndpoint?: string;
	registerEndpoint?: string;
	removable?: boolean;
};

export function AttachmentUploader<TItem>({
	value,
	onChange,
	getId,
	getPreviewUrl,
	toPreviewItem,
	createItemFromUploadResult,
	maxFiles = 10,
	maxSizeMB = 20,
	accept = "image/*,.pdf",
	presignEndpoint = "/api/attachments/presign",
	registerEndpoint = "/api/attachments/register",
	removable = true,
}: Props<TItem>) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const previewItems = useMemo(() => {
		return value
			.map(toPreviewItem)
			.filter((item): item is UploadPreviewItem => item !== null);
	}, [value, toPreviewItem]);

	useEffect(() => {
		return () => {
			if (!getPreviewUrl) {
				return;
			}

			for (const item of value) {
				const previewUrl = getPreviewUrl(item);
				if (previewUrl?.startsWith("blob:")) {
					URL.revokeObjectURL(previewUrl);
				}
			}
		};
	}, [value, getPreviewUrl]);

	async function prepareFile(file: File): Promise<PreparedUpload> {
		if (file.size > maxSizeMB * 1024 * 1024) {
			throw new Error(`${file.name} は上限 ${maxSizeMB}MB を超えています`);
		}

		if (file.type.startsWith("image/")) {
			const compressed = await compressImage(file);
			const thumbnail = await generateImageThumb(compressed);
			const previewUrl = URL.createObjectURL(thumbnail);

			return {
				originalFile: compressed,
				thumbnailFile: thumbnail,
				previewUrl,
				originalFilename: file.name,
				contentType: compressed.type || file.type || null,
				byteSize: compressed.size,
				thumbnailContentType: thumbnail.type || "image/png",
				thumbnailByteSize: thumbnail.size,
			};
		}

		if (file.type === "application/pdf") {
			const compressed = await compressPdf(file);
			const thumbnail = await generatePdfThumb(compressed);
			const previewUrl = URL.createObjectURL(thumbnail);

			return {
				originalFile: compressed,
				thumbnailFile: thumbnail,
				previewUrl,
				originalFilename: file.name,
				contentType: "application/pdf",
				byteSize: compressed.size,
				thumbnailContentType: thumbnail.type || "image/png",
				thumbnailByteSize: thumbnail.size,
			};
		}

		throw new Error(`${file.name} は対応していないファイル形式です`);
	}

	async function uploadPreparedFile(
		prepared: PreparedUpload,
	): Promise<TItem> {
		const presignResponse = await fetch(presignEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				filename: prepared.originalFilename,
				contentType:
					prepared.originalFile.type || "application/octet-stream",
				thumbnailContentType:
					prepared.thumbnailFile.type || "image/png",
			}),
		});

		if (!presignResponse.ok) {
			throw new Error("署名付きURLの取得に失敗しました");
		}

		const presignData = (await presignResponse.json()) as PresignResponse;

		const originalUploadResponse = await fetch(presignData.original.uploadUrl, {
			method: "PUT",
			headers: {
				"Content-Type":
					prepared.originalFile.type || "application/octet-stream",
			},
			body: prepared.originalFile,
		});

		if (!originalUploadResponse.ok) {
			throw new Error(
				`原本アップロードに失敗しました: ${prepared.originalFilename}`,
			);
		}

		const thumbnailUploadResponse = await fetch(
			presignData.thumbnail.uploadUrl,
			{
				method: "PUT",
				headers: {
					"Content-Type":
						prepared.thumbnailFile.type || "image/png",
				},
				body: prepared.thumbnailFile,
			},
		);

		if (!thumbnailUploadResponse.ok) {
			throw new Error(
				`サムネイルアップロードに失敗しました: ${prepared.originalFilename}`,
			);
		}

		const registerResponse = await fetch(registerEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				storageBucket: presignData.storageBucket,

				storageKey: presignData.original.storageKey,
				originalFilename: prepared.originalFilename,
				contentType: prepared.contentType,
				byteSize: prepared.byteSize,

				thumbnailStorageKey: presignData.thumbnail.storageKey,
				thumbnailContentType: prepared.thumbnailContentType,
				thumbnailByteSize: prepared.thumbnailByteSize,
			}),
		});

		if (!registerResponse.ok) {
			throw new Error(
				`添付メタ情報の保存に失敗しました: ${prepared.originalFilename}`,
			);
		}

		const registerData = (await registerResponse.json()) as RegisterResponse;

		return createItemFromUploadResult({
			attachmentId: registerData.attachmentId,
			originalFilename: prepared.originalFilename,
			contentType: prepared.contentType,
			byteSize: prepared.byteSize,
			storageKey: presignData.original.storageKey,
			thumbnailStorageKey: presignData.thumbnail.storageKey,
			previewUrl: prepared.previewUrl,
			viewUrl: null,
			thumbnailViewUrl: null,
		});
	}

	async function handleAddFiles(files: File[]) {
		if (files.length === 0) {
			return;
		}

		if (value.length >= maxFiles) {
			setErrorMessage(`添付は最大 ${maxFiles} 件までです`);
			return;
		}

		setIsUploading(true);
		setErrorMessage(null);

		try {
			const remainCount = maxFiles - value.length;
			const targetFiles = files.slice(0, remainCount);
			const uploadedItems: TItem[] = [];

			for (const file of targetFiles) {
				const prepared = await prepareFile(file);
				const uploaded = await uploadPreparedFile(prepared);
				uploadedItems.push(uploaded);
			}

			onChange([...value, ...uploadedItems]);

			if (inputRef.current) {
				inputRef.current.value = "";
			}
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "アップロードに失敗しました",
			);
		} finally {
			setIsUploading(false);
		}
	}

	function handleRemove(id: string) {
		if (getPreviewUrl) {
			const target = value.find((item) => getId(item) === id);
			const previewUrl = target ? getPreviewUrl(target) : null;

			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		}

		onChange(value.filter((item) => getId(item) !== id));
	}

	return (
		<Stack spacing={2}>
			{errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

			<Stack direction="row" spacing={2} alignItems="center">
				<Button
					variant="outlined"
					onClick={() => inputRef.current?.click()}
					disabled={isUploading || value.length >= maxFiles}
				>
					ファイルを選択
				</Button>

				<Typography variant="body2" color="text.secondary">
					最大 {maxFiles} 件 / {maxSizeMB}MB まで
				</Typography>

				{isUploading ? (
					<Stack direction="row" spacing={1} alignItems="center">
						<CircularProgress size={20} />
						<Typography variant="body2">アップロード中...</Typography>
					</Stack>
				) : null}
			</Stack>

			<input
				ref={inputRef}
				type="file"
				multiple
				hidden
				accept={accept}
				onChange={(event) => {
					void handleAddFiles(Array.from(event.target.files ?? []));
				}}
			/>

			<Box
				onDragOver={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsDragging(true);
				}}
				onDragLeave={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsDragging(false);
				}}
				onDrop={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsDragging(false);
					void handleAddFiles(Array.from(e.dataTransfer.files ?? []));
				}}
				sx={{
					border: "1px dashed",
					borderColor: isDragging ? "primary.main" : "divider",
					borderRadius: 2,
					p: 3,
					textAlign: "center",
					bgcolor: isDragging ? "action.hover" : "transparent",
					transition: "all 0.2s ease",
				}}
			>
				<Typography variant="body2" color="text.secondary">
					ここにファイルをドラッグ＆ドロップ
				</Typography>
			</Box>

			{previewItems.length > 0 ? (
				<PreviewGrid
					previews={previewItems}
					removable={removable}
					onRemove={handleRemove}
				/>
			) : null}
		</Stack>
	);
}
