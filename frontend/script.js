const API_URL = "http://localhost:8080/api";
const authSection = document.getElementById("auth-section");
const adminSection = document.getElementById("admin-section");
const mediaList = document.getElementById("media-list");
const loginForm = document.getElementById("login-form");
const adminForm = document.getElementById("admin-crud-form");
const authStatus = document.getElementById("auth-status");
const adminMessage = document.getElementById("admin-message");
const logoutButton = document.getElementById("btn-logout");
const registerButton = document.getElementById("btn-register");
const submitButton = document.getElementById("submit-btn");
const cancelButton = document.getElementById("cancel-btn");

let userToken = localStorage.getItem("jwtToken");
let userRole = localStorage.getItem("userRole");

function updateUI() {
    if (userToken && userRole === "admin") {
        authSection.classList.remove("hidden");
        adminSection.classList.remove("hidden");
        loginForm.classList.add("hidden");
        logoutButton.classList.remove("hidden");
        authStatus.innerHTML = `Login sebagai: <strong>Admin</strong>`;
    } else if (userToken && userRole === "user") {
        authSection.classList.remove("hidden");
        adminSection.classList.add("hidden");
        loginForm.classList.add("hidden");
        logoutButton.classList.remove("hidden");
        authStatus.innerHTML = `Login sebagai: User biasa. Tidak ada akses CRUD admin.`;
    } else {
        authSection.classList.remove("hidden");
        adminSection.classList.add("hidden");
        loginForm.classList.remove("hidden");
        logoutButton.classList.add("hidden");
        authStatus.innerHTML = "";
    }
}

/** Mengambil data media (Akses Publik) */
async function fetchMedia() {
    mediaList.innerHTML = "<li>Memuat data media...</li>";
    try {
        const response = await fetch(`${API_URL}/media`);
        const mediaArray = await response.json();
        mediaList.innerHTML = "";
        if (mediaArray.length === 0) {
            mediaList.innerHTML = "<li>Belum ada media dalam daftar.</li>";
            return;
        }
        mediaArray.forEach((media) => {
            const li = document.createElement("li");
            li.innerHTML = `
            <div>
                <strong>${media.judul}</strong>
                (Genre: ${media.genre}, Tahun: ${media.tahun_rilis})
            </div>
            <div class="admin-controls">
            ${
                userRole === "admin"
                    ? `
                <button onclick="editMedia(${media.id_media}, '${media.judul}', '${media.genre}', ${media.tahun_rilis})">Edit</button>
                <button onclick="deleteMedia(${media.id_media})">Hapus</button>
                `
                    : ""
            }
            </div>
            `;
            mediaList.appendChild(li);
        });
    } catch (error) {
        mediaList.innerHTML = `<li>Gagal memuat media: ${error.message}</li>`;
        console.error("Fetch error:", error);
    }
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("auth-username").value;
    const password = document.getElementById("auth-password").value;
    await handleAuth("signin", username, password);
});

registerButton.addEventListener("click", async () => {
    const username = document.getElementById("auth-username").value;
    const password = document.getElementById("auth-password").value;
    if (!username || !password) {
        authStatus.innerHTML = "Masukkan username dan password untuk daftar!";
        return;
    }
    await handleAuth("signup", username, password, "admin");
});

async function handleAuth(endpoint, username, password, role = "user") {
    try {
        const response = await fetch(`${API_URL}/auth/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, role }),
        });
        const data = await response.json();
        if (!response.ok) {
            authStatus.innerHTML = `Gagal ${endpoint}: ${data.message}`;
            return;
        }
        if (endpoint === "signin") {
            userToken = data.accessToken;
            userRole = data.role;
            localStorage.setItem("jwtToken", userToken);
            localStorage.setItem("userRole", userRole);
            authStatus.innerHTML = `Login berhasil! Role: ${userRole}`;
            loginForm.reset();
        } else {
            authStatus.innerHTML = `Pendaftaran berhasil. Silakan login.`;
        }
        updateUI();
        fetchMedia();
    } catch (error) {
        authStatus.innerHTML = `Terjadi kesalahan jaringan: ${error.message}`;
        console.error("Auth error:", error);
    }
}

logoutButton.addEventListener("click", () => {
    userToken = null;
    userRole = null;
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    authStatus.innerHTML = "Berhasil Logout.";
    updateUI();
    fetchMedia();
});

adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id_media = document.getElementById("media-id").value;
    const judul = document.getElementById("judul").value;
    const genre = document.getElementById("genre").value;
    const tahun_rilis = parseInt(document.getElementById("tahun_rilis").value);
    const mediaData = { judul, genre, tahun_rilis };

    let method = id_media ? "PUT" : "POST";
    let url = id_media ? `${API_URL}/media/${id_media}` : `${API_URL}/media`;
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(mediaData),
        });
        const data = await response.json();
        if (!response.ok) {
            adminMessage.innerHTML = `Operasi gagal: ${data.message}`;
            return;
        }
        adminMessage.innerHTML = `Media berhasil ${id_media ? "diupdate" : "ditambahkan"}!`;
        adminForm.reset();
        cancelEdit();
        fetchMedia();
    } catch (error) {
        adminMessage.innerHTML = `Terjadi kesalahan jaringan: ${error.message}`;
        console.error("CRUD error:", error);
    }
});

function editMedia(id_media, judul, genre, tahun_rilis) {
    document.getElementById("media-id").value = id_media;
    document.getElementById("judul").value = judul;
    document.getElementById("genre").value = genre;
    document.getElementById("tahun_rilis").value = tahun_rilis;
    submitButton.textContent = "Simpan Perubahan";
    cancelButton.classList.remove("hidden");
    adminMessage.innerHTML = "Mode Edit Aktif.";
}

cancelButton.addEventListener("click", cancelEdit);
function cancelEdit() {
    document.getElementById("media-id").value = "";
    adminForm.reset();
    submitButton.textContent = "Tambah Media";
    cancelButton.classList.add("hidden");
    adminMessage.innerHTML = "";
}

async function deleteMedia(id_media) {
    if (!confirm("Anda yakin ingin menghapus media ini?")) return;
    try {
        const response = await fetch(`${API_URL}/media/${id_media}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            alert(`Hapus gagal: ${data.message}`);
            return;
        }
        alert("Media berhasil dihapus!");
        fetchMedia();
    } catch (error) {
        alert(`Terjadi kesalahan jaringan: ${error.message}`);
        console.error("Delete error:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    fetchMedia();
});
