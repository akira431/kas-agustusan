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
// 🛠️ HELPER RUPIAH
// ======================================================

function rupiah(angka) {

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(Number(angka || 0));

}


// ======================================================
// 🔐 CEK LOGIN
// ======================================================

function initDashboard() {

  auth.onAuthStateChanged(function(user) {

    if (!user) {

      window.location.href = "index.html";

      return;
    }


    // Tampilkan email user
    const roleElement = document.getElementById("role");

    if (roleElement) {

      roleElement.textContent =
        user.email || "Admin";

    }


    // Load data
    loadData();

  });

}


// ======================================================
// 🚪 LOGOUT
// ======================================================

function logout() {

  auth.signOut()
    .then(function() {

      window.location.href = "index.html";

    })
    .catch(function(error) {

      console.error(error);

      alert("Gagal keluar.");

    });

}


// ======================================================
// ➕ TAMBAH DATA
// ======================================================

async function tambahData() {

  const tanggal =
    document.getElementById("tanggal").value;

  const nama =
    document.getElementById("nama").value.trim();

  const jumlah =
    Number(document.getElementById("jumlah").value);

  const keterangan =
    document.getElementById("keterangan").value.trim();

  const tipe =
    document.getElementById("tipe").value;


  if (!tanggal) {

    alert("Silakan pilih tanggal.");

    return;

  }


  if (!nama) {

    alert("Silakan isi nama / sumber.");

    return;

  }


  if (!jumlah || jumlah <= 0) {

    alert("Jumlah harus lebih dari 0.");

    return;

  }


  try {

    await db.collection("kas").add({

      tanggal: tanggal,

      nama: nama,

      jumlah: jumlah,

      keterangan: keterangan,

      tipe: tipe,

      createdAt: firebase.firestore.FieldValue.serverTimestamp()

    });


    alert("✅ Transaksi berhasil disimpan.");


    // Reset form
    document.getElementById("tanggal").value = "";
    document.getElementById("nama").value = "";
    document.getElementById("jumlah").value = "";
    document.getElementById("keterangan").value = "";

    document.getElementById("tipe").value = "masuk";


    // Refresh
    loadData();

  }

  catch (error) {

    console.error("Gagal menyimpan:", error);

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

  const searchInput =
    document.getElementById("search");

  const filterInput =
    document.getElementById("filter");


  if (!container) return;


  const search =
    (searchInput?.value || "")
      .toLowerCase()
      .trim();


  const filter =
    filterInput?.value || "semua";


  container.innerHTML =
    `<div class="empty">⏳ Memuat data...</div>`;


  try {

    const snapshot =
      await db.collection("kas")
        .orderBy("tanggal", "desc")
        .get();


    let totalMasuk = 0;

    let totalKeluar = 0;

    let jumlahTampil = 0;

    let html = "";


    snapshot.forEach(function(doc) {

      const d = doc.data();

      const nama =
        d.nama || "";

      const keterangan =
        d.keterangan || "";

      const tipe =
        d.tipe || "masuk";

      const jumlah =
        Number(d.jumlah || 0);


      // Hitung total seluruh data
      if (tipe === "masuk") {

        totalMasuk += jumlah;

      } else {

        totalKeluar += jumlah;

      }


      // Filter tipe
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
          d.tanggal
        ).toLowerCase();


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
              ${formatTanggal(d.tanggal)}
              • ${jenisText}
            </div>

            ${
              keterangan
                ? `
                  <div class="item-desc">
                    ${escapeHTML(keterangan)}
                  </div>
                `
                : ""
            }

          </div>


          <div>

            <div class="amount ${amountClass}">
              ${tanda} ${rupiah(jumlah)}
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

    });


    if (!html) {

      html = `
        <div class="empty">
          📭 Tidak ada transaksi.
        </div>
      `;

    }


    container.innerHTML = html;


    // Statistik
    document.getElementById("totalMasuk").textContent =
      rupiah(totalMasuk);

    document.getElementById("totalKeluar").textContent =
      rupiah(totalKeluar);

    document.getElementById("saldo").textContent =
      rupiah(totalMasuk - totalKeluar);


    document.getElementById("jumlahData").textContent =
      jumlahTampil + " transaksi";

  }

  catch (error) {

    console.error("Gagal mengambil data:", error);


    container.innerHTML = `
      <div class="empty">
        ❌ Gagal memuat data.
        <br><br>
        ${escapeHTML(error.message)}
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

      alert("Data tidak ditemukan.");

      return;

    }


    const d = doc.data();


    document.getElementById("editIndex").value =
      id;

    document.getElementById("editTanggal").value =
      d.tanggal || "";

    document.getElementById("editNama").value =
      d.nama || "";

    document.getElementById("editJumlah").value =
      d.jumlah || "";

    document.getElementById("editKeterangan").value =
      d.keterangan || "";

    document.getElementById("editTipe").value =
      d.tipe || "masuk";


    document.getElementById("editModal").style.display =
      "flex";

  }

  catch (error) {

    console.error(error);

    alert("Gagal membuka data.");

  }

}


// ======================================================
// 💾 SIMPAN EDIT
// ======================================================

async function simpanEdit() {

  const id =
    document.getElementById("editIndex").value;

  const tanggal =
    document.getElementById("editTanggal").value;

  const nama =
    document.getElementById("editNama").value.trim();

  const jumlah =
    Number(document.getElementById("editJumlah").value);

  const keterangan =
    document.getElementById("editKeterangan").value.trim();

  const tipe =
    document.getElementById("editTipe").value;


  if (!tanggal || !nama || !jumlah) {

    alert("Semua data wajib diisi.");

    return;

  }


  try {

    await db.collection("kas")
      .doc(id)
      .update({

        tanggal: tanggal,

        nama: nama,

        jumlah: jumlah,

        keterangan: keterangan,

        tipe: tipe

      });


    alert("✅ Data berhasil diperbarui.");


    closeEdit();

    loadData();

  }

  catch (error) {

    console.error(error);

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


    alert("✅ Data berhasil dihapus.");

    loadData();

  }

  catch (error) {

    console.error(error);

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

  document.getElementById("editModal").style.display =
    "none";

}


// ======================================================
// 📊 EXPORT EXCEL - VERSI AMAN
// ======================================================

async function exportExcel() {

  try {

    // Cek library XLSX
    if (typeof XLSX === "undefined") {

      alert("❌ Library Excel belum dimuat.");

      return;
    }


    // Ambil data Firestore
    const snapshot = await db.collection("kas")
      .orderBy("tanggal", "asc")
      .get();


    if (snapshot.empty) {

      alert("📭 Belum ada data kas untuk diekspor.");

      return;
    }


    // ==================================================
    // SIAPKAN DATA
    // ==================================================

    const data = [];

    let totalMasuk = 0;
    let totalKeluar = 0;


    snapshot.forEach((doc, index) => {

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


      data.push([

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
    // BUAT ISI SHEET
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

      ...data,

      [""],

      ["RINGKASAN KEUANGAN"],

      ["Total Pemasukan", totalMasuk],

      ["Total Pengeluaran", totalKeluar],

      ["Saldo Akhir", saldoAkhir]

    ];


    // ==================================================
    // BUAT WORKSHEET DENGAN CARA YANG AMAN
    // ==================================================

    const worksheet =
      XLSX.utils.aoa_to_sheet(sheetData);


    // ==================================================
    // LEBAR KOLOM
    // ==================================================

    worksheet["!cols"] = [

      { wch: 6 },

      { wch: 15 },

      { wch: 28 },

      { wch: 40 },

      { wch: 18 },

      { wch: 18 },

      { wch: 18 }

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

    const dataStartRow = 5;

    const dataEndRow =
      dataStartRow + data.length - 1;


    for (
      let row = dataStartRow;
      row <= dataEndRow;
      row++
    ) {

      // Pemasukan
      if (worksheet[`E${row}`]) {

        worksheet[`E${row}`].z =
          '"Rp" #,##0';

      }


      // Pengeluaran
      if (worksheet[`F${row}`]) {

        worksheet[`F${row}`].z =
          '"Rp" #,##0';

      }


      // Saldo
      if (worksheet[`G${row}`]) {

        worksheet[`G${row}`].z =
          '"Rp" #,##0';

      }

    }


    // ==================================================
    // FORMAT RINGKASAN
    // ==================================================

    const summaryStart =
      dataEndRow + 3;


    if (worksheet[`B${summaryStart}`]) {

      worksheet[`B${summaryStart}`].z =
        '"Rp" #,##0';

    }


    if (worksheet[`B${summaryStart + 1}`]) {

      worksheet[`B${summaryStart + 1}`].z =
        '"Rp" #,##0';

    }


    if (worksheet[`B${summaryStart + 2}`]) {

      worksheet[`B${summaryStart + 2}`].z =
        '"Rp" #,##0';

    }


    // ==================================================
    // FILTER DATA
    // ==================================================

    worksheet["!autofilter"] = {

      ref: `A4:G${dataEndRow}`

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


    const tanggalFile =
      sekarang
        .toISOString()
        .slice(0, 10);


    const namaFile =
      `Laporan_Kas_17_Agustus_${tanggalFile}.xlsx`;


    // ==================================================
    // EXPORT
    // ==================================================

    XLSX.writeFile(

      workbook,

      namaFile,

      {
        bookType: "xlsx"
      }

    );


    alert(
      "✅ File Excel berhasil dibuat!"
    );

  }

  catch (error) {

    console.error(
      "ERROR EXPORT EXCEL:",
      error
    );


    alert(
      "❌ Gagal membuat file Excel.\n\n" +
      error.message
    );

  }

}

// ======================================================
// 📅 FORMAT TANGGAL
// ======================================================

function formatTanggal(tanggal) {

  if (!tanggal) return "-";


  const parts =
    tanggal.split("-");


  if (parts.length !== 3) {

    return tanggal;

  }


  return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


// ======================================================
// 🛡️ ESCAPE HTML
// ======================================================

function escapeHTML(text) {

  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
