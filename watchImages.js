// watchImages.js – test-plates klasöründe yeni görselleri izler, değişiklik olursa imageMap'i otomatik günceller

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// İzlenecek klasör (görsellerin olduğu yer)
const folderPath = path.join(__dirname, "assets", "test-plates");

// Önceki dosya listesini tutan yapı
let previousFiles = new Set();

/**
 * Her çalıştığında klasörü tarayıp yeni veya silinmiş dosya olup olmadığını kontrol eder
 */
function checkForChanges() {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error("Klasör okunamadı:", err);
            return;
        }

        // Sadece resim dosyalarını al
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
        const currentFiles = new Set(imageFiles);

        // Yeni dosya var mı kontrolü
        const isChanged =
            imageFiles.length !== previousFiles.size ||
            [...currentFiles].some(file => !previousFiles.has(file));

        // Yeni dosya eklenmişse veya biri silinmişse tetikleyici çalışır
        if (isChanged) {
            console.log("Yeni görsel algılandı, generateImageAssets.js tetikleniyor...");

            // Dış script çalıştırılır (imageMap ve JSON dosyası güncellenir)
            exec("node generateImageAssets.js", (error, stdout, stderr) => {
                if (error) {
                    console.error(`Script hatası: ${error.message}`);
                    return;
                }
                if (stderr) console.error(`stderr: ${stderr}`);
                console.log(stdout); // Başarı çıktısı
            });

            // Şu anki dosya listesi yeni referans olur
            previousFiles = currentFiles;
        }
    });
}

// İzleme başlatıldığında terminal çıktısı
console.log("Klasör izleme başlatıldı...");

// Her 5 saniyede bir klasörü kontrol et
setInterval(checkForChanges, 5000);
