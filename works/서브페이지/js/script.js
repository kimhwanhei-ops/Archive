/*
  jQuery interactions for the exact screenshot-derived layout.
  Only images visible in the user-provided reference are used.
  Pages 2-4 and hidden portions of overlapping carousel images are not fabricated.
*/
(function ($) {
  "use strict";
  $(function () {
    const cards = {
      usa: {
        title: "USA · Tres Leches",
        image: "assets/individual/card_usa_tres_leches.png",
      },
      mexico: {
        title: "MEXICO · Churros",
        image: "assets/individual/card_mexico_churros.png",
      },
      brazil: {
        title: "BRAZIL · Brigadeiro",
        image: "assets/individual/card_brazil_brigadeiro.png",
      },
      chile: {
        title: "CHILE · Milhojas",
        image: "assets/individual/card_chile_milhojas.png",
      },
      layer: {
        title: "Layer Cake",
        image: "assets/individual/carousel_center_layer_cake.png",
      },
    };
    let previousFocus = null;
    let toastTimer = null;
    const $modal = $("#detailLayer");

    function openCard(key) {
      const data = cards[key];
      if (!data) return;
      previousFocus = document.activeElement;
      $("#detailTitle").text(data.title);
      $("#detailPhoto").attr({ src: data.image, alt: data.title });
      $modal.prop("hidden", false);
      $("body").addClass("modal-open");
      $(".detail-dialog").trigger("focus");
    }
    function closeCard() {
      $modal.prop("hidden", true);
      $("body").removeClass("modal-open");
      $("#detailPhoto").removeAttr("src");
      if (previousFocus && typeof previousFocus.focus === "function")
        previousFocus.focus();
    }
    function notify(message) {
      window.clearTimeout(toastTimer);
      $("#feedback").text(message).prop("hidden", false);
      toastTimer = window.setTimeout(
        () => $("#feedback").prop("hidden", true),
        2600,
      );
    }
    $('.hitbox[data-action="card"]').on("click", function () {
      openCard($(this).attr("data-card"));
    });
    $('.hitbox[data-action="layer"]').on("click", function () {
      openCard("layer");
    });
    $("[data-close-modal]").on("click", closeCard);
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && !$modal.prop("hidden")) closeCard();
      if (e.key === "Tab" && !$modal.prop("hidden")) {
        e.preventDefault();
        $(".close-detail").trigger("focus");
      }
    });
    $('[data-action="country"]').on("click", function () {
      notify(
        $(this).attr("data-country") + ": 원본 시안에 있는 국가 표시입니다.",
      );
    });
    // No page 2-4 photos exist in the supplied screenshot. Preserve page 1.
    $(
      '[data-action="page"], [data-action="page-prev"], [data-action="page-next"]',
    ).on("click", function () {
      const page = $(this).attr("data-page") || "";
      if (page === "1") return;
      notify(
        "시안에는 1페이지 사진만 있습니다. 다른 페이지의 원본 이미지가 필요합니다.",
      );
    });
    $('[data-action="gallery"]').on("click", function () {
      const slide = Number($(this).attr("data-slide"));
      if (slide === 0) {
        openCard("layer");
        return;
      }
      notify(
        "선택한 슬라이드의 전체 사진 원본은 시안에 포함되어 있지 않습니다.",
      );
    });
    $('a.hitbox[href^="#"]').on("click", function (event) {
      const selector = $(this).attr("href");
      const target = document.getElementById(selector.substring(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      history.replaceState(null, "", selector);
    });
  });
})(jQuery);
