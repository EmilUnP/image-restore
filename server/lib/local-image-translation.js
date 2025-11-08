import sharp from 'sharp';

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 96;
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';

const escapeXml = (unsafe) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const wrapText = (text, maxCharsPerLine) => {
  if (maxCharsPerLine <= 0) {
    return [text];
  }

  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine.length > 0 ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      // If single word exceeds limit, hard split
      if (word.length > maxCharsPerLine) {
        const chunks = word.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || [word];
        if (chunks.length > 0) {
          lines.push(chunks[0]);
          currentLine = chunks.slice(1).join(' ');
        } else {
          currentLine = word;
        }
      } else {
        currentLine = word;
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeBoundingBox = (box = {}, imageWidth = 0, imageHeight = 0) => {
  let { x = 0, y = 0, width = 0, height = 0 } = box;

  if (width <= 0 || height <= 0) {
    return null;
  }

  const looksNormalized =
    width > 0 && width <= 1.5 && height > 0 && height <= 1.5 && x >= 0 && x <= 1.5 && y >= 0 && y <= 1.5;

  if (looksNormalized) {
    x *= imageWidth;
    y *= imageHeight;
    width *= imageWidth;
    height *= imageHeight;
  }

  const left = clamp(Math.floor(x), 0, imageWidth);
  const top = clamp(Math.floor(y), 0, imageHeight);
  const right = clamp(Math.floor(x + width), left + 1, imageWidth);
  const bottom = clamp(Math.floor(y + height), top + 1, imageHeight);

  const boxWidth = right - left;
  const boxHeight = bottom - top;

  if (boxWidth <= 0 || boxHeight <= 0) {
    return null;
  }

  const paddingX = Math.round(boxWidth * 0.05);
  const paddingY = Math.round(boxHeight * 0.05);

  const paddedLeft = clamp(left - paddingX, 0, imageWidth);
  const paddedTop = clamp(top - paddingY, 0, imageHeight);
  const paddedRight = clamp(right + paddingX, paddedLeft + 1, imageWidth);
  const paddedBottom = clamp(bottom + paddingY, paddedTop + 1, imageHeight);

  return {
    left: paddedLeft,
    top: paddedTop,
    width: paddedRight - paddedLeft,
    height: paddedBottom - paddedTop,
  };
};

const buildOverlaySvg = (translation, box) => {
  const { width, height } = box;
  const fontSize = Math.max(
    MIN_FONT_SIZE,
    Math.min(MAX_FONT_SIZE, Math.floor(height * 0.6))
  );
  const estimatedCharWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.max(Math.floor(width / estimatedCharWidth), 1);

  const lines = wrapText(translation, maxCharsPerLine).slice(0, 10);
  const lineHeight = fontSize * 1.2;
  const totalTextHeight = lineHeight * lines.length;
  const startY = Math.max(
    fontSize,
    Math.min(height - fontSize * 0.25, (height - totalTextHeight) / 2 + fontSize)
  );

  const linesMarkup = lines
    .map((line, index) => {
      const y = startY + index * lineHeight;
      return `<text x="${width / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-family="${FONT_FAMILY}" fill="#111">${escapeXml(line)}</text>`;
    })
    .join('');

  const backgroundOpacity = Math.min(0.95, Math.max(0.75, height < 60 ? 0.88 : 0.9));

  return Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" rx="${Math.max(4, Math.min(12, height * 0.1))}" fill="#ffffff" opacity="${backgroundOpacity}" filter="url(#shadow)"/>
      ${linesMarkup}
    </svg>`,
  );
};

export const applyTextOverlaysToImage = async (base64Image, translatedTextPairs = []) => {
  if (!base64Image || translatedTextPairs.length === 0) {
    return null;
  }

  let mimeType = 'image/png';
  let base64Data = base64Image;

  if (base64Image.startsWith('data:')) {
    const matches = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      base64Data = base64Image.split(',')[1] || base64Image;
    }
  }

  const buffer = Buffer.from(base64Data, 'base64');
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    return null;
  }

  const composites = translatedTextPairs
    .map(({ translated, boundingBox }) => {
      if (!translated || !boundingBox) return null;

      const normalizedBox = normalizeBoundingBox(boundingBox, metadata.width, metadata.height);
      if (!normalizedBox) return null;

      const overlay = buildOverlaySvg(translated, normalizedBox);

      return {
        input: overlay,
        left: normalizedBox.left,
        top: normalizedBox.top,
      };
    })
    .filter(Boolean);

  if (composites.length === 0) {
    return null;
  }

  const outputBuffer = await image
    .composite(composites)
    .toFormat(metadata.format || 'png')
    .toBuffer();

  const outputBase64 = outputBuffer.toString('base64');
  return `data:${mimeType};base64,${outputBase64}`;
};


