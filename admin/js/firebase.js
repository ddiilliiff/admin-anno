import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc, // Untuk mengambil satu dokumen
  updateDoc, // Untuk mengupdate dokumen
  addDoc, // Jika Anda ingin menambahkan dokumen baru
  deleteDoc,
  query,
  orderBy,
  doc, // Tambahkan ini untuk menambahkan dokumen
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  uploadBytesResumable, // Tambahkan ini untuk mengunggah file
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
// import {
//   getAuth,
//   signInWithEmailAndPassword,
//   onAuthStateChanged,
//   signOut,
// } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJOL5q3A4jcJ7J2S5PvkkINcRm7NeUbKM",
  appId: "1:950161446972:web:e93d119791cf22d9f80b39",
  messagingSenderId: "950161446972",
  projectId: "betesda-ceria",
  authDomain: "betesda-ceria.firebaseapp.com",
  storageBucket: "betesda-ceria.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Fungsi Login

// Dashboard
// Ambil data dari setiap koleksi dan tampilkan jumlahnya
const fetchDataAndDisplayCount = async (collectionName, elementId) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  document.getElementById(elementId).innerText = querySnapshot.size;
};

// Panggil fungsi fetchDataAndDisplayCount untuk setiap koleksi
fetchDataAndDisplayCount("angka", "angkaCount");
fetchDataAndDisplayCount("huruf", "hurufCount");
fetchDataAndDisplayCount("buah", "buahCount");
fetchDataAndDisplayCount("hewan", "hewanCount");
fetchDataAndDisplayCount("kuis", "kuisCount");

