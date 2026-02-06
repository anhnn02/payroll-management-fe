export enum ERROR_CODES {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  ABORTED = 'ABORTED',

  // HTTP errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

const ERROR_MESSAGES: Record<string | number, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  [ERROR_CODES.TIMEOUT]: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
  [ERROR_CODES.ABORTED]: 'Yêu cầu đã bị hủy.',
  [ERROR_CODES.BAD_REQUEST]: 'Yêu cầu không hợp lệ.',
  [ERROR_CODES.UNAUTHORIZED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [ERROR_CODES.FORBIDDEN]: 'Bạn không có quyền truy cập tài nguyên này.',
  [ERROR_CODES.NOT_FOUND]: 'Không tìm thấy dữ liệu.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ.',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Dịch vụ đang bảo trì. Vui lòng thử lại sau.',
}

export function getErrorMessage(code: string | number, fallback?: string): string {
  return ERROR_MESSAGES[code] || fallback || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
