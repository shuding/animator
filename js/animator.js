/*
* Animator.js Library v0.3
* https://github.com/quietshu/Animator.js
*
* Copyright 2014 Shu Ding.
* Email: quietshu@gmail.com
* Under the MIT license
*
* Date: 2014-05-22T02:03+0800
**/

var canvas,
    context,
    canvasBackgroundColor = "#FFF";

var mouseDeltaX, mouseDeltaY,
    mousePressed = false;

var slider,
    timelineCanvas,
    timelineContext;

var fastSin = function(inValue) {
    // See for graph and equations
    // https://www.desmos.com/calculator/8nkxlrmp7a
    // logic explained here : http://devmaster.net/posts/9648/fast-and-accurate-sine-cosine
    var B = 1.2732395; // 4/pi
    var C = -0.40528473; // -4 / (pi²)

    if (inValue > 0) {
        return B * inValue + C * inValue * inValue;
    }
    return B * inValue - C * inValue * inValue;
}

var transition = {
    createNew: function() {
        var t = {};
        t.startFrame = 0;
        t.endFrame = 0;
        t.startValue = 0;
        t.endValue = 0;
        t.transitionFunction = "linear";
        t.transitionProperty = "";
        t.normalize = function() {
            t.startValue = +t.startValue;
            t.endValue = +t.endValue;
        };
        t.inTransition = function(n){
            if(n < t.startFrame || n >= t.endFrame)
                return false;
            return true;
        };
        t.inTransitionTotally = function(n) {
            if(n <= t.startFrame || n >= t.endFrame - 1)
                return false;
            return true;
        };
        t.getValueWithNumber = function(n){
            t.normalize();
            if(n < t.startFrame)
                n = t.startFrame;
            else if(n >= t.endFrame)
                n = t.endFrame;
            var v;
            switch (t.transitionFunction) {
                case "linear":
                    v = (n - t.startFrame) * 1. / (t.endFrame - t.startFrame - 1)
                        * (t.endValue - t.startValue)
                        + t.startValue;
                    break;
                case "ease-in-sin":
                    v = (fastSin(1.570796327 * (n - t.startFrame) / (t.endFrame - t.startFrame - 1) - 1.570796327) + 1)
                        * (t.endValue - t.startValue)
                        + t.startValue;
                    break;
                case "ease-out-sin":
                    v = fastSin(1.570796327 * (n - t.startFrame) / (t.endFrame - t.startFrame - 1))
                        * (t.endValue - t.startValue)
                        + t.startValue;
                    break;
                case "ease-in-out-sin":
                    v = (fastSin(3.141592654 * (n - t.startFrame) / (t.endFrame - t.startFrame - 1) - 1.570796327) * .5 + .5)
                        * (t.endValue - t.startValue)
                        + t.startValue;
                    break;
                default:
                    v = 1. * (n - t.startFrame) / (t.endFrame - t.startFrame - 1)
                        * (t.endValue - t.startValue)
                        + t.startValue;
            };
            return v;
        };
        t.set = function(key, value) {
            if(Object.prototype.toString.call(key) === '[object Object]') {
                for(var k in key)
                    if(key.hasOwnProperty(k))
                        t[k] = key[k];
                return t;
            }
            t[key] = value;
            return t;
        };
        return t;
    }
}

