// ===================== GİRİŞ NOKTASI =====================
document.addEventListener("DOMContentLoaded", () => {
  loadPartials();        // header, sidebar, footer yükle
  initSidebarToggle();   // sol menü aç/kapa
  initHeaderSearch();    // ürün arama
});

// ===================== PARTIAL YÜKLEME =====================
function loadPartials() {
  // Header
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    fetch("partials/header.html")
      .then(response => response.text())
      .then(html => {
        headerContainer.innerHTML = html;
        initHeaderKategoriButton(); // ✅ Header yüklendikten sonra kategori butonunu bağla
      })
      .catch(err => console.error("Header yüklenemedi:", err));
  }

  // Sidebar
  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    fetch("partials/sidebar.html")
      .then(response => response.text())
      .then(html => {
        sidebarContainer.innerHTML = html;
      })
      .catch(err => console.error("Sidebar yüklenemedi:", err));
  }

  // Footer
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("partials/footer.html")
      .then(response => response.text())
      .then(html => {
        footerContainer.innerHTML = html;
      })
      .catch(err => console.error("Footer yüklenemedi:", err));
  }
}

// ===================== SIDEBAR AÇ / KAPA =====================
function initSidebarToggle() {
  document.addEventListener("click", function (event) {
    const button = event.target.closest(".sidebar-main");
    if (!button) return;

    const targetID = button.getAttribute("data-target");
    const submenu = document.getElementById(targetID);
    if (!submenu) return;

    submenu.classList.toggle("sidebar-sub-open");
    button.classList.toggle("sidebar-main-open"); // ok işareti için
  });
}

// ===================== HEADER KATEGORİ BUTONU =====================
function initHeaderKategoriButton() {
  const kategoriBtn = document.getElementById("kategori-btn");
  if (kategoriBtn) {
    kategoriBtn.addEventListener("click", () => {
      window.location.href = "kategoriler.html";
    });
  }

  // 🔒 Eski dropdown menüsünü tamamen kaldır
  const dropdowns = document.querySelectorAll(".nav-dropdown, .nav-dropdown-toggle");
  dropdowns.forEach(el => el.remove());
}

// ===================== HEADER ÜRÜN ARAMA =====================
function initHeaderSearch() {
  const MAX_RESULTS = 6;

  // Arama veritabanı (örnek)
  if (typeof PRODUCT_INDEX === "undefined") {
    window.PRODUCT_INDEX = [
      { name: "Havalı Tabanca", category: "Havalı Silahlar", link: "kategoriler.html", tags: "tabanca", external: false },
      { name: "Airsoft Silah", category: "Airsoft", link: "kategoriler.html", tags: "airsoft tüfek", external: false },
      { name: "Dürbün", category: "Optik", link: "kategoriler.html", tags: "optik dürbün", external: false },
      { name: "PCP Tüfek", category: "Tüfekler", link: "kategoriler.html", tags: "pcp", external: false }
    ];
  }

  function getSearchElements() {
    const form = document.getElementById("product-search-form");
    const input = document.getElementById("product-search-input");
    const results = document.getElementById("search-results");
    return { form, input, results };
  }

  // Yazdıkça filtrele
  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!target.closest || !target.closest("#product-search-form")) return;

    const { input, results } = getSearchElements();
    if (!input || !results) return;

    const query = input.value.trim().toLowerCase();
    if (!query) {
      results.innerHTML = "";
      results.classList.remove("open");
      return;
    }

    const matches = PRODUCT_INDEX.filter((p) => {
      const haystack = (p.name + " " + p.category + " " + (p.tags || "")).toLowerCase();
      return haystack.includes(query);
    }).slice(0, MAX_RESULTS);

    if (!matches.length) {
      results.innerHTML = `<div class="search-empty">Sonuç bulunamadı</div>`;
      results.classList.add("open");
      return;
    }

    results.innerHTML = matches.map((p) => {
      const safeLink = p.link.replace(/"/g, "&quot;");
      return `
        <button
          type="button"
          class="search-result-item"
          data-link="${safeLink}"
          data-external="${p.external ? "1" : "0"}"
        >
          <span class="title">${p.name}</span>
          <span class="meta">${p.category}</span>
        </button>
      `;
    }).join("");

    results.classList.add("open");
  });

  // Sonuçlara tıklama + dışarı tıklayınca kapatma
  document.addEventListener("click", (event) => {
    const { results } = getSearchElements();
    if (!results) return;

    const item = event.target.closest(".search-result-item");
    if (item && results.contains(item)) {
      const link = item.getAttribute("data-link");
      const external = item.getAttribute("data-external") === "1";
      if (link) {
        if (external) {
          window.open(link, "_blank");
        } else {
          window.location.href = link;
        }
      }
      results.classList.remove("open");
      return;
    }

    // Formun dışına tıklandıysa dropdown'u kapat
    if (!event.target.closest("#product-search-form")) {
      results.classList.remove("open");
    }
  });

  // Enter'a basıldığında en iyi sonucu aç
  document.addEventListener("submit", (event) => {
    const form = event.target.closest && event.target.closest("#product-search-form");
    if (!form) return;

    event.preventDefault();
    const { input } = getSearchElements();
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    if (!query) return;

    const match = PRODUCT_INDEX.find((p) => {
      const haystack = (p.name + " " + p.category + " " + (p.tags || "")).toLowerCase();
      return haystack.includes(query);
    });

    if (match && match.link) {
      if (match.external) {
        window.open(match.link, "_blank");
      } else {
        window.location.href = match.link;
      }
    }
  });
}
