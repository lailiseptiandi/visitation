# 🗺️ Visitation Plan Management System

Aplikasi web untuk manajemen rencana kunjungan salesman ke outlet secara real-time, dilengkapi fitur rekomendasi rute otomatis dan validasi frekuensi kunjungan.

---

## 📋 Deskripsi Proyek

Sistem ini digunakan oleh **Branch Manager / Super Admin** untuk:

- Memantau aktivitas kunjungan salesman ke outlet secara real-time di atas peta
- Merekomendasikan urutan outlet yang optimal untuk dikunjungi setiap hari
- Mencegah kunjungan ganda berdasarkan frekuensi yang sudah ditentukan per outlet

---

## ✨ Fitur Utama

### 1. 🗺️ Map View – Visitation Plan

- Tampilan peta interaktif dengan marker outlet berwarna sesuai status kunjungan
- Garis rute antar outlet (solid = sudah dilalui, dashed = belum)
- Popup info detail outlet saat klik marker
- Filter rute per salesman dari sidebar

### 2. 🤖 Rekomendasi Rute Otomatis

- Sistem merekomendasikan urutan outlet optimal berdasarkan:
  - Outlet yang belum memenuhi kuota frekuensi bulan ini
  - Jam operasional outlet yang cocok dengan jam kerja salesman
  - Assignment outlet ke group salesman
  - Jarak terdekat dari posisi salesman (nearest neighbor routing)
  - Batas maksimal kunjungan per hari

### 3. ✅ Validasi Frekuensi Kunjungan

- Sistem **mencegah kunjungan ganda** berdasarkan frekuensi per outlet dalam bulan berjalan

| Frekuensi   | Aturan                                                 |
| ----------- | ------------------------------------------------------ |
| `Monthly`   | Maks. **1x kunjungan** per bulan kalender              |
| `Bi-weekly` | Maks. **2x kunjungan** per bulan, jarak minimal 7 hari |
| `Weekly`    | Maks. **4–5x kunjungan** per bulan (1x per minggu)     |

> Jika kuota sudah terpenuhi → outlet **tidak direkomendasikan** dan diberi keterangan _"Frekuensi terpenuhi"_

### 4. 📊 Dashboard Statistik Harian

| Kartu                 | Keterangan                                 |
| --------------------- | ------------------------------------------ |
| Total Target Hari Ini | Total target omset (Rp)                    |
| SM Aktif              | Jumlah salesman yang sedang bekerja        |
| Outlet Selesai        | X / Total outlet yang dijadwalkan hari ini |
| Realisasi Order       | Total order terkumpul hari ini (Rp)        |

### 5. ⚙️ Pengaturan Global

- Limit kunjungan per hari (5 / 10 / 15 / 20 outlet)
- Jam kerja salesman (From – To)
- Notifikasi toast setelah pengaturan disimpan

---

## 🗂️ Entitas Data

### Salesman

| Field                    | Tipe    | Keterangan             |
| ------------------------ | ------- | ---------------------- |
| `nama`                   | string  | Nama lengkap salesman  |
| `foto`                   | string  | URL foto profil        |
| `nomor_hp`               | string  | Nomor HP aktif         |
| `group_id`               | FK      | Group A / B / C / dst. |
| `jam_kerja_mulai`        | time    | Misal: `08:00`         |
| `jam_kerja_selesai`      | time    | Misal: `17:00`         |
| `max_kunjungan_per_hari` | integer | Misal: `20`            |
| `status_aktif`           | boolean | Aktif / Nonaktif       |

### Outlet (Toko)

| Field              | Tipe    | Keterangan                                                                            |
| ------------------ | ------- | ------------------------------------------------------------------------------------- |
| `nama_outlet`      | string  | Nama toko                                                                             |
| `alamat`           | string  | Alamat lengkap                                                                        |
| `latitude`         | float   | Koordinat GPS                                                                         |
| `longitude`        | float   | Koordinat GPS                                                                         |
| `segmentasi`       | enum    | Special Outlet / Regular / dll.                                                       |
| `jam_operasional`  | JSON    | Bisa multi-sesi: `[{buka: "08:00", tutup: "10:00"}, {buka: "13:00", tutup: "17:00"}]` |
| `target_omset`     | integer | Target Rp per kunjungan                                                               |
| `jadwal_kunjungan` | enum    | `weekly` / `bi-weekly` / `monthly`                                                    |
| `group_id`         | FK      | Assigned ke group salesman tertentu                                                   |

