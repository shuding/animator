var app = angular.module("animator", []);

var load = function(){
    resize();
}

var resize = function(){
    var scrHeight = window.innerHeight,
        scrWidth  = window.innerWidth;
    var settingInputs = document.getElementsByClassName("setting_input");
    for(var i = 0; i < settingInputs.length; ++i){
        var leftPos = settingInputs[i].offsetLeft;
        settingInputs[i].style.marginLeft = (150 - leftPos) + "px";
    }

    var right_panel = document.getElementById("right_panel");
    right_panel.style.width = scrWidth - 242 + "px";

    var storyboard = document.getElementById("storyboard");
    storyboard.style.height = scrHeight - 252 + "px";

    var contents = document.getElementsByClassName("content");
    for(var i = 0; i < contents.length; ++i){
        var height = contents[i].parentNode.style.height ? parseInt(contents[i].parentNode.style.height) : contents[i].parentNode.clientHeight;
        contents[i].style.height = height - 47 + "px"
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
        var height = contents[i].parentNode.style.height ? parseInt(contents[i].parentNode.style.height) : contents[i].parentNode.clientHeight;
        contents[i].style.height = height - 47 + "px"
    }
}

var timeline = function($scope) {
    $scope.folded = false;
    $scope.window_btn = "×";
    $scope.btn_click = timeline_fold;
}

var settings = function($scope) {
    $scope.folded = false;
    $scope.window_btn = "×";
    $scope.btn_click = settings_fold;

    $scope.width = 150;
    $scope.height = 150;
    $scope.frameNumber = 10;
    $scope.frameIdle = 500;

    $scope.items = [
        {
            type: "rectangle",
            init: "hahaha",
            frame: "hehehe",
            folded: true
        },
        {
            type:"rectangle",
            init: "hahaha",
            frame: "hehehe",
            folded: true
        }
    ];
}

app.run(load)
    .controller("timeline", timeline)
    .controller("settings", settings);