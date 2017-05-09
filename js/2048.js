/**
 * Created by zdy on 2017/5/5.
 */
"use strict";
var canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d"),
    result = document.getElementById("result"), resCtx = result.getContext("2d"), canvasSize = canvas.width,
    blockSize = canvas.width / 4, textFont = "20px Georgia", emptyColor = "#E3F68F", textColor = "#2c2c2c";
var data = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048], successKey = data.length - 1, list = [], ps = {}, pe = {},
    validDistance = 80;
var colors = ["#FFF68F", "#FFEFD5", "#FFE4E1", "#FFDEAD", "#FFC1C1", "#FFB90F", "#FFA54F", "#FF8C00", "#FF7F50", "#FF6EB4", "#FF4500"];
canvas.removeEventListener("touchstart", touchstart, false);
canvas.removeEventListener("touchmove", touchmove, false);
canvas.removeEventListener("touchend", touchend, false);
canvas.addEventListener("touchstart", touchstart, false);
canvas.addEventListener("touchmove", touchmove, false);
canvas.addEventListener("touchend", touchend, false);
function touchend(e) {
    if (Math.abs(pe.x - ps.x) > Math.abs(pe.y - ps.y)) {
        //横向
        if (pe.x - ps.x > validDistance) {//右移
            move("r")
        } else if (pe.x - ps.x < 0 - validDistance) {//左移
            move("l")
        }
    } else {
        if (pe.y - ps.y > validDistance) {//下移
            move("b")
        } else if (pe.y - ps.y < 0 - validDistance){//上移
            move("t")
        }
    }
}
function touchstart(e) {
    ps.x = e.touches[0].pageX;
    ps.y = e.touches[0].pageY;
    e.preventDefault();
}
function touchmove(e) {
    pe.x = e.touches[0].pageX;
    pe.y = e.touches[0].pageY;
    e.preventDefault();
}
document.onkeydown = function (event) {
    if(result.style.display!="none") return;
    var e = event || window.event;
    if (e.keyCode >= 37 && e.keyCode <= 40) e.preventDefault();
    switch (e.keyCode) {
        case 37:
            move("l");
            break;
        case 38:
            move("t");
            break;
        case 39:
            move("r");
            break;
        case 40:
            move("b");
            break;
        default:
            break;
    }
};
function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
        var v = list[i][j];
        if (v == "-1") {
            ctx.fillStyle = emptyColor;
            ctx.fillRect(blockSize * j + 2, blockSize * i + 2, blockSize - 4, blockSize - 4);
        } else {
            ctx.fillStyle = colors[list[i][j]];
            ctx.fillRect(blockSize * j + 2, blockSize * i + 2, blockSize - 4, blockSize - 4);
            ctx.fillStyle = textColor;
            ctx.fillText(data[list[i][j]], blockSize * (j + 0.5), blockSize * (i + 0.5), blockSize - 2);
        }
    }
}
function start() {
    document.getElementById("mask").style.display = "none";
    result.style.display="none";
    //伪造数据
    // list = [
    //     [0, 3, 5, 8],
    //     [1, 6, 9, 8],
    //     [2, 4, 7, 5],
    //     [0, 0, 3, 4]
    // ];

    //全部随机
    // for (var i = 0; i < 4; i++) {
    //     for (var j = 0; j < 4; j++) {
    //         list[i][j] = Math.floor(Math.random() * 11);
    //     }
    // }

    //初始化
    for (var i = 0; i < 4; i++) {
        list[i] = [];
        for (var j = 0; j < 4; j++) {
            list[i][j] = -1;
        }
    }
    create();

    // var initPos = {};
    // initPos.x = Math.floor(Math.random() * 4);
    // initPos.y = Math.floor(Math.random() * 4);
    // list[initPos.x][initPos.y] = Math.floor(Math.random() * 2);
    ctx.font = textFont;
    ctx.textBaseline = 'middle';//设置文本的垂直对齐方式
    ctx.textAlign = 'center'; //设置文本的水平对对齐方式
    draw();
}
function move(op) {
    var moveSign = checkMove();
    switch (op) {
        case "r":
            if (!moveSign.r) break;
            handle(list);
            break;
        case "l":
            if (!moveSign.l) break;
            var transformList = turning(list);
            handle(transformList);
            list = turning(transformList);
            break;
        case "b":
            if (!moveSign.b) break;
            var transformList = transpose(list);
            handle(transformList);
            list = transpose(transformList);
            break;
        case "t":
            if (!moveSign.t) break;
            var transformList = turning(transpose(list));
            handle(transformList);
            list = transpose(turning(transformList));
            break;
        default:
            break;
    };
    if (checkSuccess()) {
        draw();
        success();
        return;
    }
    if (moveSign[op]) {
        create();
    }
    draw();
};
window.onresize = function () {
    var max = 500;
    var w = window.innerWidth - 20;
    var h = window.innerHeight - 20;
    if (w < h) {
        canvas.style.width = (w >= max) ? max + "px" : w + "px";
        result.style.width = (w >= max) ? max + "px" : w + "px";
    } else if (w > h) {
        canvas.style.width = (h >= max) ? max + "px" : h + "px";
        result.style.width = (h >= max) ? max + "px" : h + "px";
    }
};
function success() {
    document.getElementById("mask").style.display = "block";
    var img=new Image();
    img.src=canvas.toDataURL();
    img.onload=function () {
        resCtx.drawImage(img,0,0);
    }
    result.style.display="block";
    document.getElementById("mes").innerHTML = "<p>恭喜你，成功啦！</p>"
}
function fail() {
    document.getElementById("mask").style.display = "block";
    document.getElementById("mes").innerHTML = "<p>很抱歉，失败了！</p>"
}
function create() {
    var isFull = checkFull();
    if (!isFull) {
        while (true) {
            var initPos = {};
            initPos.x = Math.floor(Math.random() * 4);
            initPos.y = Math.floor(Math.random() * 4);
            if (list[initPos.x][initPos.y] == "-1") {
                list[initPos.x][initPos.y] = Math.floor(Math.random() * 2);
                break;
            }
        }
        checkFull() && checkFail() && fail();
    } else {
        checkFail() && fail();
    }

}
function handle(matrix) {
    for (var i = 0; i < 4; i++) {
        //从右到左 合并相同的
        for (var j = 3; j >= 1; j--) {
            if (matrix[i][j] != "-1") {
                for (var n = j - 1; n >= 0; n--) {
                    if (matrix[i][n] == -1) {
                        continue;
                    } else if (matrix[i][n] != matrix[i][j]) {
                        break;
                    } else if (matrix[i][n] == matrix[i][j]) {
                        matrix[i][j]++;
                        matrix[i][n] = -1;
                    }
                }
            }
        }
        //右移补空
        for (var j = 3; j >= 1; j--) {
            //空时右移
            while (matrix[i][j] == "-1") {
                //左侧都为空则退出
                var sign = true;
                for (var m = 0; m < j; m++) {
                    if (matrix[i][m] != -1)
                        sign = false;
                }
                if (sign) {
                    break;
                }
                //循环右移
                for (var k = j; k > 0; k--) {
                    matrix[i][k] = matrix[i][k - 1];
                    matrix[i][k - 1] = -1;
                }
            }
        }
    }
}
function log(matrix) {
    for (var i = 0; i < matrix.length; i++) {
        console.log(matrix[i].join(" "))
        console.log(" ");
    }
}
function transpose(a) {
    var b = [], length = a.length;
    while (length--) {
        b[length] = [];
    }
    for (var i = 0, len = a.length; i < len; i++) {
        for (var j = 0, lenRow = a[i].length; j < lenRow; j++) {
            b[j][i] = a[i][j];
        }
    }
    return b;
}
function turning(a) {
    var b = [], length = a.length;
    while (length--) {
        b[length] = [];
    }
    for (var i = 0, len = a.length; i < len; i++) {
        for (var j = 0, lenRow = a[i].length; j < lenRow; j++) {
            b[i][lenRow - 1 - j] = a[i][j];
        }
    }
    return b;
}
function checkFail() {
    var isFail = true;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            (list[i][j + 1] != undefined && list[i][j] == list[i][j + 1] ||
            list[i][j - 1] != undefined && list[i][j] == list[i][j - 1] ||
            list[i + 1] != undefined && list[i][j] == list[i + 1][j] ||
            list[i - 1] != undefined && list[i][j] == list[i - 1][j] ) && (isFail = false);
        }
    }
    return isFail;
}
function checkFull() {
    var isFull = true;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (list[i][j] == "-1") {
                isFull = false;
            }
        }
    }
    return isFull;
}
function checkSuccess() {
    var isSuccess = false;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (list[i][j] == successKey) {
                isSuccess = true;
            }
        }
    }
    return isSuccess;
}
function checkMove() {
    var moveSign = {
        l: false,
        r: false,
        t: false,
        b: false
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if(list[i][j]==-1)continue;
            list[i][j + 1] != undefined && (list[i][j + 1] == -1 || list[i][j] == list[i][j + 1]) && (moveSign.r = true)
            list[i][j - 1] != undefined && (list[i][j - 1] == -1 || list[i][j] == list[i][j - 1]) && (moveSign.l = true)
            list[i + 1] != undefined && (list[i + 1][j] == -1 || list[i][j] == list[i + 1][j]) && (moveSign.b = true)
            list[i - 1] != undefined && (list[i - 1][j] == -1 || list[i][j] == list[i - 1][j]) && (moveSign.t = true)
        }
    }
    return moveSign;
}
window.onresize();
start();