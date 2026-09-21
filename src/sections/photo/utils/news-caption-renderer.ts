'use client';

import type { NewsCaptionConfig, FontFamilyChoice } from './news-caption-presets';

// ----------------------------------------------------------------------
// Helper to get Canvas Font Stack
// ----------------------------------------------------------------------

function getFontFamilyStack(fontChoice: FontFamilyChoice): string {
  switch (fontChoice) {
    case 'myeongjo':
      return '"Nanum Myeongjo", "Batang", "Gowun Batang", "Song Myung", "Noto Serif KR", serif';
    case 'retro':
      return '"Gowun Dodum", "Gulim", "Dotum", "Noto Sans KR", sans-serif';
    case 'impact':
      return '"Impact", "Arial Black", "Pretendard", "Noto Sans KR", sans-serif';
    case 'gothic':
    default:
      return '"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  }
}

// ----------------------------------------------------------------------
// Text Outline & Fill Helper
// ----------------------------------------------------------------------

function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
  strokeColor: string,
  outlineWidth: number,
  shadow = true
) {
  ctx.save();

  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = Math.max(4, outlineWidth * 1.5);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(2, outlineWidth * 0.3);
  }

  if (outlineWidth > 0) {
    ctx.lineWidth = outlineWidth * 2;
    ctx.strokeStyle = strokeColor;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
  }

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);

  ctx.restore();
}

// ----------------------------------------------------------------------
// Rounded Rectangle Helper
// ----------------------------------------------------------------------

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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

// ----------------------------------------------------------------------
// Main News Caption Render Function
// ----------------------------------------------------------------------

export function renderNewsCaption(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  config: NewsCaptionConfig
): void {
  const width = image.naturalWidth || image.width || 1200;
  const height = image.naturalHeight || image.height || 800;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw base original image
  ctx.drawImage(image, 0, 0, width, height);

  // 2. Base scaling factor calibrated to 1200px width
  const scale = (width / 1200) * config.fontSizeScale;
  const fontStack = getFontFamilyStack(config.fontFamily);

  // 3. Cinema 16:9 Letterbox (상하 블랙 바)
  let letterboxH = 0;
  if (config.enableLetterbox) {
    letterboxH = height * (config.letterboxSize / 100);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, letterboxH);
    ctx.fillRect(0, height - letterboxH, width, letterboxH);
  }

  // 4. Vignette / Dark gradient overlay at bottom
  if (config.enableVignette) {
    const vignetteHeight = height * 0.35;
    const vignetteY = height - letterboxH - vignetteHeight;
    const grad = ctx.createLinearGradient(0, vignetteY, 0, height - letterboxH);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, vignetteY, width, vignetteHeight);
  }

  // 5. Broadcast TV Bug / Station Logo (Top Corner)
  if (config.showStationLogo) {
    drawBroadcastStationLogo(ctx, width, height, letterboxH, scale, config);
  }

  // 6. Live / Clock Badge (Top Corner or Banner)
  if (config.showLiveBadge && config.locationText) {
    drawLiveClockWidget(ctx, width, height, letterboxH, scale, config);
  }

  // 7. Render Subtitles by Style
  const baseY = height - letterboxH - height * (config.bottomOffset / 100);

  switch (config.styleId) {
    case 'human-theater':
      renderHumanTheaterStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'kbs-news':
      renderKbsNewsStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'mbc-news':
      renderMbcNewsStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'sbs-news':
      renderSbsNewsStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'jtbc-news':
      renderJtbcNewsStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'ytn-news':
      renderYtnNewsStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'cnn-news':
      renderCnnNewsStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'investigative':
      renderInvestigativeStyle(ctx, width, baseY, scale, fontStack, config);
      break;
    case 'variety-meme':
      renderVarietyMemeStyle(ctx, width, baseY, scale, fontStack, config);
      break;
  }
}

// ----------------------------------------------------------------------
// 1. KBS 인간극장 다큐멘터리 자막 렌더러 (첨부 이미지 스타일)
// ----------------------------------------------------------------------

function renderHumanTheaterStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const line1Size = Math.round(36 * scale);
  const line2Size = Math.round(44 * scale);
  const lineSpacing = Math.round(18 * scale);
  const outlineW = Math.max(3, config.outlineWidth * scale);

  const isCenter = config.textAlign === 'center';
  const startX = isCenter ? width / 2 : width * 0.08;

  ctx.textAlign = isCenter ? 'center' : 'left';
  ctx.textBaseline = 'alphabetic';

  // 1행: 이름(나이) / 직업 또는 상태 (예: 시능지(23) / 자취생)
  if (config.subText) {
    ctx.font = `bold ${line1Size}px ${fontStack}`;
    drawOutlinedText(
      ctx,
      config.subText,
      startX,
      baseY - line2Size - lineSpacing,
      config.textColor,
      config.outlineColor,
      outlineW
    );
  }

  // 2행: 인터뷰 대사 (예: "계란이 다 떨어졌다")
  if (config.headline) {
    ctx.font = `bold ${line2Size}px ${fontStack}`;
    drawOutlinedText(
      ctx,
      config.headline,
      startX,
      baseY,
      config.textColor,
      config.outlineColor,
      outlineW
    );
  }
}

// ----------------------------------------------------------------------
// 2. KBS 9시 뉴스 자막 렌더러
// ----------------------------------------------------------------------

function renderKbsNewsStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const bannerH = Math.round(90 * scale);
  const bannerY = baseY - bannerH;
  const paddingX = Math.round(30 * scale);

  // 블루 그라데이션 하단 배너
  const grad = ctx.createLinearGradient(0, bannerY, width, bannerY);
  grad.addColorStop(0, '#0a2342');
  grad.addColorStop(0.15, config.bannerColor || '#1e3a8a');
  grad.addColorStop(0.85, '#1e40af');
  grad.addColorStop(1, '#0f172a');

  ctx.fillStyle = grad;
  ctx.fillRect(0, bannerY, width, bannerH);

  // 상단 골드/시안 얇은 액센트 라인
  ctx.fillStyle = config.accentColor || '#dc2626';
  ctx.fillRect(0, bannerY, width, Math.max(3, 4 * scale));

  // 좌측 뱃지 (예: [단독] KBS 뉴스 9)
  const badgeFontSize = Math.round(20 * scale);
  ctx.font = `800 ${badgeFontSize}px ${fontStack}`;
  const badgeText = config.badgeText || 'KBS 뉴스 9';
  const badgeW = ctx.measureText(badgeText).width + 24 * scale;
  const badgeH = Math.round(34 * scale);
  const badgeY = bannerY + Math.round(14 * scale);

  // 뱃지 배경
  ctx.fillStyle = config.accentColor || '#dc2626';
  drawRoundedRect(ctx, paddingX, badgeY, badgeW, badgeH, 4 * scale);
  ctx.fill();

  // 뱃지 텍스트
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(badgeText, paddingX + badgeW / 2, badgeY + badgeH / 2);

  // 취재 기자 / 인물 서브텍스트 (뱃지 우측)
  if (config.subText) {
    const subFontSize = Math.round(20 * scale);
    ctx.font = `600 ${subFontSize}px ${fontStack}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(config.subText, paddingX + badgeW + 16 * scale, badgeY + badgeH / 2);
  }

  // 메인 뉴스 헤드라인 (하단 행)
  const headFontSize = Math.round(34 * scale);
  ctx.font = `800 ${headFontSize}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.textColor || '#FFFFFF';
  ctx.fillText(config.headline, paddingX, bannerY + bannerH - Math.round(24 * scale));
}

// ----------------------------------------------------------------------
// 3. MBC 뉴스데스크 자막 렌더러
// ----------------------------------------------------------------------

function renderMbcNewsStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const bannerH = Math.round(85 * scale);
  const bannerY = baseY - bannerH;
  const startX = width * 0.05;
  const bannerW = width * 0.9;

  // 인터뷰 대상자 명패 박스 (상단에 띄움)
  if (config.subText) {
    const subFontSize = Math.round(22 * scale);
    ctx.font = `700 ${subFontSize}px ${fontStack}`;
    const nameplateW = ctx.measureText(config.subText).width + 36 * scale;
    const nameplateH = Math.round(38 * scale);
    const nameplateY = bannerY - nameplateH - 8 * scale;

    // 사선 슬랜트 명패
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.moveTo(startX, nameplateY);
    ctx.lineTo(startX + nameplateW + 15 * scale, nameplateY);
    ctx.lineTo(startX + nameplateW, nameplateY + nameplateH);
    ctx.lineTo(startX, nameplateY + nameplateH);
    ctx.closePath();
    ctx.fill();

    // 네온 시안 좌측 바
    ctx.fillStyle = config.accentColor || '#06b6d4';
    ctx.fillRect(startX, nameplateY, 5 * scale, nameplateH);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(config.subText, startX + 16 * scale, nameplateY + nameplateH / 2);
    ctx.restore();
  }

  // 메인 배너: 사선 컷 슬랜트 폴리곤
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(startX, bannerY);
  ctx.lineTo(startX + bannerW, bannerY);
  ctx.lineTo(startX + bannerW - 20 * scale, bannerY + bannerH);
  ctx.lineTo(startX, bannerY + bannerH);
  ctx.closePath();

  const grad = ctx.createLinearGradient(startX, bannerY, startX + bannerW, bannerY);
  grad.addColorStop(0, config.bannerColor || '#0284c7');
  grad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = grad;
  ctx.fill();

  // 배너 좌측 시안 액센트
  ctx.fillStyle = config.accentColor || '#06b6d4';
  ctx.fillRect(startX, bannerY, 8 * scale, bannerH);

  // 카테고리 뱃지 ([집중취재] 등)
  let headlineOffsetX = startX + 24 * scale;
  if (config.badgeText) {
    const badgeFontSize = Math.round(22 * scale);
    ctx.font = `800 ${badgeFontSize}px ${fontStack}`;
    const bW = ctx.measureText(config.badgeText).width + 16 * scale;

    ctx.fillStyle = '#0f172a';
    drawRoundedRect(
      ctx,
      headlineOffsetX,
      bannerY + 14 * scale,
      bW,
      bannerH - 28 * scale,
      4 * scale
    );
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = config.accentColor || '#38bdf8';
    ctx.fillText(config.badgeText, headlineOffsetX + bW / 2, bannerY + bannerH / 2);

    headlineOffsetX += bW + 16 * scale;
  }

  // 메인 헤드라인
  const headFontSize = Math.round(32 * scale);
  ctx.font = `800 ${headFontSize}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.textColor || '#FFFFFF';
  ctx.fillText(config.headline, headlineOffsetX, bannerY + bannerH / 2);

  ctx.restore();
}

// ----------------------------------------------------------------------
// 4. SBS 8 뉴스 자막 렌더러
// ----------------------------------------------------------------------

function renderSbsNewsStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const bannerH = Math.round(92 * scale);
  const bannerY = baseY - bannerH;
  const paddingX = Math.round(40 * scale);

  // 딥 네이비 배경
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(0, bannerY, width, bannerH);

  // 하단 네온 일렉트릭 블루 라인
  ctx.fillStyle = config.accentColor || '#38bdf8';
  ctx.fillRect(0, bannerY + bannerH - 4 * scale, width, 4 * scale);

  // 상단 소제목 / 기자 정보
  const topText = [config.badgeText, config.subText].filter(Boolean).join('  |  ');
  if (topText) {
    const subFontSize = Math.round(20 * scale);
    ctx.font = `700 ${subFontSize}px ${fontStack}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = config.accentColor || '#38bdf8';
    ctx.fillText(topText, paddingX, bannerY + 14 * scale);
  }

  // 메인 헤드라인
  const headFontSize = Math.round(34 * scale);
  ctx.font = `800 ${headFontSize}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = config.textColor || '#FFFFFF';
  ctx.fillText(config.headline, paddingX, bannerY + bannerH - 14 * scale);
}

// ----------------------------------------------------------------------
// 5. JTBC 뉴스룸 자막 렌더러
// ----------------------------------------------------------------------

function renderJtbcNewsStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const cardW = width * 0.88;
  const cardH = Math.round(95 * scale);
  const cardX = (width - cardW) / 2;
  const cardY = baseY - cardH;

  // 매트 다크 슬레이트 라운드 카드
  ctx.save();
  ctx.fillStyle = 'rgba(30, 41, 59, 0.94)';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 8 * scale);
  ctx.fill();

  // 상단 틴트 악센트 바
  ctx.fillStyle = config.accentColor || '#14b8a6';
  ctx.beginPath();
  ctx.moveTo(cardX + 8 * scale, cardY);
  ctx.lineTo(cardX + cardW - 8 * scale, cardY);
  ctx.lineTo(cardX + cardW - 8 * scale, cardY + 4 * scale);
  ctx.lineTo(cardX + 8 * scale, cardY + 4 * scale);
  ctx.closePath();
  ctx.fill();

  // 카테고리 뱃지 & 인터뷰이
  const metaText = [config.badgeText, config.subText].filter(Boolean).join('   ');
  if (metaText) {
    const metaSize = Math.round(19 * scale);
    ctx.font = `700 ${metaSize}px ${fontStack}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = config.accentColor || '#2dd4bf';
    ctx.fillText(metaText, cardX + 24 * scale, cardY + 16 * scale);
  }

  // 메인 인용구 헤드라인
  const headSize = Math.round(31 * scale);
  ctx.font = `700 ${headSize}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = config.textColor || '#FFFFFF';
  ctx.fillText(config.headline, cardX + 24 * scale, cardY + cardH - 16 * scale);

  ctx.restore();
}

// ----------------------------------------------------------------------
// 6. YTN 24시 속보 자막 렌더러
// ----------------------------------------------------------------------

function renderYtnNewsStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const topH = Math.round(44 * scale);
  const botH = Math.round(52 * scale);
  const totalH = topH + botH;
  const startY = baseY - totalH;

  // 1단: 레드 긴급 속보 바
  ctx.fillStyle = config.bannerColor || '#dc2626';
  ctx.fillRect(0, startY, width, topH);

  // 속보 뱃지 박스
  const badgeW = Math.round(110 * scale);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(0, startY, badgeW, topH);

  ctx.font = `900 ${Math.round(20 * scale)}px ${fontStack}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('속보', badgeW / 2, startY + topH / 2);

  // 상단 속보 텍스트
  ctx.font = `700 ${Math.round(22 * scale)}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(config.headline, badgeW + 16 * scale, startY + topH / 2);

  // 2단: 다크 롤링 티커 바
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, startY + topH, width, botH);

  // 옐로우 포인트 라인
  ctx.fillStyle = config.accentColor || '#facc15';
  ctx.fillRect(0, startY + topH, width, 2 * scale);

  // 하단 상세 / 리포터 텍스트
  ctx.font = `600 ${Math.round(22 * scale)}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(
    config.subText ? `${config.subText}  ―  ${config.badgeText || 'YTN 뉴스'}` : config.headline,
    20 * scale,
    startY + topH + botH / 2
  );
}

