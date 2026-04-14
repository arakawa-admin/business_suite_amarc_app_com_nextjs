import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ThemeRegistry from "./themeRegistry";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ワークフローシステム",
	description: "(開発中)ワークフローシステム",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// return (
	// 	<div className="min-h-screen bg-red-500 flex items-center justify-center">
	// 		<h1 className="text-6xl font-bold text-white">Tailwind Test - RED BACKGROUND</h1>
	// 	</div>
	// )
	return (
		<html lang="ja">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeRegistry>{children}</ThemeRegistry>

				<ToastContainer
					position="bottom-center"
					// autoClose={3000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>
			</body>
		</html>
	);
}
