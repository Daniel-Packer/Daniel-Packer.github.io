pdfjsLib.GlobalWorkerOptions.workerSrc = '../../build/pdf.worker.js';

var thesis = pdfjsLib.getDocument('Thesis.pdf')

var loadingTask = thesis;
loadingTask.promise.then(function(pdf) {
  console.log(pdf);
});