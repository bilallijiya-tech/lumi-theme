/* ============================================================
   LumiNove — Auto-Inject Trust Badges (Insignias de Confianza)
   ------------------------------------------------------------
   Injecte le bandeau de confiance sous les infos produit,
   SANS toucher au product.json (sûr, non destructif).
   Chargé via theme.liquid. Marché : Espagne (textes ES).
   ============================================================ */
(function () {
  'use strict';

  // N'agir que sur les pages produit
  if (!/\/products\//.test(window.location.pathname)) return;

  var BADGES = [
    { t: 'Envío Gratis',     s: 'En toda España' },
    { t: 'Pago Seguro',      s: 'Cifrado SSL',      shield: true },
    { t: 'Garantía 30 Días', s: 'Devolución fácil', home: true },
    { t: 'Atención 24/7',    s: 'Estamos aquí',     chat: true }
  ];

  function icon(b) {
    var open = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
    if (b.shield) return open + '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>';
    if (b.home)   return open + '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>';
    if (b.chat)   return open + '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
    return open + '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
  }

  function build() {
    if (document.querySelector('.luminove-trust')) return; // évite les doublons

    var wrap = document.createElement('div');
    wrap.className = 'luminove-trust';
    var html = '<div class="luminove-trust__grid">';
    BADGES.forEach(function (b) {
      html += '<div class="luminove-trust__item">' +
                '<span class="luminove-trust__icon">' + icon(b) + '</span>' +
                '<span class="luminove-trust__title">' + b.t + '</span>' +
                '<span class="luminove-trust__text">' + b.s + '</span>' +
              '</div>';
    });
    html += '</div>';
    wrap.innerHTML = html;

    // Cible : sous les boutons d'achat ou la zone détails produit
    var target = document.querySelector('buy-buttons, .product-form__buttons, [class*="product-details"], [class*="product-information"]');
    if (target) {
      target.parentNode.insertBefore(wrap, target.nextSibling);
    } else {
      var h1 = document.querySelector('h1');
      if (h1 && h1.parentNode) h1.parentNode.appendChild(wrap);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
