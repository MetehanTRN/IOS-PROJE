// Plakaları tek bir formata getirir

export const normalizePlate = (plate: string) =>
  plate.replace(/\s/g, '').toUpperCase();