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
// 📊 EXPORT EXCEL - EXCELJS
// ======================================================

async function exportExcel() {

  try {

    // Cek library ExcelJS
    if (typeof ExcelJS === "undefined") {

      alert(
        "❌ Library Excel belum dimuat.\n\n" +
        "Pastikan ExcelJS sudah dipasang di dashboard_baru.html."
      );

      return;
    }


    // ==================================================
    // AMBIL DATA FIRESTORE
    // ==================================================

    const snapshot =
      await db.collection("kas")
        .orderBy("tanggal", "asc")
        .get();


    if (snapshot.empty) {

      alert(
        "📭 Belum ada data kas untuk diekspor."
      );

      return;
    }


    // ==================================================
    // BUAT WORKBOOK
    // ==================================================

    const workbook =
      new ExcelJS.Workbook();


    workbook.creator =
      "Sistem Kas 17 Agustus";

    workbook.lastModifiedBy =
      "Sistem Kas 17 Agustus";

    workbook.created =
      new Date();

    workbook.modified =
      new Date();


    const worksheet =
      workbook.addWorksheet(
        "Laporan Kas"
      );


    // ==================================================
    // JUDUL
    // ==================================================

    worksheet.mergeCells(
      "A1:G1"
    );

    worksheet.getCell("A1").value =
      "LAPORAN KAS 17 AGUSTUS";


    worksheet.getCell("A1").font = {

      bold: true,
      size: 18

    };


    worksheet.getCell("A1").alignment = {

      horizontal: "center",
      vertical: "middle"

    };


    worksheet.getRow(1).height =
      30;


    // ==================================================
    // SUB JUDUL
    // ==================================================

    worksheet.mergeCells(
      "A2:G2"
    );


    worksheet.getCell("A2").value =
      "Laporan Keuangan Kegiatan";


    worksheet.getCell("A2").font = {

      italic: true,
      size: 11

    };


    worksheet.getCell("A2").alignment = {

      horizontal: "center",
      vertical: "middle"

    };


    worksheet.getRow(2).height =
      22;


    // ==================================================
    // SPASI
    // ==================================================

    worksheet.getRow(3).height =
      8;


    // ==================================================
    // DATA
    // ==================================================

    const rows = [];

    let totalMasuk = 0;
    let totalKeluar = 0;


    snapshot.forEach(
      function(doc, index) {

        const d =
          doc.data();


        const jumlah =
          Number(d.jumlah || 0);


        let pemasukan = 0;
        let pengeluaran = 0;


        if (d.tipe === "masuk") {

          pemasukan =
            jumlah;

          totalMasuk +=
            jumlah;

        }

        else {

          pengeluaran =
            jumlah;

          totalKeluar +=
            jumlah;

        }


        const saldo =
          totalMasuk -
          totalKeluar;


        rows.push({

          no: index + 1,

          tanggal:
            d.tanggal || "",

          nama:
            d.nama || "",

          keterangan:
            d.keterangan || "",

          pemasukan:
            pemasukan,

          pengeluaran:
            pengeluaran,

          saldo:
            saldo

        });

      }
    );


    // ==================================================
    // HEADER TABEL
    // ==================================================

    const headerRow =
      worksheet.addRow([

        "No",

        "Tanggal",

        "Nama / Sumber",

        "Keterangan",

        "Pemasukan",

        "Pengeluaran",

        "Saldo"

      ]);


    // ==================================================
    // DATA TABEL
    // ==================================================

    rows.forEach(
      function(item) {

        worksheet.addRow([

          item.no,

          item.tanggal,

          item.nama,

          item.keterangan,

          item.pemasukan,

          item.pengeluaran,

          item.saldo

        ]);

      }
    );


    // ==================================================
    // BUAT EXCEL TABLE ASLI
    // ==================================================

    const firstDataRow =
      headerRow.number;


    const lastDataRow =
      worksheet.lastRow.number;


    worksheet.addTable({

      name:
        "TabelKas17Agustus",

      ref:
        `A${firstDataRow}:G${lastDataRow}`,

      headerRow:
        true,

      totalsRow:
        false,

      style: {

        theme:
          "TableStyleMedium2",

        showFirstColumn:
          false,

        showLastColumn:
          false,

        showRowStripes:
          true,

        showColumnStripes:
          false

      }

    });


    // ==================================================
    // FORMAT HEADER
    // ==================================================

    headerRow.eachCell(
      function(cell) {

        cell.font = {

          bold: true,
          size: 11

        };


        cell.alignment = {

          horizontal: "center",
          vertical: "middle"

        };

      }
    );


    headerRow.height =
      24;


    // ==================================================
    // FORMAT DATA
    // ==================================================

    for (
      let row = firstDataRow + 1;
      row <= lastDataRow;
      row++
    ) {

      const currentRow =
        worksheet.getRow(row);


      // No
      currentRow.getCell(1)
        .alignment = {

          horizontal:
            "center"

        };


      // Tanggal
      currentRow.getCell(2)
        .alignment = {

          horizontal:
            "center"

        };


      // Rupiah
      currentRow.getCell(5)
        .numFmt =
        '"Rp" #,##0';


      currentRow.getCell(6)
        .numFmt =
        '"Rp" #,##0';


      currentRow.getCell(7)
        .numFmt =
        '"Rp" #,##0';


      // Rata kanan uang
      currentRow.getCell(5)
        .alignment = {

          horizontal:
            "right"

        };


      currentRow.getCell(6)
        .alignment = {

          horizontal:
            "right"

        };


      currentRow.getCell(7)
        .alignment = {

          horizontal:
            "right"

        };

    }


    // ==================================================
    // LEBAR KOLOM
    // ==================================================

    worksheet.getColumn(1).width =
      7;


    worksheet.getColumn(2).width =
      15;


    worksheet.getColumn(3).width =
      28;


    worksheet.getColumn(4).width =
      40;


    worksheet.getColumn(5).width =
      18;


    worksheet.getColumn(6).width =
      18;


    worksheet.getColumn(7).width =
      18;


    // ==================================================
    // WRAP TEXT
    // ==================================================

    for (
      let row = firstDataRow + 1;
      row <= lastDataRow;
      row++
    ) {

      worksheet.getRow(row)
        .getCell(3)
        .alignment = {

          vertical: "top",
          wrapText: true

        };


      worksheet.getRow(row)
        .getCell(4)
        .alignment = {

          vertical: "top",
          wrapText: true

        };

    }


    // ==================================================
    // RINGKASAN
    // ==================================================

    const summaryStart =
      lastDataRow + 3;


    worksheet.mergeCells(
      `A${summaryStart}:B${summaryStart}`
    );


    worksheet.getCell(
      `A${summaryStart}`
    ).value =
      "RINGKASAN KEUANGAN";


    worksheet.getCell(
      `A${summaryStart}`
    ).font = {

      bold: true,
      size: 13

    };


    worksheet.getCell(
      `A${summaryStart}`
    ).alignment = {

      horizontal:
        "left"

    };


    // Total pemasukan
    worksheet.getCell(
      `A${summaryStart + 1}`
    ).value =
      "Total Pemasukan";


    worksheet.getCell(
      `B${summaryStart + 1}`
    ).value =
      totalMasuk;


    worksheet.getCell(
      `B${summaryStart + 1}`
    ).numFmt =
      '"Rp" #,##0';


    // Total pengeluaran
    worksheet.getCell(
      `A${summaryStart + 2}`
    ).value =
      "Total Pengeluaran";


    worksheet.getCell(
      `B${summaryStart + 2}`
    ).value =
      totalKeluar;


    worksheet.getCell(
      `B${summaryStart + 2}`
    ).numFmt =
      '"Rp" #,##0';


    // Saldo
    worksheet.getCell(
      `A${summaryStart + 3}`
    ).value =
      "Saldo Akhir";


    worksheet.getCell(
      `B${summaryStart + 3}`
    ).value =
      totalMasuk -
      totalKeluar;


    worksheet.getCell(
      `B${summaryStart + 3}`
    ).numFmt =
      '"Rp" #,##0';


    // Tebalkan ringkasan
    for (
      let row = summaryStart;
      row <= summaryStart + 3;
      row++
    ) {

      worksheet.getRow(row)
        .getCell(1)
        .font = {

          bold: true

        };

    }


    // ==================================================
    // FREEZE HEADER
    // ==================================================

    worksheet.views = [

      {

        state: "frozen",

        ySplit:
          firstDataRow

      }

    ];


    // ==================================================
    // BORDER DATA
    // ==================================================

    for (
      let row = firstDataRow;
      row <= lastDataRow;
      row++
    ) {

      worksheet.getRow(row)
        .eachCell(
          function(cell) {

            cell.border = {

              top: {
                style: "thin"
              },

              left: {
                style: "thin"
              },

              bottom: {
                style: "thin"
              },

              right: {
                style: "thin"
              }

            };

          }
        );

    }


    // ==================================================
    // BUAT FILE XLSX
    // ==================================================

    const buffer =
      await workbook.xlsx
        .writeBuffer();


    const blob =
      new Blob(
        [buffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      );


    // ==================================================
    // DOWNLOAD
    // ==================================================

    const url =
      window.URL.createObjectURL(
        blob
      );


    const link =
      document.createElement("a");


    link.href =
      url;


    const sekarang =
      new Date();


    const tahun =
      sekarang.getFullYear();


    const bulan =
      String(
        sekarang.getMonth() + 1
      ).padStart(2, "0");


    const hari =
      String(
        sekarang.getDate()
      ).padStart(2, "0");


    link.download =
      `Laporan_Kas_17_Agustus_${tahun}-${bulan}-${hari}.xlsx`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    window.URL.revokeObjectURL(
      url
    );


    alert(
      "✅ Excel berhasil dibuat!\n\n" +
      "File sudah menggunakan tabel Excel asli."
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
// 📅 FORMAT TANGGAL
// ======================================================

function formatTanggal(tanggal) {

  if (!tanggal) return "-";


  const parts =
    tanggal.split("-");


  if (
    parts.length !== 3
  ) {

    return tanggal;

  }


  return `${parts[2]}/${parts[1]}/${parts[0]}`;

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
