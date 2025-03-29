function quanLiUser() {
    const anDanhMuc = document.querySelectorAll(
      ".danhSachChoDuyet, .danhSachDaDuyet, .danhSachHuyDon, .danhSachHoanTat, .sanPhamTrangChu"
    );
  
    const hienDanhMuc = document.querySelector(".container-user-admin");
    hienDanhMuc.style.display = "block";
  
    anDanhMuc.forEach(function (element) {
      element.style.display = "none";
    });
  }
  
  function quanLiChoDuyet() {
    const anDanhMuc = document.querySelectorAll(
      ".container-user-admin, .danhSachDaDuyet, .danhSachHuyDon, .danhSachHoanTat, .sanPhamTrangChu"
    );
    const hienDanhMuc = document.querySelector(".danhSachChoDuyet");
    hienDanhMuc.style.display = "grid";
  
    anDanhMuc.forEach(function (element) {
      element.style.display = "none";
    });
  }
  
  function quanLiDaDuyet() {
    const anDanhMuc = document.querySelectorAll(
      ".container-user-admin, .danhSachHuyDon,.danhSachChoDuyet, .danhSachHoanTat, .sanPhamTrangChu"
    );
    const hienDanhMuc = document.querySelector(".danhSachDaDuyet");
    hienDanhMuc.style.display = "grid";
  
    anDanhMuc.forEach(function (element) {
      element.style.display = "none";
    });
  }
  
  function sanPhamTrangChu() {
    const anDanhMuc = document.querySelectorAll(
      ".container-user-admin, .danhSachChoDuyet, .danhSachDaDuyet, .danhSachHuyDon, .danhSachHoanTat"
    );
    const hienDanhMuc = document.querySelector(".sanPhamTrangChu");
    hienDanhMuc.style.display = "block";
  
    anDanhMuc.forEach(function (element) {
      element.style.display = "none";
    });
  }
  
  function quanLiHuyDon() {
    const anDanhMuc = document.querySelector(".sanPhamTrangChu");
    anDanhMuc.style.display = "none";
  }
  
  function danhSachHuyDon() {
    const spTrangChu = document.querySelector(".sanPhamTrangChu");
    spTrangChu.style.display = "none";
  
    const anDanhMuc = document.querySelectorAll(
      ".container-user-admin, .danhSachChoDuyet, .danhSachDaDuyet, .danhSachHoanTat"
    );
    const hienDanhMuc = document.querySelector(".danhSachHuyDon");
    hienDanhMuc.style.display = "grid";
  
    anDanhMuc.forEach(function (element) {
      element.style.display = "none";
    });
  }
  
  function donHangHoanTat() {
    const anDanhMuc = document.querySelectorAll(
      ".container-user-admin, .danhSachChoDuyet, .danhSachDaDuyet, .danhSachHuyDon"
    );
    const hienDanhMuc = document.querySelector(".danhSachHoanTat");
    hienDanhMuc.style.display = "grid";
  
    anDanhMuc.forEach(function (element) {
      element.style.display = "none";
    });
  }

  $(document).ready(function () {
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
  
    // Kiểm tra trạng thái đăng nhập trước khi tải trang admin
    showLoader(); // Hiển thị loader khi kiểm tra đăng nhập
    $.ajax({
      url: `${API_URL}/currentUser`,
      method: "GET",
      success: function (user) {
        if (!user || !user.id) {
          // Chưa đăng nhập, chuyển hướng về login.html
          hideLoader();
          window.location.replace("/BaiTapFrontEnd/authenticator/login.html");
        } else if (user.role !== "admin") {
          // Không phải admin, chuyển hướng về index.html
          hideLoader();
          window.location.replace("/BaiTapFrontEnd/index.html");
        } else {
          // Là admin, tiếp tục tải danh sách user và sản phẩm
          loadUsers();
          loadProducts(); // Thêm hàm tải danh sách sản phẩm
          hideLoader(); // Ẩn loader sau khi xác nhận là admin
        }
      },
      error: function (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
        hideLoader();
        window.location.replace("/BaiTapFrontEnd/authenticator/login.html"); // Lỗi thì cũng chuyển về login
      },
    });
  
    // Tải danh sách người dùng
    function loadUsers() {
      showLoader(); // Hiển thị loader khi tải danh sách
      $.ajax({
        url: `${API_URL}/users`,
        method: "GET",
        success: function (users) {
          // Lọc bỏ tài khoản admin
          const filteredUsers = users.filter((user) => user.role !== "admin");
          displayUsers(filteredUsers);
          hideLoader(); // Ẩn loader khi hiển thị xong
        },
        error: function (error) {
          console.error("Lỗi khi tải danh sách người dùng:", error);
          alert("Không thể tải danh sách người dùng! Kiểm tra Console.");
          hideLoader();
        },
      });
    }
  
    // Hiển thị danh sách người dùng
    function displayUsers(users) {
      const $userContainer = $("#userContainer");
      $userContainer.empty(); // Xóa nội dung cũ
  
      if (users.length === 0) {
        $userContainer.html(`
              <div class="no-users">
                <h2>Không có user nào tồn tại</h2>
              </div>
            `);
      } else {
        users.forEach((user, index) => {
          const stt = index + 1;
          const userBox = `
                <div class="user-box" data-id="${user.id}">
                  <h3 class="list-user"><span class="stt">${stt}: </span><span class="user-name">${user.name}</span></h3>
                  <p class="user-email">Email: <span>${user.email}</span></p>
                  <p class="user-password">Mật Khẩu: <span>${user.password}</span></p>
                  <div class="user-action">
                    <div style="display: flex; justify-content: space-between; width: 80px">
                      <button class="button-user edit-user">Sửa</button>
                      <button class="button-user delete-user">Xóa</button>
                    </div>
                  </div>
                </div>
              `;
          $userContainer.append(userBox);
        });
        attachEventListeners();
      }
    }
  
    // Gắn sự kiện cho các nút (quản lý người dùng)
    function attachEventListeners() {
      $(".user-box").click(function () {
        $(".user-box p, .user-action button").hide();
        $(".user-box").css("backgroundColor", "");
        $(this).find("p, .user-action button").show();
        $(this).css("backgroundColor", "#e0f7fa");
        $(".user-box h3").css("color", "#000");
      });
  
      $(".edit-user")
        .off("click")
        .on("click", function (e) {
          e.stopPropagation();
          const $userBox = $(this).closest(".user-box");
          const userId = $userBox.data("id");
  
          if ($userBox.find(".edit-form").length > 0) return;
  
          const currentName = $userBox.find(".user-name").text();
          const currentEmail = $userBox.find(".user-email span").text();
          const currentPassword = $userBox.find(".user-password span").text();
  
          $userBox.html(`
                 <h3 class="list-user">Tên: ㅤ ㅤ<input type="text" class="edit-name input" value="${currentName}" /></h3>
                <p class="user-email">Email:ㅤㅤ <input type="text" class="edit-email input" value="${currentEmail}" /></p>
                <p class="user-password"> Mật Khẩu:  <input type="text" class="edit-password input" value="${currentPassword}" /></p>
                <div class="user-action edit-form">
                  <div class="edit-form-btn">
                    <button class="button-user save-user">Lưu</button>
                    <button class="button-user cancel-edit">Hủy</button>
                  </div>
                </div>
              `);
  
          $userBox.find(".save-user").on("click", function (e) {
            e.stopPropagation();
            saveUser(userId, $userBox);
          });
  
          $userBox.find(".cancel-edit").on("click", function (e) {
            e.stopPropagation();
            loadUsers();
          });
        });
  
      $(".delete-user")
        .off("click")
        .on("click", function (e) {
          e.stopPropagation();
          const userId = $(this).closest(".user-box").data("id");
          deleteUser(userId);
        });
    }
  
    // Lưu thông tin người dùng
    function saveUser(userId, $userBox) {
      const newName = $userBox.find(".edit-name").val().trim();
      const newEmail = $userBox.find(".edit-email").val().trim();
      const newPassword = $userBox.find(".edit-password").val().trim();
  
      if (!newName || !newEmail || !newPassword) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(newEmail)) {
        alert("Email phải có định dạng hợp lệ (ví dụ: user@gmail.com)!");
        return;
      }
  
      showLoader(); // Hiển thị loader khi lưu
      $.ajax({
        url: `${API_URL}/users/${userId}`,
        method: "GET",
        success: function (user) {
          const updatedUser = {
            ...user,
            name: newName,
            email: newEmail,
            password: newPassword,
          };
  
          $.ajax({
            url: `${API_URL}/users/${userId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedUser),
            success: function () {
              alert("Cập nhật thông tin người dùng thành công!");
              loadUsers(); // Tải lại danh sách (đã có loader trong loadUsers)
              hideLoader();
            },
            error: function (error) {
              console.error("Lỗi khi cập nhật người dùng:", error);
              alert("Không thể cập nhật người dùng! Kiểm tra Console.");
              hideLoader();
            },
          });
        },
        error: function (error) {
          console.error("Lỗi khi tải thông tin người dùng:", error);
          alert("Không thể tải thông tin người dùng để sửa!");
          hideLoader();
        },
      });
    }
  
    // Xóa người dùng
    function deleteUser(userId) {
      if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
  
      showLoader(); // Hiển thị loader khi xóa
      $.ajax({
        url: `${API_URL}/users/${userId}`,
        method: "DELETE",
        success: function () {
          alert("Xóa người dùng thành công!");
          loadUsers(); // Tải lại danh sách (đã có loader trong loadUsers)
          hideLoader();
        },
        error: function (error) {
          console.error("Lỗi khi xóa người dùng:", error);
          alert("Không thể xóa người dùng! Kiểm tra Console.");
          hideLoader();
        },
      });
    }
  
    // Tải danh sách sản phẩm
    function loadProducts() {
      showLoader();
      $.ajax({
        url: `${API_URL}/products`,
        method: "GET",
        success: function (products) {
          displayProducts(products);
          hideLoader();
        },
        error: function (error) {
          console.error("Lỗi khi tải danh sách sản phẩm:", error);
          alert("Không thể tải danh sách sản phẩm! Kiểm tra Console.");
          hideLoader();
        },
      });
    }
  
    // Hiển thị danh sách sản phẩm
    function displayProducts(products) {
      const $productContainer = $(".container-spHone");
      $productContainer.empty(); // Xóa nội dung cũ
  
      if (products.length === 0) {
        $productContainer.html("<p>Không có sản phẩm nào để hiển thị.</p>");
      } else {
        products.forEach((product) => {
          const productCard = `
            <div class="card" data-id="${product.id}">
              <div class="card-img">
                <a href="${product.link}">
                  <img src="${product.image}" alt="${product.alt || product.name}" width="auto" />
                </a>
              </div>
              <div class="card-info">
                <p class="text-body">${product.name}</p>
              </div>
              <div class="card-footer">
                <span class="text-title">₫${product.price.toLocaleString("vi-VN")}</span>
              </div>
              <div class="nutChucNang">
                <button class="button-API xoaSpHome" data-id="${product.id}">Xóa sản phẩm</button>
                <button class="button-API editSpHome" data-id="${product.id}">Sửa thông tin</button>
              </div>
            </div>
          `;
          $productContainer.append(productCard);
        });
      }
    }
  
    // Cập nhật giỏ hàng của tất cả người dùng khi sửa sản phẩm
    function updateCartsAfterProductChange(updatedProduct) {
      showLoader();
      $.ajax({
        url: `${API_URL}/users`,
        method: "GET",
        success: function (users) {
          users.forEach((user) => {
            if (user.cart && user.cart.length > 0) {
              const updatedCart = user.cart.map((item) => {
                if (item.id === updatedProduct.id) {
                  return {
                    ...item,
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                    image: updatedProduct.image,
                  };
                }
                return item;
              });
  
              // Cập nhật giỏ hàng của người dùng
              user.cart = updatedCart;
              $.ajax({
                url: `${API_URL}/users/${user.id}`,
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify(user),
                success: function () {
                  // Nếu người dùng hiện tại bị ảnh hưởng, cập nhật currentUser
                  $.ajax({
                    url: `${API_URL}/currentUser`,
                    method: "GET",
                    success: function (currentUser) {
                      if (currentUser.id === user.id) {
                        currentUser.cart = updatedCart;
                        $.ajax({
                          url: `${API_URL}/currentUser`,
                          method: "PUT",
                          contentType: "application/json",
                          data: JSON.stringify(currentUser),
                          success: function () {
                            // Cập nhật localStorage nếu người dùng hiện tại đang mở trang
                            localStorage.setItem("cart", JSON.stringify(updatedCart));
                          },
                        });
                      }
                    },
                  });
                },
                error: function (error) {
                  console.error(`Lỗi khi cập nhật giỏ hàng của người dùng ${user.id}:`, error);
                },
              });
            }
          });
          hideLoader();
        },
        error: function (error) {
          console.error("Lỗi khi lấy danh sách người dùng để cập nhật giỏ hàng:", error);
          hideLoader();
        },
      });
    }
  
    // Xử lý modal thêm/sửa sản phẩm
    const $modal = $(".container-popUp");
    const $closeModalBtn = $("#close-popUp");
    const $addProductBtn = $("#addProduct");
  
    // Lấy các ô input trong modal
    const $imageLinkInput = $modal.find('input[placeholder="Link ảnh"]');
    const $imageDescInput = $modal.find('input[placeholder="Mô tả hình ảnh"]');
    const $detailLinkInput = $modal.find('input[placeholder="Link trang chi tiết"]');
    const $productNameInput = $modal.find('input[placeholder="Tên sản phẩm"]');
    const $productPriceInput = $modal.find('input[placeholder="Giá sản phẩm"]');
  
    // Biến để theo dõi trạng thái (thêm mới hay sửa)
    let isEditing = false;
    let editingProductId = null;
  
    // Hàm mở modal
    function openModal(mode, product = null) {
      isEditing = mode === "edit";
      editingProductId = product ? product.id : null;
  
      if (isEditing && product) {
        // Điền thông tin sản phẩm vào form khi sửa
        $imageLinkInput.val(product.image || "");
        $imageDescInput.val(product.alt || product.name || "");
        $detailLinkInput.val(product.link || "");
        $productNameInput.val(product.name || "");
        $productPriceInput.val(product.price || "");
      } else {
        // Xóa trắng form khi thêm mới
        $imageLinkInput.val("");
        $imageDescInput.val("");
        $detailLinkInput.val("");
        $productNameInput.val("");
        $productPriceInput.val("");
      }
  
      $modal.css("display", "block");
    }
  
    // Hàm đóng modal
    function closeModal() {
      $modal.css("display", "none");
      isEditing = false;
      editingProductId = null;
    }
  
    // Sự kiện đóng modal
    $closeModalBtn.on("click", closeModal);
  
    // Đóng modal khi nhấp ra ngoài
    $(window).on("click", function (event) {
      if ($(event.target).is($modal)) {
        closeModal();
      }
    });
  
    // Sự kiện mở modal khi nhấn "Thêm sản phẩm mới"
    $addProductBtn.on("click", function () {
      openModal("add");
    });
  
    // Sự kiện mở modal khi nhấn "Sửa thông tin"
    $(document).on("click", ".editSpHome", function () {
      const productId = $(this).data("id");
      $.ajax({
        url: `${API_URL}/products/${productId}`,
        method: "GET",
        success: function (product) {
          openModal("edit", product);
        },
        error: function (error) {
          console.error("Lỗi khi lấy thông tin sản phẩm:", error);
          alert("Không thể lấy thông tin sản phẩm để sửa!");
        },
      });
    });
  
    // Sự kiện xóa sản phẩm
    $(document).on("click", ".xoaSpHome", function () {
      const productId = $(this).data("id");
      if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
        showLoader();
        $.ajax({
          url: `${API_URL}/products/${productId}`,
          method: "DELETE",
          success: function () {
            alert("Xóa sản phẩm thành công!");
            loadProducts();
            hideLoader();
          },
          error: function (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert("Không thể xóa sản phẩm! Kiểm tra Console.");
            hideLoader();
          },
        });
      }
    });
  
    // Sự kiện lưu thông tin (thêm hoặc sửa)
    $modal.on("submit", function (event) {
      event.preventDefault(); // Ngăn form submit mặc định
  
      const newProduct = {
        id: isEditing ? editingProductId : `product_${Date.now()}`, // Tạo ID mới nếu thêm
        image: $imageLinkInput.val().trim(),
        alt: $imageDescInput.val().trim(),
        link: $detailLinkInput.val().trim(),
        name: $productNameInput.val().trim(),
        price: parseFloat($productPriceInput.val().trim()),
      };
  
      // Kiểm tra dữ liệu
      if (!newProduct.image || !newProduct.link || !newProduct.name || isNaN(newProduct.price) || newProduct.price <= 0) {
        alert("Vui lòng điền đầy đủ thông tin và đảm bảo giá là số dương!");
        return;
      }
  
      showLoader();
      if (isEditing) {
        // Cập nhật sản phẩm
        $.ajax({
          url: `${API_URL}/products/${newProduct.id}`,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify(newProduct),
          success: function () {
            // Cập nhật giỏ hàng của tất cả người dùng
            updateCartsAfterProductChange(newProduct);
            alert("Cập nhật sản phẩm thành công!");
            closeModal();
            loadProducts();
            hideLoader();
          },
          error: function (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            alert("Không thể cập nhật sản phẩm! Kiểm tra Console.");
            hideLoader();
          },
        });
      } else {
        // Thêm sản phẩm mới
        $.ajax({
          url: `${API_URL}/products`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(newProduct),
          success: function () {
            alert("Thêm sản phẩm thành công!");
            closeModal();
            loadProducts();
            hideLoader();
          },
          error: function (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Không thể thêm sản phẩm! Kiểm tra Console.");
            hideLoader();
          },
        });
      }
    });
  });