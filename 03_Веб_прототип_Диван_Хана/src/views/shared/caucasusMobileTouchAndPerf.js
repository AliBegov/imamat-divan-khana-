// ============================================================================
// МОБИЛЬНОЕ 3D-УПРАВЛЕНИЕ (iOS / Android / iPadOS) И АВТО-ГУБЕРНАТОР 60 FPS
// Единый модуль мультитач-жестов (1 палец — орбита/тап/долгое нажатие,
// 2 пальца — одновременный pinch-to-zoom и панорама) + адаптивный профиль GPU.
// ============================================================================

export function detectMobileDeviceProfile() {
  if (typeof window === 'undefined') {
    return {
      isTouch: false,
      isPhone: false,
      isMobileGPU: false,
      maxDpr: 2.0,
      enableGtaoByDefault: true,
      shadowMapSize: 2048,
      precipScale: 1.0
    };
  }

  const coarsePointer = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const hasTouch =
    coarsePointer ||
    'ontouchstart' in window ||
    (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints) > 0);
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const shortSide = Math.min(window.innerWidth || 1280, window.innerHeight || 800);
  const isPhone = (hasTouch || mobileUA) && shortSide <= 540;
  const isMobileGPU = Boolean(mobileUA || coarsePointer || isPhone);

  return {
    isTouch: Boolean(hasTouch || mobileUA),
    isPhone,
    isMobileGPU,
    maxDpr: isPhone ? 1.35 : isMobileGPU ? 1.5 : 2.0,
    enableGtaoByDefault: !isMobileGPU,
    shadowMapSize: isMobileGPU ? 1024 : 2048,
    precipScale: isMobileGPU ? 0.62 : 1.0
  };
}

export function createFpsGovernor({
  renderer,
  composer = null,
  gtaoPass = null,
  postFx = null,
  profile = null
}) {
  const dev = profile || detectMobileDeviceProfile();
  let mode = 'auto'; // 'auto' | 'perf60' | 'ultra'
  let curMaxDpr = dev.maxDpr;
  let warmupFrames = 48;
  let sampleCount = 0;
  let sampleTimeSum = 0;
  let currentFps = 60;

  if (gtaoPass) {
    gtaoPass.enabled = Boolean(dev.enableGtaoByDefault);
  }

  const applyDpr = (targetMaxDpr) => {
    if (!renderer || typeof window === 'undefined') return;
    curMaxDpr = targetMaxDpr;
    const dpr = Math.min(window.devicePixelRatio || 1, curMaxDpr);
    if (Math.abs(renderer.getPixelRatio() - dpr) < 0.04) return;
    const dom = renderer.domElement;
    const w = Math.max(300, dom?.clientWidth || window.innerWidth || 800);
    const h = Math.max(220, dom?.clientHeight || window.innerHeight || 480);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    if (postFx) postFx.setSize(w, h);
  };

  const setQualityMode = (nextMode) => {
    mode = nextMode;
    sampleCount = 0;
    sampleTimeSum = 0;
    if (mode === 'ultra') {
      if (gtaoPass) gtaoPass.enabled = true;
      applyDpr(2.0);
    } else if (mode === 'perf60') {
      if (gtaoPass) gtaoPass.enabled = false;
      applyDpr(1.25);
    } else {
      if (gtaoPass) gtaoPass.enabled = Boolean(dev.enableGtaoByDefault);
      applyDpr(dev.maxDpr);
    }
    return mode;
  };

  const tick = (dt) => {
    if (dt <= 0 || dt > 0.25) return currentFps;
    if (warmupFrames > 0) {
      warmupFrames--;
      return currentFps;
    }
    sampleCount++;
    sampleTimeSum += dt;
    if (sampleCount >= 90) {
      currentFps = Math.round(sampleCount / Math.max(0.001, sampleTimeSum));
      sampleCount = 0;
      sampleTimeSum = 0;

      if (mode === 'auto' && currentFps < 38) {
        if (gtaoPass && gtaoPass.enabled) {
          gtaoPass.enabled = false;
        } else if (curMaxDpr > 1.05) {
          applyDpr(Math.max(1.0, curMaxDpr - 0.25));
        }
      }
    }
    return currentFps;
  };

  return {
    tick,
    setQualityMode,
    getQualityMode: () => mode,
    getFps: () => currentFps
  };
}

