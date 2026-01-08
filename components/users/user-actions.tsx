"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, KeyRound, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deactivateUserAction } from "@/lib/auth/user.actions"
import { EditUserDialog } from "./edit-user-dialog"
import { ChangePasswordDialog } from "./change-password-dialog"


interface UserActionsProps {
    user: {
        id: string
        full_name: string
        email: string
        role: string
        is_active?: boolean
    }
}

export function UserActions({ user }: UserActionsProps) {
    const [loading, setLoading] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [passwordOpen, setPasswordOpen] = useState(false)


    async function handleDeactivate() {
        if (!confirm(`Deseja desativar o usuário ${user.full_name}?`)) return

        setLoading(true)
        const result = await deactivateUserAction(user.id)
        setLoading(false)

        if (!result.success) {
            alert(result.error)
            return
        }

        window.location.reload()
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation()
                            setEditOpen(true)
                        }}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar usuário
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Trocar senha
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDeactivate()
                        }}
                    >
                        <Ban className="mr-2 h-4 w-4" />
                        Desativar usuário
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* MODAL EDITAR USUÁRIO */}
            <EditUserDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                user={{
                    id: user.id,
                    full_name: user.full_name,
                    role: user.role,
                    is_active: user.is_active ?? true,
                }}
            />
            <ChangePasswordDialog
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
                userId={user.id}
                userName={user.full_name}
            />
        </>
    )
}