### Visit Record (Log Kunjungan)

| Field         | Tipe     | Keterangan                   |
| ------------- | -------- | ---------------------------- |
| `outlet_id`   | FK       | Outlet yang dikunjungi       |
| `salesman_id` | FK       | Salesman yang mengunjungi    |
| `timestamp`   | datetime | Waktu kunjungan              |
| `status`      | enum     | Lihat status di bawah        |
| `nilai_order` | integer  | Nilai order terealisasi (Rp) |

**Status Kunjungan:**

```
Belum Dikunjungi  → ⚫ Abu-abu
Dalam Perjalanan  → 🟡 Kuning
Sedang Dikunjungi → 🔵 Biru
Sudah Dikunjungi  → 🟢 Hijau
```

---

## 🖥️ Struktur Halaman

```
/                         → Redirect ke /visitation-plan
/dashboard                → Grafik performa harian & mingguan
/visitation-plan          → Halaman utama (Map View)
/account-management       → CRUD salesman & group
/listing-product          → Manajemen produk
/subscription             → Manajemen modul aktif
```

### Layout Halaman Visitation Plan

```
┌──────────────┬──────────────────────────────────────────────┐
│   SIDEBAR    │              MAP VIEW                        │
│              │                                              │
│ [Search SM]  │  🟢 outlet-1   🔵 outlet-4                  │
│              │       \           /                          │
│ ▼ Group A    │    ⚫ outlet-6  🟡 outlet-3                  │
│  Tatang 3/10 │                                              │
│  Abdul  2/10 │  [Popup Info Outlet jika diklik]             │
│              │                                              │
│ ▼ Group B    │  Legend:                                     │
│  Joko   0/10 │  🟢 Sudah  🔵 Sedang  🟡 Perjalanan ⚫ Belum│
│  Sri    0/10 │                          [⚙️ Pengaturan]    │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Frontend

- **Framework:** React.js / Next.js
- **Styling:** Tailwind CSS
- **Map:** Leaflet.js atau Google Maps JavaScript API
- **State Management:** Zustand / Redux Toolkit
- **HTTP Client:** Axios

### Backend

- **Runtime:** Node.js dengan Express.js _atau_ Laravel (PHP)
- **Database:** PostgreSQL + ekstensi **PostGIS** (untuk data geospasial)
- **ORM:** Prisma (Node) / Eloquent (Laravel)
- **Auth:** JWT (JSON Web Token)

### Infrastruktur

- **Deployment:** Docker + Nginx
- **CI/CD:** GitHub Actions
- **Storage:** AWS S3 / Cloudflare R2 (untuk foto salesman)

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat

- Node.js >= 18 atau PHP >= 8.1
- PostgreSQL >= 14 dengan ekstensi PostGIS
- Git

### Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/visitation-plan.git
cd visitation-plan

# Install dependencies (frontend)
cd frontend
npm install

# Install dependencies (backend)
cd ../backend
npm install
```

### Konfigurasi Environment

```bash
# Backend – salin file env
cp .env.example .env
```

Isi variabel berikut di `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/visitation_plan

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google Maps (opsional, jika tidak pakai Leaflet)
GOOGLE_MAPS_API_KEY=your_api_key

# App
PORT=3001
NODE_ENV=development
```

### Jalankan Migrasi Database

```bash
# Buat database & jalankan migrasi
npx prisma migrate dev

# Seed data awal (salesman, outlet, group contoh)
npx prisma db seed
```

### Jalankan Aplikasi

```bash
# Terminal 1 – Backend
cd backend
npm run dev        # Berjalan di http://localhost:3001

# Terminal 2 – Frontend
cd frontend
npm run dev        # Berjalan di http://localhost:3000
```

---

## 📡 API Endpoints

### Auth

```
POST   /api/auth/login          Login salesman / admin
POST   /api/auth/logout         Logout
GET    /api/auth/me             Info user aktif
```

