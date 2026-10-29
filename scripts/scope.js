// Live plot next to the "about" heading. One formula drives both states:
//   y(t) = 1 - e^(-k·α·t) · sin(ω_d·t + acos ζ + (1-k)·phase) / √(1-ζ²)
// k = 0: no damping and a drifting phase, so the wave scrolls forever.
// k = 1 (hover): damping on, phase frozen, so it settles into the second-order step response y_γ(t).
//
// y = 1 always sits on the canvas centre, which is lined up with the centre of the heading's glyphs.
// The sine stays inside the heading's height. The canvas reaches --over × that height above and
// below it, and as k grows the vertical scale grows too, so the step response's start (y = 0)
// dips into the paragraph's margin while its trailing line stays level with the word.
//
// Per plot: data-tmax on the .scope figure sets the time window, --over (CSS) the overflow.
(() => {
    const ZETA = 0.176;
    const W0 = 3.413;
    const ALPHA = ZETA * W0; // 0.600
    const WD = W0 * Math.sqrt(1 - ZETA * ZETA); // 3.360
    const PHI = Math.acos(ZETA);
    const AMP = 1 / Math.sqrt(1 - ZETA * ZETA);

    const PAD = 2; // keeps the 2px line from clipping at the extremes

    const lineColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-container")
        .trim();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scopes = [...document.querySelectorAll(".scope")].map(setup);
    let phase = 0;
    let last = performance.now();

    // flex centring uses the heading's line box; the glyphs of "about" (ascenders, no descenders)
    // sit higher than that, so nudge the plot onto the glyphs' own centre
    function alignToHeading(figure) {
        const heading = figure.previousElementSibling;
        if (!heading) return;
        const style = getComputedStyle(heading);
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const m = ctx.measureText(heading.textContent.trim());
        const box = heading.getBoundingClientRect().height;
        const baseline = (box - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
        const glyphCentre = baseline - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
        figure.style.setProperty("--nudge", `${glyphCentre - box / 2}px`);
    }

    function setup(figure) {
        const canvas = figure.querySelector("canvas");
        const align = () => alignToHeading(figure);
        document.fonts.ready.then(align);
        addEventListener("resize", align);

        const s = {
            canvas,
            ctx: canvas.getContext("2d"),
            tMax: Number(figure.dataset.tmax) || 30,
            over: parseFloat(getComputedStyle(figure).getPropertyValue("--over")) || 0,
            k: 0,
            target: 0,
        };

        new ResizeObserver(() => {
            const dpr = devicePixelRatio || 1;
            canvas.width = Math.round(canvas.clientWidth * dpr);
            canvas.height = Math.round(canvas.clientHeight * dpr);
            s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }).observe(canvas);

        canvas.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "mouse") s.target = 1;
        });
        canvas.addEventListener("pointerleave", (e) => {
            if (e.pointerType === "mouse") s.target = 0;
        });
        // no hover on touch screens: a tap toggles instead
        canvas.addEventListener("pointerdown", (e) => {
            if (e.pointerType !== "mouse") s.target = s.target ? 0 : 1;
        });
        return s;
    }

    function frame(now) {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (!still) phase -= dt * 2.4;
        for (const s of scopes) {
            s.k += (s.target - s.k) * (1 - Math.exp(-dt * 3));
            // page-flip hides the about page with display:none while the cover is showing
            if (s.canvas.clientWidth) draw(s);
        }
        requestAnimationFrame(frame);
    }

    function draw({ canvas, ctx, tMax, over, k }) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const band = h / (1 + 2 * over); // the heading's height, where the plain sine lives
        const mid = h / 2;

        // vertical scale morphs from "sine fills the band" to "step response's start reaches the canvas
        // edge"; the largest swing from y = 1 is the start itself (y = 0), so that sets the scale
        const scale = ((1 - k) * (band / 2 - PAD)) / AMP + k * (h / 2 - PAD);
        const sx = (t) => PAD + (t / tMax) * (w - 2 * PAD);
        const sy = (v) => mid - (v - 1) * scale;
        const y = (t) => 1 - AMP * Math.exp(-k * ALPHA * t) * Math.sin(WD * t + PHI + (1 - k) * phase);

        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        const steps = Math.ceil(tMax * 60);
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * tMax;
            i ? ctx.lineTo(sx(t), sy(y(t))) : ctx.moveTo(sx(t), sy(y(t)));
        }
        ctx.stroke();
    }

    requestAnimationFrame(frame);
})();
