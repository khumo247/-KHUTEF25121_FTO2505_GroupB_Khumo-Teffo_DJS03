/* ===========================
   PodcastApp — Plain JS
   ===========================
   - Fully self-contained
   - JSDoc on major functions / classes
   - Features: search, genre filter, sort, responsive grid, modal (backdrop/X/Escape)
   =========================== */

/**
 * Podcast model with helper methods.
 * @class
 */
class Podcast {
  /**
   * @param {Object} o - raw podcast object
   * @param {number} o.id
   * @param {string} o.title
   * @param {string} o.cover - image url
   * @param {string} o.description
   * @param {string[]} o.genres
   * @param {{title:string,description?:string,episodes:number}[]} o.seasons
   * @param {string|Date} o.updated
   * @param {number} o.popularity
   */
  constructor(o) {
    Object.assign(this, o);
    this.updated = new Date(o.updated);
    if (!Array.isArray(this.seasons)) this.seasons = [];
  }

  /**
   * Return number of seasons.
   * @returns {number}
   */
  getSeasonCount() {
    return this.seasons.length;
  }

  /**
   * Human-friendly last-updated string (for card).
   * Examples: "Updated today", "Updated 3 days ago", "Updated 2 weeks ago"
   * @returns {string}
   */
  getLastUpdatedHuman() {
    const days = Math.floor((Date.now() - this.updated.getTime()) / 86400000);
    if (days <= 0) return "Updated today";
    if (days === 1) return "Updated yesterday";
    if (days < 7) return `Updated ${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `Updated ${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  /**
   * Full formatted date for modal.
   * @returns {string}
   */
  getFullDate() {
    return this.updated.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }
}

/* -------------------------
   Sample dataset (8 shows)
   Uses Picsum for cover placeholders.
   ------------------------- */
const SAMPLE_PODCASTS = [
  new Podcast({
    id: 1,
    title: "Tech Talks Daily",
    cover: "https://picsum.photos/seed/tech1/600/400",
    description: "Deep dives into technology trends, AI, and digital transformation with expert interviews and case studies.",
    genres: ["Technology", "Business"],
    seasons: [
      { title: "Season 1: Getting Started", description: "Introduction to the fundamentals", episodes: 12 },
      { title: "Season 2: Advanced Topics", description: "Deep dives into complex subjects", episodes: 15 },
      { title: "Season 3: Industry Insights", description: "Expert perspectives and case studies", episodes: 18 },
      { title: "Season 4: Future Trends", description: "What's coming next in tech", episodes: 20 },
    ],
    updated: "2025-01-15",
    popularity: 95,
  }),
  new Podcast({
    id: 2,
    title: "Crime Junkie",
    cover: "https://picsum.photos/seed/crime2/600/400",
    description: "True crime stories, investigations, and mysteries that keep you on the edge.",
    genres: ["True Crime", "Mystery"],
    seasons: [
      { title: "Season 1: Dark Stories", description: "Chilling cases that shocked the world", episodes: 20 },
      { title: "Season 2: Cold Cases", description: "Unsolved crimes revisited", episodes: 18 },
    ],
    updated: daysAgoISO(7),
    popularity: 88,
  }),
  new Podcast({
    id: 3,
    title: "Comedy Bang Bang",
    cover: "https://picsum.photos/seed/comedy3/600/400",
    description: "Improvised comedy and interviews with a rotating cast of characters.",
    genres: ["Comedy", "Entertainment"],
    seasons: [{ title: "Season 1", description: "Sketches and bits", episodes: 22 }],
    updated: daysAgoISO(3),
    popularity: 82,
  }),
  new Podcast({
    id: 4,
    title: "How I Built This",
    cover: "https://picsum.photos/seed/biz4/600/400",
    description: "Founders tell the stories behind the movements they built.",
    genres: ["Business", "Entrepreneurship"],
    seasons: [{ title: "Season 1", description: "Origin stories", episodes: 18 }],
    updated: daysAgoISO(5),
    popularity: 91,
  }),
  new Podcast({
    id: 5,
    title: "The Daily Meditation",
    cover: "https://picsum.photos/seed/med5/600/400",
    description: "Mindfulness practices and talks for everyday calm.",
    genres: ["Health", "Lifestyle"],
    seasons: [{ title: "Season 1", description: "Breathe and relax", episodes: 30 }],
    updated: daysAgoISO(1),
    popularity: 70,
  }),
  new Podcast({
    id: 6,
    title: "Hardcore History",
    cover: "https://picsum.photos/seed/hist6/600/400",
    description: "Long-form explorations of pivotal moments and people.",
    genres: ["History", "Education"],
    seasons: [{ title: "Season 1", description: "Ancient wars", episodes: 10 }],
    updated: daysAgoISO(4),
    popularity: 99,
  }),
  new Podcast({
    id: 7,
    title: "The Sports Desk",
    cover: "https://picsum.photos/seed/sports7/600/400",
    description: "Analysis and interviews from across the sports world.",
    genres: ["Sports", "News"],
    seasons: [{ title: "Season 1", description: "Weekly recaps", episodes: 24 }],
    updated: daysAgoISO(6),
    popularity: 76,
  }),
  new Podcast({
    id: 8,
    title: "Curious Minds",
    cover: "https://picsum.photos/seed/sci8/600/400",
    description: "Science explained through engaging stories and experiments.",
    genres: ["Science", "Nature"],
    seasons: [{ title: "Season 1", description: "Everyday science", episodes: 16 }],
    updated: daysAgoISO(8),
    popularity: 85,
  }),
];

/**
 * Create an ISO date string for n days ago.
 * @param {number} n
 * @returns {string}
 */
function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

/* =========================
   DOM references
   ========================= */
const grid = document.getElementById("podcast-grid");
const modal = document.getElementById("podcast-modal");
const modalInner = document.getElementById("modal-inner");
const closeModalBtn = document.getElementById("close-modal");
const genreFilter = document.getElementById("genre-filter");
const sortFilter = document.getElementById("sort-filter");
const searchInput = document.getElementById("search-input");

/* =========================
   Rendering & UI logic
   ========================= */

/**
 * Render the full list of podcasts into the grid.
 * @param {Podcast[]} list
 */
function renderPodcasts(list) {
  grid.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No podcasts match your filters.";
    grid.appendChild(empty);
    return;
  }

  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "podcast-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${p.title} — ${p.getSeasonCount()} seasons — ${p.getLastUpdatedHuman()}`);

    // cover
    const cover = document.createElement("div");
    cover.className = "podcast-cover";
    cover.style.backgroundImage = `url('${p.cover}')`;
    card.appendChild(cover);

    // info container
    const info = document.createElement("div");
    info.className = "podcast-info";

    const title = document.createElement("div");
    title.className = "podcast-title";
    title.textContent = p.title;
    info.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "podcast-meta";
    meta.textContent = `${p.getSeasonCount()} ${p.getSeasonCount() === 1 ? "season" : "seasons"}`;
    info.appendChild(meta);

    // tags
    const tags = document.createElement("div");
    tags.className = "podcast-tags";
    p.genres.forEach(g => {
      const t = document.createElement("span");
      t.className = "podcast-tag";
      t.textContent = g;
      tags.appendChild(t);
    });
    info.appendChild(tags);

    // updated
    const updated = document.createElement("div");
    updated.className = "podcast-meta";
    updated.textContent = p.getLastUpdatedHuman();
    info.appendChild(updated);

    card.appendChild(info);

    // click / keyboard
    card.addEventListener("click", () => openModal(p));
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") openModal(p); });

    grid.appendChild(card);
  });
}

