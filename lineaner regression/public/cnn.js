/*jshint esversion:8 */

 // import {MnistData} from './data.js';
// import * from 'public/static_js/utils.js';

const IMAGE_SIZE=784;
const NUM_CLASSES = 10;
const BATCH_SIZE = 500;
const TRAIN_DATA_SIZE = 5500;
const TEST_DATA_SIZE = 1000;

var boston='/cnn_data/boston-housing-train.csv';
var  test_path='/cnn_data/mnist_test.csv';
var  train_path='/cnn_data/mnist_test.csv';
var  batchSize=500;
// async function cnn_getTestdata(){
//
//   const batchImagesArray=new Float32Array(batchSize*IMAGE_SIZE);
//   const batchLabelsArray=new Uint8Array(batchSize*NUM_CLASSES);
// data=await cnn_getData();
//   for(let i=0;i<batchSize;i++){
//
//     console.log(data);
//     const image=data.slice(1,785);
//     batchImagesArray.set(image,i*IMAGE_SIZE);
//     const label=new Uint8Array(10);
//     label[data[0]]=1;
//     batchLabelsArray.set(label,i*NUM_CLASSES);
//     console.log(label);
//   }
//   console.log(data[0]);
//   console.log(batchLabelsArray);
//   console.log(batchImagesArray);
// }


async  function cnn_getData(){
//tf.js的方法读取
const csvDataset = tf.data.csv(
    test_path, {
      columnConfigs: {
        label1: {
          isLabel: true
        }
      }
    });
  const numOfFeatures = (await csvDataset.columnNames()).length - 1;
  const flattenedDataset =
    csvDataset
    .map(({xs, ys}) =>
      {
        return {xs:xs.toArray(), labels:Object.values(ys)};
      })
    .batch(500);
// await flattenedDataset.forEachAsync(e=>{
//         key="label1";
//         console.log(e);
//       });
// console.log(1);log(1);
// console.log(await flattenedDataset.toArray());
return flattenedDataset;
//同步读取，但是数据会被切断
//   var dat=await d3.text(test_path, function(text) {
//     var data = d3.csv.parseRows(text, function(d) {
//             return d.map(Number);
//         });
//         console.log(data);
// });
// console.log(dat);
// console.log(dat.length);
//异步读取
  // const _data= await d3.csv(test_path);
  // const data=_data.columns;
  // // console.log(data);
  // // console.log(data.length);
  // return data;
}
async  function cnn_getData2(){
//tf.js的方法读取
const csvDataset = tf.data.csv(
    train_path, {
      columnConfigs: {
        label1: {
          isLabel: true
        }
      }
    });
  const numOfFeatures = (await csvDataset.columnNames()).length - 1;
  const flattenedDataset =
    csvDataset
    .map(({xs, ys}) =>
      {
        return {xs:tf.tensor2d(xs), labels:Object.values(ys)};
      })
    .batch(500);
await flattenedDataset.forEachAsync(e=>{
        key="label1";
        console.log(e);
      });

return flattenedDataset;}
async function cnn_run() {
   const data=new WebsitePhishingDataset();
   data.loadData().then(async()=>{
     // const trainData=data.getTrainData();
     // const testData=data.getTestData();
     // console.log(testData);
     await showExamples(data);
     const model = cnn_getModel();
   tfvis.show.modelSummary({name: 'Model Architecture'}, model);
  await cnn_train(model, data);
  await showAccuracy(model, data);
  await showConfusion(model, data);
   });
  // test_data=cnn_getData();
  // train_data=cnn_getData2();
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
    canvas.width = 28;
    canvas.height = 28;
    canvas.style = 'margin: 4px;';
    await tf.browser.toPixels(imageTensor, canvas);
    surface.drawArea.appendChild(canvas);

    imageTensor.dispose();
  }
}
function cnn_getModel() {
  const model = tf.sequential();

  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const IMAGE_CHANNELS = 1;

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


  const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
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
     const d = data.getTrainData(TRAIN_DATA_SIZE);
     return [
       d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
       d.labels
     ];
   });

   const [testXs, testYs] = tf.tidy(() => {
     const d = data.getTestData(TEST_DATA_SIZE);
     return [
       d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
       d.labels
     ];
   });


  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs: 10,
    shuffle: true,
    callbacks: fitCallbacks
  });
}


const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

function doPrediction(model, data, testDataSize = 500) {
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
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
