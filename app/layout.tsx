import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/components/supabase-provider"
import { LoadingProvider } from "@/components/loading-overlay" // 👈 importa esto
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Catálogo Digital - Crea tu menú digital",
  icons: {
    icon: "/Softwans.png",
  },
  description: "Plataforma para crear tú catálogo digital con código QR para restaurantes",
  generator: 'Softwans.com'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1334703011090519');
            fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1334703011090519&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <LoadingProvider>
              {children}
              <Toaster />
            </LoadingProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
