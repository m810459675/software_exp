/*jshint esversion:8*/

const IMAGE_SIZE=784;
const NUM_CLASSES=10;
var dataset=null;
var trainSize=0;
var testSize=0;

async function parseCsv (data) {
  return new Promise(resolve => {
    data = data.map((row) => {
      return Object.keys(row).sort().map(key => parseFloat(row[key]));
    });
    resolve(data);
  });
}

 async function loadCsv(filename) {
  return new Promise(resolve => {
    const url = filename;

    console.log(`  * Downloading data from: ${url}`);
    Papa.parse(url, {
      download: true,
      woker:true,
      // dynamicTyping: true,
      complete: (results) => {
        resolve(parseCsv(results.data));
      }
      // complete: (results) => {
      //   resolve(results.data);
      // }
    });
  });
}

/** Helper class to handle loading training and test data. */
class WebsitePhishingDataset {
  constructor() {
    this.dataset = null;
    this.trainSize = 0;
    this.testSize = 0;
    this.trainBatchIndex = 0;
    this.testBatchIndex = 0;

    this.NUM_FEATURES = 784;
    this.NUM_CLASSES = 10;

    this.runnable=true;
  }

  get numFeatures() {
    return this.NUM_FEATURES;
  }

  /** Loads training and test data. */
  async loadData() {
    if(window.train_datapath==' '||window.train_labelpath==' '||
    window.test_datapath==' '||window.test_labelpath==' '){
      alert(" 未完整上传完训练集和测试集，请上传完后重试");
      this.runnable=false;
      return ;
    }
    this.dataset = await Promise.all([
      loadCsv(window.train_datapath), loadCsv(window.train_labelpath),
      loadCsv(window.test_datapath), loadCsv(window.test_labelpath)
    ]);

    // let {dataset: trainDataset, vectorMeans, vectorStddevs} =
    //     normalizeDataset(this.dataset[0]);

    // this.dataset[0] = trainDataset;

    // let {dataset: testDataset} = normalizeDataset(
    //     this.dataset[2], false, vectorMeans, vectorStddevs);

    // this.dataset[2] = testDataset;
    // console.log(this.dataset[0]);
    // console.log(this.dataset[1]);
    // console.log(this.dataset[2]);
    // console.log(this.dataset[3]);
    this.trainSize = this.dataset[0].length;
    this.testSize = this.dataset[2].length;
    console.log(this.trainSize);
    console.log(this.testSize);
    // shuffle(this.dataset[0], this.dataset[1]);
    // shuffle(this.dataset[2], this.dataset[3]);
  }

  getTrainData(batchSize) {
    const batchImagesArray = new Float32Array(batchSize * IMAGE_SIZE);
    const batchLabelsArray = new Uint8Array(batchSize * NUM_CLASSES);
    for(let i=0;i<batchSize;i++){
      const image=this.dataset[0][this.trainBatchIndex+i];
      batchImagesArray.set(image,i*IMAGE_SIZE);
      if(this.dataset[0][this.trainBatchIndex+i].length!=784){
        console.log(this.trainBatchIndex+i);
      }
      //console.log(this.dataset[3][this.testBatchIndex+i][0]);

      var temp=new Uint8Array(NUM_CLASSES);
      temp[this.dataset[1][this.trainBatchIndex+i][0]]=1;
      // console.log(this.dataset[3][this.testBatchIndex+i][0],temp);
      batchLabelsArray.set(temp,i*NUM_CLASSES);
    }

    this.trainBatchIndex=(this.trainBatchIndex+batchSize)%this.trainSize;
    // console.log(batchLabelsArray);
    // const dataShape = [BATCH_SIZE, IMAGE_SIZE];
    //
    // const testData = Float32Array.from([].concat.apply([], this.dataset[2]));
    // const testTarget = Float32Array.from([].concat.apply([], this.dataset[3]));

    return {
      xs:binarize( tf.tensor2d(batchImagesArray,[batchSize,IMAGE_SIZE]),0.1),
      labels: tf.tensor2d(batchLabelsArray,[batchSize,NUM_CLASSES])
    };
  }

  getTestData(batchSize) {
    const batchImagesArray = new Float32Array(batchSize * IMAGE_SIZE);
    const batchLabelsArray = new Uint8Array(batchSize * NUM_CLASSES);
    for(let i=0;i<batchSize;i++){
      const image=this.dataset[2][this.testBatchIndex+i];
      batchImagesArray.set(image,i*IMAGE_SIZE);
      if(this.dataset[0][this.testBatchIndex+i].length!=784){
        console.log(this.testBatchIndex+i);
      }
      //console.log(this.dataset[3][this.testBatchIndex+i][0]);

      var temp=new Uint8Array(NUM_CLASSES);
      temp[this.dataset[3][this.testBatchIndex+i][0]]=1;
      // console.log(this.dataset[3][this.testBatchIndex+i][0],temp);
      batchLabelsArray.set(temp,i*NUM_CLASSES);
    }
    //     console.log(this.dataset[2]);
    //     console.log(batchImagesArray);
    this.testBatchIndex=(this.testBatchIndex+batchSize)%this.testSize;
    // console.log(batchLabelsArray);
    // const dataShape = [BATCH_SIZE, IMAGE_SIZE];
    //
    // const testData = Float32Array.from([].concat.apply([], this.dataset[2]));
    // const testTarget = Float32Array.from([].concat.apply([], this.dataset[3]));

    return {
      xs: binarize(tf.tensor2d(batchImagesArray,[batchSize,IMAGE_SIZE]),0.1),
      labels: tf.tensor2d(batchLabelsArray,[batchSize,NUM_CLASSES])
    };
  }
}

function binarize(y, threshold) {
  if (threshold == null) {
    threshold = 0.5;
  }
  tf.util.assert(
      threshold >= 0 && threshold <= 1,
      `Expected threshold to be >=0 and <=1, but got ${threshold}`);

  return tf.tidy(() => {
    const condition = y.greater(tf.scalar(threshold));
    return tf.where(condition, tf.onesLike(y), tf.zerosLike(y));
  });
}

function cnn_run2(){
  const data=new WebsitePhishingDataset();
  data.loadData().then(async()=>{
    //const trainData=data.getTrainData();
    const testData=data.getTestData();
    console.log(testData);
  });
}
