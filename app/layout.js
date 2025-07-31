import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundaryProvider } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

export const metadata = {
  title: "ForexBot Pro - Professional Forex Trading Bot",
  description: "Advanced AI-powered forex trading bot with comprehensive risk management, multiple strategies, and real-time market analysis.",
  keywords: "forex, trading, bot, AI, automated trading, scalping, DCA, grid trading",
  authors: [{ name: "ForexBot Pro Team" }],
  creator: "ForexBot Pro",
  publisher: "ForexBot Pro",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://forexbot-pro.vercel.app",
    title: "ForexBot Pro - Professional Forex Trading Bot",
    description: "Advanced AI-powered forex trading bot with comprehensive risk management",
    siteName: "ForexBot Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "ForexBot Pro - Professional Forex Trading Bot",
    description: "Advanced AI-powered forex trading bot with comprehensive risk management",
    creator: "@forexbotpro",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#0f172a",
          colorInputBackground: "#1e293b",
          colorInputText: "#f1f5f9",
        },
        elements: {
          formButtonPrimary: 
            "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
          card: "bg-slate-900 border border-slate-700",
          headerTitle: "text-blue-400",
          headerSubtitle: "text-slate-300",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-white`}
        >
          <ErrorBoundaryProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1e293b',
                      color: '#f1f5f9',
                      border: '1px solid #334155',
                    },
                    success: {
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#f1f5f9',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#f1f5f9',
                      },
                    },
                  }}
                />
              </ThemeProvider>
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </QueryClientProvider>
          </ErrorBoundaryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
