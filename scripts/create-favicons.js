import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createFavicons() {
  try {
    const inputPath = path.join(__dirname, '../assets/images/logo.png');
    const publicPath = path.join(__dirname, '../public');
    
    // 입력 파일 존재 확인
    if (!fs.existsSync(inputPath)) {
      console.error('입력 파일을 찾을 수 없습니다:', inputPath);
      return;
    }
    
    console.log('Favicon 생성 중...');
    console.log('입력 파일:', inputPath);
    
    // 다양한 크기의 favicon 생성
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 48, name: 'favicon-48x48.png' },
      { size: 64, name: 'favicon-64x64.png' },
      { size: 96, name: 'favicon-96x96.png' },
      { size: 128, name: 'favicon-128x128.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' }
    ];
    
    // 각 크기별로 favicon 생성
    for (const { size, name } of sizes) {
      const outputPath = path.join(publicPath, name);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // 투명 배경
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${name} 생성 완료 (${size}x${size})`);
    }
    
    // ICO 파일 생성 (16x16, 32x32 포함)
    const icoPath = path.join(publicPath, 'favicon.ico');
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath);
    
    console.log('✅ favicon.ico 생성 완료');
    
    // Apple Touch Icon 생성
    const appleTouchPath = path.join(publicPath, 'apple-touch-icon.png');
    await sharp(inputPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // 흰색 배경
      })
      .png()
      .toFile(appleTouchPath);
    
    console.log('✅ apple-touch-icon.png 생성 완료');
    
    // Web App Manifest 생성
    const manifestPath = path.join(publicPath, 'site.webmanifest');
    const manifest = {
      name: 'AI-LSMMS',
      short_name: 'LSMMS',
      description: '축산의사결정시스템',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: '#2c3e50',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/'
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ site.webmanifest 생성 완료');
    
    console.log('\n🎉 모든 favicon 파일이 성공적으로 생성되었습니다!');
    
  } catch (error) {
    console.error('❌ Favicon 생성 중 오류 발생:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('입력 파일이 존재하지 않습니다. logo.png 파일을 확인해주세요.');
    } else if (error.code === 'MODULE_NOT_FOUND') {
      console.error('sharp 라이브러리가 설치되지 않았습니다. "npm install sharp" 명령어로 설치해주세요.');
    }
  }
}

createFavicons();

