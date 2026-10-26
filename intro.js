/* WishTale logo intro – walking-legs version. Vanilla JS, no dependencies. */
(() => {
  "use strict";
  if (window.__wtIntro) return;
  window.__wtIntro = true;

  const CFG = {
    headerLogoSelector: "[data-wt-logo]",
    startWidthMax: 560,
    startWidthVw: 0.8,
    fontWaitMs: 1500,
    safetyMs: 11000,
    lift: 0.34,
    heart: "M12 20.2C5.2 15 2 11.6 2 7.9 2 4.9 4.3 2.7 7.1 2.7c1.9 0 3.7 1 4.9 2.9 1.2-1.9 3-2.9 4.9-2.9C19.7 2.7 22 4.9 22 7.9c0 3.7-3.2 7.1-10 12.3z"
  };

  const T_BAR0 = 0.30, T_BAR1 = 1.00;
  const S0 = 1.15;
  const D = [0.55, 0.65, 0.55, 0.48, 0.50, 0.55, 0.50, 0.50, 0.60];
  const TS = [];
  { let a = S0; for (let i = 0; i < D.length; i++) { TS.push(a); a += D[i]; } }
  const T_END = TS[8] + D[8];
  const T_H0 = 6.05, T_H1 = 6.85;
  const T_TR0 = 7.10, T_TR1 = 8.20;
  const T_BG0 = 7.20, T_BG1 = 7.95;
  const T_DONE = T_TR1;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const outC = x => 1 - Math.pow(1 - clamp(x), 3);
  const back = x => { x = clamp(x); const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const inOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

  const root = document.documentElement;
  const PEND = "wt-intro-pending", MOUNT = "wt-intro-mounted";
  const SEEN = "wt-intro-seen";
  let host = null, raf = 0, safety = 0, finished = false;
  const undo = [];
  const inertSiblings = [];
  let skipButton = null;
  const on = (target, event, fn, options) => {
    target.addEventListener(event, fn, options);
    undo.push(() => target.removeEventListener(event, fn, options));
  };

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(safety);
    undo.forEach(removeListener => removeListener());
    inertSiblings.forEach(([element, wasInert]) => { element.inert = wasInert; });
    if (skipButton && document.activeElement === skipButton) {
      document.querySelector(CFG.headerLogoSelector)?.focus({ preventScroll: true });
    }
    try { sessionStorage.setItem(SEEN, "1"); } catch (err) {
      console.warn("[WishTale intro] Could not save intro preference:", err);
    }
    root.classList.remove(PEND, MOUNT);
    if (host) host.remove();
    window.dispatchEvent(new CustomEvent("wishtale:intro-complete"));
  }

  function boot() {
    const header = document.querySelector(CFG.headerLogoSelector);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === "1"; } catch (err) {
      console.warn("[WishTale intro] Could not read intro preference:", err);
    }
    if (!header || reduce || seen || !document.body) {
      root.classList.remove(PEND, MOUNT);
      return;
    }
    run(header).catch(err => {
      console.warn("[WishTale intro] skipped:", err);
      finish();
    });
  }

  async function run(header) {
    window.scrollTo(0, 0);

    const makeLetters = (text, cls) => [...text].map(char => `<span class="wt-l ${cls}">${char}</span>`).join("");
    host = document.createElement("div");
    host.id = "wt-intro";
    host.setAttribute("role", "dialog");
    host.setAttribute("aria-label", "WishTale introduction");
    host.setAttribute("aria-modal", "true");
    host.innerHTML =
      '<div class="wt-bg"></div>' +
      '<div class="wt-logo">' +
        '<span class="wt-word">' + makeLetters("Wish", "wt-wi") + makeLetters("Tale", "wt-ta") + '<i class="wt-base"></i></span>' +
        '<svg class="wt-heart" viewBox="0 0 24 22" focusable="false"><path d="' + CFG.heart + '"/></svg>' +
        '<svg class="wt-cursor" focusable="false"><defs><clipPath id="wt-band"><rect x="-2000" y="0" width="5000" height="10"/></clipPath></defs>' +
        '<g clip-path="url(#wt-band)"><path d=""/></g></svg>' +
      '</div>';
    skipButton = document.createElement("button");
    skipButton.className = "wt-skip";
    skipButton.type = "button";
    skipButton.textContent = "Skip intro";
    host.appendChild(skipButton);
    on(skipButton, "click", finish);
    [...document.body.children].forEach(element => {
      inertSiblings.push([element, element.inert]);
      element.inert = true;
    });
    document.body.appendChild(host);
    root.classList.add(MOUNT);
    skipButton.focus({ preventScroll: true });
    safety = setTimeout(finish, CFG.safetyMs);

    const bg = host.querySelector(".wt-bg"), logo = host.querySelector(".wt-logo");
    const word = host.querySelector(".wt-word"), base = host.querySelector(".wt-base");
    const heart = host.querySelector(".wt-heart"), heartPath = heart.querySelector("path");
    const cursor = host.querySelector(".wt-cursor"), cursorPath = cursor.querySelector("g path");
    const bandRect = cursor.querySelector("rect");
    const letters = [...host.querySelectorAll(".wt-l")];

    const SPARK_DEF = [[-.05,.14,.34,"#ec8b78",6.45],[.27,-.12,.22,"#f6a7b6",6.60],[.72,-.16,.30,"#ec8b78",6.70],
                       [1.02,.10,.20,"#ffffff",6.80],[1.07,.62,.30,"#f6a7b6",6.55],[.52,1.12,.20,"#ec8b78",6.90]];
    const sparks = SPARK_DEF.map(definition => {
      const el = document.createElement("div");
      el.innerHTML = '<svg class="wt-spark" viewBox="-1 -1 2 2" style="--s:' + definition[2] + 'em"><path fill="' + definition[3] +
        '" d="M0-1C.08-.25.25-.08 1 0 .25.08.08.25 0 1-.08.25-.25.08-1 0-.25-.08-.08-.25 0-1z"/></svg>';
      const spark = el.firstChild;
      logo.appendChild(spark);
      return { s: spark, fx: definition[0], fy: definition[1], t0: definition[4] };
    });

    const fontSpec = () => {
      const style = getComputedStyle(header);
      return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    };
    if (document.fonts && document.fonts.load) {
      await Promise.race([
        document.fonts.load(fontSpec(), "WishTale").catch(() => {}),
        new Promise(resolve => setTimeout(resolve, CFG.fontWaitMs))
      ]);
    }
    if (finished) return;

    const M = {};
    let F = [], COMMIT = null, X0 = 0;
    const STEP = 1 / 120, N = Math.ceil(T_DONE / STEP) + 3;
    const ctx = document.createElement("canvas").getContext("2d");
    M.hl = heartPath.getTotalLength ? heartPath.getTotalLength() : 60;
    heartPath.style.strokeDasharray = M.hl;

    function measure() {
      const style = getComputedStyle(header);
      logo.style.fontFamily = style.fontFamily;
      logo.style.fontSize = style.fontSize;
      logo.style.fontWeight = style.fontWeight;
      logo.style.letterSpacing = style.letterSpacing;
      const wish = header.querySelector(".wt-wish"), tale = header.querySelector(".wt-tale");
      if (wish) logo.style.setProperty("--wt-ink", getComputedStyle(wish).color);
      if (tale) logo.style.setProperty("--wt-tale", getComputedStyle(tale).color);

      M.w = logo.offsetWidth;
      M.h = logo.offsetHeight;
      M.B = letters.map(letter => letter.offsetLeft);
      const last = letters[letters.length - 1];
      M.B.push(last.offsetLeft + last.offsetWidth);
      M.base = base.offsetTop;
      M.wx = word.offsetLeft;
      M.wy = word.offsetTop;

      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const asc = ctx.measureText("l").actualBoundingBoxAscent;
      M.H = asc > 2 ? asc : parseFloat(style.fontSize) * 0.74;
      M.YB = M.base;
      M.YT = M.base - M.H;
      M.SW = 0.16 * M.H;

      const vw = root.clientWidth || innerWidth, vh = innerHeight;
      M.s0 = Math.min(Math.min(vw * CFG.startWidthVw, CFG.startWidthMax) / M.w, (vh * 0.42) / M.h);

      cursor.setAttribute("width", M.w);
      cursor.setAttribute("height", M.h);
      bandRect.setAttribute("y", M.YT);
      bandRect.setAttribute("height", M.H);
      cursorPath.setAttribute("stroke-width", M.SW.toFixed(2));
      sparks.forEach(spark => {
        spark.s.style.left = spark.fx * M.w + "px";
        spark.s.style.top = spark.fy * M.h + "px";
      });
      buildGait();
    }

    function buildGait() {
      const { H, B } = M;
      X0 = B[0] - 0.16 * H;
      F = [X0];
      for (let k = 0; k < 8; k++) F.push((B[k] + B[k + 1]) / 2);
      F.push(B[8] + 0.35 * H);

      COMMIT = new Float32Array(N);
      const offset = 0.39 * M.SW;
      let committed = -1e9;
      for (let i = 0; i < N; i++) {
        const points = walkPts(i * STEP);
        committed = Math.max(committed, Math.min(points[2][0], points[3][0], points[4][0]) + offset);
        COMMIT[i] = committed;
      }
    }

    function walkPts(t) {
      const { H, YT, YB } = M;
      let hx, hy, fa, fb;
      if (t < S0) {
        const growth = outC((t - T_BAR0) / (T_BAR1 - T_BAR0));
        hx = X0;
        hy = YB - growth * H;
        fa = [X0, YB];
        fb = [X0, YB];
      } else {
        let j = 0;
        while (j < 8 && t >= TS[j + 1]) j++;
        const u = clamp((t - TS[j]) / D[j]);
        const planted = F[j], start = F[Math.max(j - 1, 0)], end = F[j + 1];
        const swing = sm(clamp((u - 0.10) / 0.80));
        const mx = lerp(start, end, swing);
        const my = YB - CFG.lift * H * Math.pow(Math.sin(Math.PI * u), 0.85);
        hx = (planted + mx) / 2;
        hy = YT;
        fa = [planted, YB];
        fb = [mx, my];
      }
      const rear = fa[0] <= fb[0] ? fa : fb, front = rear === fa ? fb : fa;
      const mid = foot => [(foot[0] + hx) / 2, (foot[1] + hy) / 2];
      return [rear, mid(rear), [hx, hy], mid(front), front];
    }
    const commitAt = t => COMMIT[Math.min(N - 1, Math.max(0, Math.round(t / STEP)))];

    function render(t) {
      const { H, YT, YB, SW } = M;
      const vw = root.clientWidth || innerWidth, vh = innerHeight;

      const points = walkPts(t);
      const extendFoot = (a, b) => {
        const dy = a[1] - b[1];
        if (Math.abs(dy) < 1e-3) return a;
        const scale = 0.12 * H / Math.abs(dy);
        if (a[1] >= YB - 1 && a[1] > b[1]) return [a[0] + (a[0] - b[0]) * scale, a[1] + 0.12 * H];
        if (a[1] <= YT + 1 && a[1] < b[1]) return [a[0] + (a[0] - b[0]) * scale, a[1] - 0.12 * H];
        return a;
      };
      const q = points.slice();
      q[0] = extendFoot(points[0], points[1]);
      q[4] = extendFoot(points[4], points[3]);
      cursorPath.setAttribute("d", "M" + q.map(point => point[0].toFixed(1) + " " + point[1].toFixed(1)).join(" L"));
      cursor.style.opacity = sm((t - T_BAR0) / 0.5) * (1 - sm((t - T_END) / 0.35));

      if (t < T_BAR1 - 0.05) word.style.visibility = "hidden";
      else {
        word.style.visibility = "visible";
        if (t >= T_END + 0.30) word.style.clipPath = "none";
        else {
          const offset = 0.39 * SW;
          let cx = commitAt(t);
          if (t > T_END) cx = lerp(cx, M.B[8] + H, sm((t - T_END) / 0.25));
          const bound = value => Math.max(value, cx);
          const top = YT - H, bottom = YB + H, left = M.B[0] - 60;
          const polygon = [[left, top], [bound(points[2][0] + offset), top], [bound(points[2][0] + offset), YT],
                           [bound(points[3][0] + offset), YT + 0.5 * H], [bound(points[4][0] + offset), YB],
                           [bound(points[4][0] + offset), bottom], [left, bottom]]
            .map(point => (point[0] - M.wx).toFixed(1) + "px " + (point[1] - M.wy).toFixed(1) + "px");
          word.style.clipPath = "polygon(" + polygon.join(",") + ")";
        }
      }

      const heartProgress = clamp((t - T_H0) / (T_H1 - T_H0));
      heart.style.opacity = heartProgress > 0 ? 1 : 0;
      heartPath.style.strokeDashoffset = (M.hl * (1 - outC(heartProgress))).toFixed(2);
      heart.style.transform = `scale(${(0.75 + 0.25 * back(heartProgress)).toFixed(3)})`;

      sparks.forEach(spark => {
        const progress = (t - spark.t0) / 0.8;
        if (progress <= 0 || progress >= 1) {
          spark.s.style.opacity = 0;
          return;
        }
        const amount = Math.sin(Math.PI * progress);
        spark.s.style.opacity = amount.toFixed(3);
        spark.s.style.transform = `scale(${(0.3 + 0.9 * amount).toFixed(3)}) rotate(${(progress * 90).toFixed(1)}deg)`;
      });

      const startScale = M.s0 * (1 + 0.12 * (1 - outC(t / 6)));
      const startX = (vw - M.w * startScale) / 2, startY = (vh - M.h * startScale) / 2;
      const travel = inOut((t - T_TR0) / (T_TR1 - T_TR0));
      const headerRect = header.getBoundingClientRect();
      let endScale, endX, endY;
      if (headerRect.width > 1 && headerRect.height > 1) {
        endScale = headerRect.width / M.w;
        endX = headerRect.left;
        endY = headerRect.top + (headerRect.height - M.h * endScale) / 2;
      } else {
        endScale = M.s0 * 0.4;
        endX = 16;
        endY = 16;
      }
      const scale = lerp(startScale, endScale, travel);
      const x = lerp(startX, endX, travel), y = lerp(startY, endY, travel);
      logo.style.opacity = 1;
      logo.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${scale.toFixed(5)})`;

      bg.style.opacity = (1 - sm((t - T_BG0) / (T_BG1 - T_BG0))).toFixed(3);
    }

    const stop = event => event.preventDefault();
    on(window, "wheel", stop, { passive: false });
    on(window, "touchmove", stop, { passive: false });
    on(window, "keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
        return;
      }
      if (event.key === " " && event.target === skipButton) return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) event.preventDefault();
    });
    on(window, "resize", measure);
    on(window, "orientationchange", measure);

    measure();
    const startTime = performance.now();
    const tick = now => {
      if (finished) return;
      const t = Math.max(0, (now - startTime) / 1000);
      if (t >= T_DONE) {
        render(T_DONE);
        finish();
        return;
      }
      render(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
