const modal = document.getElementById("modalAlert");
const closeModal = document.getElementById("closeModal");

document.getElementById("loginButton").addEventListener("click", function () {
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!email || !username || !password) {
    modal.classList.remove("hidden"); // Show the modal
    return;
  }

  // Simulasi login (dapat diganti dengan API backend)
  console.log({ email, username, password });
  alert("Login berhasil! Anda akan diarahkan ke dashboard.");
  window.location.href = "./dashboard.html";
});

closeModal.addEventListener("click", function () {
  modal.classList.add("hidden"); // Hide the modal
});

document.getElementById("whatsappLogin").addEventListener("click", function () {
  window.location.href = "./../../../src/page/whatsauth/index.html";
});
