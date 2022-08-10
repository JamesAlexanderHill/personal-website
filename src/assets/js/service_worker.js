self.addEventListener('install', (e) => {
	console.log('Service worker installed', e);
});
self.addEventListener('activate', (e) => {
	console.log('Service worker activated', e);
});