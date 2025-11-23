import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createInvertedLogo() {
  try {
    const inputPath = path.join(__dirname, '../assets/images/logo.png');
    const outputPath = path.join(__dirname, '../assets/images/logo_black.png');
    
    // 입력 파일 존재 확인
    if (!fs.existsSync(inputPath)) {
      console.error('입력 파일을 찾을 수 없습니다:', inputPath);
      return;
    }
    
    console.log('로고 이미지 반전 처리 중...');
    console.log('입력 파일:', inputPath);
    console.log('출력 파일:', outputPath);
    
    await sharp(inputPath)
      .negate() // 색상 반전 (검은색을 흰색으로, 흰색을 검은색으로)
      .png()
      .toFile(outputPath);
    
    console.log('✅ 로고 이미지가 성공적으로 반전되었습니다:', outputPath);
    
    // 파일 크기 확인
    const stats = fs.statSync(outputPath);
    console.log('생성된 파일 크기:', (stats.size / 1024).toFixed(2), 'KB');
    
  } catch (error) {
    console.error('❌ 이미지 처리 중 오류 발생:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('입력 파일이 존재하지 않습니다. logo.png 파일을 확인해주세요.');
    } else if (error.code === 'MODULE_NOT_FOUND') {
      console.error('sharp 라이브러리가 설치되지 않았습니다. "npm install sharp" 명령어로 설치해주세요.');
    }
  }
}

createInvertedLogo();
