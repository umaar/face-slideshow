import cv from 'opencv';
import fs from 'fs';
import promisify from 'es6-promisify';

const readDir = promisify(fs.readdir);
const readImage = promisify(cv.readImage);

const faceDetectFolder = '/Users/umarhansa/Downloads/face-detect-images-sample'
const COLOR = [0, 255, 0]; // default red
const thickness = 4; // default 1
const cwd = process.cwd();


function detectObject(image) {
	return new Promise((resolve, reject) => {
		const detectionXMLData = cwd + `/data/haarcascade_frontalface_alt2.xml`
		image.detectObject(detectionXMLData, {}, function(err, faces) {
			if (err) {
				return reject(err);
			}

			resolve(faces);
		});
	});
}

async function getImgPaths() {
	const paths = await readDir(faceDetectFolder);
	return paths
		.filter(fileName => fileName.endsWith('.jpg'))
		.map(fileName => ({
			fileName,
			absolutePath: cwd + '/img/' + fileName
		}))
}

async function getFaceData(imagePath) {
	const imageData = await readImage(imagePath);

	if (imageData.width() < 1 || imageData.height() < 1) {
		throw new Error('Image has no size');
	}

	return imageData;
}

async function start() {
	const imagePaths = await getImgPaths();

	const faceDataJsonOutput = [];

	for (let imagePath of imagePaths) {
		const imageData = await getFaceData(imagePath.absolutePath);
		const faceData = await detectObject(imageData);

		if (!faceData || faceData.length < 1) {
			continue;
		}

		for (let face of faceData) {
			imageData.rectangle([face.x, face.y], [face.width, face.height], COLOR, 2);
		}

		const outputPath = cwd + `/output/` + imagePath.fileName;
		console.log('Writing to ', outputPath);

		faceDataJsonOutput.push({
			fileName: imagePath.fileName,
			faceData: JSON.stringify(faceData)
		});
		imageData.save(outputPath);
	}

	console.log(faceDataJsonOutput);

}

start();
