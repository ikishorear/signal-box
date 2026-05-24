import Link from "next/link"
import type { Metadata } from "next"

import { AuthForm } from "@/components/auth-form"
import { SignalBoxLogoMark } from "@/components/signal-box-logo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sign in | Signal Box",
  description: "Sign in to Signal Box with your username and password.",
}

export default function AuthPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SignalBoxLogoMark className="size-10" />
          <span className="text-xl font-semibold tracking-tight">Signal Box</span>
        </Link>
        <p className="max-w-sm text-sm text-muted-foreground">
          Catch signals and thread the conversations that matter.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your username and password to access your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  )
}
