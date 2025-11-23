// 조직 트리 구조 조회 API
export default defineEventHandler(async (event) => {
  try {
    console.log('조직 트리 구조 API 호출됨')
    
    // 실제 구현에서는 데이터베이스에서 조직과 직원 정보를 조회
    const organizationTree = [
      {
        id: 'org-1',
        name: '경영진',
        type: 'organization',
        description: '회사 경영진',
        expanded: false,
        employees: [
          {
            id: 1,
            name: '김대표',
            email: 'ceo@company.com',
            role: 'CEO',
            status: 'active',
            type: 'employee',
            organizationId: 'org-1',
            position: '대표이사'
          },
          {
            id: 2,
            name: '이부사장',
            email: 'vp@company.com',
            role: '부사장',
            status: 'active',
            type: 'employee',
            organizationId: 'org-1',
            position: '부사장'
          }
        ],
        subOrganizations: []
      },
      {
        id: 'org-2',
        name: '개발팀',
        type: 'organization',
        description: 'IT 개발 부서',
        expanded: false,
        employees: [
          {
            id: 3,
            name: '박팀장',
            email: 'dev-manager@company.com',
            role: '팀장',
            status: 'active',
            type: 'employee',
            organizationId: 'org-2',
            position: '개발팀장'
          },
          {
            id: 4,
            name: '최개발자',
            email: 'dev@company.com',
            role: '개발자',
            status: 'active',
            type: 'employee',
            organizationId: 'org-2',
            position: '선임개발자'
          },
          {
            id: 5,
            name: '정개발자',
            email: 'dev2@company.com',
            role: '개발자',
            status: 'active',
            type: 'employee',
            organizationId: 'org-2',
            position: '주니어개발자'
          },
          {
            id: 6,
            name: '김인턴',
            email: 'intern@company.com',
            role: '인턴',
            status: 'active',
            type: 'employee',
            organizationId: 'org-2',
            position: '인턴'
          }
        ],
        subOrganizations: []
      },
      {
        id: 'org-3',
        name: '디자인팀',
        type: 'organization',
        description: 'UI/UX 디자인 부서',
        expanded: false,
        employees: [
          {
            id: 7,
            name: '이디자이너',
            email: 'designer@company.com',
            role: '디자이너',
            status: 'active',
            type: 'employee',
            organizationId: 'org-3',
            position: 'UI/UX 디자이너'
          },
          {
            id: 8,
            name: '홍디자이너',
            email: 'designer2@company.com',
            role: '디자이너',
            status: 'active',
            type: 'employee',
            organizationId: 'org-3',
            position: '그래픽 디자이너'
          }
        ],
        subOrganizations: []
      },
      {
        id: 'org-4',
        name: '영업팀',
        type: 'organization',
        description: '영업 및 마케팅 부서',
        expanded: false,
        employees: [
          {
            id: 9,
            name: '송영업',
            email: 'sales@company.com',
            role: '영업',
            status: 'active',
            type: 'employee',
            organizationId: 'org-4',
            position: '영업대표'
          },
          {
            id: 10,
            name: '윤마케터',
            email: 'marketing@company.com',
            role: '마케터',
            status: 'active',
            type: 'employee',
            organizationId: 'org-4',
            position: '마케팅 전문가'
          }
        ],
        subOrganizations: []
      },
      {
        id: 'org-5',
        name: '관리본부',
        type: 'organization',
        description: '전사 관리 업무 총괄',
        expanded: false,
        employees: [
          {
            id: 11,
            name: '박본부장',
            email: 'director@company.com',
            role: '본부장',
            status: 'active',
            type: 'employee',
            organizationId: 'org-5',
            position: '관리본부장'
          }
        ],
        subOrganizations: [
          {
            id: 'org-5-1',
            name: '관리팀',
            type: 'organization',
            description: '시스템 관리 및 운영',
            expanded: false,
            employees: [
              {
                id: 12,
                name: '조관리자',
                email: 'admin@company.com',
                role: '관리자',
                status: 'active',
                type: 'employee',
                organizationId: 'org-5-1',
                position: '시스템 관리자'
              },
              {
                id: 13,
                name: '한인사',
                email: 'hr@company.com',
                role: '인사',
                status: 'active',
                type: 'employee',
                organizationId: 'org-5-1',
                position: '인사담당자'
              },
              {
                id: 14,
                name: '신회계',
                email: 'accounting@company.com',
                role: '회계',
                status: 'inactive',
                type: 'employee',
                organizationId: 'org-5-1',
                position: '회계담당자'
              }
            ],
            subOrganizations: []
          }
        ]
      }
    ]
    
    // 통계 계산 (하위 조직 포함)
    const countOrganizations = (orgs) => {
      return orgs.reduce((count, org) => {
        return count + 1 + (org.subOrganizations ? countOrganizations(org.subOrganizations) : 0)
      }, 0)
    }
    
    const countEmployees = (orgs) => {
      return orgs.reduce((count, org) => {
        const orgEmployees = org.employees.length
        const subOrgEmployees = org.subOrganizations ? countEmployees(org.subOrganizations) : 0
        return count + orgEmployees + subOrgEmployees
      }, 0)
    }
    
    const countActiveEmployees = (orgs) => {
      return orgs.reduce((count, org) => {
        const activeOrgEmployees = org.employees.filter(emp => emp.status === 'active').length
        const activeSubOrgEmployees = org.subOrganizations ? countActiveEmployees(org.subOrganizations) : 0
        return count + activeOrgEmployees + activeSubOrgEmployees
      }, 0)
    }
    
    const totalOrganizations = countOrganizations(organizationTree)
    const totalEmployees = countEmployees(organizationTree)
    const activeEmployees = countActiveEmployees(organizationTree)
    
    return {
      success: true,
      message: 'Organization tree retrieved successfully',
      data: organizationTree,
      metadata: {
        totalOrganizations,
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        averageEmployeesPerOrg: Math.round(totalEmployees / totalOrganizations)
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('조직 트리 구조 API 오류:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        success: false,
        message: 'Failed to retrieve organization tree',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })
  }
})
