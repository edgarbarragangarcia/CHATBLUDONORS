/**
 * Utilidades para manejar enlaces de Google Drive
 */

/**
 * Convierte un enlace de Google Drive en formato de vista a formato de imagen directa
 * @param url - URL de Google Drive en formato: https://drive.google.com/file/d/{fileId}/view?usp=sharing
 * @returns URL de imagen directa o null si no es un enlace válido de Google Drive
 */
export function convertGoogleDriveUrl(url: string): string | null {
  // Regex para detectar enlaces de Google Drive
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    // Usar formato de thumbnail que es más compatible con CORS
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  return null;
}

/**
 * Detecta si un texto contiene enlaces de Google Drive
 * @param text - Texto a analizar
 * @returns Array de objetos con información de los enlaces encontrados
 */
export function detectGoogleDriveLinks(text: string): Array<{
  originalUrl: string;
  imageUrl: string;
  startIndex: number;
  endIndex: number;
}> {
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view[^\s]*/g;
  const links: Array<{
    originalUrl: string;
    imageUrl: string;
    startIndex: number;
    endIndex: number;
  }> = [];
  
  let match;
  while ((match = driveRegex.exec(text)) !== null) {
    const originalUrl = match[0];
    const imageUrl = convertGoogleDriveUrl(originalUrl);
    
    if (imageUrl) {
      links.push({
        originalUrl,
        imageUrl,
        startIndex: match.index,
        endIndex: match.index + originalUrl.length
      });
    }
  }
  
  return links;
}

/**
 * Verifica si una URL es un enlace de Google Drive
 * @param url - URL a verificar
 * @returns true si es un enlace de Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  return /https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view/.test(url);
}