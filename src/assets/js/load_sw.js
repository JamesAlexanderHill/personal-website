if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		navigator.serviceWorker.register(new URL('./service_worker.js', import.meta.url));
	});
}