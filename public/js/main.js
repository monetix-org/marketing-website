/* =========================================================
   MONETIX — Animaciones JS (vanilla)
   - Lenis: scroll suave con inercia + navegación por anclas
   - IntersectionObserver: reveals, líneas enmascaradas,
     barras, filas escalonadas y contadores
   - Hero: tilt 3D de la tarjeta + parallax del fondo
   ========================================================= */

(function () {
  "use strict";

  /* ---------- CONFIG: reemplazar por los datos definitivos ----------- */
  var PORTAL_URL = "https://portal.monetix.mx";
  var WHATSAPP_URL = "https://wa.me/52XXXXXXXXXX?text=Hola%2C%20me%20interesa%20conocer%20Monetix";

  var EASE_OUT = function (t) { return 1 - Math.pow(1 - t, 4); };

  /* ---------- 1. Lenis smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    var rafLoop = function (time) {
      lenis.raf(time);
      requestAnimationFrame(rafLoop);
    };
    requestAnimationFrame(rafLoop);
  } else {
    document.documentElement.style.scrollBehavior = "smooth";
  }

  function scrollToTarget(hash) {
    var el = document.querySelector(hash);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.5, easing: EASE_OUT });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  document.querySelectorAll('a[href^="#"], [data-scroll-to]').forEach(function (el) {
    el.addEventListener("click", function (e) {
      var hash = el.getAttribute("data-scroll-to") || el.getAttribute("href");
      if (!hash || hash === "#") { e.preventDefault(); return; }
      e.preventDefault();
      scrollToTarget(hash);
    });
  });

  /* ---------- 2. Links externos (Portal / WhatsApp) ---------- */
  document.querySelectorAll("[data-portal]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.open(PORTAL_URL, "_blank", "noopener");
    });
  });
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.open(WHATSAPP_URL, "_blank", "noopener");
    });
  });

  /* ---------- 3. FAQ acordeón ---------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      document.querySelectorAll(".faq-item").forEach(function (x) {
        if (x !== item) x.classList.remove("open");
      });
      item.classList.toggle("open");
    });
  });

  /* ---------- 4. Reveals con IntersectionObserver ---------- */
  function applyDelay(el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.transitionDelay = d;
  }

  var revealEls = document.querySelectorAll(".reveal, .stagger, [data-bars]");
  revealEls.forEach(applyDelay);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  revealEls.forEach(function (el) { io.observe(el); });

  /* Los .ml-in están desplazados y recortados por su contenedor:
     hay que observar el contenedor .ml, no el span interno */
  document.querySelectorAll(".ml-in").forEach(function (inner) {
    applyDelay(inner);
    var wrap = inner.closest(".ml");
    if (wrap) io.observe(wrap);
  });

  /* ---------- 5. Contadores animados ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 2200;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var v = target * EASE_OUT(p);
      el.textContent = prefix + v.toLocaleString("es-MX", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counterIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll("[data-count]").forEach(function (el) {
    counterIO.observe(el);
  });

  /* ---------- 6. Hero: tilt 3D + parallax de fondo ---------- */
  var hero = document.querySelector(".hero");
  var tiltCard = document.getElementById("tilt-card");
  var heroMedia = document.querySelector(".hero-slides");

  if (hero && window.matchMedia("(pointer:fine)").matches) {
    var targetX = 0, targetY = 0, curX = 0, curY = 0;

    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width - 0.5;
      targetY = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener("mouseleave", function () {
      targetX = 0; targetY = 0;
    });

    (function tiltLoop() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      if (tiltCard) {
        tiltCard.style.transform =
          "rotateX(" + (-curY * 10).toFixed(2) + "deg) rotateY(" + (curX * 12).toFixed(2) + "deg)";
      }
      if (heroMedia) {
        heroMedia.style.setProperty("--px", (curX * -14).toFixed(1) + "px");
        heroMedia.style.setProperty("--py", (curY * -10).toFixed(1) + "px");
      }
      requestAnimationFrame(tiltLoop);
    })();
  }

  /* ---------- 8. Slider del hero: 3 fotos con crossfade estilo Revolut ---------- */
  var slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    var current = 0;

    function activateSlide(index) {
      current = index;
      slides.forEach(function (s, i) {
        s.classList.toggle("active", i === current);
      });
    }

    activateSlide(0);

    setInterval(function () {
      activateSlide((current + 1) % slides.length);
    }, 6000);
  }

  /* ---------- 7. Parallax del fondo del hero al hacer scroll ---------- */
  if (heroMedia) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroMedia.style.setProperty("--sy", (y * 0.18) + "px");
      }
    }, { passive: true });
  }
})();
