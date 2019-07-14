$(function () {
    let canvas = document.querySelector('canvas'),
        c = canvas.getContext('2d'),
        mouseX = 0,
        mouseY = 0,
        lastX,
        lastY,
        width = 500,
        height = 500,
        canvasOffset = $("#canvas").offset(),
        offsetX = canvasOffset.left,
        offsetY = canvasOffset.top,
        mousedown = false;

    let mode = 'pen';
    let fillMode = false;
    canvas.width = width;
    canvas.height = height;

    function clear() {
        c.clearRect(0, 0, canvas.width, canvas.height);
    }

    function handleMouseMove(e) {
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        if (mousedown) {
            c.beginPath();
            if (mode === "pen") {
                c.globalCompositeOperation = "source-over";
                c.strokeStyle = $('input[type=color]').val();
                c.lineWidth = $('input[type=range]').val();
                if ($('input[type=range]').val() < 30) {
                    c.moveTo(lastX, lastY);
                    c.lineTo(mouseX, mouseY);
                    c.lineJoin = 'round';
                    c.lineCap = 'round';
                    c.stroke();

                } else {
                    c.fillStyle = $('input[type=color]').val();
                    c.arc(lastX, lastY, $('input[type=range]').val(), 0, Math.PI * 2, false);
                    c.lineJoin = 'round';
                    c.fill();
                }
                lastX=mouseX;
                lastY=mouseY;
            } else if (mode === "erase") {
                c.globalCompositeOperation = "destination-out";
                c.arc(lastX, lastY, $('input[type=range]').val(), 0, Math.PI * 2, false);
                c.fill();
                lastX=mouseX;
                lastY=mouseY;
            }
        }
    }

    function line(e) {
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        if (mousedown)
            c.beginPath();
        c.moveTo(lastX, lastY);
        c.lineTo(mouseX, mouseY);
        c.strokeStyle = $('input[type=color]').val();
        c.lineWidth = $('input[type=range]').val();
        c.stroke();
    }

    function rectangle(e) {
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
        if (mousedown) {
            c.strokeStyle = $('input[type=color]').val();
            c.fillStyle = $('input[type=color]').val();
            c.lineWidth = $('input[type=range]').val();
            if (fillMode) {
                let width = mouseX - lastX;
                let height = mouseY - lastY;
                c.fillRect(lastX, lastY, width, height);
            } else {
                let width = mouseX - lastX;
                let height = mouseY - lastY;
                c.rect(lastX, lastY, width, height);
                c.stroke();
            }
        }
    }

    function circle(e) {
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        if (mousedown) {
            c.fillStyle = $('input[type=color]').val();
            c.strokeStyle = $('input[type=color]').val();
            c.lineWidth = $('input[type=range]').val();
            if (fillMode) {
                let radius = Math.sqrt(Math.pow((mouseX - lastX), 2) + Math.pow((mouseY - lastY), 2));
                c.beginPath();
                c.arc(lastX, lastY, radius, 0, Math.PI * 2);
                c.fill();
            } else {
                let radius = Math.sqrt(Math.pow((mouseX - lastX), 2) + Math.pow((mouseY - lastY), 2));
                c.beginPath();
                c.arc(lastX, lastY, radius, 0, Math.PI * 2);
                c.stroke();
            }
        }
    }

    canvas.addEventListener('mousedown', function (e) {
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

        lastX = mouseX;
        lastY = mouseY;

        mousedown = true;
    }, false);

    canvas.addEventListener('mouseup', function (e) {
        if (mode === "rectangle") {
            c.globalCompositeOperation = "source-over";
            rectangle(e);
        } else if (mode === "line") {
            c.globalCompositeOperation = "source-over";
            line(e);
        } else if (mode === "circle") {
            c.globalCompositeOperation = "source-over";
            circle(e);
        }

        mousedown = false;
    }, false);

    $("#canvas").on("mousemove", function (e) {
        handleMouseMove(e);
    });
    $("#clear").on("click", function () {
        clear();
    });
    $("#pen").on("click", function () {
        mode = "pen";
    });
    $("#erase").on("click", function () {
        mode = "erase";
    });
    $("#rec").on("click", function () {
        mode = "rectangle";
        fillMode = false;
    });
    $("#line").on("click", function (e) {
        mode = "line";
        line(e)
    });
    $("#recF").on("click", function (e) {
        mode = "rectangle";
        fillMode = true;
        rectangle(e)
    });
    $("#circle").on("click", function () {
        mode = "circle";
        fillMode = false;
    });
    $("#circleF").on("click", function () {
        mode = "circle";
        fillMode = true;
    });
    $('#file-input').on("change", function (e) {
        let file = e.target.files[0],
            imageType = /image.*/;

        if (!file.type.match(imageType))
            return;

        let reader = new FileReader();
        reader.onload = fileOnload;
        reader.readAsDataURL(file);
    });
    $("#sizeSave").on("click", function () {
        canvas.width = $("#width").val();
        canvas.height = $("#height").val();
        width = $("#width").val();
        height = $("#height").val();
        drawImage();
    });
    // $("#canvas").on("mouseleave", function () {
    //     mousedown = false;
    // });
    $("#undo").on("click", function () {
        cUndo();
    });
    $("#redo").on("click", function () {
        cRedo();
    });
    $("#canvas").on("mouseup", function () {
        cPush();
    });
    $("#createLayer").on("click", function () {
       createLayer();
    });

    function fileOnload(e) {
        let $img = $('<img>', {src: e.target.result});
        $img.on("load", function () {
            let canvas = $('#canvas')[0];
            let context = canvas.getContext('2d');

            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;
            context.drawImage(this, 0, 0);
            cPush();
        });
    }

    let link = document.createElement('a');
    link.innerHTML = 'Save As';
    link.addEventListener('click', function () {
        link.href = canvas.toDataURL();
        link.download = "myPainting.png";
    }, false);
    document.body.appendChild(link);

    let save = $("#save");
    save.on("click", function () {
        save.href = canvas.toDataURL();
        save.download = "myPainting.png";
    });

    drawImage();
    let cPushArray = [];
    let cStep = -1;

    function cPush() {
        console.log("Pushed");
        console.log("after push " +cStep);
        cPushArray.push(document.getElementById('canvas').toDataURL());
        cStep++;
    }
    function cUndo() {
        console.log("Accessed");
        console.log("after access " +cStep);
        if (cStep >= 0) {
            let $canvasPic = $('<img>', {src: cPushArray[cStep]});
            console.log("in if cStep " + cStep,);
            console.log($canvasPic);
            $canvasPic.on("load", function () {
                let canvas = $('#canvas')[0];
                let context = canvas.getContext('2d');

                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                context.drawImage($canvasPic, 0, 0);
            });
            cStep--;
            console.log("after decrement" +cStep);
        }
    }

    function drawImage() {
        console.log('init');
        const image = new Image();
        $(image).on("load", function () {
            c.drawImage(image, 0, 0, width, height);
            cPush();
        });
        image.src = document.getElementById('canvas').toDataURL();
    }

    function cRedo() {
        if (cStep < cPushArray.length-1) {
            cStep++;
            let canvasPic = new Image();
            canvasPic.src = cPushArray[cStep];
            canvasPic.onload = function () { c.drawImage(canvasPic, 0, 0); }
        }
    }

    let defaultLayer = $("#canvas");

    function createLayer(){
        let layerIndex = 1;

        let layer = document.createElement("canvas");

        let setClass = layer.className = "layer"+layerIndex;
        console.log(setClass);
        layerIndex++;
        console.log(layerIndex);


    }
});