// Kuis
if (document.getElementById("kuis")) {
  async function getKuisAndDisplay() {
    const kuisListElement = document.getElementById("kuis");
    kuisListElement.innerHTML = "";

    const kuisQuery = query(collection(db, "kuis"));
    const kuisSnapshot = await getDocs(kuisQuery);

    for (const doc of kuisSnapshot.docs) {
      const data = doc.data();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-center mt-5">${
          data.nomor ? data.nomor : "Tidak ada data"
        }</td>
         <td class="text-center mt-5">${
           data.soal ? data.soal : "Tidak ada data"
         }</td>
         <td class="text-center mt-5">${
           data.pilihan ? data.pilihan : "Tidak ada data"
         }</td>
         <td class="text-center mt-5">${
           data.jawaban ? data.jawaban : "Tidak ada data"
         }</td>
         <td class="text-center">
           <button class="btn btn-sm btn-warning edit-kuis" data-id="${
             doc.id
           }" data-bs-toggle="modal" data-bs-target="#editKuisModal">
               <span class="icon text-white-50">
                   <i class="fas fa-edit"></i>
               </span>
               <span class="text">Edit</span>
           </button>
           <button class="btn btn-sm btn-danger delete-kuis" data-id="${
             doc.id
           }">
               <span class="icon text-white-50">
                   <i class="fas fa-trash"></i>
               </span>
               <span class="text">Hapus</span>
           </button>
         </td>
       `;
      kuisListElement.appendChild(row);
    }
  }

  if (document.getElementById("kuis")) {
    getKuisAndDisplay();
  }

  if (document.getElementById("kuisForm")) {
    document
      .getElementById("kuisForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Proses penyimpanan data...
        const nomorValue = document.getElementById("nomor").value;
        // const kategoriValue = document.getElementById("kategori").value;
        const soalValue = document.getElementById("soal").value;
        const pilihan1Value = document.getElementById("pilihan1").value;
        const pilihan2Value = document.getElementById("pilihan2").value;
        const pilihan3Value = document.getElementById("pilihan3").value;
        const jawabanValue = document.getElementById("jawaban").value;
        try {
          await addDoc(collection(db, "kuis"), {
            nomor: nomorValue,
            // kategori: kategoriValue,
            soal: soalValue,
            pilihan: [pilihan1Value, pilihan2Value, pilihan3Value],
            jawaban: jawabanValue,
          });

          Swal.fire({
            icon: "success",
            title: "Berhasil disimpan!",
            text: "Data kuis berhasil disimpan!",
          }).then((result) => {
            if (result.isConfirmed) {
              getKuisAndDisplay(); // Refresh tabel setelah penyimpanan
            }
          });

          document.getElementById("kuisForm").reset();
          // Tutup modal jika Anda menggunakan Bootstrap modal
          // $('.modal').modal('hide'); atau $('#modalId').modal('hide');
        } catch (error) {
          console.error("Error saat menyimpan data:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal menyimpan!",
            text: "Terjadi kesalahan saat menyimpan data!",
          });
        }
      });
  }

  // Menghapus data kuis
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-kuis")) {
      const docId = e.target.closest(".delete-kuis").getAttribute("data-id");
      // Menggunakan SweetAlert2 untuk konfirmasi
      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus secara permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          // Jika pengguna mengkonfirmasi, hapus data
          deleteKuis(docId)
            .then(() => {
              Swal.fire("Terhapus!", "Data telah dihapus.", "success");
              getKuisAndDisplay(); // Refresh daftar
            })
            .catch((error) => {
              console.error("Failed to delete document: ", error);
              Swal.fire("Gagal!", "Gagal menghapus data.", "error");
            });
        }
      });
    }
  });

  async function deleteKuis(docId) {
    try {
      await deleteDoc(doc(db, "kuis", docId));
      console.log("Document deleted with ID: ", docId);
    } catch (error) {
      console.error("Failed to delete document: ", error);
    }
  }

  // Edit kuis
  if (document.getElementById("editKuisModal")) {
    document.addEventListener("DOMContentLoaded", () => {
      const editKuisModal = new bootstrap.Modal(
        document.getElementById("editKuisModal")
      );

      document.addEventListener("click", async function (e) {
        if (e.target.closest(".edit-kuis")) {
          const docId = e.target.closest(".edit-kuis").getAttribute("data-id");

          // Dapatkan data dari Firestore
          const docRef = doc(db, "kuis", docId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // Isi nilai ke dalam form modal
            document.getElementById("editNomor").value = data.nomor;
            // document.getElementById("editKategori").value = data.kategori;
            document.getElementById("editSoal").value = data.soal;
            document.getElementById("editPilihan1").value = data.pilihan[0];
            document.getElementById("editPilihan2").value = data.pilihan[1];
            document.getElementById("editPilihan3").value = data.pilihan[2];
            document.getElementById("editJawaban").value = data.jawaban;
            // Simpan docId ke dalam input tersembunyi
            document.getElementById("editKuisDocId").value = docId;
            editKuisModal.show();
          } else {
            console.error("No such document!");
          }
        }
      });

      document
        .getElementById("editKuisForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          // Mendapatkan docId dari input tersembunyi
          const docId = document.getElementById("editKuisDocId").value;
          const nomorValue = document.getElementById("editNomor").value;
          // const kategoriValue = document.getElementById("editKategori").value;
          const soalValue = document.getElementById("editSoal").value;
          const pilihan1Value = document.getElementById("editPilihan1").value;
          const pilihan2Value = document.getElementById("editPilihan2").value;
          const pilihan3Value = document.getElementById("editPilihan3").value;
          const jawabanValue = document.getElementById("editJawaban").value;

          try {
            // Update data di Firestore
            await updateDoc(doc(db, "kuis", docId), {
              nomor: nomorValue,
              // kategori: kategoriValue,
              soal: soalValue,
              pilihan: [pilihan1Value, pilihan2Value, pilihan3Value],
              jawaban: jawabanValue,
            });

            Swal.fire(
              "Berhasil diubah!",
              "Data kuis berhasil diubah!",
              "success"
            );
            editKuisModal.hide();
            getKuisAndDisplay();
          } catch (error) {
            console.error("Error updating document:", error);
            Swal.fire(
              "Error!",
              "There was an issue updating your data.",
              "error"
            );
          }
        });
    });
  }
}

// Hewan
if (document.getElementById("hewan")) {
  async function getHewanAndDisplay() {
    const hewanListElement = document.getElementById("hewan");
    hewanListElement.innerHTML = "";

    const hewanQuery = query(collection(db, "hewan"));
    const hewanSnapshot = await getDocs(hewanQuery);

    for (const doc of hewanSnapshot.docs) {
      const data = doc.data();
      let imageUrl = data.gambar;
      let audioUrl = data.audio;
      let soundUrl = data.sound;

      if (imageUrl.startsWith("gs://")) {
        const storageRef = ref(storage, imageUrl);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (audioUrl.startsWith("gs://")) {
        const storageRef = ref(storage, audioUrl);
        audioUrl = await getDownloadURL(storageRef);
      }

      if (soundUrl.startsWith("gs://")) {
        const storageRef = ref(storage, soundUrl);
        soundUrl = await getDownloadURL(storageRef);
      }

      const row = document.createElement("tr");
      row.innerHTML = `
         <td class="text-center mt-5">${
           data.nama ? data.nama : "Tidak ada data"
         }</td>
         <td class="text-center mt-5">
         <img src="${imageUrl}" style="width: 100px;height: 100px;">
         </td>
         <td class="text-center">
         ${
           soundUrl
             ? `
           <audio controls>
           <source src="${soundUrl}" type="audio/mp3">
           Your browser does not support the audio tag.
           </audio>
           `
             : "Tidak ada audio"
         }
         </td>
         <td class="text-center">
         ${
           audioUrl
             ? `
            <audio controls>
            <source src="${audioUrl}" type="audio/mp3">
            Your browser does not support the audio tag.
            </audio>
            `
             : "Tidak ada audio"
         }
        </td>
         <td class="text-center">
           <button class="btn btn-sm btn-warning edit-hewan" data-id="${
             doc.id
           }" data-bs-toggle="modal" data-bs-target="#editHewanModal">
               <span class="icon text-white-50">
                   <i class="fas fa-edit"></i>
               </span>
               <span class="text">Edit</span>
           </button>
           <button class="btn btn-sm btn-danger delete-hewan" data-id="${
             doc.id
           }">
               <span class="icon text-white-50">
                   <i class="fas fa-trash"></i>
               </span>
               <span class="text">Hapus</span>
           </button>
         </td>
       `;
      hewanListElement.appendChild(row);
    }
  }

  if (document.getElementById("hewan")) {
    getHewanAndDisplay();
  }

  if (document.getElementById("hewanForm")) {
    document
      .getElementById("hewanForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Proses penyimpanan data...
        const namaValue = document.getElementById("nama").value;
        const gambarFile = document.getElementById("gambar").files[0];
        const audioFile = document.getElementById("audio").files[0];
        const soundFile = document.getElementById("sound").files[0];

        if (!gambarFile) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Mohon pilih file gambar!",
          });
          return;
        }
        if (!audioFile) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Mohon pilih file audio!",
          });
          return;
        }
        if (!soundFile) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Mohon pilih file sound!",
          });
          return;
        }

        const gambarPath = `img-hewan/${gambarFile.name}`; // Memastikan nama file unik
        const audioPath = `hewan/${audioFile.name}`; // Memastikan nama file unik
        const soundPath = `hewan/${soundFile.name}`; // Memastikan nama file unik
        const gambarStorageRef = ref(storage, gambarPath);
        const audioStorageRef = ref(storage, audioPath);
        const soundStorageRef = ref(storage, soundPath);

        try {
          await uploadBytes(gambarStorageRef, gambarFile);
          await uploadBytes(audioStorageRef, audioFile);
          await uploadBytes(soundStorageRef, soundFile);
          const gambarUrl = await getDownloadURL(gambarStorageRef);
          const audioUrl = await getDownloadURL(audioStorageRef);
          const soundUrl = await getDownloadURL(soundStorageRef);
          // const angkaValueNumber = parseInt(angkaValue);

          await addDoc(collection(db, "hewan"), {
            nama: namaValue,
            gambar: gambarUrl,
            sound: soundUrl,
            audio: audioUrl,
          });

          Swal.fire({
            icon: "success",
            title: "Berhasil disimpan!",
            text: "Data hewan, gambar, sound dan audio berhasil disimpan!",
          }).then((result) => {
            if (result.isConfirmed) {
              getHewanAndDisplay(); // Refresh tabel setelah penyimpanan
            }
          });

          document.getElementById("hewanForm").reset();
          // Tutup modal jika Anda menggunakan Bootstrap modal
          // $('.modal').modal('hide'); atau $('#modalId').modal('hide');
        } catch (error) {
          console.error("Error saat menyimpan data:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal menyimpan!",
            text: "Terjadi kesalahan saat menyimpan data!",
          });
        }
      });
  }

  // Menghapus data hewan
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-hewan")) {
      const docId = e.target.closest(".delete-hewan").getAttribute("data-id");
      // Menggunakan SweetAlert2 untuk konfirmasi
      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus secara permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          // Jika pengguna mengkonfirmasi, hapus data
          deleteHewan(docId)
            .then(() => {
              Swal.fire("Terhapus!", "Data telah dihapus.", "success");
              getHewanAndDisplay(); // Refresh daftar
            })
            .catch((error) => {
              console.error("Failed to delete document: ", error);
              Swal.fire("Gagal!", "Gagal menghapus data.", "error");
            });
        }
      });
    }
  });

  async function deleteHewan(docId) {
    try {
      await deleteDoc(doc(db, "hewan", docId));
      console.log("Document deleted with ID: ", docId);
    } catch (error) {
      console.error("Failed to delete document: ", error);
    }
  }

  // Edit hewan
  if (document.getElementById("editHewanModal")) {
    document.addEventListener("DOMContentLoaded", () => {
      const editHewanModal = new bootstrap.Modal(
        document.getElementById("editHewanModal")
      );

      document.addEventListener("click", async function (e) {
        if (e.target.closest(".edit-hewan")) {
          const docId = e.target.closest(".edit-hewan").getAttribute("data-id");

          // Dapatkan data dari Firestore
          const docRef = doc(db, "hewan", docId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // Isi nilai ke dalam form modal
            document.getElementById("editHewan").value = data.nama;
            // Simpan docId ke dalam input tersembunyi
            document.getElementById("editHewanDocId").value = docId;
            editHewanModal.show();
          } else {
            console.error("No such document!");
          }
        }
      });

      document
        .getElementById("editHewanForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          // Mendapatkan docId dari input tersembunyi
          const docId = document.getElementById("editHewanDocId").value;
          const hewanValue = document.getElementById("editHewan").value;
          // const aValueNumber = parseInt(hewanValue);

          try {
            // Update data di Firestore
            await updateDoc(doc(db, "hewan", docId), {
              nama: hewanValue,
            });

            Swal.fire(
              "Berhasil diubah!",
              "Data hewan berhasil diubah!",
              "success"
            );
            editHewanModal.hide();
            getHewanAndDisplay();
          } catch (error) {
            console.error("Error updating document:", error);
            Swal.fire(
              "Error!",
              "There was an issue updating your data.",
              "error"
            );
          }
        });
    });
  }
}

// Buah
if (document.getElementById("buah")) {
  async function getBuahAndDisplay() {
    const buahListElement = document.getElementById("buah");
    buahListElement.innerHTML = "";

    const buahQuery = query(collection(db, "buah"));
    const buahSnapshot = await getDocs(buahQuery);

    for (const doc of buahSnapshot.docs) {
      const data = doc.data();
      let imageUrl = data.gambar;
      let audioUrl = data.audio;

      if (imageUrl.startsWith("gs://")) {
        const storageRef = ref(storage, imageUrl);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (audioUrl.startsWith("gs://")) {
        const storageRef = ref(storage, audioUrl);
        audioUrl = await getDownloadURL(storageRef);
      }

      const row = document.createElement("tr");
      row.innerHTML = `
         <td class="text-center mt-5">${
           data.nama ? data.nama : "Tidak ada data"
         }</td>
         <td class="text-center mt-5">
         <img src="${imageUrl}" style="width: 100px;height: 100px;">
         </td>
         <td class="text-center">
         ${
           audioUrl
             ? `
            <audio controls>
            <source src="${audioUrl}" type="audio/mp3">
            Your browser does not support the audio tag.
            </audio>
            `
             : "Tidak ada audio"
         }
        </td>
         <td class="text-center">
           <button class="btn btn-sm btn-warning edit-buah" data-id="${
             doc.id
           }" data-bs-toggle="modal" data-bs-target="#editBuahModal">
               <span class="icon text-white-50">
                   <i class="fas fa-edit"></i>
               </span>
               <span class="text">Edit</span>
           </button>
           <button class="btn btn-sm btn-danger delete-buah" data-id="${
             doc.id
           }">
               <span class="icon text-white-50">
                   <i class="fas fa-trash"></i>
               </span>
               <span class="text">Hapus</span>
           </button>
         </td>
       `;
      buahListElement.appendChild(row);
    }
  }

  if (document.getElementById("buah")) {
    getBuahAndDisplay();
  }

  if (document.getElementById("buahForm")) {
    document
      .getElementById("buahForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Proses penyimpanan data...
        const namaValue = document.getElementById("nama").value;
        const gambarFile = document.getElementById("gambar").files[0];
        const audioFile = document.getElementById("audio").files[0];

        if (!gambarFile) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Mohon pilih file gambar!",
          });
          return;
        }
        if (!audioFile) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Mohon pilih file audio!",
          });
          return;
        }

        const gambarPath = `img-hewan/${gambarFile.name}`; // Memastikan nama file unik
        const audioPath = `hewan/${audioFile.name}`; // Memastikan nama file unik
        const gambarStorageRef = ref(storage, gambarPath);
        const audioStorageRef = ref(storage, audioPath);

        try {
          await uploadBytes(gambarStorageRef, gambarFile);
          await uploadBytes(audioStorageRef, audioFile);
          const gambarUrl = await getDownloadURL(gambarStorageRef);
          const audioUrl = await getDownloadURL(audioStorageRef);
          // const angkaValueNumber = parseInt(angkaValue);

          await addDoc(collection(db, "buah"), {
            nama: namaValue,
            gambar: gambarUrl,
            audio: audioUrl,
          });

          Swal.fire({
            icon: "success",
            title: "Berhasil disimpan!",
            text: "Data nama buah, gambar dan audio berhasil disimpan!",
          }).then((result) => {
            if (result.isConfirmed) {
              getBuahAndDisplay(); // Refresh tabel setelah penyimpanan
            }
          });

          document.getElementById("buahForm").reset();
          // Tutup modal jika Anda menggunakan Bootstrap modal
          // $('.modal').modal('hide'); atau $('#modalId').modal('hide');
        } catch (error) {
          console.error("Error saat menyimpan data:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal menyimpan!",
            text: "Terjadi kesalahan saat menyimpan data!",
          });
        }
      });
  }

  // Menghapus data buah
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-buah")) {
      const docId = e.target.closest(".delete-buah").getAttribute("data-id");
      // Menggunakan SweetAlert2 untuk konfirmasi
      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus secara permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          // Jika pengguna mengkonfirmasi, hapus data
          deleteBuah(docId)
            .then(() => {
              Swal.fire("Terhapus!", "Data telah dihapus.", "success");
              getBuahAndDisplay(); // Refresh daftar
            })
            .catch((error) => {
              console.error("Failed to delete document: ", error);
              Swal.fire("Gagal!", "Gagal menghapus data.", "error");
            });
        }
      });
    }
  });

  async function deleteBuah(docId) {
    try {
      await deleteDoc(doc(db, "buah", docId));
      console.log("Document deleted with ID: ", docId);
    } catch (error) {
      console.error("Failed to delete document: ", error);
    }
  }

  // Edit buah
  if (document.getElementById("editBuahModal")) {
    document.addEventListener("DOMContentLoaded", () => {
      const editBuahModal = new bootstrap.Modal(
        document.getElementById("editBuahModal")
      );

      document.addEventListener("click", async function (e) {
        if (e.target.closest(".edit-buah")) {
          const docId = e.target.closest(".edit-buah").getAttribute("data-id");

          // Dapatkan data dari Firestore
          const docRef = doc(db, "buah", docId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // Isi nilai ke dalam form modal
            document.getElementById("editBuah").value = data.nama;
            // Simpan docId ke dalam input tersembunyi
            document.getElementById("editBuahDocId").value = docId;
            editBuahModal.show();
          } else {
            console.error("No such document!");
          }
        }
      });

      document
        .getElementById("editBuahForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          // Mendapatkan docId dari input tersembunyi
          const docId = document.getElementById("editBuahDocId").value;
          const buahValue = document.getElementById("editBuah").value;
          // const aValueNumber = parseInt(hewanValue);

          try {
            // Update data di Firestore
            await updateDoc(doc(db, "buah", docId), {
              nama: buahValue,
            });

            Swal.fire(
              "Berhasil diubah!",
              "Data hewan berhasil diubah!",
              "success"
            );
            editBuahModal.hide();
            getBuahAndDisplay();
          } catch (error) {
            console.error("Error updating document:", error);
            Swal.fire(
              "Error!",
              "There was an issue updating your data.",
              "error"
            );
          }
        });
    });
  }
}

// Angka
if (document.getElementById("angka")) {
  async function getAngkaAndDisplay() {
    const angkaElement = document.getElementById("angka");
    angkaElement.innerHTML = null;

    const angkaQuery = query(collection(db, "angka"), orderBy("angka", "asc"));
    const angkaSnapshot = await getDocs(angkaQuery);

    for (const doc of angkaSnapshot.docs) {
      const data = doc.data();
      let audioUrl = data.audio;

      if (audioUrl.startsWith("gs://")) {
        const storageRef = ref(storage, audioUrl);
        audioUrl = await getDownloadURL(storageRef);
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-center mt-5">${data.angka}</td>
        <td class="text-center">
           ${
             audioUrl
               ? `
              <audio controls>
              <source src="${audioUrl}" type="audio/mp3">
              Your browser does not support the audio tag.
              </audio>
              `
               : "Tidak ada audio"
           }
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning edit-angka" data-id="${
            doc.id
          }" data-bs-toggle="modal" data-bs-target="#editAngkaModal">
              <span class="icon text-white-50">
                  <i class="fas fa-edit"></i>
              </span>
              <span class="text">Edit</span>
          </button>
          <button class="btn btn-sm btn-danger delete-angka" data-id="${
            doc.id
          }" >
              <span class="icon text-white-50">
                  <i class="fas fa-trash"></i>
              </span>
              <span class="text">Hapus</span>
          </button>
        </td>
      `;
      angkaElement.appendChild(row);
    }
  }
  getAngkaAndDisplay();

  // Menghapus angka
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-angka")) {
      const docId = e.target.closest(".delete-angka").getAttribute("data-id");
      // Menggunakan SweetAlert2 untuk konfirmasi
      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus secara permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          // Jika pengguna mengkonfirmasi, hapus data
          deleteAngka(docId)
            .then(() => {
              Swal.fire("Terhapus!", "Data telah dihapus.", "success");
              getAngkaAndDisplay(); // Refresh daftar
            })
            .catch((error) => {
              console.error("Failed to delete document: ", error);
              Swal.fire("Gagal!", "Gagal menghapus data.", "error");
            });
        }
      });
    }
  });

  async function deleteAngka(docId) {
    try {
      await deleteDoc(doc(db, "angka", docId));
      console.log("Document deleted with ID: ", docId);
    } catch (error) {
      console.error("Failed to delete document: ", error);
    }
  }

  // Menyimpan angka
  if (document.getElementById("angkaForm")) {
    document
      .getElementById("angkaForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Proses penyimpanan data...
        const angkaValue = document.getElementById("angka").value;
        const audioFile = document.getElementById("audio").files[0];

        if (!audioFile) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Mohon pilih file audio!",
          });
          return;
        }

        const filePath = `angka/${audioFile.name}`; // Memastikan nama file unik
        const storageRef = ref(storage, filePath);

        try {
          await uploadBytes(storageRef, audioFile);
          const audioUrl = await getDownloadURL(storageRef);
          const angkaValueNumber = parseInt(angkaValue);

          await addDoc(collection(db, "angka"), {
            angka: angkaValueNumber,
            audio: audioUrl,
          });

          Swal.fire({
            icon: "success",
            title: "Berhasil disimpan!",
            text: "Data angka dan audio berhasil disimpan!",
          }).then((result) => {
            if (result.isConfirmed) {
              getAngkaAndDisplay(); // Refresh tabel setelah penyimpanan
            }
          });

          document.getElementById("angkaForm").reset();
          // Tutup modal jika Anda menggunakan Bootstrap modal
          // $('.modal').modal('hide'); atau $('#modalId').modal('hide');
        } catch (error) {
          console.error("Error saat menyimpan data:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal menyimpan!",
            text: "Terjadi kesalahan saat menyimpan data!",
          });
        }
      });
  }

  // Mengedit angka
  // if (document.getElementById("editAngkaModal")) {
  //   document.addEventListener("DOMContentLoaded", () => {
  //     const editAngkaModal = new bootstrap.Modal(
  //       document.getElementById("editAngkaModal")
  //     );

  //     document.addEventListener("click", async function (e) {
  //       if (e.target.closest(".edit-angka")) {
  //         const docId = e.target.closest(".edit-angka").getAttribute("data-id");

  //         // Dapatkan data dari Firestore
  //         const docRef = doc(db, "angka", docId);
  //         const docSnap = await getDoc(docRef);

  //         if (docSnap.exists()) {
  //           const data = docSnap.data();
  //           // Isi nilai ke dalam form modal
  //           document.getElementById("editAngka").value = data.angka;
  //           // Simpan docId ke dalam input tersembunyi
  //           document.getElementById("editAngkaDocId").value = docId;
  //           editAngkaModal.show();
  //         } else {
  //           console.error("No such document!");
  //         }
  //       }
  //     });

  //     document
  //       .getElementById("editAngkaForm")
  //       .addEventListener("submit", async function (e) {
  //         e.preventDefault();

  //         // Mendapatkan docId dari input tersembunyi
  //         const docId = document.getElementById("editAngkaDocId").value;
  //         const angkaValue = document.getElementById("editAngka").value;
  //         const angkaValueNumber = parseInt(angkaValue);

  //         try {
  //           // Update data di Firestore
  //           await updateDoc(doc(db, "angka", docId), {
  //             angka: angkaValueNumber,
  //           });

  //           Swal.fire(
  //             "Berhasil diubah!",
  //             "Data angka berhasil diubah!",
  //             "success"
  //           );
  //           editAngkaModal.hide();
  //           getAngkaAndDisplay();
  //         } catch (error) {
  //           console.error("Error updating document:", error);
  //           Swal.fire(
  //             "Error!",
  //             "There was an issue updating your data.",
  //             "error"
  //           );
  //         }
  //       });
  //   });
  // }
  if (document.getElementById("editAngkaModal")) {
    document.addEventListener("DOMContentLoaded", () => {
      const editAngkaModal = new bootstrap.Modal(
        document.getElementById("editAngkaModal")
      );

      document.addEventListener("click", async function (e) {
        if (e.target.closest(".edit-angka")) {
          const docId = e.target.closest(".edit-angka").getAttribute("data-id");

          // Dapatkan data dari Firestore
          const docRef = doc(db, "angka", docId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // Isi nilai ke dalam form modal
            document.getElementById("editAngka").value = data.angka;
            // Reset nilai input audio
            document.getElementById("editAudio").value = "";
            // Simpan docId ke dalam input tersembunyi
            document.getElementById("editAngkaDocId").value = docId;
            editAngkaModal.show();
          } else {
            console.error("No such document!");
          }
        }
      });

      document
        .getElementById("editAngkaForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          // Mendapatkan docId dari input tersembunyi
          const docId = document.getElementById("editAngkaDocId").value;
          const angkaValue = document.getElementById("editAngka").value;
          const angkaValueNumber = parseInt(angkaValue);

          // Mendapatkan file audio yang dipilih
          const audioFile = document.getElementById("editAudio").files[0];

          try {
            // Update baik untuk angka maupun file audio di Firestore jika diubah
            if (!isNaN(angkaValueNumber) || audioFile) {
              const updateData = {};

              if (!isNaN(angkaValueNumber)) {
                updateData.angka = angkaValueNumber;
              }

              if (audioFile) {
                const storageRef = ref(
                  storage,
                  "audio/" + docId + "/" + audioFile.name
                );
                const uploadTask = uploadBytesResumable(storageRef, audioFile);

                uploadTask.on(
                  "state_changed",
                  (snapshot) => {
                    // Handle progress
                    const progress =
                      (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload is " + progress + "% done");
                  },
                  (error) => {
                    // Handle unsuccessful uploads
                    console.error("Error uploading audio:", error);
                    Swal.fire(
                      "Error!",
                      "There was an issue uploading your audio file.",
                      "error"
                    );
                  },
                  async () => {
                    // Handle successful uploads on complete
                    const downloadURL = await getDownloadURL(
                      uploadTask.snapshot.ref
                    );

                    // Update data di Firestore
                    if (!isNaN(angkaValueNumber)) {
                      updateData.audio = downloadURL;
                    }
                    await updateDoc(doc(db, "angka", docId), updateData);

                    Swal.fire(
                      "Berhasil diubah!",
                      "Data berhasil diubah!",
                      "success"
                    );
                    editAngkaModal.hide();
                    getAngkaAndDisplay();
                  }
                );
              } else {
                // Update hanya untuk angka di Firestore jika diisi
                await updateDoc(doc(db, "angka", docId), updateData);

                Swal.fire(
                  "Berhasil diubah!",
                  "Data berhasil diubah!",
                  "success"
                );
                editAngkaModal.hide();
                getAngkaAndDisplay();
              }
            } else {
              // Tidak ada perubahan yang dilakukan
              Swal.fire(
                "Peringatan!",
                "Tidak ada perubahan yang dilakukan.",
                "warning"
              );
            }
          } catch (error) {
            console.error("Error updating document:", error);
            Swal.fire(
              "Error!",
              "There was an issue updating your data.",
              "error"
            );
          }
        });
    });
  }
}

