<template>
  <div class="main-content">
    <Head>
      <title>급이량/급수량 관리 - LSMMS</title>
    </Head>

    <div class="container-fluid">
      <!-- 페이지 헤더 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0 text-gray-800">
              <i class="bi bi-cup-straw me-2"></i>급이량/급수량 관리
            </h1>
            <div class="btn-group">
              <button 
                class="btn btn-success"
                @click="showFeedingModal('register')"
              >
                <i class="bi bi-plus-circle me-1"></i>
                급이 기록
              </button>
              <button 
                class="btn btn-info"
                @click="showSummaryModal()"
              >
                <i class="bi bi-bar-chart me-1"></i>
                현황 요약
              </button>
              <button 
                class="btn btn-outline-secondary"
                @click="testDatabaseConnection()"
                title="데이터베이스 연결 테스트"
              >
                <i class="bi bi-database-check me-1"></i>
                DB 테스트
              </button>
              <button 
                class="btn btn-outline-warning"
                @click="createTestData()"
                title="테스트 데이터 생성"
              >
                <i class="bi bi-plus-square me-1"></i>
                테스트 데이터
              </button>
              <button 
                class="btn btn-outline-info"
                @click="setupTables()"
                title="테이블 설정"
              >
                <i class="bi bi-gear me-1"></i>
                테이블 설정
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
                    오늘 급이 기록
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ todaySummary.total_feeding_records || 0 }}건
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-utensils fa-2x text-gray-300"></i>
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
                    총 사료량
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ (todaySummary.total_feed_amount || 0).toFixed(1) }}kg
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-seedling fa-2x text-gray-300"></i>
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
                    총 급수량
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ (todaySummary.total_water_amount || 0).toFixed(1) }}L
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-tint fa-2x text-gray-300"></i>
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
                    평균 섭취율
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ (todaySummary.avg_feed_consumption_rate || 0).toFixed(1) }}%
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-percentage fa-2x text-gray-300"></i>
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
                <div class="col-md-2">
                  <label for="dateFilter" class="form-label">조회일</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="dateFilter"
                    v-model="searchFilters.feeding_date"
                    placeholder="전체 날짜"
                  >
                 
                </div>
                <div class="col-md-2">
                  <label for="pigIdFilter" class="form-label">돼지ID</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="pigIdFilter"
                    v-model="searchFilters.pig_id"
                    placeholder="12431"
                  >
                </div>
                <div class="col-md-2">
                  <label for="roomFilter" class="form-label">축사번호</label>
                  <select 
                    class="form-select" 
                    id="roomFilter"
                    v-model="searchFilters.room_number"
                  >
                    <option value="">전체</option>
                    <option v-for="room in availableRooms" :key="room" :value="room">
                      {{ room }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label for="roundFilter" class="form-label">급이차수</label>
                  <select 
                    class="form-select" 
                    id="roundFilter"
                    v-model="searchFilters.feeding_round"
                  >
                    <option value="">전체</option>
                    <option value="1">1차</option>
                    <option value="2">2차</option>
                    <option value="3">3차</option>
                    <option value="4">4차</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <div class="btn-group w-100">
                    <button 
                      class="btn btn-outline-primary"
                      @click="searchFeedingRecords"
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

      <!-- 급이 기록 테이블 -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-table me-2"></i>급이 기록
                <span class="badge bg-primary ms-2">{{ pagination.total }}건</span>
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
                      <th style="width: 7%">일자</th>
                      <th style="width: 6%">시간</th>
                      <th style="width: 5%">차수</th>
                      <th style="width: 9%">돼지ID</th>
                      <th style="width: 7%">축사</th>
                      <th style="width: 6%">체중</th>
                      <th style="width: 8%">사료량</th>
                      <th style="width: 8%">급수량</th>
                      <th style="width: 6%">섭취율</th>
                      <th style="width: 6%">음수율</th>
                      <th style="width: 7%">돼지상태</th>
                      <th style="width: 6%">급이방법</th>
                      <th style="width: 6%">위생상태</th>
                      <th style="width: 7%">담당자</th>
                      <th style="width: 10%">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="record in feedingRecords" 
                      :key="record.feeding_id"
                      :class="{
                        'table-success': newlyAddedRecord && 
                                        newlyAddedRecord.pig_id === record.pig_id && 
                                        newlyAddedRecord.feeding_date === record.feeding_date &&
                                        newlyAddedRecord.feeding_time === record.feeding_time
                      }"
                    >
                      <td>
                        <small>{{ formatDate(record.feeding_date) }}</small>
                      </td>
                      <td>
                        <strong>{{ record.feeding_time?.substring(0, 5) }}</strong>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ record.feeding_round }}차</span>
                      </td>
                      <td>
                        <code class="bg-light text-dark px-1 rounded">
                          {{ record.pig_id }}
                        </code>
                        <br>
                        <small class="text-muted">{{ record.pig_name || '' }}</small>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ record.room_number }}</span>
                      </td>
                      <td>
                        <strong>{{ record.pig_weight || '-' }}</strong>
                        <small class="text-muted">kg</small>
                      </td>
                      <td>
                        <strong>{{ record.feed_actual_amount || 0 }}</strong>
                        <small class="text-muted">kg</small>
                        <br><small class="text-muted">섭취: {{ record.feed_consumed_amount || 0 }}kg</small>
                      </td>
                      <td>
                        <strong>{{ record.water_actual_amount || 0 }}</strong>
                        <small class="text-muted">L</small>
                        <br><small class="text-muted">음수: {{ record.water_consumed_amount || 0 }}L</small>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-success': (record.feed_consumption_rate || 0) >= 90,
                            'bg-warning': (record.feed_consumption_rate || 0) >= 70 && (record.feed_consumption_rate || 0) < 90,
                            'bg-danger': (record.feed_consumption_rate || 0) < 70
                          }"
                        >
                          {{ (record.feed_consumption_rate || 0).toFixed(1) }}%
                        </span>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-success': (record.water_consumption_rate || 0) >= 90,
                            'bg-warning': (record.water_consumption_rate || 0) >= 70 && (record.water_consumption_rate || 0) < 90,
                            'bg-danger': (record.water_consumption_rate || 0) < 70
                          }"
                        >
                          {{ (record.water_consumption_rate || 0).toFixed(1) }}%
                        </span>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-success': record.pig_condition === '정상',
                            'bg-warning': record.pig_condition === '식욕부진',
                            'bg-danger': record.pig_condition === '병약',
                            'bg-info': record.pig_condition === '스트레스'
                          }"
                        >
                          {{ record.pig_condition }}
                        </span>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-primary': record.feeding_method === '자동급이',
                            'bg-secondary': record.feeding_method === '수동급이',
                            'bg-info': record.feeding_method === '혼합급이'
                          }"
                        >
                          {{ record.feeding_method }}
                        </span>
                      </td>
                      <td>
                        <span 
                          class="badge"
                          :class="{
                            'bg-success': record.hygiene_status === '청결',
                            'bg-warning': record.hygiene_status === '보통',
                            'bg-danger': record.hygiene_status === '불결'
                          }"
                        >
                          {{ record.hygiene_status }}
                        </span>
                      </td>
                      <td>
                        <small>{{ record.manager_name || record.manager_id }}</small>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-info" 
                            @click="viewFeedingRecord(record)"
                            title="상세보기"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                          <button 
                            class="btn btn-outline-primary" 
                            @click="showFeedingModal('edit', record)"
                            title="수정"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="feedingRecords.length === 0 && !isLoading">
                      <td colspan="15" class="text-center text-muted py-4">
                        <div class="d-flex flex-column align-items-center">
                          <i class="bi bi-cup-straw fs-1 mb-3 text-muted"></i>
                          <h5 class="text-muted mb-2">급이 기록이 없습니다</h5>
                          <p class="text-muted mb-3">
                            <span v-if="searchFilters.feeding_date || searchFilters.pig_id || searchFilters.room_number || searchFilters.feeding_round">
                              검색 조건을 확인하거나 초기화 버튼을 눌러보세요.
                            </span>
                            <span v-else>
                              "급이 기록" 버튼을 눌러 새로운 급이 기록을 등록하세요.
                            </span>
                          </p>
                          <div class="btn-group">
                            <button 
                              v-if="searchFilters.feeding_date || searchFilters.pig_id || searchFilters.room_number || searchFilters.feeding_round"
                              class="btn btn-outline-secondary btn-sm"
                              @click="resetSearch"
                            >
                              <i class="bi bi-arrow-clockwise me-1"></i>검색 초기화
                            </button>
                            <button 
                              class="btn btn-success btn-sm"
                              @click="showFeedingModal('register')"
                            >
                              <i class="bi bi-plus-circle me-1"></i>급이 기록 등록
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 페이지네이션 -->
            <div class="card-footer" v-if="pagination.totalPages > 1">
              <nav aria-label="급이 기록 페이지네이션">
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

    <!-- 급이 기록 등록/수정 모달 -->
    <div 
      class="modal fade" 
      id="feedingModal" 
      tabindex="-1" 
      ref="feedingModalRef"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-cup-straw me-2"></i>
              {{ modalMode === 'register' ? '급이 기록 등록' : 
                 modalMode === 'edit' ? '급이 기록 수정' : '급이 기록 상세' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveFeedingRecord">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="feedingPigId" class="form-label">
                    돼지 ID <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="feedingPigId"
                      v-model="feedingForm.pig_id"
                      @input="validatePigId(feedingForm.pig_id)"
                      @blur="validatePigId(feedingForm.pig_id)"
                      required
                      :readonly="modalMode === 'edit'"
                      :class="{
                        'is-valid': pigValidation.isValid && !pigValidation.isChecking,
                        'is-invalid': !pigValidation.isValid && pigValidation.message && !pigValidation.isChecking
                      }"
                      placeholder="12431"
                    >
                    <span class="input-group-text">
                      <i 
                        v-if="pigValidation.isChecking" 
                        class="bi bi-arrow-clockwise spin text-primary"
                      ></i>
                      <i 
                        v-else-if="pigValidation.isValid" 
                        class="bi bi-check-circle-fill text-success"
                      ></i>
                      <i 
                        v-else-if="pigValidation.message && !pigValidation.isValid" 
                        class="bi bi-x-circle-fill text-danger"
                      ></i>
                      <i 
                        v-else 
                        class="bi bi-search text-muted"
                      ></i>
                    </span>
                  </div>
                  <div 
                    v-if="pigValidation.message" 
                    class="form-text"
                    :class="{
                      'text-success': pigValidation.isValid,
                      'text-danger': !pigValidation.isValid && pigValidation.message,
                      'text-info': pigValidation.isChecking
                    }"
                  >
                    <small>{{ pigValidation.message }}</small>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="feedingRoomNumber" class="form-label">
                    축사번호 <span class="text-danger">*</span>
                  </label>
                  <select 
                    class="form-select" 
                    id="feedingRoomNumber"
                    v-model="feedingForm.room_number"
                    required
                  >
                    <option value="">축사번호 선택</option>
                    <option v-for="room in availableRooms" :key="room" :value="room">
                      {{ room }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="feedingDate" class="form-label">
                    급이일 <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="feedingDate"
                    v-model="feedingForm.feeding_date"
                    required
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label for="feedingTime" class="form-label">
                    급이시간 <span class="text-danger">*</span>
                  </label>
                  <input 
                    type="time" 
                    class="form-control" 
                    id="feedingTime"
                    v-model="feedingForm.feeding_time"
                    required
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label for="feedingRound" class="form-label">
                    급이차수 <span class="text-danger">*</span>
                  </label>
                  <select 
                    class="form-select" 
                    id="feedingRound"
                    v-model="feedingForm.feeding_round"
                    required
                  >
                    <option value="">차수 선택</option>
                    <option value="1">1차</option>
                    <option value="2">2차</option>
                    <option value="3">3차</option>
                    <option value="4">4차</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="feedPlanned" class="form-label">계획 사료량(kg)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="feedPlanned"
                    v-model.number="feedingForm.feed_planned_amount"
                    step="0.1"
                    min="0"
                    placeholder="1.0"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="feedActual" class="form-label">실제 사료량(kg)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="feedActual"
                    v-model.number="feedingForm.feed_actual_amount"
                    step="0.1"
                    min="0"
                    placeholder="1.0"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="waterPlanned" class="form-label">계획 급수량(L)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="waterPlanned"
                    v-model.number="feedingForm.water_planned_amount"
                    step="0.1"
                    min="0"
                    placeholder="2.0"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="waterActual" class="form-label">실제 급수량(L)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="waterActual"
                    v-model.number="feedingForm.water_actual_amount"
                    step="0.1"
                    min="0"
                    placeholder="2.0"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="feedConsumed" class="form-label">섭취량(kg)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="feedConsumed"
                    v-model.number="feedingForm.feed_consumed_amount"
                    step="0.1"
                    min="0"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="waterConsumed" class="form-label">음수량(L)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="waterConsumed"
                    v-model.number="feedingForm.water_consumed_amount"
                    step="0.1"
                    min="0"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="pigCondition" class="form-label">돼지 상태</label>
                  <select 
                    class="form-select" 
                    id="pigCondition"
                    v-model="feedingForm.pig_condition"
                  >
                    <option value="정상">정상</option>
                    <option value="식욕부진">식욕부진</option>
                    <option value="병약">병약</option>
                    <option value="스트레스">스트레스</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="temperature" class="form-label">기온(℃)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="temperature"
                    v-model.number="feedingForm.temperature"
                    step="0.1"
                    placeholder="18.5"
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label for="humidity" class="form-label">습도(%)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="humidity"
                    v-model.number="feedingForm.humidity"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="65.0"
                  >
                </div>
              </div>

              <div class="mb-3">
                <label for="feedingNotes" class="form-label">비고</label>
                <textarea 
                  class="form-control" 
                  id="feedingNotes"
                  v-model="feedingForm.notes"
                  rows="3"
                  placeholder="특이사항이나 비고사항을 입력하세요"
                ></textarea>
              </div>
            </form>
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
              v-if="modalMode !== 'view'"
              type="button" 
              class="btn btn-success"
              @click="saveFeedingRecord"
            >
              <i class="bi bi-check-circle me-1"></i>
              {{ modalMode === 'register' ? '등록' : '수정' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

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
  title: '급이량/급수량 관리 - LSMMS'
})

// 타입 정의 - 실제 데이터베이스 스키마에 맞춤
interface FeedingRecord {
  feeding_id: number
  pig_id: string
  pig_name?: string  // JOIN으로 가져오는 필드
  pig_tag?: string   // JOIN으로 가져오는 필드
  room_number: string
  feeding_date: string
  feeding_time: string
  feeding_round: number
  pig_weight?: number
  pig_condition: '정상' | '식욕부진' | '병약' | '스트레스'
  weather_condition?: string
  temperature?: number
  humidity?: number
  feed_type?: string
  feed_planned_amount: number
  feed_actual_amount: number
  feed_consumed_amount?: number
  feed_leftover_amount?: number
  feed_consumption_rate?: number
  water_planned_amount: number
  water_actual_amount: number
  water_consumed_amount?: number
  water_leftover_amount?: number
  water_consumption_rate?: number
  feeding_method: '자동급이' | '수동급이' | '혼합급이'
  feeding_equipment?: string
  water_method: '자동급수' | '수동급수' | '혼합급수'
  water_equipment?: string
  feed_quality?: '우수' | '양호' | '보통' | '불량'
  water_quality?: '우수' | '양호' | '보통' | '불량'
  hygiene_status: '청결' | '보통' | '불결'
  feed_unit_cost?: number
  feed_total_cost?: number
  water_unit_cost?: number
  water_total_cost?: number
  manager_id: string
  manager_name?: string
  checker_id?: string
  check_time?: string
  notes?: string
  feeding_issues?: string
  health_observations?: string
  crdt_dt: string
  crdt_id: string
  updt_dt?: string
  updt_id?: string
}

// 반응형 데이터
const feedingRecords = ref<FeedingRecord[]>([])
const availableRooms = ref<string[]>([])
const feedingModalRef = ref<HTMLElement | null>(null)
const modalMode = ref<'register' | 'edit' | 'view'>('register')
const selectedRecord = ref<FeedingRecord | null>(null)
const isLoading = ref(false)
const pigValidation = ref({
  isChecking: false,
  isValid: false,
  message: '',
  pigInfo: null as any
})

// 새로 등록된 기록 강조 표시
const newlyAddedRecord = ref<{pig_id: string, feeding_date: string, feeding_time: string} | null>(null)

// 오늘 현황 요약
const todaySummary = ref<any>({})

// 검색 필터 - 모든 조건을 빈 값으로 설정하여 전체 데이터 조회
const searchFilters = ref({
  feeding_date: '',
  pig_id: '',
  room_number: '',
  feeding_round: ''
})

// 페이지네이션
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// 급이 기록 폼 데이터 - 실제 스키마에 맞춤
const feedingForm = ref({
  pig_id: '',
  room_number: '',
  feeding_date: new Date().toISOString().split('T')[0],
  feeding_time: '',
  feeding_round: '',
  pig_weight: null as number | null,
  pig_condition: '정상' as '정상' | '식욕부진' | '병약' | '스트레스',
  weather_condition: '',
  temperature: null as number | null,
  humidity: null as number | null,
  feed_type: '',
  feed_planned_amount: null as number | null,
  feed_actual_amount: null as number | null,
  feed_consumed_amount: null as number | null,
  feed_leftover_amount: null as number | null,
  feed_consumption_rate: null as number | null,
  water_planned_amount: null as number | null,
  water_actual_amount: null as number | null,
  water_consumed_amount: null as number | null,
  water_leftover_amount: null as number | null,
  water_consumption_rate: null as number | null,
  feeding_method: '자동급이' as '자동급이' | '수동급이' | '혼합급이',
  feeding_equipment: '',
  water_method: '자동급수' as '자동급수' | '수동급수' | '혼합급수',
  water_equipment: '',
  feed_quality: '' as '' | '우수' | '양호' | '보통' | '불량',
  water_quality: '' as '' | '우수' | '양호' | '보통' | '불량',
  hygiene_status: '청결' as '청결' | '보통' | '불결',
  feed_unit_cost: null as number | null,
  feed_total_cost: null as number | null,
  water_unit_cost: null as number | null,
  water_total_cost: null as number | null,
  manager_id: 'admin',
  manager_name: '',
  checker_id: '',
  check_time: '',
  notes: '',
  feeding_issues: '',
  health_observations: ''
})

// 날짜 포맷팅
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ko-KR')
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
    fetchFeedingRecords()
  }
}

