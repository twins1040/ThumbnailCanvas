//
// GLOBAL VARIABLES
//
var LOGIN_URL = '/login/google-oauth2/';
var LOGOUT_URL = '/logout/';
var SAMPLE_BACKGROUND_URL = "static/img/blue_furniture_resize.jpg";
var HISTORY_MAX_LEN = 50;
var FONTS = ["Noto Sans KR", "Nanum Gothic", "Nanum Myeongjo", "Hanna", "Poor Story"];
var GRADIENTS = [{name: "red orange", h:0, v:1, stops:{0:"red", 1:"orange"}},
				 {name: "blue darkblue", h:0, v:1, stops:{0:"blue", 1:"darkblue"}},
				 {name: "red darkred", h:0, v:1, stops:{0:"red", 1:"darkred"}}];

var canvas = new fabric.Canvas('myCanvas');

// Color picker
var fillElem = $("#fill-hueb")[0];
var strokeElem = $("#stroke-hueb")[0];
var strokeElem2 = $("#stroke2-hueb")[0];
var fillHue = new Huebee(fillElem, {setText:false});
var strokeHue = new Huebee(strokeElem, {setText:false});
var strokeHue2 = new Huebee(strokeElem2, {setText:false});

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

var History = new function() {
	var _work_history = [];
	var _history_head = 0;

	this.add = function() {
		var snap = JSON.stringify(canvas);

		// Make head 0
		while (_history_head !=0) {
			_work_history.shift();
			_history_head -= 1;
		}

		_work_history.unshift(snap);

		if (_work_history.length > HISTORY_MAX_LEN) {
			_work_history.pop();
		}

		console.log("add history");
	}

	// Undo
	this.undo = function() {
		if (_history_head < _work_history.length - 1) {
			_history_head += 1;
		}

		canvas.loadFromJSON(_work_history[_history_head]);

		console.log('undo');
	}

	// Redo
	this.redo = function() {
		if (_history_head > 0) {
			_history_head -= 1;
		}

		canvas.loadFromJSON(_work_history[_history_head]);

		console.log('redo');
	}
}
// END OF GLOBAL VARIABLES



//
// CANVAS SETTINGS
//
canvas.setDimensions({width:1280, height:720}, {backstoreOnly:true});
canvas.selection = true;

canvas.on("mouse:up", function(opt) {
	console.log(opt.target);
});
canvas.on("object:modified", History.add);
// END OF CANVAS SETTINGS



//
// PROTOTYPE WRAPPER
//

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
	isDoubleText: false,
});

// Remove middle point of controller
fabric.Object.prototype.setControlsVisibility({
	mb: false, ml: false, mr: false, mt: false
});

// Declare getter and setter of Text like types
Object.assign(fabric.IText.prototype, {
	getColor: function() {
		return this.fill;
	},
	getStroke: function() {
		return this.stroke;
	},
	setStroke: function(fill) {
		this.set("stroke", fill);
	},
	getStrokeWidth: function() {
		return this.strokeWidth;
	},
	setStrokeWidth: function(width) {
		this.set("strokeWidth", width);
	},
});
Object.assign(fabric.Group.prototype, {
	getColor: function() {
		if (!this.isDoubleText) return;
		return this.item(1).fill;
	},
	setColor: function(color) {
		if (!this.isDoubleText) return;
		this.item(1).setColor(color);
	},
	getStroke: function() {
		if (!this.isDoubleText) return;
		return this.item(1).stroke;
	},
	setStroke: function(fill) {
		if (!this.isDoubleText) return;
		this.item(1).set("stroke", fill);
	},
	getStrokeWidth: function() {
		if (!this.isDoubleText) return;
		return this.item(1).strokeWidth;
	},
	setStrokeWidth: function(width) {
		if (!this.isDoubleText) return;
		this.item(1).set("strokeWidth", width);
	},

	// Stroke2 start
	getStroke2: function() {
		if (!this.isDoubleText) return;
		return this.item(0).stroke;
	},
	setStroke2: function(fill) {
		if (!this.isDoubleText) return;
		this.item(0).set("stroke", fill);
	},
	getStroke2Width: function() {
		if (!this.isDoubleText) return;
		return this.item(0).strokeWidth;
	},
	setStroke2Width: function(width) {
		if (!this.isDoubleText) return;
		this.item(0).set("strokeWidth", width);
	},
});

