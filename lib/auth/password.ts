// Utilitários para hash e verificação de senhas
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function validatePassword(password: string): {
  valid: boolean
  error?: string
} {
  if (password.length < 6) {
    return { valid: false, error: "A senha deve ter no mínimo 6 caracteres" }
  }
  return { valid: true }
}
