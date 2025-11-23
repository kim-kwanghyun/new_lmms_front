-- 테스트 회원 데이터 삽입
-- 비밀번호는 '123'으로 설정 (SHA256으로 해시됨)
-- '123'의 SHA256 해시: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3

INSERT INTO tbl_member (
    member_id, 
    member_pwd, 
    member_name, 
    member_location, 
    member_nickname, 
    member_gubun, 
    member_mobile, 
    mileage, 
    member_email, 
    status, 
    crdt_date, 
    crdt_id, 
    temp_status
) VALUES 
(
    'admin', 
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', -- SHA256('123')
    '관리자', 
    '서울', 
    '시스템관리자', 
    '1', -- 관리자
    '010-1234-5678', 
    0, 
    'admin@lsmms.co.kr', 
    1, -- 활성 상태
    NOW(), 
    'system', 
    0 -- 정상 상태
),
(
    'user01', 
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', -- SHA256('123')
    '일반사용자', 
    '부산', 
    '테스트유저', 
    '2', -- 일반 사용자
    '010-9876-5432', 
    100, 
    'user01@lsmms.co.kr', 
    1, -- 활성 상태
    NOW(), 
    'system', 
    0 -- 정상 상태
);

-- 생성된 테스트 계정 확인
SELECT 
    member_seq, member_id, member_name, member_gubun, 
    member_email, status, temp_status, crdt_date
FROM tbl_member 
WHERE member_id IN ('admin', 'user01');
