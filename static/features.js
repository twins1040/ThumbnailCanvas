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

// Work history function
var work_history = [];
var history_len = 20;
var history_head = 0;

function add_history() {
	snap = JSON.stringify(canvas);
	// Make head 0
	while (history_head !=0) {
		console.log("while");
		work_history.shift();
		history_head -= 1;
		console.log(history_head);
	}
	work_history.unshift(snap);
	if (work_history.length > history_len) {
		work_history.pop();
	}
	console.log("modified");
}

function click_template(json) {
	console.log("click_template");
	canvas.loadFromJSON(json, add_history);
}


function activeObjectSet(callback) {
	actobj = canvas.getActiveObject();

	if (actobj) {
		if (actobj.type == 'activeSelection') {
			actobj.forEachObject(function(obj){
				callback(obj);
			});
		} else {
			callback(actobj);
		}
		canvas.renderAll();
		// Save work history
		add_history();
	}
}



// Canvas start!!
var canvas = new fabric.Canvas('myCanvas');

canvas.setDimensions({width:1280, height:720}, {backstoreOnly:true});
canvas.selection = true;
// Save work history
canvas.on("object:modified", add_history);

canvas.on('mouse:up', function(opt) {console.log(opt)});


// Controller design setting
fabric.Object.prototype.set({
	transparentCorners: false,
	cornerColor: 'white',
	cornerStrokeColor: "#69F",
	borderColor: "#69F",
	cornerSize: 20,
	borderScaleFactor: 4,	// controller border width
	padding: 2,
	cornerStyle: 'circle',
});

// Remove middle point of controller
fabric.Object.prototype.setControlsVisibility({
	mb: false, ml: false, mr: false, mt: false
});


// Example for initial canvas
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


// Button event except color picker
$("#btn-copy").on('mouseup', Copy);
$("#btn-paste").on('mouseup', Paste);
$("#btn-delete").on('mouseup', function(){
	activeObjectSet(function(obj) {canvas.remove(obj)});
});
$("#stroke-thicker").on('mouseup', function() {
	activeObjectSet(function(obj){obj.set("strokeWidth", obj.strokeWidth+4)});
});
$("#stroke-thinner").on('mouseup', function() {
	activeObjectSet(function(obj){
		step = 4;
		if (obj.strokeWidth >= 4) {
			obj.set("strokeWidth", obj.strokeWidth-4);
		}
	});
});
$("#stroke-delete").on('mouseup', function() {
	activeObjectSet(function(obj){obj.set("strokeWidth", 0)});
});

var gradients = [{name: "red orange", h:0, v:1, stops:{0:"red", 1:"orange"}},
		 {name: "blue darkblue", h:0, v:1, stops:{0:"blue", 1:"darkblue"}},
		 {name: "red darkred", h:0, v:1, stops:{0:"red", 1:"darkred"}}];


// Color picker event
var fillElem = $("#fill-hueb")[0];
var strokeElem = $("#stroke-hueb")[0];
var fillHue = new Huebee(fillElem, {});
var strokeHue = new Huebee(strokeElem, {});

fillHue.on('change', function(color) {
	console.log('fill '+color);
	activeObjectSet(function(obj) {obj.set("fill", color)});
});

strokeHue.on('change', function(color) {
	console.log('stroke '+color);
	activeObjectSet(function(obj) {obj.set("stroke", color)});
});

// Font selector
var fonts = ["Noto Sans KR", "Nanum Gothic", "Nanum Myeongjo", "Hanna", "Poor Story"];
fonts.forEach(function(font) {
	e = document.createElement('a');
	$(e).addClass("dropdown-item");
	$(e).addClass("dropdown-item-font");
	$(e).html(font);
	$(e).on('mouseup', function() {
		activeObjectSet(function(obj) {
			obj.set("fontFamily", font);
		});
	});
	$("#font-dropdown-menu").append(e);
});


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
			var wRatio = canvas.width / image.width;
			var hRatio = canvas.height / image.height;
			var scale = (wRatio > hRatio) ? hRatio : wRatio;

			canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas), {
				scaleX: scale,
				scaleY: scale,
				top: canvas.height / 2,
				left: canvas.width / 2,
				originX: 'center',
				originY: 'center'
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
	alert("내 템플릿을 저장했습니다");
});


// Set first templete in canvas
if ($(".block-thumbnail").length) {
	$(".block-thumbnail").get(0).onclick();
}


// Undo


$("#btn-undo").click(function() {
	console.log('undo');
	if (history_head < work_history.length - 1) {
		history_head += 1;
	}
	canvas.clear()
	canvas.loadFromJSON(work_history[history_head]);
});

// Redo
$("#btn-redo").click(function() {
	console.log('redo');
	if (history_head > 0) {
		history_head -= 1;
	}
	canvas.clear()
	canvas.loadFromJSON(work_history[history_head]);
});


//scroll evented
$(window).scroll(function(){
   var s = $(window).scrollTop();
   var b = $(".block-canvas");
   if ( s > 100 ) {
	   b.addClass("sticky-header");
   } else {
	   b.removeClass("sticky-header");
   }
});
