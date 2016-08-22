document.addEventListener('DOMContentLoaded', start);

async function fetchImageData() {
	const imageDataResponse = await fetch('data/imageData.json');
	return await imageDataResponse.json();
}

function sleep(ms = 0) {
	return new Promise(r => setTimeout(r, ms));
}

function addImageToSlideshow({fileName, faceData}) {
	const face = faceData[0];
	const container = document.querySelector('.slideshow');
	const img = document.createElement('img');
	img.src = '/img/' + fileName;
	img.dataset.x = face.x;
	img.dataset.y = face.y;
	container.appendChild(img);
}

async function animateImages() {
	const slideshow = document.querySelector('.slideshow');
	const imgElms = [...slideshow.querySelectorAll('img')].reverse();
	for (let imgElm of imgElms) {
		await sleep(50);
		imgElm.style.display = 'none';
	}
}

function preloadImage(file) {
	const container = document.querySelector('.images-preloading');
	const img = document.createElement('img');
	img.src = '/img/' + file;
	container.appendChild(img);
}

function putImagesIntoPosition() {
	const slideshow = document.querySelector('.slideshow');
	const imgElms = [...slideshow.querySelectorAll('img')];

	for (let imgElm of imgElms) {
		const imgElmX = imgElm.dataset.x;
		const imgElmY = imgElm.dataset.y;
		const transformString = `translateX(-${imgElmX}px) translateY(-${imgElmY}px)`;
		imgElm.style.transform = transformString;
	}
}

async function begin() {
	const {images} = await fetchImageData();
	console.log(images);

	for (let image of images) {
		preloadImage(image.fileName);
		addImageToSlideshow(image);
	}

	putImagesIntoPosition();
	animateImages();
}

function start() {
	begin();
}