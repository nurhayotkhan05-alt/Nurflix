/* NUR FLIX — bosh sahifa */
(function () {
  "use strict";
  const { FILMS, CONFIG, ICONS, $, esc, norm, ratingHTML, filmUrl, hasSource, hasRating,
          imageHTML, cardHTML, listBtnHTML, allGenres, initHeader, initAds } = window.NF;

  const PER_PAGE = CONFIG.perPage || 8;
  const byPremiere = (a, b) => String(b.premiere || b.year || "").localeCompare(String(a.premiere || a.year || ""));
  const state = { q: "", genre: "", sort: "new", page: 1 };

  /* ---------- Banner ---------- */
  const featured = FILMS.filter((f) => f.featured);
  let heroIdx = 0, heroTimer;

  function renderHero() {
    const hero = $("#hero");
    if (!featured.length) { hero.classList.add("hidden"); return; }
    const f = featured[heroIdx];
    const trailerBtn = hasSource(f.trailer)
      ? `<button class="btn btn-primary" type="button" data-trailer="${esc(f.id)}">${ICONS.play}Treylerini ko‘rish</button>`
      : `<a class="btn btn-primary" href="${filmUrl(f)}">${ICONS.play}Treylerini ko‘rish</a>`;
    hero.innerHTML = `
      <div class="hero-bg">${imageHTML(f, "backdrop")}</div>
      <div class="container" style="position:relative;z-index:2;width:100%">
        <div class="hero-content" style="padding-left:0;padding-right:0">
          <span class="hero-badge">Tavsiya etamiz</span>
          <h1>${esc(f.title)}</h1>
          <div class="hero-meta">
            ${ratingHTML(f)}
            ${f.year ? `<span>${esc(f.year)}</span>` : ""}
            ${f.genres && f.genres.length ? `<span class="genres">${esc(f.genres.join(", "))}</span>` : ""}
            ${f.age ? `<span>${esc(f.age)}</span>` : ""}
          </div>
          ${f.description ? `<p>${esc(f.description)}</p>` : ""}
          <div class="hero-actions">${trailerBtn}${listBtnHTML(f)}
            <button class="btn btn-ghost" type="button" data-open-film="${esc(f.id)}">${ICONS.info}Batafsil</button>
          </div>
        </div>
      </div>
      ${featured.length > 1 ? `<div class="hero-dots">${featured.map((_, i) => `<button type="button" aria-label="${i + 1}-film" class="${i === heroIdx ? "active" : ""}" data-hero="${i}"></button>`).join("")}</div>` : ""}`;
  }
  function startHero() {
    clearInterval(heroTimer);
    if (featured.length > 1) heroTimer = setInterval(() => { heroIdx = (heroIdx + 1) % featured.length; renderHero(); }, 8000);
  }
  $("#hero").addEventListener("click", (e) => {
    const d = e.target.closest("[data-hero]");
    if (!d) return;
    heroIdx = +d.dataset.hero;
    renderHero();
    startHero();
  });

  /* ---------- Gorizontal bo'limlar ---------- */
  function renderRows() {
    const popular = FILMS.filter((f) => f.popular);
    $("#popularRow").innerHTML = popular.length ? popular.map(cardHTML).join("") : `<div class="section-empty">Hozircha filmlar yo‘q</div>`;

    $("#newRow").innerHTML = [...FILMS].sort(byPremiere).slice(0, 12).map(cardHTML).join("");

    const rated = FILMS.filter(hasRating).sort((a, b) => b.rating - a.rating).slice(0, 12);
    $("#topRow").innerHTML = rated.length
      ? `<div class="row-scroll">${rated.map(cardHTML).join("")}</div>`
      : `<div class="section-empty">Reytinglar hali kiritilmagan. Filmlarga tasdiqlangan baho qo‘shilgach, bu yerda ko‘rinadi.</div>`;
  }

  /* ---------- Barcha kinolar: qidiruv + janr + sahifalash ---------- */
  function filtered() {
    const q = norm(state.q);
    let list = FILMS.filter((f) =>
      (!q || norm(f.title).includes(q)) &&
      (!state.genre || (f.genres || []).includes(state.genre)));
    if (state.sort === "rating") list.sort((a, b) => (hasRating(b) ? b.rating : -1) - (hasRating(a) ? a.rating : -1));
    else if (state.sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort(byPremiere);
    return list;
  }

  function renderAll() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    state.page = Math.min(Math.max(1, state.page), pages);
    const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

    $("#allGrid").innerHTML = slice.length
      ? slice.map(cardHTML).join("")
      : `<div class="section-empty" style="grid-column:1/-1">Hech narsa topilmadi. Boshqa nom yoki janrni sinab ko‘ring.</div>`;

    // Faol filtrlar
    const chips = [];
    if (state.q) chips.push(`<span class="chip">Qidiruv: «${esc(state.q)}» <button type="button" data-clear="q" aria-label="Tozalash">×</button></span>`);
    if (state.genre) chips.push(`<span class="chip">Janr: ${esc(state.genre)} <button type="button" data-clear="genre" aria-label="Tozalash">×</button></span>`);
    $("#activeFilters").innerHTML = chips.length ? `${chips.join("")}<span class="result-info">Topildi: <b>${list.length}</b></span>` : "";
    $("#activeFilters").style.display = chips.length ? "" : "none";

    // Sahifalash
    const pag = $("#pagination");
    if (pages <= 1) { pag.innerHTML = ""; return; }
    const nums = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== "…") nums.push("…");
    }
    pag.innerHTML = `
      <button type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Oldingi">‹</button>
      ${nums.map((n) => n === "…" ? `<button type="button" disabled>…</button>` : `<button type="button" data-page="${n}" class="${n === state.page ? "active" : ""}" ${n === state.page ? 'aria-current="page"' : ""}>${n}</button>`).join("")}
      <button type="button" data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""} aria-label="Keyingi">›</button>`;
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.genre) p.set("genre", state.genre);
    if (state.page > 1) p.set("page", state.page);
    const qs = p.toString();
    history.replaceState(null, "", (qs ? "?" + qs : location.pathname) + location.hash);
  }
  function update(scroll) {
    renderAll();
    syncUrl();
    if (scroll) $("#all").scrollIntoView({ behavior: "smooth" });
  }

  $("#pagination").addEventListener("click", (e) => {
    const b = e.target.closest("[data-page]");
    if (!b || b.disabled) return;
    state.page = +b.dataset.page;
    update(true);
  });
  $("#activeFilters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-clear]");
    if (!b) return;
    state[b.dataset.clear] = "";
    if (b.dataset.clear === "q") $("#searchInput").value = "";
    if (b.dataset.clear === "genre") $("#genreFilter").value = "";
    state.page = 1;
    update(false);
  });

  const genreSel = $("#genreFilter");
  genreSel.insertAdjacentHTML("beforeend", allGenres().map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join(""));
  genreSel.addEventListener("change", () => { state.genre = genreSel.value; state.page = 1; update(false); });
  $("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; state.page = 1; update(false); });

  /* ---------- Ishga tushirish ---------- */
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") || "";
  state.genre = params.get("genre") || "";
  state.page = parseInt(params.get("page"), 10) || 1;
  $("#searchInput").value = state.q;
  genreSel.value = state.genre;

  initHeader({
    onGenre: (g) => { state.genre = g; genreSel.value = g; state.page = 1; update(true); },
    onSearch: (v) => { state.q = v.trim(); state.page = 1; renderAll(); syncUrl(); },
    onSearchSubmit: (v) => { state.q = v.trim(); state.page = 1; update(true); }
  });
  initAds();
  renderHero();
  startHero();
  renderRows();
  renderAll();
  if (location.hash && (state.q || state.genre)) setTimeout(() => $(location.hash)?.scrollIntoView(), 50);
  $("#year").textContent = new Date().getFullYear();
})();
