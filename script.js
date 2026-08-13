// ======================================================
// 🔥 FIREBASE CONFIG
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


// ======================================================
// 🔥 INIT FIREBASE
// ======================================================

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();


// ======================================================
// 💰 FORMAT RUPIAH
// ======================================================

function rupiah(angka) {

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(Number(angka || 0));

}


// ======================================================
// 🔐 LOGIN
// ======================================================

function login() {

  const username =
    document.getElementById("username");

  const password =
    document.getElementById("password");

  const loginBtn =
    document.getElementById("loginBtn");

  const errorBox =
    document.getElementById("error");


  if (!username || !password) {

    console.error(
      "Input username atau password tidak ditemukan."
    );

    return;

  }


  const email =
    username.value.trim();

  const pass =
    password.value;


  // Bersihkan error
  if (errorBox) {

    errorBox.style.display = "none";
    errorBox.textContent = "";

  }


  // Validasi
  if (!email) {

    tampilkanError(
      "Username / email wajib diisi."
    );

    username.focus();

    return;

  }


  if (!pass) {

    tampilkanError(
      "Password wajib diisi."
    );

    password.focus();

    return;

  }


  // Loading
  if (loginBtn) {

    loginBtn.disabled = true;

    loginBtn.textContent =
      "⏳ Memproses...";

  }


  // Firebase Login
  auth.signInWithEmailAndPassword(
    email,
    pass
  )

  .then(function(userCredential) {

    console.log(
      "LOGIN BERHASIL:",
      userCredential.user.email
    );


    if (loginBtn) {

      loginBtn.textContent =
        "✅ Berhasil masuk...";

    }


    // Pindah dashboard
    window.location.href =
      "dashboard_baru.html";

  })

  .catch(function(error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    let pesan =
      "Username atau password salah.";


    switch (error.code) {

      case "auth/user-not-found":

        pesan =
          "Username / email belum terdaftar.";

        break;


      case "auth/wrong-password":

        pesan =
          "Password yang dimasukkan salah.";

        break;


      case "auth/invalid-credential":

        pesan =
          "Username atau password salah.";

        break;


      case "auth/invalid-email":

        pesan =
          "Username harus menggunakan email yang terdaftar.";

        break;


      case "auth/too-many-requests":

        pesan =
          "Terlalu banyak percobaan login. Coba beberapa saat lagi.";

        break;


      case "auth/network-request-failed":

        pesan =
          "Tidak dapat terhubung ke Firebase. Periksa koneksi internet.";

        break;

    }


    tampilkanError(pesan);


    // Aktifkan tombol lagi
    if (loginBtn) {

      loginBtn.disabled = false;

      loginBtn.textContent =
        "Masuk ke Dashboard →";

    }

  });

}


// ======================================================
// ❌ TAMPILKAN ERROR LOGIN
// ======================================================

function tampilkanError(pesan) {

  const errorBox =
    document.getElementById("error");


  if (!errorBox) {

    alert(pesan);

    return;

  }


  errorBox.textContent =
    "❌ " + pesan;

  errorBox.style.display =
    "block";

}


// ======================================================
// 👁️ SHOW / HIDE PASSWORD
// ======================================================

function togglePassword() {

  const password =
    document.getElementById("password");

  const button =
    document.querySelector(".toggle");


  if (!password) return;


  if (password.type === "password") {

    password.type = "text";


    if (button) {

      button.textContent = "🙈";

      button.setAttribute(
        "aria-label",
        "Sembunyikan password"
      );

    }

  }

  else {

    password.type = "password";


    if (button) {

      button.textContent = "👁️";

      button.setAttribute(
        "aria-label",
        "Tampilkan password"
      );

    }

  }

}


// ======================================================
// 🔐 CEK LOGIN DASHBOARD
// ======================================================

function initDashboard() {

  auth.onAuthStateChanged(function(user) {

    if (!user) {

      window.location.href =
        "index.html";

      return;

    }


    const roleElement =
      document.getElementById("role");


    if (roleElement) {

      roleElement.textContent =
        user.email || "Admin";

    }


    loadData();

  });

}


// ======================================================
// 🚪 LOGOUT
// ======================================================

function logout() {

  auth.signOut()

    .then(function() {

      window.location.href =
        "index.html";

    })

    .catch(function(error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

      alert(
        "Gagal keluar."
      );

    });

}


// ======================================================
// ➕ TAMBAH DATA
// ======================================================

