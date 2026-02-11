import { Inter } from "next/font/google";
import { Providers } from "./providers";

import "@/styles/globals.css";
import AppNavbar from "@/components/AppNavbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="zh-TW" className="dark">
			<body className={inter.className}>
				<Providers>
					<AppNavbar />
					{children}
				</Providers>
			</body>
		</html>
	);
}