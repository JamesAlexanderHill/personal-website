const addResourcesToCache = async (resources) => {
	const cache = await caches.open('v1');
	await cache.addAll(resources);
};

self.addEventListener('install', (event) => {
	event.waitUntil(
		addResourcesToCache([
			'./index.html',
		])
	);
});
self.addEventListener('activate', (e) => {
	console.log('Service worker activated', e);
});
self.addEventListener('fetch', function (event) {
	event.respondWith(async function () {
		try {
			var res = await fetch(event.request);
			var cache = await caches.open('cache');
			cache.put(event.request.url, res.clone());
			return res;
		}
		catch (error) {
			return caches.match(event.request);
		}
	}());
});