async function tambahData() {

  const tanggal =
    document.getElementById("tanggal").value;

  const nama =
    document.getElementById("nama")
      .value
      .trim();

  const jumlah =
    Number(
      document.getElementById("jumlah").value
    );

  const keterangan =
    document.getElementById("keterangan")
      .value
      .trim();

  const tipe =
    document.getElementById("tipe").value;


  if (!tanggal) {

    alert(
      "Silakan pilih tanggal."
    );

    return;

  }


  if (!nama) {

    alert(
      "Silakan isi nama / sumber."
    );

    return;

  }


  if (!jumlah || jumlah <= 0) {

    alert(
      "Jumlah harus lebih dari 0."
    );

    return;

  }


  try {

    await db.collection("kas").add({

      tanggal: tanggal,

      nama: nama,

      jumlah: jumlah,

      keterangan: keterangan,

      tipe: tipe,

      createdAt:
        firebase.firestore.FieldValue
          .serverTimestamp()

    });


    alert(
      "✅ Transaksi berhasil disimpan."
    );


    document.getElementById(
      "tanggal"
    ).value = "";

    document.getElementById(
      "nama"
    ).value = "";

    document.getElementById(
      "jumlah"
    ).value = "";

    document.getElementById(
      "keterangan"
    ).value = "";

    document.getElementById(
      "tipe"
    ).value = "masuk";


    loadData();

  }

  catch (error) {

    console.error(
      "SIMPAN ERROR:",
      error
    );


    alert(
      "❌ Data gagal disimpan.\n\n" +
      error.message
    );

  }

}


// ======================================================
// 📋 LOAD DATA
// ======================================================

async function loadData() {

  const container =
    document.getElementById("data");


  if (!container) return;


  const searchInput =
    document.getElementById("search");

  const filterInput =
    document.getElementById("filter");


  const search =
    (searchInput?.value || "")
      .toLowerCase()
      .trim();


  const filter =
    filterInput?.value || "semua";


  container.innerHTML =
    `<div class="empty">
      ⏳ Memuat data...
    </div>`;


  try {

    const snapshot =
      await db.collection("kas")
        .orderBy(
          "tanggal",
          "desc"
        )
        .get();


    let totalMasuk = 0;
    let totalKeluar = 0;
    let jumlahTampil = 0;

    let html = "";


    snapshot.forEach(
      function(doc) {

        const d =
          doc.data();


        const nama =
          d.nama || "";


        const keterangan =
          d.keterangan || "";


        const tipe =
          d.tipe || "masuk";


        const jumlah =
          Number(
            d.jumlah || 0
          );


        // Total
        if (
          tipe === "masuk"
        ) {

          totalMasuk +=
            jumlah;

        }

        else {

          totalKeluar +=
            jumlah;

        }


        // Filter
        if (
          filter !== "semua" &&
          tipe !== filter
        ) {

          return;

        }


        // Search
        const teks =
          (
            nama +
            " " +
            keterangan +
            " " +
            (d.tanggal || "")
          )
          .toLowerCase();


        if (
          search &&
          !teks.includes(search)
        ) {

          return;

        }


        jumlahTampil++;


        const jenisText =
          tipe === "masuk"
            ? "Pemasukan"
            : "Pengeluaran";


        const amountClass =
          tipe === "masuk"
            ? "masuk"
            : "keluar";


        const tanda =
          tipe === "masuk"
            ? "+"
            : "-";


        html += `

          <div class="item">

            <div class="item-main">

              <div class="item-name">
                ${escapeHTML(nama)}
              </div>

              <div class="item-meta">
                ${formatTanggal(
                  d.tanggal
                )}
                • ${jenisText}
              </div>

              ${
                keterangan
                  ? `
                    <div class="item-desc">
                      ${escapeHTML(
                        keterangan
                      )}
                    </div>
                  `
                  : ""
              }

            </div>


            <div>

              <div class="
                amount
                ${amountClass}
              ">

                ${tanda}
                ${rupiah(jumlah)}

              </div>


              <div class="actions">

                <button
                  class="action edit"
                  onclick="editData('${doc.id}')"
                >
                  Edit
                </button>


                <button
                  class="action hapus"
                  onclick="hapusData('${doc.id}')"
                >
                  Hapus
                </button>

              </div>

            </div>

          </div>

        `;

      }
    );


    if (!html) {

      html = `
        <div class="empty">
          📭 Tidak ada transaksi.
        </div>
      `;

    }


    container.innerHTML =
      html;


    const totalMasukElement =
      document.getElementById(
        "totalMasuk"
      );


    const totalKeluarElement =
      document.getElementById(
        "totalKeluar"
      );


    const saldoElement =
      document.getElementById(
        "saldo"
      );


    const jumlahDataElement =
      document.getElementById(
        "jumlahData"
      );


    if (totalMasukElement) {

      totalMasukElement.textContent =
        rupiah(totalMasuk);

    }


    if (totalKeluarElement) {

      totalKeluarElement.textContent =
        rupiah(totalKeluar);

    }


    if (saldoElement) {

      saldoElement.textContent =
        rupiah(
          totalMasuk -
          totalKeluar
        );

    }


    if (jumlahDataElement) {

      jumlahDataElement.textContent =
        jumlahTampil +
        " transaksi";

    }

  }

  catch (error) {

    console.error(
      "LOAD DATA ERROR:",
      error
    );


    container.innerHTML = `

      <div class="empty">

        ❌ Gagal memuat data.

        <br><br>

        ${escapeHTML(
          error.message
        )}

      </div>

    `;

  }

}


