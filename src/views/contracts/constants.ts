// Contract constants - using enums from @/constants/enums

import {
  ContractType,
  ContractTypeLabel,
  ContractStatus,
  ContractStatusLabel,
  SalaryTypeLabel,
  enumToOptions,
} from '@/constants/enums'

// Contract Type options for filter dropdown
export const CONTRACT_TYPE_OPTIONS = enumToOptions(ContractTypeLabel)

// Contract Type tag type (Element Plus tag types)
type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'

export const CONTRACT_TYPE_TAG_TYPE: Record<ContractType, TagType> = {
  [ContractType.PROBATION]: 'warning', // Tag vàng
  [ContractType.OFFICIAL]: 'success', // Tag xanh
  [ContractType.SEASONAL]: 'info', // Tag xám
}

// Contract Type labels (re-export for convenience)
export const CONTRACT_TYPE_LABELS = ContractTypeLabel

// Contract Status options for filter dropdown
export const CONTRACT_STATUS_OPTIONS = enumToOptions(ContractStatusLabel)

// Contract Status tag type
export const CONTRACT_STATUS_TAG_TYPE: Record<ContractStatus, TagType> = {
  [ContractStatus.ACTIVE]: 'success', // Tag xanh
  [ContractStatus.EXPIRED]: 'info', // Tag xám
}

// Contract Status labels (re-export for convenience)
export const CONTRACT_STATUS_LABELS = ContractStatusLabel

// Salary Type labels (re-export for convenience)
export const SALARY_TYPE_LABELS = SalaryTypeLabel
