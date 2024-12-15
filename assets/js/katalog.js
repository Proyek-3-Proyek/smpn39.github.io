// Open Modal Function
function openOrderModal(button) {
  // Navigasi DOM untuk mendapatkan elemen parent dari tombol
  const card = button.closest(".card");

  // Ambil data dari elemen dalam card
  const name = card.querySelector("#nama_produk").textContent.trim();
  const description = card.querySelector("#deskrip_produk").textContent.trim();
  const image = card.querySelector(".img-box img").src;
  const priceText = card.querySelector("#harga_produk").textContent.trim();
  const price = parseInt(priceText.replace(/\D/g, "")); // Hapus teks non-numerik
  const stock = parseInt(
    card.querySelector("#stock_produk").textContent.replace(/\D/g, "")
  ); // Ambil stok produk dari card

  // Panggil modal dengan data produk
  document.getElementById("modalProductName").textContent = name;
  document.getElementById("modalProductDescription").textContent = description;
  document.getElementById("modalProductImage").src = image;
  document.getElementById("modalProductPrice").textContent =
    price.toLocaleString();
  document.getElementById("modalProductStock").textContent = stock; // Set stok di modal

  // Tampilkan modal
  document.getElementById("orderModal").classList.add("show");
  document.querySelector(".background-modal").classList.add("show");
}
// ---------------------------------------------------

// Close Modal Function
function closeOrderModal() {
  document.getElementById("orderModal").classList.remove("show");
  document.querySelector(".background-modal").classList.remove("show");
}

// Prevent Background Modal from Closing Modal
document
  .querySelector(".background-modal")
  .addEventListener("click", (event) => {
    const modal = document.getElementById("orderModal");
    if (!modal.contains(event.target)) {
      closeOrderModal();
    }
  });

// Prevent Propagation of Click Inside Modal
document.querySelector(".modal").addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent click inside modal from closing it
});

async function orderProduct() {
  const quantity = parseInt(
    document.getElementById("modalProductQuantity").value
  );
  const stock = parseInt(
    document.getElementById("modalProductStock").textContent
  );

  // Validasi jumlah pesanan
  if (quantity > stock) {
    Swal.fire({
      icon: "error",
      title: "Stok Tidak Cukup!",
      text: "Jumlah produk yang dipesan melebihi stok yang tersedia.",
    });
    return;
  }

  if (quantity < 1) {
    Swal.fire({
      icon: "error",
      title: "Jumlah Tidak Valid!",
      text: "Jumlah produk harus minimal 1.",
    });
    return;
  }

  // Ambil detail produk dari modal
  const productId = document.getElementById("modalProductId").value || 0; // ID produk
  const productName = document.getElementById("modalProductName").textContent;
  const rawPrice = document.getElementById("modalProductPrice").textContent;
  const productPrice = parseInt(rawPrice.replace(/[^\d]/g, "")); // Ambil angka dari harga
  const totalHarga = quantity * productPrice;

  // Ambil token dari localStorage
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Belum Login!",
      text: "Anda harus login untuk melakukan pemesanan.",
    });
    return;
  }

  // Buat data untuk dikirim ke backend
  const orderData = {
    id_produk: productId,
    jumlah: quantity,
    total_harga: totalHarga,
  };

  try {
    Swal.fire({
      title: "Sedang Memproses...",
      text: "Mohon tunggu sebentar.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch(
      "https://backend-eight-phi-75.vercel.app/api/payment/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal Membuat Pesanan",
        text: errorData.message,
      });
      return;
    }

    const result = await response.json();

    // Tampilkan pesan sukses
    Swal.fire({
      icon: "success",
      title: "Pesanan Berhasil!",
      text: "Pesanan Anda berhasil dibuat.",
      confirmButtonText: "Lanjutkan ke Pembayaran",
    }).then(() => {
      // Arahkan ke halaman pembayaran Midtrans
      window.location.href = result.data.snap_url;
    });
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    Swal.fire({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: "Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.",
    });
  }
}

