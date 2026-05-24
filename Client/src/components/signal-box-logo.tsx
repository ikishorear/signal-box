import * as React from "react"

import { cn } from "@/lib/utils"

function createSineWavePath({
  startX = 2,
  endX = 22,
  centerY = 12,
  amplitude = 5,
  periods = 2,
  steps = 64,
}: {
  startX?: number
  endX?: number
  centerY?: number
  amplitude?: number
  periods?: number
  steps?: number
}) {
  const width = endX - startX
  const wavelength = width / periods

  return Array.from({ length: steps + 1 }, (_, index) => {
    const x = startX + (width * index) / steps
    const y =
      centerY +
      amplitude * Math.sin((2 * Math.PI * (x - startX)) / wavelength)

    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(" ")
}

export const SIGNAL_BOX_LOGO_PATH = createSineWavePath({})

export function SignalBoxLogo({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d={SIGNAL_BOX_LOGO_PATH}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SignalBoxLogoMark({
  className,
  iconClassName,
}: {
  className?: string
  iconClassName?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <SignalBoxLogo className={cn("size-5", iconClassName)} />
    </div>
  )
}
