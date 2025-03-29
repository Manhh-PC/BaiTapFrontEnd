document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "https://ttjwcy-8080.csb.app";

  // Hàm hiển thị loader
  function showLoader() {
    const loader = document.querySelector(".cssload-main");
    if (loader) {
      loader.style.display = "block";
      document.body.classList.add("loading");
    }
    return new Promise((resolve) => setTimeout(resolve, 1000)); // Đảm bảo loader hiển thị ít nhất 1 giây
  }

  // Hàm ẩn loader
  async function hideLoader() {
    const loader = document.querySelector(".cssload-main");
    if (loader) {
      loader.style.display = "none";
      document.body.classList.remove("loading");
    }
  }

  // Tải thông tin người dùng cho account.html
  async function loadUserInfo() {
    await showLoader();
    try {
      let response = await fetch(`${API_URL}/currentUser`);
      if (!response.ok)
        throw new Error("Không thể tải thông tin người dùng từ API");
      let user = await response.json();

      if (user && user.id && user.email) {
        const userNameElement = document.getElementById("userName");
        const userName2Element = document.getElementById("userName2");
        const userEmailElement = document.getElementById("userEmail");
        const dangNhapElement = document.querySelector(".dangNhap1 p");
        const logInaElement = document.querySelector(".logIna");

        if (userNameElement) userNameElement.textContent = user.name;
        if (userName2Element) userName2Element.textContent = user.name;
        if (userEmailElement) userEmailElement.textContent = user.email;
        if (dangNhapElement) dangNhapElement.textContent = "Tài khoản";
        if (logInaElement) logInaElement.href = "/BaiTapFrontEnd/account/account.html";
      } else {
        alert("Bạn cần đăng nhập để truy cập trang này!");
        await hideLoader();
        window.location.replace("/BaiTapFrontEnd/authenticator/login.html");
        return;
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      alert("Không thể tải thông tin người dùng! Vui lòng thử lại sau.");
    } finally {
      await hideLoader();
    }
  }

  // Xử lý chỉnh sửa thông tin cho account.html
  const editInfoBtn = document.getElementById("edit-info");
  const updateInfoBtn = document.getElementById("update-info");
  const editForm = document.getElementById("editForm");
  const infoDisplay = document.getElementById("infoDisplay");
  const editNameInput = document.getElementById("editName");
  const editEmailInput = document.getElementById("editEmail");

  if (
    editInfoBtn &&
    updateInfoBtn &&
    editForm &&
    infoDisplay &&
    editNameInput &&
    editEmailInput
  ) {
    editInfoBtn.addEventListener("click", async function () {
      await showLoader();
      try {
        let response = await fetch(`${API_URL}/currentUser`);
        if (!response.ok) throw new Error("Không thể tải thông tin từ API");
        let user = await response.json();

        if (user && user.id) {
          editNameInput.value = user.name;
          editEmailInput.value = user.email;
          editForm.style.display = "block";
          infoDisplay.style.display = "none";
          editInfoBtn.style.display = "none";
          updateInfoBtn.style.display = "block";
        } else {
          alert("Bạn cần đăng nhập để chỉnh sửa thông tin!");
          await hideLoader();
          window.location.replace("/BaiTapFrontEnd/authenticator/login.html");
          return;
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin để chỉnh sửa:", error);
        alert("Không thể tải thông tin để chỉnh sửa! Vui lòng thử lại sau.");
      } finally {
        await hideLoader();
      }
    });

    updateInfoBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      const newName = editNameInput.value.trim();
      const newEmail = editEmailInput.value.trim();

      if (!newName || !newEmail) {
        alert("Vui lòng nhập đầy đủ họ tên và email!");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(newEmail)) {
        alert("Email phải có định dạng hợp lệ (ví dụ: user@gmail.com)!");
        return;
      }

      await showLoader();
      try {
        let response = await fetch(`${API_URL}/currentUser`);
        if (!response.ok) throw new Error("Không thể tải currentUser từ API");
        let currentUser = await response.json();

        if (currentUser && currentUser.id) {
          currentUser.name = newName;
          currentUser.email = newEmail;

          let updateResponse = await fetch(`${API_URL}/currentUser`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser),
          });
          if (!updateResponse.ok)
            throw new Error("Không thể cập nhật currentUser");

          let userUpdateResponse = await fetch(
            `${API_URL}/users/${currentUser.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(currentUser),
            }
          );
          if (!userUpdateResponse.ok)
            throw new Error("Không thể cập nhật users/[id]");

          const userNameElement = document.getElementById("userName");
          const userName2Element = document.getElementById("userName2");
          const userEmailElement = document.getElementById("userEmail");

          if (userNameElement) userNameElement.textContent = newName;
          if (userName2Element) userName2Element.textContent = newName;
          if (userEmailElement) userEmailElement.textContent = newEmail;

          editForm.style.display = "none";
          infoDisplay.style.display = "block";
          editInfoBtn.style.display = "block";
          updateInfoBtn.style.display = "none";

          alert("Cập nhật thông tin thành công!");
        } else {
          alert("Bạn cần đăng nhập để cập nhật thông tin!");
          await hideLoader();
          window.location.replace("/BaiTapFrontEnd/authenticator/login.html");
          return;
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật thông tin:", error);
        alert("Đã có lỗi xảy ra khi cập nhật thông tin! Vui lòng thử lại sau.");
      } finally {
        await hideLoader();
      }
    });
  }

  // Xử lý đổi mật khẩu cho doiMatKhau.html
  const changePasswordBtn = document.getElementById("changePassword");
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      await showLoader();
      try {
        const oldPasswordInput = document.getElementById("old-password");
        const newPasswordInput = document.getElementById("new-password");
        const confirmPasswordInput =
          document.getElementById("confirm-password");

        if (!oldPasswordInput || !newPasswordInput || !confirmPasswordInput) {
          throw new Error("Một hoặc nhiều trường nhập liệu không tồn tại!");
        }

        const oldPassword = oldPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!oldPassword || !newPassword || !confirmPassword) {
          alert(
            "Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu!"
          );
          return;
        }

        let response = await fetch(`${API_URL}/currentUser`);
        if (!response.ok) throw new Error("Không thể tải currentUser từ API");
        let currentUser = await response.json();

        if (!currentUser || !currentUser.id) {
          alert("Bạn cần đăng nhập để đổi mật khẩu!");
          await hideLoader();
          window.location.replace("/BaiTapFrontEnd/authenticator/login.html");
          return;
        }

        if (oldPassword !== currentUser.password) {
          alert("Mật khẩu cũ không đúng!");
          await hideLoader();
          return;
        }

        if (newPassword !== confirmPassword) {
          alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
          await hideLoader();
          return;
        }

        currentUser.password = newPassword;

        let updateCurrentUserResponse = await fetch(`${API_URL}/currentUser`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentUser),
        });
        if (!updateCurrentUserResponse.ok)
          throw new Error("Không thể cập nhật currentUser");

        let updateUserResponse = await fetch(
          `${API_URL}/users/${currentUser.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser),
          }
        );
        if (!updateUserResponse.ok)
          throw new Error("Không thể cập nhật users/[id]");

        alert("Đổi mật khẩu thành công!");
        await hideLoader();
        window.location.href = "account.html";
      } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        alert("Đã có lỗi xảy ra khi đổi mật khẩu! Vui lòng thử lại sau.");
        await hideLoader();
      }
    });
  }

  // Xử lý quên mật khẩu cho forgot-password.html
  const resetPwBtn = document.getElementById("reset-pw");
  const emailResetInput = document.getElementById("email-reset");
  const passwordResetInput = document.getElementById("password-reset");
  const confirmPasswordResetInput = document.getElementById(
    "confirm-password-reset"
  );
  const errorMessage = document.getElementById("error-message");
  let currentUserEmail = null; // Biến để lưu email đã kiểm tra

  if (
    resetPwBtn &&
    emailResetInput &&
    passwordResetInput &&
    confirmPasswordResetInput &&
    errorMessage
  ) {
    resetPwBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      await showLoader();

      try {
        // Bước 1: Nếu chưa kiểm tra email hoặc chưa tìm thấy email hợp lệ
        if (!currentUserEmail) {
          const email = emailResetInput.value.trim();

          if (!email) {
            errorMessage.textContent = "Vui lòng nhập email!";
            errorMessage.style.display = "block";
            await hideLoader();
            return;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailRegex.test(email)) {
            errorMessage.textContent =
              "Email phải có định dạng hợp lệ (ví dụ: user@gmail.com)!";
            errorMessage.style.display = "block";
            await hideLoader();
            return;
          }

          let response = await fetch(`${API_URL}/users`);
          if (!response.ok)
            throw new Error("Không thể tải danh sách người dùng từ API");
          let users = await response.json();

          const user = users.find((u) => u.email === email);
          if (user) {
            currentUserEmail = email; // Lưu email hợp lệ
            passwordResetInput.style.display = "block"; // Hiển thị input mật khẩu mới
            confirmPasswordResetInput.style.display = "block"; // Hiển thị input xác nhận mật khẩu
            errorMessage.style.display = "none";
            resetPwBtn.textContent = "Khôi phục mật khẩu";
          } else {
            errorMessage.textContent = "Email không tồn tại trong hệ thống!";
            errorMessage.style.display = "block";
          }
          await hideLoader();
          return;
        }

        // Bước 2: Nếu email đã được kiểm tra, xử lý đặt lại mật khẩu
        const newPassword = passwordResetInput.value.trim();
        const confirmPassword = confirmPasswordResetInput.value.trim();

        if (!newPassword || !confirmPassword) {
          errorMessage.textContent =
            "Vui lòng nhập mật khẩu mới và xác nhận mật khẩu!";
          errorMessage.style.display = "block";
          await hideLoader();
          return;
        }

        if (newPassword !== confirmPassword) {
          errorMessage.textContent =
            "Mật khẩu mới và xác nhận mật khẩu không khớp!";
          errorMessage.style.display = "block";
          await hideLoader();
          return;
        }

        let response = await fetch(`${API_URL}/users`);
        if (!response.ok)
          throw new Error("Không thể tải danh sách người dùng từ API");
        let users = await response.json();

        const user = users.find((u) => u.email === currentUserEmail);
        if (user) {
          user.password = newPassword;

          let updateResponse = await fetch(`${API_URL}/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          });
          if (!updateResponse.ok)
            throw new Error("Không thể cập nhật mật khẩu");

          alert("Đặt lại mật khẩu thành công!");
          await hideLoader();
          window.location.href = "/BaiTapFrontEnd/authenticator/login.html";
        } else {
          errorMessage.textContent = "Người dùng không được tìm thấy!";
          errorMessage.style.display = "block";
          await hideLoader();
        }
      } catch (error) {
        console.error("Lỗi khi xử lý quên mật khẩu:", error);
        errorMessage.textContent = "Đã có lỗi xảy ra! Vui lòng thử lại sau.";
        errorMessage.style.display = "block";
        await hideLoader();
      }
    });
  }

  if (window.location.pathname.includes("account.html")) {
    loadUserInfo();
  }
});
