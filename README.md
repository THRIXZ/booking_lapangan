# Website Simulasi Booking Lapangan 

Project simulasi web booking lapangan yang bertujuan untuk menghasilkan sebuah website yang dapat memudahkan pengguna dalam melakukan booking lapangan yang dapat dilakukan secara online serta dibuat dengan menggunakan `Node.js`, `Express`, `MySQL`, dan `Tailwind CSS`.

## Stack

- Node.js
- Express
- EJS
- Tailwind CSS via CDN
- MySQL
- Express Session

## Fitur

- Login, register, logout
- Redirect dashboard berdasarkan role
- Dashboard admin dan user
- CRUD lapangan
- CRUD jadwal
- Booking lapangan dengan validasi bentrok waktu
- Update status booking dan pembayaran
- Edit profile

## Menjalankan project

1. Copy `.env.example` menjadi `.env`
2. Sesuaikan koneksi database MySQL
3. Import `database/schema.sql`
4. Install dependency:

```bash
npm install
```

5. Build Tailwind CSS:

```bash
npm run build:css
```

6. Jalankan server:

```bash
npm run dev
```

## Akun demo

- Admin: `admin@example.com` / `password`
- User: `user@example.com` / `password`

## Struktur penting

- `src/server.js` bootstrap aplikasi
- `src/routes/index.js` seluruh route web
- `src/controllers` logic auth, admin, user, profile
- `src/services` query MySQL
- `src/views` halaman EJS dengan Tailwind