// ======================================================
// ✏️ EDIT DATA
// ======================================================

async function editData(id) {

  try {

    const doc =
      await db.collection("kas")
        .doc(id)
        .get();


    if (!doc.exists) {

      alert(
        "Data tidak ditemukan."
      );

      return;

    }


    const d =
      doc.data();


    document.getElementById(
      "editIndex"
    ).value = id;


    document.getElementById(
      "editTanggal"
    ).value =
      d.tanggal || "";


    document.getElementById(
      "editNama"
    ).value =
      d.nama || "";


    document.getElementById(
      "editJumlah"
    ).value =
      d.jumlah || "";


    document.getElementById(
      "editKeterangan"
    ).value =
      d.keterangan || "";


    document.getElementById(
      "editTipe"
    ).value =
      d.tipe || "masuk";


    document.getElementById(
      "editModal"
    ).style.display =
      "flex";

  }

  catch (error) {

    console.error(
      "EDIT ERROR:",
      error
    );

    alert(
      "Gagal membuka data."
    );

  }

}


// ======================================================
// 💾 SIMPAN EDIT
// ======================================================

async function simpanEdit() {

  const id =
    document.getElementById(
      "editIndex"
    ).value;


  const tanggal =
    document.getElementById(
      "editTanggal"
    ).value;


  const nama =
    document.getElementById(
      "editNama"
    ).value.trim();


  const jumlah =
    Number(
      document.getElementById(
        "editJumlah"
      ).value
    );


  const keterangan =
    document.getElementById(
      "editKeterangan"
    ).value.trim();


  const tipe =
    document.getElementById(
      "editTipe"
    ).value;


  if (
    !tanggal ||
    !nama ||
    !jumlah
  ) {

    alert(
      "Semua data wajib diisi."
    );

    return;

  }


  try {

    await db.collection("kas")
      .doc(id)
      .update({

        tanggal: tanggal,

        nama: nama,

        jumlah: jumlah,

        keterangan:
          keterangan,

        tipe: tipe

      });


    alert(
      "✅ Data berhasil diperbarui."
    );


    closeEdit();

    loadData();

  }

  catch (error) {

    console.error(
      "UPDATE ERROR:",
      error
    );


    alert(
      "❌ Gagal memperbarui data.\n\n" +
      error.message
    );

  }

}


// ======================================================
// ❌ HAPUS DATA
// ======================================================

async function hapusData(id) {

  const yakin =
    confirm(
      "Yakin ingin menghapus transaksi ini?"
    );


  if (!yakin) return;


  try {

    await db.collection("kas")
      .doc(id)
      .delete();


    alert(
      "✅ Data berhasil dihapus."
    );


    loadData();

  }

  catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );


    alert(
      "❌ Gagal menghapus data.\n\n" +
      error.message
    );

  }

}


// ======================================================
// ❎ CLOSE EDIT
// ======================================================

function closeEdit() {

  const modal =
    document.getElementById(
      "editModal"
    );


  if (modal) {

    modal.style.display =
      "none";

  }

}


// ======================================================
// 📊 EXPORT EXCEL - VERSI STABIL
// ======================================================

