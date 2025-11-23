<template>
  <div class="main-content">
    <Head>
      <title>돼지 입출고 관리 - LSMMS</title>
    </Head>

    <div class="container-fluid">
      <!-- 페이지 헤더 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0 text-gray-800">
              <i class="bi bi-piggy-bank me-2"></i>돼지 입출고 관리
            </h1>
            <div class="btn-group">
              <button 
                class="btn btn-success"
                @click="showPigModal('register')"
              >
                <i class="bi bi-plus-circle me-1"></i>
                돼지 입고
              </button>
              <button 
                class="btn btn-info"
                @click="showAllTransactionsModal()"
              >
                <i class="bi bi-list-ul me-1"></i>
                거래내역
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 현황 요약 카드 -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    사육중
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ summary.breeding || 0 }}마리
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-piggy-bank fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                    출고완료
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ summary.checkout || 0 }}마리
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-truck fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-warning shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    평균 체중
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ summary.avgWeight || 0 }}kg
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-weight fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-info shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                    총 축사방
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ summary.totalRooms || 0 }}개
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-home fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 검색 및 필터 -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-body">
              <div class="row g-3 align-items-end">
                <div class="col-md-3">
                  <label for="searchInput" class="form-label">검색</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="searchInput"
                      v-model="searchText"
                      placeholder="돼지ID, 태그번호, 이름"
                      @keyup.enter="searchPigs"
                    >
                  </div>
                </div>
                <div class="col-md-2">
                  <label for="roomFilter" class="form-label">축사번호</label>
                  <select 
                    class="form-select" 
                    id="roomFilter"
                    v-model="roomFilter"
                  >
                    <option value="">전체</option>
                    <option v-for="room in availableRooms" :key="room" :value="room">
                      {{ room }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label for="statusFilter" class="form-label">상태</label>
                  <select 
                    class="form-select" 
                    id="statusFilter"
                    v-model="statusFilter"
                  >
                    <option value="">전체</option>
                    <option value="사육중">사육중</option>
                    <option value="출고">출고</option>
                    <option value="폐사">폐사</option>
                    <option value="이동">이동</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label for="healthFilter" class="form-label">건강상태</label>
                  <select 
                    class="form-select" 
                    id="healthFilter"
                    v-model="healthFilter"
                  >
                    <option value="">전체</option>
                    <option value="정상">정상</option>
                    <option value="치료중">치료중</option>
                    <option value="격리">격리</option>
                    <option value="관찰">관찰</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <div class="btn-group w-100">
                    <button 
                      class="btn btn-outline-primary"
                      @click="searchPigs"
                    >
                      <i class="bi bi-search me-1"></i>검색
                    </button>
                    <button 
                      class="btn btn-outline-secondary"
                      @click="resetSearch"
                    >
                      <i class="bi bi-arrow-clockwise me-1"></i>초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 돼지 목록 테이블 -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-list-ul me-2"></i>돼지 목록
                <span class="badge bg-primary ms-2">{{ pagination.total }}마리</span>
              </h5>
              <div class="text-muted">
                <small>{{ pagination.page }}/{{ pagination.totalPages }} 페이지</small>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 8%">번호</th>
                      <th style="width: 12%">돼지ID</th>
                      <th style="width: 10%">태그번호</th>
                      <th style="width: 10%">축사번호</th>
                      <th style="width: 8%">상태</th>
                      <th style="width: 8%">품종</th>
                      <th style="width: 6%">성별</th>
                      <th style="width: 8%">현재체중</th>
                      <th style="width: 8%">일령</th>
                      <th style="width: 8%">건강상태</th>
                      <th style="width: 14%">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(pig, index) in pigs" :key="pig.pig_id">
                      <td>
                        <span class="fw-bold text-primary">
                          {{ (pagination.page - 1) * pagination.limit + index + 1 }}
                        </span>
                      </td>
                      <td>
                        <code class="bg-light text-dark px-2 py-1 rounded">
                          {{ pig.pig_id }}
                        </code>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ pig.pig_tag || '-' }}</span>
                      </td>
                      <td>
                        <span v-if="pig.current_room_number" class="badge bg-info">
                          {{ pig.current_room_number }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-success': pig.pig_status === '사육중',
                            'bg-primary': pig.pig_status === '출고',
                            'bg-danger': pig.pig_status === '폐사',
                            'bg-warning': pig.pig_status === '이동'
                          }"
                        >
                          {{ pig.pig_status }}
                        </span>
                      </td>
                      <td>{{ pig.breed || '-' }}</td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-primary': pig.gender === '수컷',
                            'bg-danger': pig.gender === '암컷',
                            'bg-secondary': pig.gender === '거세'
                          }"
                        >
                          {{ pig.gender }}
                        </span>
                      </td>
                      <td>
                        <strong>{{ pig.current_weight || '-' }}kg</strong>
                      </td>
                      <td>{{ pig.age_days || '-' }}일</td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-success': pig.health_status === '정상',
                            'bg-warning': pig.health_status === '치료중',
                            'bg-danger': pig.health_status === '격리',
                            'bg-info': pig.health_status === '관찰'
                          }"
                        >
                          {{ pig.health_status }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-info" 
                            @click="viewPig(pig)"
                            title="상세보기"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            v-if="pig.pig_status === '사육중'"
                            class="btn btn-outline-primary" 
                            @click="showPigModal('checkout', pig)"
                            title="출고"
                          >
                            <i class="bi bi-box-arrow-right"></i>
                          </button>
                          <button 
                            class="btn btn-outline-secondary" 
                            @click="viewTransactions(pig.pig_id)"
                            title="거래내역"
                          >
                            <i class="bi bi-list-ul"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="pigs.length === 0">
                      <td colspan="11" class="text-center text-muted py-4">
                        <i class="bi bi-piggy-bank me-2"></i>
                        등록된 돼지가 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 페이지네이션 -->
            <div class="card-footer" v-if="pagination.totalPages > 1">
              <nav aria-label="돼지 목록 페이지네이션">
                <ul class="pagination pagination-sm justify-content-center mb-0">
                  <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                    <button 
                      class="page-link" 
                      @click="changePage(pagination.page - 1)"
                      :disabled="pagination.page <= 1"
                    >
                      이전
                    </button>
                  </li>
                  
                  <li 
                    v-for="page in getPageNumbers()" 
                    :key="page"
                    class="page-item" 
                    :class="{ active: pagination.page === page }"
                  >
                    <button class="page-link" @click="changePage(page)">
                      {{ page }}
                    </button>
                  </li>
                  
                  <li class="page-item" :class="{ disabled: pagination.page >= pagination.totalPages }">
                    <button 
                      class="page-link" 
                      @click="changePage(pagination.page + 1)"
                      :disabled="pagination.page >= pagination.totalPages"
                    >
                      다음
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 돼지 입고/출고 모달 -->
    <div 
      class="modal fade" 
      id="pigModal" 
      tabindex="-1" 
      ref="pigModalRef"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-piggy-bank me-2"></i>
              {{ modalMode === 'register' ? '돼지 입고 등록' : 
                 modalMode === 'checkout' ? '돼지 출고 처리' : '돼지 정보' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- 입고 등록 폼 -->
            <form v-if="modalMode === 'register'" @submit.prevent="registerPig">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="pigId" class="form-label">
                    돼지 ID <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="pigId"
                    v-model="pigForm.pig_id"
                    required
                    maxlength="50"
                    placeholder="예: PIG-A001-001"
                    :class="{ 'is-invalid': pigForm.pig_id && pigForm.pig_id.length < 3 }"
                  >
                  <div v-if="pigForm.pig_id && pigForm.pig_id.length < 3" class="invalid-feedback">
                    돼지 ID는 최소 3자 이상 입력해주세요.
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="pigTag" class="form-label">태그번호</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="pigTag"
                    v-model="pigForm.pig_tag"
                    maxlength="30"
                    placeholder="예: TAG-001"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="pigName" class="form-label">돼지 이름</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="pigName"
                    v-model="pigForm.pig_name"
                    maxlength="100"
                    placeholder="예: 돼지1호"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="entryRoom" class="form-label">
                    입고 축사번호 <span class="text-danger">*</span>
                  </label>
                  <select 
                    class="form-select" 
                    id="entryRoom"
                    v-model="pigForm.entry_room_number"
                    required
                    :class="{ 'is-invalid': !pigForm.entry_room_number }"
                  >
                    <option value="">축사번호를 선택하세요</option>
                    <option v-for="room in availableRooms" :key="room" :value="room">
                      {{ room }}
                    </option>
                  </select>
                  <div v-if="!pigForm.entry_room_number" class="invalid-feedback">
                    축사번호를 선택해주세요.
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="breed" class="form-label">품종</label>
                  <select class="form-select" id="breed" v-model="pigForm.breed">
                    <option value="">품종 선택</option>
                    <option value="YLD 돼지">YLD 돼지</option>                    
                    <option value="랜드레이스">랜드레이스</option>
                    <option value="듀록">듀록</option>
                    <option value="요크셔">요크셔</option>
                    <option value="버크셔">버크셔</option>
                    <option value="제주흙돼지">제주흙돼지</option>
                    <option value="제주흙돼지">제주흙돼지</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="gender" class="form-label">
                    성별 <span class="text-danger">*</span>
                  </label>
                  <select 
                    class="form-select" 
                    id="gender" 
                    v-model="pigForm.gender" 
                    required
                    :class="{ 'is-invalid': !pigForm.gender }"
                  >
                    <option value="">성별 선택</option>
                    <option value="수컷">수컷</option>
                    <option value="암컷">암컷</option>
                    <option value="거세">거세</option>
                  </select>
                  <div v-if="!pigForm.gender" class="invalid-feedback">
                    성별을 선택해주세요.
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="birthDate" class="form-label">출생일</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="birthDate"
                    v-model="pigForm.birth_date"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="entryWeight" class="form-label">입고 체중(kg)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="entryWeight"
                    v-model.number="pigForm.entry_weight"
                    step="0.1"
                    min="0"
                    max="1000"
                    placeholder="예: 25.5"
                  >
                  <div class="form-text">체중을 kg 단위로 입력하세요 (선택사항)</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="entryPrice" class="form-label">입고 단가(원)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="entryPrice"
                    v-model.number="pigForm.entry_price"
                    min="0"
                    max="10000000"
                    placeholder="예: 180000"
                  >
                  <div class="form-text">입고 단가를 원 단위로 입력하세요 (선택사항)</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="supplier" class="form-label">공급업체</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="supplier"
                  v-model="pigForm.supplier"
                  maxlength="100"
                  placeholder="공급업체명"
                >
              </div>
            </form>

            <!-- 출고 처리 폼 -->
            <form v-if="modalMode === 'checkout'" @submit.prevent="checkoutPig">
              <div class="alert alert-info">
                <strong>{{ selectedPig?.pig_id }}</strong> ({{ selectedPig?.pig_name || '이름 없음' }})를 출고 처리합니다.
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="exitReason" class="form-label">
                    출고 사유 <span class="text-danger">*</span>
                  </label>
                  <select 
                    class="form-select" 
                    id="exitReason"
                    v-model="checkoutForm.exit_reason"
                    required
                  >
                    <option value="">출고 사유 선택</option>
                    <option value="정상출하">정상출하</option>
                    <option value="도축">도축</option>
                    <option value="판매">판매</option>
                    <option value="폐사">폐사</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="exitDestination" class="form-label">
                    출고처 <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="exitDestination"
                    v-model="checkoutForm.exit_destination"
                    required
                    maxlength="100"
                    placeholder="출고처명"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="exitWeight" class="form-label">출고 체중(kg)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="exitWeight"
                    v-model="checkoutForm.exit_weight"
                    step="0.1"
                    min="0"
                    :placeholder="(selectedPig?.current_weight || 0).toString()"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="exitPrice" class="form-label">출고 단가(원)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="exitPrice"
                    v-model="checkoutForm.exit_price"
                    min="0"
                    placeholder="0"
                  >
                </div>
              </div>

              <div class="mb-3">
                <label for="notes" class="form-label">비고</label>
                <textarea 
                  class="form-control" 
                  id="notes"
                  v-model="checkoutForm.notes"
                  rows="3"
                  placeholder="특이사항이나 비고사항을 입력하세요"
                ></textarea>
              </div>
            </form>

            <!-- 상세보기 -->
            <div v-if="modalMode === 'view' && selectedPig">
              <div class="row">
                <div class="col-md-6">
                  <table class="table table-sm">
                    <tbody>
                      <tr><th>돼지 ID:</th><td>{{ selectedPig.pig_id }}</td></tr>
                      <tr><th>태그번호:</th><td>{{ selectedPig.pig_tag || '-' }}</td></tr>
                      <tr><th>이름:</th><td>{{ selectedPig.pig_name || '-' }}</td></tr>
                      <tr><th>현재 축사:</th><td>{{ selectedPig.current_room_number || '-' }}</td></tr>
                      <tr><th>상태:</th><td>{{ selectedPig.pig_status }}</td></tr>
                      <tr><th>품종:</th><td>{{ selectedPig.breed || '-' }}</td></tr>
                      <tr><th>성별:</th><td>{{ selectedPig.gender }}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-sm">
                    <tbody>
                      <tr><th>현재 체중:</th><td>{{ selectedPig.current_weight || '-' }}kg</td></tr>
                      <tr><th>입고 체중:</th><td>{{ selectedPig.entry_weight || '-' }}kg</td></tr>
                      <tr><th>일령:</th><td>{{ selectedPig.age_days || '-' }}일</td></tr>
                      <tr><th>입고일:</th><td>{{ formatDate(selectedPig.entry_date) }}</td></tr>
                      <tr><th>건강상태:</th><td>{{ selectedPig.health_status }}</td></tr>
                      <tr><th>공급업체:</th><td>{{ selectedPig.supplier || '-' }}</td></tr>
                      <tr><th>담당자:</th><td>{{ selectedPig.manager_id }}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              {{ modalMode === 'view' ? '닫기' : '취소' }}
            </button>
            <button 
              v-if="modalMode === 'register'"
              type="button" 
              class="btn btn-success"
              @click="registerPig"
              :disabled="!pigForm.pig_id || !pigForm.entry_room_number || !pigForm.gender || 
                         pigForm.pig_id.length < 3 ||
                         (pigForm.entry_weight !== null && pigForm.entry_weight < 0) ||
                         (pigForm.entry_price !== null && pigForm.entry_price < 0)"
            >
              <i class="bi bi-check-circle me-1"></i>입고 등록
            </button>
            <button 
              v-if="modalMode === 'checkout'"
              type="button" 
              class="btn btn-primary"
              @click="checkoutPig"
              :disabled="!checkoutForm.exit_reason || !checkoutForm.exit_destination"
            >
              <i class="bi bi-box-arrow-right me-1"></i>출고 처리
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 거래내역 모달 -->
    <div 
      class="modal fade" 
      id="transactionModal" 
      tabindex="-1" 
      ref="transactionModalRef"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-list-ul me-2"></i>
              {{ transactionFilter.pig_id ? `${transactionFilter.pig_id} 거래내역` : '전체 거래내역' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- 거래내역 필터 -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label for="transactionType" class="form-label">거래 유형</label>
                <select 
                  class="form-select" 
                  id="transactionType"
                  v-model="transactionFilter.transaction_type"
                  @change="fetchTransactions"
                >
                  <option value="">전체</option>
                  <option value="입고">입고</option>
                  <option value="출고">출고</option>
                  <option value="체중측정">체중측정</option>
                  <option value="이동">이동</option>
                </select>
              </div>
              <div class="col-md-3">
                <label for="transactionStartDate" class="form-label">시작일</label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="transactionStartDate"
                  v-model="transactionFilter.start_date"
                  @change="fetchTransactions"
                >
              </div>
              <div class="col-md-3">
                <label for="transactionEndDate" class="form-label">종료일</label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="transactionEndDate"
                  v-model="transactionFilter.end_date"
                  @change="fetchTransactions"
                >
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button 
                  class="btn btn-outline-primary w-100"
                  @click="resetTransactionFilter"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>필터 초기화
                </button>
              </div>
            </div>

            <!-- 거래내역 통계 -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="card border-left-success">
                  <div class="card-body py-2">
                    <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                      입고 건수
                    </div>
                    <div class="h6 mb-0 font-weight-bold text-gray-800">
                      {{ transactionStats.입고 || 0 }}건
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-left-primary">
                  <div class="card-body py-2">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      출고 건수
                    </div>
                    <div class="h6 mb-0 font-weight-bold text-gray-800">
                      {{ transactionStats.출고 || 0 }}건
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-left-warning">
                  <div class="card-body py-2">
                    <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      체중측정
                    </div>
                    <div class="h6 mb-0 font-weight-bold text-gray-800">
                      {{ transactionStats.체중측정 || 0 }}건
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-left-info">
                  <div class="card-body py-2">
                    <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                      총 거래액
                    </div>
                    <div class="h6 mb-0 font-weight-bold text-gray-800">
                      {{ formatCurrency(transactionStats.totalAmount || 0) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 거래내역 테이블 -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>거래일시</th>
                    <th>돼지ID</th>
                    <th>태그번호</th>
                    <th>거래유형</th>
                    <th>축사번호</th>
                    <th>체중(kg)</th>
                    <th>단가(원)</th>
                    <th>총액(원)</th>
                    <th>거래처</th>
                    <th>담당자</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in transactions" :key="transaction.transaction_id">
                    <td>
                      <small>{{ formatDateTime(transaction.transaction_date) }}</small>
                    </td>
                    <td>
                      <code class="bg-light text-dark px-1 rounded">
                        {{ transaction.pig_id }}
                      </code>
                    </td>
                    <td>
                      <span class="badge bg-secondary">
                        {{ transaction.pig_tag || '-' }}
                      </span>
                    </td>
                    <td>
                      <span 
                        class="badge"
                        :class="{
                          'bg-success': transaction.transaction_type === '입고',
                          'bg-primary': transaction.transaction_type === '출고',
                          'bg-info': transaction.transaction_type === '체중측정',
                          'bg-warning': transaction.transaction_type === '이동'
                        }"
                      >
                        {{ transaction.transaction_type }}
                      </span>
                    </td>
                    <td>
                      <span v-if="transaction.transaction_type === '입고'">
                        {{ transaction.to_room_number || '-' }}
                      </span>
                      <span v-else-if="transaction.transaction_type === '출고'">
                        {{ transaction.from_room_number || '-' }}
                      </span>
                      <span v-else-if="transaction.transaction_type === '이동'">
                        {{ transaction.from_room_number }} → {{ transaction.to_room_number }}
                      </span>
                      <span v-else>
                        {{ transaction.to_room_number || transaction.from_room_number || '-' }}
                      </span>
                    </td>
                    <td>
                      <strong>{{ transaction.weight || '-' }}</strong>
                    </td>
                    <td>
                      <small>{{ formatCurrency(transaction.unit_price) }}</small>
                    </td>
                    <td>
                      <strong>{{ formatCurrency(transaction.total_price) }}</strong>
                    </td>
                    <td>{{ transaction.partner_name || '-' }}</td>
                    <td>{{ transaction.manager_id }}</td>
                  </tr>
                  <tr v-if="transactions.length === 0">
                    <td colspan="10" class="text-center text-muted py-4">
                      <i class="bi bi-list-ul me-2"></i>
                      거래내역이 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 거래내역 페이지네이션 -->
            <nav v-if="transactionPagination.totalPages > 1" class="mt-3">
              <ul class="pagination pagination-sm justify-content-center">
                <li class="page-item" :class="{ disabled: transactionPagination.page <= 1 }">
                  <button 
                    class="page-link" 
                    @click="changeTransactionPage(transactionPagination.page - 1)"
                    :disabled="transactionPagination.page <= 1"
                  >
                    이전
                  </button>
                </li>
                
                <li 
                  v-for="page in getTransactionPageNumbers()" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: transactionPagination.page === page }"
                >
                  <button class="page-link" @click="changeTransactionPage(page)">
                    {{ page }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: transactionPagination.page >= transactionPagination.totalPages }">
                  <button 
                    class="page-link" 
                    @click="changeTransactionPage(transactionPagination.page + 1)"
                    :disabled="transactionPagination.page >= transactionPagination.totalPages"
                  >
                    다음
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// Nuxt.js auto-imports
declare const definePageMeta: any
declare const useHead: any
declare const $fetch: any

// 페이지 메타데이터
definePageMeta({
  layout: 'admin'
})

// 페이지 제목
useHead({
  title: '돼지 입출고 관리 - LSMMS'
})

// 타입 정의
interface Pig {
  pig_id: string
  pig_tag?: string
  pig_name?: string
  current_room_number?: string
  pig_status: string
  breed?: string
  gender: string
  birth_date?: string
  birth_weight?: number
  entry_weight?: number
  current_weight?: number
  age_days?: number
  days_in_farm?: number
  entry_date: string
  exit_date?: string
  health_status: string
  supplier?: string
  manager_id: string
  notes?: string
  crdt_dt: string
  crdt_id: string
}

// 반응형 데이터
const pigs = ref<Pig[]>([])
const availableRooms = ref<string[]>([])
const searchText = ref<string>('')
const roomFilter = ref<string>('')
const statusFilter = ref<string>('')
const healthFilter = ref<string>('')
const pigModalRef = ref<HTMLElement | null>(null)
const transactionModalRef = ref<HTMLElement | null>(null)
const modalMode = ref<'register' | 'checkout' | 'view'>('register')
const selectedPig = ref<Pig | null>(null)

// 현황 요약
const summary = ref({
  breeding: 0,
  checkout: 0,
  avgWeight: 0,
  totalRooms: 0
})

// 페이지네이션
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 돼지 입고 폼 데이터
const pigForm = ref({
  pig_id: '',
  pig_tag: '',
  pig_name: '',
  entry_room_number: '',
  breed: '',
  gender: '',
  birth_date: '',
  entry_weight: null as number | null,
  entry_price: null as number | null,
  supplier: '',
  manager_id: 'admin'
})

// 돼지 출고 폼 데이터
const checkoutForm = ref({
  exit_reason: '',
  exit_destination: '',
  exit_weight: null as number | null,
  exit_price: null as number | null,
  notes: '',
  manager_id: 'admin'
})

// 거래내역 관련 데이터
const transactions = ref<any[]>([])
const transactionStats = ref<any>({})
const transactionFilter = ref({
  transaction_type: '',
  start_date: '',
  end_date: '',
  pig_id: ''
})

// 거래내역 페이지네이션
const transactionPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 날짜 포맷팅
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

// 날짜 시간 포맷팅
const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`
}

// 통화 포맷팅
const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount || amount === 0) return '0원'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0
  }).format(amount)
}

// 페이지 번호 계산
const getPageNumbers = (): number[] => {
  const pages: number[] = []
  const start = Math.max(1, pagination.value.page - 2)
  const end = Math.min(pagination.value.totalPages, pagination.value.page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
}

// 페이지 변경
const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    fetchPigs()
  }
}

// 거래내역 페이지 번호 계산
const getTransactionPageNumbers = (): number[] => {
  const pages: number[] = []
  const start = Math.max(1, transactionPagination.value.page - 2)
  const end = Math.min(transactionPagination.value.totalPages, transactionPagination.value.page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
}

// 거래내역 페이지 변경
const changeTransactionPage = (page: number) => {
  if (page >= 1 && page <= transactionPagination.value.totalPages) {
    transactionPagination.value.page = page
    fetchTransactions()
  }
}

// 축사방 목록 조회
const fetchRooms = async () => {
  try {
    console.log('축사방 목록 조회 시작')
    
    const response = await $fetch('/api/v1/livestock/rooms', { 
      query: { livestock_type: '돼지', limit: 100 } 
    }) as any
    
    console.log('축사방 API 응답:', response)
    
    if (response && response.success && response.data && response.data.rooms) {
      availableRooms.value = response.data.rooms.map((room: any) => room.room_number)
      summary.value.totalRooms = response.data.rooms.length
      console.log('사용 가능한 축사방:', availableRooms.value)
    } else {
      console.warn('축사방 데이터가 없거나 잘못된 응답:', response)
      // 기본 샘플 데이터 제공
      availableRooms.value = ['A-001', 'A-002', 'A-003', 'B-001', 'B-002']
      summary.value.totalRooms = 5
    }
  } catch (error) {
    console.error('축사방 목록 조회 오류:', error)
    // 오류 발생 시 기본 샘플 데이터 제공
    availableRooms.value = ['A-001', 'A-002', 'A-003', 'B-001', 'B-002']
    summary.value.totalRooms = 5
    alert('축사방 목록을 불러오는데 실패했습니다. 기본 축사방을 표시합니다.')
  }
}

// 돼지 목록 조회
const fetchPigs = async () => {
  try {
    console.log('돼지 목록 조회 시작')
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchText.value,
      room_number: roomFilter.value,
      pig_status: statusFilter.value,
      health_status: healthFilter.value
    }

    const response = await $fetch('/api/v1/pigs', { query: params }) as any
    
    console.log('돼지 API 응답:', response)
    
    if (response && response.success) {
      pigs.value = response.data.pigs || []
      pagination.value = {
        ...pagination.value,
        ...response.data.pagination
      }
      
      // 현황 요약 계산
      updateSummary()
      
      console.log('돼지 목록 로드 완료:', pigs.value.length, '마리')
    } else {
      console.error('돼지 API 응답이 성공적이지 않음:', response)
      pigs.value = []
    }
  } catch (error) {
    console.error('돼지 목록 조회 오류:', error)
    pigs.value = []
  }
}

// 현황 요약 업데이트
const updateSummary = () => {
  const breedingPigs = pigs.value.filter(p => p.pig_status === '사육중')
  const checkoutPigs = pigs.value.filter(p => p.pig_status === '출고')
  
  summary.value.breeding = breedingPigs.length
  summary.value.checkout = checkoutPigs.length
  
  if (breedingPigs.length > 0) {
    const totalWeight = breedingPigs.reduce((sum, pig) => sum + (pig.current_weight || 0), 0)
    summary.value.avgWeight = Math.round(totalWeight / breedingPigs.length * 10) / 10
  } else {
    summary.value.avgWeight = 0
  }
}

// 검색
const searchPigs = () => {
  pagination.value.page = 1
  fetchPigs()
}

// 검색 초기화
const resetSearch = () => {
  searchText.value = ''
  roomFilter.value = ''
  statusFilter.value = ''
  healthFilter.value = ''
  pagination.value.page = 1
  fetchPigs()
}

// 돼지 모달 표시
const showPigModal = (mode: 'register' | 'checkout' | 'view', pig?: Pig) => {
  modalMode.value = mode
  selectedPig.value = pig || null
  
  if (mode === 'register') {
    // 입고 등록 모드
    pigForm.value = {
      pig_id: '',
      pig_tag: '',
      pig_name: '',
      entry_room_number: '',
      breed: '',
      gender: '',
      birth_date: '',
      entry_weight: null,
      entry_price: null,
      supplier: '',
      manager_id: 'admin'
    }
  } else if (mode === 'checkout' && pig) {
    // 출고 처리 모드
    checkoutForm.value = {
      exit_reason: '',
      exit_destination: '',
      exit_weight: pig.current_weight || null,
      exit_price: null,
      notes: '',
      manager_id: 'admin'
    }
  }
  
  // 모달 표시
  nextTick(() => {
    try {
      if (pigModalRef.value) {
        // 기존 모달 인스턴스가 있다면 제거
        const existingModal = (window as any).bootstrap.Modal.getInstance(pigModalRef.value)
        if (existingModal) {
          existingModal.dispose()
        }
        
        // 새 모달 인스턴스 생성 및 표시
        const modal = new (window as any).bootstrap.Modal(pigModalRef.value, {
          backdrop: 'static',
          keyboard: false
        })
        modal.show()
      }
    } catch (error) {
      console.error('모달 표시 오류:', error)
      alert('모달을 표시하는 중 오류가 발생했습니다.')
    }
  })
}

// 돼지 상세보기
const viewPig = (pig: Pig) => {
  showPigModal('view', pig)
}

// 돼지 입고 등록
const registerPig = async () => {
  try {
    console.log('돼지 입고 등록 시작:', pigForm.value)
    
    // 필수 항목 검증
    if (!pigForm.value.pig_id || !pigForm.value.entry_room_number || !pigForm.value.gender) {
      alert('필수 항목을 모두 입력해주세요.\n- 돼지 ID\n- 입고 축사번호\n- 성별')
      return
    }
    
    // 돼지 ID 형식 검증
    if (pigForm.value.pig_id.length < 3) {
      alert('돼지 ID는 최소 3자 이상 입력해주세요.')
      return
    }
    
    // 체중 값 검증
    if (pigForm.value.entry_weight !== null && pigForm.value.entry_weight < 0) {
      alert('입고 체중은 0 이상의 값을 입력해주세요.')
      return
    }
    
    if (pigForm.value.entry_price !== null && pigForm.value.entry_price < 0) {
      alert('입고 단가는 0 이상의 값을 입력해주세요.')
      return
    }
    
    // API 호출 데이터 준비
    const requestData = {
      ...pigForm.value,
      entry_weight: pigForm.value.entry_weight || null,
      entry_price: pigForm.value.entry_price || null,
      manager_id: pigForm.value.manager_id || 'admin',
      crdt_id: pigForm.value.manager_id || 'admin'
    }
    
    console.log('API 요청 데이터:', requestData)
    
    const response = await $fetch('/api/v1/pigs', {
      method: 'POST',
      body: requestData
    }) as any
    
    console.log('API 응답:', response)
    
    if (response && response.success) {
      alert('돼지가 성공적으로 입고 등록되었습니다.')
      
      // 모달 닫기
      try {
        const modal = (window as any).bootstrap.Modal.getInstance(pigModalRef.value)
        if (modal) {
          modal.hide()
        }
      } catch (modalError) {
        console.error('모달 닫기 오류:', modalError)
      }
      
      // 목록 새로고침
      await fetchPigs()
      
    } else {
      console.error('돼지 입고 등록 API 응답이 성공적이지 않음:', response)
      const errorMessage = response?.data?.message || response?.message || '등록에 실패했습니다.'
      alert(`돼지 입고 등록에 실패했습니다.\n오류: ${errorMessage}`)
    }
    
  } catch (error) {
    console.error('돼지 입고 등록 오류:', error)
    
    let errorMessage = '알 수 없는 오류가 발생했습니다.'
    
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'object' && error !== null) {
      if ('data' in error && typeof error.data === 'object' && error.data !== null) {
        if ('message' in error.data) {
          errorMessage = error.data.message as string
        }
      }
    }
    
    alert(`돼지 입고 등록 중 오류가 발생했습니다.\n오류: ${errorMessage}`)
  }
}

// 돼지 출고 처리
const checkoutPig = async () => {
  try {
    if (!selectedPig.value || !checkoutForm.value.exit_reason || !checkoutForm.value.exit_destination) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }
    
    const response = await $fetch(`/api/v1/pigs/${selectedPig.value.pig_id}/checkout`, {
      method: 'POST',
      body: checkoutForm.value
    }) as any
    
    if (response && response.success) {
      alert('돼지가 출고 처리되었습니다.')
      
      // 모달 닫기
      const modal = (window as any).bootstrap.Modal.getInstance(pigModalRef.value)
      modal.hide()
      
      // 목록 새로고침
      await fetchPigs()
    } else {
      console.error('돼지 출고 처리 API 응답이 성공적이지 않음:', response)
      alert('돼지 출고 처리에 실패했습니다.')
    }
  } catch (error) {
    console.error('돼지 출고 처리 오류:', error)
    alert('돼지 출고 처리 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
  }
}

// 개별 돼지 거래내역 보기
const viewTransactions = (pigId: string) => {
  // 해당 돼지의 거래내역만 필터링
  transactionFilter.value.pig_id = pigId
  transactionFilter.value.transaction_type = ''
  transactionFilter.value.start_date = ''
  transactionFilter.value.end_date = ''
  transactionPagination.value.page = 1
  
  // 거래내역 모달 표시
  showTransactionModal()
}

// 거래내역 조회
const fetchTransactions = async () => {
  try {
    console.log('거래내역 조회 시작')
    
    const params = {
      page: transactionPagination.value.page,
      limit: transactionPagination.value.limit,
      transaction_type: transactionFilter.value.transaction_type,
      start_date: transactionFilter.value.start_date,
      end_date: transactionFilter.value.end_date,
      pig_id: transactionFilter.value.pig_id
    }

    const response = await $fetch('/api/v1/pigs/transactions', { query: params }) as any
    
    console.log('거래내역 API 응답:', response)
    
    if (response && response.success) {
      transactions.value = response.data.transactions || []
      transactionPagination.value = {
        ...transactionPagination.value,
        ...response.data.pagination
      }
      
      // 통계 데이터 처리
      const stats = response.data.statistics || []
      transactionStats.value = {}
      let totalAmount = 0
      
      stats.forEach((stat: any) => {
        transactionStats.value[stat.transaction_type] = stat.count
        totalAmount += stat.total_amount || 0
      })
      
      transactionStats.value.totalAmount = totalAmount
      
      console.log('거래내역 로드 완료:', transactions.value.length, '건')
    } else {
      console.error('거래내역 API 응답이 성공적이지 않음:', response)
      transactions.value = []
    }
  } catch (error) {
    console.error('거래내역 조회 오류:', error)
    transactions.value = []
    alert('거래내역을 불러오는데 실패했습니다.')
  }
}

// 거래내역 필터 초기화
const resetTransactionFilter = () => {
  transactionFilter.value = {
    transaction_type: '',
    start_date: '',
    end_date: '',
    pig_id: ''
  }
  transactionPagination.value.page = 1
  fetchTransactions()
}

// 전체 거래내역 모달 표시
const showAllTransactionsModal = () => {
  // 필터 초기화 (전체 거래내역)
  transactionFilter.value = {
    transaction_type: '',
    start_date: '',
    end_date: '',
    pig_id: ''
  }
  transactionPagination.value.page = 1
  
  // 거래내역 모달 표시
  showTransactionModal()
}

// 거래내역 모달 표시
const showTransactionModal = () => {
  // 모달 표시
  nextTick(() => {
    try {
      if (transactionModalRef.value) {
        // 기존 모달 인스턴스가 있다면 제거
        const existingModal = (window as any).bootstrap.Modal.getInstance(transactionModalRef.value)
        if (existingModal) {
          existingModal.dispose()
        }
        
        // 새 모달 인스턴스 생성 및 표시
        const modal = new (window as any).bootstrap.Modal(transactionModalRef.value, {
          backdrop: 'static',
          keyboard: false
        })
        modal.show()
        
        // 거래내역 데이터 로드
        fetchTransactions()
      }
    } catch (error) {
      console.error('거래내역 모달 표시 오류:', error)
      alert('거래내역 모달을 표시하는 중 오류가 발생했습니다.')
    }
  })
}


// 컴포넌트 마운트
onMounted(async () => {
  console.log('페이지 마운트 시작')
  
  
  
  // 데이터 로드
  await fetchRooms()
  await fetchPigs()
  
  console.log('페이지 마운트 완료')
})
</script>

<style scoped>
/* 메인 콘텐츠 영역 */
.main-content {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 140px); /* 헤더와 푸터 높이 제외 */
}

/* 컨테이너 스타일 */
.container-fluid {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* 페이지 헤더 */
.h3 {
  color: #5a5c69;
  font-weight: 400;
}

/* 카드 스타일 개선 */
.card {
  border: none;
  border-radius: 0.35rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}

.card-header {
  background-color: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
}

/* 테이블 스타일 */
.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
  color: #5a5c69;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
  font-size: 0.875rem;
}

/* 배지 스타일 */
.badge {
  font-size: 0.75rem;
  font-weight: 500;
}

/* 버튼 그룹 스타일 */
.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

/* 페이지네이션 스타일 */
.pagination-sm .page-link {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* 요약 카드 스타일 */
.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}

.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

/* 검색 폼 스타일 */
.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #5a5c69;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border: 1px solid #d1d3e2;
  border-radius: 0.35rem;
  font-size: 0.875rem;
}

.form-control:focus, .form-select:focus {
  border-color: #bac8f3;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

/* 입력 그룹 스타일 */
.input-group-text {
  background-color: #eaecf4;
  border-color: #d1d3e2;
  color: #5a5c69;
}

/* 모달 스타일 개선 */
.modal-header {
  background-color: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
}

.modal-title {
  color: #5a5c69;
  font-weight: 600;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .container-fluid {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 0;
  }
  
  .container-fluid {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
  
  .h3 {
    font-size: 1.25rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.7rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  /* 모바일에서 카드 간격 조정 */
  .mb-4 {
    margin-bottom: 1.5rem !important;
  }
}

@media (max-width: 576px) {
  .container-fluid {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
  
  /* 모바일에서 버튼 그룹 스택 */
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-group {
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
  }
}

/* 로딩 상태 및 빈 상태 스타일 */
.text-muted {
  color: #858796 !important;
}

/* 코드 스타일 */
code {
  font-size: 0.75rem;
  padding: 0.125rem 0.25rem;
}

/* 스크롤바 스타일 (Webkit 브라우저용) */
.table-responsive::-webkit-scrollbar {
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
