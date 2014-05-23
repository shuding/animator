var canvas;
var context;
var animationInterval;
var image;
var width = 150;
var height = 150;
var frameNumber = 10;
var idle = 500;
var varCode = "var x = 0";
var initCode = "context.fillStyle = '#CCC';\
context.fillRect(0, 0, 150, 150);";
var drawCode = "context.fillStyle = '#000';\
context.fillRect(x, 0, 10, 10);\
x += 10;";
var encoder = new GIFEncoder();

window.onload = function(){

    var viewBtn = document.getElementById("view_btn");
    var saveBtn = document.getElementById("save_btn");
    var widthInput = document.getElementById("width_input");
    var heightInput = document.getElementById("height_input");
    var frameNumberInput = document.getElementById("frame_number_input");
    var frameIdle = document.getElementById("frame_idle_input");
    var initInput = document.getElementById("init_frame");
    var drawInput = document.getElementById("draw_frame");
    var varInput = document.getElementById("var");
    viewBtn.onclick = function(){
        canvas = document.getElementById("canvas");
        image  = document.getElementById("image");
        context = canvas.getContext("2d");

        width = 150;
        height = 150;
        frameNumber = 10;
        idle = 500;
        varCode = "var x = 0";
        initCode = "context.fillStyle = '#CCC';\
context.fillRect(0, 0, 150, 150);";
        drawCode = "context.fillStyle = '#000';\
context.fillRect(x, 0, 10, 10);\
x += 10;";

        width = new Number(widthInput.value || width);
        height = new Number(heightInput.value || height);
        frameNumber = new Number(frameNumberInput.value || frameNumber);
        idle = new Number(frameIdle.value || idle);
        varCode = varInput.value;
        initCode = initInput.value;
        drawCode = drawInput.value;

        canvas.width = width;
        canvas.height = height;
        encoder.setRepeat(0);
        encoder.setDelay(idle);
        encoder.setSize(width,height);
        encoder.start();

        eval(varCode);

        var animation = function(){
            if(frameNumber <= 0){
                clearInterval(animationInterval);
                encoder.finish();
                var binary_gif = encoder.stream().getData();
                var data_url = 'data:image/gif;base64,' + encode64(binary_gif);
                image.setAttribute("href", data_url);
            }
            --frameNumber;
            eval(drawCode);
            encoder.addFrame(context);
        }

        eval(initCode);
        animationInterval = setInterval(animation, idle);
    }
    saveBtn.onclick = function(){
        canvas = document.getElementById("save_canvas");
        image  = document.getElementById("image");
        context = canvas.getContext("2d");

        width = 150;
        height = 150;
        frameNumber = 10;
        idle = 500;
        varCode = "var x = 0";
        initCode = "context.fillStyle = '#CCC';\
context.fillRect(0, 0, 150, 150);";
        drawCode = "context.fillStyle = '#000';\
context.fillRect(x, 0, 10, 10);\
x += 10;";

        width = new Number(widthInput.value || width);
        height = new Number(heightInput.value || height);
        frameNumber = new Number(frameNumberInput.value || frameNumber);
        idle = new Number(frameIdle.value || idle);
        varCode = varInput.value;
        initCode = initInput.value;
        drawCode = drawInput.value;

        canvas.width = width;
        canvas.height = height;
        encoder.setRepeat(0);
        encoder.setDelay(idle);
        encoder.setSize(width,height);
        encoder.start();

        eval(varCode);

        var animation = function(){
            if(frameNumber <= 0){
                clearInterval(animationInterval);
                encoder.finish();
                var binary_gif = encoder.stream().getData();
                var data_url = 'data:image/gif;base64,' + encode64(binary_gif);
                console.log(data_url);
                image.setAttribute("href", data_url);
                image.setAttribute("download", "data.gif");
                image.click();
            }
            --frameNumber;
            eval(drawCode);
            encoder.addFrame(context);
        }

        eval(initCode);
        animationInterval = setInterval(animation, 10);
    }
}