// CPF validation
export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "")

  if (cpf.length !== 11) return false

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cpf.charAt(9))) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cpf.charAt(10))) return false

  return true
}

// CNPJ validation
export function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, "")

  if (cnpj.length !== 14) return false

  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Validate first check digit
  let sum = 0
  let weight = 2
  for (let i = 11; i >= 0; i--) {
    sum += Number.parseInt(cnpj.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  let remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder
  if (firstDigit !== Number.parseInt(cnpj.charAt(12))) return false

  // Validate second check digit
  sum = 0
  weight = 2
  for (let i = 12; i >= 0; i--) {
    sum += Number.parseInt(cnpj.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  remainder = sum % 11
  const secondDigit = remainder < 2 ? 0 : 11 - remainder
  if (secondDigit !== Number.parseInt(cnpj.charAt(13))) return false

  return true
}

// Format CPF
export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/\D/g, "")
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2")
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2")
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  return cpf
}

// Format CNPJ
export function formatCNPJ(cnpj: string): string {
  cnpj = cnpj.replace(/\D/g, "")
  cnpj = cnpj.replace(/(\d{2})(\d)/, "$1.$2")
  cnpj = cnpj.replace(/(\d{3})(\d)/, "$1.$2")
  cnpj = cnpj.replace(/(\d{3})(\d)/, "$1/$2")
  cnpj = cnpj.replace(/(\d{4})(\d{1,2})$/, "$1-$2")
  return cnpj
}
