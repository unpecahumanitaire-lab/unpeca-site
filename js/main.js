/* UNPECA — comportement du site (langue, menu, contenus modifiables, formulaire) */
(function () {
  "use strict";

  /* ---------- Langue FR / EN ---------- */
  var LANGS = ["fr", "en"];
  function getLang() {
    var l = null;
    try { l = localStorage.getItem("unpeca-lang"); } catch (e) {}
    // Français par défaut ; l'anglais seulement si le visiteur l'a choisi
    return LANGS.indexOf(l) > -1 ? l : "fr";
  }
  function setLang(l) {
    document.documentElement.setAttribute("lang", l);
    try { localStorage.setItem("unpeca-lang", l); } catch (e) {}
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === l ? "true" : "false");
    });
    document.querySelectorAll("[data-title-fr]").forEach(function () {});
    var t = document.documentElement.getAttribute("data-title-" + l);
    if (t) document.title = t;
  }
  setLang(getLang());
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.querySelector("nav.main");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Utilitaires ---------- */
  function h(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  // Texte bilingue : deux <span> dont un seul est visible
  function bi(fr, en, tag, cls) {
    var wrap = document.createDocumentFragment();
    var f = h(tag || "span", { "class": "fr" + (cls ? " " + cls : ""), text: fr || "" });
    var e = h(tag || "span", { "class": "en" + (cls ? " " + cls : ""), text: en || fr || "" });
    wrap.appendChild(f); wrap.appendChild(e);
    return wrap;
  }
  function paragraphs(text) {
    var frag = document.createDocumentFragment();
    String(text || "").split(/\n{1,}/).forEach(function (p) {
      if (p.trim()) frag.appendChild(h("p", { text: p.trim() }));
    });
    return frag;
  }
  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    // Avec un protocole (xxx:), seuls http et https sont acceptés ; sinon c'est un chemin du site
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return /^https?:\/\//i.test(u) ? u : "";
    return u;
  }
  function fmtDate(iso, lang) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    try {
      return d.toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return iso; }
  }
  function dateBi(iso) {
    var f = h("time", { "class": "fr", datetime: iso, text: fmtDate(iso, "fr") });
    var e = h("time", { "class": "en", datetime: iso, text: fmtDate(iso, "en") });
    var frag = document.createDocumentFragment(); frag.appendChild(f); frag.appendChild(e);
    return frag;
  }
  function load(name) {
    return fetch("content/" + name + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return null; });
  }
  function emptyBox(frText, enText) {
    var d = h("div", { "class": "empty" });
    d.appendChild(bi(frText, enText));
    return d;
  }
  var EMBLEM = "assets/emblem.png";

  /* ---------- Actualités ---------- */
  document.querySelectorAll("[data-news]").forEach(function (box) {
    var limit = parseInt(box.getAttribute("data-news"), 10) || 0;
    load("actualites").then(function (data) {
      var items = (data && data.items) || [];
      items.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      if (limit) items = items.slice(0, limit);
      box.textContent = "";
      if (!items.length) {
        box.appendChild(emptyBox("Aucune actualité pour le moment.", "No news yet."));
        return;
      }
      items.forEach(function (it) {
        var img = safeUrl(it.image);
        var thumb = h("div", { "class": "thumb" });
        if (img) thumb.style.backgroundImage = "url('" + img.replace(/'/g, "%27") + "')";
        else thumb.appendChild(h("img", { "class": "ph", src: EMBLEM, alt: "" }));
        var body = h("div", { "class": "body" });
        var t = h("time", {}); t.appendChild(dateBi(it.date));
        body.appendChild(t);
        var h3 = h("h3"); h3.appendChild(bi(it.title_fr, it.title_en)); body.appendChild(h3);
        var sm = h("div"); sm.appendChild(bi(it.summary_fr, it.summary_en, "p")); body.appendChild(sm);
        if (it.body_fr || it.body_en) {
          var det = h("details");
          var s = h("summary"); s.appendChild(bi("Lire la suite", "Read more")); det.appendChild(s);
          var f = h("div", { "class": "fr" }); f.appendChild(paragraphs(it.body_fr));
          var e = h("div", { "class": "en" }); e.appendChild(paragraphs(it.body_en || it.body_fr));
          det.appendChild(f); det.appendChild(e); body.appendChild(det);
        }
        var card = h("article", { "class": "card news-card" }, [thumb, body]);
        box.appendChild(card);
      });
    });
  });

  /* ---------- Galerie ---------- */
  var gal = document.querySelector("[data-gallery]");
  var vids = document.querySelector("[data-videos]");
  if (gal || vids) {
    load("galerie").then(function (data) {
      data = data || {};
      if (gal) {
        gal.textContent = "";
        var photos = data.photos || [];
        if (!photos.length) gal.appendChild(emptyBox("Les photos seront publiées prochainement.", "Photos coming soon."));
        photos.forEach(function (p) {
          var src = safeUrl(p.image); if (!src) return;
          var fig = h("figure");
          fig.appendChild(h("img", { src: src, alt: p.caption_fr || "", loading: "lazy" }));
          if (p.caption_fr || p.caption_en) {
            var cap = h("figcaption"); cap.appendChild(bi(p.caption_fr, p.caption_en)); fig.appendChild(cap);
          }
          fig.addEventListener("click", function () { openLightbox(src, p.caption_fr); });
          gal.appendChild(fig);
        });
        if (photos.length) gal.className = "gallery";
      }
      if (vids) {
        vids.textContent = "";
        var vs = data.videos || [];
        if (!vs.length) vids.appendChild(emptyBox("Les vidéos seront publiées prochainement.", "Videos coming soon."));
        vs.forEach(function (v) {
          var m = String(v.youtube_url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
          if (!m) return;
          var box = h("div", { "class": "video" });
          box.appendChild(h("iframe", {
            src: "https://www.youtube-nocookie.com/embed/" + m[1],
            title: v.title || "Vidéo UNPECA", loading: "lazy", allowfullscreen: "",
            allow: "accelerometer; encrypted-media; picture-in-picture"
          }));
          vids.appendChild(box);
        });
        if (vs.length) vids.className = "videos";
      }
    });
  }
  function openLightbox(src, alt) {
    var lb = document.querySelector(".lightbox");
    if (!lb) { lb = h("div", { "class": "lightbox", role: "dialog", "aria-modal": "true" }); document.body.appendChild(lb); lb.addEventListener("click", function () { lb.classList.remove("open"); }); }
    lb.textContent = ""; lb.appendChild(h("img", { src: src, alt: alt || "" })); lb.classList.add("open");
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { var lb = document.querySelector(".lightbox"); if (lb) lb.classList.remove("open"); }
  });

  /* ---------- Équipe ---------- */
  var team = document.querySelector("[data-team]");
  if (team) {
    load("equipe").then(function (data) {
      var items = (data && data.items) || [];
      team.textContent = "";
      items.forEach(function (p) {
        var av = h("div", { "class": "avatar" });
        var ph = safeUrl(p.photo);
        if (ph) av.style.backgroundImage = "url('" + ph.replace(/'/g, "%27") + "')";
        else av.textContent = String(p.name || "?").trim().charAt(0).toUpperCase();
        var c = h("div", { "class": "card person top", style: "--c:var(--orange)" }, [av]);
        c.appendChild(h("h3", { text: p.name || "" }));
        var role = h("div", { "class": "role" }); role.appendChild(bi(p.role_fr, p.role_en)); c.appendChild(role);
        if (p.bio_fr || p.bio_en) c.appendChild(bi(p.bio_fr, p.bio_en, "p"));
        team.appendChild(c);
      });
      if (!items.length) team.appendChild(emptyBox("L'équipe sera présentée prochainement.", "Team coming soon."));
    });
  }

  /* ---------- Partenaires ---------- */
  var partners = document.querySelector("[data-partners]");
  if (partners) {
    load("partenaires").then(function (data) {
      var items = (data && data.items) || [];
      partners.textContent = "";
      if (!items.length) { partners.className = ""; partners.appendChild(emptyBox("Les partenaires seront présentés prochainement.", "Partners coming soon.")); return; }
      items.forEach(function (p) {
        var inner;
        var logo = safeUrl(p.logo);
        if (logo) inner = h("img", { src: logo, alt: p.name || "", loading: "lazy" });
        else inner = h("span", { text: p.name || "" });
        var url = safeUrl(p.url);
        var card = h("div", { "class": "card partner" }, [url ? h("a", { href: url, target: "_blank", rel: "noopener" }, [inner]) : inner]);
        partners.appendChild(card);
      });
    });
  }

  /* ---------- Documents ---------- */
  var docs = document.querySelector("[data-docs]");
  if (docs) {
    load("documents").then(function (data) {
      var items = (data && data.items) || [];
      docs.textContent = "";
      if (!items.length) { docs.appendChild(emptyBox("Les documents seront disponibles prochainement.", "Documents will be available soon.")); return; }
      items.forEach(function (d) {
        var f = safeUrl(d.file); if (!f) return;
        var left = h("div");
        var t = h("h3"); t.appendChild(bi(d.title_fr, d.title_en)); left.appendChild(t);
        if (d.description_fr || d.description_en) left.appendChild(bi(d.description_fr, d.description_en, "p"));
        var a = h("a", { "class": "btn ghost", href: f, download: "" });
        a.appendChild(bi("Télécharger", "Download"));
        docs.appendChild(h("div", { "class": "card doc" }, [left, a]));
      });
    });
  }

  /* ---------- Projets ---------- */
  var projects = document.querySelector("[data-projects]");
  if (projects) {
    load("projets").then(function (data) {
      var items = (data && data.items) || [];
      projects.textContent = "";
      if (!items.length) { projects.className = ""; projects.appendChild(emptyBox("Les fiches projets seront publiées prochainement.", "Project pages will be published soon.")); return; }
      items.forEach(function (p) {
        var img = safeUrl(p.image);
        var thumb = h("div", { "class": "thumb" });
        if (img) thumb.style.backgroundImage = "url('" + img.replace(/'/g, "%27") + "')";
        else thumb.appendChild(h("img", { "class": "ph", src: EMBLEM, alt: "" }));
        var body = h("div", { "class": "body" });
        var t = h("h3"); t.appendChild(bi(p.title_fr, p.title_en)); body.appendChild(t);
        body.appendChild(bi(p.description_fr, p.description_en, "p"));
        projects.appendChild(h("article", { "class": "card news-card" }, [thumb, body]));
      });
    });
  }

  /* ---------- Réseaux sociaux ---------- */
  var ICONS = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.6V13h2.8v8h3.1z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zm6.5 0h3.8v1.5h.1c.5-1 1.8-1.8 3.7-1.8 3.9 0 4.6 2.5 4.6 5.8v5.5h-4v-4.9c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6v5H9.5v-11z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9zM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zm5-3.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>'
  };
  var LABELS = { facebook: "Facebook", youtube: "YouTube", linkedin: "LinkedIn", instagram: "Instagram" };
  var socials = document.querySelectorAll("[data-social]");
  if (socials.length) {
    load("reglages").then(function (cfg) {
      cfg = cfg || {};
      socials.forEach(function (box) {
        box.textContent = "";
        Object.keys(ICONS).forEach(function (k) {
          var u = safeUrl(cfg[k]);
          if (!u) return;
          var a = h("a", { href: u, target: "_blank", rel: "noopener", "aria-label": LABELS[k] });
          a.innerHTML = ICONS[k];
          box.appendChild(a);
        });
        // Aucun lien renseigné : on masque le bloc et son titre
        if (!box.children.length) {
          box.style.display = "none";
          var prev = box.previousElementSibling;
          if (prev && /^H[34]$/.test(prev.tagName)) prev.style.display = "none";
        }
      });
    });
  }

  /* ---------- Formulaire de contact ---------- */
  var form = document.querySelector("form.contact");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = form.querySelector(".form-msg");
      var lang = document.documentElement.getAttribute("lang");
      function show(cls, fr, en) { msg.className = "form-msg " + cls; msg.textContent = lang === "en" ? en : fr; }
      var fd = new FormData(form);
      if (fd.get("_gotcha")) return; // anti-spam
      var endpoint = form.getAttribute("data-endpoint") || "";
      if (!endpoint || endpoint.indexOf("VOTRE_ID") > -1) {
        // Mode de secours : ouvre le logiciel de messagerie de la personne
        var body = (fd.get("message") || "") + "\n\n— " + (fd.get("name") || "") + (fd.get("phone") ? " (" + fd.get("phone") + ")" : "") + " <" + (fd.get("email") || "") + ">";
        window.location.href = "mailto:" + form.getAttribute("data-mailto") + "?subject=" + encodeURIComponent(fd.get("subject") || "Contact depuis le site") + "&body=" + encodeURIComponent(body);
        show("ok", "Votre messagerie va s'ouvrir pour envoyer le message.", "Your email app will open to send the message.");
        return;
      }
      var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      fetch(endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          show("ok", "Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.", "Thank you! Your message was sent. We will reply shortly.");
        })
        .catch(function () {
          show("err", "L'envoi a échoué. Écrivez-nous directement par email ou WhatsApp.", "Sending failed. Please email us or use WhatsApp.");
        })
        .then(function () { btn.disabled = false; });
    });
  }
})();
