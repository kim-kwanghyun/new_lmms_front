import { ref, readonly, nextTick } from 'vue'

/**
 * Manual pages common functionality
 */
export const useManual = () => {
  // Common reactive data
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Handle API errors consistently
   */
  const handleError = (err: any, defaultMessage = '오류가 발생했습니다') => {
    console.error('API Error:', err)
    const message = err?.data?.message || err?.message || defaultMessage
    error.value = message
    alert(message)
  }

  /**
   * Reset error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Show success message and optionally refresh
   */
  const showSuccess = (message: string, refreshFn?: () => Promise<void>) => {
    alert(message)
    if (refreshFn) {
      refreshFn()
    }
  }

  /**
   * Validate required fields
   */
  const validateRequired = (fields: Record<string, any>, fieldNames: string[]) => {
    for (const fieldName of fieldNames) {
      if (!fields[fieldName] || fields[fieldName].toString().trim() === '') {
        alert(`${fieldName}을(를) 입력해주세요.`)
        return false
      }
    }
    return true
  }

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('ko-KR')
    } catch {
      return dateString
    }
  }

  /**
   * Format number with commas
   */
  const formatNumber = (num: number | string) => {
    if (!num) return '0'
    return Number(num).toLocaleString('ko-KR')
  }

  /**
   * Download Excel file
   */
  const downloadExcel = async (url: string, filename?: string) => {
    try {
      loading.value = true
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('다운로드에 실패했습니다')
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'export.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      showSuccess('엑셀 다운로드가 완료되었습니다')
    } catch (err) {
      handleError(err, '엑셀 다운로드 중 오류가 발생했습니다')
    } finally {
      loading.value = false
    }
  }

  /**
   * Upload Excel file
   */
  const uploadExcel = async (file: File, uploadUrl: string) => {
    if (!file) {
      alert('파일을 선택해주세요.')
      return null
    }
    
    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      alert('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.')
      return null
    }
    
    try {
      loading.value = true
      
      const formData = new FormData()
      formData.append('excelFile', file)
      
      const response = await (globalThis as any).$fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })
      
      return response
    } catch (err) {
      handleError(err, '파일 업로드 중 오류가 발생했습니다')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Generic API call with error handling
   */
  const apiCall = async <T>(
    url: string, 
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      headers?: Record<string, string>
    } = {}
  ): Promise<T | null> => {
    try {
      loading.value = true
      clearError()
      
      const response = await (globalThis as any).$fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body
      })
      
      return response as T
    } catch (err) {
      handleError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialize datatable (if needed for legacy support)
   */
  const initDataTable = (tableSelector: string) => {
    if (typeof window !== 'undefined') {
      nextTick(() => {
        // Initialize datatable if the library is available
        const $ = (window as any).$
        if ($ && $.fn && $.fn.DataTable) {
          $(tableSelector).DataTable({
            language: {
              url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/ko.json'
            }
          })
        }
      })
    }
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    
    // Methods
    handleError,
    clearError,
    showSuccess,
    validateRequired,
    formatDate,
    formatNumber,
    downloadExcel,
    uploadExcel,
    apiCall,
    initDataTable
  }
}