fabric.Group.prototype.on("scaled", function(opt){
	opt.target._lastSelected = false;
});
fabric.Group.prototype.on("moved", function(opt){
	opt.target._lastSelected = false;
});
fabric.Group.prototype.on("mouseup", editExtraStroke);

fabric.IText.prototype.on("selected", function() {
	setTextAttrBox();
});

fabric.Group.prototype.on("selected", function() {
	if (hasExtraStroke()) setTextAttrBox();
});
// END OF PROTOTYPE WRAPPER



//
// FUNCTIONS
//

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
		History.add();
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

	History.add();
}

function save_session(e, callback) {
	var obj = $("input[name='csrfmiddlewaretoken']");
	var token = obj && obj.attr('value');
	var jdata, tmpl_data;

	if (!token) {
		console.log("no token data");
		return;
	}

	jdata = canvas.toJSON();
	tmpl_data = JSON.stringify(jdata);

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

		History.add();
	}
}

function add_image(src) {
	var imgObj = new Image();
	imgObj.src = src;
	imgObj.onload = function () {
		var image = new fabric.Image(imgObj);

		canvas.add(image);
		History.add();
	}
}

function group_align(axis, align) {
	var actobj = canvas.getActiveObject();
	var opts, origin, distence;

	if (!actobj || actobj.type != 'activeSelection') {
		console.log("no actobj");
		return;
	}

	opts = {originX:{key: "left",
		             left: -actobj.width/2,
					 center: 0,
					 right: actobj.width/2},
			originY:{key: "top",
				     top: -actobj.height/2,
					 center: 0,
					 bottom: actobj.height/2}}

	origin = opts[axis];

	if (!origin || origin[align] == null) {
		console.log("wrong args");
		return;
	}

	activeObjectSet(function(obj) {
		obj.set(axis, align);
		obj.set(origin['key'], origin[align]);
	});
}

// set values on text selection
function setTextAttrBox() {
	var obj = canvas.getActiveObject();

	if(!obj) {
		return
	}

	// First line of attr box
	$("#sliderFontSize")[0].value = obj.scaleX * 20;
	fillHue.setColor(obj.getColor());

	// Second line of attr box
	$("#sliderTextStroke")[0].value = obj.getStrokeWidth();
	strokeHue.setColor(obj.getStroke());

	// Third line if it has double stroke
	if (hasExtraStroke()) {
		$("#sliderTextStroke2")[0].value = obj.getStroke2Width();
		strokeHue2.setColor(obj.getStroke2());
	}
}

function isTextSelected() {
   var obj = canvas.getActiveObject();
   return !!(obj && obj.type === "i-text");
}

function isMultipleSelected() {
   var obj = canvas.getActiveObject();
   return !!(obj && obj.type === "activeSelection");
}

function addExtraStroke(_clonedObj) {
	let actobj = canvas.getActiveObject();
	if (!actobj) {
		return;
	}

	if (actobj.type !== "i-text") {
		console.log("addExtraStroke: it is not i-text");
		return;
	}

	if (!_clonedObj) {
		console.log("no attr");
		actobj.clone(function(obj) {
			obj.set({stroke: "green"});
			obj.strokeWidth += 16;
			clonedObj = obj;
		});
	} else {
		console.log("attr");
		_clonedObj.clone(function(obj) {
			clonedObj = obj;
			canvas.remove(_clonedObj);
		});
	}

	actobj.clone(function(clonedObjUpper) {
		var scale = clonedObjUpper.scaleX;
		var coords = clonedObj.aCoords.tl;
		let group;

		// Pass scale to Group
		clonedObjUpper.set({scaleX: 1, scaleY: 1});
		clonedObj.set({scaleX: 1, scaleY: 1});

		group = new fabric.Group([clonedObj, clonedObjUpper]);

		// Context of objects now Group, centerize
		group.forEachObject(function(obj){
			obj.set({
				originX: "center",
				originY: "center",
				left: 0,
				top: 0,
			});
		});

		// Apply passed scale
		// Because of Bug, reset left and top
		group.set({scaleX: scale, scaleY: scale});
		group.set({left: coords.x, top: coords.y});
		group.set("isDoubleText", true);

		group.on("deselected", function() {
			group._lastSelected = false;
		});

		canvas.remove(actobj).renderAll();
		canvas.add(group);

		History.add();

		canvas.setActiveObject(group);
	});
}

