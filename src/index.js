const titles = ['Solution Architect', 'Web Engineer', 'Avid Programmer', 'Full Stack Developer'];

document.addEventListener('DOMContentLoaded', () => {
	const randomIndex = Math.ceil(Math.random() * titles.length -1);
	const titleContainer = document.getElementById('titleContainer');
	titleContainer.innerText = titles[randomIndex];
});