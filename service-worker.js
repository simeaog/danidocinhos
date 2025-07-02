self.addEventListener('install', function(e) {
  self.skipWaiting();
});
self.addEventListener('fetch', function(event) {
  // Você pode implementar cache aqui, mas para PWA básico não precisa
});
