"use client";

import { useRef, useState } from "react";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";

import { PermitAttachmentFormValues } from "@/features/permits/schemas/permitSchema";

type Props = {
	value: PermitAttachmentFormValues[];
	onChange: (next: PermitAttachmentFormValues[]) => void;
	// label?: string;
};

type PresignResponse = {
	storageBucket: string;
	storageKey: string;
	uploadUrl: string;
};

type RegisterResponse = {
	attachmentId: string;
};

export function AttachmentUploader({
	value,
	onChange,
	// label = "添付ファイル",
}: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	async function handleSelectFiles(files: FileList | null) {
		if (!files || files.length === 0) {
			return;
		}

		setIsUploading(true);
		setErrorMessage(null);

		try {
			const uploadedItems: PermitAttachmentFormValues[] = [];

			for (const file of Array.from(files)) {
				const presignResponse = await fetch("/api/attachments/presign", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						filename: file.name,
						contentType: file.type || "application/octet-stream",
					}),
				});

				if (!presignResponse.ok) {
					throw new Error("署名付きURLの取得に失敗しました");
				}

				const presignData = (await presignResponse.json()) as PresignResponse;

				const uploadResponse = await fetch(presignData.uploadUrl, {
					method: "PUT",
					headers: {
						"Content-Type": file.type || "application/octet-stream",
					},
					body: file,
				});

				if (!uploadResponse.ok) {
					throw new Error(`ファイルアップロードに失敗しました: ${file.name}`);
				}

				const registerResponse = await fetch("/api/attachments/register", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						storageBucket: presignData.storageBucket,
						storageKey: presignData.storageKey,
						originalFilename: file.name,
						contentType: file.type || null,
						byteSize: file.size,
					}),
				});

				if (!registerResponse.ok) {
					throw new Error(`添付メタ情報の保存に失敗しました: ${file.name}`);
				}

				const registerData = (await registerResponse.json()) as RegisterResponse;

				uploadedItems.push({
					attachmentId: registerData.attachmentId,
					originalFilename: file.name,
					contentType: file.type || null,
					byteSize: file.size,
				});
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

	function handleRemove(index: number) {
		const next = value.filter((_, i) => i !== index);
		onChange(next);
	}

	return (
		<Stack spacing={2}>
			{/* <Typography variant="subtitle1" fontWeight={700}>
				{label}
			</Typography> */}

			{errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

			<Stack direction="row" spacing={2} alignItems="center">
				<Button
					variant="outlined"
					onClick={() => inputRef.current?.click()}
					disabled={isUploading}
				>
					ファイルを選択
				</Button>

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
				onChange={(event) => {
					void handleSelectFiles(event.target.files);
				}}
			/>

			<Box>
				<List dense>
					{value.map((item, index) => (
						<ListItem
							key={`${item.attachmentId}-${index}`}
							secondaryAction={
								<Button
									color="error"
									size="small"
									onClick={() => handleRemove(index)}
									disabled={isUploading}
								>
									削除
								</Button>
							}
						>
							<ListItemText
								primary={item.originalFilename}
								secondary={`${item.byteSize.toLocaleString()} byte`}
							/>
						</ListItem>
					))}
				</List>
			</Box>
		</Stack>
	);
}
