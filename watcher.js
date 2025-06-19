const fs = require('fs');
const path = require('path');

const sourceDir = 'C:/Users/meteh/My Drive/PlakaTransferDrive';
const targetDir = path.join(__dirname, 'expo-test-plates');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function moveImage(fileName) {
  const sourcePath = path.join(sourceDir, fileName);
  const targetPath = path.join(targetDir, fileName);

  fs.copyFile(sourcePath, targetPath, (err) => {
    if (err) return console.error('❌ Kopyalama hatası:', err);

    fs.unlink(sourcePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('❌ Silme hatası:', unlinkErr);
      } else {
        console.log(`✅ ${fileName} başarıyla taşındı ve silindi.`);
      }
    });
  });
}

function checkDirectory() {
  fs.readdir(sourceDir, (err, files) => {
    if (err) return console.error('❌ Klasör okunamadı:', err);

    files
      .filter(file => file.toLowerCase().endsWith('.jpg'))
      .forEach(moveImage);
  });
}

setInterval(checkDirectory, 2000);