// 축사방 목록 조회
const fetchRooms = async () => {
  try {
    const response = await $fetch('/api/v1/livestock/rooms', { 
      query: { livestock_type: '돼지', limit: 100 } 
    }) as any
    
    if (response && response.success && response.data && response.data.rooms) {
      availableRooms.value = response.data.rooms.map((room: any) => room.room_number)
    } else {
      // 기본 샘플 데이터 제공
      availableRooms.value = ['A-001', 'A-002', 'A-003', 'B-001', 'B-002']
    }
  } catch (error) {
    console.error('축사방 목록 조회 오류:', error)
    availableRooms.value = ['A-001', 'A-002', 'A-003', 'B-001', 'B-002']
  }
}

// 급이 기록 조회 - 실제 데이터베이스에서 조회
const fetchFeedingRecords = async () => {
  isLoading.value = true
  
  try {
    console.log('급이 기록 조회 시작 - 실제 데이터베이스에서 조회')
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      feeding_date: searchFilters.value.feeding_date,
      pig_id: searchFilters.value.pig_id,
      room_number: searchFilters.value.room_number,
      feeding_round: searchFilters.value.feeding_round
    }

    console.log('급이 기록 조회 파라미터:', params)

    const response = await $fetch('/api/v1/feeding/daily-records', { query: params }) as any
    
    console.log('급이 기록 API 응답 전체:', response)
    console.log('급이 기록 API 응답 데이터:', response?.data)
    console.log('급이 기록 배열:', response?.data?.records)
    
    if (response && response.success && response.data) {
      const records = response.data.records || []
      const paginationData = response.data.pagination || {}
      
      console.log('받은 급이 기록 수:', records.length)
      console.log('받은 페이지네이션 정보:', paginationData)
      
      feedingRecords.value = records
      pagination.value = {
        page: paginationData.page || 1,
        limit: paginationData.limit || 20,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0
      }
      
      console.log('설정된 급이 기록:', feedingRecords.value)
      console.log('설정된 페이지네이션:', pagination.value)
      
      // 데이터가 있는지 확인
      if (records.length > 0) {
        console.log('첫 번째 기록 샘플:', records[0])
      } else {
        console.log('조회된 급이 기록이 없습니다.')
        
        // 검색 조건이 있는지 확인
        const hasSearchConditions = searchFilters.value.feeding_date || 
                                   searchFilters.value.pig_id || 
                                   searchFilters.value.room_number || 
                                   searchFilters.value.feeding_round
        
        if (hasSearchConditions) {
          console.log('검색 조건이 있어서 결과가 없을 수 있습니다:', searchFilters.value)
        } else {
          console.log('검색 조건 없이도 데이터가 없습니다. 테이블에 데이터가 없거나 API 오류일 수 있습니다.')
        }
      }
      
    } else {
      console.error('급이 기록 API 응답이 성공적이지 않음:', response)
      console.error('API 성공 여부:', response?.success)
      console.error('API 데이터 존재 여부:', !!response?.data)
      
      feedingRecords.value = []
      pagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
    
  } catch (error) {
    console.error('급이 기록 조회 오류:', error)
    console.error('오류 타입:', typeof error)
    console.error('오류 상세 정보:', error)
    
    feedingRecords.value = []
    pagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 }
    
    // 오류 메시지를 사용자에게 표시
    let errorMessage = '급이 기록을 불러오는데 실패했습니다.'
    
    if (error instanceof Error) {
      console.error('Error 객체 메시지:', error.message)
      console.error('Error 객체 스택:', error.stack)
      
      if (error.message.includes('Table') && error.message.includes("doesn't exist")) {
        errorMessage = '급이 기록 테이블이 설정되지 않았습니다.\n관리자에게 문의하여 데이터베이스를 설정해주세요.'
      } else if (error.message.includes('connection')) {
        errorMessage = '데이터베이스 연결에 문제가 있습니다.\n잠시 후 다시 시도해주세요.'
      }
    } else if (typeof error === 'object' && error !== null) {
      console.error('오류 객체의 속성들:')
      for (const key in error) {
        console.error(`  ${key}:`, (error as any)[key])
      }
    }
    
    console.warn('급이 기록 조회 실패:', errorMessage)
  } finally {
    isLoading.value = false
  }
}

