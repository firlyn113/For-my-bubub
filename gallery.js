/* =========================================================
   Our Memory Moments — gallery.js
   Static photo gallery + downloadable keepsake card generator.
   Kept fully separate from script.js/index.html on purpose.
========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     PHOTO LIST — the only part you should need to touch.
     Drop photos into assets/gallery/ named photo1.jpg …
     and this list will pick them up automatically.
     Missing files simply show a soft placeholder.
  --------------------------------------------------------- */
  const PHOTOS = [
    'assets/gallery/photo1.jpg',
    'assets/gallery/photo2.jpg',
    'assets/gallery/photo3.jpg',
    'assets/gallery/photo4.jpg',
    'assets/gallery/photo5.jpg',
    'assets/gallery/photo6.jpg',
    'assets/gallery/photo7.jpg',
    'assets/gallery/photo8.jpg',
    'assets/gallery/photo9.jpg',
    'assets/gallery/photo10.jpg',
    'assets/gallery/photo11.jpg',
    'assets/gallery/photo12.jpg',
    'assets/gallery/photo13.jpg',
    'assets/gallery/photo14.jpg',
    'assets/gallery/photo15.jpg',
    'assets/gallery/photo16.jpg',
    'assets/gallery/photo17.jpg',
    'assets/gallery/photo18.jpg',
    'assets/gallery/photo19.jpg',
    'assets/gallery/photo20.jpg',
    'assets/gallery/photo21.jpeg',
    'assets/gallery/photo23.jpeg',
    'assets/gallery/photo25.jpeg',
  ];

  /* Size classes to create subtle variety while keeping 1:1 ratio */
  const SIZE_CLASSES = ['size-sm', 'size-md', 'size-lg'];

  /* ---------------------------------------------------------
     STATE / DOM
  --------------------------------------------------------- */
  const galleryStage = document.getElementById('galleryStage');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadLabel = document.getElementById('downloadLabel');
  const exportCanvas = document.getElementById('exportCanvas');
  const toastEl = document.getElementById('galleryToast');

  let toastTimeout = null;

  function showToast(message, duration) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, duration || 3200);
  }

  /* ---------------------------------------------------------
     BUILD THE SCROLLING COLLAGE
  --------------------------------------------------------- */
  function getColumnCount() {
    const w = window.innerWidth;
    if (w < 480) return 2;
    if (w < 860) return 3;
    return 4;
  }

  function getSizeClass(index) {
    const pattern = [1, 0, 2, 1, 2, 0, 1, 2, 0, 1];
    return SIZE_CLASSES[pattern[index % pattern.length]];
  }

  function buildPhotoFrame(src, index) {
    const frame = document.createElement('div');
    frame.className = 'photo-frame ' + getSizeClass(index);

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Momen kenangan';
    img.loading = 'lazy';
    img.draggable = false;

    img.addEventListener('error', () => {
      img.remove();
      const fallback = document.createElement('div');
      fallback.className = 'photo-fallback';
      fallback.textContent = '🤍';
      frame.appendChild(fallback);
    });

    frame.appendChild(img);
    return frame;
  }

  function buildColumns() {
    galleryStage.innerHTML = '';

    const columnCount = getColumnCount();
    const columns = Array.from({ length: columnCount }, () => []);

    PHOTOS.forEach((src, index) => {
      columns[index % columnCount].push({ src, index });
    });

    columns.forEach((photoList, columnIndex) => {
      if (photoList.length === 0) return;

      const column = document.createElement('div');
      column.className = 'photo-column';

      // Slightly varied speed per column for visual richness
      const baseDuration = 24;
      const variance = (columnIndex % 3) * 4;
      column.style.animationDuration = `${baseDuration + variance}s`;

      // Render the list TWICE back-to-back for seamless infinite loop
      for (let repeat = 0; repeat < 2; repeat++) {
        photoList.forEach(({ src, index }) => {
          column.appendChild(buildPhotoFrame(src, index + repeat * PHOTOS.length));
        });
      }

      galleryStage.appendChild(column);
    });

    // Pause animation on hover so user can look at photos
    galleryStage.addEventListener('mouseenter', () => {
      galleryStage.querySelectorAll('.photo-column').forEach(col => {
        col.style.animationPlayState = 'paused';
      });
    });
    galleryStage.addEventListener('mouseleave', () => {
      galleryStage.querySelectorAll('.photo-column').forEach(col => {
        col.style.animationPlayState = 'running';
      });
    });
  }

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newCount = getColumnCount();
      if (newCount !== galleryStage.children.length) {
        buildColumns();
      }
    }, 250);
  });

  /* ---------------------------------------------------------
     IMAGE LOADING FOR CANVAS EXPORT
     
     Uses pre-generated base64 data URLs from photo-data.js
     (generated by generate-photo-data.ps1). Data URLs are
     always same-origin, so they never taint the canvas —
     even on file:// protocol.
  --------------------------------------------------------- */

  /**
   * Load an image element from a src (URL or data URL).
   */
  function loadImgElement(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /**
   * Get the best available source for canvas drawing.
   * Prefers base64 data URLs (from photo-data.js) because
   * they are always same-origin and never taint the canvas.
   * Falls back to the original file path if data URL not available.
   */
  function getCanvasSrc(index) {
    // PHOTO_DATA_URLS is defined in photo-data.js (loaded before this script)
    if (typeof PHOTO_DATA_URLS !== 'undefined' &&
        PHOTO_DATA_URLS[index] &&
        PHOTO_DATA_URLS[index] !== null) {
      return PHOTO_DATA_URLS[index];
    }
    // Fallback to original path (will work on HTTP servers)
    return PHOTOS[index];
  }

  /* ---------------------------------------------------------
     DOWNLOAD — compose an aesthetic keepsake card on canvas
  --------------------------------------------------------- */

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCoverImage(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sx, sy, sw, sh;

    if (imgRatio > boxRatio) {
      sh = img.height;
      sw = sh * boxRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  /**
   * Draw the decorative card frame, title, and footer.
   */
  function drawCardFrame(ctx, W, H) {
    const tokens = {
      softPink: '#f7c9d6',
      dustyRose: '#d98ea3',
      cream: '#fbf3ec',
      burgundy: '#6e1f34',
      burgundyDeep: '#3a0f1c',
      gold: '#d8ad5f',
      white: '#ffffff',
    };

    /* Background */
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, tokens.softPink);
    bgGradient.addColorStop(0.55, tokens.cream);
    bgGradient.addColorStop(1, tokens.white);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    /* Outer + inner decorative frame */
    const outerInset = 34;
    drawRoundedRect(ctx, outerInset, outerInset, W - outerInset * 2, H - outerInset * 2, 28);
    ctx.strokeStyle = tokens.burgundy;
    ctx.lineWidth = 3;
    ctx.stroke();

    const innerInset = 50;
    drawRoundedRect(ctx, innerInset, innerInset, W - innerInset * 2, H - innerInset * 2, 22);
    ctx.strokeStyle = tokens.gold;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* Corner heart flourishes */
    ctx.font = '28px "Playfair Display"';
    ctx.fillStyle = 'rgba(216,173,95,0.85)';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const corners = [
      [outerInset + 26, outerInset + 26],
      [W - outerInset - 26, outerInset + 26],
      [outerInset + 26, H - outerInset - 26],
      [W - outerInset - 26, H - outerInset - 26],
    ];
    corners.forEach(([cx, cy]) => ctx.fillText('❤', cx, cy));

    /* Title */
    ctx.textAlign = 'center';
    ctx.fillStyle = tokens.burgundy;
    ctx.font = '700 68px "Dancing Script"';
    ctx.shadowColor = 'rgba(217,142,163,0.55)';
    ctx.shadowBlur = 18;
    ctx.fillText('Our Little Story', W / 2, 148);
    ctx.shadowBlur = 0;

    ctx.font = 'italic 26px "Playfair Display"';
    ctx.fillStyle = tokens.dustyRose;
    ctx.fillText('Kumpulan momen kita berdua ❤️', W / 2, 196);

    /* Footer signature */
    ctx.textAlign = 'center';
    ctx.font = '600 32px "Dancing Script"';
    ctx.fillStyle = tokens.burgundy;
    ctx.fillText('dari aa, untuk kamu ❤️', W / 2, H - 150);

    const today = new Date();
    const dateLabel = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.font = '400 20px "Poppins"';
    ctx.fillStyle = tokens.dustyRose;
    ctx.fillText(dateLabel, W / 2, H - 112);

    return { tokens, innerInset };
  }

  /**
   * Draw photos onto the card grid.
   */
  function drawPhotoGrid(ctx, images, tokens, innerInset, W, H) {
    const gridTop = 240;
    const gridBottom = H - 210;
    const gridLeft = innerInset + 30;
    const gridRight = W - innerInset - 30;
    const cols = 4;
    const rows = 5;
    const gap = 14;
    const cellW = (gridRight - gridLeft - gap * (cols - 1)) / cols;
    const cellH = (gridBottom - gridTop - gap * (rows - 1)) / rows;

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (index >= images.length) break;
        const cellX = gridLeft + c * (cellW + gap);
        const cellY = gridTop + r * (cellH + gap);
        const rotation = (index % 2 === 0 ? -1 : 1) * (1.4 + (index % 3));
        const img = images[index];
        index++;

        ctx.save();
        ctx.translate(cellX + cellW / 2, cellY + cellH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-cellW / 2, -cellH / 2);

        // soft polaroid-style backing
        ctx.fillStyle = tokens.white;
        ctx.shadowColor = 'rgba(110,31,52,0.28)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        drawRoundedRect(ctx, 0, 0, cellW, cellH, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        const pad = 5;
        drawRoundedRect(ctx, pad, pad, cellW - pad * 2, cellH - pad * 2, 5);
        ctx.save();
        ctx.clip();

        if (img) {
          drawCoverImage(ctx, img, pad, pad, cellW - pad * 2, cellH - pad * 2);
        } else {
          const fallbackGradient = ctx.createLinearGradient(0, 0, cellW, cellH);
          fallbackGradient.addColorStop(0, tokens.softPink);
          fallbackGradient.addColorStop(1, tokens.cream);
          ctx.fillStyle = fallbackGradient;
          ctx.fillRect(pad, pad, cellW - pad * 2, cellH - pad * 2);
          ctx.fillStyle = tokens.dustyRose;
          ctx.font = '20px "Playfair Display"';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🤍', cellW / 2, cellH / 2);
        }
        ctx.restore();
        ctx.restore();
      }
    }
  }

  /**
   * Wraps canvas.toBlob in a Promise.
   */
  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('toBlob returned null'));
          },
          'image/png'
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  function triggerDownload(blobUrl) {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'our-memory-moments.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleDownloadClick() {
    downloadBtn.disabled = true;
    downloadLabel.textContent = 'Menyiapkan...';

    try {
      // Make sure the webfonts are ready
      await Promise.all([
        document.fonts.load('700 64px "Dancing Script"'),
        document.fonts.load('italic 600 30px "Playfair Display"'),
        document.fonts.load('400 26px "Poppins"'),
      ]);

      const ctx = exportCanvas.getContext('2d');
      const W = exportCanvas.width;
      const H = exportCanvas.height;

      // Load images using base64 data URLs (from photo-data.js).
      // These are same-origin so the canvas will NOT be tainted.
      downloadLabel.textContent = 'Memuat foto...';
      const imageSources = PHOTOS.map((_, i) => getCanvasSrc(i));
      const images = await Promise.all(imageSources.map(loadImgElement));

      // Draw the complete card
      downloadLabel.textContent = 'Membuat kartu...';
      const { tokens, innerInset } = drawCardFrame(ctx, W, H);
      drawPhotoGrid(ctx, images, tokens, innerInset, W, H);

      // Export as PNG
      const blob = await canvasToBlob(exportCanvas);
      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
      showToast('Kartu kenangan berhasil diunduh ❤️');

    } catch (err) {
      console.error('[Gallery] Download error:', err);
      showToast('Unduhan gagal. Coba refresh halaman lalu coba lagi ya.', 4600);
    } finally {
      downloadBtn.disabled = false;
      downloadLabel.textContent = 'Unduh';
    }
  }

  downloadBtn.addEventListener('click', handleDownloadClick);

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  buildColumns();
})();