/**
 * Open modal populated with podcast details.
 * @param {Podcast} p
 */
function openModal(p) {
  modalInner.innerHTML = `
    <h2 id="modal-title" class="modal-title">${escapeHtml(p.title)}</h2>
    <div class="modal-top">
      <div class="modal-cover" style="background-image:url('${p.cover}')"></div>
      <div>
        <div class="section-title">Description</div>
        <p class="description">${escapeHtml(p.description)}</p>

        <div class="section-title">Genres</div>
        <div class="modal-tags">
          ${p.genres.map(g => `<span class="tag">${escapeHtml(g)}</span>`).join("")}
        </div>

        <div class="modal-updated">Last updated: ${p.getFullDate()}</div>
      </div>
    </div>

    <div class="seasons">
      <h3>Seasons</h3>
      <ul class="season-list">
        ${p.seasons.map(s => `
          <li class="season-row">
            <div class="season-meta">
              <div class="season-title">${escapeHtml(s.title)}</div>
              <div class="season-desc">${escapeHtml(s.description || "")}</div>
            </div>
            <span class="episodes-count">${s.episodes} episodes</span>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
  showModal();
}

/**
 * Show modal and set accessibility attributes.
 */
function showModal() {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  // trap focus: focus close button
  closeModalBtn.focus();
  document.addEventListener("keydown", handleEscClose);
}

