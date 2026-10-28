const pages = document.querySelectorAll("#book .page");

// page numbers, added before page-flip takes over the DOM
pages.forEach((el, i) =>
    el.insertAdjacentHTML(
        "beforeend",
        `<span class="folio">${i + 1} / ${pages.length}</span>`,
    ),
);

// page size == viewport size, so the book always shows one full-screen page
const book = new St.PageFlip(document.getElementById("book"), {
    width: innerWidth,
    height: innerHeight,
    usePortrait: true,
    flippingTime: 900,
    maxShadowOpacity: 0.6,
    mobileScrollSupport: false,
    showPageCorners: false, // no corner fold following the mouse on hover
});
book.loadFromHTML(pages);

// while a page turns, page-flip inserts a temporary copy of it as the folded flap; tag it
const fronts = new Set(pages);
new MutationObserver((records) => {
    for (const { addedNodes } of records)
        for (const node of addedNodes)
            if (node.classList?.contains("page") && !fronts.has(node))
                node.classList.add("back");
}).observe(document.getElementById("book"), { childList: true, subtree: true });

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

function updateHints() {
    const i = book.getCurrentPageIndex();
    prevBtn.disabled = i <= 0;
    nextBtn.disabled = i >= book.getPageCount() - 1;
    document.body.classList.toggle("on-paper", pages[i].classList.contains("paper"));
}
updateHints();
book.on("flip", updateHints);

// clicking the page itself is handled by page-flip: right half forward, left half back
const next = () => book.flipNext("bottom");
const prev = () => book.flipPrev("bottom");

nextBtn.addEventListener("click", next);
prevBtn.addEventListener("click", prev);

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") next();
    if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
});

// page-flip has no resize API and pins its sizes at startup, so re-pin them by hand
function fit() {
    const w = innerWidth;
    const h = innerHeight;
    Object.assign(book.getSettings(), { width: w, height: h, maxWidth: w });
    Object.assign(document.getElementById("book").style, {
        minWidth: `${w}px`,
        minHeight: `${h}px`,
        maxWidth: `${2 * w}px`,
    });
    book.getUI().getWrapper().style.paddingBottom = `${(h / w) * 100}%`;
    book.update();
}
addEventListener("resize", fit);
