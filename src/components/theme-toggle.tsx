'use client'

import * as React from "react"
import { ThemeSwitch } from "@/components/ui/theme-switch-button"

export function ThemeToggle() {
  return (
    <div className="flex justify-center items-center py-8">
      <ThemeSwitch />
    </div>
  )
}