// 오늘 현황 요약 조회
const fetchTodaySummary = async () => {
  try {
    const response = await $fetch('/api/v1/feeding/summary', {
      query: { date: new Date().toISOString().split('T')[0] }
    }) as any
    
    if (response && response.success) {
      todaySummary.value = response.data.summary || {}
    }
  } catch (error) {
    console.error('오늘 현황 요약 조회 오류:', error)
    todaySummary.value = {}
  }
}

// 검색
const searchFeedingRecords = () => {
  pagination.value.page = 1
  fetchFeedingRecords()
}

// 검색 초기화
const resetSearch = () => {
  searchFilters.value = {
    feeding_date: '',
    pig_id: '',
    room_number: '',
    feeding_round: ''
  }
  pagination.value.page = 1
  fetchFeedingRecords()
}

// 돼지 ID 검증
const validatePigId = async (pigId: string) => {
  if (!pigId || pigId.trim() === '') {
    pigValidation.value = {
      isChecking: false,
      isValid: false,
      message: '',
      pigInfo: null
    }
    return
  }

  pigValidation.value.isChecking = true
  pigValidation.value.message = '돼지 정보 확인 중...'

  try {
    const response = await $fetch('/api/v1/system/pig-info-check', {
      query: { pig_id: pigId.trim() }
    }) as any

    if (response && response.success) {
      if (response.data.exists && response.data.pigInfo) {
        const pigInfo = response.data.pigInfo
        
        if (pigInfo.pig_status === '출고' || pigInfo.pig_status === '폐사') {
          pigValidation.value = {
            isChecking: false,
            isValid: false,
            message: `돼지가 '${pigInfo.pig_status}' 상태로 급이 기록을 등록할 수 없습니다.`,
            pigInfo
          }
        } else if (pigInfo.is_active === 0 || pigInfo.is_active === false) {
          pigValidation.value = {
            isChecking: false,
            isValid: false,
            message: `돼지가 비활성화 상태입니다. (상태: ${pigInfo.pig_status})`,
            pigInfo
          }
        } else {
          pigValidation.value = {
            isChecking: false,
            isValid: true,
            message: `${pigInfo.pig_name || '돼지'} (상태: ${pigInfo.pig_status}, 축사: ${pigInfo.current_room_number || '미배정'})`,
            pigInfo
          }
          
          if (pigInfo.current_room_number) {
            feedingForm.value.room_number = pigInfo.current_room_number
          }
        }
      } else {
        let suggestionMessage = '존재하지 않는 돼지 ID입니다.'
        if (response.data.similarPigs && response.data.similarPigs.length > 0) {
          const suggestions = response.data.similarPigs.slice(0, 3).map((pig: any) => pig.pig_id).join(', ')
          suggestionMessage += `\n비슷한 ID: ${suggestions}`
        }
        
        pigValidation.value = {
          isChecking: false,
          isValid: false,
          message: suggestionMessage,
          pigInfo: null
        }
      }
    }
  } catch (error) {
    console.error('돼지 ID 검증 오류:', error)
    pigValidation.value = {
      isChecking: false,
      isValid: false,
      message: '돼지 정보 확인 중 오류가 발생했습니다.',
      pigInfo: null
    }
  }
}

