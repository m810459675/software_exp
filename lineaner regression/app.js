/**
 * Created by iwang on 2017/1/15.
 */
//express使用的是@4版本的。
var express = require('express');
//form表单需要的中间件。
var mutipart= require('connect-multiparty');
var path=require('path');

var mutipartMiddeware = mutipart();
var app = express();
//下面会修改临时文件的储存位置，如过没有会默认储存别的地方，这里不在详细描述。
app.use(express.static(path.join(__dirname,'public')));
//console.log(path.join(__dirname,'public'));
app.use(mutipart({uploadDir:'./public/train_data/'}));

//浏览器访问localhost会输出一个html文件
app.get('/cnn_page.html',function (req,res) {
    res.type('text/html');
    res.sendfile(path.join(__dirname,'public/cnn_page.html'));
    console.log('success');
});

//设置http服务监听的端口号。
app.set('port',process.env.PORT || 3000);
app.listen(app.get('port'),function () {
    console.log("Express started on http://localhost:"+app.get('port')+'; press Ctrl-C to terminate.');
    // console.log(path.join(__dirname,'public'));
});


app.post('/upload',mutipartMiddeware,function (req,res) {
    //这里打印可以看到接收到文件的信息。
    //console.log(req.files);
    var data = JSON.stringify(req.files);
    //console.log(typeof data);
    //给浏览器返回一个成功提示。
    res.send('<script>window.parent.uploadSuccess('+data+')</script>');
});

app.post('/upload1',mutipartMiddeware,function (req,res) {
    var data = JSON.stringify(req.files);
    res.send('<script>window.parent.uploadtraindata('+data+')</script>');
});

app.post('/upload2',mutipartMiddeware,function (req,res) {
    var data = JSON.stringify(req.files);
    res.send('<script>window.parent.uploadtrainlabel('+data+')</script>');
});

app.post('/upload3',mutipartMiddeware,function (req,res) {
    var data = JSON.stringify(req.files);
    res.send('<script>window.parent.uploadtestdata('+data+')</script>');
});

app.post('/upload4',mutipartMiddeware,function (req,res) {
    var data = JSON.stringify(req.files);
    res.send('<script>window.parent.uploadtestlabel('+data+')</script>');
});
