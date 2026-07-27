const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const videoPath = '/Users/luke/.homiclaw/workspace/files/钉钉录屏_2026-07-15 161837.mp4';
const outputDir = '/Users/luke/.homiclaw/workspace/files/video-frames';

// 创建输出目录
const fs = require('fs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 提取关键帧：每秒提取一张
ffmpeg(videoPath)
  .on('error', (err) => {
    console.error('Error:', err.message);
    process.exit(1);
  })
  .on('end', () => {
    console.log('✓ 视频帧提取完成！');
    console.log(`输出目录：${outputDir}`);
  })
  .screenshots({
    timestamps: [0, 5, 10, 15, 20, 30, 45, 60],
    filename: 'frame-%03d.png',
    folder: outputDir,
    size: '1280x720'
  });