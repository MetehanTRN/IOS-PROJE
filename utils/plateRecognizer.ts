// API anahtarını proje yapılandırmasından al
import { PLATERECOGNIZER_TOKEN } from '../config';

/**
 * Bir base64 görseli Plate Recognizer API ile analiz eder
 * @param base64Image - Görselin base64 string hali
 * @param debugInfo - Opsiyonel: hata durumunda hangi görsel olduğunu belirtmek için
 * @returns Tanıma sonucu veya null
 */
export const recognizePlate = async (
  base64Image: string,
  debugInfo?: string // örnek: "test-plates/plate7.jpg"
) => {
  try {
    // API'ye POST isteği gönder
    const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${PLATERECOGNIZER_TOKEN}`, // API anahtarı ile kimlik doğrulama
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        upload: base64Image,         // base64 formatındaki görsel
        regions: ['tr'],             // Türkiye için özel bölge filtresi
      }),
    });

    // API isteği başarısızsa logla ve hata fırlat
    if (!response.ok) {
      console.error('❌ API isteği başarısız oldu.');
      if (debugInfo) console.error('🖼️ Hata veren görsel:', debugInfo);
      throw new Error('Plaka tanıma başarısız.');
    }

    const data = await response.json();

    // Plaka bulunamamışsa kullanıcıyı uyar
    if (!data.results || data.results.length === 0) {
      console.warn('⚠️ API yanıtı geldi ama plaka tespit edilemedi.');
      if (debugInfo) console.warn('🖼️ Plaka bulunamayan görsel:', debugInfo);
      return null;
    }

    // Başarılı sonuç döndürülür
    return data;
  } catch (error) {
    // Beklenmeyen hata durumunda logla
    console.error('🚨 Tanıma sırasında beklenmeyen hata:', error);
    if (debugInfo) console.error('🧾 Hatalı görsel:', debugInfo);
    return null;
  }
};
