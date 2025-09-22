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
  const links: Array<{
    originalUrl: string;
    imageUrl: string;
    startIndex: number;
    endIndex: number;
  }> = [];
  
  // 1. Primero detectar enlaces en formato markdown [texto](url)
  const markdownRegex = /\[([^\]]+)\]\((https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view[^)]*)\)/g;
  let match;
  while ((match = markdownRegex.exec(text)) !== null) {
    const driveUrl = match[2];
    const imageUrl = convertGoogleDriveUrl(driveUrl);
    if (imageUrl) {
      links.push({
        originalUrl: match[0],
        imageUrl,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }
  
  // 2. Detectar enlaces dentro de backticks `url`
  const backtickRegex = /`https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view[^`]*?`/g;
  while ((match = backtickRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const urlInsideBackticks = fullMatch.replace(/`/g, '');
    const imageUrl = convertGoogleDriveUrl(urlInsideBackticks);
    if (imageUrl) {
      links.push({
        originalUrl: urlInsideBackticks,
        imageUrl,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length
      });
    }
  }
  
  // 3. Detectar enlaces directos que no estén dentro de backticks ni ya procesados
  const directRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view[^\s]*/g;
  while ((match = directRegex.exec(text)) !== null) {
    const originalUrl = match[0];
    const startIndex = match.index;
    
    // Verificar que no esté dentro de backticks (ya procesado) o ya detectado
    const isAlreadyDetected = links.some(link => 
      link.originalUrl === originalUrl || // URL ya detectada
      (startIndex >= link.startIndex && startIndex < link.endIndex) // Dentro de rango ya procesado
    );
    
    if (!isAlreadyDetected) {
      const imageUrl = convertGoogleDriveUrl(originalUrl);
      if (imageUrl) {
        links.push({
          originalUrl,
          imageUrl,
          startIndex,
          endIndex: startIndex + originalUrl.length
        });
      }
    }
  }
  
  // Ordenar por índice de inicio
  return links.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Verifica si una URL es un enlace de Google Drive
 * @param url - URL a verificar
 * @returns true si es un enlace de Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  return /https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view/.test(url);
}