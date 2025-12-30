"use client"

import { logout } from "@/app/actions/logout"

export function DashboardHeader({ userName, companyName }) {
  return (
    <header>
      <span>{companyName}</span>
      <form action={logout}>
        <button>Sair</button>
      </form>
    </header>
  )
}
