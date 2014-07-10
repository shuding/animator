/*
* Animator.js Library v0.7
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
    frameInfo,
    timelineCanvas,
    timelineContext;

var timelineNowObject = undefined,
    unitCnt = 0,
    unitListPosition = 0,
    unitDragNo = 0;

var GIFEncoderLoaded = false,
    encoder,
    encodeCanvas,
    encodeContext;

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

var loadJS = function(path, callback) {
    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = "js/" + path;
    js.onreadystatechange = callback;
    js.onload = callback;
    document.getElementsByTagName("head")[0].appendChild(js);
    console.log(path + ' loaded.');
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

var color = {
    // via http://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
    colors : {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
        "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
        "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
        "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
        "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
        "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
        "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
        "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
        "honeydew":"#f0fff0","hotpink":"#ff69b4",
        "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
        "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
        "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
        "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
        "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
        "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
        "navajowhite":"#ffdead","navy":"#000080",
        "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
        "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
        "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
        "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
        "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
        "violet":"#ee82ee",
        "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
        "yellow":"#ffff00","yellowgreen":"#9acd32"
    },
    colorToHex: function(c) {
        var co = c.toString().toLowerCase();
        if (typeof color.colors[co.toLowerCase()] != 'undefined')
            return color.colors[co.toLowerCase()];
        else if(co[0] == 'r') {
            co = co.replace(/\s+/g, '');
            // via http://haacked.com/archive/2009/12/29/convert-rgb-to-hex.aspx/
            var digits = /(.*?)rgb\((\d+),(\d+),(\d+)\)/.exec(co);
            var red = parseInt(digits[2]);
            var green = parseInt(digits[3]);
            var blue = parseInt(digits[4]);

            // bug fixed by Shu Ding
            red = (red >=16 ? '' : '0') + red.toString(16);
            green = (green >=16 ? '' : '0') + green.toString(16);
            blue = (blue >=16 ? '' : '0') + blue.toString(16);
            return digits[1] + '#' + red + green + blue;
        }
        else if(co[0] == '#' && co.length == 4) {
            return '#' + co[1] + co[1] + co[2] + co[2] + co[3] + co[3];
        }
        else if(co[0] == '#' && co.length == 7)
            return co;

        return "#000000";
    },
    colorToRGB: function(c) {
        var hex = color.colorToHex(c).slice(1);
        return [parseInt(hex.slice(0,2), 16), parseInt(hex.slice(2,4), 16), parseInt(hex.slice(4,6), 16)];
    },
    isColorVarible: function(v) {
        return  typeof v === "string" && (v[0] == '#' || v.toLowerCase()[0] == 'r' || color.colors[v.toLowerCase()]);
    }
};

var easing = {
    functions: [
        "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad",
        "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart",
        "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint"
    ],
    // private functions
    // easing functions refer to https://gist.github.com/gre/1650294
    easingFunctions: {
        // no easing, no acceleration
        linear: function (t) { return t },
        // accelerating from zero velocity
        easeInQuad: function (t) { return t*t },
        // decelerating to zero velocity
        easeOutQuad: function (t) { return t*(2-t) },
        // acceleration until halfway, then deceleration
        easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
        // accelerating from zero velocity
        easeInCubic: function (t) { return t*t*t },
        // decelerating to zero velocity
        easeOutCubic: function (t) { return (--t)*t*t+1 },
        // acceleration until halfway, then deceleration
        easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
        // accelerating from zero velocity
        easeInQuart: function (t) { return t*t*t*t },
        // decelerating to zero velocity
        easeOutQuart: function (t) { return 1-(--t)*t*t*t },
        // acceleration until halfway, then deceleration
        easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
        // accelerating from zero velocity
        easeInQuint: function (t) { return t*t*t*t*t },
        // decelerating to zero velocity
        easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
        // acceleration until halfway, then deceleration
        easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
    },
    calc: function(func, n, startFrame, endFrame, startValue, endValue) {
        var t = (n - startFrame) * 1. / (endFrame - startFrame - 1);
        if(!easing.easingFunctions[func])
            func = "linear";
        var v = easing.easingFunctions[func](t);
        v = v * (endValue - startValue) + startValue;
        return v;
    }
};

var transition = {
    createNew: function() {
        var t = {};
        t.startFrame = 0;
        t.endFrame = 0;
        t.startValue = 0;
        t.endValue = 0;
        t.transitionFunction = "linear";
        t.transitionProperty = "";
        t.isColor = false;
        t.isInitTransition = false;
        t.normalize = function(v) {
            var ret;
            if(color.isColorVarible(v)) {
                ret = color.colorToRGB(v);
                t.isColor = true;
            }
            else {
                ret = +v;
                t.isColor = false;
            }

            return ret;
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
            var startValue = t.normalize(t.startValue),
                endValue = t.normalize(t.endValue);
            if(n < t.startFrame)
                n = t.startFrame;
            else if(n >= t.endFrame)
                n = t.endFrame;
            var v;
            if(t.isColor) {
                v = [];
                for(var i = 0; i < 3; ++i)
                    v[i] = Math.floor(easing.calc(t.transitionFunction, n, t.startFrame, t.endFrame, startValue[i], endValue[i]));
                v = color.colorToHex("rgb(" + v[0] + ',' + v[1] + ',' + v[2] + ')');
            }
            else v = easing.calc(t.transitionFunction, n, t.startFrame, t.endFrame, startValue, endValue);

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
        u.propertyKeyFrames = [];
        u.unitName = "noname";
        u.watchFunction = undefined;

        u.initTransition = function() {
            for(var prop in u.propertys) {
                var t = transition.createNew().set({
                    "startFrame": u.startFrame,
                    "endFrame": u.endFrame,
                    "startValue": u[u.propertys[prop]],
                    "endValue": u[u.propertys[prop]],
                    "transitionProperty": u.propertys[prop],
                    "isInitTransition": true
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

            return u;
        };
        u.removeTransition = function(i) {
            u.transition.splice(i, 1);
            u.transitionCnt--;

            return u;
        };
        u.transitionFrame = function(n) {
            for(var i = 0; i < u.transitionCnt; ++i){
                if(u.transition[i].inTransition(n)) {
                    if(!u.transition[i].isInitTransition)
                        u[u.transition[i].transitionProperty] = u.transition[i].getValueWithNumber(n);
                    else
                        u.transition[i].startValue = u.transition[i].endValue = u[u.transition[i].transitionProperty];
                }
            }
            if(u.watchFunction)
                u.watchFunction();

            return u;
        };
        u.findTransitionStartWith = function(s, prop) {
            for(var i = 0; i < u.transitionCnt; ++i){
                if(u.transition[i].startFrame == s && u.transition[i].transitionProperty == prop) {
                    return u.transition[i];
                }
            }
            return undefined;
        };
        u.changeTransitionFunction = function(tr, tf) {
            for(var i = 0; i < u.transitionCnt; ++i){
                if(u.transition[i] == tr) {
                    u.transition[i].transitionFunction = tf;
                    return u;
                }
            }
            return undefined;
        };
        u.hasKeyFrame = function(prop, f) {
            if(u.propertyKeyFrames[prop] == undefined || u.propertyKeyFrames[prop].indexOf(f) <= -1) {
                return false;
            }
            return true;
        };
        u.addKeyFrame = function(prop, f) {
            for(var i = 0; i < u.transitionCnt; ++i)
                if(u.transition[i].transitionProperty == prop && u.transition[i].inTransition(f)) {
                    if(u.transition[i].isInitTransition)
                        u.transition[i].isInitTransition = false;
                    if(!u.propertyKeyFrames[prop])
                        u.propertyKeyFrames[prop] = [];
                    if(u.propertyKeyFrames[prop].indexOf(u.transition[i].startFrame) <= -1)
                        u.propertyKeyFrames[prop] = u.propertyKeyFrames[prop].concat(u.transition[i].startFrame);
                    if(u.propertyKeyFrames[prop].indexOf(u.transition[i].endFrame - 1) <= -1)
                        u.propertyKeyFrames[prop] = u.propertyKeyFrames[prop].concat(u.transition[i].endFrame - 1);
                    if(u.propertyKeyFrames[prop].indexOf(f) <= -1) {
                        u.propertyKeyFrames[prop].push(f);
                        var vf = u.transition[i].getValueWithNumber(f);
                        var t = transition.createNew().set({
                            "startFrame": f,
                            "endFrame": u.transition[i].endFrame,
                            "startValue": vf,
                            "endValue":u.transition[i].endValue,
                            "transitionProperty": u.transition[i].transitionProperty
                        });
                        u.transition[i].set({
                            "endFrame": f,
                            "endValue": vf
                        });
                        u.addTransition(t);
                    }
                    u.propertyKeyFrames[prop].sort();
                    return u;
                }
            return u;
        };
        u.removeKeyFrame = function(prop, f) {
            var t = transition.createNew().set("transitionProperty", prop);
            var r1 = -1, r2 = -1;
            for(var i = 0; i < u.transitionCnt; ++i)
                if(u.transition[i].transitionProperty == prop) {
                    if(u.transition[i].startFrame == f) {
                        t.set({
                            "endFrame": u.transition[i].endFrame,
                            "endValue": u.transition[i].endValue
                        });
                        r1 = i;
                    }
                    if(u.transition[i].endFrame == f) {
                        t.set({
                            "startFrame": u.transition[i].startFrame,
                            "startValue": u.transition[i].startValue
                        });
                        r2 = i;
                    }
                }
            u.propertyKeyFrames[prop].splice(u.propertyKeyFrames[prop].indexOf(f), 1);
            u.removeTransition(r1).removeTransition(r2).addTransition(t);
            return u;
        };
        u.setKeyFrame = function(prop, f, v) {
            for(var i = 0; i < u.transitionCnt; ++i)
                if(u.transition[i].transitionProperty == prop) {
                    if(u.transition[i].startFrame == f)
                        u.transition[i].startValue = v;
                    if(u.transition[i].endFrame == f || u.transition[i].endFrame == f + 1)
                        u.transition[i].endValue = v;
                }
            return u;
        };
        u.toggleKeyFrame = function(prop, f) {
            if(u.hasKeyFrame(prop, f)) {
                u.removeKeyFrame(prop, f);
            }
            else
                u.addKeyFrame(prop, f);

            return u;
        };
        u.move = function(f) {
            if(u.hasKeyFrame('x', f))
                u.setKeyFrame('x', f, u['x']);
            if(u.hasKeyFrame('y', f))
                u.setKeyFrame('y', f, u['y']);

            return u;
        };
        u.name = function(n) {
            if(n) {
                u.unitName = n;
                return u;
            }
            return u.unitName;
        };
        u.set = function(key, value){
            if(Object.prototype.toString.call(key) === '[object Object]') {
                for(var k in key){
                    if(key.hasOwnProperty(k))
                        u[k] = key[k];
                }
                return u;
            }
            u[key] = value;
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
        g.fillColor = "#000000";
        g.strokeColor = "#ffffff";
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
        r.draw = function(c){
            var ctx;
            if(c)
                ctx = c;
            else
                ctx = context;
            ctx.save();
            ctx.translate(r.x + r.width * .5, r.y + r.height * .5);
            if(r.rotate)
                ctx.rotate(r.rotate * .017453293);
            //context.translate(r.x + r.width *.5, r.y + r.height *.5);
            ctx.globalAlpha = r.opacity;
            ctx.fillStyle = r.fillColor;
            //context.fillRect(r.x, r.y, r.width, r.height);
            ctx.fillRect(-r.width *.5, -r.height *.5, r.width, r.height);
            if(r.stroke) {
                ctx.strokeStyle = r.strokeColor;
                ctx.lineWidth = r.lineWidth;
                ctx.stroke();
            }
            ctx.restore();
            if(!c)
                r.drawGeometric();
        };
        r.drawFunction = function(n){
            //r.save();
            r.transitionFrame(n);
            r.draw();
            //r.restore();
        };
        r.encodeWithFrame = function(n) {
            r.transitionFrame(n);
            r.draw(encodeContext);
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
        c.draw = function(c_){
            var ctx = c_ || context;
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = c.opacity;
            ctx.arc(c.x, c.y, c.r, 0, 6.283185307, false);
            ctx.fillStyle = c.fillColor;
            ctx.fill();
//            ctx.lineWidth = 5;
//            ctx.strokeStyle = '#003300';
//            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            if(!c_)
                c.drawGeometric();
        };
        c.drawFunction = function(n){
            //r.save();
            c.transitionFrame(n);
            c.draw();
            //r.restore();
        };
        c.encodeWithFrame = function(n) {
            c.transitionFrame(n);
            c.draw(encodeContext);
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
        l.drawFrameWithNumber = function(n) {
            l.nowFrame = n;
            if(n < 0 || n >= l.cntFrame)
                return;
            l.drawFunction(n);
            l.nowFrame = 0;
        };
        l.encodeWithFrame = function(n) {
            for(var i = 0; i < l.objectCnt; ++i)
                l.objects[i].encodeWithFrame(n);
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
    export: false,
    playing: false,
    setNowTransition: function(){},
    watchLayerSwap: function(){},
    changeExportingPercent: function(){},
    addLayer: function(l){
        controller.layer[controller.layerCnt++] = l;
    },
    removeLayer: function(no) {
        no = controller.layerCnt - no - 1;
        controller.layer.splice(no, 1);
        --controller.layerCnt;
    },
    swapLayer: function(a, b) {
        if(a != b) {
            controller.watchLayerSwap && controller.watchLayerSwap(a, b);
            a = controller.layerCnt - a - 1;
            b = controller.layerCnt - b - 1;
            var tmp = controller.layer[a];
            controller.layer[a] = controller.layer[b];
            controller.layer[b] = tmp;
        }
    },
    drawFrame: function(){
        var n = controller.nowFrame;
        if(n < controller.frameCnt){
            clearCanvas();
            for(var i = 0; i < controller.layerCnt; ++i)
                controller.layer[i].drawFrameWithNumber(
                    (n - controller.layer[i].startFrame)
                );
            slider.value = Math.floor(10000. * n / controller.frameCnt);
            drawTimelineTransition();
        }
        else {
            slider.value = Math.floor(10000. * n / controller.frameCnt);
            drawTimelineTransition();
            clearInterval(controller.timeInterval);
            controller.playing = false;
            return;
        }
        ++controller.nowFrame;
        frameInfo.innerHTML = controller.nowFrame + "/" + controller.frameCnt;
    },
    drawFrameWithNumber: function(n) {
        if(n < controller.frameCnt){
            clearCanvas();
            for(var i = 0; i < controller.layerCnt; ++i)
                controller.layer[i].drawFrameWithNumber(
                    (n - controller.layer[i].startFrame)
                );
            frameInfo.innerHTML = (n + 1) + "/" + controller.frameCnt;
            drawTimelineTransition();
        }
        controller.nowFrame = (+n) + 1;
    },
    restart: function() {
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
    encode: function() {
        for(var i = 0; i < controller.frameCnt; ++i) {
            for(var j = 0; j < controller.layerCnt; ++j)
                controller.layer[j].encodeWithFrame(i);
            encoder.addFrame(encodeContext, {delay: controller.idle});
            controller.changeExportingPercent(Math.floor(i * 100.0 / controller.frameCnt));
            encodeContext.fillStyle = "#fff";
            encodeContext.fillRect(0, 0, encodeCanvas.width, encodeCanvas.height);
        }
    },
    redraw: function() {
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

var drawTimeline = function(t){
    clearTimeline();
    timelineNowObject = undefined;
    var h = 80;
    for(var i in t.propertyKeyFrames) {
        if(t.propertyKeyFrames[i]) {
            timelineNowObject = t;
            timelineContext.fillStyle = "#888";
            timelineContext.fillRect(0, h, timelineCanvas.width, 1);
            for(var j = 0; j < t.propertyKeyFrames[i].length; ++j) {
                var x = 1. * t.propertyKeyFrames[i][j] / (t.endFrame - t.startFrame - 1) * (timelineCanvas.width - 12) + 6;
                timelineContext.beginPath();
                timelineContext.arc(x, h, 5, 0, 6.283185307, false);
                timelineContext.fill();
                timelineContext.closePath();
            }
            h += 20;
        }
    }
}

var drawTimelineTransition = function() {
    if(timelineNowObject) {
        clearTimeline();
        var h = 80;
        var nowTransitions = [];
        for(var i in timelineNowObject.propertyKeyFrames) {
            if(timelineNowObject.propertyKeyFrames[i]) {
                timelineContext.fillStyle = "#888";
                timelineContext.fillRect(0, h, timelineCanvas.width, 1);
                for(var j = 0; j < timelineNowObject.propertyKeyFrames[i].length; ++j) {
                    if(controller.nowFrame - 1 == timelineNowObject.propertyKeyFrames[i][j])
                        timelineContext.fillStyle = "#F00";
                    else {
                        if(j && controller.nowFrame - 1 < timelineNowObject.propertyKeyFrames[i][j]
                             && controller.nowFrame - 1 > timelineNowObject.propertyKeyFrames[i][j - 1]) {
                            timelineContext.fillStyle = "#F00";
                            timelineContext.fillRect(timelineNowObject.propertyKeyFrames[i][j - 1]
                                / (timelineNowObject.endFrame - timelineNowObject.startFrame - 1) * (timelineCanvas.width - 12) + 10, h,
                                (timelineNowObject.propertyKeyFrames[i][j] - timelineNowObject.propertyKeyFrames[i][j - 1])
                                    / (timelineNowObject.endFrame - timelineNowObject.startFrame - 1) * (timelineCanvas.width - 12) - 10, 1);
                            nowTransitions.push(timelineNowObject.findTransitionStartWith(timelineNowObject.propertyKeyFrames[i][j - 1], i));
                        }
                        timelineContext.fillStyle = "#888";
                    }
                    var x = 1. * timelineNowObject.propertyKeyFrames[i][j] / (timelineNowObject.endFrame - timelineNowObject.startFrame - 1) * (timelineCanvas.width - 12) + 6;
                    timelineContext.beginPath();
                    timelineContext.arc(x, h, 5, 0, 6.283185307, false);
                    timelineContext.fill();
                    timelineContext.closePath();
                }
                h += 20;
            }
        }
        controller.setNowTransition(nowTransitions);
    }
}

window.onload = function(){
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    frameInfo = document.getElementById("frame_number");

    setMainCanvasSize(250, 250);

    controller.frameCnt = 100;
    controller.idle = 16;
    controller.drawFrameWithNumber(0);

    var lastValue = 0,
        lastScaleValue = 100;
    slider = document.getElementsByName("frame")[0];
    var scale_rate = document.getElementById("scale_rate");

    frameInfo.innerHTML = controller.nowFrame + "/" + controller.frameCnt;

    timelineCanvas = document.getElementById("timeline_canvas");
    timelineCanvas.width = window.innerWidth - 500;
    timelineCanvas.height = 200;
    timelineContext = timelineCanvas.getContext("2d");
    clearTimeline();

    slider.onmousemove = function(){
        if(this.value != lastValue){
            var frameNow = this.value / 10000. * controller.frameCnt;
            controller.drawFrameWithNumber(Math.floor(frameNow));
            lastValue = this.value;
        }
    }
    document.getElementsByName("play")[0].onclick = function(){
        controller.play();
    }
    document.getElementsByName("scale")[0].onmousemove = function(){
        if(this.value != lastScaleValue){
            var s = 1. * this.value / 100;
            canvas.style["-webkit-transform"] = "scale(" + s + ',' + s + ')';
            lastScaleValue = this.value;
            scale_rate.innerHTML = lastScaleValue + '%';
        }
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
    right_panel.style.width = scrWidth - 242 * 2 + "px";

    var storyboard = document.getElementById("storyboard");
    storyboard.style.height = scrHeight - 252 + "px";

    var contents = document.getElementsByClassName("content");
    for(var i = 0; i < contents.length; ++i){
        var height = contents[i].parentNode.style.height ?
            parseInt(contents[i].parentNode.style.height) : contents[i].parentNode.clientHeight;
        contents[i].style.height = height - 47 + "px"
    }
}

var drop = function(event) {
    event.preventDefault();
    event.srcElement.style.opacity = "1";
    //var no = event.dataTransfer.getData("no");
}

var dragEnter = function(event) {

}

var dragOver = function(event) {
    event.preventDefault();
    var pos = Math.floor((event.clientY - unitListPosition - 5) / 23);
    if(pos != unitDragNo && pos < controller.layerCnt && pos > -1) {

        controller.swapLayer(unitDragNo, pos);
        controller.redraw();

        unitDragNo = pos;
    }
}

var dragStart = function(event) {
    unitListPosition = document.getElementsByClassName("unit-list")[0].getBoundingClientRect().top;
    unitDragNo = this.getAttribute("data-unit-no");
    //event.srcElement.style.opacity = "0.5";
    event.dataTransfer.setData("element", this.innerHTML);
}

var dragRerange = function() {
    return function($scope, element) {
        var e = element[0];
        e.draggable = true;
        e.ondragstart = dragStart;
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
    $scope.objects = [];

    $scope.folded = false;
    $scope.window_btn = "×";
    $scope.btn_click = settings_fold;

    $scope.newObjectName = "circle";
    $scope.transitionFunctions = easing.functions;

    $scope.loading = "none";
    $scope.loading_percent = 0;

    controller.setNowTransition = function(trs) {
        $scope.transitions = trs;
    };

    controller.watchLayerSwap = function(a, b) {
        var tmp = $scope.objects[a];
        $scope.objects[a] = $scope.objects[b];
        $scope.objects[b] = tmp;
    };

    controller.changeExportingPercent = function(p) {
        $scope.loading_percent = p;
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }

    $scope.changeTransitionFunction = function(tr, tf){
        $scope.selectedObject.changeTransitionFunction(tr, tf);
    };

    $scope.addObject = function(){
        var o;
        switch ($scope.newObjectName) {
            case "circle":
                o = circle.createNew()
                    .name('circle' + (unitCnt++))
                    .set({
                        "x": 50,
                        "y": 50,
                        "r": 50,
                        "fillColor": "#000000",
                        "opacity": 1,
                        "rotate": 0
                    });
                break;
            case "rectangle":
                o = rectangle.createNew()
                    .name('rectangle' + (unitCnt++))
                    .set({
                        "x": 0,
                        "y": 0,
                        "width": 100,
                        "height": 100,
                        "fillColor": "#000000",
                        "opacity": 1,
                        "rotate": 0
                    });
                break;
            default :
        }
        $scope.objects = [o].concat($scope.objects);

        if($scope.selectedObject)
            $scope.selectedObject.selected = false;
        o.selected = true;
        o.watchChange(function() {      // use closure
            if($scope.selectedObject) {
                for(var prop in $scope.selectedObject.propertys) {
                    var propName = $scope.selectedObject.propertys[prop];
                    $scope["nowObject_" + propName] = $scope.selectedObject[propName];
                    $scope["nowObject_" + propName + "_key"] = $scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1);
                }
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });
        $scope.selectedObject = o;

        for(var prop in $scope.selectedObject.propertys) {
            var propName = $scope.selectedObject.propertys[prop];
            $scope["nowObject_" + propName] = $scope.selectedObject[propName];
            $scope["nowObject_" + propName + "_key"] = $scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1);
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

    $scope.removeObject = function(event) {
        //var e = event.srcElement.parentNode;

        $scope.objects.splice(this.$index, 1);
        controller.removeLayer(this.$index);
        controller.redraw();
        timelineNowObject = undefined;
        clearTimeline();
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

    $scope.selectUnit = function(index) {
        if($scope.selectedObject != $scope.objects[index]) {
            $scope.selectedObject.selected = false;
            $scope.selectedObject.unwatchChange();
            $scope.selectedObject = $scope.objects[index];
            $scope.selectedObject.selected = true;
            $scope.selectedObject.drawTransitionTimeline();

            for(var prop in $scope.selectedObject.propertys) {
                var propName = $scope.selectedObject.propertys[prop];
                $scope["nowObject_" + propName] = $scope.selectedObject[propName];
                $scope["nowObject_" + propName + "_key"] = $scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1);
            }

            drawTimeline($scope.selectedObject);
            $scope.selectedObject.watchChange(function() {
                if($scope.selectedObject) {
                    for(var prop in $scope.selectedObject.propertys) {
                        var propName = $scope.selectedObject.propertys[prop];
                        $scope["nowObject_" + propName] = $scope.selectedObject[propName];
                        $scope["nowObject_" + propName + "_key"] = $scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1);
                    }
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            });
            controller.redraw();
        }
    }

    $scope.canvasMouseDown = function($event){
        var x = $event.offsetX,
            y = $event.offsetY;
        if($scope.selectedObject) {
            $scope.selectedObject.selected = false;
            $scope.selectedObject.unwatchChange();
            clearTimeline();
            timelineNowObject = undefined;
        }
        $scope.selectedObject = controller.getObjectAt(x, y);
        clearTimeline();
        if($scope.selectedObject){
            mousePressed = true;
            mouseDeltaX = $event.offsetX - $scope.selectedObject.x;
            mouseDeltaY = $event.offsetY - $scope.selectedObject.y;
            $scope.selectedObject.selected = true;
            $scope.selectedObject.drawTransitionTimeline();

            for(var prop in $scope.selectedObject.propertys) {
                var propName = $scope.selectedObject.propertys[prop];
                $scope["nowObject_" + propName] = $scope.selectedObject[propName];
                $scope["nowObject_" + propName + "_key"] = $scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1);
            }

            drawTimeline($scope.selectedObject);

            $scope.selectedObject.watchChange(function() {
                if($scope.selectedObject) {
                    for(var prop in $scope.selectedObject.propertys) {
                        var propName = $scope.selectedObject.propertys[prop];
                        $scope["nowObject_" + propName] = $scope.selectedObject[propName];
                        $scope["nowObject_" + propName + "_key"] = $scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1);
                    }
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
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
            $scope.selectedObject.move(controller.nowFrame - 1);
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
                    if($scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1)) {
                        $scope.selectedObject.setKeyFrame(propName, controller.nowFrame - 1, $scope["nowObject_" + propName]);
                    }
                    else
                        $scope.selectedObject[propName] = $scope["nowObject_" + propName];
                    $scope["nowObject_" + propName + "_key"] = $scope.selectedObject.hasKeyFrame(propName, controller.nowFrame - 1);
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
            // TODO
            controller.redraw();
            $scope.timer = false;
        }, 300);
    }

    $scope.toggleKeyFrame = function(prop) {
        $scope.selectedObject.toggleKeyFrame(prop, controller.nowFrame - 1);
        drawTimeline($scope.selectedObject);
    }

    $scope.exportGIF = function() {
        $scope.loading = "inherit";
        $scope.loading_percent = 0;

        if(GIFEncoderLoaded) {
            encodeContext.fillStyle = "#fff";
            encodeContext.fillRect(0, 0, canvas.width, canvas.height);
            encoder = new GIFEncoder();
            encoder.setRepeat(0);
            encoder.setDelay($scope.idle);
            encoder.setSize(canvas.width, canvas.height);
            encoder.start();
            controller.encode();
            encoder.finish();
            var binaryGIF = encoder.stream().getData();
            var GIFUrl = "data:img/gif;base64," + encode64(binaryGIF);
            window.location.href=GIFUrl;
            $scope.loading = "none";
        }
        else {
            /*
            loadJS("LZWEncoder.js", function() {
                loadJS("NeuQuant.js", function() {
                    loadJS("GIFEncoder.js", function(){
                        loadJS("b64.js", function() {
                            encodeCanvas = document.createElement("canvas");
                            encodeCanvas.width = canvas.width;
                            encodeCanvas.height = canvas.height;
                            encodeContext = encodeCanvas.getContext("2d");
                            encodeContext.fillStyle = "#fff";
                            encodeContext.fillRect(0, 0, canvas.width, canvas.height);
                            encoder = new GIFEncoder();
                            encoder.setRepeat(0);
                            encoder.setDelay($scope.idle);
                            encoder.setSize(canvas.width, canvas.height);
                            encoder.start();
                            controller.encode();
                            encoder.finish();
                            var binaryGIF = encoder.stream().getData();
                            var GIFUrl = "data:img/gif;base64," + encode64(binaryGIF);
                            window.location.href=GIFUrl;
                            GIFEncoderLoaded = true;
                            $scope.loading = "none";
                        });
                    });
                });
            });*/
            loadJS("gif.js", function() {
                encodeCanvas = document.createElement("canvas");
                encodeCanvas.width = canvas.width;
                encodeCanvas.height = canvas.height;
                encodeContext = encodeCanvas.getContext("2d");
                encodeContext.fillStyle = "#fff";
                encodeContext.fillRect(0, 0, canvas.width, canvas.height);
                encoder = new GIF();
                controller.encode();
                /*
                encoder.on('finished', function(blob) {
                    alert("!");
                    window.open(URL.createObjectURL(blob));
                });
                encoder.render();*/
                $scope.loading = "none";
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        }
    }
}

var settings_fold = function(){
    this.folded = !this.folded;
    this.window_btn = ["×", "≡"][+this.folded];

    var scrWidth  = window.innerWidth;
    var right_panel = document.getElementById("right_panel");
    right_panel.style.width = scrWidth - [242 * 2, 44][+this.folded] + "px";
    var canvas_control = document.getElementById("canvas_control");
    canvas_control.className = ["ui_window", "ui_window window_folded_true"][+this.folded];
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
    .controller("main", main)
    .directive("draggable", dragRerange);