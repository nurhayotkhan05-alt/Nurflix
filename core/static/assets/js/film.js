/* NUR FLIX — film sahifasi (barcha filmlar uchun bitta shablon: film.html?id=...) */
(function () {
  "use strict";
  const { FILMS, ICONS, $, esc, ratingHTML, filmUrl, getFilm, hasSource,
          imageHTML, cardHTML, listBtnHTML, infoListHTML, formatDate, playerHTML, initHeader, initAds } = window.NF;

  const page = $("#filmPage");
  const id = new URLSearchParams(location.search).get("id");
  const f = id ? getFilm(id) : null;

  initHeader();
  $("#year").textContent = new Date().getFullYear();

  if (!f) {
    document.title = "Film topilmadi — NUR FLIX";
    page.innerHTML = `
      <div class="container" style="padding:80px 16px;text-align:center">
        <h1 style="font-size:28px;margin-bottom:12px">Film topilmadi</h1>
        <p style="color:var(--muted);margin-bottom:24px">Havola noto‘g‘ri yoki film o‘chirilgan bo‘lishi mumkin.</p>
        <a class="btn btn-primary" href="index.html">Bosh sahifaga qaytish</a>
      </div>`;
    initAds();
    return;
  }

  document.title = `${f.title}${f.year ? " (" + f.year + ")" : ""} — NUR FLIX`;
  const firstGenre = (f.genres || [])[0];
  const hasVideo = hasSource(f.video);
  const hasTrailer = hasSource(f.trailer);

  // "Tomosha qilish": video bo'lsa — pleyerga, bo'lmasa treylerga, u ham bo'lmasa — tafsilotlarga
  const watchBtn = hasVideo
    ? `<button class="btn btn-primary" type="button" data-go="video">${ICONS.play}Tomosha qilish</button>`
    : hasTrailer
      ? `<button class="btn btn-primary" type="button" data-go="trailer">${ICONS.play}Treylerni ko‘rish</button>`
      : `<a class="btn btn-primary" href="#details">${ICONS.info}Film tafsilotlari</a>`;

  const similar = FILMS
    .filter((x) => x.id !== f.id)
    .map((x) => ({ x, score: (x.genres || []).filter((g) => (f.genres || []).includes(g)).length }))
    .filter((o) => o.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((o) => o.x);

  page.innerHTML = `
    <div class="film-page-bg" aria-hidden="true">${imageHTML(f, "backdrop")}</div>

    <div class="container">
      <div class="film-head">
        <h1>${esc(f.title)}${f.year ? ` (${esc(f.year)})` : ""} — o‘zbek tilida</h1>
        <div class="crumbs">
          <a href="index.html">Kinolar</a>
          ${firstGenre ? ` / <a href="index.html?genre=${encodeURIComponent(firstGenre)}#all">${esc(firstGenre)}</a>` : ""}
          / <span>${esc(f.title)}</span>
        </div>
        <div class="meta-row">
          ${ratingHTML(f)}
          ${f.premiere ? `<span>${ICONS.calendar}${esc(formatDate(f.premiere))}</span>` : ""}
          ${f.age ? `<span>${esc(f.age)}</span>` : ""}
        </div>
      </div>

      <section class="film-top" id="details">
        <div class="poster">${imageHTML(f, "poster")}</div>
        <div>
          ${infoListHTML(f, true)}
          ${f.description ? `<p class="film-desc">${esc(f.description)}</p>` : ""}
          <div class="film-actions">
            ${watchBtn}
            ${hasVideo && hasTrailer ? `<button class="btn btn-ghost" type="button" data-go="trailer">${ICONS.film}Treyler</button>` : ""}
            ${listBtnHTML(f)}
          </div>
        </div>
      </section>

      <div class="ad-slot" data-ad-slot="1"></div>

      <section class="section player-section" id="player">
        <div class="section-head">
          <h2 class="section-title">Onlayn tomosha</h2>
          <div class="player-tabs" id="playerTabs">
            ${hasVideo ? `<button class="btn btn-sm btn-ghost" type="button" data-tab="video">Film</button>` : ""}
            ${hasTrailer ? `<button class="btn btn-sm btn-ghost" type="button" data-tab="trailer">Treyler</button>` : ""}
          </div>
        </div>
        <div class="player"><div class="video-frame" id="videoFrame"></div></div>
      </section>

      <div class="ad-slot" data-ad-slot="4"></div>

      ${similar.length ? `
      <section class="section">
        <div class="section-head"><h2 class="section-title">O‘xshash kinolar</h2></div>
        <div class="row-scroll">${similar.map(cardHTML).join("")}</div>
      </section>` : ""}

      <div class="ad-slot" data-ad-slot="6"></div>
    </div>`;

  /* ---------- Pleyer ---------- */
  const frame = $("#videoFrame");
  function showEmpty() {
    frame.innerHTML = `
      <div class="player-empty">
        <span class="pe-icon">${ICONS.film}</span>
        <strong>Video hali qo‘shilmagan</strong>
        <span>Bu film uchun video manbasi tez orada joylanadi.</span>
        <a class="btn btn-ghost btn-sm" href="#details">Film tafsilotlari</a>
      </div>`;
  }
  function load(kind, autoplay) {
    const src = kind === "trailer" ? f.trailer : f.video;
    if (!hasSource(src)) { showEmpty(); return; }
    frame.innerHTML = playerHTML(src, `${f.title}${kind === "trailer" ? " — treyler" : ""}`);
    document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === kind));
    const v = frame.querySelector("video");
    if (v && autoplay) v.play().catch(() => {});
  }

  // Dastlab: video bo'lsa — film, aks holda treyler, aks holda bo'sh holat
  if (hasVideo) load("video", false);
  else if (hasTrailer) load("trailer", false);
  else showEmpty();

  page.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]");
    if (t) { load(t.dataset.tab, true); return; }
    const go = e.target.closest("[data-go]");
    if (go) {
      load(go.dataset.go, true);
      $("#player").scrollIntoView({ behavior: "smooth" });
    }
  });

  if (location.hash === "#player") setTimeout(() => $("#player").scrollIntoView(), 60);
  initAds();
})();
