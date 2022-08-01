import sample from 'lodash/sample';

const titles = ["Solution Architect", "Web Engineer", 'Avid Programmer'];

document.addEventListener('DOMContentLoaded', () => {
    const titleContainer = document.getElementById('titleContainer');
    titleContainer.innerText = sample(titles);
});
