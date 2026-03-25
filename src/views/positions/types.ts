// Position types - aligned with BE API v2

export type PositionLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR'
export type PositionStatus = 'ACTIVE' | 'INACTIVE'

export interface Position {
  id: string
  code: string
  name: string
  description?: string
  level?: PositionLevel
  status: PositionStatus
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

// Search request (POST /positions/search)
export interface PositionSearchRequest {
  code?: string
  name?: string
  level?: string
  status?: string
  page: number
  size: number
  sort?: string
}

// Create/Update request
export interface PositionFormData {
  code: string
  name: string
  description?: string
  level?: string
  status: string
}
