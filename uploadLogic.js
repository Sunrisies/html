function uploadFile(file) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDU2NTAzMTEsImV4cCI6MTc0NTY1MzkxMX0.9qLdfRW6ZdhQ3IBSPM1pUW7jY63mxrY7kSVvRBTdPYk");
    myHeaders.append("User-Agent", "Apifox/1.0.0 ( https://apifox.com)");
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Host", "api.chaoyang1024.top:2345");
    myHeaders.append("Connection", "keep-alive");

    var formdata = new FormData();
    formdata.append("file", file, file.name);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    fetch("https://api.chaoyang1024.top:2345/api/upload/image", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
}

export { uploadFile };