async function exportExcel() {

  try {

    // Cek library XLSX
    if (typeof XLSX === "undefined") {

      alert("❌ Library Excel belum dimuat.");

      return;
    }


    // Ambil data Firestore
    const snapshot = await db
      .collection("kas")
      .orderBy("tanggal", "asc")
      .get();


    if (snapshot.empty) {

      alert("📭 Belum ada data kas untuk diekspor.");

      return;
    }


    // ==================================================
    // DATA TRANSAKSI
    // ==================================================

    const rows = [];

    let totalMasuk = 0;
    let totalKeluar = 0;


    snapshot.forEach(function(doc, index) {

      const d = doc.data();

      const jumlah = Number(d.jumlah || 0);

      let pemasukan = 0;
      let pengeluaran = 0;


      if (d.tipe === "masuk") {

        pemasukan = jumlah;
        totalMasuk += jumlah;

      } else {

        pengeluaran = jumlah;
        totalKeluar += jumlah;

      }


      const saldo =
        totalMasuk - totalKeluar;


      rows.push([

        index + 1,

        d.tanggal || "",

        d.nama || "",

        d.keterangan || "",

        pemasukan,

        pengeluaran,

        saldo

      ]);

    });


    const saldoAkhir =
      totalMasuk - totalKeluar;


    // ==================================================
    // ISI EXCEL
    // ==================================================

    const sheetData = [

      ["LAPORAN KAS 17 AGUSTUS"],

      ["Laporan Keuangan Kegiatan"],

      [""],

      [
        "No",
        "Tanggal",
        "Nama / Sumber",
        "Keterangan",
        "Pemasukan",
        "Pengeluaran",
        "Saldo"
      ],

      ...rows,

      [""],

      ["RINGKASAN KEUANGAN"],

      ["Total Pemasukan", totalMasuk],

      ["Total Pengeluaran", totalKeluar],

      ["Saldo Akhir", saldoAkhir]

    ];


    // ==================================================
    // BUAT SHEET
    // ==================================================

    const worksheet =
      XLSX.utils.aoa_to_sheet(sheetData);


    // ==================================================
    // LEBAR KOLOM
    // ==================================================

    worksheet["!cols"] = [

      { wch: 7 },
      { wch: 15 },
      { wch: 28 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 }

    ];


    // ==================================================
    // MERGE JUDUL
    // ==================================================

    worksheet["!merges"] = [

      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 6 }
      },

      {
        s: { r: 1, c: 0 },
        e: { r: 1, c: 6 }
      }

    ];


    // ==================================================
    // FORMAT RUPIAH
    // ==================================================

    const firstDataRow = 4;

    const lastDataRow =
      firstDataRow + rows.length - 1;


    for (
      let row = firstDataRow;
      row <= lastDataRow;
      row++
    ) {

      if (worksheet[`E${row + 1}`]) {

        worksheet[`E${row + 1}`].z =
          '"Rp" #,##0';

      }


      if (worksheet[`F${row + 1}`]) {

        worksheet[`F${row + 1}`].z =
          '"Rp" #,##0';

      }


      if (worksheet[`G${row + 1}`]) {

        worksheet[`G${row + 1}`].z =
          '"Rp" #,##0';

      }

    }


    // ==================================================
    // FORMAT RINGKASAN
    // ==================================================

    const summaryRow =
      7 + rows.length;


    if (worksheet[`B${summaryRow + 1}`]) {

      worksheet[`B${summaryRow + 1}`].z =
        '"Rp" #,##0';

    }


    if (worksheet[`B${summaryRow + 2}`]) {

      worksheet[`B${summaryRow + 2}`].z =
        '"Rp" #,##0';

    }


    if (worksheet[`B${summaryRow + 3}`]) {

      worksheet[`B${summaryRow + 3}`].z =
        '"Rp" #,##0';

    }


    // ==================================================
    // FILTER
    // ==================================================

    worksheet["!autofilter"] = {

      ref: `A4:G${4 + rows.length}`

    };


    // ==================================================
    // BUAT WORKBOOK
    // ==================================================

    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Laporan Kas"
    );


    // ==================================================
    // NAMA FILE
    // ==================================================

    const sekarang =
      new Date();


    const tahun =
      sekarang.getFullYear();


    const bulan =
      String(
        sekarang.getMonth() + 1
      ).padStart(2, "0");


    const tanggal =
      String(
        sekarang.getDate()
      ).padStart(2, "0");


    const namaFile =
      `Laporan_Kas_17_Agustus_${tahun}-${bulan}-${tanggal}.xlsx`;


    // ==================================================
    // EXPORT
    // ==================================================

    XLSX.writeFile(
      workbook,
      namaFile,
      {
        bookType: "xlsx",
        compression: true
      }
    );


    alert(
      "✅ Excel berhasil dibuat!\n\n" +
      "File: " + namaFile
    );

  }

  catch (error) {

    console.error(
      "EXPORT EXCEL ERROR:",
      error
    );


    alert(
      "❌ Gagal membuat Excel.\n\n" +
      error.message
    );

  }

}

// ======================================================
// 🛡️ ESCAPE HTML
// ======================================================

function escapeHTML(text) {

  return String(text || "")

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
