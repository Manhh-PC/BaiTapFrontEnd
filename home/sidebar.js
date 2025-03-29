let currentBanner = 3; // Bắt đầu từ banner thực đầu tiên (vị trí 3 vì có 3 clone phía trước)
const bannerWrapper = document.querySelector(".banner-wrapper");
const container = document.querySelector(".container-banner");
const totalBanners = document.querySelectorAll(".banner").length; // Tổng số banner (7: 4 thực + 3 clone)
const realBanners = 4; // Số banner thực
const cloneCount = 3; // Số banner clone
let autoSlideInterval;
let isDragging = false;
let startX, currentTranslate, prevTranslate;

// Cập nhật vị trí banner
function updateBannerPosition(transition = true) {
  if (!transition) {
    bannerWrapper.style.transition = "none";
  } else {
    bannerWrapper.style.transition = "transform 0.8s ease-in-out";
  }
  bannerWrapper.style.transform = `translateX(${-currentBanner * (100 / totalBanners)}%)`;
}

// Tự động chuyển slide
function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(nextBanner, 3000); // 3 giây 1 slide
}

// Chuyển đến banner tiếp theo
function nextBanner() {
  currentBanner++;
  updateBannerPosition();

  // Nếu đến banner clone cuối cùng, nhảy về banner thực đầu tiên
  if (currentBanner === totalBanners - cloneCount) {
    setTimeout(() => {
      currentBanner = cloneCount;
      updateBannerPosition(false);
    }, 800);
  }
}

// Chuyển đến banner trước đó
function prevBanner() {
  currentBanner--;
  updateBannerPosition();

  // Nếu đến banner clone đầu tiên, nhảy về banner thực cuối cùng
  if (currentBanner === cloneCount - 1) {
    setTimeout(() => {
      currentBanner = totalBanners - cloneCount - 1;
      updateBannerPosition(false);
    }, 800);
  }
}

// Xử lý sự kiện bắt đầu kéo (chuột hoặc cảm ứng)
function startDrag(e) {
  isDragging = true;
  startX = e.type.includes("touch") ? e.touches[0].pageX : e.pageX;
  prevTranslate = -currentBanner * (100 / totalBanners);
  bannerWrapper.style.transition = "none";
  clearInterval(autoSlideInterval);
}

// Xử lý sự kiện kéo (chuột hoặc cảm ứng)
function drag(e) {
  if (!isDragging) return;
  const currentX = e.type.includes("touch") ? e.touches[0].pageX : e.pageX;
  const deltaX = currentX - startX;
  currentTranslate = prevTranslate + (deltaX / container.offsetWidth) * (100 / totalBanners);

  // Giới hạn kéo để tránh kéo quá xa
  const maxTranslate = -(totalBanners - 1) * (100 / totalBanners);
  const minTranslate = 0;
  currentTranslate = Math.min(Math.max(currentTranslate, maxTranslate), minTranslate);

  bannerWrapper.style.transform = `translateX(${currentTranslate}%)`;
}

// Xử lý sự kiện kết thúc kéo (chuột hoặc cảm ứng)
function endDrag(e) {
  if (!isDragging) return;
  isDragging = false;

  // Tính khoảng cách kéo
  const endX = e.type.includes("touch") ? e.changedTouches[0].pageX : e.pageX;
  const deltaX = endX - startX;
  const movePercent = (deltaX / container.offsetWidth) * (100 / totalBanners);

  // Kiểm tra ngưỡng kéo (4% của tổng chiều rộng)
  if (Math.abs(movePercent) > 4) {
    if (movePercent < 0) {
      // Kéo sang trái (next)
      currentBanner++;
    } else {
      // Kéo sang phải (prev)
      currentBanner--;
    }
  }

  // Xử lý vòng lặp
  if (currentBanner >= totalBanners - cloneCount) {
    // Nếu kéo đến banner clone cuối cùng, nhảy về banner thực đầu tiên
    setTimeout(() => {
      currentBanner = cloneCount;
      updateBannerPosition(false);
    }, 800);
  } else if (currentBanner <= cloneCount - 1) {
    // Nếu kéo đến banner clone đầu tiên, nhảy về banner thực cuối cùng
    setTimeout(() => {
      currentBanner = totalBanners - cloneCount - 1;
      updateBannerPosition(false);
    }, 800);
  }

  updateBannerPosition();
  startAutoSlide();
}

// Sự kiện chuột
container.addEventListener("mousedown", startDrag);
container.addEventListener("mousemove", drag);
container.addEventListener("mouseup", endDrag);
container.addEventListener("mouseleave", endDrag);

// Sự kiện cảm ứng
container.addEventListener("touchstart", startDrag);
container.addEventListener("touchmove", drag);
container.addEventListener("touchend", endDrag);

// Sự kiện nút điều hướng
document.getElementById("right-banner").addEventListener("click", () => {
  nextBanner();
  startAutoSlide();
});

document.getElementById("left-banner").addEventListener("click", () => {
  prevBanner();
  startAutoSlide();
});

// Khởi động slideshow
updateBannerPosition();
startAutoSlide();