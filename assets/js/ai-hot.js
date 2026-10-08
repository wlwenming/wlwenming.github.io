(function () {
  "use strict";

  function getData() {
    var latest = window.AI_HOT_LATEST || window.AI_HOT_DATA || window.__AI_HOT_DATA__;
    if (!latest) return null;
    var history = Array.isArray(window.AI_HOT_HISTORY) ? window.AI_HOT_HISTORY : [];
    return [latest].concat(history);
  }

  function validateData(data) {
    return Array.isArray(data) && data.length > 0 && data.every(function (day) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !day.overview || !Array.isArray(day.items)) return false;
      return day.items.length >= 5 && day.items.length <= 10 && day.items.every(function (item) {
        return item.topic && item.progress && Array.isArray(item.refs) && item.refs.length > 0 &&
          item.refs.every(function (ref) {
            return ref.name && /^https?:\/\/[^\s]+$/.test(ref.url);
          });
      });
    });
  }

  function byDateDesc(a, b) {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  }

  function escapeText(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function buildRefs(refs) {
    if (!refs || !refs.length) return "";
    return refs.map(function (r) {
      return '<a href="' + escapeText(r.url) + '" target="_blank" rel="noopener noreferrer">' +
        escapeText(r.name) + "</a>";
    }).join("");
  }

  function buildCard(item) {
    return '<article class="ai-hot-card-item">' +
      '<h3 class="ai-hot-card-topic">' + escapeText(item.topic) + "</h3>" +
      '<p class="ai-hot-card-progress">' + escapeText(item.progress) + "</p>" +
      '<div class="ai-hot-card-refs">' + buildRefs(item.refs) + "</div>" +
      "</article>";
  }

  function buildCardList(day) {
    if (!day.items || !day.items.length) {
      return '<p class="ai-hot-empty">当日暂无条目。</p>';
    }
    var cards = day.items.map(buildCard).join("");
    return '<div class="ai-hot-cards">' + cards + "</div>";
  }

  function updateTime(day) {
    if (!day.updated_at) return "时间未知";
    return String(day.updated_at);
  }

  function clockTime(day) {
    var match = day.updated_at && String(day.updated_at).match(/(\d{2}:\d{2}:\d{2})$/);
    return match ? match[1] : "时间未知";
  }

  function buildDayBlock(day) {
    return '<div class="ai-hot-day">' +
      '<div class="ai-hot-date">' + escapeText(updateTime(day)) + "</div>" +
      '<p class="ai-hot-overview">' + escapeText(day.overview || "") + "</p>" +
      buildCardList(day) +
      "</div>";
  }

  function buildArchiveBlock(days) {
    if (!days.length) {
      return '<p class="ai-hot-empty">暂无历史记录。</p>';
    }
    var items = days.map(function (day) {
      return '<details class="ai-hot-archive-item">' +
        '<summary>' + escapeText(updateTime(day)) + "</summary>" +
        '<p class="ai-hot-overview">' + escapeText(day.overview || "") + "</p>" +
        buildCardList(day) +
        "</details>";
    }).join("");
    return '<div class="ai-hot-archive">' + items + "</div>";
  }

  function renderApp(root, data) {
    if (!data || !data.length) {
      root.innerHTML = '<p class="ai-hot-empty">暂无热点数据。</p>';
      return;
    }
    var sorted = data.slice().sort(byDateDesc);
    var today = sorted[0];
    var rest = sorted.slice(1);

    root.innerHTML =
      '<h2 class="ai-hot-section-title">今日热点</h2>' +
      buildDayBlock(today) +
      '<h2 class="ai-hot-section-title">历史归档</h2>' +
      buildArchiveBlock(rest);
  }

  function renderSummary(root, data) {
    if (!data || !data.length) {
      root.innerHTML = '<p class="ai-hot-empty">暂无热点数据。</p>';
      return;
    }
    var sorted = data.slice().sort(byDateDesc);
    var today = sorted[0];
    var count = today.items ? today.items.length : 0;
    root.innerHTML =
      '<div class="ai-hot-summary-head">' +
        '<span class="ai-hot-summary-label">今日 AI 热点</span>' +
        '<span class="ai-hot-summary-date">' + escapeText(clockTime(today)) + "</span>" +
      "</div>" +
      '<p class="ai-hot-summary-overview">' + escapeText(today.overview || "") + "</p>" +
      '<div class="ai-hot-summary-foot">' +
        "<span>共 " + count + " 条 · 五个方向</span>" +
        '<a href="ai-hot.html" class="ai-hot-summary-link">查看全部 →</a>' +
      "</div>";
  }

  function failback(root, msg) {
    root.innerHTML = '<p class="ai-hot-empty">' + escapeText(msg) + "</p>";
  }

  function init() {
    var app = document.querySelector("[data-ai-hot-app]");
    var summary = document.querySelector("[data-ai-hot-summary]");
    if (!app && !summary) return;

    var data = getData();
    if (!data || !validateData(data)) {
      var msg = "热点数据加载失败，请稍后刷新页面再试。";
      if (app) failback(app, msg);
      if (summary) failback(summary, msg);
      if (window.console) console.warn("[ai-hot] invalid AI_HOT_DATA");
      return;
    }
    if (summary) renderSummary(summary, data);
    if (app) renderApp(app, data);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
