const JSON_URL = "https://xcxtgl-8080.csb.app";

// Hàm hiển thị loader
function showLoader() {
  const loader = document.querySelector(".cssload-main");
  if (loader) {
    loader.style.display = "block";
    document.body.classList.add("loading");
  }
}

// Hàm ẩn loader với thời gian tối thiểu 1 giây
function hideLoader() {
  const loader = document.querySelector(".cssload-main");
  setTimeout(() => {
    if (loader) {
      loader.style.display = "none";
      document.body.classList.remove("loading");
    }
  }, 1000); // Tối thiểu 1 giây
}

// Hàm lấy danh sách sản phẩm từ API
async function getProducts() {
  showLoader();
  try {
    const response = await fetch(`${JSON_URL}/products`);
    const products = await response.json();
    hideLoader();
    return products;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    hideLoader();
    return [];
  }
}

// Hàm render sản phẩm vào container .sanPham
async function renderProducts() {
  const productContainer = document.querySelector(".sanPham");
  if (!productContainer) {
    console.error("Không tìm thấy container .sanPham");
    return; // Nếu không tìm thấy container, thoát
  }

  const products = await getProducts();
  productContainer.innerHTML = ""; // Xóa nội dung cũ

  if (products.length === 0) {
    productContainer.innerHTML = "<p>Không có sản phẩm nào để hiển thị.</p>";
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "card";
    productCard.innerHTML = `
      <div class="card-img">
        <a href="${product.link}">
          <img src="${product.image}" alt="${product.name}" width="auto" />
        </a>
      </div>
      <div class="card-info">
        <p class="text-body">${product.name}</p>
      </div>
      <div class="card-footer">
        <span class="text-title">₫${product.price.toLocaleString("vi-VN")}</span>
        <div class="card-button">
          <button
            class="themVaoGio"
            data-name="${product.name}"
            data-price="₫${product.price.toLocaleString("vi-VN")}"
            data-image="${product.image}"
          >
            <i class="fa-solid fa-cart-shopping svgIcon"></i>
          </button>
        </div>
      </div>
    `;
    productContainer.appendChild(productCard);
  });
}

// Khởi chạy khi trang được tải
document.addEventListener("DOMContentLoaded", async function () {
  await renderProducts();
});