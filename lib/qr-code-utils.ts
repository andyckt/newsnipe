/**
 * Utility functions for generating styled QR codes
 */
import QRCode from 'qrcode';

/**
 * Generates a QR code with logo and rounded corners
 * @param url The URL to encode in the QR code
 * @param size The size of the QR code in pixels (default: 300)
 * @returns A Promise that resolves to a data URL of the QR code image
 */
export async function generateStyledQRCode(url: string, size: number = 300): Promise<string> {
  // Only run on client side
  if (typeof window === 'undefined') return '';
  
  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  
  // Set canvas size
  canvas.width = size;
  canvas.height = size;
  
  // Generate the QR code on the canvas
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: 'H', // High - allows for 30% of the QR code to be damaged
    margin: 1,
    width: size,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  // Create a new canvas for our final QR code with rounded corners and logo
  const finalCanvas = document.createElement("canvas");
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) return "";
  
  finalCanvas.width = size;
  finalCanvas.height = size;
  
  // Draw rounded rectangle background
  finalCtx.fillStyle = "#ffffff";
  roundRect(finalCtx, 0, 0, size, size, 20); // 20px border radius
  finalCtx.fill();
  
  // Draw the QR code onto the final canvas (with slight margin for rounded corners)
  const margin = 10;
  finalCtx.drawImage(canvas, margin, margin, size - margin * 2, size - margin * 2);
  
  // Load and draw the logo in the center
  const logoImg = new Image();
  
  // Return a promise that resolves when the logo is loaded and drawn
  return new Promise((resolve, reject) => {
    logoImg.onload = () => {
      // Calculate logo size (about 20% of QR code)
      const logoSize = size * 0.2;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      
      // Draw white background for logo
      finalCtx.fillStyle = "#ffffff";
      finalCtx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
      
      // Draw the logo
      finalCtx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      
      // Return the data URL of the final canvas
      resolve(finalCanvas.toDataURL("image/png"));
    };
    
    logoImg.onerror = () => {
      // If logo fails to load, just return the QR code without logo
      resolve(finalCanvas.toDataURL("image/png"));
    };
    
    // Set the source of the logo
    logoImg.src = "/forQRCode.png";
  });
}

// Helper function to draw rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
