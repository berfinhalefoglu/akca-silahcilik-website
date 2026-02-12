// Ana Sayfa Slider Başlatıcı
document.addEventListener("DOMContentLoaded", () => {
    
    // Swiper'ı başlat
    var swiper = new Swiper(".mainSwiper", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true, // Sonsuz döngü
      effect: "fade", // Geçiş efekti (slide yerine fade daha şık durur)
      fadeEffect: {
        crossFade: true
      },
      autoplay: {
        delay: 5000, // 5 saniyede bir otomatik geçiş
        disableOnInteraction: false, // Kullanıcı dokununca durmasın
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  
  });