// ----------------------------------------------------------------------
// 7. CNN / 글로벌 속보 자막 렌더러
// ----------------------------------------------------------------------

function renderCnnNewsStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const topH = Math.round(48 * scale);
  const botH = Math.round(56 * scale);
  const totalH = topH + botH;
  const startY = baseY - totalH;

  // 상단 레드 바
  ctx.fillStyle = config.bannerColor || '#cc0000';
  ctx.fillRect(0, startY, width, topH);

  // BREAKING NEWS 타이틀
  ctx.font = `900 ${Math.round(28 * scale)}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(config.badgeText || 'BREAKING NEWS', 24 * scale, startY + topH / 2);

  // 하단 옐로우 티커 바
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, startY + topH, width, botH);

  ctx.fillStyle = config.accentColor || '#eab308';
  ctx.fillRect(0, startY + topH, width, 4 * scale);

  // 헤드라인
  ctx.font = `800 ${Math.round(26 * scale)}px ${fontStack}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.textColor || '#FFFFFF';
  ctx.fillText(config.headline, 24 * scale, startY + topH + botH / 2);
}

// ----------------------------------------------------------------------
// 8. 그것이 알고싶다 (탐사보도) 자막 렌더러
// ----------------------------------------------------------------------

function renderInvestigativeStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const line1Size = Math.round(30 * scale);
  const line2Size = Math.round(40 * scale);
  const outlineW = Math.max(3, config.outlineWidth * scale);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // 1행: 제보자 정보 (옐로우 / 오렌지 틴트)
  if (config.subText) {
    ctx.font = `bold ${line1Size}px ${fontStack}`;
    drawOutlinedText(
      ctx,
      config.subText,
      width / 2,
      baseY - line2Size - 16 * scale,
      config.accentColor || '#f97316',
      '#000000',
      outlineW
    );
  }

  // 2행: 진술 대사 (따옴표)
  if (config.headline) {
    ctx.font = `bold ${line2Size}px ${fontStack}`;
    drawOutlinedText(
      ctx,
      config.headline,
      width / 2,
      baseY,
      config.textColor || '#fef08a',
      config.outlineColor || '#000000',
      outlineW + 2 * scale
    );
  }
}