function editExtraStroke() {
	var actobj = canvas.getActiveObject();

	if (!hasExtraStroke()) {
		return;
	}

	if (!actobj._lastSelected) {
		actobj._lastSelected = true;
		return;
	}

	// Prevent Scale Bug
	canvas.renderAll();

	actobj.item(0).clone(function(clonedObj0) {
		actobj.item(1).clone(function(clonedObj1) {
			var opt = {
				originX: "center",
				originY: "center",
				scaleX: actobj.item(0).scaleX * actobj.scaleX,
				scaleY: actobj.item(0).scaleY * actobj.scaleY,
				left: actobj.left + actobj.width/2 * actobj.scaleX,
				top: actobj.top + actobj.height/2 * actobj.scaleY,
			};

			clonedObj0.set(opt);
			clonedObj1.set(opt);

			canvas.remove(actobj);

			// Caustion: IText share event!!
			// It should be off after event exit
			clonedObj1.on("editing:exited", function() {
				addExtraStroke(clonedObj0);
				clonedObj1.off("changed");
				clonedObj1.off("editing:exited");
			});

			clonedObj1.on("changed", function() {
				clonedObj0.set("text", this.text);
				canvas.renderAll();
			});

			canvas.add(clonedObj0);
			canvas.add(clonedObj1);

			// It should be active before enterEditing
			canvas.setActiveObject(clonedObj1);
			clonedObj1.enterEditing();
			clonedObj1.selectAll();
		});
	});
}

function hasExtraStroke() {
	var obj = canvas.getActiveObject();

	if (!obj) {
		//console.log("hasExtraStroke error!!");
		return false;
	}

	return obj.type === "group";
}

function setExtraStroke(obj, options) {
	if (!hasExtraStroke()) {
		console.log("it is not extra stroke!");
		return;
	}

	obj.item(0).set(options);
	canvas.renderAll();
}
// END OF FUNCTIONS



