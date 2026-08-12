// ===== DATA USER (ROLE) =====
const users = [
  {
    username: "admin",
    password: "123",
    role: "admin"
  },
  {
    username: "bendahara",
    password: "123",
    role: "bendahara"
  }
];


// ===== FORMAT RUPIAH =====
function rupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(angka) || 0);
}


// ===== LOGIN =====
function login() {

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value;


  if (!username || !password) {

    alert("Username dan password wajib diisi!");

    return;
  }


  const user = users.find(
    u =>
      u.username === username &&
      u.password === password
  );


  if (user) {

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );


    alert("Login berhasil! ✅");


    window.location.href =
      "dashboard_baru.html";

  } else {

    alert("Username atau password salah! ❌");

  }
}


// ===== TAMPILKAN PASSWORD =====
function togglePassword() {

  const password =
    document.getElementById("password");


  if (password.type === "password") {

    password.type = "text";

  } else {

    password.type = "password";

  }
}


// ===== LOGOUT =====
function logout() {

  localStorage.removeItem("user");

  window.location.href =
    "index.html";
}


// ===== CEK LOGIN =====
function cekLogin() {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );


  if (!user) {

    window.location.href =
      "index.html";

    return null;
  }


  const role =
    document.getElementById("role");


  if (role) {

    role.innerText =
      "Login sebagai: " + user.role;

  }


  return user;
}


// ===== TAMBAH DATA =====
function tambahData() {

  const tanggal =
    document.getElementById("tanggal").value;

  const nama =
    document.getElementById("nama").value.trim();

  const jumlah =
    parseInt(
      document.getElementById("jumlah").value
    );

  const keterangan =
    document
      .getElementById("keterangan")
      .value.trim();

  const tipe =
    document.getElementById("tipe").value;


  // VALIDASI
  if (!tanggal) {

    alert("Tanggal wajib diisi!");

    return;
  }


  if (!nama) {

    alert("Nama wajib diisi!");

    return;
  }


  if (!jumlah || jumlah <= 0) {

    alert("Jumlah harus lebih dari 0!");

    return;
  }


  // AMBIL DATA
  let data =
    JSON.parse(
      localStorage.getItem("kas")
    ) || [];


  // TAMBAHKAN DATA
  data.push({

    tanggal: tanggal,

    nama: nama,

    jumlah: jumlah,

    keterangan: keterangan,

    tipe: tipe

  });


  // SIMPAN
  localStorage.setItem(
    "kas",
    JSON.stringify(data)
  );


  alert("Data berhasil disimpan! ✅");


  // RESET FORM
  document.getElementById("nama").value = "";

  document.getElementById("jumlah").value = "";

  document.getElementById("keterangan").value = "";


  // UPDATE
  loadData();
}


// ===== LOAD DATA =====
function loadData() {

  let data =
    JSON.parse(
      localStorage.getItem("kas")
    ) || [];


  let html = "";

  let saldo = 0;

  let totalMasuk = 0;

  let totalKeluar = 0;


  data.forEach((d, index) => {


    const jumlah =
      Number(d.jumlah) || 0;


    // HITUNG SALDO
    if (d.tipe === "masuk") {

      saldo += jumlah;

      totalMasuk += jumlah;

    } else {

      saldo -= jumlah;

      totalKeluar += jumlah;

    }


    // TAMPILKAN DATA
    html += `

      <div class="item">

        <strong>
          ${d.nama}
        </strong>

        <br>

        <small>
          ${d.tanggal}
        </small>

        <br>


        <span class="${d.tipe}">

          ${rupiah(jumlah)}

          (${d.tipe})

        </span>


        <br>


        ${
          d.keterangan
            ? d.keterangan
            : ""
        }


        <br>


        <button
          class="hapus"
          onclick="hapusData(${index})">

          Hapus

        </button>

      </div>

    `;

  });


  // TAMPILKAN DATA TRANSAKSI
  const dataElement =
    document.getElementById("data");


  if (dataElement) {

    dataElement.innerHTML =
      html;

  }


  // ===== TOTAL PEMASUKAN =====
  const masukElement =
    document.getElementById("totalMasuk");


  if (masukElement) {

    masukElement.innerText =
      rupiah(totalMasuk);

  }


  // ===== TOTAL PENGELUARAN =====
  const keluarElement =
    document.getElementById("totalKeluar");


  if (keluarElement) {

    keluarElement.innerText =
      rupiah(totalKeluar);

  }


  // ===== SALDO =====
  const saldoElement =
    document.getElementById("saldo");


  if (saldoElement) {

    saldoElement.innerText =
      rupiah(saldo);


    // Kalau saldo minus → merah
    if (saldo < 0) {

      saldoElement.style.color =
        "#dc2626";

    } else {

      saldoElement.style.color =
        "#2563eb";

    }

  }

}