// 급이 기록 모달 표시
const showFeedingModal = (mode: 'register' | 'edit' | 'view', record?: FeedingRecord) => {
  modalMode.value = mode
  selectedRecord.value = record || null
  
  if (mode === 'register') {
    feedingForm.value = {
      pig_id: '',
      room_number: '',
      feeding_date: new Date().toISOString().split('T')[0],
      feeding_time: '',
      feeding_round: '',
      pig_weight: null,
      pig_condition: '정상',
      weather_condition: '',
      temperature: null,
      humidity: null,
      feed_type: '',
      feed_planned_amount: null,
      feed_actual_amount: null,
      feed_consumed_amount: null,
      feed_leftover_amount: null,
      feed_consumption_rate: null,
      water_planned_amount: null,
      water_actual_amount: null,
      water_consumed_amount: null,
      water_leftover_amount: null,
      water_consumption_rate: null,
      feeding_method: '자동급이',
      feeding_equipment: '',
      water_method: '자동급수',
      water_equipment: '',
      feed_quality: '',
      water_quality: '',
      hygiene_status: '청결',
      feed_unit_cost: null,
      feed_total_cost: null,
      water_unit_cost: null,
      water_total_cost: null,
      manager_id: 'admin',
      manager_name: '',
      checker_id: '',
      check_time: '',
      notes: '',
      feeding_issues: '',
      health_observations: ''
    }
    
    pigValidation.value = {
      isChecking: false,
      isValid: false,
      message: '',
      pigInfo: null
    }
  } else if ((mode === 'edit' || mode === 'view') && record) {
    feedingForm.value = {
      pig_id: record.pig_id,
      room_number: record.room_number,
      feeding_date: record.feeding_date,
      feeding_time: record.feeding_time,
      feeding_round: (record.feeding_round || '').toString(),
      pig_weight: record.pig_weight || null,
      pig_condition: record.pig_condition,
      weather_condition: record.weather_condition || '',
      temperature: record.temperature || null,
      humidity: record.humidity || null,
      feed_type: record.feed_type || '',
      feed_planned_amount: record.feed_planned_amount || null,
      feed_actual_amount: record.feed_actual_amount || null,
      feed_consumed_amount: record.feed_consumed_amount || null,
      feed_leftover_amount: record.feed_leftover_amount || null,
      feed_consumption_rate: record.feed_consumption_rate || null,
      water_planned_amount: record.water_planned_amount || null,
      water_actual_amount: record.water_actual_amount || null,
      water_consumed_amount: record.water_consumed_amount || null,
      water_leftover_amount: record.water_leftover_amount || null,
      water_consumption_rate: record.water_consumption_rate || null,
      feeding_method: record.feeding_method,
      feeding_equipment: record.feeding_equipment || '',
      water_method: record.water_method,
      water_equipment: record.water_equipment || '',
      feed_quality: record.feed_quality || '',
      water_quality: record.water_quality || '',
      hygiene_status: record.hygiene_status,
      feed_unit_cost: record.feed_unit_cost || null,
      feed_total_cost: record.feed_total_cost || null,
      water_unit_cost: record.water_unit_cost || null,
      water_total_cost: record.water_total_cost || null,
      manager_id: record.manager_id,
      manager_name: record.manager_name || '',
      checker_id: record.checker_id || '',
      check_time: record.check_time || '',
      notes: record.notes || '',
      feeding_issues: record.feeding_issues || '',
      health_observations: record.health_observations || ''
    }
    
    if (record.pig_id) {
      validatePigId(record.pig_id)
    }
  }
  
  nextTick(() => {
    try {
      if (feedingModalRef.value) {
        const existingModal = (window as any).bootstrap.Modal.getInstance(feedingModalRef.value)
        if (existingModal) {
          existingModal.dispose()
        }
        
        const modal = new (window as any).bootstrap.Modal(feedingModalRef.value, {
          backdrop: 'static',
          keyboard: false
        })
        modal.show()
      }
    } catch (error) {
      console.error('급이 기록 모달 표시 오류:', error)
      alert('모달을 표시하는 중 오류가 발생했습니다.')
    }
  })
}