export function attachUnified3DTouchControls(
  domElement,
  {
    onInteractionStart = null,
    onOrbit = null,
    onPan = null,
    onPinchZoom = null,
    onTap = null,
    onLongPress = null
  } = {}
) {
  if (!domElement) {
    return { dispose: () => {} };
  }

  domElement.style.touchAction = 'none';
  domElement.style.webkitUserSelect = 'none';
  domElement.style.userSelect = 'none';

  let active = false;
  let hadMultiTouch = false;
  let longPressFired = false;
  let longPressTimer = null;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let startTime = 0;
  let totalMove = 0;
  let lastPinchDist = 0;
  let lastMidX = 0;
  let lastMidY = 0;

  const clearLongPress = () => {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const measurePair = (t0, t1) => {
    const dx = t1.clientX - t0.clientX;
    const dy = t1.clientY - t0.clientY;
    return {
      dist: Math.hypot(dx, dy),
      midX: (t0.clientX + t1.clientX) * 0.5,
      midY: (t0.clientY + t1.clientY) * 0.5
    };
  };

  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    if (e.cancelable) e.preventDefault();
    if (onInteractionStart) onInteractionStart(e);

    if (e.touches.length === 1 && !active) {
      const t0 = e.touches[0];
      active = true;
      hadMultiTouch = false;
      longPressFired = false;
      startX = t0.clientX;
      startY = t0.clientY;
      lastX = t0.clientX;
      lastY = t0.clientY;
      startTime = performance.now();
      totalMove = 0;
      clearLongPress();
      if (onLongPress) {
        longPressTimer = setTimeout(() => {
          if (active && !hadMultiTouch && totalMove < 9) {
            longPressFired = true;
            onLongPress(startX, startY);
          }
        }, 460);
      }
    } else if (e.touches.length >= 2) {
      active = true;
      hadMultiTouch = true;
      clearLongPress();
      const pair = measurePair(e.touches[0], e.touches[1]);
      lastPinchDist = pair.dist;
      lastMidX = pair.midX;
      lastMidY = pair.midY;
    }
  };

  const onTouchMove = (e) => {
    if (!active || !e.touches || e.touches.length === 0) return;
    if (e.cancelable) e.preventDefault();

    if (e.touches.length === 1 && !hadMultiTouch) {
      const t0 = e.touches[0];
      const dx = t0.clientX - lastX;
      const dy = t0.clientY - lastY;
      lastX = t0.clientX;
      lastY = t0.clientY;
      totalMove += Math.hypot(dx, dy);
      if (totalMove >= 9) {
        clearLongPress();
      }
      if (onOrbit && (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01)) {
        onOrbit(dx, dy);
      }
    } else if (e.touches.length === 1 && hadMultiTouch) {
      // Плавное продолжение вращения после отпускания второго пальца без скачка камеры
      const t0 = e.touches[0];
      const dx = t0.clientX - lastX;
      const dy = t0.clientY - lastY;
      lastX = t0.clientX;
      lastY = t0.clientY;
      if (onOrbit && Math.hypot(dx, dy) < 64) {
        onOrbit(dx, dy);
      }
    } else if (e.touches.length >= 2) {
      hadMultiTouch = true;
      clearLongPress();
      const pair = measurePair(e.touches[0], e.touches[1]);
      const midDx = pair.midX - lastMidX;
      const midDy = pair.midY - lastMidY;
      const pinchDelta = pair.dist - lastPinchDist;
      const scaleRatio = lastPinchDist > 8 ? pair.dist / lastPinchDist : 1.0;

      lastMidX = pair.midX;
      lastMidY = pair.midY;
      lastPinchDist = pair.dist;

      if (onPan && (Math.abs(midDx) > 0.1 || Math.abs(midDy) > 0.1)) {
        onPan(midDx, midDy);
      }
      if (onPinchZoom && Math.abs(pinchDelta) > 0.15) {
        onPinchZoom(pinchDelta, scaleRatio);
      }
    }
  };

  const onTouchEnd = (e) => {
    clearLongPress();
    if (e.touches && e.touches.length === 1) {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      return;
    }
    if (!e.touches || e.touches.length === 0) {
      const elapsed = performance.now() - startTime;
      const changed = e.changedTouches && e.changedTouches[0];
      const tapX = changed ? changed.clientX : lastX;
      const tapY = changed ? changed.clientY : lastY;
      if (active && !hadMultiTouch && !longPressFired && totalMove < 9 && elapsed < 390) {
        if (onTap) onTap(tapX, tapY);
      }
      active = false;
      hadMultiTouch = false;
      longPressFired = false;
    }
  };

  const onTouchCancel = () => {
    clearLongPress();
    active = false;
    hadMultiTouch = false;
    longPressFired = false;
  };

  domElement.addEventListener('touchstart', onTouchStart, { passive: false });
  domElement.addEventListener('touchmove', onTouchMove, { passive: false });
  domElement.addEventListener('touchend', onTouchEnd);
  domElement.addEventListener('touchcancel', onTouchCancel);

  return {
    dispose: () => {
      clearLongPress();
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      domElement.removeEventListener('touchend', onTouchEnd);
      domElement.removeEventListener('touchcancel', onTouchCancel);
    }
  };
}
