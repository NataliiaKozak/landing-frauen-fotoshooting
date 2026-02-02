(function () {
  function initGalleries() {
    if (typeof Swiper === 'undefined') return;

    var galleries = document.querySelectorAll('.gallery');
    if (!galleries.length) return;

    galleries.forEach(function (section) {
      var swiperEl = section.querySelector('.gallery-swiper');
      if (!swiperEl) return;

      var isTriple = section.classList.contains('gallery--triple');
      var isSingle = section.classList.contains('gallery--single');

      var config = {
        loop: true,
        grabCursor: true,

        // по умолчанию (мобилка): 1 фото и свайп
        slidesPerView: 1,
        spaceBetween: 16,
        centeredSlides: false,

        navigation: {
          nextEl: section.querySelector('.swiper-button-next'),
          prevEl: section.querySelector('.swiper-button-prev'),
        },
        pagination: {
          el: section.querySelector('.swiper-pagination'),
          clickable: true,
        },
      };

      if (isTriple) {
        // 1 фото на мобилке, 3 фото на десктопе (>=992)
        config.breakpoints = {
          992: {
            slidesPerView: 3,
            spaceBetween: 60,
            centeredSlides: true,
          },
        };
      }

      if (isSingle) {
        // всегда 1 фото
        config.slidesPerView = 1;
        config.spaceBetween = 0;
        config.centeredSlides = false;
      }

      new Swiper(swiperEl, config);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleries);
  } else {
    initGalleries();
  }
})();