//
// EVENT HANDLERS
//
fillHue.on('change', function(color) {
	if($(".huebee").length !== 0) {
		activeObjectSet(function(obj) {
			if (obj.setColor) obj.setColor(color);
		});
	}
});
strokeHue.on('change', function(color) {
	if($(".huebee").length !== 0) {
		activeObjectSet(function(obj) {
			if (obj.setStroke) obj.setStroke(color);
		});
	}
});
strokeHue2.on('change', function(color) {
	if($(".huebee").length !== 0) {
		activeObjectSet(function(obj) {
			if (obj.setStroke2) obj.setStroke2(color);
		});
	}
});
// DOM events
$("#btn-undo").click(History.undo);
$("#btn-redo").click(History.redo);
$("#btn-copy").click(function() {Copy(); Paste()});
$("#btn-delete").click(function(){
	activeObjectSet(function(obj) {canvas.remove(obj)});
});
$("#stroke-delete").click(function() {
	activeObjectSet(function(obj){obj.set("strokeWidth", 0)});
});
// Get value of slider and set text
$("#sliderFontSize").on("input", function() {
	var actobj = canvas.getActiveObject();
	var value;

	if (!actobj) {
		return;
	}

	// slider is 0 ~ 100
	// max is x5
	value = $(this).val() / 20;

	actobj.set("scaleX", value);
	actobj.set("scaleY", value);

	canvas.renderAll();
	History.add();
});
$("#sliderTextStroke").on("input", function() {
	var actobj = canvas.getActiveObject();

	actobj.setStrokeWidth($(this).val());
	canvas.renderAll();
	History.add();
});
$("#sliderTextStroke2").on("input", function() {
	var actobj = canvas.getActiveObject();

	if (hasExtraStroke()) {
		actobj.setStroke2Width($(this).val());
		canvas.renderAll();
		History.add();
	}
});
$("#download-btn-a").click(function(ev) {
	if (isLogin()) {
		// Download Image
		this.href = canvas.toDataURL();
		this.download = "mypainting.png";
	} else {
		alert("Please Log In");
		save_session(null, function() {
			location.href = LOGIN_URL;
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
		alert("Please Log In");
		save_session(null, function() {
			location.href = LOGIN_URL;
		});
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
				set_background_image(SAMPLE_BACKGROUND_URL);
				$(_item).click();
			} else {
				console.log("restore session");
				restore_session(json);
			}
		});

		History.add();
	}
});
$("#switch-user").click(function() {
	var href, txt;
	if (isLogin()) {
		if(confirm("Data will be removed, continue?")) {
			location.href = LOGOUT_URL;
		}
	} else {
		save_session(null, function() {
			location.href = LOGIN_URL;
		});
	}
});
$("#align-left").click(function() {group_align("originX", "left")});
$("#align-vertical-center").click(function() {group_align("originX", "center")});
$("#align-right").click(function() {group_align("originX", "right")});
$("#align-top").click(function() {group_align("originY", "top")});
$("#align-horizontal-center").click(function() {group_align("originY", "center")});
$("#align-bottom").click(function() {group_align("originY", "bottom")});
$("#addText").click(function() {
	sampleText.clone(function(clonedObj) {
		canvas.add(clonedObj);
		canvas.setActiveObject(clonedObj);
		History.add();
	});
});
$('#imgLoader').on('change', function(e) {
	var reader = new FileReader();

	reader.onload = function (event){
		set_background_image(event.target.result);
	}

	reader.readAsDataURL(e.target.files[0]);
});
$('#clipLoader').on('change', function(e) {
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
});
$("#stroke2-text").click(function(){
	addExtraStroke();
	setTextAttrBox();
	$("#stroke2-text").addClass("hide");
	$("#stroke2-console").removeClass("hide");
});
// END OF EVENT HANDLERS




//
// EDIT DOM ELEMENTS
//
// Font selector
FONTS.forEach(function(font) {
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

// Key Binding
$(window).keydown(function(e){
	var actobj = canvas.getActiveObject();

	function isCtrlKey() {
		// metaKey is Mac command key
		return e.ctrlKey || e.metaKey;
	}

	function isDeleteKey() {
		// 8 is Backspace Key
		return e.which === 46 || e.which === 8;
	}

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
	if(e.which === 90 && isCtrlKey()) {
		(e.shiftKey) ? History.redo() : History.undo();
	} else if (isDeleteKey()) {
		activeObjectSet(function(obj) {canvas.remove(obj)});
	} else if (e.which === 67 && isCtrlKey()) {
		Copy();
	} else if (e.which === 86 && isCtrlKey()) {
		Paste();
	}
});

// Initail text
(function() {
	var ubuntuText = new fabric.IText("Select Your Template!", {
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
})();

// Option group Controll by kk
(function() {
	var og = $(".block-option-group");
	var ai = $("#addImageOptions");
	var tm = $("#templates");
	var txt = $("#settingText");
	var al = $("#alignItems");
	var textSelect = false;

	$("#addImage").click(function(){
	   og.addClass("hide");
	   if( $(this).hasClass("btn-active") ){
		  tm.removeClass("hide");
	   } else {
		  ai.removeClass("hide");
	   }
	});

	canvas.on("mouse:up", function(obj){
	   og.addClass("hide");

	   // If text has extra stroke, it is 'group' not 'i-text'
	   if (isTextSelected()) {
			$("#stroke2-text").removeClass("hide");
			$("#stroke2-console").addClass("hide");
			txt.removeClass("hide");
	   } else if (hasExtraStroke()) {
			$("#stroke2-text").addClass("hide");
			$("#stroke2-console").removeClass("hide");
			txt.removeClass("hide");
	   } else if (isMultipleSelected()) {
		  al.removeClass("hide");
	   } else {
		  tm.removeClass("hide");
	   }
	});
})();
// END OF EDIT DOM ELEMENTS