// ------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".container-card");

  // Ambil token dari localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Anda belum login. Silakan login terlebih dahulu.");
    // Redirect ke halaman login jika token tidak ditemukan
    window.location.href =
      "https://proyek-3-proyek.github.io/tokline.github.io/src/page/auth/login.html";
    return;
  }

  try {
    const response = await fetch(
      "https://backend-eight-phi-75.vercel.app/api/produk/all",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        alert("Sesi login Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("token"); // Hapus token yang sudah tidak valid
        window.location.href =
          "https://proyek-3-proyek.github.io/tokline.github.io/auth/login.html";
        return;
      }
      throw new Error("Gagal mengambil data produk");
    }

    const produkList = await response.json();
    container.innerHTML = ""; // Kosongkan container sebelum mengisi

    produkList.forEach((produk) => {
      const card = `
        <div class="card" style="--clr: #009688">
          <div class="img-box">
            <img src="https://qzbythadanrtksusxdtq.supabase.co/storage/v1/object/public/gambar/${produk.gambar}" width="100" height="100" />
          </div>
          <div class="content">
            <h2 id="nama_produk" class="pt-3">${produk.nama}</h2>
            <p id="deskrip_produk" class="p-3">${produk.deskripsi}</p>
            <div class="harstok pb-5">
              <p id="harga_produk" class="text-sky-400">Harga: Rp. ${produk.harga}</p>
            </div>
            <div class="stock pb-5">
              <p id="stock_produk" class="text-sky-400">Stok: ${produk.qty}</p> <!-- Menampilkan stok di card -->
            </div>
            <button class="button-buy" onclick="openOrderModal(this)">
              Beli
            </button>
          </div>
        </div>`;
      container.innerHTML += card;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p>Gagal memuat produk. Coba lagi nanti.</p>`;
  }
});

// ------------------------------------------------------------------------------------

// logout botton
function checkLoginStatus() {
  // Cek status login dari localStorage
  const token = localStorage.getItem("token"); // Simpan token login di localStorage
  return token !== null; // Jika token ada, anggap user sudah login
}

function updateLoginButton() {
  const profileContainer = document.querySelector(".profil");

  if (checkLoginStatus()) {
    // Jika user sudah login, tampilkan tombol Logout
    profileContainer.innerHTML = `
      <button
        id="logoutButton"
        class="pr-7 pl-7 pb-2 pt-2 bg-red-500 hover:bg-red-700 rounded-3xl text-white"
      >
        Logout
      </button>
    `;

    // Tambahkan event listener untuk tombol Logout
    document.getElementById("logoutButton").addEventListener("click", () => {
      localStorage.removeItem("token"); // Hapus token dari localStorage
      alert("Anda telah logout.");
      updateLoginButton(); // Perbarui tampilan tombol
    });
  } else {
    // Jika user belum login, tampilkan tombol Login
    profileContainer.innerHTML = `
    <a
      href="${window.location.origin}/tokline.github.io/src/page/auth/login.html"
      class="pr-7 pl-7 pb-2 pt-2 bg-sky-500 hover:bg-sky-700 rounded-3xl text-white"
    >
      Login
    </a>
  `;
  }
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", updateLoginButton);

document.addEventListener("DOMContentLoaded", () => {
  // Pastikan elemen ditemukan sebelum menambahkan event listener
  const belanjaLink = document.querySelector(
    "a[href='./src/page/katalog/index.html']"
  );

  if (belanjaLink) {
    belanjaLink.addEventListener("click", function (event) {
      event.preventDefault(); // Mencegah perilaku default link
      window.location.href = "./src/page/katalog/index.html"; // Arahkan ke halaman belanja
    });
  } else {
    console.log("Elemen Belanja tidak ditemukan di halaman.");
  }
});
