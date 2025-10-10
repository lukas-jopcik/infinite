const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../app/icon.svg');
  
  // Check if SVG exists
  if (!fs.existsSync(svgPath)) {
    console.error('❌ SVG file not found:', svgPath);
    return;
  }

  console.log('🚀 Generating PNG icons from SVG...');

  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate different sizes
    const sizes = [
      { size: 192, path: '../app/icon.png', name: 'icon.png (192x192)' },
      { size: 180, path: '../app/apple-icon.png', name: 'apple-icon.png (180x180)' },
      { size: 512, path: '../public/icon-512.png', name: 'icon-512.png (512x512)' },
      { size: 1200, path: '../app/opengraph-image.png', name: 'opengraph-image.png (1200x1200)' }
    ];

    for (const { size, path: outputPath, name } of sizes) {
      const fullOutputPath = path.join(__dirname, outputPath);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(fullOutputPath);
      
      console.log(`✅ Generated ${name}`);
    }

    // Generate favicon.ico (multiple sizes)
    console.log('🔄 Generating favicon.ico...');
    
    // Create multiple sizes for ICO
    const icoSizes = [16, 32, 48];
    const icoBuffers = [];
    
    for (const size of icoSizes) {
      const buffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      icoBuffers.push(buffer);
    }
    
    // For now, just use the 32x32 version as favicon.ico
    // (A proper ICO file would need a library like 'ico-convert')
    const faviconPath = path.join(__dirname, '../app/favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    
    // Rename to .ico (this is a workaround - proper ICO would need special library)
    fs.renameSync(faviconPath.replace('.ico', '.png'), faviconPath);
    
    console.log('✅ Generated favicon.ico (32x32)');

    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📋 Generated files:');
    console.log('  - app/icon.png (192x192)');
    console.log('  - app/apple-icon.png (180x180)');
    console.log('  - public/icon-512.png (512x512)');
    console.log('  - app/opengraph-image.png (1200x1200)');
    console.log('  - app/favicon.ico (32x32)');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons();
