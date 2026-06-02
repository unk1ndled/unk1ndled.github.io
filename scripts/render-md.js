// Fetch `content.md`, parse with marked, inject into #content
// Note: for production consider sanitizing the generated HTML (e.g. DOMPurify)
(function () {
  const target = document.getElementById("content");
  if (!target) return;

  fetch("public/content.md")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch content.md");
      return res.text();
    })
    .then((md) => {
      // Use marked to convert markdown to HTML
      target.innerHTML = marked.parse(md || "");

      // Make all generated links open in a new tab/window and add safe rel attributes
      // This ensures links don't gain access to our window via window.opener
      (function setLinkTargets(scope) {
        const anchors = scope.querySelectorAll("a");
        anchors.forEach((a) => {
          a.setAttribute("target", "_blank");
          // Preserve any existing rel tokens and add noopener noreferrer
          const existing = (a.getAttribute("rel") || "")
            .split(/\s+/)
            .filter(Boolean);
          const relSet = new Set(existing);
          relSet.add("noopener");
          relSet.add("noreferrer");
          a.setAttribute("rel", Array.from(relSet).join(" "));
        });
      })(target);

      // If there's an iframe wrapper, center it horizontally like before
      const wrapper = document.querySelector(".iframe-wrapper");
      if (wrapper) {
        wrapper.scrollLeft = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
      }

      const event = new Event("content:ready");
      window.dispatchEvent(event);
    })
    .catch((err) => {
      target.innerHTML =
        "<p>Could not load content. Check console for details.</p>";
      console.error(err);
    });
})();
