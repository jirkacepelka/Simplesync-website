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

// Hero: one device saves a note, the server bumps the revision,
// the other devices pull it. At rest everything shows "synced".
const net = document.getElementById("net");
if (net && !reduceMotion) {
  const nodes = Object.fromEntries([...net.querySelectorAll("[data-dev]")].map((n) => [n.dataset.dev, n]));
  const pulses = Object.fromEntries([...net.querySelectorAll(".pulse")].map((p) => [p.dataset.for, p]));
  const revEl = document.getElementById("rev");
  const rounds = [
    { from: "mac", file: "Garden plan.md" },
    { from: "iphone", file: "Groceries.md" },
    { from: "pc", file: "Meeting notes.md" },
    { from: "ipad", file: "Reading list.md" },
  ];
  let rev = Number(revEl.textContent);
  let round = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const status = (dev, text) => (nodes[dev].querySelector(".node-status").textContent = text);

  function travel(dev, toServer) {
    const p = pulses[dev];
    const len = p.getTotalLength();
    const seg = 46;
    p.style.strokeDasharray = `${seg} ${len + seg}`;
    const a = toServer ? seg : -len;
    const b = toServer ? -len : seg;
    return p.animate(
      [{ strokeDashoffset: a, opacity: 1 }, { strokeDashoffset: b, opacity: 1 }],
      { duration: 900, easing: "cubic-bezier(.45,0,.25,1)" }
    ).finished;
  }

  async function play() {
    const { from, file } = rounds[round++ % rounds.length];
    const others = Object.keys(nodes).filter((d) => d !== from);
    nodes[from].classList.add("editing", "busy");
    status(from, `saving ${file}`);
    await wait(1300);
    await travel(from, true);
    nodes[from].classList.remove("editing", "busy");
    rev += 1;
    revEl.textContent = rev;
    revEl.classList.add("bump");
    status(from, `synced · rev ${rev}`);
    await wait(350);
    others.forEach((d) => nodes[d].classList.add("busy"));
    await Promise.all(others.map((d) => travel(d, false)));
    others.forEach((d) => {
      nodes[d].classList.remove("busy");
      nodes[d].classList.add("fresh");
      status(d, `got ${file}`);
    });
    revEl.classList.remove("bump");
    await wait(1600);
    others.forEach((d) => {
      nodes[d].classList.remove("fresh");
      status(d, `synced · rev ${rev}`);
    });
    await wait(2200);
  }

  let visible = false;
  let running = false;
  async function loop() {
    running = true;
    await wait(800);
    while (visible) await play();
    running = false;
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !running) loop();
  }).observe(net);
}

// Guide: highlight the current section in the sidebar.
const tocLinks = [...document.querySelectorAll(".toc a")];
if (tocLinks.length) {
  const byId = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const heads = [...document.querySelectorAll(".doc-body h2[id], .doc-body h3[id]")].filter((h) => byId.has(h.id));
  const update = () => {
    let current = heads[0];
    for (const h of heads) if (h.getBoundingClientRect().top < 140) current = h;
    const idx = heads.indexOf(current);
    tocLinks.forEach((a) => {
      const h = heads.findIndex((x) => byId.get(x.id) === a);
      a.classList.toggle("on", h === idx);
      a.classList.toggle("done", h > -1 && h < idx);
    });
  };
  document.addEventListener("scroll", update, { passive: true });
  update();
}
