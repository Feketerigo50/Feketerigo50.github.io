(function () {
  "use strict";

  var STORAGE_KEY = "site-mode";
  var DEFAULT_MODE = "life";

  var profile = null;
  var work = null;
  var life = null;
  var history = null;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function getModeFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var mode = params.get("mode");
    return mode === "work" || mode === "life" ? mode : null;
  }

  function setMode(mode, persist) {
    document.body.setAttribute("data-mode", mode);
    document.querySelectorAll(".mode-toggle button").forEach(function (btn) {
      var isActive = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    if (persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (e) {}
    }
    document.title =
      mode === "work"
        ? "Evan Tung · Professional"
        : "若林的家 · Evan Tung";
    initTwitchEmbed();
  }

  function initModeToggle() {
    var initial = getModeFromUrl();
    if (!initial) {
      try {
        initial = localStorage.getItem(STORAGE_KEY);
      } catch (e) {}
    }
    if (initial !== "work" && initial !== "life") {
      initial = DEFAULT_MODE;
    }
    setMode(initial, false);

    document.querySelectorAll(".mode-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.getAttribute("data-mode"));
      });
    });
  }

  function fetchJson(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to load " + path);
      }
      return res.json();
    });
  }

  function renderHero() {
    document.getElementById("hero-name").textContent = profile.name;
    document.getElementById("hero-name-en").textContent = profile.nameEn;
    document.getElementById("hero-avatar").src = profile.avatar;
    document.getElementById("hero-avatar").alt = profile.name;

    document.getElementById("work-tagline").textContent = work.tagline;
    document.getElementById("life-tagline").textContent = life.tagline;
    document.getElementById("life-quote").textContent = life.quote;
  }

  function renderWorkAbout() {
    document.getElementById("work-about").textContent = work.about;
  }

  function renderSkills() {
    var skillsEl = document.getElementById("work-skill-tags");
    var coursesEl = document.getElementById("work-courses");
    skillsEl.innerHTML = work.skills
      .map(function (s) {
        return "<span>" + escapeHtml(s) + "</span>";
      })
      .join("");
    coursesEl.innerHTML = work.courses
      .map(function (c) {
        return "<li>" + escapeHtml(c) + "</li>";
      })
      .join("");
  }

  function renderExperience() {
    var container = document.getElementById("work-experience-list");
    container.innerHTML = work.experience
      .map(function (item) {
        var bullets = item.highlights
          .map(function (h) {
            return "<li>" + escapeHtml(h) + "</li>";
          })
          .join("");
        return (
          '<article class="card">' +
          "<h3>" +
          escapeHtml(item.title) +
          "</h3>" +
          '<p class="meta">' +
          escapeHtml(item.period) +
          " · " +
          escapeHtml(item.role) +
          "</p>" +
          "<ul>" +
          bullets +
          "</ul>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderEducation() {
    var container = document.getElementById("work-education");
    container.innerHTML = work.education
      .map(function (item) {
        return (
          '<article class="card">' +
          "<h3>" +
          escapeHtml(item.school) +
          "</h3>" +
          '<p class="meta">' +
          escapeHtml(item.period) +
          "</p>" +
          "<p>" +
          escapeHtml(item.degree) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderResearch() {
    var r = work.research;
    var highlights = r.highlights
      .map(function (h) {
        return "<li>" + escapeHtml(h) + "</li>";
      })
      .join("");
    document.getElementById("work-research").innerHTML =
      "<h3>" +
      escapeHtml(r.title) +
      "</h3>" +
      '<p class="meta">' +
      escapeHtml(r.journal) +
      "</p>" +
      "<ul>" +
      highlights +
      "</ul>";
  }

  function renderProjects() {
    var container = document.getElementById("work-projects");
    container.innerHTML = work.projects
      .map(function (item) {
        return (
          '<article class="card">' +
          "<h3>" +
          escapeHtml(item.title) +
          "</h3>" +
          '<p class="meta">' +
          escapeHtml(item.stack) +
          "</p>" +
          "<p>" +
          escapeHtml(item.description) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderLeadership() {
    var container = document.getElementById("work-leadership");
    container.innerHTML =
      "<ul>" +
      work.leadership
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("") +
      "</ul>";
  }

  function renderWorkContact() {
    var phone = work.contact.phone;
    var phoneHtml = phone
      ? escapeHtml(phone)
      : '<span class="placeholder">（待填寫）</span>';
    document.getElementById("work-contact-body").innerHTML =
      "<dl>" +
      "<dt>Email</dt>" +
      "<dd><a href=\"mailto:" +
      escapeHtml(profile.email) +
      "\">" +
      escapeHtml(profile.email) +
      "</a></dd>" +
      "<dt>Phone</dt>" +
      "<dd>" +
      phoneHtml +
      "</dd>" +
      "</dl>" +
      '<div class="link-row">' +
      '<a class="btn btn-primary" href="' +
      escapeHtml(profile.cvPath) +
      '" download>Download CV</a>' +
      '<a class="btn btn-outline" href="' +
      escapeHtml(profile.links.github) +
      '" target="_blank" rel="noopener">GitHub</a>' +
      '<a class="btn btn-outline" href="' +
      escapeHtml(profile.links.linkedin) +
      '" target="_blank" rel="noopener">LinkedIn</a>' +
      "</div>";
  }

  function renderLifeAbout() {
    var a = life.about;
    document.getElementById("life-about-table").innerHTML =
      "<tbody>" +
      row("綽號", a.nickname) +
      row("生日", a.birthday) +
      row("星座", a.zodiac) +
      row("興趣", a.interests) +
      "</tbody>";
    document.getElementById("life-summary").textContent = a.summary;

    document.getElementById("life-highlights").innerHTML = life.highlights
      .map(function (item) {
        return (
          '<article class="card">' +
          "<h3>" +
          escapeHtml(item.label) +
          "</h3>" +
          "<p>" +
          escapeHtml(item.text) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function row(label, value) {
    return (
      "<tr><th>" +
      escapeHtml(label) +
      "</th><td>" +
      escapeHtml(value) +
      "</td></tr>"
    );
  }

  function renderLifeVideo() {
    var iframe = document.getElementById("life-youtube");
    iframe.src =
      "https://www.youtube.com/embed/" +
      encodeURIComponent(life.featuredVideoId);
    iframe.title = "Featured YouTube video";

    document.getElementById("life-youtube-link").href = profile.links.youtube;
  }

  function renderLifeStreaming() {
    document.getElementById("life-twitch-link").href = profile.links.twitch;
    initTwitchEmbed();
  }

  function getTwitchParent() {
    var host = window.location.hostname;
    if (!host || host === "localhost" || host === "127.0.0.1") {
      return "localhost";
    }
    return host;
  }

  function initTwitchEmbed() {
    var container = document.getElementById("twitch-embed");
    if (!container || !life) {
      return;
    }
    if (document.body.getAttribute("data-mode") !== "life") {
      container.innerHTML = "";
      return;
    }
    var parent = getTwitchParent();
    container.innerHTML =
      '<iframe src="https://player.twitch.tv/?channel=' +
      encodeURIComponent(life.twitchChannel) +
      "&parent=" +
      encodeURIComponent(parent) +
      '" height="480" width="100%" allowfullscreen></iframe>';
  }

  function renderTimeline() {
    var container = document.getElementById("life-timeline-list");
    container.innerHTML = history
      .map(function (item) {
        return (
          '<article class="timeline-item">' +
          "<h3>" +
          escapeHtml(item.title) +
          "</h3>" +
          "<p>" +
          escapeHtml(item.description) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderLifeContact() {
    document.getElementById("life-contact-body").innerHTML =
      "<dl>" +
      "<dt>Email</dt>" +
      "<dd><a href=\"mailto:" +
      escapeHtml(profile.email) +
      "\">" +
      escapeHtml(profile.email) +
      "</a></dd>" +
      "<dt>Instagram</dt>" +
      "<dd><a href=\"" +
      escapeHtml(profile.links.instagram) +
      "\" target=\"_blank\" rel=\"noopener\">@feketerigo0729</a></dd>" +
      "<dt>Line</dt>" +
      "<dd>" +
      escapeHtml(life.contactNote) +
      "</dd>" +
      "</dl>" +
      '<div class="link-row">' +
      '<a class="btn btn-primary" href="' +
      escapeHtml(profile.links.twitch) +
      '" target="_blank" rel="noopener">Twitch</a>' +
      '<a class="btn btn-outline" href="' +
      escapeHtml(profile.links.youtube) +
      '" target="_blank" rel="noopener">YouTube</a>' +
      '<a class="btn btn-outline" href="' +
      escapeHtml(profile.links.instagram) +
      '" target="_blank" rel="noopener">Instagram</a>' +
      "</div>";
  }

  function renderFooter() {
    document.getElementById("footer-year").textContent =
      new Date().getFullYear();
    document.getElementById("footer-github").href = profile.links.github;
    document.getElementById("footer-email").href =
      "mailto:" + profile.email;
  }

  function renderAll() {
    renderHero();
    renderWorkAbout();
    renderSkills();
    renderExperience();
    renderEducation();
    renderResearch();
    renderProjects();
    renderLeadership();
    renderWorkContact();
    renderLifeAbout();
    renderLifeVideo();
    renderLifeStreaming();
    renderTimeline();
    renderLifeContact();
    renderFooter();
  }

  function init() {
    initModeToggle();
    Promise.all([
      fetchJson("assets/data/profile.json"),
      fetchJson("assets/data/work.json"),
      fetchJson("assets/data/life.json"),
      fetchJson("assets/data/history.json"),
    ])
      .then(function (results) {
        profile = results[0];
        work = results[1];
        life = results[2];
        history = results[3];
        renderAll();
      })
      .catch(function (err) {
        console.error(err);
        document.body.insertAdjacentHTML(
          "beforeend",
          '<p style="padding:2rem;text-align:center;color:#b91c1c;">無法載入網站資料，請確認以 HTTP 伺服器開啟（GitHub Pages 或本地 server）。</p>'
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
