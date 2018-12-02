var login_url = '/login/google-oauth2/';
var logout_url = '/logout/';
var sample_background_url = "static/img/blue_furniture_resize.jpg";

function isLogin() {
	var b = $("#switch-user").attr("data-user");

	if (b === "false") {
		return false;
	} else if (b === "true") {
		return true;
	} else {
		alert("invalid acess");
		return false;
	}
}

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
	var history_max_len = 50;
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


function load_template(json) {
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


function save_session(e, callback) {
	var token = $("input[name='csrfmiddlewaretoken']").attr("value");
	var jdata = canvas.toJSON();
	var tmpl_data = JSON.stringify(jdata);

	// Save session data
	$.post({
		url:'session/',
		data: {data: tmpl_data, csrfmiddlewaretoken: token},
		success: function() {
			if (callback) {callback()}
		}
	});
}


function restore_session(json) {
	var pjson = JSON.parse(json);

	canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
}

function clear_session() {
	var token = $("input[name='csrfmiddlewaretoken']").attr("value");

	// Send "" session data
	$.post({
		url:'session/',
		data: {data: "", csrfmiddlewaretoken: token},
	});
}


function set_background_image(src) {
	var imgObj = new Image();
	imgObj.src = src;
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


function add_image(src) {
	var imgObj = new Image();
	imgObj.src = src;
	imgObj.onload = function () {
		var image = new fabric.Image(imgObj);

		canvas.add(image);
		add_history();
	}
}


function group_align(direction, opt) {
	var options = ["left", "center", "right", "top", "bottom"];
	var directions = ["originX", "originY"];
	var actobj, key, value, distence;

	if (!options.includes(opt)) {
		return;
	}

	if (!directions.includes(direction)) {
		return;
	}

	actobj = canvas.getActiveObject();
	if (!actobj) {
		return;
	}

	if (actobj.type != 'activeSelection') {
		return;
	}

	if (direction === "originX") {
		distence = actobj.width/2;
		key = "left";

	} else if (direction === "originY") {
		distence = actobj.height/2;
		key = "top";
	}

	if (opt === "left" || opt === "top") {
		value = -distence;
	} else if (opt === "center") {
		value = 0;
	} else if (opt === "right" || opt === "bottom") {
		value = distence;
	}

	activeObjectSet(function(obj) {
		console.log(direction+opt+key+value);
		obj.set(direction, opt);
		obj.set(key, value);
	});
}



// Canvas start!!
var canvas = new fabric.Canvas('myCanvas');

canvas.setDimensions({width:1280, height:720}, {backstoreOnly:true});
canvas.selection = true;
canvas.on("object:modified", add_history);
canvas.on("mouse:up", function(opt) {console.log(opt)});

// Set values on text selection
function setTextAttr(_obj) {
	var obj;

	if (_obj.selected.length !== 1) {
		return;
	}

	obj = _obj.selected[0];

	fillHue.setColor(obj.fill);
	strokeHue.setColor(obj.stroke);
	$("#sliderFontSize").attr("value", obj.fontSize);
	$("#sliderTextStroke").attr("value", obj.strokeWidth);
}

canvas.on("selection:created", setTextAttr);
canvas.on("selection:updated", setTextAttr);

// Get value of slider and set text
$("#sliderFontSize").on("input", function() {
	var actobj = canvas.getActiveObject();
	actobj.fontSize = $(this).val();
	canvas.renderAll();
	console.log( $(this).val());
	add_history();
});
$("#sliderTextStroke").on("input", function() {
	var actobj = canvas.getActiveObject();
	actobj.strokeWidth = $(this).val();
	canvas.renderAll();
	add_history();
});

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

// For Add text
var sampleText = new fabric.IText("Double Click to edit!", {
	fontFamily: 'Noto Sans KR',
	fontSize: 50,
	fontWeight: 900,
	fill: 'white',
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
$("#btn-copy").click(function() {Copy(); Paste()});
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
var fillHue = new Huebee(fillElem, {setText:false});
var strokeHue = new Huebee(strokeElem, {setText:false});

fillHue.on('change', function(color) {
	if($(".huebee").length !== 0) {
		console.log('fill '+color);
		activeObjectSet(function(obj) {obj.set("fill", color)});
	}
});

strokeHue.on('change', function(color) {
	if($(".huebee").length !== 0) {
		console.log('stroke '+color);
		activeObjectSet(function(obj) {obj.set("stroke", color)});
	}
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
$("#download-btn-a").click(function(ev) {
	if (isLogin()) {
		// Download Image
		this.href = canvas.toDataURL();
		this.download = "mypainting.png";
	} else {
		alert("다운로드는 로그인 후 가능합니다.");
		save_session(null, function() {
			location.href = login_url;
		});
	}
});


$("#add-my-template").click(function(ev) {
	if (isLogin()) {
		// Upload template
		var jdata = canvas.toJSON();

		// Delete bg for data reduce
		jdata["backgroundImage"] = undefined;

		// Fill form, submit
		save_session(null, function() {
			$('#input-data').attr('value', JSON.stringify(jdata));
			$('#input-thumbnail').attr('value', canvas.toDataURL({multiplier:0.25}));
			$('#upload-tmpl-form').submit();
		});
	} else {
		alert("로그인 후 가능합니다.");
		save_session(null, function() {
			location.href = login_url;
		});
	}
});


// Create image loader btn
document.getElementById('imgLoader').onchange = function(e) {
	var reader = new FileReader();
	reader.onload = function (event){
		set_background_image(event.target.result);
	}
	reader.readAsDataURL(e.target.files[0]);
}


// Create clip loader btn
document.getElementById('clipLoader').onchange = function(e) {
	function readAndAdd(file) {
		if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
			var reader = new FileReader();

			reader.onload = function (event) {
				add_image(event.target.result);
			}
			reader.readAsDataURL(file);
		}
	}

	if (e.target.files) {
		[].forEach.call(e.target.files, readAndAdd);
	}
}

// Temp save button event
$('#temp-save').click(function() {
	save_session();
	alert("임시저장 되었습니다.");
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
	// First item is add template button
	if (i === 0) {
		return;
	}
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
			success:load_template
		});
	});

	// Set first templete in canvas
	// It needs to be here for fast loading
	// Try to get session data, if get, use it
	if (i === 1) {
		let _item = item;
		$.get("session/", function(json) {
			if (json === "") {
				set_background_image(sample_background_url);
				$(_item).click();
			} else {
				console.log("clear, load canvas");
				restore_session(json);
			}
		});
	}
});

$("#switch-user").click(function() {
	var href, txt;
	if (isLogin()) {
		if(confirm("데이터가 사라집니다. 계속하시겠습니까?")) {
			location.href = logout_url;
		}
	} else {
		save_session(null, function() {
			location.href = login_url;
		});
	}
});

$("#align-left").click(function() {
	group_align("originX", "left");
});

$("#align-vertical-center").click(function() {
	group_align("originX", "center");
});

$("#align-right").click(function() {
	group_align("originX", "right");
});

$("#align-top").click(function() {
	group_align("originY", "top");
});

$("#align-horizontal-center").click(function() {
	group_align("originY", "center");
});

$("#align-bottom").click(function() {
	group_align("originY", "bottom");
});

$("#addText").click(function() {
	sampleText.clone(function(clonedObj) {
		canvas.add(clonedObj);
		canvas.setActiveObject(clonedObj);
		add_history();
	});
});