// 급이 기록 상세보기
const viewFeedingRecord = (record: FeedingRecord) => {
  showFeedingModal('view', record)
}

// 급이 기록 저장
const saveFeedingRecord = async () => {
  try {
    const requiredFields = [
      { field: 'pig_id', name: '돼지 ID' },
      { field: 'room_number', name: '축사번호' },
      { field: 'feeding_date', name: '급이일' },
      { field: 'feeding_time', name: '급이시간' },
      { field: 'feeding_round', name: '급이차수' }
    ]
    
    const missingFields = requiredFields.filter(({ field }) => !(feedingForm.value as any)[field])
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ name }) => name).join(', ')
      alert(`다음 필수 항목을 입력해주세요:\n${fieldNames}`)
      return
    }
    
    console.log('급이 기록 저장 시작:', feedingForm.value)
    
    const response = await $fetch('/api/v1/feeding/daily-records', {
      method: 'POST',
      body: feedingForm.value
    }) as any
    
    console.log('급이 기록 저장 API 응답:', response)
    
    if (response && response.success) {
      console.log('급이 기록 저장 성공:', response.data)
      
      const modal = (window as any).bootstrap.Modal.getInstance(feedingModalRef.value)
      if (modal) {
        modal.hide()
      }
      
      const savedDate = feedingForm.value.feeding_date
      const savedPigId = feedingForm.value.pig_id
      
      // 검색 조건 초기화하여 전체 데이터 조회
      searchFilters.value = {
        feeding_date: '',
        pig_id: '',
        room_number: '',
        feeding_round: ''
      }
      
      // 목록 새로고침
      await fetchFeedingRecords()
      await fetchTodaySummary()
      
      // 등록된 기록 강조 표시
      const foundRecord = feedingRecords.value.find(record => 
        record.pig_id === savedPigId && record.feeding_date === savedDate
      )
      
      if (foundRecord) {
        newlyAddedRecord.value = {
          pig_id: savedPigId,
          feeding_date: savedDate,
          feeding_time: feedingForm.value.feeding_time
        }
        
        setTimeout(() => {
          newlyAddedRecord.value = null
        }, 3000)
        
        showSuccessToast(`급이 기록이 등록되었습니다! (돼지 ID: ${savedPigId})`)
      } else {
        showSuccessToast('급이 기록이 등록되었습니다!')
      }
      
    } else {
      console.error('급이 기록 저장 API 응답이 성공적이지 않음:', response)
      const errorMessage = response?.data?.message || response?.message || '저장에 실패했습니다.'
      alert(`급이 기록 저장에 실패했습니다.\n오류: ${errorMessage}`)
    }
  } catch (error) {
    console.error('급이 기록 저장 오류:', error)
    let errorMessage = '알 수 없는 오류가 발생했습니다.'
    
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'object' && error !== null) {
      if ('data' in error && typeof error.data === 'object' && error.data !== null) {
        if ('message' in error.data) {
          errorMessage = error.data.message as string
        }
      } else if ('statusMessage' in error) {
        errorMessage = error.statusMessage as string
      }
    }
    
    if (errorMessage.includes('duplicate') || errorMessage.includes('중복')) {
      alert('해당 시간의 급이 기록이 이미 존재합니다.\n다른 시간이나 차수를 선택해주세요.')
    } else if (errorMessage.includes('not found') || errorMessage.includes('존재하지 않')) {
      alert('해당 돼지 ID가 존재하지 않거나 사육중이 아닙니다.\n올바른 돼지 ID를 입력해주세요.')
    } else if (errorMessage.includes('connection') || errorMessage.includes('database')) {
      alert('데이터베이스 연결에 문제가 있습니다.\n잠시 후 다시 시도해주세요.')
    } else {
      alert(`급이 기록 저장 중 오류가 발생했습니다.\n오류: ${errorMessage}`)
    }
  }
}