var unit = {
    createNew: function(){
        var u = {};
        u.startFrame = 0;
        u.endFrame = 100;   // TODO: add frame range to units
        u.transitionCnt = 0;
        u.transition = [];
        u.propertys = [];
        u.propertyKeypoints = [];
        u.watchFunction = undefined;

        u.initTransition = function() {
            for(var prop in u.propertys) {
                var t = transition.createNew().set({
                    "startFrame": u.startFrame,
                    "endFrame": u.endFrame,
                    "startValue": u[u.propertys[prop]],
                    "endValue": u[u.propertys[prop]],
                    "transitionProperty": u.propertys[prop]
                });
                u.addTransition(t);
            }

            return u;
        };
        u.watchChange = function(callback) {
            u.watchFunction = callback;

            return u;
        };
        u.unwatchChange = function() {
            if(u.watchFunction)
                u.watchFunction = undefined;

            return u;
        };
        u.addTransition = function(t) {
            u.transition[u.transitionCnt++] = t;
            var arr = u.propertyKeypoints[t.transitionProperty] || [];
            u.propertyKeypoints[t.transitionProperty] = arr.concat([t.startFrame, t.endFrame]);

            return u;
        };
        u.removeTransition = function(t) {
            var index = u.transition.indexOf(t);
            if(index > -1) {
                u.transition.splice(index, 1);
                index = u.propertyKeypoints[t.transitionProperty].indexOf(t.startFrame);
                u.propertyKeypoints[t.transitionProperty].splice(index, 1);
                index = u.propertyKeypoints[t.transitionProperty].indexOf(t.endFrame);
                u.propertyKeypoints[t.transitionProperty].splice(index, 1);
                u.transitionCnt--;
                delete t;
            }

            return u;
        };
        u.transitionFrame = function(n) {
            for(var i = 0; i < u.transitionCnt; ++i){
                if(u.transition[i].inTransition(n))
                    u[u.transition[i].transitionProperty] = u.transition[i].getValueWithNumber(n);
            }
            if(u.watchFunction)
                u.watchFunction();

            return u;
        };
        u.hasFrame = function(f) {
            for(var prop in u.propertys) {
                if(u.propertyKeypoints[u.propertys[prop]].indexOf(f) <= -1)
                    return false;
            }
            return true;
        };
        u.addKeyFrame = function(f) {
            for(var i = 0; i < u.transitionCnt; ++i) {
                if(u.transition[i].inTransitionTotally(n)) {
                    //u.transition
                }
                    u[u.transition[i].transitionProperty] = u.transition[i].getValueWithNumber(n);
            }
        };
        u.removeFrame = function(f) {

        };
        u.toggleKeyFrame = function(f) {
            return u;
        };
        return u;
    }
};

