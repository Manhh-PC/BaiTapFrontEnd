const API_URL = "https://xcxtgl-8080.csb.app";

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

// Hàm đồng bộ giỏ hàng lên API
async function syncCartToAPI(cart) {
  showLoader();
  try {
    let response = await fetch(`${API_URL}/currentUser`);
    let currentUser = await response.json();

    if (currentUser && currentUser.id) {
      currentUser.cart = cart;
      await fetch(`${API_URL}/currentUser`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });

      await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ giỏ hàng lên API:", error);
  } finally {
    hideLoader();
  }
}

// Hàm đồng bộ đơn hàng lên API
async function syncOrdersToAPI(userId, orders) {
  showLoader();
  try {
    let response = await fetch(`${API_URL}/users/${userId}`);
    let user = await response.json();

    if (user && user.id) {
      user.orders = orders;
      await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      // Cập nhật currentUser nếu userId trùng với currentUser
      let currentUserResponse = await fetch(`${API_URL}/currentUser`);
      let currentUser = await currentUserResponse.json();
      if (currentUser.id === userId) {
        currentUser.orders = orders;
        await fetch(`${API_URL}/currentUser`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentUser),
        });
      }
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ đơn hàng lên API:", error);
  } finally {
    hideLoader();
  }
}

// Hàm đồng bộ thông tin địa chỉ lên API
async function syncAddressToAPI(userId, addressInfo) {
  showLoader();
  try {
    let response = await fetch(`${API_URL}/users/${userId}`);
    let user = await response.json();

    if (user && user.id) {
      user.addressInfo = addressInfo;
      await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      // Cập nhật currentUser nếu userId trùng với currentUser
      let currentUserResponse = await fetch(`${API_URL}/currentUser`);
      let currentUser = await currentUserResponse.json();
      if (currentUser.id === userId) {
        currentUser.addressInfo = addressInfo;
        await fetch(`${API_URL}/currentUser`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentUser),
        });
      }
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ thông tin địa chỉ lên API:", error);
  } finally {
    hideLoader();
  }
}

