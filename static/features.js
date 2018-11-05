function Copy() {
	// clone what are you copying since you
	// may want copy and paste on different moment.
	// and you do not want the changes happened
	// later to reflect on the copy.
	canvas.getActiveObject().clone(function(cloned) {
		_clipboard = cloned;
	});
}

function Paste() {
	// clone again, so you can do multiple copies.
	_clipboard.clone(function(clonedObj) {
		canvas.discardActiveObject();
		clonedObj.set({
			left: clonedObj.left + 10,
			top: clonedObj.top + 10,
			evented: true,
		});
		if (clonedObj.type === 'activeSelection') {
			// active selection needs a reference to the canvas.
			clonedObj.canvas = canvas;
			clonedObj.forEachObject(function(obj) {
				canvas.add(obj);
			});
			// this should solve the unselectability
			clonedObj.setCoords();
		} else {
			canvas.add(clonedObj);
		}
		_clipboard.top += 10;
		_clipboard.left += 10;
		canvas.setActiveObject(clonedObj);
		canvas.requestRenderAll();
	});
}

function activeObjectSet(options, callback) {
	actobj = canvas.getActiveObject();
	// options.target ex: <div>...</div>
	if (actobj) {
		if (actobj.type == 'activeSelection') {
			actobj.forEachObject(function(obj){
				callback(obj);
			});
		} else {
			callback(actobj);
		}
		canvas.renderAll();
	}
}



// Canvas start!!
var canvas = new fabric.Canvas('myCanvas');

canvas.setDimensions({width:1280, height:720}, {backstoreOnly:true});
canvas.selection = true;
canvas.on('mouse:up', function(opt) {console.log(opt)});

var ubuntuText = new fabric.IText("배그타임!", {
	fontFamily: 'Noto Sans KR',
	fontSize: 100,
	fontWeight: 900,
	fill: '#f442df',
	stroke: 'black',
	strokeWidth:20,
	paintFirst: 'stroke',
	charSpacing: -100,
	angle:  -5,
	top: 100

});

var copyText = new fabric.IText("");
fabric.util.object.extend(copyText, ubuntuText);
copyText.set('top', 200);
copyText.set('text', "쟁니랑");
copyText.set('fill', 'white');

var copyText2 = new fabric.IText("");
fabric.util.object.extend(copyText2, ubuntuText);
copyText2.set('top', 300);
copyText2.set('text', "명욱이랑");
copyText2.set('fill', 'red');

canvas.add(ubuntuText);
canvas.add(copyText);
canvas.add(copyText2);


//add html component
var pcell = document.createElement("div");
pcell.setAttribute("class", "palette-cell");

$(pcell).clone().html("복사").on('mouseup', Copy).appendTo("#palette");
$(pcell).clone().html("붙여넣기").on('mouseup', Paste).appendTo("#palette");
$(pcell).clone().html("삭제").on('mouseup', function(options){
	activeObjectSet(options, function(obj) {canvas.remove(obj)});
}).appendTo("#palette");
$(pcell).clone().html("테두리굵게").on('mouseup', function(options) {
	activeObjectSet(options, function(obj){obj.set("strokeWidth", obj.strokeWidth+4)});
}).appendTo("#palette");
$(pcell).clone().html("테두리얇게").on('mouseup', function(options) {
	activeObjectSet(options, function(obj){obj.set("strokeWidth", obj.strokeWidth-4)});
}).appendTo("#palette");
$(pcell).clone().html("테두리없음").on('mouseup', function(options) {
	activeObjectSet(options, function(obj){obj.set("strokeWidth", 0)});
}).appendTo("#palette");
$(pcell).clone().html("나눔고딕").on('mouseup', function(options) {
	activeObjectSet(options, function(obj){obj.set("fontFamily", "Nanum Gothic")});
}).appendTo("#palette");
$(pcell).clone().html("Noto Sans KR").on('mouseup', function(options) {
	activeObjectSet(options, function(obj){obj.set("fontFamily", "Noto Sans KR")});
}).appendTo("#palette");

var colors = ["red", "orange", "yellow", "green", "blue", "purple", "black", "white", "cyan", "pink", "gray", "brown"];
var gradients = [{name: "red orange", h:0, v:1, stops:{0:"red", 1:"orange"}},
		 {name: "blue darkblue", h:0, v:1, stops:{0:"blue", 1:"darkblue"}},
		 {name: "red darkred", h:0, v:1, stops:{0:"red", 1:"darkred"}}];

// text color bar
var textColor = $(pcell).clone();
$(textColor).append('<div class="palette-cell-title">글자색:<div>');
for (i = 0; i < colors.length; i++) {
	c = document.createElement("div");
	c.setAttribute("class", "color-cell");
	$(c).html(colors[i]).on('mouseup', {color: colors[i]}, function(options) {
		activeObjectSet(options, function(obj) {obj.set("fill", options.data.color)});
	}).appendTo(textColor);
}
for (i = 0; i < gradients.length; i++) {
	g = document.createElement("div");
	g.setAttribute("class", "color-cell");
	$(g).html(gradients[i].name).on('mouseup', {gr: gradients[i]}, function(options) {
		actobj = canvas.getActiveObject();
		gr = options.data.gr;
		if (actobj) {
			actobj.setGradient('fill', {x1:0, y1:0, x2:actobj.width*gr.h, y2:actobj.height*gr.v, colorStops: gr.stops});
			canvas.renderAll();
		}
	}).appendTo(textColor);
}
$(textColor).appendTo("#palette");

//stroke color bar
var textColor = $(pcell).clone();
$(textColor).append('<div class="palette-cell-title">테두리색:<div>');
for (i = 0; i < colors.length; i++) {
	c = document.createElement("div");
	c.setAttribute("class", "color-cell");
	$(c).html(colors[i]).on('mouseup', {color: colors[i]}, function(options) {
		activeObjectSet(options, function(obj) {obj.set("stroke", options.data.color)});
	}).appendTo(textColor);
}
$(textColor).appendTo("#palette");

// Event for download btn
var link = document.getElementById("download-btn-a");
link.addEventListener('click', function(ev) {
	link.href = canvas.toDataURL();
	link.download = "mypainting.png";
}, false);


// Create image loader btn
document.getElementById('imgLoader').onchange = function handleImage(e) {
	var reader = new FileReader();
	reader.onload = function (event){
		var imgObj = new Image();
		imgObj.src = event.target.result;
		imgObj.onload = function () {
			var image = new fabric.Image(imgObj);
			canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas), {
				scaleX: canvas.width / image.width,
				scaleY: canvas.height / image.height,
				// Needed to position backgroundImage at 0/0
				originX: 'left',
				originY: 'top'
			});
		}
	}
	reader.readAsDataURL(e.target.files[0]);
}

// Set click event for template upload button
$('#upload').click(function(){
	$('#input-data').attr('value', JSON.stringify(canvas));
	$('#input-thumbnail').attr('value', canvas.toDataURL());
	$('#upload-tmpl-form').submit();
	alert("업로드되었습니다");
});

// Set first templete in canvas
if ($(".block-thumbnail").size()) {
	$(".block-thumbnail").get(-1).onclick();
}
