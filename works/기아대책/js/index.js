$(function () {
  let lastScroll = $(window).scrollTop();

  /* con02 number setting */

  $("#con02 .number strong").each(function () {
    let target = Number($(this).text());

    $(this).data("target", target);
    $(this).text("0");
  });

  /* con02 number start */

  function countStart() {
    $("#con02 .number strong").each(function () {
      let number = $(this);
      let target = number.data("target");

      let count = 0;
      let step = 0;
      let totalStep = 45;

      clearInterval(number.data("timer"));

      let timer = setInterval(function () {
        step++;

        count = Math.floor((target * step) / totalStep);

        number.text(count);

        if (step >= totalStep) {
          clearInterval(timer);

          number.text(target);
        }
      }, 30);

      number.data("timer", timer);
    });
  }

  /* con02 number reset */

  function countReset() {
    $("#con02 .number strong").each(function () {
      clearInterval($(this).data("timer"));

      $(this).text("0");
    });
  }

  /* gnb hover */

  $(".gnb").on("mouseenter", function () {
    $("header").addClass("open");

    $(".mega-menu").stop(true, true).slideDown(300);
  });

  /* header 밖으로 나가면 닫기 */

  $("header").on("mouseleave", function () {
    $(".mega-menu").stop(true, true).slideUp(250);

    $("header").removeClass("open");
  });

  /* hamburger */

  $(".menu-btn").on("click", function (e) {
    e.preventDefault();

    if ($(".mega-menu").is(":visible")) {
      $(".mega-menu").stop(true, true).slideUp(300);

      $("header").removeClass("open");
    } else {
      $("header").addClass("open");

      $(".mega-menu").stop(true, true).slideDown(300);
    }
  });

  /* visual down */

  $(".scroll-down").on("click", function (e) {
    e.preventDefault();

    let pos = $("#con01").offset().top;

    $("html, body").stop().animate(
      {
        scrollTop: pos,
      },
      700,
    );
  });

  /* con05 tab */

  $(".con05-tab li").on("click", function (e) {
    e.preventDefault();

    let num = $(this).index();

    $(".con05-tab li").removeClass("on");
    $(this).addClass("on");

    $(".con05-panel").hide();

    $(".con05-panel").eq(num).show().css("display", "flex");
  });

  /* scroll motion */

  function motionCheck() {
    let sc = $(window).scrollTop();
    let wh = $(window).height();

    $(".motion").each(function () {
      let pos = $(this).offset().top;

      if (sc >= pos - wh + 130) {
        $(this).addClass("on");
      } else {
        $(this).removeClass("on");
      }
    });
  }

  /* con02 count check */

  function countCheck() {
    let sc = $(window).scrollTop();
    let wh = $(window).height();

    let pos = $("#con02 .con02-visual").offset().top;

    if (sc >= pos - wh + 180) {
      if ($("#con02").hasClass("counted") == false) {
        $("#con02").addClass("counted");

        countStart();
      }
    } else {
      if ($("#con02").hasClass("counted")) {
        $("#con02").removeClass("counted");

        countReset();
      }
    }
  }

  /* scroll */

  $(window).on("scroll", function () {
    let sc = $(this).scrollTop();

    /* header background */

    if (sc > 80) {
      $("header").addClass("scrolled");
    } else {
      $("header").removeClass("scrolled");
    }

    /* scroll down */

    if (sc > lastScroll && sc > 80) {
      $("header").addClass("hide");

      $(".mega-menu").stop(true, true).slideUp(150);

      $("header").removeClass("open");
    }

    /* scroll up */

    if (sc < lastScroll) {
      $("header").removeClass("hide");
    }

    /* very top */

    if (sc <= 5) {
      $("header").removeClass("hide");
      $("header").removeClass("scrolled");
    }

    lastScroll = sc;

    motionCheck();
    countCheck();
  });

  /* 처음 페이지 열었을 때 체크 */

  motionCheck();
  countCheck();
});
