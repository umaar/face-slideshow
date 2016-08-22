import http from 'http';
import express from 'express';
import faceDetection from './faceDetection';

const cwd = process.cwd();
const imageFolderURL = '/Users/umarhansa/Downloads/face-detect-images-sample';

const serverPort = 8080;

let app = express();
app.use(express.static(cwd + '/client'));
app.use('/images', express.static(imageFolderURL));


app.get('/getImageData.json', async function (req, res, next) {
	const imageData = await faceDetection(imageFolderURL + '/tmp');
	res.json(imageData)
})


let server = http.createServer(app);
server.listen(serverPort);
