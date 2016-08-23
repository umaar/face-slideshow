import cv from 'opencv';
import fs from 'fs';
import promisify from 'es6-promisify';

let isProcessing = false;

const fsWriteFile = promisify(fs.writeFile);
const fsReadFile = promisify(fs.readFile);
const fsStat = promisify(fs.stat);
const readDir = promisify(fs.readdir);
const readImage = promisify(cv.readImage);

const COLOR = [0, 255, 0]; // default red
const thickness = 4; // default 1
const cwd = process.cwd();


function detectObject(image) {
	return new Promise((resolve, reject) => {
		// const detectionXMLData = cwd + `/data/haarcascade_frontalface_alt2.xml`
		const detectionXMLData = cwd + `/data/haarcascade_lefteye_2splits.xml`
		image.detectObject(detectionXMLData, {}, function(err, faces) {
			if (err) {
				return reject(err);
			}

			resolve(faces);
		});
	});
}

async function getImgPaths(faceDetectFolder) {
	const paths = await readDir(faceDetectFolder);
	return paths
		.filter(fileName => fileName.endsWith('.jpg'))
		.map(fileName => ({
			fileName,
			absolutePath: faceDetectFolder + '/' + fileName
		}))
}

async function getFaceData(imagePath) {
	const imageData = await readImage(imagePath);

	if (imageData.width() < 1 || imageData.height() < 1) {
		throw new Error('Image has no size');
	}

	return imageData;
}

function getMD5Hash(item) {
	return require('crypto').createHash('md5').update(item).digest('hex');
}

async function handleCachedFaceDataFile(cachedFileName) {
	let cachedFile;

	try {
		cachedFile = await fsStat(cachedFileName)
	} catch (e) {
		console.log('No cached file found');
	}

	return cachedFile
}

async function start(location, annotatedImageFolderURL) {
	let iteration = 0;
	const imagePaths = await getImgPaths(location);
	const hashInput = imagePaths.map(file => file.fileName);
	const fileNamesHash = getMD5Hash(hashInput.toString());


	const cachedFileName = `${cwd}/tmp/${fileNamesHash}.json`;
	const cachedFaceData = await handleCachedFaceDataFile(cachedFileName);
	const faceDataJsonOutput = [];
	let returnObj;

	if (cachedFaceData) {
		console.log('Returning cached data');
		const cachedBuffer = await fsReadFile(cachedFileName);
		return JSON.parse(cachedBuffer.toString());
	}

	if (isProcessing) {
		return false;
	}

	for (let imagePath of imagePaths) {
		isProcessing = true;
		console.log('On image: ', ++iteration);
		const imageData = await getFaceData(imagePath.absolutePath);
		const faceData = await detectObject(imageData);

		if (!faceData || faceData.length < 1) {
			continue;
		}

		if (annotatedImageFolderURL) {
			for (let face of faceData) {
				imageData.rectangle([face.x, face.y], [face.width, face.height], COLOR, 2);
			}

			const outputPath = annotatedImageFolderURL + '/' + imagePath.fileName;
			console.log('Writing to ', outputPath);
			imageData.save(outputPath);
		}

		faceDataJsonOutput.push({
			fileName: imagePath.fileName,
			faceData,
			width: imageData.width(),
			height: imageData.height()
		});
	}


	returnObj = {
		images: faceDataJsonOutput,
		fileNamesHash
	}

	if (returnObj) {
		returnObj.hasAnnotated = true;
	}

	await fsWriteFile(cachedFileName, JSON.stringify(returnObj));
	isProcessing = false;
	return returnObj;

}

export default start;
