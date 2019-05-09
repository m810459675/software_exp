/*
 * Get the car data reduced to just the variables we are interested
 * and cleaned of missing data.
 */
/*jshint esversion:8*/
/*
async function getData() {
  const carsDataReq = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
  const carsData = await carsDataReq.json();
  const cleaned = carsData.map(car => ({
    mpg: car.Miles_per_Gallon,
    horsepower: car.Horsepower,
  }))
  .filter(car => (car.mpg != null && car.horsepower != null));
   console.log(cleaned);
  return cleaned;
}
*/
/* //an example to read .csv file
Papa.parse('./train_set.csv', {
	download:true,
	complete: function(results) {
		//console.log("Finished:", results.data);
		let data=results.data;
		//console.log(data.length);
		for(let i=0;i<data.length;i++){
			var item=data[i];
			console.log(item);
			//console.log(item[0]);
		}

	}
});
*/
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}




async function getData(){
  const value=[];
	var num=0;
/*
	Papa.parse('./train_set.csv', {
		download:true,
		complete: function(results) {

			//console.log("Finished:", results.data);
			dt=results.data;
			//console.log(data.length);
			for(let i=0;i<dt.length-1;i++){
				var item=dt[i];
				if (item=="")
				continue;
				else
				num++;
				//console.log(typeof item[0]);
				//console.log(i,item[0],item[1]);
				//value.push([parseFloat(item[0]),parseFloat(item[1])]);
				value.push([Number(item[0]),Number(item[1])]);

			}
		}
	});
console.log(value);
*/
/*
d3.csv("./train_set.csv", function(error, data) {
  if (error) throw error;
  console.log("71"+data);
});
*/
const data = await d3.csv("train_set.csv");

console.log(data.length);
console.log(data[1].x);
for (let i=0;i<data.length;i++){
	if(data[i].x=="") continue;
	value.push([parseFloat(data[i].x),parseFloat(data[i].y)]);
}
console.log(value);
/*
  for (let x=-20;x<20;x+=0.3){
    value.push([x,x*x+x+getRndInteger(10,20)]);
  }
	console.log(typeof value);
console.log(value);
*/
const values=value.map(v=>({
  x:v[0],
  y:v[1],
}));

  return values;
}

async function run() {
  // Load and plot the original input data that we are going to train on.
  const data = await getData();

  const values = data.map(d => ({
    x: d.x,
    y: d.y,
  }));

//console.log(data);
  tfvis.render.scatterplot(
    {name: 'lineaner regression'},
    {values},
    {
      xLabel: 'x',
      yLabel: 'y',
      height: 300
    }
  );
//console.log(values);
  // More code will be added below
  // Create the model
const model = createModel();
tfvis.show.modelSummary({name: 'Model Summary'}, model);

// Convert the data to a form we can use for training.
const tensorData = convertToTensor(data);
const {inputs, labels} = tensorData;

// Train the model
await trainModel(model, inputs, labels);
console.log('Done Training');

// Make some predictions using the model and compare them to the
// original data
testModel(model, data, tensorData);
}


document.addEventListener('DOMContentLoaded', run);

function createModel() {
  // Create a sequential model
  const model = tf.sequential();

  // Add a single hidden layer
  model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
  model.add(tf.layers.dense({units: 1024, useBias: true}));
  model.add(tf.layers.dense({units: 1024, activation: 'relu'}));
  /*
  model.add(tf.layers.dense({units: 1024, activation: 'relu'}));
  model.add(tf.layers.dense({units: 512, activation: 'relu'}));
  model.add(tf.layers.dense({units: 256, activation: 'relu'}));
  model.add(tf.layers.dense({units: 128, activation: 'relu'}));
  model.add(tf.layers.dense({units: 64, activation: 'relu'}));
  model.add(tf.layers.dense({units: 32, activation: 'relu'}));
  */
  // Add an output layer
  model.add(tf.layers.dense({units: 1, useBias: true}));

  return model;
}


/**
 * Convert the input data to a tensors that we can use for machine
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
function convertToTensor(data) {
  // Wrapping these calculations in a tidy will dispose any
  // intermediate tensors.

  return tf.tidy(() => {
    // Step 1. Shuffle the data
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.x);
    const labels = data.map(d => d.y);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    };
  });
}


async function trainModel(model, inputs, labels) {
  // Prepare the model for training.
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
  });

  const batchSize = 16;
  const epochs = 35;

  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss'],
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });
}


function testModel(model, inputData, normalizationData) {
  const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

  // Generate predictions for a uniform range of numbers between 0 and 1;
  // We un-normalize the data by doing the inverse of the min-max scaling
  // that we did earlier.
  const [xs, preds] = tf.tidy(() => {

    const xs = tf.linspace(0, 1, 100);
    const preds = model.predict(xs.reshape([100, 1]));

    const unNormXs = xs
      .mul(inputMax.sub(inputMin))
      .add(inputMin);

    const unNormPreds = preds
      .mul(labelMax.sub(labelMin))
      .add(labelMin);

    // Un-normalize the data
    return [unNormXs.dataSync(), unNormPreds.dataSync()];
  });


  const predictedPoints = Array.from(xs).map((val, i) => {
    return {x: val, y: preds[i]};
  });

  const originalPoints = inputData.map(d => ({
    x: d.x, y: d.y,
  }));


  tfvis.render.scatterplot(
    {name: 'test model'},
    {values: [originalPoints, predictedPoints], series: ['original', 'predicted']},
    {
      xLabel: 'x',
      yLabel: 'y',
      height: 300
    }
  );
}
