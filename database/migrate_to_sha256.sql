-- 기존 평문 비밀번호를 SHA256으로 마이그레이션하는 스크립트
-- 주의: 이 스크립트는 기존 평문 비밀번호가 있는 경우에만 실행하세요.

-- 1. 현재 비밀번호 상태 확인
SELECT 
    member_id, 
    member_name,
    LENGTH(member_pwd) as pwd_length,
    CASE 
        WHEN LENGTH(member_pwd) = 64 AND member_pwd REGEXP '^[a-f0-9]+$' THEN 'SHA256 해시'
        ELSE '평문 또는 기타'
    END as pwd_type
FROM tbl_member 
WHERE status = 1;

-- 2. 평문 비밀번호를 SHA256으로 변환 (예시)
-- 실제로는 애플리케이션에서 첫 로그인 시 자동 변환됩니다.

-- 예시: 비밀번호가 '123'인 경우
UPDATE tbl_member 
SET member_pwd = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    mdfy_date = NOW()
WHERE member_pwd = '123' AND status = 1;

-- 예시: 비밀번호가 'admin'인 경우  
UPDATE tbl_member 
SET member_pwd = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    mdfy_date = NOW()
WHERE member_pwd = 'admin' AND status = 1;

-- 예시: 비밀번호가 'password'인 경우
UPDATE tbl_member 
SET member_pwd = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    mdfy_date = NOW()
WHERE member_pwd = 'password' AND status = 1;

-- 3. 마이그레이션 후 상태 확인
SELECT 
    member_id, 
    member_name,
    LENGTH(member_pwd) as pwd_length,
    CASE 
        WHEN LENGTH(member_pwd) = 64 AND member_pwd REGEXP '^[a-f0-9]+$' THEN 'SHA256 해시'
        ELSE '평문 또는 기타'
    END as pwd_type,
    mdfy_date
FROM tbl_member 
WHERE status = 1
ORDER BY mdfy_date DESC;
