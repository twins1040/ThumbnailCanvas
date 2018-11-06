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


// Example for initial canvas
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
console.log(fillElem);
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


// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('youtube-player', {
		videoId: 'qV09ywqrSfY',
	});
}

// Load new video
$("#youtube-url-button").click(function() {
	player.loadVideoById($("#youtube-url").val(), 0, "large");
});
