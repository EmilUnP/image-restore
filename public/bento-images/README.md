# Bento Grid Images

This folder is for images used in the MagicBento grid component on the landing page.

## How to Use

1. Upload your images to this folder (e.g., `image1.jpg`, `feature1.png`, etc.)
2. In `LandingPage.tsx`, update the cards array to include the `image` property:

```typescript
{
  image: 'image1.jpg', // Just the filename, not the full path
  imagePosition: 'background', // or 'foreground'
  title: 'Your Title',
  description: 'Your description',
  label: 'Label',
  // ... other properties
}
```

## Image Position Options

- **`background`**: Image appears as a background behind the text (default)
- **`foreground`**: Image appears in the foreground, text overlays on top

## Recommended Image Sizes

- **Large cards (3x2)**: 1200x800px or higher
- **Medium cards (2x1)**: 800x400px or higher  
- **Small cards (1x1)**: 400x400px or higher

## Supported Formats

- JPG/JPEG
- PNG
- WebP
- SVG

## Notes

- Images are automatically scaled to fit the card
- The overlay gradient ensures text remains readable
- Use high-quality images for best results

