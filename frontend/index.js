const imageInput = document.getElementById('imageinput');
const image = document.getElementById('image');
const finalImage = document.getElementById('finalimage');
const proxyinput = document.getElementById('proxyinput');
const processBtn = document.getElementById('btn-process');

let imageFile;

proxyinput.onclick = (e) => {
  imageInput.click();
};

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Image processing using PixLab API

// 1. Uploading the image to remote server
async function uploadToStore(image) {
  const formData = new FormData();
  formData.append('image', image);
  try {
    let response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (err) {
    throw 'Fetch request give some error';
  }
}
// 2. Calling the face detection API
async function facedetect(imageurl) {
  try {
    let faceDetectionResult = await fetch('http://localhost:5000/facedetect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: imageurl }),
    });
    let tempjson = await faceDetectionResult.json();
    return tempjson.faces;
  } catch (err) {
    throw 'Face detection not working';
  }
}

// 3. Blur the detected faces
async function blurImage(faceCoordinate, imageUrl) {
  try {
    let blurImageResponse = await fetch('http://localhost:5000/mogrify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,
        coord: faceCoordinate,
      }),
    });
    return blurImageResponse.json();
  } catch (err) {
    throw 'Blur image function is not working';
  }
}

imageInput.addEventListener('change', async (e) => {
  const fileList = e.target.files;
  if (fileList.length > 0) {
    let data = await readFileAsync(fileList[0]);
    image.src = data;
    imageFile = fileList[0];
  }
});
processBtn.onclick = async () => {
  if (imageFile) {
    let imageUploadResponse = await uploadToStore(imageFile);
    if (imageUploadResponse['ssl_link']) {
      let faceCoordinates = await facedetect(imageUploadResponse['ssl_link']);
      if (faceCoordinates) {
        let blurimage = blurImage(
          faceCoordinates,
          imageUploadResponse['ssl_link']
        );
        finalImage.src = blurimage['ssl_link'];
      }
    }
  } else {
    throw 'No file present to process';
  }
};
