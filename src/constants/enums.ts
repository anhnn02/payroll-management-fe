// src/constants/enums.ts
// Common enums & labels - aligned with BE (FE-API-CONFIG.md Section 3)

// ===== Trạng thái chung =====
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const StatusLabel: Record<Status, string> = {
  [Status.ACTIVE]: 'Hoạt động',
  [Status.INACTIVE]: 'Ngừng hoạt động',
}

// ===== Giới tính =====
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: 'Nam',
  [Gender.FEMALE]: 'Nữ',
  [Gender.OTHER]: 'Khác',
}

export const GENDER_OPTIONS = Object.entries(GenderLabel).map(([value, label]) => ({
  value,
  label,
}))

// ===== Vai trò người dùng =====
export enum UserRole {
  HR_MANAGER = 'HR_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.HR_MANAGER]: 'Nhân sự',
  [UserRole.ACCOUNTANT]: 'Kế toán',
}

// ===== Trạng thái User =====
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Hoạt động',
  [UserStatus.INACTIVE]: 'Ngừng hoạt động',
  [UserStatus.LOCKED]: 'Đã khóa',
}

// ===== Trạng thái nhân viên =====
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const EmployeeStatusLabel: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE]: 'Đang làm việc',
  [EmployeeStatus.INACTIVE]: 'Nghỉ việc',
}

// ===== Loại hợp đồng =====
export enum ContractType {
  PROBATION = 'PROBATION',
  OFFICIAL = 'OFFICIAL',
  SEASONAL = 'SEASONAL',
}

export const ContractTypeLabel: Record<ContractType, string> = {
  [ContractType.PROBATION]: 'Thử việc',
  [ContractType.OFFICIAL]: 'Chính thức',
  [ContractType.SEASONAL]: 'Thời vụ',
}

// ===== Trạng thái hợp đồng =====
export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

// ===== Loại lương =====
export enum SalaryType {
  GROSS = 'GROSS',
  NET = 'NET',
}

// ===== Trạng thái Payroll =====
export enum PayrollStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

export const PayrollStatusLabel: Record<PayrollStatus, string> = {
  [PayrollStatus.UNPAID]: 'Chưa thanh toán',
  [PayrollStatus.PAID]: 'Đã thanh toán',
}

// ===== Cấp bậc =====
export enum PositionLevel {
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
}

// ===== Loại tăng ca =====
export enum OtType {
  WEEKDAY = 'WEEKDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
  HOLIDAY = 'HOLIDAY',
}

// ===== Tình trạng hôn nhân =====
export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export const MaritalStatusLabel: Record<MaritalStatus, string> = {
  [MaritalStatus.SINGLE]: 'Độc thân',
  [MaritalStatus.MARRIED]: 'Đã kết hôn',
  [MaritalStatus.DIVORCED]: 'Đã ly hôn',
  [MaritalStatus.WIDOWED]: 'Góa',
}

// ===== Loại nhân viên =====
export enum EmployeeType {
  FULLTIME = 'FULLTIME',
  PARTTIME = 'PARTTIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export const EmployeeTypeLabel: Record<EmployeeType, string> = {
  [EmployeeType.FULLTIME]: 'Toàn thời gian',
  [EmployeeType.PARTTIME]: 'Bán thời gian',
  [EmployeeType.CONTRACT]: 'Hợp đồng',
  [EmployeeType.INTERN]: 'Thực tập',
}

// ===== Loại phụ cấp =====
export enum AllowanceType {
  LUNCH = 'LUNCH',
  TRANSPORT = 'TRANSPORT',
  PHONE = 'PHONE',
  HOUSING = 'HOUSING',
  RESPONSIBILITY = 'RESPONSIBILITY',
}

export const AllowanceTypeLabel: Record<AllowanceType, string> = {
  [AllowanceType.LUNCH]: 'Phụ cấp ăn trưa',
  [AllowanceType.TRANSPORT]: 'Phụ cấp đi lại',
  [AllowanceType.PHONE]: 'Phụ cấp điện thoại',
  [AllowanceType.HOUSING]: 'Phụ cấp nhà ở',
  [AllowanceType.RESPONSIBILITY]: 'Phụ cấp trách nhiệm',
}

// ===== Ngân hàng =====
export enum BankCode {
  VCB = 'VCB',
  TCB = 'TCB',
  BIDV = 'BIDV',
  VTB = 'VTB',
  ACB = 'ACB',
  MB = 'MB',
  VPB = 'VPB',
  TPB = 'TPB',
}

export const BankLabel: Record<BankCode, string> = {
  [BankCode.VCB]: 'Vietcombank',
  [BankCode.TCB]: 'Techcombank',
  [BankCode.BIDV]: 'BIDV',
  [BankCode.VTB]: 'Vietinbank',
  [BankCode.ACB]: 'ACB',
  [BankCode.MB]: 'MB Bank',
  [BankCode.VPB]: 'VPBank',
  [BankCode.TPB]: 'TPBank',
}

// ===== Helper: Tạo options từ enum label =====
export function enumToOptions<T extends string>(
  labelMap: Record<T, string>
): { value: T; label: string }[] {
  return Object.entries(labelMap).map(([value, label]) => ({
    value: value as T,
    label: label as string,
  }))
}
