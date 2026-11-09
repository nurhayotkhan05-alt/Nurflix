/* NUR FLIX — umumiy funksiyalar (ikkala sahifa uchun) */
(function () {
  "use strict";

  const FILMS = window.NURFLIX_FILMS || [];
  const CONFIG = window.NURFLIX_CONFIG || {};

  /* ---------- Yordamchi funksiyalar ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLowerCase().replace(/[‘’ʻʼ`']/g, "'").trim();

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>'
  };

  const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return `${d}-${MONTHS[m - 1]}, ${y}`;
  }

  function hasRating(f) { return typeof f.rating === "number" && !isNaN(f.rating); }
  function ratingHTML(f) {
    return hasRating(f)
      ? `<span class="rating">${ICONS.star}${f.rating.toFixed(1)}</span>`
      : `<span class="rating none" title="Reyting hali kiritilmagan">${ICONS.star}Baho yo‘q</span>`;
  }
  function filmUrl(f, hash) { return `film.html?id=${encodeURIComponent(f.id)}${hash ? "#" + hash : ""}`; }
  function getFilm(id) { return FILMS.find((f) => f.id === id); }
  function hasSource(src) { return !!(src && src.src); }

  /* ---------- Poster va fallback ---------- */
  const PALETTES = [
    ["#ff8a1f", "#7a1a10"], ["#ff4a2e", "#2a0f1e"], ["#e0a526", "#3a1a08"],
    ["#c23b22", "#140d1c"], ["#ff6f3c", "#2b1838"], ["#d9822b", "#10202a"]
  ];
  function paletteFor(title) {
    let h = 0;
    for (const ch of String(title)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return PALETTES[h % PALETTES.length];
  }
  function fallbackPosterHTML(f, kind) {
    const [a, b] = paletteFor(f.title);
    const cls = kind === "backdrop" ? "fallback-poster fallback-backdrop" : "fallback-poster";
    const inner = kind === "backdrop"
      ? `<div class="fp-title">${esc(f.title)}</div>`
      : `<div class="fp-brand">NUR FLIX</div><div class="fp-title">${esc(f.title)}</div><div class="fp-year">${esc(f.year || "")}</div>`;
    return `<div class="${cls}" style="background:linear-gradient(160deg, ${a} 0%, ${b} 100%)" role="img" aria-label="${esc(f.title)}">${inner}</div>`;
  }
  // Rasm ishlamasa — fallback bilan almashtiriladi
  function imageHTML(f, kind) {
    const src = kind === "backdrop" ? (f.backdrop || f.poster) : f.poster;
    if (!src) return fallbackPosterHTML(f, kind);
    return `<img src="${esc(src)}" alt="${esc(f.title)}" loading="lazy" decoding="async" data-fallback="${esc(f.id)}" data-kind="${kind || "poster"}">`;
  }
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.fallback) return;
    const f = getFilm(img.dataset.fallback);
    if (!f) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = fallbackPosterHTML(f, img.dataset.kind);
    const node = wrap.firstElementChild;
    if (img.closest(".film-page-bg")) node.style.cssText += ";width:100%;height:100%";
    img.replaceWith(node);
  }, true);

  /* ---------- Karta ---------- */
  function cardHTML(f) {
    const genre = (f.genres || []).slice(0, 2).join(", ");
    return `
      <article class="card">
        <a class="card-poster" href="${filmUrl(f)}" aria-label="${esc(f.title)} — sahifasini ochish">
          ${f.age ? `<span class="card-age">${esc(f.age)}</span>` : ""}
          ${imageHTML(f, "poster")}
          <span class="play-hint"><span>${ICONS.play}</span></span>
        </a>
        <button class="card-body" type="button" data-open-film="${esc(f.id)}" aria-label="${esc(f.title)} — ma'lumot">
          <span class="card-title">${esc(f.title)}</span>
          <span class="card-sub">${esc(f.year || "")}${genre ? " · " + esc(genre) : ""}</span>
          <span class="card-foot">${ratingHTML(f)}<span class="more">Batafsil</span></span>
        </button>
      </article>`;
  }

  /* ---------- Ro'yxatga qo'shish (brauzerda) ---------- */
  const LIST_KEY = "nurflix_watchlist";
  function getList() {
    try { return JSON.parse(localStorage.getItem(LIST_KEY)) || []; } catch (_) { return []; }
  }
  function toggleList(id) {
    const list = getList();
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    try { localStorage.setItem(LIST_KEY, JSON.stringify(list)); } catch (_) { /* saqlab bo'lmadi */ }
    return i < 0;
  }
  function inList(id) { return getList().includes(id); }
  function listBtnHTML(f, cls = "btn btn-ghost") {
    const on = inList(f.id);
    return `<button type="button" class="${cls}${on ? " is-active" : ""}" data-list="${esc(f.id)}">${on ? ICONS.check : ICONS.plus}<span>${on ? "Ro‘yxatda" : "Ro‘yxatga qo‘shish"}</span></button>`;
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-list]");
    if (!btn) return;
    const added = toggleList(btn.dataset.list);
    $$(`[data-list="${CSS.escape(btn.dataset.list)}"]`).forEach((b) => {
      b.classList.toggle("is-active", added);
      b.innerHTML = `${added ? ICONS.check : ICONS.plus}<span>${added ? "Ro‘yxatda" : "Ro‘yxatga qo‘shish"}</span>`;
    });
    toast(added ? "Ro‘yxatga qo‘shildi" : "Ro‘yxatdan olib tashlandi");
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), 2200);
  }

  /* ---------- Modal ---------- */
  let lastFocus = null;
  function openModal(html, extraClass = "") {
    closeModal();
    lastFocus = document.activeElement;
    const m = document.createElement("div");
    m.className = `modal ${extraClass}`;
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="modal-box"><button class="modal-close" type="button" aria-label="Yopish">×</button>${html}</div>`;
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest(".modal-close")) closeModal(); });
    document.body.appendChild(m);
    document.body.style.overflow = "hidden";
    $(".modal-close", m).focus();
    return m;
  }
  function closeModal() {
    const m = $(".modal");
    if (!m) return;
    m.remove();
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function infoListHTML(f, full) {
    const rows = [
      ["Yil", f.year],
      ["Davlat", f.country],
      ["Janr", (f.genres || []).join(", "), "green"],
      ["Premyera", formatDate(f.premiere)],
      ["Rejissyor", f.director, "green"],
      ["Aktyorlar", (f.cast || []).join(", "), "green"],
      ["Reyting", hasRating(f) ? f.rating.toFixed(1) + " / 10" : "Hali kiritilmagan"],
      ["Yosh chegarasi", f.age]
    ];
    if (full) {
      rows.push(["Til", f.language], ["Ssenariy", (f.writers || []).join(", ")], ["Prodyuser", (f.producers || []).join(", ")], ["Musiqa", f.music]);
    }
    return `<dl class="info-list">${rows.filter((r) => r[1]).map(([k, v, c]) => `<div><dt>${k}:</dt><dd${c ? ` class="${c}"` : ""}>${esc(v)}</dd></div>`).join("")}</dl>`;
  }

  function openFilmModal(id) {
    const f = getFilm(id);
    if (!f) return;
    const watch = hasSource(f.video)
      ? `<a class="btn btn-primary" href="${filmUrl(f, "player")}">${ICONS.play}Tomosha qilish</a>`
      : `<a class="btn btn-primary" href="${filmUrl(f)}">${ICONS.info}Film sahifasi</a>`;
    const trailer = hasSource(f.trailer)
      ? `<button class="btn btn-ghost" type="button" data-trailer="${esc(f.id)}">${ICONS.film}Treyler</button>` : "";
    openModal(`
      <div class="film-modal">
        <a class="poster" href="${filmUrl(f)}">${imageHTML(f, "poster")}</a>
        <div>
          <h2>${esc(f.title)}</h2>
          ${ratingHTML(f)}
          ${f.description ? `<p class="desc">${esc(f.description)}</p>` : ""}
          ${infoListHTML(f, false)}
          <div class="modal-actions">${watch}${trailer}${listBtnHTML(f)}</div>
        </div>
      </div>`);
  }

  /* ---------- Video / treyler ---------- */
  function playerHTML(src, title) {
    if (!hasSource(src)) return "";
    if (src.type === "file") {
      return `<video controls playsinline preload="metadata"${src.poster ? ` poster="${esc(src.poster)}"` : ""}><source src="${esc(src.src)}">Brauzeringiz videoni qo‘llab-quvvatlamaydi.</video>`;
    }
    return `<iframe src="${esc(src.src)}" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }
  function openTrailer(id) {
    const f = getFilm(id);
    if (!f) return;
    if (!hasSource(f.trailer)) { location.href = filmUrl(f); return; }
    openModal(`<div class="video-frame">${playerHTML(f.trailer, f.title + " — treyler")}</div>`, "video-modal");
  }

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open-film]");
    if (open) { e.preventDefault(); openFilmModal(open.dataset.openFilm); return; }
    const tr = e.target.closest("[data-trailer]");
    if (tr) { e.preventDefault(); openTrailer(tr.dataset.trailer); }
  });

  /* ---------- Janrlar ---------- */
  function allGenres() {
    const set = new Set();
    FILMS.forEach((f) => (f.genres || []).forEach((g) => set.add(g)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "uz"));
  }

  /* ---------- Header: menyu, janrlar, qidiruv, kirish ---------- */
  function initHeader(opts = {}) {
    const nav = $(".nav");
    const toggle = $(".menu-toggle");
    if (toggle) toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });

    // Janrlar menyusi
    const gBtn = $("#genresBtn");
    const gMenu = $("#genreMenu");
    if (gBtn && gMenu) {
      gMenu.innerHTML = allGenres().map((g) => `<button type="button" data-genre="${esc(g)}">${esc(g)}</button>`).join("");
      gBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const hidden = gMenu.classList.toggle("hidden");
        gBtn.setAttribute("aria-expanded", !hidden);
      });
      document.addEventListener("click", (e) => { if (!e.target.closest(".nav-genres")) gMenu.classList.add("hidden"); });
      gMenu.addEventListener("click", (e) => {
        const b = e.target.closest("[data-genre]");
        if (!b) return;
        gMenu.classList.add("hidden");
        nav.classList.remove("open");
        if (opts.onGenre) opts.onGenre(b.dataset.genre);
        else location.href = `index.html?genre=${encodeURIComponent(b.dataset.genre)}#all`;
      });
    }

    // Qidiruv
    const input = $("#searchInput");
    const box = $("#searchSuggest");
    if (input && box) {
      let focusIdx = -1;
      const render = () => {
        const q = norm(input.value);
        if (!q) { box.classList.add("hidden"); return; }
        const res = FILMS.filter((f) => norm(f.title).includes(q)).slice(0, 6);
        focusIdx = -1;
        box.innerHTML = res.length
          ? res.map((f) => `<a href="${filmUrl(f)}"><span class="s-thumb" style="aspect-ratio:2/3">${imageHTML(f, "poster")}</span><span>${esc(f.title)}<small>${esc(f.year || "")} · ${esc((f.genres || []).slice(0, 2).join(", "))}</small></span></a>`).join("")
          : `<div class="s-empty">«${esc(input.value)}» bo‘yicha film topilmadi</div>`;
        box.classList.remove("hidden");
      };
      input.addEventListener("input", () => { render(); if (opts.onSearch) opts.onSearch(input.value); });
      input.addEventListener("focus", render);
      input.addEventListener("keydown", (e) => {
        const links = $$("a", box);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (!links.length) return;
          focusIdx = (focusIdx + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
          links.forEach((l, i) => l.classList.toggle("focus", i === focusIdx));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (focusIdx >= 0 && links[focusIdx]) { location.href = links[focusIdx].href; return; }
          box.classList.add("hidden");
          if (opts.onSearchSubmit) opts.onSearchSubmit(input.value);
          else location.href = `index.html?q=${encodeURIComponent(input.value)}#all`;
        } else if (e.key === "Escape") box.classList.add("hidden");
      });
      document.addEventListener("click", (e) => { if (!e.target.closest(".search")) box.classList.add("hidden"); });
    }

    // Kirish
    const loginBtn = $("#loginBtn");
    if (loginBtn) loginBtn.addEventListener("click", openLogin);
  }

  function openLogin() {
    const m = openModal(`
      <form class="login-box" novalidate>
        <h2>Kirish</h2>
        <div class="field"><label for="lgLogin">Login yoki e-pochta</label><input id="lgLogin" name="login" autocomplete="username" required></div>
        <div class="field"><label for="lgPass">Parol</label><input id="lgPass" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn btn-primary" type="submit" style="width:100%">Kirish</button>
        <p class="form-note" aria-live="polite"></p>
      </form>`);
    const form = $("form", m);
    const note = $(".form-note", m);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      note.className = "form-note";
      if (!data.login || !data.password) { note.textContent = "Login va parolni kiriting."; note.classList.add("error"); return; }
      if (!CONFIG.loginEndpoint) { note.textContent = "Kirish tizimi hali ulanmagan (backend kutilmoqda)."; return; }
      try {
        note.textContent = "Tekshirilmoqda…";
        const r = await fetch(CONFIG.loginEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
        if (!r.ok) throw new Error();
        note.textContent = "Muvaffaqiyatli kirdingiz.";
        setTimeout(closeModal, 800);
      } catch (_) {
        note.textContent = "Kirishda xatolik. Ma’lumotlarni tekshiring.";
        note.classList.add("error");
      }
    });
  }

  /* ---------- Reklama (6 ta joy) ----------
     Backend javobi: [{ slot: 1, image: "url", url: "https://...", alt: "..." }]
     yoki            [{ slot: 1, html: "<div>...</div>" }]  */
  async function initAds() {
    const slots = $$("[data-ad-slot]");
    slots.forEach((s) => { s.classList.add("is-empty"); s.textContent = `REKLAMA JOYI #${s.dataset.adSlot}`; });
    if (!CONFIG.adsEndpoint || !slots.length) return;
    try {
      const r = await fetch(CONFIG.adsEndpoint, { credentials: "include" });
      if (!r.ok) return;
      const ads = await r.json();
      (Array.isArray(ads) ? ads : []).forEach((ad) => {
        $$(`[data-ad-slot="${ad.slot}"]`).forEach((s) => {
          if (ad.html) s.innerHTML = ad.html;
          else if (ad.image) s.innerHTML = `<a href="${esc(ad.url || "#")}" target="_blank" rel="sponsored noopener"><img src="${esc(ad.image)}" alt="${esc(ad.alt || "Reklama")}" loading="lazy"></a>`;
          else return;
          s.classList.remove("is-empty");
          s.classList.add("ad-label");
        });
      });
    } catch (_) { /* reklama yuklanmadi — joylar bo'sh qoladi */ }
  }

  window.NF = {
    FILMS, CONFIG, ICONS, $, $$, esc, norm,
    formatDate, hasRating, ratingHTML, filmUrl, getFilm, hasSource,
    imageHTML, fallbackPosterHTML, cardHTML, listBtnHTML, infoListHTML,
    openModal, closeModal, openFilmModal, openTrailer, playerHTML,
    allGenres, initHeader, initAds, toast
  };
})();
