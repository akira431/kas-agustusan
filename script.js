// ======================================================
// FIREBASE FIRESTORE
// ======================================================

const firebaseConfig = {
  apiKey: "AIzaSyAKzYZWI1pCfdZc3cRViR_ZNqiGb3hPnrk",
  authDomain: "kas-agustusan.firebaseapp.com",
  databaseURL: "https://kas-agustusan-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kas-agustusan",
  storageBucket: "kas-agustusan.firebasestorage.app",
  messagingSenderId: "153182535190",
  appId: "1:153182535190:web:2c7aa71890c2a323d77f37",
  measurementId: "G-RYS2V5J9B1"
};


// Jalankan Firebase
firebase.initializeApp(firebaseConfig);

// Koneksi Firestore
const db = firebase.firestore();


// ======================================================
// DATA USER
// ======================================================

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


// ======================================================
// FORMAT RUPIAH
// ======================================================

function rupiah(angka) {

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(angka) || 0);

}


// ======================================================
// LOGIN
// ======================================================

function login() {

  const usernameElement =
    document.getElementById("username");

  const passwordElement =
    document.getElementById("password");


  if (!usernameElement || !passwordElement) {

    return;

  }


  const username =
    usernameElement.value.trim();

  const password =
    passwordElement.value;


  if (!username || !password) {

    alert("Username dan password wajib diisi!");

    return;

  }


  const user = users.find(
    function (u) {

      return (
        u.username === username &&
        u.password === password
      );

    }
  );


  if (user) {

    // Login hanya untuk mengingat sesi perangkat
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );


    alert("Login berhasil! ✅");


    window.location.href =
      "dashboard_baru.html";


  } else {

    alert(
      "Username atau password salah! ❌"
    );

  }

}


// ======================================================
// TOGGLE PASSWORD
// ======================================================

function togglePassword() {

  const password =
    document.getElementById("password");


  if (!password) {

    return;

  }


  if (password.type === "password") {

    password.type = "text";

  } else {

    password.type = "password";

  }

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

  localStorage.removeItem("user");

  window.location.href =
    "index.html";

}


// ======================================================
// CEK LOGIN
// ======================================================

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


  const roleElement =
    document.getElementById("role");


  if (roleElement) {

    roleElement.innerText =
      "Login sebagai: " + user.role;

  }


  return user;

}


// ======================================================
// TAMBAH DATA KE FIRESTORE
// ======================================================

async function tambahData() {

  try {

    const tanggalElement =
      document.getElementById("tanggal");

    const namaElement =
      document.getElementById("nama");

    const jumlahElement =
      document.getElementById("jumlah");

    const keteranganElement =
      document.getElementById("keterangan");

    const tipeElement =
      document.getElementById("tipe");


    if (
      !tanggalElement ||
      !namaElement ||
      !jumlahElement ||
      !tipeElement
    ) {

      alert(
        "Form tidak ditemukan. Periksa ID input di dashboard."
      );

      return;

    }


    const tanggal =
      tanggalElement.value;

    const nama =
      namaElement.value.trim();

    const jumlah =
      Number(jumlahElement.value);

    const keterangan =
      keteranganElement
        ? keteranganElement.value.trim()
        : "";

    const tipe =
      tipeElement.value;


    // VALIDASI

    if (!tanggal) {

      alert("Tanggal wajib diisi!");

      return;

    }


    if (!nama) {

      alert("Nama wajib diisi!");

      return;

    }


    if (
      !jumlah ||
      jumlah <= 0 ||
      !Number.isFinite(jumlah)
    ) {

      alert("Jumlah harus lebih dari 0!");

      return;

    }


    if (
      tipe !== "masuk" &&
      tipe !== "keluar"
    ) {

      alert(
        "Tipe transaksi tidak valid!"
      );

      return;

    }


    // SIMPAN KE FIRESTORE

    await db.collection("kas").add({

      tanggal: tanggal,

      nama: nama,

      jumlah: jumlah,

      keterangan: keterangan,

      tipe: tipe,

      createdAt:
        firebase.firestore.FieldValue.serverTimestamp(),

      createdBy:
        getCurrentUserUsername()

    });


    alert(
      "Data berhasil disimpan ke database! ✅"
    );


    // RESET FORM

    namaElement.value = "";

    jumlahElement.value = "";

    if (keteranganElement) {

      keteranganElement.value = "";

    }


    // Tidak perlu loadData()
    // karena onSnapshot() akan otomatis
    // memperbarui tampilan.


  } catch (error) {

    console.error(
      "ERROR TAMBAH DATA:",
      error
    );


    alert(
      "Gagal menyimpan data!\n\n" +
      error.message
    );

  }

}


// ======================================================
// AMBIL USER YANG SEDANG LOGIN
// ======================================================

function getCurrentUserUsername() {

  try {

    const user =
      JSON.parse(
        localStorage.getItem("user")
      );


    if (user && user.username) {

      return user.username;

    }

  } catch (error) {

    console.error(error);

  }


  return "unknown";

}


// ======================================================
// LOAD DATA REALTIME DARI FIRESTORE
// ======================================================

let unsubscribeKas = null;


