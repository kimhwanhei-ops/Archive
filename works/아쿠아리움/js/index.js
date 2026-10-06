$(function () {
  $(".top-btn").hide();

  let visualIndex = 0;
  let visualCount = $(".visual-slide").length;
  let wheelLock = false;

  function visualChange(index) {
    $(".visual-slide")
      .eq(index)
      .stop(true, true)
      .fadeIn(800)
      .siblings(".visual-slide")
      .stop(true, true)
      .fadeOut(800);

    $(".visual-dot").removeClass("on");
    $(".visual-dot").eq(index).addClass("on");
  }

  /* visual auto */

  setInterval(function () {
    visualIndex++;

    if (visualIndex >= visualCount) {
      visualIndex = 0;
    }

    visualChange(visualIndex);
  }, 3000);

  /* visual dot */

  $(".visual-dot").on("click", function () {
    visualIndex = $(this).index();

    visualChange(visualIndex);
  });

  /* search */

  $(".search-btn").on("click", function (e) {
    e.preventDefault();

    $(".menu-panel").stop(true, true).slideUp(250);
    $(".search-panel").stop(true, true).slideToggle(350);
  });

  $(".search-close").on("click", function (e) {
    e.preventDefault();

    $(".search-panel").stop(true, true).slideUp(300);
  });

  /* menu */

  $(".menu-btn").on("click", function (e) {
    e.preventDefault();

    $(".search-panel").stop(true, true).slideUp(250);
    $(".menu-panel").stop(true, true).slideToggle(350);
  });

  $(".menu-panel a").on("click", function () {
    $(".menu-panel").stop(true, true).slideUp(250);
  });

  /* con02 */

  $("#con02 li").on("mouseenter", function () {
    if ($(window).width() > 768) {
      $("#con02 li").removeClass("active dim");

      $(this).addClass("active");
      $(this).siblings().addClass("dim");
    }
  });

  $("#con02 ul").on("mouseleave", function () {
    $("#con02 li").removeClass("active dim");
  });

  /* top */

  $(".top-btn").on("click", function (e) {
    e.preventDefault();

    $("html, body").stop().animate(
      {
        scrollTop: 0,
      },
      600,
    );
  });

  /* visual button */

  $(".visual-btn").on("click", function (e) {
    e.preventDefault();

    let con01Top = $("#con01").offset().top;

    $("html, body").stop().animate(
      {
        scrollTop: con01Top,
      },
      700,
    );
  });

  /* scroll */

  $(window).on("scroll", function () {
    let sc = $(this).scrollTop();
    let wh = $(window).height();

    if (sc >= 100) {
      $("header").addClass("hide");

      if ($(".search-panel").is(":visible")) {
        $(".search-panel").stop(true, true).slideUp(200);
      }

      if ($(".menu-panel").is(":visible")) {
        $(".menu-panel").stop(true, true).slideUp(200);
      }
    } else {
      $("header").removeClass("hide");
    }

    if (sc >= 500) {
      $(".top-btn").stop(true, true).fadeIn(250);
    } else {
      $(".top-btn").stop(true, true).fadeOut(250);
    }

    $(".motion").each(function () {
      let pos = $(this).offset().top;

      if (sc >= pos - wh + 180) {
        $(this).addClass("on");
      } else {
        $(this).removeClass("on");
      }
    });
  });

  /* visual scroll
     PC에서만 실행
     태블릿 / 모바일에서는 기본 스크롤 사용 */

  $(window).on("wheel", function (e) {
    if ($(window).width() <= 1199) {
      return;
    }

    let sc = $(window).scrollTop();
    let con01Top = $("#con01").offset().top;
    let wheel = e.originalEvent.deltaY;

    if (wheelLock == true) {
      e.preventDefault();
      return;
    }

    if (wheel > 0 && sc < con01Top - 100) {
      e.preventDefault();

      wheelLock = true;

      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: con01Top,
          },
          700,
          function () {
            wheelLock = false;
          },
        );
    }

    if (wheel < 0 && sc <= con01Top + 120 && sc > 50) {
      e.preventDefault();

      wheelLock = true;

      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: 0,
          },
          700,
          function () {
            wheelLock = false;
          },
        );
    }
  });

  /* resize */

  $(window).on("resize", function () {
    if ($(window).width() <= 768) {
      $("#con02 li").removeClass("active dim");
    }
  });

  $(window).trigger("scroll");
});