// ----------------------------------------------------------------------
// 9. 예능 / 유튜브 인터뷰 밈 자막 렌더러
// ----------------------------------------------------------------------

function renderVarietyMemeStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  scale: number,
  fontStack: string,
  config: NewsCaptionConfig
) {
  const line1Size = Math.round(32 * scale);
  const line2Size = Math.round(48 * scale);
  const outlineW = Math.max(4, config.outlineWidth * scale);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (config.subText) {
    ctx.font = `900 ${line1Size}px ${fontStack}`;
    drawOutlinedText(
      ctx,
      config.subText,
      width / 2,
      baseY - line2Size - 18 * scale,
      '#FFFFFF',
      '#000000',
      outlineW * 0.8
    );
  }

  if (config.headline) {
    ctx.font = `900 ${line2Size}px ${fontStack}`;
    drawOutlinedText(
      ctx,
      config.headline,
      width / 2,
      baseY,
      config.textColor || '#fef08a',
      config.outlineColor || '#000000',
      outlineW
    );
  }
}

// ----------------------------------------------------------------------
// Corner Watermark & Live Widgets
// ----------------------------------------------------------------------

function drawBroadcastStationLogo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letterboxH: number,
  scale: number,
  config: NewsCaptionConfig
) {
  const padding = Math.max(20 * scale, 18);
  const logoY = letterboxH + padding + 16 * scale;
  const logoX = width - padding;

  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  if (config.styleId === 'human-theater') {
    // 인간극장 시그니처 뱃지
    const badgeText = config.badgeText || 'KBS 인간극장';
    ctx.font = `bold ${Math.round(24 * scale)}px "Nanum Myeongjo", "Batang", serif`;
    drawOutlinedText(ctx, badgeText, logoX, logoY, '#FFFFFF', '#000000', 3 * scale);
  } else if (config.styleId === 'cnn-news') {
    // CNN 로고
    ctx.font = `900 ${Math.round(32 * scale)}px "Impact", sans-serif`;
    ctx.fillStyle = '#cc0000';
    ctx.fillText('CNN', logoX, logoY);
  } else {
    // 일반 방송사 로고
    const channelName =
      config.styleId === 'kbs-news'
        ? 'KBS 1'
        : config.styleId === 'mbc-news'
          ? 'MBC'
          : config.styleId === 'sbs-news'
            ? 'SBS'
            : config.styleId === 'jtbc-news'
              ? 'JTBC'
              : config.styleId === 'ytn-news'
                ? 'YTN'
                : 'BROADCAST';

    ctx.font = `800 ${Math.round(22 * scale)}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6 * scale;
    ctx.fillText(channelName, logoX, logoY);
  }

  ctx.restore();
}

function drawLiveClockWidget(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  letterboxH: number,
  scale: number,
  config: NewsCaptionConfig
) {
  const padding = Math.max(20 * scale, 18);
  const widgetY = letterboxH + padding + 16 * scale;
  const widgetX = padding;

  ctx.save();
  ctx.font = `700 ${Math.round(20 * scale)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Red LIVE dot
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(widgetX + 6 * scale, widgetY + 10 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6 * scale;
  ctx.fillText(config.locationText, widgetX + 16 * scale, widgetY);

  ctx.restore();
}
