"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/lib/query-provider";
import { useRealTime } from "@/hooks/useRealTime";

function RealTimeListener() {
  useRealTime();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RealTimeListener />
          {children}
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}