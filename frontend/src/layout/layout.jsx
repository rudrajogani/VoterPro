import React from "react";
import { CustomThemeProvider } from "../components/theme-provider";
import "./globle.css";

export default function RootLayout({ children }) {
  return (
    <CustomThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </CustomThemeProvider>
  );
}