var geometric = {
    createNew: function () {
        var g = unit.createNew();
        g.type = "geometric";

        g.opacity = 1;
        g.fillColor = "#FFF";
        g.strokeColor = "#FFF";
        g.lineWidth = 0;
        g.rotate = 0;
        g.selected = false;

        g.saveGeometric = function(){
            g.opacity_ = g.opacity;
            g.fillColor_ = g.fillColor;
            g.strokeColor_ = g.strokeColor;
            g.lineWidth_ = g.lineWidth;
        };
        g.restoreGeometric = function(){
            g.opacity = g.opacity_;
            g.fillColor = g.fillColor_;
            g.strokeColor = g.strokeColor_;
            g.lineWidth = g.lineWidth_;
        };
        g.drawSelectedBox = function(x, y, w, h){
            context.save();
            context.translate(x + w * .5, y + h * .5);
            if(g.rotate)
                context.rotate(g.rotate * .017453293);
            context.strokeStyle = "blue";
            context.lineWidth = 1;
            context.strokeRect(-w * .5, -h * .5, w, h);
            context.fillStyle = "rgba(0, 0, 255, 0.5)";
            context.beginPath();
            context.arc(-w * .5, -h * .5, 3, 0, 6.283185307, false);
            context.fill();
            context.closePath();
            context.beginPath();
            context.arc(w * .5, -h * .5, 3, 0, 6.283185307, false);
            context.fill();
            context.closePath();
            context.beginPath();
            context.arc(w * .5, h * .5, 3, 0, 6.283185307, false);
            context.fill();
            context.closePath();
            context.beginPath();
            context.arc(-w * .5, h * .5, 3, 0, 6.283185307, false);
            context.fill();
            context.closePath();
            context.restore();
        };
        g.getObjectAt = function(x, y){
            var o = undefined;
            switch (g.type){
                case "rectangle":
                    context.save();
                    context.translate(g.x + g.width * .5, g.y + g.height * .5);
                    if(g.rotate)
                        context.rotate(g.rotate * .017453293);
                    context.beginPath();
                    context.rect(-g.width * .5, -g.height * .5, g.width, g.height);
                    if(g.rotate)
                        context.rotate(-g.rotate * .017453293);
                    context.translate(-g.x - g.width * .5, -g.y - g.height * .5);
                    if(context.isPointInPath(x, y))
                        o = g;
                    context.closePath();
                    context.restore();
                    break;
                case "circle":
                    context.beginPath();
                    context.arc(g.x, g.y, g.r, 0, 6.283185307, false);
                    if(context.isPointInPath(x, y))
                        o = g;
                    context.closePath();
                    break;
                default :
            }
            return o;
        };
        g.drawGeometric = function(){
            context.save();
            if(g.selected){
                switch (g.type){
                    case "rectangle":
                        g.drawSelectedBox(g.x, g.y, g.width, g.height);
                        break;
                    case "circle":
                        g.drawSelectedBox(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
                        break;
                    default :
                }
            }
            context.restore();
        };

        g.set = function(key, value){
            if(Object.prototype.toString.call(key) === '[object Object]') {
                for(var k in key){
                    if(key.hasOwnProperty(k))
                        g[k] = key[k];
                }
                return g;
            }
            g[key] = value;
            return g;
        };

        g.drawTransitionTimeline = function() {
            for(var n = 0; n < g.transitionCnt; ++n) {
                drawTimeline(g.transition[n].startFrame, g.transition[n].endFrame, n, g.transition[n].transitionFunction);
            }
        }
        return g;
    }
};

var rectangle = {
    createNew: function(){
        var r = geometric.createNew();
        r.type = "rectangle";
        r.x = 50;
        r.y = 50;
        r.width = 50;
        r.height = 50;
        r.stroke = false;
        r.propertys = [
            "fillColor",
            "opacity",
            "x",
            "y",
            "width",
            "height",
            "rotate"
        ];
        r.initTransition();

        r.save = function(){
            r.saveGeometric();
            r.x_ = r.x;
            r.y_ = r.y;
            r.width_ = r.width;
            r.height_ = r.height;
        };
        r.restore = function(){
            r.restoreGeometric();
            r.x = r.x_;
            r.y = r.y_;
            r.width = r.width_;
            r.height = r.height_;
        };
        r.draw = function(){
            context.save();
            context.translate(r.x + r.width * .5, r.y + r.height * .5);
            if(r.rotate)
                context.rotate(r.rotate * .017453293);
            //context.translate(r.x + r.width *.5, r.y + r.height *.5);
            context.globalAlpha = r.opacity;
            context.fillStyle = r.fillColor;
            //context.fillRect(r.x, r.y, r.width, r.height);
            context.fillRect(-r.width *.5, -r.height *.5, r.width, r.height);
            if(r.stroke) {
                context.strokeStyle = r.strokeColor;
                context.lineWidth = r.lineWidth;
                context.stroke();
            }
            context.restore();
            r.drawGeometric();
        };
        r.drawFunction = function(n){
            //r.save();
            r.transitionFrame(n);
            r.draw();
            //r.restore();
        };
        return r;
    }
};

var circle = {
    createNew: function(){
        var c = geometric.createNew();
        c.type = "circle";
        c.x = 50;
        c.y = 50;
        c.r = 50;
        c.propertys = [
            "fillColor",
            "opacity",
            "x",
            "y",
            "r",
            "rotate"
        ];
        c.initTransition();

        c.save = function(){
            c.saveGeometric();
            c.x_ = c.x;
            c.y_ = c.y;
        };
        c.restore = function(){
            c.restoreGeometric();
            c.x = c.x_;
            c.y = c.y_;
        };
        c.draw = function(){
            context.save();
            context.beginPath();
            context.globalAlpha = c.opacity;
            context.arc(c.x, c.y, c.r, 0, 6.283185307, false);
            context.fillStyle = c.fillColor;
            context.fill();
//            context.lineWidth = 5;
//            context.strokeStyle = '#003300';
//            context.stroke();
            context.closePath();
            context.restore();
            c.drawGeometric();
        };
        c.drawFunction = function(n){
            //r.save();
            c.transitionFrame(n);
            c.draw();
            //r.restore();
        };
        return c;
    }
}

var layer = {
    createNew: function(){
        var l = {};
        l.startFrame = 0;
        l.endFrame = 0;
        l.cntFrame = 0;
        l.nowFrame = 0;
        l.idle = 0;
        l.objectCnt = 0;
        l.objects = [];
        l.timeInterval = undefined;
        l.addObject = function(o){
            l.objects[l.objectCnt++] = o;
        };
        l.drawFunction = function(n){
            for(var i = 0; i < l.objectCnt; ++i)
                l.objects[i].drawFunction(n);
        };
        l.drawFrame = function(){
            var n = l.nowFrame;
            if(0 <= n && n < l.cntFrame)
                l.drawFunction(n);
            else
                clearInterval(l.timeInterval);
            ++l.nowFrame;
        };
        l.drawFrameWithNumber = function(n){
            l.nowFrame = n;
            if(n < 0 || n >= l.cntFrame)
                return;
            l.drawFunction(n);
            l.nowFrame = 0;
        };
        l.startAnimation = function(){
            l.nowFrame = 0;
            l.timeInterval = setInterval(l.drawFrame, l.idle);
        };
        l.getObjectAt = function(x, y){
            var o = undefined;
            for(var i = l.objectCnt - 1; i >= 0; --i){
                o = l.objects[i].getObjectAt(x, y);
                if(o)
                    break;
            }
            return o;
        }
        return l;
    }
};

var controller = {
    layerCnt: 0,
    frameCnt: 0,
    nowFrame: 0,
    idle: 0,
    timeInterval: undefined,
    layer: [],
    playing: false,
    addLayer: function(l){
        controller.layer[controller.layerCnt++] = l;
    },
    drawFrame: function(){
        var n = controller.nowFrame;
        if(n < controller.frameCnt){
            clearCanvas();
            for(var i = 0; i < controller.layerCnt; ++i)
                controller.layer[i].drawFrameWithNumber(
                    (n - controller.layer[i].startFrame) * controller.idle / controller.layer[i].idle
                );
            slider.value = Math.floor(1000. * n / controller.frameCnt);
        }
        else {
            clearInterval(controller.timeInterval);
            controller.playing = false;
            return;
        }
        ++controller.nowFrame;
    },
    drawFrameWithNumber: function(n){
        if(n < controller.frameCnt){
            clearCanvas();
            for(var i = 0; i < controller.layerCnt; ++i)
                controller.layer[i].drawFrameWithNumber(
                    (n - controller.layer[i].startFrame) * controller.idle / controller.layer[i].idle
                );
        }
        controller.nowFrame = (+n) + 1;
    },
    restart: function(){
        controller.nowFrame = 0;
        controller.playing = false;
        clearInterval(controller.timeInterval);
        controller.play();
    },
    play: function(){
        if(controller.playing) {
            clearInterval(controller.timeInterval);
            controller.playing = false;
            return;
        }
        if(controller.nowFrame >= controller.frameCnt)
            controller.nowFrame = 0;
        controller.playing = true;
        controller.timeInterval = setInterval(controller.drawFrame, controller.idle);
    },
    redraw: function(){
        controller.drawFrameWithNumber(controller.nowFrame - 1);
    },
    getObjectAt: function(x, y) {
        var o = undefined;
        for(var i = controller.layerCnt - 1; i >= 0; --i){
            o = controller.layer[i].getObjectAt(x, y);
            if(o)
                break;
        }
        return o;
    }
};

var clearCanvas = function () {
    context.save();
    context.fillStyle = canvasBackgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
};

var setMainCanvasSize = function(width, height) {
    if(!canvas) {
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
    }
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d");
}

var clearTimeline = function(){
    timelineContext.fillStyle = "#EEE";
    timelineContext.fillRect(0, 0, timelineCanvas.width, timelineCanvas.height);
}

var drawTimeline = function(l, r, y, f){
    timelineContext.fillStyle = "red";
    timelineContext.strokeStyle = "red";
    timelineContext.lineWidth = 0.2;
    l = l * 1. / controller.frameCnt * timelineCanvas.width;
    r = r * 1. / controller.frameCnt * timelineCanvas.width;

    switch (f) {
        case "ease-in-out-sin":
            timelineContext.beginPath();
            var p = y * 20 + 20;
            for(var i = l; i < r; i += 2){
                timelineContext.moveTo(i, p);
                p = -fastSin((Math.min(i + 2, r) - l) * 3.141592654 / (r - l) - 1.570796327) * 10. + y * 20. + 10.;
                timelineContext.lineTo(Math.min(i + 2, r), p);
                timelineContext.stroke();
            }
            timelineContext.closePath();
            break;
    }

    //timelineContent.fillRect(lPos, y * 20. + 20., rPos - lPos, 2);
}

window.onload = function(){
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    setMainCanvasSize(250, 250);

    controller.frameCnt = 100;
    controller.idle = 16;
    controller.drawFrameWithNumber(0);

    var lastValue = 0;
    slider = document.getElementsByName("frame")[0];

    timelineCanvas = document.getElementById("timeline_canvas");
    timelineCanvas.width = window.innerWidth - 263;
    timelineCanvas.height = 200;
    timelineContext = timelineCanvas.getContext("2d");
    clearTimeline();

    slider.onmousemove = function(){
        if(this.value != lastValue){
            var frameNow = this.value / 1000. * controller.frameCnt;
            controller.drawFrameWithNumber(Math.floor(frameNow));
            lastValue = this.value;
        }
    }
    document.getElementsByName("play")[0].onclick = function(){
        controller.play();
    }

    document.onmouseup = function() {
        mousePressed = false;
        canvas.style.cursor = "default";
    }
}

var load = function(){
    resize();
}

var resize = function(){
    var scrHeight = window.innerHeight,
        scrWidth  = window.innerWidth;
    var settingInputs = document.getElementsByClassName("setting_input");
    for(var i = 0; i < settingInputs.length; ++i){
        var leftPos = settingInputs[i].offsetLeft;
        settingInputs[i].style.marginLeft = (80 - leftPos) + "px";
    }

    var right_panel = document.getElementById("right_panel");
    right_panel.style.width = scrWidth - 242 + "px";

    var storyboard = document.getElementById("storyboard");
    storyboard.style.height = scrHeight - 252 + "px";

    var contents = document.getElementsByClassName("content");
    for(var i = 0; i < contents.length; ++i){
        var height = contents[i].parentNode.style.height ?
            parseInt(contents[i].parentNode.style.height) : contents[i].parentNode.clientHeight;
        contents[i].style.height = height - 47 + "px"
    }
}

var main = function($scope) {
    $scope.width = 250;
    $scope.height = 250;
    $scope.color = "white";
    $scope.frames = 100;
    $scope.idle = 16;
    $scope.defaultWidth = 250;
    $scope.defaultHeight = 250;
    $scope.defaultFrames = 100;
    $scope.defaultIdle = 16;
    $scope.defaultColor = "white";

    $scope.timer = false;
    $scope.selectedObject = undefined;
    $scope.transitions = [];

    $scope.folded = false;
    $scope.window_btn = "×";
    $scope.btn_click = settings_fold;

    $scope.newObjectName = "circle";

    $scope.addObject = function(){
        var o;
        switch ($scope.newObjectName) {
            case "circle":
                o = circle.createNew()
                    .set({
                        "x": 50,
                        "y": 50,
                        "r": 50,
                        "fillColor": "#000",
                        "opacity": 1,
                        "rotate": 0
                    });
                break;
            case "rectangle":
                o = rectangle.createNew()
                    .set({
                        "x": 0,
                        "y": 0,
                        "width": 100,
                        "height": 100,
                        "fillColor": "#000",
                        "opacity": 1,
                        "rotate": 0
                    });
                break;
            default :
        }
        if($scope.selectedObject)
            $scope.selectedObject.selected = false;
        o.selected = true;
        o.watchChange(function() {      // use closure
            if($scope.selectedObject) {
                for(var prop in $scope.selectedObject.propertys) {
                    var propName = $scope.selectedObject.propertys[prop];
                    $scope["nowObject_" + propName] = $scope.selectedObject[propName];
                }
                $scope.$apply();
            }
        });
        $scope.selectedObject = o;
        $scope.transitions = $scope.selectedObject.transition;

        for(var prop in $scope.selectedObject.propertys) {
            var propName = $scope.selectedObject.propertys[prop];
            $scope["nowObject_" + propName] = $scope.selectedObject[propName];
        }

        var l = layer.createNew();
        l.startFrame = 0;
        l.endFrame = $scope.frames;
        l.cntFrame = $scope.frames;
        l.idle = $scope.idle;
        l.addObject(o);
        controller.addLayer(l);
        controller.redraw();
    };

    $scope.addTransition = function(){
        if(!$scope.selectedObject)
            return;

        var t = transition.createNew();
        t.startFrame = 0;
        t.endFrame = $scope.frames;
        t.startValue = 0;
        t.endValue = 0;
        t.transitionFunction = "ease-in-out-sin";
        t.transitionProperty = "x";

        $scope.selectedObject.addTransition(t);
    }

    $scope.redraw = function(){
        if($scope.timer)
            clearTimeout($scope.timer);
        $scope.timer = setTimeout(function(){
            canvasBackgroundColor = $scope.color;
            controller.frameCnt = $scope.frames;
            controller.idle = $scope.idle;
            setMainCanvasSize($scope.width, $scope.height);
            controller.redraw();
            $scope.timer = false;
        }, 300);
    }

    $scope.canvasMouseDown = function($event){
        var x = $event.offsetX,
            y = $event.offsetY;
        if($scope.selectedObject) {
            $scope.selectedObject.selected = false;
            $scope.selectedObject.unwatchChange();
        }
        $scope.selectedObject = controller.getObjectAt(x, y);
        clearTimeline();
        if($scope.selectedObject){
            mousePressed = true;
            mouseDeltaX = $event.offsetX - $scope.selectedObject.x;
            mouseDeltaY = $event.offsetY - $scope.selectedObject.y;
            $scope.selectedObject.selected = true;
            $scope.selectedObject.drawTransitionTimeline();
            $scope.transitions = $scope.selectedObject.transition;

            for(var prop in $scope.selectedObject.propertys) {
                var propName = $scope.selectedObject.propertys[prop];
                $scope["nowObject_" + propName] = $scope.selectedObject[propName];
            }

            $scope.selectedObject.watchChange(function() {
                if($scope.selectedObject) {
                    for(var prop in $scope.selectedObject.propertys) {
                        var propName = $scope.selectedObject.propertys[prop];
                        $scope["nowObject_" + propName] = $scope.selectedObject[propName];
                    }
                    $scope.$apply();
                }
            });
        }
        else{
            $scope.transitions = [];
            $scope.nowObject_fillColor = "";
            $scope.nowObject_x = "";
            $scope.nowObject_y = "";
            $scope.nowObject_r = "";
            $scope.nowObject_width = "";
            $scope.nowObject_height = "";
            $scope.nowObject_rotate = "";
        }
        controller.redraw();
    }

    $scope.canvasDrag = function($event) {
        if(mousePressed){
            canvas.style.cursor = "all-scroll";
            $scope.nowObject_x = $scope.selectedObject.x = $event.offsetX - mouseDeltaX;
            $scope.nowObject_y = $scope.selectedObject.y = $event.offsetY - mouseDeltaY;
            controller.redraw();
        }
    }

    $scope.setObject = function(){
        if($scope.timer)
            clearTimeout($scope.timer);
        $scope.timer = setTimeout(function(){
            if($scope.selectedObject){
                for(var prop in $scope.selectedObject.propertys) {
                    var propName = $scope.selectedObject.propertys[prop];
                    $scope.selectedObject[propName] = $scope["nowObject_" + propName];
                }
            }
            controller.redraw();
            $scope.timer = false;
        }, 300);
    }

    $scope.setTransition = function(){
        if($scope.timer)
            clearTimeout($scope.timer);
        $scope.timer = setTimeout(function(){
            if($scope.selectedObject){
                $scope.selectedObject.transition = $scope.transitions;
            }
            controller.redraw();
            $scope.timer = false;
        }, 300);
    }

    $scope.toggleKeyFrame = function() {
        $scope.selectedObject.toggleKeyFrame($scope.nowFrame);
    }
}

var settings_fold = function(){
    this.folded = !this.folded;
    this.window_btn = ["×", "≡"][+this.folded];

    var scrWidth  = window.innerWidth;
    var right_panel = document.getElementById("right_panel");
    right_panel.style.width = scrWidth - [242, 22][+this.folded] + "px";
}

var timeline_fold = function(){
    this.folded = !this.folded;
    this.window_btn = ["×", "≡"][+this.folded];

    var scrHeight = window.innerHeight;
    var storyboard = document.getElementById("storyboard");
    storyboard.style.height = scrHeight - [252, 26][+this.folded] + "px";

    var contents = document.getElementsByClassName("content");
    for(var i = 0; i < contents.length; ++i){
        var height = contents[i].parentNode.style.height ?
            parseInt(contents[i].parentNode.style.height) : contents[i].parentNode.clientHeight;
        contents[i].style.height = height - 47 + "px"
    }
}

var timeline = function($scope) {
    $scope.folded = false;
    $scope.window_btn = "×";
    $scope.btn_click = timeline_fold;
}

var app = angular.module("animator", []);
app.run(load)
    .controller("timeline", timeline)
    .controller("main", main);