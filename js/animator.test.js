// a temp file

var animatorInitialized = false;

var animator = {
    init: function() {
        if(animatorInitialized)
            return animator;

        // initialization
        animatorInitialized = true;
        animator.clearObjects();
        animator.setFrameNumber(0);
        animator.setIdle(0);
        animator.nowFrame = 0;
        animator.playState = "stop";

        return animator;
    },
    clearObjects: function() {
        animator.objectNumber = 0;
        animator.objects = [];

        return animator;
    },
    setFrameNumber: function(n_) {
        animator.frameNumber = n_;

        return animator;
    },
    setIdle: function(idle_) {
        animator.idle = idle_;

        return animator;
    },
    clearCanvas: function() {
        // TODO: canvas

        return animator;
    },
    drawFrame: function(n_) {
        // optional argument
        n_ = (typeof n_ === "undefined") ? animator.nowFrame : n_;

        animator.clearCanvas();
        for(var i = 0; i < animator.objectNumber; ++i)
            animator.objects[i].drawFrame(n_);
        animator.nowFrame = n_;

        return animator;
    },
    stop: function() {
        if(animator.playState === "stop")
            return animator;

        animator.playState = "stop";
        animator.drawFrame(0)
    },
    play: function() {
        if(animator.playState === "play")
            return animator;

        animator.playState = "play";
        animator.animationInterval = setInterval(animator.playFunction, animator.idle);
    },
    pause: function() {
        if(animator.playState === "pause")
            return animator;

        animator.playState = "pause";
    },
    // private functions
    playFunction: function() {
        if(animator.playState != "play") {
            clearInterval(animator.animationInterval);
            return;
        }

        ++animator.nowFrame;

        if(animator.nowFrame >= animator.frameNumber) {
            --animator.nowFrame;
            animator.playState = "end";
            clearInterval(animator.animationInterval);
            return;
        }

        animator.drawFrame();
    },
    // constants
    infinity: 10000000000
}

var object = {
    create: function() {
        var o = {
            init: function() {
                o.setFrameRange(0, 0);

                return o;
            },
            setFrameRange: function(start_, end_) {
                o.startFrame = start_;
                o.endFrame = end_;

                return o;
            }
        };

        o.init();

        return o;
    }
}

var layer = {
    create: function() {
        var l = object.create();

        // initialization
        l.objectNumber = 0;
        l.objects = [];
        // --

        return l;
    }
}

var geometric = {
    create: function() {
        var g = object.create();

        return g;
    }
}

var image = {
    create: function() {
        var i = object.create();

        return i;
    }
}

var text = {
    create: function() {
        var t = object.create();

        return t;
    }
}

var circle = {
    create: function() {
        var c = geometric.create();

        c.propertys = [];
        c.propertyNames = [
            "x",
            "y",
            "r",
            "background-color"
        ];
        c.propertyValues = [
            0,
            0,
            50,
            "#000"
        ];

        c.init = function() {
            var index = 0;
            c.propertys = [];
            for(var prop in p.propertyNames)
                c.propertys.push(property.create().property(prop).setPropertyDefaultValue(c.propertyValues[index++]));

            return c;
        }

        c.drawFrame = function(n_) {
            if(n_ < c.startFrame || n_ >= c.endFrame)
                return undefined;

            for(var prop in p.propertys) {
                p.getFrameValue(n_);
            }

            return c;
        }

        return c;
    }
}

var property = {
    create: function() {
        var p = {
            init: function() {
                p.property("");
                p.clearTransition();

                return p;
            },
            property: function(p_) {
                if(typeof p_ === "undefined")
                    return p.propertyName;

                p.propertyName = p_.toString();

                return p;
            },
            setPropertyDefaultValue: function(v_) {
                // call after init()/clearTransition()
                p.transitionStartValue = [v_, v_];

                return p;
            },
            setFrameRange: function(s_, e_) {
                // call after setPropertyDefaultValue()
                p.transitionStartFrame = [s_, e_];

                return p;
            },
            clearTransition: function() {
                p.transitionNumber = 1;
                p.transition = [transition.create()];
                p.transitionStartFrame = [0, 0];
                p.transitionStartValue = [0, 0];

                return p;
            },
            addKeyFrame: function(p_) {
                if(p_ < p.transitionStartFrame[0] || p_ >= p.transitionStartFrame[p.transitionNumber])
                    return undefined;

                for(var i = 0; i < p.transitionNumber; ++i) {
                    if(p.transitionStartFrame[i] == p_) {
                        // already had key frame here
                        break;
                    }
                    else if(p.transitionStartFrame[i] > p_) {
                        for(var j = p.transitionNumber; j > i; --j) {
                            p.transition[j] = p.transition[j - 1];
                            p.transitionStartFrame[j] = p.transitionStartFrame[j - 1];
                            p.transitionStartValue[j] = p.transitionStartValue[j - 1];
                        }

                        p.transition[i] = transition.create();
                        p.transitionStartFrame[i] = p_;
                        p.transitionStartValue[i] =
                            p.transition[i - 1].getValue((p_ - p.transitionStartFrame[i - 1])
                                / (p.transitionStartFrame[i + 1] - p.transitionStartFrame[i - 1]))
                                * (p.transitionStartValue[i + 1] - p.transitionStartValue[i - 1])
                                +  p.transitionStartValue[i - 1];

                        ++p.transitionNumber;
                        break;
                    }
                }

                return p;
            },
            getFrameValue: function(f_) {
                if(f_ < p.transitionStartFrame[0] || f_ >= p.transitionStartFrame[p.transitionNumber])
                    return undefined;

                for(var i = 0; i < p.transitionNumber; ++i) {
                    if(p.transitionStartFrame[i] >= f_) {
                        return p.transition[i - 1].getValue((f_ - p.transitionStartFrame[i - 1])
                                / (p.transitionStartFrame[i] - p.transitionStartFrame[i - 1]))
                                * (p.transitionStartValue[i] - p.transitionStartValue[i - 1])
                                +  p.transitionStartValue[i - 1];
                    }
                }

                return undefined;
            },
            getTransition: function(n_) {
                if(p.transitionNumber <= n_ || n_ < 0)
                    return undefined;

                return p.transition[n_];
            },
            setKeyFrameValue: function(p_, v_) {
                if(p_ < p.transitionStartFrame[0] || p_ >= p.transitionStartFrame[p.transitionNumber])
                    return undefined;

                for(var i = 0; i < p.transitionNumber; ++i)
                    if(p.transitionStartFrame[i] == p_) {
                        p.transitionStartValue[i] = v_;
                        return p;
                    }

                return undefined;
            }
        }
        return p;
    }
}

var transition = {
    create: function() {
        var t = {
            init: function() {
                t.setEasingFunction("linear");

                return t;
            },
            setEasingFunction: function(ef_) {
                t.easingFunction = String(ef_);

                return t;
            },
            getValue: function(p_) {
                return t.easingFunctions[t.easingFunction](p_);
            },
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
            }
        };

        t.init();
        return t;
    }
}