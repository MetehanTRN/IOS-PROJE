const fs = require('fs');
const path = require('path');

// Görsellerin bulunduğu dizin
const imagesDir = path.join(__dirname, 'assets', 'test-plates');

// JSON ve TypeScript çıktılarının yol tanımları
const jsonOutput = path.join(imagesDir, 'testImages.json');
const mapOutput = path.join(__dirname, 'imageMap.ts');

// Klasördeki dosyaları oku
fs.readdir(imagesDir, (err, files) => {
  if (err) {
    console.error('❌ Klasör okunamadı:', err);
    process.exit(1);
  }

  // Sadece jpg, jpeg, png uzantılı dosyaları filtrele
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  // ✅ 1. JSON dosyasını yaz – görsel isimlerini JSON olarak kaydet
  fs.writeFileSync(jsonOutput, JSON.stringify(imageFiles, null, 2));
  console.log('✅ testImages.json oluşturuldu.');

  // ✅ 2. imageMap.ts dosyasını yaz – görselleri `require` ile import eden bir map oluştur
  const importLines = imageFiles.map((file, index) =>
    `const img${index} = require('./assets/test-plates/${file}');`
  ).join('\n');

  const exportLines =
    `export const imageMap: Record<string, any> = {\n` +
    imageFiles.map((file, index) =>
      `  "${file}": img${index},`
    ).join('\n') +
    `\n};`;

  // imageMap.ts dosyasını oluştur
  fs.writeFileSync(mapOutput, `${importLines}\n\n${exportLines}\n`);
  console.log('✅ imageMap.ts oluşturuldu.');
});
