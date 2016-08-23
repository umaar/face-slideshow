document.addEventListener('DOMContentLoaded', start);

async function fetchImageData() {
	const imageDataResponse = await fetch('/getImageData.json');
	return await imageDataResponse.json();
}

function sleep(ms = 0) {
	return new Promise(r => setTimeout(r, ms));
}

function addImageToSlideshow({fileName, faceData}) {
	const face = faceData[0];
	const container = document.querySelector('.slideshow');
	const img = document.createElement('img');
	img.src = fileName;
	img.dataset.x = face.x;
	img.dataset.y = face.y;
	container.appendChild(img);
}

function preloadImage(file) {

	const container = document.querySelector('.images-preloading');
	const img = document.createElement('img');
	img.src = file;
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

async function downloadImage(file) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = file;
		img.onload = function(){
			resolve(img);
		};
	})
}

function drawImageToCanvas(img, {x: faceX, y: faceY}) {
	const canvas = document.querySelector('.slideshow');
	context = canvas.getContext('2d');
	const faceXPercent = parseFloat((faceX / img.width).toFixed(2));
	const faceYPercent = parseFloat((faceY / img.height).toFixed(2));

	const drawHeight = parseFloat((img.height * (canvas.width / img.width).toFixed(2)));
	const startX = -(canvas.width * faceXPercent);
	const startY = -(drawHeight * faceYPercent);
	context.translate(canvas.width/2, canvas.height/2)
	context.drawImage(img, startX, startY, canvas.width, drawHeight);
	context.setTransform(1, 0, 0, 1, 0, 0);

}

async function begin() {
	const rawResponse = await fetchImageData();
	let hasAnnotated = rawResponse.hasAnnotated;

	const images = rawResponse.images.map(item => {
		return Object.assign(item, {
			fileName: (hasAnnotated ? '/annotatedImages/' : '/images/') + item.fileName
		});
	});

	console.log(images);

	for (let image of images) {
		const downloadedImage = await downloadImage(image.fileName);
		await sleep(70);
		drawImageToCanvas(downloadedImage, image.faceData[0]);
	}
}

function start() {
	begin();
}