// Hàm lấy giỏ hàng từ API hoặc localStorage
async function getCart() {
  showLoader();
  try {
    let localCart = JSON.parse(localStorage.getItem("cart")) || [];
    let response = await fetch(`${API_URL}/currentUser`);
    let currentUser = await response.json();

    if (currentUser && currentUser.id && currentUser.cart) {
      let apiCart = [...currentUser.cart];
      let mergedCart = [];

      apiCart.forEach((apiItem) => {
        let localItem = localCart.find((item) => item.id === apiItem.id);
        if (localItem) {
          mergedCart.push({ ...apiItem, quantity: localItem.quantity });
        } else {
          mergedCart.push(apiItem);
        }
      });

      localCart.forEach((localItem) => {
        if (!mergedCart.find((item) => item.id === localItem.id)) {
          mergedCart.push(localItem);
        }
      });

      localStorage.setItem("cart", JSON.stringify(mergedCart));
      await syncCartToAPI(mergedCart);
      hideLoader();
      return mergedCart;
    }

    hideLoader();
    return localCart;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    hideLoader();
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
}

// Hàm lấy đơn hàng từ API
async function getOrders(userId) {
  showLoader();
  try {
    let response = await fetch(`${API_URL}/users/${userId}`);
    let user = await response.json();

    if (user && user.id && user.orders) {
      hideLoader();
      return user.orders;
    }

    hideLoader();
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    hideLoader();
    return [];
  }
}

// Hàm lấy thông tin địa chỉ từ API
async function getAddressInfo(userId) {
  showLoader();
  try {
    let response = await fetch(`${API_URL}/users/${userId}`);
    let user = await response.json();

    if (user && user.id && user.addressInfo) {
      hideLoader();
      return user.addressInfo;
    }

    hideLoader();
    return null;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin địa chỉ:", error);
    hideLoader();
    return null;
  }
}

// Hàm lấy dữ liệu địa chỉ từ file JSON
async function getLocationData() {
  try {
    const response = await fetch("/checkout/diaGioiHanhChinhVN.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu địa chỉ từ JSON:", error);
    return null;
  }
}

// Hàm tìm tên địa chỉ từ ID
function findLocationName(locations, id, level) {
  if (!locations) return id; // Trả về ID nếu không tìm thấy

  if (level === "city") {
    const city = locations.find((loc) => loc.Id === id);
    return city ? city.Name : id;
  } else if (level === "district") {
    for (const city of locations) {
      const district = city.Districts.find((dist) => dist.Id === id);
      if (district) return district.Name;
    }
  } else if (level === "ward") {
    for (const city of locations) {
      for (const district of city.Districts) {
        const ward = district.Wards.find((w) => w.Id === id);
        if (ward) return ward.Name;
      }
    }
  }
  return id; // Trả về ID nếu không tìm thấy
}

// Hàm lấy tất cả người dùng từ API
async function getAllUsers() {
  showLoader();
  try {
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();
    hideLoader();
    return users;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    hideLoader();
    return [];
  }
}

// Hàm định dạng thời gian từ ISO string theo định dạng của thiết bị
function formatOrderDate(isoDateString) {
  const date = new Date(isoDateString);
  return {
    hours: date.getHours().toString().padStart(2, "0"),
    minutes: date.getMinutes().toString().padStart(2, "0"),
    day: date.getDate().toString().padStart(2, "0"),
    month: (date.getMonth() + 1).toString().padStart(2, "0"), // Tháng bắt đầu từ 0
    year: date.getFullYear(),
  };
}

// Hàm kiểm tra trạng thái đăng nhập
async function checkLoginStatus() {
  try {
    let response = await fetch(`${API_URL}/currentUser`);
    let currentUser = await response.json();
    return currentUser && currentUser.id; // Trả về true nếu đã đăng nhập, false nếu chưa
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
    return false;
  }
}

// Cập nhật thông báo giỏ hàng
window.updateCartNotification = async function () {
  let cart = await getCart();
  let totalProducts = cart.length;
  let notificationIcon = document.querySelector(".notification");
  if (notificationIcon) {
    notificationIcon.setAttribute("data-count", totalProducts);
  } else {
    console.log("Không tìm thấy .notification");
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  // Xử lý tăng giảm số lượng trên trang sản phẩm
  const quantityInput = document.querySelector(".quantity-input");
  const reduceButton = document.querySelector(".button-reduce");
  const increaseButton = document.querySelector(".button-increase");

  if (quantityInput && reduceButton && increaseButton) {
    reduceButton.addEventListener("click", function () {
      let currentQuantity = parseInt(quantityInput.value) || 1;
      currentQuantity = Math.max(1, currentQuantity - 1);
      quantityInput.value = currentQuantity;
    });

    increaseButton.addEventListener("click", function () {
      let currentQuantity = parseInt(quantityInput.value) || 1;
      currentQuantity = Math.min(150, currentQuantity + 1);
      quantityInput.value = currentQuantity;
    });

    quantityInput.addEventListener("input", function () {
      let value = this.value;
      if (!/^\d*$/.test(value)) {
        this.value = 1;
        return;
      }

      let numValue = parseInt(value);
      if (value !== "" && (numValue < 1 || numValue > 150)) {
        this.value = 1;
        return;
      }
    });

    quantityInput.addEventListener("blur", function () {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        this.value = 1;
      } else if (value > 150) {
        this.value = 150;
      }
    });
  }

  // Xử lý thêm vào giỏ hàng trên trang index.html và trang sản phẩm
  document.addEventListener("click", async function (event) {
    if (event.target.closest(".themVaoGio")) {
      const button = event.target.closest(".themVaoGio");
      showLoader();
      const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
      const product = {
        id: button.dataset.name,
        name: button.dataset.name,
        price: parseFloat(button.dataset.price.replace("₫", "").replace(/\./g, "")),
        image: button.dataset.image,
        quantity: quantity,
      };
  
      let cart = await getCart();
      let existingProduct = cart.find((item) => item.id === product.id);
      if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 0) + quantity;
      } else {
        cart.push(product);
      }
  
      localStorage.setItem("cart", JSON.stringify(cart));
      await syncCartToAPI(cart);
      window.updateCartNotification();
      hideLoader();
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
    }
  });

  // Xử lý nút "Mua ngay" trên trang sản phẩm
  const buyNowButton = document.querySelector(".buyNow");
  if (buyNowButton) {
    buyNowButton.addEventListener("click", function () {
      showLoader();
      const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
      const product = {
        id: this.dataset.name,
        name: this.dataset.name,
        price: parseFloat(this.dataset.price.replace("₫", "").replace(/\./g, "")),
        image: this.dataset.image,
        quantity: quantity,
      };

      localStorage.setItem("selectedItems", JSON.stringify([product]));
      hideLoader();
      window.location.href = "/checkout/thanhToan.html";
    });
  }

  // Xử lý hiển thị giỏ hàng trên cart.html
  if (document.getElementById("cartItems")) {
    let cart = await getCart();
    const cartTableBody = document.getElementById("cartItems");
    const totalPriceElement = document.getElementById("totalPrice");
    const emptyCartMessage = document.getElementById("emptyCart");
    const cartTable = document.getElementById("cartTable");
    const totalContainer = document.getElementById("totalContainer");
    const selectedCountElement = document.getElementById("selectedCount");
    const selectedTotalPriceElement = document.getElementById("selectedTotalPrice");
    const buyButton = document.getElementById("buyButton");

    async function renderCart() {
      cartTableBody.innerHTML = "";
      let total = 0;

      if (cart.length === 0) {
        cartTable.style.display = "none";
        totalContainer.style.display = "none";
        emptyCartMessage.style.display = "block";
        return;
      } else {
        cartTable.style.display = "table";
        totalContainer.style.display = "block";
        emptyCartMessage.style.display = "none";
      }

      cart.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="td-checkbox">
              <label class="checkbox-container">
                <input class="custom-checkbox product-checkbox" type="checkbox" data-index="${index}" />
                <span class="checkmark"></span>
              </label>
          </td>
          <td class="tenSP"><img src="${item.image}" alt="${item.name}"> <p>${item.name}</p></td>
          <td class = "donGia">₫${item.price.toLocaleString("vi-VN")}</td>
          <td class = "nut">
            <div class="nutTangGiam">
              <button class="button-reduce" data-index="${index}">-</button>
              <input
                type="text"
                role="spinbutton"
                value="${item.quantity}"
                class="quantity-input"
                data-index="${index}"
              />
              <button class="button-increase" data-index="${index}">+</button>
            </div>
          </td>
          <td class="subtotal">₫${(item.price * item.quantity).toLocaleString("vi-VN")}</td>
          <td class="delete-td">
            <button class="delete-btn" data-index="${index}">Xóa</button>
          </td>
        `;
        cartTableBody.appendChild(row);
        total += item.price * item.quantity;
      });

      if (totalPriceElement) {
        totalPriceElement.textContent = total.toLocaleString("vi-VN") + " VND";
      }
      updateSelectedTotal();
    }

    function updateSelectedTotal() {
      let selectedTotal = 0;
      let selectedCount = 0;

      document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
        if (checkbox.checked) {
          let index = checkbox.dataset.index;
          selectedTotal += cart[index].price * cart[index].quantity;
          selectedCount++;
        }
      });

      selectedTotalPriceElement.textContent = "₫" + selectedTotal.toLocaleString("vi-VN");
      selectedCountElement.textContent = selectedCount;
    }

    cartTableBody.addEventListener("click", async function (event) {
      if (event.target.classList.contains("button-reduce") || event.target.classList.contains("button-increase")) {
        showLoader();
        const index = event.target.dataset.index;
        let quantityInput = document.querySelector(`.quantity-input[data-index="${index}"]`);
        let currentQuantity = parseInt(quantityInput.value) || 1;

        if (event.target.classList.contains("button-reduce")) {
          currentQuantity = Math.max(1, currentQuantity - 1);
        } else if (event.target.classList.contains("button-increase")) {
          currentQuantity = Math.min(150, currentQuantity + 1);
        }

        quantityInput.value = currentQuantity;
        cart[index].quantity = currentQuantity;

        const subtotalElement = quantityInput.closest("tr").querySelector(".subtotal");
        subtotalElement.textContent = "₫" + (cart[index].price * cart[index].quantity).toLocaleString("vi-VN");

        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (totalPriceElement) {
          totalPriceElement.textContent = total.toLocaleString("vi-VN") + " VND";
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        await syncCartToAPI(cart);
        updateSelectedTotal();
        window.updateCartNotification();
        hideLoader();
      }

      if (event.target.classList.contains("delete-btn")) {
        showLoader();
        const index = event.target.dataset.index;
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
          cart = cart.filter((_, i) => i !== parseInt(index));
          localStorage.setItem("cart", JSON.stringify(cart));
          await syncCartToAPI(cart);
          await renderCart();
          window.updateCartNotification();
          hideLoader();
        } else {
          hideLoader();
        }
      }
    });

    cartTableBody.addEventListener("input", function (event) {
      if (event.target.classList.contains("quantity-input")) {
        const index = event.target.dataset.index;
        let value = event.target.value;

        if (!/^\d*$/.test(value)) {
          event.target.value = cart[index].quantity;
          return;
        }

        let numValue = parseInt(value);
        if (value !== "" && (numValue < 1 || numValue > 150)) {
          event.target.value = cart[index].quantity;
          return;
        }
      }
    });

    cartTableBody.addEventListener("blur", async function (event) {
      if (event.target.classList.contains("quantity-input")) {
        showLoader();
        const index = event.target.dataset.index;
        let value = parseInt(event.target.value);

        if (isNaN(value) || value < 1) {
          event.target.value = 1;
          cart[index].quantity = 1;
        } else if (value > 150) {
          event.target.value = 150;
          cart[index].quantity = 150;
        } else {
          cart[index].quantity = value;
        }

        const subtotalElement = event.target.closest("tr").querySelector(".subtotal");
        subtotalElement.textContent = "₫" + (cart[index].price * cart[index].quantity).toLocaleString("vi-VN");

        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (totalPriceElement) {
          totalPriceElement.textContent = total.toLocaleString("vi-VN") + " VND";
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        await syncCartToAPI(cart);
        updateSelectedTotal();
        window.updateCartNotification();
        hideLoader();
      }
    }, true);

    cartTableBody.addEventListener("change", function (event) {
      if (event.target.classList.contains("product-checkbox")) {
        updateSelectedTotal();
      }
    });

    // Xử lý sự kiện click cho nút "Mua" (buyButton)
    buyButton.addEventListener("click", async function () {
      showLoader();

      // Kiểm tra trạng thái đăng nhập
      const isLoggedIn = await checkLoginStatus();
      if (!isLoggedIn) {
        hideLoader();
        alert("Bạn phải đăng nhập để mua hàng!");
        window.location.href = "/authenticator/login.html"; // Chuyển hướng đến trang đăng nhập
        return;
      }

      // Nếu đã đăng nhập, tiếp tục quy trình mua hàng
      let selectedItems = [];

      document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
        let index = parseInt(checkbox.dataset.index);
        if (checkbox.checked) {
          selectedItems.push(cart[index]);
        }
      });

      if (selectedItems.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để mua!");
        hideLoader();
        return;
      }

      localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
      hideLoader();
      window.location.href = "/checkout/thanhToan.html";
    });

    await renderCart();
    window.updateCartNotification();
  }

  // Xử lý trang thanhToan.html
  if (document.getElementById("DSSP-checkout")) {
    const checkoutContainer = document.getElementById("DSSP-checkout");
    const selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || [];
    const totalItemsElement = document.getElementById("SoLuongSP");
    const totalPriceElement = document.querySelector(".cot5-2 span");
    const placeOrderButton = document.getElementById("buy");

    if (selectedItems.length === 0) {
      checkoutContainer.innerHTML = "<p>Không có sản phẩm nào được chọn để thanh toán.</p>";
      totalItemsElement.textContent = "0";
      totalPriceElement.textContent = "₫0";
    } else {
      checkoutContainer.innerHTML = "";
      let totalQuantity = selectedItems.length;
      let totalPrice = 0;

      selectedItems.forEach((item) => {
        const productRow = document.createElement("div");
        productRow.className = "DSSP-checkout";
        productRow.innerHTML = `
          <div class="flex-sp">
            <div class="cot1">
              <img src="${item.image}" alt="${item.name}" class="product-image" />
              <span class="TenSP-checkout product-name">${item.name}</span>
            </div>
            <div class="cot2 product-price">₫${item.price.toLocaleString("vi-VN")}</div>
            <div class="cot3 product-quantity">
              <p class="dauNhan">x</p>
              <p>${item.quantity}</p>
            </div>
            <div class="cot4 product-total">₫${(item.price * item.quantity).toLocaleString("vi-VN")}</div>
          </div>
        `;
        checkoutContainer.appendChild(productRow);

        totalPrice += item.price * item.quantity;
      });

      totalItemsElement.textContent = totalQuantity;
      totalPriceElement.textContent = `₫${totalPrice.toLocaleString("vi-VN")}`;
    }

    placeOrderButton.addEventListener("click", async function () {
      showLoader();
      const fullName = document.getElementById("tenKhachHang").value.trim();
      const phoneNumber = document.getElementById("soDienThoai").value.trim();
      const city = document.getElementById("city").value;
      const district = document.getElementById("district").value;
      const ward = document.getElementById("ward").value;
      const address = document.querySelector(".form-group textarea#address").value.trim();
      const message = document.getElementById("loiNhan")?.value.trim() || "";

      // Kiểm tra số điện thoại
      if (!/^\d+$/.test(phoneNumber)) {
        alert("Số điện thoại chỉ được chứa số! Vui lòng kiểm tra lại.");
        hideLoader();
        return;
      }

      if (!/^0\d{9}$/.test(phoneNumber)) {
        if (phoneNumber[0] !== "0") {
          alert("Số điện thoại phải bắt đầu bằng số 0!");
        } else if (phoneNumber.length !== 10) {
          alert("Số điện thoại phải có chính xác 10 chữ số!");
        } else {
          alert("Số điện thoại không hợp lệ!");
        }
        hideLoader();
        return;
      }

      if (!fullName || !phoneNumber || !city || !district || !ward || !address) {
        alert("Vui lòng điền đầy đủ thông tin khách hàng!");
        hideLoader();
        return;
      }

      // Lưu thông tin địa chỉ
      const addressInfo = {
        fullName: fullName,
        phoneNumber: phoneNumber,
        address: address,
        ward: ward,
        district: district,
        city: city,
      };

      let response = await fetch(`${API_URL}/currentUser`);
      let currentUser = await response.json();
      await syncAddressToAPI(currentUser.id, addressInfo);

      // Lưu đơn hàng
      let cart = await getCart();
      const selectedIds = selectedItems.map((item) => item.id);
      cart = cart.filter((item) => !selectedIds.includes(item.id));

      let orders = await getOrders(currentUser.id);
      const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newOrder = {
        orderId: `order_${Date.now()}`,
        items: selectedItems,
        totalPrice: totalPrice,
        status: "Chờ xác nhận",
        orderDate: new Date().toISOString(), // Lưu thời gian trực tiếp từ thiết bị
        message: message,
      };
      orders.push(newOrder);

      await syncOrdersToAPI(currentUser.id, orders);
      localStorage.setItem("cart", JSON.stringify(cart));
      await syncCartToAPI(cart);

      localStorage.removeItem("selectedItems");
      hideLoader();
      window.location.href = "thanhCong.html";
    });
  }

  // Xử lý trang xem đơn hàng
  if (document.querySelector(".thongTinDonHang")) {
    const orderContainer = document.querySelector(".DanhSachSanPham");
    const noOrderMessage = document.querySelector(".hienThiDonHang");
    const totalPriceElement = document.getElementById("info-total-all");
    const hangTieuDe = document.querySelector(".hangTieuDe");
    const tongTienAllDonHang = document.querySelector(".tongTienTatCaDonHang");
    const thongTinDiaChiDatHang = document.querySelector(".thongTinDiaChiDatHang");

    async function renderOrders() {
      let response = await fetch(`${API_URL}/currentUser`);
      let currentUser = await response.json();
      const orders = await getOrders(currentUser.id);
      orderContainer.innerHTML = "";

      if (orders.length === 0) {
        noOrderMessage.style.display = "block";
        totalPriceElement.textContent = "₫0";
        hangTieuDe.style.display = "none";
        tongTienAllDonHang.style.display = "none";
        thongTinDiaChiDatHang.style.display = "none";
        return;
      }

      noOrderMessage.style.display = "none";
      hangTieuDe.style.display = "flex";
      tongTienAllDonHang.style.display = "block";
      thongTinDiaChiDatHang.style.display = "block";
      let totalAllOrders = 0;

      orders.forEach((order, orderIndex) => {
        const orderWrapper = document.createElement("div");
        orderWrapper.className = "order-wrapper";
        orderWrapper.dataset.orderId = order.orderId;

        let orderTotal = 0;
        order.items.forEach((item) => {
          const productRow = document.createElement("div");
          productRow.className = "hangSangPham";
          productRow.innerHTML = `
            <div class="cot cot1">
              <img src="${item.image}" alt="${item.name}" />
              <p>${item.name}</p>
            </div>
            <div class="cot cot2"><span>₫${item.price.toLocaleString("vi-VN")}</span></div>
            <div class="cot cot3"><span>${item.quantity}</span></div>
            <div class="cot cot4"><span>₫${(item.price * item.quantity).toLocaleString("vi-VN")}</span></div>
          `;
          orderWrapper.appendChild(productRow);
          orderTotal += item.price * item.quantity;
        });

        // Định dạng thời gian đặt hàng từ orderDate
        const { hours, minutes, day, month, year } = formatOrderDate(order.orderDate);

        const orderFooter = document.createElement("div");
        orderFooter.className = "xacNhanDonHang";
        orderFooter.innerHTML = `
          <div class="tongTienDonHang">
            <span>Tổng tiền: </span><span id="info-total-all">₫${orderTotal.toLocaleString("vi-VN")}</span>
          </div>
          <div class="thoiGian">
            <h4 class="textTime">Thời gian đặt hàng:</h4>
            <span id="Houre">${hours}</span>
            <span>:</span>
            <span id="Minute">${minutes}</span>
            <span>ㅤ</span>
            <span id="Day">${day}</span>
            <span>/</span>
            <span id="Month">${month}</span>
            <span>/</span>
            <span id="Year">${year}</span>
          </div>
          <div class="trangThai">
            <h3>Trạng thái: <span id="trangThaiGH">${order.status}</span></h3>
          </div>
          ${order.status === "Chờ xác nhận" ? `<button class="huyDon" data-order-id="${order.orderId}">Hủy đơn hàng</button>` : ""}
        `;
        orderWrapper.appendChild(orderFooter);

        orderContainer.appendChild(orderWrapper);
        totalAllOrders += orderTotal;
      });

      totalPriceElement.textContent = `₫${totalAllOrders.toLocaleString("vi-VN")}`;
    }

    orderContainer.addEventListener("click", async function (event) {
      if (event.target.classList.contains("huyDon")) {
        const orderId = event.target.dataset.orderId;
        if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
          showLoader();
          let response = await fetch(`${API_URL}/currentUser`);
          let currentUser = await response.json();
          let orders = await getOrders(currentUser.id);
          const orderToCancel = orders.find((order) => order.orderId === orderId);

          if (orderToCancel && orderToCancel.status === "Chờ xác nhận") {
            orders = orders.filter((order) => order.orderId !== orderId);
            await syncOrdersToAPI(currentUser.id, orders);

            // Nếu không còn đơn hàng nào, xóa thông tin địa chỉ và ẩn form địa chỉ
            if (orders.length === 0) {
              await syncAddressToAPI(currentUser.id, null);
              const addressContainer = document.querySelector(".thongTinDiaChiDatHang");
              if (addressContainer) {
                addressContainer.classList.remove("visible");
              }
            }

            await renderOrders();
            hideLoader();
            alert("Đơn hàng đã được hủy!");
          } else {
            hideLoader();
            alert("Không thể hủy đơn hàng này!");
          }
        }
      }
    });

    await renderOrders();
  }

  // Xử lý trang tài khoản - hiển thị và chỉnh sửa thông tin địa chỉ
  if (document.querySelector(".thongTinDiaChiDatHang")) {
    const addressContainer = document.querySelector(".thongTinDiaChiDatHang");
    const fullNameInput = document.getElementById("HoTen");
    const phoneInput = document.getElementById("SDTDatHang");
    const addressInput = document.getElementById("DiaChiCuTheKH");
    const wardInput = document.getElementById("OptionXa-Phuong");
    const districtInput = document.getElementById("OptionQuan-Huyen");
    const cityInput = document.getElementById("OptionTinh-ThanhPho");
    const editButton = document.getElementById("editAddress");
    const saveButton = document.getElementById("saveAddress");

    // Kiểm tra xem có đơn hàng nào không
    async function checkAndShowAddressForm() {
      let response = await fetch(`${API_URL}/currentUser`);
      let currentUser = await response.json();
      const orders = await getOrders(currentUser.id);
      if (orders.length > 0) {
        addressContainer.classList.add("visible");
      } else {
        addressContainer.classList.remove("visible");
      }
    }

    // Hiển thị thông tin địa chỉ
    async function renderAddressInfo() {
      let response = await fetch(`${API_URL}/currentUser`);
      let currentUser = await response.json();
      const addressInfo = await getAddressInfo(currentUser.id);
      if (addressInfo) {
        fullNameInput.value = addressInfo.fullName || "";
        phoneInput.value = addressInfo.phoneNumber || "";
        addressInput.value = addressInfo.address || "";

        // Lấy dữ liệu địa chỉ từ file JSON
        const locations = await getLocationData();
        if (locations) {
          wardInput.value = findLocationName(locations, addressInfo.ward, "ward") || "";
          districtInput.value = findLocationName(locations, addressInfo.district, "district") || "";
          cityInput.value = findLocationName(locations, addressInfo.city, "city") || "";
        } else {
          wardInput.value = addressInfo.ward || "";
          districtInput.value = addressInfo.district || "";
          cityInput.value = addressInfo.city || "";
        }
      }
    }

    // Mở khóa các input khi bấm "Sửa"
    editButton.addEventListener("click", function () {
      fullNameInput.removeAttribute("readonly");
      phoneInput.removeAttribute("readonly");
      addressInput.removeAttribute("readonly");
      wardInput.removeAttribute("readonly");
      districtInput.removeAttribute("readonly");
      cityInput.removeAttribute("readonly");

      editButton.style.display = "none";
      saveButton.style.display = "inline-block";
    });

    // Lưu thông tin địa chỉ khi bấm "Lưu"
    saveButton.addEventListener("click", async function () {
      const fullName = fullNameInput.value.trim();
      const phoneNumber = phoneInput.value.trim();
      const address = addressInput.value.trim();
      const ward = wardInput.value.trim();
      const district = districtInput.value.trim();
      const city = cityInput.value.trim();

      // Kiểm tra số điện thoại
      if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
        alert("Số điện thoại chỉ được chứa số! Vui lòng kiểm tra lại.");
        return;
      }

      if (phoneNumber && !/^0\d{9}$/.test(phoneNumber)) {
        if (phoneNumber[0] !== "0") {
          alert("Số điện thoại phải bắt đầu bằng số 0!");
        } else if (phoneNumber.length !== 10) {
          alert("Số điện thoại phải có chính xác 10 chữ số!");
        } else {
          alert("Số điện thoại không hợp lệ!");
        }
        return;
      }

      if (!fullName || !phoneNumber || !address || !ward || !district || !city) {
        alert("Vui lòng điền đầy đủ thông tin địa chỉ!");
        return;
      }

      const addressInfo = {
        fullName, phoneNumber, address, ward, district, city,
      };

      let response = await fetch(`${API_URL}/currentUser`);
      let currentUser = await response.json();
      await syncAddressToAPI(currentUser.id, addressInfo);

      // Khóa lại các input sau khi lưu
      fullNameInput.setAttribute("readonly", true);
      phoneInput.setAttribute("readonly", true);
      addressInput.setAttribute("readonly", true);
      wardInput.setAttribute("readonly", true);
      districtInput.setAttribute("readonly", true);
      cityInput.setAttribute("readonly", true);

      editButton.style.display = "inline-block";
      saveButton.style.display = "none";

      alert("Thông tin địa chỉ đã được lưu!");
    });

    await checkAndShowAddressForm();
    await renderAddressInfo();
  }

  // Xử lý trang admin - quản lý đơn hàng
  if (document.querySelector(".danhSachChoDuyet")) {
    const pendingOrdersContainer = document.querySelector(".danhSachChoDuyet .grid-div");
    const approvedOrdersContainer = document.querySelector(".danhSachDaDuyet .grid-div");
    const canceledOrdersContainer = document.querySelector(".danhSachHuyDon .grid-div");
    const completedOrdersContainer = document.querySelector(".danhSachHoanTat .grid-div");
    const emptyPendingMsg = document.getElementById("emptyPending");
    const emptyApprovedMsg = document.getElementById("emptyApproved");
    const emptyCanceledMsg = document.getElementById("emptyCanceled");
    const emptyCompletedMsg = document.getElementById("emptyCompleted");
    const modal = document.getElementById("orderModal");
    const modalBody = document.querySelector(".modal-body");
    const modalTotalPrice = document.getElementById("totalPrice-admin");
    const closeModal = document.querySelector(".close");

    // Đóng modal khi bấm nút "✕"
    closeModal.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // Đóng modal khi bấm ra ngoài
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });

    async function renderAdminOrders() {
      const users = await getAllUsers();
      const locations = await getLocationData();

      // Xóa nội dung cũ
      pendingOrdersContainer.innerHTML = "";
      approvedOrdersContainer.innerHTML = "";
      canceledOrdersContainer.innerHTML = "";
      completedOrdersContainer.innerHTML = "";

      // Biến đếm số lượng đơn hàng trong từng danh mục
      let pendingCount = 0;
      let approvedCount = 0;
      let canceledCount = 0;
      let completedCount = 0;

      for (const user of users) {
        const orders = user.orders || [];
        const addressInfo = user.addressInfo || {};
        const fullAddress = addressInfo.address
          ? `${addressInfo.address}, ${findLocationName(locations, addressInfo.ward, "ward") || addressInfo.ward}, ${findLocationName(locations, addressInfo.district, "district") || addressInfo.district}, ${findLocationName(locations, addressInfo.city, "city") || addressInfo.city}`
          : "Chưa có thông tin địa chỉ";

        orders.forEach((order) => {
          const orderCard = document.createElement("div");
          orderCard.className = "order-card";
          orderCard.dataset.userId = user.id;
          orderCard.dataset.orderId = order.orderId;

          // Định dạng thời gian đặt hàng từ orderDate
          const { hours, minutes, day, month, year } = formatOrderDate(order.orderDate);

          // Hiển thị thông tin đơn hàng, bao gồm lời nhắn và ngày đặt hàng
          orderCard.innerHTML = `
            <h3>${addressInfo.fullName || "Chưa có thông tin"}</h3>
            <p><strong>Email:</strong> ${user.email || "Chưa có thông tin"}</p>
            <p><strong>Số điện thoại:</strong> ${addressInfo.phoneNumber || "Chưa có thông tin"}</p>
            <p class="message"><strong>Lời nhắn:</strong> ${order.message || ""}</p>
            <p><strong>Ngày đặt hàng:</strong> ${hours}:${minutes}, ${day}/${month}/${year}</p>
            <p><strong>Địa chỉ:</strong> ${fullAddress}</p>
          `;

          // Hiển thị dòng "Lời nhắn" chỉ khi có giá trị
          const messageElement = orderCard.querySelector(".message");
          if (order.message && order.message.trim() !== "") {
            messageElement.classList.add("visible");
          }

          if (order.status === "Chờ xác nhận") {
            orderCard.innerHTML += `
              <button class="view-btn">Xem Chi Tiết</button>
              <button class="approve-btn">Duyệt</button>
              <button class="cancel-btn">Hủy</button>
            `;
            pendingOrdersContainer.appendChild(orderCard);
            pendingCount++;
          } else if (order.status === "Đã xác nhận") {
            orderCard.innerHTML += `
              <button class="complete-btn">Hoàn tất</button>
            `;
            approvedOrdersContainer.appendChild(orderCard);
            approvedCount++;
          } else if (order.status === "Đã bị hủy") {
            orderCard.innerHTML += `
              <button class="view-btn">Xem Chi Tiết</button>
              <button class="delete-btn">Xóa</button>
            `;
            canceledOrdersContainer.appendChild(orderCard);
            canceledCount++;
          } else if (order.status === "Hoàn tất") {
            orderCard.innerHTML += `
              <button class="view-btn">Xem Chi Tiết</button>
              <button class="delete-btn">Xóa</button>
            `;
            completedOrdersContainer.appendChild(orderCard);
            completedCount++;
          }
        });
      }

      // Hiển thị thông báo nếu không có đơn hàng trong danh mục
      emptyPendingMsg.classList.toggle("visible", pendingCount === 0);
      emptyApprovedMsg.classList.toggle("visible", approvedCount === 0);
      emptyCanceledMsg.classList.toggle("visible", canceledCount === 0);
      emptyCompletedMsg.classList.toggle("visible", completedCount === 0);
    }

    // Xử lý các sự kiện click trong trang admin
    document.addEventListener("click", async function (event) {
      const target = event.target;
      const orderCard = target.closest(".order-card");
      if (!orderCard) return;

      const userId = orderCard.dataset.userId;
      const orderId = orderCard.dataset.orderId;
      let orders = await getOrders(userId);

      if (target.classList.contains("view-btn")) {
        const order = orders.find((o) => o.orderId === orderId);
        if (order) {
          modalBody.innerHTML = "";
          let totalPrice = 0;

          order.items.forEach((item) => {
            const itemRow = document.createElement("div");
            itemRow.className = "hangSP-modal";
            itemRow.innerHTML = `
              <div class="sp-modal">
                <p class="text-sp-modal">${item.name}</p>
              </div>
              <div class="sl-modal"><p class="sLMua-modal">${item.quantity}</p></div>
              <div class="gia-modal">
                <p class="giaSP-modal">₫${(item.price * item.quantity).toLocaleString("vi-VN")}</p>
              </div>
            `;
            modalBody.appendChild(itemRow);
            totalPrice += item.price * item.quantity;
          });

          modalTotalPrice.textContent = `Tổng tiền: ₫${totalPrice.toLocaleString("vi-VN")}`;
          modal.style.display = "block";
        }
      }

      if (target.classList.contains("approve-btn")) {
        const order = orders.find((o) => o.orderId === orderId);
        if (order && order.status === "Chờ xác nhận") {
          order.status = "Đã xác nhận";
          await syncOrdersToAPI(userId, orders);
          await renderAdminOrders();
          alert("Đơn hàng đã được duyệt thành công!");
        }
      }

      if (target.classList.contains("cancel-btn")) {
        const order = orders.find((o) => o.orderId === orderId);
        if (order && order.status === "Chờ xác nhận") {
          order.status = "Đã bị hủy";
          await syncOrdersToAPI(userId, orders);
          await renderAdminOrders();
          alert("Đơn hàng đã bị hủy thành công!");
        }
      }

      if (target.classList.contains("delete-btn")) {
        const order = orders.find((o) => o.orderId === orderId);
        if (order && (order.status === "Đã bị hủy" || order.status === "Hoàn tất")) {
          if (confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
            orders = orders.filter((o) => o.orderId !== orderId);
            await syncOrdersToAPI(userId, orders);

            // Nếu không còn đơn hàng, xóa thông tin địa chỉ
            if (orders.length === 0) {
              await syncAddressToAPI(userId, null);
            }

            await renderAdminOrders();
            alert("Đơn hàng đã được xóa thành công!");
          }
        }
      }

      if (target.classList.contains("complete-btn")) {
        const order = orders.find((o) => o.orderId === orderId);
        if (order && order.status === "Đã xác nhận") {
          order.status = "Hoàn tất";
          await syncOrdersToAPI(userId, orders);
          await renderAdminOrders();
          alert("Đơn hàng đã được hoàn tất!");
        }
      }
    });

    await renderAdminOrders();
  }

  window.updateCartNotification();
});