/**
 * Hide modal and cleanup.
 */
function hideModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalInner.innerHTML = "";
  document.removeEventListener("keydown", handleEscClose);
}

/**
 * Handle Escape key to close modal.
 * @param {KeyboardEvent} e
 */
function handleEscClose(e) {
  if (e.key === "Escape") hideModal();
}

/**
 * Escape HTML to avoid injection in template usage.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/* =========================
   Filtering / Sorting / Search
   ========================= */

/**
 * Populate genre dropdown based on dataset.
 * @param {Podcast[]} list
 */
function populateGenres(list) {
  const set = new Set();
  list.forEach(p => p.genres.forEach(g => set.add(g)));
  const opts = ["All Genres", ...Array.from(set)];
  genreFilter.innerHTML = opts.map(g => `<option value="${g}">${g}</option>`).join("");
}

/**
 * Filter podcasts by genre.
 * @param {Podcast[]} list
 * @param {string} genre
 * @returns {Podcast[]}
 */
function filterByGenre(list, genre) {
  if (!genre || genre === "All Genres") return list.slice();
  return list.filter(p => p.genres.includes(genre));
}

/**
 * Sort podcasts according to sorting type.
 * @param {Podcast[]} list
 * @param {string} type
 * @returns {Podcast[]}
 */
function sortList(list, type) {
  const arr = list.slice();
  if (type === "Most Popular") return arr.sort((a, b) => b.popularity - a.popularity);
  if (type === "Newest") return arr.sort((a, b) => new Date(b.updated) - new Date(a.updated));
  // Recently Updated (default)
  return arr.sort((a, b) => new Date(b.updated) - new Date(a.updated));
}

/**
 * Apply search query (title or genre).
 * @param {Podcast[]} list
 * @param {string} q
 * @returns {Podcast[]}
 */
function applySearch(list, q) {
  const query = (q || "").trim().toLowerCase();
  if (!query) return list.slice();
  return list.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.genres.join(" ").toLowerCase().includes(query)
  );
}

/**
 * Update UI according to current filters and search.
 */
function updateUI() {
  const genre = genreFilter.value;
  const sortBy = sortFilter.value;
  const q = searchInput.value;

  let out = filterByGenre(SAMPLE_PODCASTS, genre);
  out = applySearch(out, q);
  out = sortList(out, sortBy);
  renderPodcasts(out);
}

/* =========================
   Event bindings
   ========================= */
closeModalBtn.addEventListener("click", hideModal);

// close when clicking backdrop
modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });

genreFilter.addEventListener("change", updateUI);
sortFilter.addEventListener("change", updateUI);
searchInput.addEventListener("input", updateUI);

// keyboard escape on document (redundant handler inside modal used too)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideModal();
});

/* =========================
   Initialization
   ========================= */

/**
 * Initialize app: populate genres, render initial list.
 */
function init() {
  populateGenres(SAMPLE_PODCASTS);
  // default sort and render
  sortFilter.value = "Recently Updated";
  renderPodcasts(sortList(SAMPLE_PODCASTS.slice(), "Recently Updated"));
}

// run
init();
