import http from 'http';
import express from 'express';

const cwd = process.cwd();
const imageFolderURL = '/Users/umarhansa/Downloads/face-detect-images-sample';

const serverPort = 8080;

let app = express();
app.use(express.static(cwd + '/client'));
app.use('/images', express.static(imageFolderURL));


app.get('/getImageData.json', (req, res, next) => {
	res.json({
		total: 1,
		data: 2
	})
})


let server = http.createServer(app);
server.listen(serverPort);
