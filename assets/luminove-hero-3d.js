/* ============================================================
   LumiNove — Hero 3D (parallax + gold particles)
   Vanilla JS only, no external libraries.
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHero(root) {
    var bgLayer = root.querySelector('[data-hero-layer="bg"]');
    var glowLayer = root.querySelector('[data-hero-layer="glow"]');
    var contentLayer = root.querySelector('[data-hero-layer="content"]');
    var canvas = root.querySelector('[data-hero-particles]');

    var parallaxIntensity = parseFloat(root.dataset.parallaxIntensity) || 0;
    var particleDensity = parseInt(root.dataset.particleDensity, 10) || 0;
    var isMobile = window.matchMedia('(max-width: 749px)').matches;

    var ticking = false;
    var mouseX = 0;
    var mouseY = 0;
    var scrollTranslate = 0;

    function updateTransforms() {
      ticking = false;

      var tiltX = 0;
      var tiltY = 0;
      if (!isMobile) {
        tiltX = mouseX * 8;
        tiltY = mouseY * 8;
      }

      if (bgLayer) {
        bgLayer.style.transform =
          'translate3d(' + tiltX * 0.5 + 'px, ' + (scrollTranslate + tiltY * 0.5) + 'px, 0)';
      }
      if (glowLayer) {
        glowLayer.style.transform =
          'translate3d(' + tiltX * -0.6 + 'px, ' + (scrollTranslate * 1.4 + tiltY * -0.6) + 'px, 0)';
      }
      if (contentLayer) {
        contentLayer.style.transform = 'translate3d(' + tiltX * 0.25 + 'px, ' + tiltY * 0.25 + 'px, 0)';
      }
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateTransforms);
      }
    }

    function onScroll() {
      var rect = root.getBoundingClientRect();
      scrollTranslate = rect.top * -1 * (parallaxIntensity / 100);
      requestUpdate();
    }

    function onMouseMove(event) {
      var rect = root.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      requestUpdate();
    }

    function onMouseLeave() {
      mouseX = 0;
      mouseY = 0;
      requestUpdate();
    }

    if (!prefersReducedMotion) {
      window.addEventListener('scroll', onScroll, { passive: true });
      if (!isMobile) {
        root.addEventListener('mousemove', onMouseMove);
        root.addEventListener('mouseleave', onMouseLeave);
      }
      onScroll();

      if (canvas && particleDensity > 0) {
        initParticles(canvas, root, isMobile, particleDensity);
      }
    }
  }

  function initParticles(canvas, root, isMobile, density) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var particles = [];
    var maxParticles = isMobile ? Math.min(density, 15) : Math.min(density, 40);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var rafId = null;
    var isVisible = false;
    var isPageHidden = document.hidden;

    function resize() {
      var rect = root.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle(randomY) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 40,
        r: Math.random() * 2 + 0.6,
        speed: Math.random() * 0.35 + 0.15,
        opacity: Math.random() * 0.5 + 0.2,
        swaySpeed: Math.random() * 0.6 + 0.2,
        swayOffset: Math.random() * Math.PI * 2,
      };
    }

    function seedParticles() {
      particles = [];
      for (var i = 0; i < maxParticles; i++) {
        particles.push(createParticle(true));
      }
    }

    function draw(time) {
      rafId = null;
      if (!isVisible || isPageHidden) return;

      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        particle.y -= particle.speed;
        var sway = Math.sin((time || 0) * 0.001 * particle.swaySpeed + particle.swayOffset) * 6;

        if (particle.y < -10) {
          var fresh = createParticle(false);
          particles[i] = fresh;
          particle = fresh;
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(201, 168, 76, ' + particle.opacity + ')';
        ctx.arc(particle.x + sway, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(draw);
    }

    function start() {
      if (rafId == null) {
        rafId = window.requestAnimationFrame(draw);
      }
    }

    function stop() {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resize();
    seedParticles();

    if (window.ResizeObserver) {
      var resizeObserver = new ResizeObserver(function () {
        resize();
        seedParticles();
      });
      resizeObserver.observe(root);
    } else {
      window.addEventListener('resize', function () {
        resize();
        seedParticles();
      });
    }

    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isVisible = entry.isIntersecting;
            if (isVisible && !isPageHidden) {
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0 }
      );
      observer.observe(root);
    } else {
      isVisible = true;
      start();
    }

    document.addEventListener('visibilitychange', function () {
      isPageHidden = document.hidden;
      if (isPageHidden) {
        stop();
      } else if (isVisible) {
        start();
      }
    });
  }

  function init() {
    var heroes = document.querySelectorAll('[data-luminove-hero-3d]');
    heroes.forEach(function (hero) {
      initHero(hero);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
