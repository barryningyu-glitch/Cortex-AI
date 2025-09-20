/**
 * 处理API错误响应，确保返回字符串格式的错误消息
 * @param {any} errorData - API返回的错误数据
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 格式化的错误消息
 */
export function formatErrorMessage(errorData, defaultMessage = '操作失败') {
  if (!errorData) {
    return defaultMessage
  }

  // 如果errorData本身就是字符串
  if (typeof errorData === 'string') {
    return errorData
  }

  // 如果有detail字段
  if (errorData.detail) {
    if (typeof errorData.detail === 'string') {
      return errorData.detail
    } else if (Array.isArray(errorData.detail)) {
      // 处理验证错误数组 (FastAPI validation errors)
      return errorData.detail
        .map(err => err.msg || err.message || '验证错误')
        .join(', ')
    } else if (typeof errorData.detail === 'object') {
      // 处理错误对象
      return errorData.detail.msg || 
             errorData.detail.message || 
             JSON.stringify(errorData.detail)
    }
  }

  // 如果有message字段
  if (errorData.message && typeof errorData.message === 'string') {
    return errorData.message
  }

  // 如果有msg字段
  if (errorData.msg && typeof errorData.msg === 'string') {
    return errorData.msg
  }

  // 如果是对象但没有识别的字段，尝试JSON序列化
  if (typeof errorData === 'object') {
    try {
      return JSON.stringify(errorData)
    } catch {
      return defaultMessage
    }
  }

  return defaultMessage
}

/**
 * 处理fetch响应中的错误
 * @param {Response} response - fetch响应对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {Promise<string>} 格式化的错误消息
 */
export async function handleApiError(response, defaultMessage = '操作失败') {
  try {
    const errorData = await response.json()
    return formatErrorMessage(errorData, defaultMessage)
  } catch {
    // 如果无法解析JSON，返回状态文本或默认消息
    return response.statusText || defaultMessage
  }
}