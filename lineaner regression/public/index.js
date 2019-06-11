/*jshint esversion:8*/
window.path=' ';
window.learning_rate=0.01;
window.batchSize=16;
window.epochs=32;
window.train_data_size=550;
window.test_data_size=100;
window.train_datapath=' ';
window.train_labelpath=' ';
window.test_datapath=' ';
window.test_labelpath=' ';

var train_datasuccess=false;
var train_labelsuccess=false;
var test_datasuccess=false;
var test_labelsuccess=false;

//显示选择文件后的文件路径
function showfilepath(files,n){
  console.log(files.length);
  if(files.length==0){
    $(".showFileName"+n).html("");
    $(".fileerrorTip"+n).html("您未上传文件，或者您上传文件类型有误！").show();
    return;
  }
  console.log(files);
  console.log(files[0].size);
  console.log(files[0].name);

   if(files[0].size!=0){
     var name=files[0].name;
     $(".fileerrorTip"+n).html("").hide();
     $(".showFileName"+n).html(name);
   }
   else{
     $(".showFileName"+n).html("");
     $(".fileerrorTip"+n).html("您未上传文件，或者您上传文件类型有误！").show();
   }
}

function changePara(){
  console.log("49 "+isNaN(document.getElementById("batch_size").value));
  console.log("50 "+typeof document.getElementById("batch_size").value);

  window.epochs=parseFloat(document.getElementById("epoch").value);
  window.learning_rate=parseFloat(document.getElementById("learning_rate").value);
  window.batchSize=parseFloat(document.getElementById("batch_size").value);

  if(isNaN(epochs)||isNaN(learning_rate)||isNaN(batchSize)){
    alert("参数不能为非数字");
    return ;
  }
  if(epochs==0||learning_rate==0||batchSize==0){
    alert("参数不能为0");
    return;
  }
  alert('修改参数成功');
  console.log("61 "+batchSize);
  console.log("62 "+document.getElementById("batch_size").value);

}

function changePara_cnn(){
  console.log("49 "+isNaN(document.getElementById("batch_size").value));
  console.log("50 "+typeof document.getElementById("batch_size").value);

  window.epochs=parseFloat(document.getElementById("epoch").value);
  window.learning_rate=parseFloat(document.getElementById("learning_rate").value);
  window.batchSize=parseFloat(document.getElementById("batch_size").value);
  window.train_data_size=parseFloat(document.getElementById("train_data_size").value);
  window.test_data_size=parseFloat(document.getElementById("test_data_size").value);

  if(isNaN(epochs)||isNaN(learning_rate)||isNaN(batchSize)||isNaN(test_data_size)||isNaN(train_data_size)){
    alert("参数不能为非数字");
    return ;
  }
  if(epochs==0||learning_rate==0||batchSize==0||test_data_size==0||train_data_size==0){
    alert("参数不能为0");
    return;
  }
  alert('修改参数成功');
  console.log("61 "+batchSize);
  console.log("62 "+document.getElementById("batch_size").value);

}

function formsubmit(){
  if(train_datasuccess==false){
    document.getElementById("train_data_submit").click();
  }
  else if(train_labelsuccess==false){
      document.getElementById("train_label_submit").click();
  }
  else if(test_datasuccess==false){
    document.getElementById("test_data_submit").click();
  }
  else if(test_labelsuccess==false){
    document.getElementById("test_label_submit").click();
  }


  // document.getElementById("test_label_submit").click();
  // if(window.train_datapath==' '||window.train_labelpath==' '||
  // window.test_datapath==' '||window.test_labelpath==' '){
  //   alert(" 未完整上传完训练集和测试集，请上传完后重试");
  //   return ;
  // }
}

//当上传文件成功后，出现提示
function uploadSuccess(data) {
  console.log(data);
  console.log(typeof data.myfile.size);
  console.log(path);
  if(data.myfile.size!=0){
  alert("提交文件成功");
  window.path=data.myfile.path.substring(7,);
}
else{
  alert("提交文件失败，请重新选择文件");
}
}

function uploadtraindata(data){
  if(data.myfile.size!=0){
  window.train_datapath=data.myfile.path.substring(7,);
  // console.log(window.train_datapath);
  train_datasuccess=true;
  document.getElementById("train_label_submit").click();
}
else{
alert("训练集数据提交失败，请重试");
train_datasuccess=false;
}
}

function uploadtrainlabel(data){
  if(data.myfile.size!=0){
  window.train_labelpath=data.myfile.path.substring(7,);
  train_labelsuccess=true;
  document.getElementById("test_data_submit").click();
}
else{
alert("训练集标签提交失败，请重试");
train_labelsuccess=false;
}
}

function uploadtestdata(data){
  if(data.myfile.size!=0){
  window.test_datapath=data.myfile.path.substring(7,);
  test_datasuccess=true;
  document.getElementById("test_label_submit").click();
}
else{
alert("测试集数据提交失败，请重试");
test_datasuccess=false;
}
}

function uploadtestlabel(data){
  if(data.myfile.size!=0){
  window.test_labelpath=data.myfile.path.substring(7,);
  test_labelsuccess=true;
  alert("已成功提交所有数据");
  console.log(window.train_datapath);
  console.log(window.train_labelpath);
  console.log(window.test_datapath);
  console.log(window.test_labelpath);
}
else{
alert("测试集标签提交失败，请重试");
test_labelsuccess=false;
}
}