function loadData() {

  // Kalau listener sebelumnya masih ada,
  // hentikan terlebih dahulu.

  if (unsubscribeKas) {

    unsubscribeKas();

    unsubscribeKas = null;

  }


  unsubscribeKas =
    db.collection("kas")
      .orderBy("tanggal", "desc")
      .onSnapshot(

        function (snapshot) {

          let html = "";

          let saldo = 0;

          let totalMasuk = 0;

          let totalKeluar = 0;


          // ==========================================
          // LOOP DATA FIRESTORE
          // ==========================================

          snapshot.forEach(
            function (doc) {

              const d =
                doc.data();

              const id =
                doc.id;


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


              // ========================================
              // TAMPILKAN DATA
              // ========================================

              html += `

                <div class="item">

                  <strong>
                    ${escapeHTML(d.nama || "-")}
                  </strong>

                  <br>

                  <small>
                    ${escapeHTML(d.tanggal || "-")}
                  </small>

                  <br>

                  <span class="${d.tipe}">

                    ${rupiah(jumlah)}

                    ${
                      d.tipe === "masuk"
                        ? "(Pemasukan)"
                        : "(Pengeluaran)"
                    }

                  </span>

                  ${
                    d.keterangan
                      ? `
                        <br>
                        <small>
                          ${escapeHTML(d.keterangan)}
                        </small>
                      `
                      : ""
                  }

                  <br><br>

                  <button
                    class="edit"
                    onclick="bukaEdit('${id}')">

                    Edit

                  </button>

                  <button
                    class="hapus"
                    onclick="hapusData('${id}')">

                    Hapus

                  </button>

                </div>

              `;

            }
          );


          // ==========================================
          // TAMPILKAN LIST DATA
          // ==========================================

          const dataElement =
            document.getElementById("data");


          if (dataElement) {

            if (html === "") {

              dataElement.innerHTML = `

                <div class="empty">

                  Belum ada data kas.

                </div>

              `;

            } else {

              dataElement.innerHTML =
                html;

            }

          }


          // ==========================================
          // TOTAL PEMASUKAN
          // ==========================================

          const masukElement =
            document.getElementById("totalMasuk");


          if (masukElement) {

            masukElement.innerText =
              rupiah(totalMasuk);

          }


          // ==========================================
          // TOTAL PENGELUARAN
          // ==========================================

          const keluarElement =
            document.getElementById("totalKeluar");


          if (keluarElement) {

            keluarElement.innerText =
              rupiah(totalKeluar);

          }


          // ==========================================
          // SALDO
          // ==========================================

          const saldoElement =
            document.getElementById("saldo");


          if (saldoElement) {

            saldoElement.innerText =
              rupiah(saldo);


            if (saldo < 0) {

              saldoElement.style.color =
                "#dc2626";

            } else {

              saldoElement.style.color =
                "#2563eb";

            }

          }

        },


        function (error) {

          console.error(
            "ERROR FIRESTORE:",
            error
          );


          alert(
            "Gagal mengambil data dari Firestore!\n\n" +
            error.message
          );

        }

      );

}


// ======================================================
// HAPUS DATA FIRESTORE
// ======================================================

async function hapusData(id) {

  const yakin =
    confirm(
      "Yakin ingin menghapus data ini?"
    );


  if (!yakin) {

    return;

  }


  try {

    await db
      .collection("kas")
      .doc(id)
      .delete();


    alert(
      "Data berhasil dihapus! ✅"
    );


  } catch (error) {

    console.error(
      "ERROR HAPUS:",
      error
    );


    alert(
      "Gagal menghapus data!\n\n" +
      error.message
    );

  }

}


// ======================================================
// EDIT DATA FIRESTORE
// ======================================================

async function bukaEdit(id) {

  try {

    const doc =
      await db
        .collection("kas")
        .doc(id)
        .get();


    if (!doc.exists) {

      alert(
        "Data tidak ditemukan!"
      );

      return;

    }


    const d =
      doc.data();


    // ================================================
    // TANGGAL
    // ================================================

    const tanggal =
      prompt(
        "Tanggal:",
        d.tanggal || ""
      );


    if (tanggal === null) {

      return;

    }


    // ================================================
    // NAMA
    // ================================================

    const nama =
      prompt(
        "Nama:",
        d.nama || ""
      );


    if (nama === null) {

      return;

    }


    // ================================================
    // JUMLAH
    // ================================================

    const jumlah =
      prompt(
        "Jumlah:",
        d.jumlah || 0
      );


    if (jumlah === null) {

      return;

    }


    // ================================================
    // TIPE
    // ================================================

    const tipe =
      prompt(
        "Tipe (masuk/keluar):",
        d.tipe || "masuk"
      );


    if (tipe === null) {

      return;

    }


    // ================================================
    // KETERANGAN
    // ================================================

    const keterangan =
      prompt(
        "Keterangan:",
        d.keterangan || ""
      );


    if (keterangan === null) {

      return;

    }


    const jumlahAngka =
      Number(jumlah);


    if (
      !jumlahAngka ||
      jumlahAngka <= 0 ||
      !Number.isFinite(jumlahAngka)
    ) {

      alert(
        "Jumlah tidak valid!"
      );

      return;

    }


    if (
      tipe !== "masuk" &&
      tipe !== "keluar"
    ) {

      alert(
        "Tipe harus 'masuk' atau 'keluar'!"
      );

      return;

    }


    // ================================================
    // UPDATE FIRESTORE
    // ================================================

    await db
      .collection("kas")
      .doc(id)
      .update({

        tanggal: tanggal,

        nama: nama.trim(),

        jumlah: jumlahAngka,

        tipe: tipe,

        keterangan:
          keterangan.trim(),

        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp(),

        updatedBy:
          getCurrentUserUsername()

      });


    alert(
      "Data berhasil diperbarui! ✅"
    );


  } catch (error) {

    console.error(
      "ERROR EDIT:",
      error
    );


    alert(
      "Gagal mengedit data!\n\n" +
      error.message
    );

  }

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(text) {

  const div =
    document.createElement("div");


  div.textContent =
    text == null
      ? ""
      : String(text);


  return div.innerHTML;

}


// ======================================================
// AUTO JALAN DI DASHBOARD
// ======================================================

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
