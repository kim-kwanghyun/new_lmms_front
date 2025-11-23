// 공지사항 관련 컴포저블
export interface Notice {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt?: string
  status: 'active' | 'inactive'
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface NoticeResponse {
  data: Notice[]
  pagination: PaginationInfo
}

export const useNotices = () => {
  const api = useApi()

  // 공지사항 목록 조회
  const getNotices = async (page: number = 1, limit: number = 10): Promise<NoticeResponse> => {
    try {
      const response = await api.get<any>('/api/v1/notices', { page, limit })
      
      // 다양한 응답 형태 처리
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(response.length / limit),
            totalItems: response.length,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
      } else if (response.data && Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: response.pagination || {
            currentPage: page,
            totalPages: Math.ceil(response.data.length / limit),
            totalItems: response.data.length,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
      } else {
        throw new Error('예상하지 못한 API 응답 구조입니다.')
      }
    } catch (error) {
      console.error('공지사항 목록 조회 실패:', error)
      throw error
    }
  }

  // 공지사항 상세 조회
  const getNotice = async (id: number): Promise<Notice> => {
    try {
      return await api.get<Notice>(`/api/v1/notices/${id}`)
    } catch (error) {
      console.error('공지사항 상세 조회 실패:', error)
      throw error
    }
  }

  // 공지사항 생성
  const createNotice = async (notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notice> => {
    try {
      return await api.post<Notice>('/api/v1/notices', notice)
    } catch (error) {
      console.error('공지사항 생성 실패:', error)
      throw error
    }
  }

  // 공지사항 수정
  const updateNotice = async (id: number, notice: Partial<Notice>): Promise<Notice> => {
    try {
      return await api.put<Notice>(`/api/v1/notices/${id}`, notice)
    } catch (error) {
      console.error('공지사항 수정 실패:', error)
      throw error
    }
  }

  // 공지사항 삭제
  const deleteNotice = async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/v1/notices/${id}`)
    } catch (error) {
      console.error('공지사항 삭제 실패:', error)
      throw error
    }
  }

  // 공지사항 검색
  const searchNotices = async (keyword: string, page: number = 1, limit: number = 10): Promise<NoticeResponse> => {
    try {
      return await api.get<NoticeResponse>('/api/v1/notices/search', { 
        keyword, 
        page, 
        limit 
      })
    } catch (error) {
      console.error('공지사항 검색 실패:', error)
      // 검색 API가 없는 경우 클라이언트 사이드 필터링
      const allNotices = await getNotices(1, 1000) // 모든 데이터 가져오기
      const filteredData = allNotices.data.filter(notice => 
        notice.title.toLowerCase().includes(keyword.toLowerCase()) ||
        notice.content.toLowerCase().includes(keyword.toLowerCase())
      )
      
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      return {
        data: paginatedData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredData.length / limit),
          totalItems: filteredData.length,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(filteredData.length / limit),
          hasPreviousPage: page > 1
        }
      }
    }
  }

  return {
    getNotices,
    getNotice,
    createNotice,
    updateNotice,
    deleteNotice,
    searchNotices
  }
}