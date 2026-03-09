import { parseCurrency } from './formatContent'

/**
 * Validation rule: bắt buộc nhập
 */
const required = (fieldLabel: string) => ({
  required: true,
  message: `Vui lòng nhập ${fieldLabel}`,
  trigger: 'blur',
})

/**
 * Validation rule: giá trị tiền tệ phải > 0
 * Dùng cho el-input dạng string formatted ("25,000,000")
 */
const currencyPositive = (fieldLabel: string) => ({
  validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    const num = parseCurrency(value)
    if (num <= 0) {
      callback(new Error(`${fieldLabel} phải lớn hơn 0`))
    } else {
      callback()
    }
  },
  trigger: 'blur',
})

/**
 * Validation rule: chỉ chứa ký tự số và dấu phẩy
 */
const currencyFormat = () => ({
  validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (value && /[^\d,.]/.test(value)) {
      callback(new Error('Chỉ được nhập số'))
    } else {
      callback()
    }
  },
  trigger: 'change',
})

/**
 * Tạo validation rules cho field tiền tệ
 *
 * @example
 * const rules = {
 *   minSalary: createCurrencyRules('Lương tối thiểu'),
 *   maxSalary: createCurrencyRules('Lương tối đa'),
 * }
 */
export const createCurrencyRules = (fieldLabel: string) => [
  required(fieldLabel),
  currencyFormat(),
  currencyPositive(fieldLabel),
]

/**
 * Validation rule: so sánh 2 field tiền tệ (dạng string formatted)
 *
 * @example
 * maxSalary: [
 *   ...createCurrencyRules('Lương tối đa'),
 *   currencyGreaterThan(() => form.value.minSalary, 'Lương tối đa phải lớn hơn lương tối thiểu'),
 * ]
 */
export const currencyGreaterThan = (getCompareValue: () => string, message: string) => ({
  validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    const current = parseCurrency(value)
    const compare = parseCurrency(getCompareValue())
    if (current <= compare) {
      callback(new Error(message))
    } else {
      callback()
    }
  },
  trigger: 'blur',
})
