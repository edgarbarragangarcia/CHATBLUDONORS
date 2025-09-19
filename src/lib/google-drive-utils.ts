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
  // Regex para detectar enlaces de Google Drive dentro de markdown [texto](url)
  const markdownDriveRegex = /\[([^\]]+)\]\((https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view[^)]*)\)/g;
  // Regex para detectar enlaces directos de Google Drive (incluyendo al final de oración)
  const directDriveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view[^\s]*/g;
  
  const links: Array<{
    originalUrl: string;
    imageUrl: string;
    startIndex: number;
    endIndex: number;
  }> = [];
  
  const processedRanges: Array<{start: number, end: number}> = [];
  
  // Primero buscar enlaces en formato markdown (tienen prioridad)
  let match;
  while ((match = markdownDriveRegex.exec(text)) !== null) {
    const fullMatch = match[0]; // [texto](url)
    const linkText = match[1]; // texto
    const driveUrl = match[2]; // url
    const imageUrl = convertGoogleDriveUrl(driveUrl);
    
    if (imageUrl) {
      const startIndex = match.index;
      const endIndex = match.index + fullMatch.length;
      
      links.push({
        originalUrl: fullMatch,
        imageUrl,
        startIndex,
        endIndex
      });
      
      // Marcar este rango como procesado
      processedRanges.push({start: startIndex, end: endIndex});
    }
  }
  
  // Luego buscar enlaces directos, pero solo si no están dentro de un rango ya procesado
  directDriveRegex.lastIndex = 0; // Reset regex
  while ((match = directDriveRegex.exec(text)) !== null) {
    const originalUrl = match[0];
    const startIndex = match.index;
    const endIndex = match.index + originalUrl.length;
    
    // Verificar si este enlace está dentro de un rango ya procesado (markdown)
    const isWithinProcessedRange = processedRanges.some(range => 
      startIndex >= range.start && endIndex <= range.end
    );
    
    if (!isWithinProcessedRange) {
      const imageUrl = convertGoogleDriveUrl(originalUrl);
      
      if (imageUrl) {
        links.push({
          originalUrl,
          imageUrl,
          startIndex,
          endIndex
        });
      }
    }
  }
  
  // Ordenar por índice de inicio para procesar en orden
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