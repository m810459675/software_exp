/*jshint esversion:8 */

 // import {MnistData} from './data.js';
// import * from 'public/static_js/utils.js';




const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const IMAGE_CHANNELS = 1;
var model = cnn_getModel();

function cnn_download(){
  model.save('downloads://'+Date.now()+'_cnn');
}

async function cnn_run() {
   const data=new WebsitePhishingDataset();
   data.loadData().then(async()=>{
     // const trainData=data.getTrainData();
     // const testData=data.getTestData();
     // console.log(testData);
     if(!data.runnable){
       return;
     }
     // await showExamples(data);

   tfvis.show.modelSummary({name: 'Model Architecture'}, model);
  await cnn_train(model, data);
  await showAccuracy(model, data);
  await showConfusion(model, data);
   });
//   const data = new MnistData();
//   await data.load();
  // await showExamples(data);
   // const model = cnn_getModel();
 // tfvis.show.modelSummary({name: 'Model Architecture'}, model);
// await cnn_train(model, test_data,train_data);
// await showAccuracy(model, data);
// await showConfusion(model, data);
}

async function showExamples(data) {
  // Create a container in the visor
  const surface =
    tfvis.visor().surface({ name: 'Input Data Examples', tab: 'Input Data'});

  // Get the examples
  var examples = data.getTestData(20);
  examples.xs=binarize(examples.xs);
  const numExamples = examples.xs.shape[0];

  // Create a canvas element to render each example
  for (let i = 0; i < numExamples; i++) {
    const imageTensor = tf.tidy(() => {
      // Reshape the image to 28x28 px
      return examples.xs
        .slice([i, 0], [1, examples.xs.shape[1]])
        .reshape([28, 28, 1]);
    });

    const canvas = document.createElement('canvas');
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;
    canvas.style = 'margin: 4px;';
    await tf.browser.toPixels(imageTensor, canvas);
    surface.drawArea.appendChild(canvas);

    imageTensor.dispose();
  }
}
function cnn_getModel() {
  const model = tf.sequential();


  // In the first layer of our convolutional neural network we have
  // to specify the input shape. Then we specify some parameters for
  // the convolution operation that takes place in this layer.
  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

  model.add(tf.layers.flatten());

  const NUM_OUTPUT_CLASSES = 10;
  model.add(tf.layers.dense({
    units: NUM_OUTPUT_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
  }));



  model.compile({
    optimizer: tf.train.sgd(window.learning_rate),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}


async function cnn_train(model,data) {
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {
    name: 'Model Training', styles: { height: '1000px' }
  };
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);


  const [trainXs, trainYs] = tf.tidy(() => {
     const d = data.getTrainData(window.train_data_size);
     return [
       d.xs.reshape([window.train_data_size, 28, 28, 1]),
       d.labels
     ];
   });

   const [testXs, testYs] = tf.tidy(() => {
     const d = data.getTestData(window.test_data_size);
     return [
       d.xs.reshape([window.test_data_size, 28, 28, 1]),
       d.labels
     ];
   });


  return model.fit(trainXs, trainYs, {
    batchSize: window.batchSize,
    validationData: [testXs, testYs],
    epochs: window.epochs,
    shuffle: true,
    callbacks: fitCallbacks
  });
}


const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

function doPrediction(model, data, testDataSize = 500) {

  const testData = data.getTestData(testDataSize);
  const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
  const labels = testData.labels.argMax([-1]);
  const preds = model.predict(testxs).argMax([-1]);

  testxs.dispose();
  return [preds, labels];
}


async function showAccuracy(model, data) {
  const [preds, labels] = doPrediction(model, data);
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = {name: 'Accuracy', tab: 'Evaluation'};
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

  labels.dispose();
}

async function showConfusion(model, data) {
  const [preds, labels] = doPrediction(model, data);
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  const container = {name: 'Confusion Matrix', tab: 'Evaluation'};
  tfvis.render.confusionMatrix(
      container, {values: confusionMatrix}, classNames);

  labels.dispose();
}