### Salesman

```
GET    /api/salesman            List semua salesman (+ filter group)
POST   /api/salesman            Tambah salesman baru
PUT    /api/salesman/:id        Update data salesman
DELETE /api/salesman/:id        Hapus salesman
```

### Outlet

```
GET    /api/outlets             List semua outlet (+ filter group, status)
POST   /api/outlets             Tambah outlet baru
PUT    /api/outlets/:id         Update data outlet
DELETE /api/outlets/:id         Hapus outlet
```

### Kunjungan

```
GET    /api/visits              List kunjungan (filter: tanggal, salesman, outlet)
POST   /api/visits              Catat kunjungan baru
PUT    /api/visits/:id/status   Update status kunjungan
GET    /api/visits/validate/:outletId/:salesmanId   Cek apakah outlet boleh dikunjungi
```

### Rekomendasi Rute

```
GET    /api/recommendations/:salesmanId   Dapatkan rekomendasi rute hari ini
```

### Pengaturan

```
GET    /api/settings            Ambil pengaturan global
PUT    /api/settings            Simpan pengaturan global
```

---

## 🧠 Logika Rekomendasi Rute

```
FUNCTION rekomendasiRute(salesmanId, tanggal):

  1. Ambil semua outlet yang di-assign ke group salesman
  2. Filter: keluarkan outlet yang kuota frekuensinya sudah terpenuhi bulan ini
  3. Filter: keluarkan outlet yang jam operasionalnya tidak overlap dengan jam kerja salesman
  4. Sort: urutkan berdasarkan jarak terdekat dari posisi salesman saat ini
     (algoritma Nearest Neighbor)
  5. Ambil maksimal N outlet sesuai max_kunjungan_per_hari salesman
  6. Return: daftar outlet berurutan (Stop 1, Stop 2, ..., Stop N)
```

---

## 🎨 Panduan Desain UI

| Elemen           | Spec                         |
| ---------------- | ---------------------------- |
| Font             | Inter / Poppins              |
| Warna primer     | `#1D4ED8` (Biru)             |
| Warna sukses     | `#16A34A` (Hijau)            |
| Warna peringatan | `#D97706` (Oranye)           |
| Warna netral     | `#6B7280` (Abu-abu)          |
| Border radius    | `8px` (kartu), `4px` (input) |
| Sidebar width    | `220px`                      |
| Bahasa UI        | Bahasa Indonesia             |

---

## 🌐 Bahasa & Lokalisasi

Seluruh antarmuka menggunakan **Bahasa Indonesia**. Contoh terminologi:

| Istilah Teknis  | Tampil di UI      |
| --------------- | ----------------- |
| Visit           | Kunjungan         |
| Outlet          | Outlet            |
| Salesman        | SM (Sales Man)    |
| Frequency       | Jadwal            |
| Route           | Rute              |
| Settings        | Pengaturan        |
| Already visited | Sudah Dikunjungi  |
| In progress     | Sedang Dikunjungi |
| On the way      | Dalam Perjalanan  |
| Not yet visited | Belum Dikunjungi  |

---

## 📁 Struktur Folder

```
visitation-plan/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapView.jsx
│   │   │   │   ├── OutletMarker.jsx
│   │   │   │   ├── RouteLayer.jsx
│   │   │   │   └── OutletPopup.jsx
│   │   │   ├── Sidebar/
│   │   │   │   ├── SalesmanList.jsx
│   │   │   │   └── GroupSection.jsx
│   │   │   ├── Header/
│   │   │   │   └── StatsCards.jsx
│   │   │   └── Modals/
│   │   │       └── SettingsModal.jsx
│   │   ├── pages/
│   │   │   ├── index.jsx
│   │   │   ├── visitation-plan.jsx
│   │   │   └── dashboard.jsx
│   │   ├── hooks/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   └── recommendationEngine.js   ← Logika utama rekomendasi rute
│   │   ├── models/
│   │   └── middleware/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT**. Lihat file `LICENSE` untuk detail lebih lanjut.

---

_Dibuat untuk PT Teknologi Indonesia – Branch 1_
