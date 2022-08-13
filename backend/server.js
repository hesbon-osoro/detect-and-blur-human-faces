require('dotenv').config();
let express = require('express');
let cors = require('cors');
let fileUpload = require('express-fileupload');
let FormData = require('form-data');
let axios = require('axios').default;

let app = express();

// To parse application/json
app.use(express.json());

// Enable cors on all request
app.use(cors());

// File upload middleware
app.use(fileUpload());

app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to Pixlab API server' });
});

//Proxy user uploaded image to PixLab API
app.post('/upload', (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    let image = req.files.image; // If you want to save the image
    // image.mv(__dirname + '/uploads/' + image.name);
    const form = new FormData();
    form.append('file', image.data, image.name);
    form.append('key', process.env.PIXLAB_KEY);
    form.submit(
      {
        protocol: 'https:',
        host: 'api.pixlab.io',
        path: '/store',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
        },
      },
      (err, resp) => {
        if (err) {
          res.status(503).send('File server is currently unavailable.');
        }
        resp.pipe(res);
      }
    );
  } catch (err) {
    res.status(500).send(err);
  }
});

// Proxy facedetect API(Face Detection)
app.post('/facedetect', (req, res) => {
  axios
    .get('https://api.pixlab.io/facedetect', {
      params: {
        img: req.body.url,
        key: process.env.PIXLAB_KEY,
      },
    })
    .then((resp) => res.json(resp.data))
    .catch((err) => console.log(err));
});

// Proxy mogrify API (Face Blur)
app.post('/mogrify', (req, res) => {
  axios
    .post('https://api.pixlab.io/mogrify', {
      img: req.body.url,
      key: process.env.PIXLAB_KEY,
      cord: req.body.coord,
    })
    .then((resp) => res.json(resp.data))
    .catch((err) => console.error(err));
});

app.listen(5000, () => {
  console.log('Server is running in port 5000 and cors enable');
});
