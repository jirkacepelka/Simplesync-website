const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Tabs: screenshot switcher in the "Web admin" section.
const shot = document.getElementById("shot");
const shotCaption = document.getElementById("shotCaption");
document.querySelectorAll("[data-shot]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-shot]").forEach((b) => {
      b.classList.toggle("on", b === btn);
      b.setAttribute("aria-selected", String(b === btn));
    });
    shotCaption.textContent = btn.dataset.caption;
    shot.style.opacity = "0";
    setTimeout(() => {
      shot.onload = () => (shot.style.opacity = "1");
      shot.src = `assets/${btn.dataset.shot}.png`;
      shot.alt = btn.textContent;
    }, 150);
  });
});

// Tabs: install panes. Each .panes block switches only its own panes.
document.querySelectorAll(".panes").forEach((group) => {
  const tabs = group.querySelectorAll("[data-pane]");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => {
        b.classList.toggle("on", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      group.querySelectorAll(".pane").forEach((p) => (p.hidden = p.id !== `pane-${btn.dataset.pane}`));
    });
  });
});

// Copy buttons.
document.querySelectorAll(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const code = btn.parentElement.querySelector("code");
    try {
      await navigator.clipboard.writeText(code.innerText);
      btn.textContent = "Copied";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = "Selected";
    }
    setTimeout(() => (btn.textContent = "Copy"), 1800);
  });
});

// Hero: type a line on the desktop, then show it arriving on the phone.
// At rest (and with reduced motion) both already show the finished line.
const typeLine = document.getElementById("typeLine");
if (typeLine && !reduceMotion) {
  const typeText = document.getElementById("typeText");
  const syncState = document.getElementById("syncState");
  const phoneLine = document.getElementById("phoneLine");
  const phoneToast = document.getElementById("phoneToast");
  const lines = ["Nara: deer park, half a day", "Hakone: onsen and a view of Fuji", "Nara: deer park, half a day"];
  let round = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function play() {
    const text = lines[round++ % lines.length];
    typeLine.classList.add("is-typing");
    typeText.textContent = "";
    phoneLine.style.visibility = "hidden";
    phoneLine.classList.remove("lit");
    phoneToast.textContent = "Synced 1 min ago";
    for (const ch of text) {
      typeText.textContent += ch;
      await wait(45 + Math.random() * 60);
    }
    await wait(500);
    typeLine.classList.remove("is-typing");
    syncState.textContent = "⟳ SimpleSync";
    syncState.classList.add("busy");
    await wait(1100);
    syncState.textContent = "✓ SimpleSync";
    syncState.classList.remove("busy");
    phoneLine.textContent = text;
    phoneLine.style.visibility = "visible";
    phoneLine.classList.add("lit");
    phoneToast.textContent = "Synced just now";
    await wait(1400);
    phoneLine.classList.remove("lit");
    await wait(4500);
  }

  // Run only while the hero is on screen.
  let visible = false;
  let running = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !running) loop();
  }).observe(typeLine);
  async function loop() {
    running = true;
    await wait(1200);
    while (visible) await play();
    running = false;
  }
}

// Guide: highlight the current section in the sidebar.
const tocLinks = [...document.querySelectorAll(".toc a")];
if (tocLinks.length) {
  const byId = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const heads = [...document.querySelectorAll(".doc-body h2[id], .doc-body h3[id]")].filter((h) => byId.has(h.id));
  const update = () => {
    let current = heads[0];
    for (const h of heads) if (h.getBoundingClientRect().top < 140) current = h;
    tocLinks.forEach((a) => a.classList.toggle("on", a === byId.get(current.id)));
  };
  document.addEventListener("scroll", update, { passive: true });
  update();
}