// Huruf
if (document.getElementById("huruf")) {
  // Menampilkan huruf
  async function getHurufAndDisplay() {
    const hurufElement = document.getElementById("huruf");
    hurufElement.innerHTML = null;

    const hurufQuery = query(collection(db, "huruf"), orderBy("huruf", "asc"));
    const hurufSnapshot = await getDocs(hurufQuery);

    for (const doc of hurufSnapshot.docs) {
      const data = doc.data();
      let audioUrl = data.audio;

      if (audioUrl.startsWith("gs://")) {
        const storageRef = ref(storage, audioUrl);
        audioUrl = await getDownloadURL(storageRef);
      }

      const row = document.createElement("tr");
      row.innerHTML = `
         <td class="text-center mt-5">${
           data.huruf ? data.huruf : "Tidak ada data"
         }</td>
         <td class="text-center">
            ${
              audioUrl
                ? `
               <audio controls>
               <source src="${audioUrl}" type="audio/mp3">
               Your browser does not support the audio tag.
               </audio>
               `
                : "Tidak ada audio"
            }
         </td>
         <td class="text-center">
           <button class="btn btn-sm btn-warning edit-huruf" data-id="${
             doc.id
           }" data-bs-toggle="modal" data-bs-target="#editHurufModal">
               <span class="icon text-white-50">
                   <i class="fas fa-edit"></i>
               </span>
               <span class="text">Edit</span>
           </button>
           <button class="btn btn-sm btn-danger delete-huruf" data-id="${
             doc.id
           }">
               <span class="icon text-white-50">
                   <i class="fas fa-trash"></i>
               </span>
               <span class="text">Hapus</span>
           </button>
         </td>
       `;
      hurufElement.appendChild(row);
    }
  }

  if (document.getElementById("huruf")) {
    getHurufAndDisplay();
  }

  // Menghapus huruf
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-huruf")) {
      const docId = e.target.closest(".delete-huruf").getAttribute("data-id");
      // Menggunakan SweetAlert2 untuk konfirmasi
      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus secara permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          // Jika pengguna mengkonfirmasi, hapus data
          deleteHuruf(docId)
            .then(() => {
              Swal.fire("Terhapus!", "Data telah dihapus.", "success");
              getHurufAndDisplay(); // Refresh daftar
            })
            .catch((error) => {
              console.error("Failed to delete document: ", error);
              Swal.fire("Gagal!", "Gagal menghapus data.", "error");
            });
        }
      });
    }
  });

  async function deleteHuruf(docId) {
    try {
      await deleteDoc(doc(db, "huruf", docId));
      console.log("Document deleted with ID: ", docId);
    } catch (error) {
      console.error("Failed to delete document: ", error);
    }
  }

  // Menyimpan huruf
  if (document.getElementById("hurufForm")) {
    document
      .getElementById("hurufForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Proses penyimpanan data...
        const hurufValue = document.getElementById("huruf").value;
        const audioFile = document.getElementById("audio").files[0];

        if (!audioFile) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Mohon pilih file audio!",
          });
          return;
        }

        const filePath = `huruf/${audioFile.name}`; // Memastikan nama file unik
        const storageRef = ref(storage, filePath);

        try {
          await uploadBytes(storageRef, audioFile);
          const audioUrl = await getDownloadURL(storageRef);
          // const hurufValueNumber = parseInt(hurufValue);

          await addDoc(collection(db, "huruf"), {
            huruf: hurufValue,
            audio: audioUrl,
          });

          Swal.fire({
            icon: "success",
            title: "Berhasil disimpan!",
            text: "Data huruf dan audio berhasil disimpan!",
          }).then((result) => {
            if (result.isConfirmed) {
              getHurufAndDisplay(); // Refresh tabel setelah penyimpanan
            }
          });

          document.getElementById("hurufForm").reset();
          // Tutup modal jika Anda menggunakan Bootstrap modal
          // $('.modal').modal('hide'); atau $('#modalId').modal('hide');
        } catch (error) {
          console.error("Error saat menyimpan data:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal menyimpan!",
            text: "Terjadi kesalahan saat menyimpan data!",
          });
        }
      });
  }

  // Mengubah huruf
  // if (document.getElementById("editHurufModal")) {
  //   document.addEventListener("DOMContentLoaded", () => {
  //     const editHurufModal = new bootstrap.Modal(
  //       document.getElementById("editHurufModal")
  //     );

  //     document.addEventListener("click", async function (e) {
  //       if (e.target.closest(".edit-huruf")) {
  //         const docId = e.target.closest(".edit-huruf").getAttribute("data-id");

  //         // Dapatkan data dari Firestore
  //         const docRef = doc(db, "huruf", docId);
  //         const docSnap = await getDoc(docRef);

  //         if (docSnap.exists()) {
  //           const data = docSnap.data();
  //           // Isi nilai ke dalam form modal
  //           document.getElementById("editHuruf").value = data.huruf;
  //           // Simpan docId ke dalam input tersembunyi
  //           document.getElementById("editHurufDocId").value = docId;
  //           editHurufModal.show();
  //         } else {
  //           console.error("No such document!");
  //         }
  //       }
  //     });

  //     document
  //       .getElementById("editHurufForm")
  //       .addEventListener("submit", async function (e) {
  //         e.preventDefault();

  //         // Mendapatkan docId dari input tersembunyi
  //         const docId = document.getElementById("editHurufDocId").value;
  //         const hurufValue = document.getElementById("editHuruf").value;

  //         try {
  //           // Update data di Firestore
  //           await updateDoc(doc(db, "huruf", docId), {
  //             huruf: hurufValue,
  //           });

  //           Swal.fire(
  //             "Berhasil diubah!",
  //             "Data huruf berhasil diubah!",
  //             "success"
  //           );

  //           editHurufModal.hide();
  //           getHurufAndDisplay(); // Refresh the list
  //         } catch (error) {
  //           console.error("Error updating document:", error);
  //           Swal.fire(
  //             "Error!",
  //             "There was an issue updating your data.",
  //             "error"
  //           );
  //         }
  //       });
  //   });
  // }
}
