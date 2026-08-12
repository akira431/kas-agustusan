// ======================================================
// FIREBASE CONFIG
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
// JALANKAN FIREBASE
// ======================================================

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();


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
// LOGIN FIREBASE
// ======================================================

async function login() {

  console.log("LOGIN DIKLIK");

  const usernameElement =
    document.getElementById("username");

  const passwordElement =
    document.getElementById("password");


  if (!usernameElement || !passwordElement) {

    alert("Input email atau password tidak ditemukan!");

    return;

  }


  const email =
    usernameElement.value.trim();

  const password =
    passwordElement.value;


  if (!email || !password) {

    alert("Email dan password wajib diisi!");

    return;

  }


  try {

    console.log("Mencoba login:", email);


    const userCredential =
      await auth.signInWithEmailAndPassword(
        email,
        password
      );


    console.log(
      "LOGIN BERHASIL:",
      userCredential.user.email
    );


    alert("Login berhasil! ✅");


    window.location.href =
      "dashboard_baru.html";


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    if (
      error.code ===
      "auth/invalid-credential"
    ) {

      alert(
        "Email atau password salah!"
      );

    }

    else if (
      error.code ===
      "auth/user-not-found"
    ) {

      alert(
        "Akun tidak ditemukan!"
      );

    }

    else if (
      error.code ===
      "auth/wrong-password"
    ) {

      alert(
        "Password salah!"
      );

    }

    else {

      alert(
        "Login gagal!\n\n" +
        error.code +
        "\n" +
        error.message
      );

    }

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


  if (
    password.type ===
    "password"
  ) {

    password.type = "text";

  }

  else {

    password.type = "password";

  }

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

  auth.signOut()

    .then(function () {

      window.location.href =
        "index.html";

    })

    .catch(function (error) {

      console.error(
        "LOGOUT ERROR:",
        error
      );

    });

}


// ======================================================
// CEK LOGIN
// ======================================================

function cekLogin() {

  auth.onAuthStateChanged(
    function (user) {

      if (!user) {

        window.location.href =
          "index.html";

        return;

      }


      console.log(
        "User login:",
        user.email
      );


      const roleElement =
        document.getElementById("role");


      if (roleElement) {

        roleElement.innerText =
          "Login sebagai: " +
          user.email;

      }


      loadData();

    }
  );

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

      alert(
        "Tanggal wajib diisi!"
      );

      return;

    }


    if (!nama) {

      alert(
        "Nama wajib diisi!"
      );

      return;

    }


    if (
      !jumlah ||
      jumlah <= 0 ||
      !Number.isFinite(jumlah)
    ) {

      alert(
        "Jumlah harus lebih dari 0!"
      );

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


    // CEK USER FIREBASE

    const currentUser =
      auth.currentUser;


    if (!currentUser) {

      alert(
        "Sesi login sudah berakhir. Silakan login kembali."
      );

      window.location.href =
        "index.html";

      return;

    }


    // ==================================================
    // SIMPAN KE FIRESTORE
    // ==================================================

    await db
      .collection("kas")
      .add({

        tanggal: tanggal,

        nama: nama,

        jumlah: jumlah,

        keterangan: keterangan,

        tipe: tipe,

        createdAt:
          firebase.firestore.FieldValue.serverTimestamp(),

        createdBy:
          currentUser.email

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


  }

  catch (error) {

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
// LOAD DATA REALTIME
// ======================================================

let unsubscribeKas = null;


function loadData() {

  if (unsubscribeKas) {

    unsubscribeKas();

    unsubscribeKas = null;

  }


  unsubscribeKas =
    db
      .collection("kas")
      .orderBy(
        "tanggal",
        "desc"
      )
      .onSnapshot(

        function (snapshot) {

          let html = "";

          let saldo = 0;

          let totalMasuk = 0;

          let totalKeluar = 0;


          snapshot.forEach(
            function (doc) {

              const d =
                doc.data();

              const id =
                doc.id;


              const jumlah =
                Number(d.jumlah) || 0;


              // HITUNG SALDO

              if (
                d.tipe === "masuk"
              ) {

                saldo += jumlah;

                totalMasuk += jumlah;

              }

              else {

                saldo -= jumlah;

                totalKeluar += jumlah;

              }


              // TAMPILKAN DATA

              html += `

                <div class="item">

                  <strong>
                    ${escapeHTML(
                      d.nama || "-"
                    )}
                  </strong>

                  <br>

                  <small>
                    ${escapeHTML(
                      d.tanggal || "-"
                    )}
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
                          ${escapeHTML(
                            d.keterangan
                          )}
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


          // TAMPILKAN DATA

          const dataElement =
            document.getElementById("data");


          if (dataElement) {

            if (html === "") {

              dataElement.innerHTML = `

                <div class="empty">

                  Belum ada data kas.

                </div>

              `;

            }

            else {

              dataElement.innerHTML =
                html;

            }

          }


          // TOTAL PEMASUKAN

          const masukElement =
            document.getElementById(
              "totalMasuk"
            );


          if (masukElement) {

            masukElement.innerText =
              rupiah(totalMasuk);

          }


          // TOTAL PENGELUARAN

          const keluarElement =
            document.getElementById(
              "totalKeluar"
            );


          if (keluarElement) {

            keluarElement.innerText =
              rupiah(totalKeluar);

          }


          // SALDO

          const saldoElement =
            document.getElementById(
              "saldo"
            );


          if (saldoElement) {

            saldoElement.innerText =
              rupiah(saldo);


            if (saldo < 0) {

              saldoElement.style.color =
                "#dc2626";

            }

            else {

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
// HAPUS DATA
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

  }

  catch (error) {

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
// EDIT DATA
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


    const tanggal =
      prompt(
        "Tanggal:",
        d.tanggal || ""
      );


    if (tanggal === null) {

      return;

    }


    const nama =
      prompt(
        "Nama:",
        d.nama || ""
      );


    if (nama === null) {

      return;

    }


    const jumlah =
      prompt(
        "Jumlah:",
        d.jumlah || 0
      );


    if (jumlah === null) {

      return;

    }


    const tipe =
      prompt(
        "Tipe (masuk/keluar):",
        d.tipe || "masuk"
      );


    if (tipe === null) {

      return;

    }


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


    const currentUser =
      auth.currentUser;


    if (!currentUser) {

      alert(
        "Sesi login sudah berakhir."
      );

      window.location.href =
        "index.html";

      return;

    }


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
          currentUser.email

      });


    alert(
      "Data berhasil diperbarui! ✅"
    );

  }

  catch (error) {

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
    document.createElement(
      "div"
    );


  div.textContent =
    text == null
      ? ""
      : String(text);


  return div.innerHTML;

}


// ======================================================
// JALANKAN CEK LOGIN HANYA DI DASHBOARD
// ======================================================

if (
  window.location.pathname.includes(
    "dashboard_baru.html"
  )
) {

  cekLogin();

}
