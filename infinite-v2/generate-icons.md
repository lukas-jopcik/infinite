# Icon Generation Guide

## Current Status
✅ SVG icon created: `app/icon.svg`
✅ PNG files generated successfully
✅ Metadata updated with all icons
✅ OpenGraph image added for social media

## ✅ COMPLETED - PNG Files Generated

All PNG files have been successfully generated from the SVG icon:

### Generated Files:
1. **`app/icon.png`** - 192x192 pixels ✅
2. **`app/apple-icon.png`** - 180x180 pixels ✅
3. **`app/opengraph-image.png`** - 1200x1200 pixels ✅
4. **`public/icon-512.png`** - 512x512 pixels ✅
5. **`app/favicon.ico`** - 32x32 pixels ✅

### Tools to Use:

#### Option 1: Online Converters
- **SVG to PNG**: https://convertio.co/svg-png/
- **SVG to ICO**: https://convertio.co/svg-ico/
- **SVG to PNG (multiple sizes)**: https://cloudconvert.com/svg-to-png

#### Option 2: Command Line (if you have ImageMagick)
```bash
# Generate PNG files
convert app/icon.svg -resize 192x192 app/icon.png
convert app/icon.svg -resize 180x180 app/apple-icon.png
convert app/icon.svg -resize 512x512 public/icon-512.png

# Generate ICO file
convert app/icon.svg -resize 16x16 temp-16.png
convert app/icon.svg -resize 32x32 temp-32.png
convert app/icon.svg -resize 48x48 temp-48.png
convert temp-16.png temp-32.png temp-48.png app/favicon.ico
rm temp-*.png
```

#### Option 3: Design Tools
- **Figma**: Import SVG, export as PNG/ICO
- **GIMP**: Open SVG, export as PNG/ICO
- **Photoshop**: Open SVG, export as PNG/ICO

### ✅ Metadata Updated:

1. **Updated metadata in `app/layout.tsx`**:
```typescript
icons: {
  icon: [
    { url: '/icon.svg', type: 'image/svg+xml' },
    { url: '/icon.png', sizes: '192x192', type: 'image/png' }
  ],
  apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
},
```

2. **Added OpenGraph image**:
```typescript
openGraph: {
  images: [
    {
      url: '/opengraph-image.png',
      width: 1200,
      height: 1200,
      alt: 'Infinite - Objav dňa z vesmíru',
    }
  ],
  // ... other openGraph properties
}
```

3. **Added Twitter card image**:
```typescript
twitter: {
  card: "summary_large_image",
  images: ['/opengraph-image.png'],
  // ... other twitter properties
}
```

## ✅ Complete Implementation
The app now has full icon support with:
- ✅ SVG icon for modern browsers
- ✅ PNG fallbacks for better compatibility
- ✅ Apple touch icons for iOS devices
- ✅ Social media sharing with OpenGraph image
- ✅ Twitter card support
- ✅ PWA support with large icon
- ✅ Professional favicon for browser tabs

## Design Notes
The SVG icon features:
- Space-themed design with orbiting planets/stars
- Dark background with bright accent colors
- Minimalistic, clean design
- Works well at small sizes
