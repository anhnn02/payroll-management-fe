// Position constants - using common enums from @/constants/enums

import { Status, StatusLabel, enumToOptions } from '@/constants/enums'

// Status options for filter dropdown
export const POSITION_STATUS_OPTIONS = enumToOptions(StatusLabel)

// Status labels
export const POSITION_STATUS_LABELS = StatusLabel

// Status tag type (Element Plus tag types)
type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'

export const POSITION_STATUS_TAG_TYPE: Record<Status, TagType> = {
  [Status.ACTIVE]: 'success', // Tag xanh
  [Status.INACTIVE]: 'info', // Tag xám
}
