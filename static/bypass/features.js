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

// Work history
var add_history;
var redo_work;
var undo_work;

(function() {
	var work_history = [];
	var history_max_len = 20;
	var history_head = 0;

	add_history = function() {
		snap = JSON.stringify(canvas);
		// Make head 0
		while (history_head !=0) {
			console.log("while");
			work_history.shift();
			history_head -= 1;
			console.log(history_head);
		}
		work_history.unshift(snap);
		if (work_history.length > history_max_len) {
			work_history.pop();
		}
		console.log("modified");
	}

	// Undo
	undo_work = function() {
		console.log('undo');
		if (history_head < work_history.length - 1) {
			history_head += 1;
		}
		canvas.loadFromJSON(work_history[history_head]);
	}

	// Redo
	redo_work = function() {
		console.log('redo');
		if (history_head > 0) {
			history_head -= 1;
		}
		canvas.loadFromJSON(work_history[history_head]);
	}
})();

function activeObjectSet(callback) {
	var actobj = canvas.getActiveObject();

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
canvas.on("object:modified", add_history);
canvas.on("mouse:up", function(opt) {console.log(opt)});


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
var ubuntuText = new fabric.IText("템플릿을 골라보세요!", {
	fontFamily: 'Noto Sans KR',
	fontSize: 100,
	fontWeight: 900,
	fill: '#F00',
	stroke: 'black',
	strokeWidth:20,
	paintFirst: 'stroke',
	charSpacing: -100,
	angle:  0,
	top: canvas.height/2,
	left: canvas.width/2,
	originX: 'center',
	originY: 'center',
});

canvas.add(ubuntuText);


// Button event except color picker
$("#btn-undo").click(undo_work);
$("#btn-redo").click(redo_work);
$("#btn-copy").click(Copy);
$("#btn-paste").click(Paste);
$("#btn-delete").click(function(){
	activeObjectSet(function(obj) {canvas.remove(obj)});
});
$("#stroke-thicker").click(function() {
	activeObjectSet(function(obj){obj.set("strokeWidth", obj.strokeWidth+4)});
});
$("#stroke-thinner").click(function() {
	activeObjectSet(function(obj){
		step = 4;
		if (obj.strokeWidth >= 4) {
			obj.set("strokeWidth", obj.strokeWidth-4);
		}
	});
});
$("#stroke-delete").click(function() {
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
	$(e).click(function() {
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

			add_history();
		}
	}
	reader.readAsDataURL(e.target.files[0]);
}


// Set click event for template upload button
$('#upload').click(function(){
	if ($("#switch-user").attr("data-user") === "") {
		alert("저장은 로그인 후 가능합니다.\n우선 다운로드하세요.");
	} else {
		var jdata = canvas.toJSON();

		// Delete bg for data reduce
		jdata["backgroundImage"] = undefined;

		$('#input-data').attr('value', JSON.stringify(jdata));
		$('#input-thumbnail').attr('value', canvas.toDataURL({multiplier:0.25}));
		$('#upload-tmpl-form').submit(function(){
			alert("내 템플릿을 저장했습니다");
		}).submit();
	}
});


// Scroll evented
/*
$(window).scroll(function(){
   var s = $(window).scrollTop();
   var b = $(".block-canvas");
   if ( s > 100 ) {
	   b.addClass("sticky-header");
   } else {
	   b.removeClass("sticky-header");
   }
});
*/


// Key Binding
$(window).keydown(function(e){
	var actobj = canvas.getActiveObject();

	console.log('key: '+e.which);

	// Prevent conflict with IText key shortcut
	// If type:group, it is not being edited
	if (actobj && actobj.type == 'i-text') {
		if (actobj.isEditing) {
			console.log("now editing");
			return;
		}
	}

	// Bind with key code
	if(e.which === 90 && e.ctrlKey) {
		(e.shiftKey) ? redo_work() : undo_work();
	} else if (e.which === 46) {
		activeObjectSet(function(obj) {canvas.remove(obj)});
	} else if (e.which === 67 && e.ctrlKey) {
		Copy();
	} else if (e.which === 86 && e.ctrlKey) {
		Paste();
	}
});

// Thumbnail image loading and hook event
$(".block-thumbnail").each(function(i, item) {
	// Template id
	let id = item.id.split('-')[1];
	console.log(id);

	// Load Image
	let img = $(item).find('img')[0];
	$.ajax({
		url:'templates/'+id+'/thumbnail/',
		success:function(src) {
			$(img).attr("src", src);
		}
	});

	// Hook event
	$(item).click(function() {
		$.ajax({
			url:'templates/'+id+'/data/',
			success:function(json) {
				var pjson = JSON.parse(json);
				var items = pjson["objects"];

				canvas.forEachObject(function(t) {
					canvas.remove(t);
				});

				fabric.util.enlivenObjects(items, function(objects) {
					canvas.renderOnAddRemove = false;
					objects.forEach(function(o) {
						canvas.add(o);
					});
					canvas.renderOnAddRemove = true;
					canvas.renderAll();
				});

				add_history();
			}
		});
	});

	// Set first templete in canvas
	if (i === 0) {
		$(item).click();
	}
});
