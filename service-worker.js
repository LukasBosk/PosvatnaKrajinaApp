const CACHE_NAME = 'muzeum-boskovicka-cache-v14';

// Seznam souborů, které se mají při instalaci Service Workeru uložit do cache
// DŮLEŽITÉ: Ujistěte se, že zde jsou uvedeny VŠECHNY soubory, které aplikace potřebuje k offline provozu,
// včetně 3D modelů, obrázků a všech JS knihoven!
const urlsToCache = [
  './', // Cesta k index.html
  './index.html',
  './index-3d.html',
  './puzzle.html',
  './script-puzzle.js',
  './style-puzzle.css',
  './manifest.json',
  './service-worker.js',
  './tailwind.min.js',
  './three.min.js',
  './GLTFLoader.js',
  './OBJLoader.js',
  './MTLLoader.js',
  './OrbitControls.js',
  './jszip.min.js',
  './model-viewer.min.js',
  './model-viewer-umd.js',
  './logo.png',
  './pozadi.jpg',
  // Ikonky pro manifest
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/maskable_icon.png',
  './images/puzzle1.jpg',
  './images/puzzle2.jpg',
  './images/puzzle3.jpg',
  './ramecek1.png',
  './ramecek2.png',
  './juxtapose.html', // Nová cesta k juxtapose mapě
  './1.png',
  './2.png',
  './logo.png', // Logo pro úvodní stránku
  './pozadi.jpg', // Pozadí pro obě stránky
  // Všechny 3D modely - DŮLEŽITÉ!
  './Dlato.glb',
  './Dlatostuleji.glb',
  './Kladivko.glb',
  './Naramek.glb',
  './Sekera.glb',
  './Srp.glb',
  './Tordovanykruh.glb',
  './Udidlo.glb',
  './Zavesek1.glb',
  './Zavesek2.glb',
  './Zavesek3.glb',
  './jablonany.glb',
  './boskovice.glb',
  './depotboskovice2.glb'
  // Přidejte sem i jakékoli OBJ/ZIP modely, pokud je používáte, např.:
  // './ukazka.obj',
  // './ukazka.zip'
];

// Instalace Service Workeru: Cache statické soubory
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktivace Service Workeru: Vyčištění starých cachí
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Zajištění, že Service Worker převezme kontrolu nad klienty okamžitě
  return self.clients.claim();
});

// Fetch událost: Obsluha síťových požadavků
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Pokud je položka v cache, vrátíme ji
        if (response) {
          return response;
        }
        // Jinak provedeme síťový požadavek
        return fetch(event.request).then((networkResponse) => {
          // Zkontrolujeme, zda jsme obdrželi platnou odpověď
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          // Naklonujeme odpověď, protože ji lze použít pouze jednou
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        });
      })
      .catch(() => {
        // Zde můžete vrátit fallback stránku pro offline režim, pokud request selže
        // Např. return caches.match('/offline.html');
        console.log('Fetch request failed. No response in cache and no network.');
      })
  );
});