// 성공 토스트 알림 표시
const showSuccessToast = (message: string) => {
  const existingToast = document.querySelector('.success-toast')
  if (existingToast) {
    existingToast.remove()
  }
  
  const toast = document.createElement('div')
  toast.className = 'success-toast position-fixed top-0 end-0 m-3 p-3 bg-success text-white rounded shadow-lg'
  toast.style.zIndex = '9999'
  toast.style.minWidth = '300px'
  toast.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-check-circle-fill me-2"></i>
      <div class="flex-grow-1">${message}</div>
      <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `
  
  document.body.appendChild(toast)
  
  toast.style.opacity = '0'
  toast.style.transform = 'translateX(100%)'
  
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease-out'
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transition = 'all 0.3s ease-in'
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove()
        }
      }, 300)
    }
  }, 5000)
}

// 현황 요약 모달
const showSummaryModal = () => {
  alert('현황 요약 모달 기능은 추후 구현 예정입니다.')
}

// 데이터베이스 연결 테스트
const testDatabaseConnection = async () => {
  try {
    console.log('데이터베이스 연결 테스트 시작')
    
    const tableCheckResponse = await $fetch('/api/v1/system/feeding-tables-check') as any
    console.log('테이블 확인 결과:', tableCheckResponse)
    
    const testParams = { page: 1, limit: 5 }
    const recordsResponse = await $fetch('/api/v1/feeding/daily-records', { query: testParams }) as any
    console.log('급이 기록 API 테스트 결과:', recordsResponse)
    
    let message = '데이터베이스 연결 테스트 결과:\n\n'
    
    if (tableCheckResponse && tableCheckResponse.success) {
      if (tableCheckResponse.data.allTablesExist) {
        message += '✅ 모든 필요한 테이블이 존재합니다.\n'
      } else {
        message += `❌ 누락된 테이블: ${tableCheckResponse.data.missingTables.join(', ')}\n`
      }
    } else {
      message += '❌ 테이블 확인 실패\n'
    }
    
    if (recordsResponse && recordsResponse.success) {
      const recordCount = recordsResponse.data?.records?.length || 0
      const totalCount = recordsResponse.data?.pagination?.total || 0
      message += `✅ 급이 기록 API 동작 정상 (총 ${totalCount}건, 조회 ${recordCount}건)\n`
    } else {
      message += '❌ 급이 기록 API 오류\n'
    }
    
    message += '\n상세 정보는 개발자 도구 콘솔을 확인하세요.'
    alert(message)
    
  } catch (error) {
    console.error('데이터베이스 연결 테스트 오류:', error)
    alert(`데이터베이스 연결 테스트 실패:\n${error instanceof Error ? error.message : '알 수 없는 오류'}\n\n상세 정보는 개발자 도구 콘솔을 확인하세요.`)
  }
}

// 테이블 설정
const setupTables = async () => {
  if (!confirm('급이 관리 테이블을 설정하시겠습니까?\n\n필요한 테이블과 기본 데이터가 생성됩니다.')) {
    return
  }
  
  try {
    console.log('급이 관리 테이블 설정 시작')
    
    const response = await $fetch('/api/v1/feeding/setup-tables', {
      method: 'POST'
    }) as any
    
    console.log('테이블 설정 응답:', response)
    
    if (response && response.success) {
      const { tablesCreated, standardCount, dailyFeedingCount, defaultStandardsInserted } = response.data
      
      alert(`급이 관리 테이블 설정 완료!\n\n` +
            `• 생성된 테이블: ${tablesCreated.join(', ')}\n` +
            `• 급이 기준: ${standardCount}건\n` +
            `• 일일 급이 기록: ${dailyFeedingCount}건\n` +
            `• 기본 기준 추가: ${defaultStandardsInserted}건\n\n` +
            `화면을 새로고침합니다.`)
      
      // 데이터 새로고침
      await fetchFeedingRecords()
      await fetchTodaySummary()
      
      showSuccessToast('급이 관리 테이블 설정이 완료되었습니다!')
      
    } else {
      console.error('테이블 설정 실패:', response)
      alert(`테이블 설정에 실패했습니다.\n오류: ${response?.message || '알 수 없는 오류'}`)
    }
    
  } catch (error) {
    console.error('테이블 설정 오류:', error)
    
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
    
    alert(`테이블 설정 중 오류가 발생했습니다.\n오류: ${errorMessage}\n\n상세 정보는 개발자 도구 콘솔을 확인하세요.`)
  }
}

// 테스트 데이터 생성
const createTestData = async () => {
  if (!confirm('테스트 급이 데이터를 생성하시겠습니까?\n\n최근 7일간의 샘플 급이 기록이 생성됩니다.')) {
    return
  }
  
  try {
    console.log('테스트 데이터 생성 시작')
    
    const response = await $fetch('/api/v1/feeding/test-data', {
      method: 'POST'
    }) as any
    
    console.log('테스트 데이터 생성 응답:', response)
    
    if (response && response.success) {
      const { inserted, totalTestRecords, sampleDataCount } = response.data
      
      alert(`테스트 데이터 생성 완료!\n\n` +
            `• 새로 생성된 기록: ${inserted}건\n` +
            `• 전체 테스트 기록: ${totalTestRecords}건\n` +
            `• 시도된 생성: ${sampleDataCount}건\n\n` +
            `화면을 새로고침합니다.`)
      
      // 데이터 새로고침
      await fetchFeedingRecords()
      await fetchTodaySummary()
      
      showSuccessToast(`테스트 데이터 ${inserted}건이 생성되었습니다!`)
      
    } else {
      console.error('테스트 데이터 생성 실패:', response)
      alert(`테스트 데이터 생성에 실패했습니다.\n오류: ${response?.message || '알 수 없는 오류'}`)
    }
    
  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error)
    
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
    
    alert(`테스트 데이터 생성 중 오류가 발생했습니다.\n오류: ${errorMessage}\n\n상세 정보는 개발자 도구 콘솔을 확인하세요.`)
  }
}

// 컴포넌트 마운트
onMounted(async () => {
  console.log('급이량/급수량 관리 페이지 마운트 시작')
  console.log('실제 데이터베이스에서 급이 기록을 조회합니다.')
  
  await fetchRooms()
  await fetchFeedingRecords()
  await fetchTodaySummary()
  
  console.log('급이량/급수량 관리 페이지 마운트 완료')
  console.log('최종 feedingRecords 상태:', feedingRecords.value)
  console.log('최종 pagination 상태:', pagination.value)
  console.log('최종 isLoading 상태:', isLoading.value)
})
</script>

<style scoped>
/* 메인 콘텐츠 영역 */
.main-content {
  width: 100%;
  min-height: calc(100vh - 140px);
}

/* 컨테이너 스타일 */
.container-fluid {
  max-width: 100%;
  margin: 0;
  padding: 0 15px;
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

/* 모달 스타일 개선 */
.modal-header {
  background-color: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
}

.modal-title {
  color: #5a5c69;
  font-weight: 600;
}

/* 스핀 애니메이션 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 입력 그룹 스타일 개선 */
.input-group-text {
  background-color: #f8f9fa;
  border-color: #d1d3e2;
}

.input-group .form-control.is-valid {
  border-right: none;
}

.input-group .form-control.is-invalid {
  border-right: none;
}

.input-group .form-control.is-valid + .input-group-text {
  border-color: #198754;
  background-color: #d1e7dd;
}

.input-group .form-control.is-invalid + .input-group-text {
  border-color: #dc3545;
  background-color: #f8d7da;
}

/* 새로 등록된 기록 강조 표시 */
.table-success {
  background-color: #d1e7dd !important;
  animation: highlight-fade 3s ease-out;
}

@keyframes highlight-fade {
  0% {
    background-color: #198754 !important;
    color: white;
    transform: scale(1.02);
  }
  10% {
    background-color: #198754 !important;
    color: white;
    transform: scale(1.02);
  }
  100% {
    background-color: #d1e7dd !important;
    color: inherit;
    transform: scale(1);
  }
}

/* 토스트 알림 스타일 */
.success-toast {
  border-left: 4px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.success-toast .btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}

/* 로딩 스피너 스타일 */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .container-fluid {
    padding-left: 10px;
    padding-right: 10px;
  }
}

@media (max-width: 768px) {
  .container-fluid {
    padding-left: 5px;
    padding-right: 5px;
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
  
  .mb-4 {
    margin-bottom: 1.5rem !important;
  }
}

@media (max-width: 576px) {
  .container-fluid {
    padding-left: 5px;
    padding-right: 5px;
  }
  
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
</style>
