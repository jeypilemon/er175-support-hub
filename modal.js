function openModal(url) {
    const safeUrl = typeof getSafeHttpUrl === "function" ? getSafeHttpUrl(url) : "";
    if (!safeUrl) {
        console.warn("Blocked an invalid or unsupported link:", url);
        return;
    }

    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");
    if (!modal || !frame) return;

    const parsedUrl = new URL(safeUrl);
    const ytId = getYouTubeId(safeUrl);

    frame.src = "";

    if (ytId) {
        frame.src = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`;
        modal.classList.add("show");
        return;
    }

    const host = parsedUrl.hostname.toLowerCase();
    const isTikTok = host === "tiktok.com" || host.endsWith(".tiktok.com");
    const isFacebook = host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch";

    if (isTikTok || isFacebook) {
        window.location.href = safeUrl;
        return;
    }

    window.open(safeUrl, "_blank", "noopener,noreferrer");
}

function closeOutsideModal(e){

    const box =
    document.querySelector(".component-modal-box");


    if(!box.contains(e.target)){

        closeComponentViewer();

    }

}

function closeModal() {
    const modal = document.getElementById("linkModal");
    const frame = document.getElementById("modalFrame");
    if (!modal || !frame) return;

    modal.classList.remove("show");

    // Stop playback after the closing transition completes.
    window.setTimeout(() => {
        frame.src = "";
    }, 300);
}

function getYouTubeId(url) {
    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/
    );
    return match ? match[1] : null;
}

function linkifySolution(text) {
    if (!text) return "";

    const source = String(text);
    const urlRegex = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+)/g;
    let output = "";
    let lastIndex = 0;

    for (const match of source.matchAll(urlRegex)) {
        const rawUrl = match[0];
        const start = match.index;
        output += escapeHTML(source.slice(lastIndex, start)).replace(/\n/g, "<br>");

        // Keep common sentence punctuation outside the clickable URL.
        const trailingPunctuation = rawUrl.match(/[),.!?;:]+$/)?.[0] || "";
        const urlText = trailingPunctuation
            ? rawUrl.slice(0, -trailingPunctuation.length)
            : rawUrl;
        const candidate = urlText.startsWith("www.") ? `https://${urlText}` : urlText;
        const safeUrl = getSafeHttpUrl(candidate);

        if (!safeUrl) {
            output += escapeHTML(rawUrl);
            lastIndex = start + rawUrl.length;
            continue;
        }

        const host = new URL(safeUrl).hostname.toLowerCase();
        let label = "🔗 Open Link";
        let className = "inline-link";

        if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com")) {
            className += " youtube";
            label = "▶ Watch in YouTube";
        } else if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
            className += " tiktok";
            label = "🎵 Watch in TikTok";
        } else if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch") {
            className += " facebook";
            label = "📘 View in Facebook";
        }

        // The delegated click handler routes this through openModal():
        // YouTube stays in-app; TikTok/Facebook retain their redirect behavior.
        output += `<div style="margin:6px 0;"><a class="${className}" href="${escapeHTML(safeUrl)}" data-open-platform-link>${label}</a></div>`;
        output += escapeHTML(trailingPunctuation);
        lastIndex = start + rawUrl.length;
    }

    output += escapeHTML(source.slice(lastIndex)).replace(/\n/g, "<br>");
    return output;
}

// Delegation is required because solution content is rendered dynamically.
document.addEventListener("click", event => {
    const link = event.target.closest("a[data-open-platform-link]");
    if (!link) return;

    event.preventDefault();
    openModal(link.href);
});
