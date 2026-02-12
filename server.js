const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// JSON verilerini okuyabilmek için
app.use(express.json());

// GÜVENLİK AYARI: Veritabanı ve Server dosyalarına tarayıcıdan erişimi engelle
app.use((req, res, next) => {
    if (req.url.startsWith('/data') || req.url.includes('server.js') || req.url.includes('package.json')) {
        return res.status(403).send('Erişim Yasak!');
    }
    next();
});

// STATİK DOSYALAR: Mevcut klasörü (Kök Dizin) sunucu olarak kullan
// Bu sayede css/main.css gibi linklerin bozulmaz.
app.use(express.static(__dirname));

// VERİTABANI YOL TANIMLARI
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// --- YARDIMCI FONKSİYONLAR ---
const readJson = (file) => {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
    } catch (error) {
        return [];
    }
};
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- API İŞLEMLERİ ---

// 1. GİRİŞ YAPMA (Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJson(USERS_FILE);
    
    // Kullanıcıyı bul
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.json({ success: false, message: "Kullanıcı adı veya şifre hatalı!" });
    }
    if (user.isSuspended) {
        return res.json({ success: false, message: "Hesabınız askıya alınmıştır!" });
    }

    // LOG KAYDI (Admin için)
    const logs = readJson(LOGS_FILE);
    logs.unshift({
        username: user.username,
        role: user.role,
        date: new Date().toLocaleString("tr-TR"),
        ip: req.ip
    });
    writeJson(LOGS_FILE, logs);

    // Yönlendirme (Admin ise admin paneline, üye ise özel sayfaya)
    const redirectUrl = user.role === 'admin' ? '/admin.html' : '/ozel-koleksiyon.html';
    
    // Frontend'e başarı mesajı dön
    res.json({ success: true, redirectUrl, user: { username: user.username, role: user.role } });
});

// 2. KULLANICI OLUŞTUR (Sadece Admin)
app.post('/api/admin/create-user', (req, res) => {
    const { newUsername, newPassword, createdBy } = req.body;
    
    // Basit güvenlik: Bunu yapan admin mi? (Gerçek projede Token kullanılır)
    // Şimdilik sadece sunucu tarafında ekliyoruz.
    
    const users = readJson(USERS_FILE);

    if (users.find(u => u.username === newUsername)) {
        return res.json({ success: false, message: "Bu kullanıcı adı zaten kullanılıyor!" });
    }

    users.push({
        id: Date.now(),
        username: newUsername,
        password: newPassword, // Not: Gerçekte şifrelenmeli (hash)
        role: "user",
        isSuspended: false,
        createdAt: new Date().toLocaleString("tr-TR")
    });

    writeJson(USERS_FILE, users);
    res.json({ success: true, message: "Kullanıcı başarıyla oluşturuldu!" });
});

// 3. KULLANICILARI LİSTELE
app.get('/api/admin/users', (req, res) => {
    const users = readJson(USERS_FILE);
    // Şifreleri güvenlik gereği göndermeyebiliriz ama admin paneli için şimdilik gönderelim
    res.json(users);
});

// 4. LOGLARI LİSTELE
app.get('/api/admin/logs', (req, res) => {
    const logs = readJson(LOGS_FILE);
    res.json(logs);
});

// 5. ASKIYA AL / AKTİF ET
app.post('/api/admin/toggle-status', (req, res) => {
    const { userId } = req.body;
    const users = readJson(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex > -1 && users[userIndex].role !== 'admin') {
        users[userIndex].isSuspended = !users[userIndex].isSuspended;
        writeJson(USERS_FILE, users);
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "İşlem başarısız." });
    }
});

// SUNUCUYU BAŞLAT
app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`✅ Sunucu Başlatıldı: http://localhost:${PORT}`);
    console.log(`-----------------------------------------------`);
});