const container = document.querySelector(".BoxMoTa");
      const prevBtn = document.getElementById("prevBtn");
      const nextBtn = document.getElementById("nextBtn");
      const content = document.querySelector(".anhSanPham");
      const iframe = document.querySelector(".iframe");
      const iframeOverlay = document.querySelector(".iframe-overlay");
      const imagesContainer = document.querySelector(".images");
      const items = [iframe, ...document.querySelectorAll(".images img")];
      const totalItems = items.length; // Tổng số phần tử: 1 iframe + số ảnh
      const numberOfImages = totalItems - 1; // Số lượng ảnh (không tính iframe)
      const maxDisplayIndex = numberOfImages - 1; // Hiển thị đến ảnh thứ (n-1)
      let currentIndex = 0;
      let isDragging = false;
      let startX = 0;
      let currentTranslateX = 0;
      let prevTranslateX = 0;

      // Lấy chiều rộng động của .BoxMoTa
      function getContainerWidth() {
        return container.getBoundingClientRect().width;
      }

      // Cập nhật chiều rộng và chiều cao của iframe và ảnh dựa trên .BoxMoTa
      function updateDimensions() {
        const containerWidth = getContainerWidth();
        const containerHeight = container.getBoundingClientRect().height;

        // Cập nhật chiều rộng và chiều cao cho iframe
        iframe.style.width = `${containerWidth}px`;
        iframe.style.height = `${containerHeight}px`;

        // Cập nhật chiều rộng và chiều cao cho các ảnh
        document.querySelectorAll(".images img").forEach((img) => {
          img.style.width = `${containerWidth}px`;
          img.style.height = `${containerHeight}px`;
        });
      }

      function updatePosition() {
        const containerWidth = getContainerWidth();
        const offset = -currentIndex * containerWidth; // Dùng chiều rộng động
        content.style.transform = `translateX(${offset}px)`;
        updateButtons();
        toggleVisibility();
      }

      function updateButtons() {
        prevBtn.classList.toggle("hidden", currentIndex === 0);
        nextBtn.classList.toggle("hidden", currentIndex === maxDisplayIndex);
      }

      function toggleVisibility() {
        if (currentIndex === 0) {
          iframe.style.display = "block";
          imagesContainer.style.display = "none";
        } else {
          iframe.style.display = "none";
          imagesContainer.style.display = "flex";
        }
      }

      function handleDragEnd() {
        isDragging = false;
        content.style.transition = "transform 0.3s ease";
        const containerWidth = getContainerWidth();
        const threshold = 0.4 * containerWidth; // Ngưỡng 40% dựa trên chiều rộng động
        const movedDistance = currentTranslateX - prevTranslateX;

        if (Math.abs(movedDistance) > threshold) {
          if (movedDistance > 0 && currentIndex > 0) {
            currentIndex--; // Kéo sang trái (xem nội dung bên trái)
          } else if (movedDistance < 0 && currentIndex < maxDisplayIndex) {
            currentIndex++; // Kéo sang phải (xem nội dung bên phải)
          }
        }

        // Đảm bảo không vượt quá giới hạn
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxDisplayIndex) currentIndex = maxDisplayIndex;

        updatePosition();
      }

      // Mouse events
      container.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Ngăn hành vi mặc định
        isDragging = true;
        startX = e.pageX;
        const containerWidth = getContainerWidth();
        prevTranslateX = currentIndex * -containerWidth;
        currentTranslateX = prevTranslateX;
        content.style.transition = "none";
      });

      container.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const moveX = e.pageX - startX;
        currentTranslateX = prevTranslateX + moveX;
        content.style.transform = `translateX(${currentTranslateX}px)`;
      });

      container.addEventListener("mouseup", handleDragEnd);
      container.addEventListener("mouseleave", () => {
        if (isDragging) handleDragEnd();
      });

      // Touch events for mobile
      container.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Ngăn hành vi mặc định trên mobile
        isDragging = true;
        startX = e.touches[0].pageX;
        const containerWidth = getContainerWidth();
        prevTranslateX = currentIndex * -containerWidth;
        currentTranslateX = prevTranslateX;
        content.style.transition = "none";
      });

      container.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const moveX = e.touches[0].pageX - startX;
        currentTranslateX = prevTranslateX + moveX;
        content.style.transform = `translateX(${currentTranslateX}px)`;
      });

      container.addEventListener("touchend", handleDragEnd);

      // Button events
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updatePosition();
        }
      });

      nextBtn.addEventListener("click", () => {
        if (currentIndex < maxDisplayIndex) {
          currentIndex++;
          updatePosition();
        }
      });

      // Cập nhật kích thước khi tải trang và khi cửa sổ thay đổi kích thước
      window.addEventListener("resize", () => {
        updateDimensions();
        updatePosition();
      });

      // Khởi tạo
      updateDimensions();
      updatePosition();