// ===== HAPUS DATA =====
function hapusData(index) {

  let data =
    JSON.parse(
      localStorage.getItem("kas")
    ) || [];


  if (!data[index]) {

    return;
  }


  const yakin =
    confirm(
      "Yakin ingin menghapus data ini?"
    );


  if (!yakin) {

    return;
  }


  data.splice(index, 1);


  localStorage.setItem(
    "kas",
    JSON.stringify(data)
  );


  loadData();

}


// ===== EDIT DATA =====
function bukaEdit(index) {

  let data =
    JSON.parse(
      localStorage.getItem("kas")
    ) || [];


  const d =
    data[index];


  if (!d) {

    return;
  }


  const editIndex =
    document.getElementById("editIndex");

  const editTanggal =
    document.getElementById("editTanggal");

  const editNama =
    document.getElementById("editNama");

  const editJumlah =
    document.getElementById("editJumlah");

  const editKeterangan =
    document.getElementById("editKeterangan");

  const editTipe =
    document.getElementById("editTipe");


  if (editIndex) {

    editIndex.value =
      index;

  }


  if (editTanggal) {

    editTanggal.value =
      d.tanggal;

  }


  if (editNama) {

    editNama.value =
      d.nama;

  }


  if (editJumlah) {

    editJumlah.value =
      d.jumlah;

  }


  if (editKeterangan) {

    editKeterangan.value =
      d.keterangan || "";

  }


  if (editTipe) {

    editTipe.value =
      d.tipe;

  }


  const modal =
    document.getElementById("editModal");


  if (modal) {

    modal.style.display =
      "flex";

  }

}


// ===== TUTUP EDIT =====
function closeEdit() {

  const modal =
    document.getElementById("editModal");


  if (modal) {

    modal.style.display =
      "none";

  }

}


// ===== SIMPAN EDIT =====
function simpanEdit() {

  const index =
    Number(
      document.getElementById("editIndex").value
    );


  let data =
    JSON.parse(
      localStorage.getItem("kas")
    ) || [];


  if (!data[index]) {

    return;
  }


  const tanggal =
    document
      .getElementById("editTanggal")
      .value;

  const nama =
    document
      .getElementById("editNama")
      .value.trim();

  const jumlah =
    Number(
      document
        .getElementById("editJumlah")
        .value
    );

  const keterangan =
    document
      .getElementById("editKeterangan")
      .value.trim();

  const tipe =
    document
      .getElementById("editTipe")
      .value;


  if (!tanggal || !nama || !jumlah) {

    alert("Data belum lengkap!");

    return;
  }


  data[index] = {

    tanggal: tanggal,

    nama: nama,

    jumlah: jumlah,

    keterangan: keterangan,

    tipe: tipe

  };


  localStorage.setItem(
    "kas",
    JSON.stringify(data)
  );


  closeEdit();

  loadData();

}


// ===== AUTO JALAN DI DASHBOARD =====
if (
  window.location.pathname.includes(
    "dashboard_baru.html"
  )
) {

  const user =
    cekLogin();


  if (user) {

    loadData();

  }

}