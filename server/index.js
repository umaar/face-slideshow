import http from 'http';
import express from 'express';
import faceDetection from './faceDetection';

const cwd = process.cwd();
// const imageFolderURL = '/Users/umarhansa/Downloads/face-detect-images-sample';
const imageFolderURL = '/Users/umarhansa/Downloads/instagram-peace-sign-image-dump';
const annotatedImageFolderURL = imageFolderURL + '/annotated';

const serverPort = 8080;

let app = express();
app.use(express.static(cwd + '/client'));
app.use('/images', express.static(imageFolderURL));
app.use('/annotatedImages', express.static(annotatedImageFolderURL));


app.get('/getImageData.json', async function (req, res, next) {
	const imageData = await faceDetection(imageFolderURL, annotatedImageFolderURL);
	console.log('Express got data', imageData);
	res.json(imageData)
})


let server = http.createServer(app);
server.listen(serverPort);

faceDetection(imageFolderURL, annotatedImageFolderURL)