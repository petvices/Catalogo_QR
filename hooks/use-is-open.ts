"use client"

import { useEffect, useState } from "react"

export type BusinessHours = {
  [day: string]: {
    open: string
    close: string
    isOpen: boolean
  }
}

export function useIsOpen(businessHours: BusinessHours | null | undefined) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!businessHours) return

    const now = new Date()
    const localDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const today = businessHours[localDay]
    if (!today || !today.isOpen) {
      setIsOpen(false)
      return
    }

    const [openHour, openMinute] = today.open.split(":").map(Number)
    const [closeHour, closeMinute] = today.close.split(":").map(Number)

    const openMinutes = openHour * 60 + openMinute
    const closeMinutes = closeHour * 60 + closeMinute

    setIsOpen(currentMinutes >= openMinutes && currentMinutes < closeMinutes)
  }, [businessHours])

  return isOpen
}
