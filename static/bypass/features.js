//
// GLOBAL VARIABLES
//
var LOGIN_URL = '/login/google-oauth2/';
var LOGOUT_URL = '/logout/';
var DEFAULT_BACKGROUND_URL = "static/img/backgroundFirst.PNG";
var SAMPLE_BACKGROUND_URL = "static/img/art_back.jpg";
var HISTORY_MAX_LEN = 50;
var SLIDER_TO_1X = 20;
var FONTS = ["Noto Sans KR", "Nanum Gothic", "Nanum Myeongjo", "Hanna", "Poor Story",
			'Gothic A1 Regular', 'Gothic A1 Light', 'Gothic A1 Thin', 'TmonMonsori',
			'Cute Font', 'HANNA Pro', 'Black Han Sans',	'JUA', 'Swagger'];
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
		var snap = JSON.stringify(canvas.toJSON());

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
		load_template(_work_history[_history_head]);
		console.log('undo');
	}

	// Redo
	this.redo = function() {
		if (_history_head > 0) {
			_history_head -= 1;
		}
		load_template(_work_history[_history_head]);
		console.log('redo');
	}
}

var Toolbox = new function() {
	var wrapper = $("#pannels");
	var og = $(".block-option-group");
	var boxes = {
		background: [$("#loadBackground"), null],
		template: [$("#templates"), null],
		object: [$("#objectControl"), function() {
			setFirstActive();
			Toolbox.toggleDouble();
		}],
		save: [$("#saveAndDown"), null],
	};
	var order = ["background", "template", "object", "save"];

	this.toggleDouble = function() {
		if (isDoubleText() || isAllDoubleText()) {
			$("#stroke2-text").addClass("hide");
			$("#stroke2-console").removeClass("hide");
		} else {
			$("#stroke2-text").removeClass("hide");
			$("#stroke2-console").addClass("hide");
		}
	}

	this.add = function(opt) {
		var target = boxes[opt][0];
		var callback = boxes[opt][1];

		target.removeClass("hide");
		if (callback) callback();
	}

	this.switchTo = function(opt) {
		og.addClass("hide");
		this.add(opt);
	}

	// Send this value to session for restore
	this.currentBox = function() {
		var now = wrapper.children(":not(.hide)");
		var i = 0;
		var key = "";

		if (Array.isArray(now)) {
			console.log("wrong box");
			return -1;
		}

		for (i; i<order.length; i++) {
			key = order[i];
			if (boxes[key][0].attr("id") === now.attr("id")) return i;
		}

		console.log("wrong box2");
		return -1;
	}

	this.nextBox = function() {
		var cnt = this.currentBox();
		if (0 <= cnt && cnt < order.length - 1) {
			this.switchTo(order[cnt+1]);
		} else if (cnt == order.length - 1) {
			this.switchTo(order[0]);
		}
	}

	this.previousBox = function() {
		var cnt = this.currentBox();
		if (1 <= cnt && cnt < order.length) {
			this.switchTo(order[cnt-1]);
		} else if (cnt == 0) {
			this.switchTo(order[order.length -1]);
		}
	}

	this.jumpBoxTo = function(cnt) {
		if (cnt < 0) {
			console.log("wrong jump");
			return;
		}
		this.switchTo(order[cnt]);
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
// Attribute box control
canvas.on("mouse:up", function(){
	var obj = canvas.getActiveObject();
	// If text has extra stroke, it is 'group' not 'i-text'
	if (isIText(obj) || isDoubleText(obj)) {
		setTextAttrBox(obj);
	} else if (isMultipleSelected(obj)) {
	}
	Toolbox.toggleDouble();
	console.log("switch box");
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
	cornerSize: 40,
	borderScaleFactor: 10,	// controller border width
	padding: 8,
	cornerStyle: 'circle',
	isDoubleText: false,
	originX: 'center',
	originY: 'center',
});

// Remove middle point of controller
fabric.Object.prototype.setControlsVisibility({
	mb: false, ml: false, mr: false, mt: false
});

// Add method to match with DoubleText
Object.assign(fabric.IText.prototype, {
	setAllText: function(key, value) {
		this.set(key, value);
	},
	setUpper: function(key, value) {
		this.set(key, value);
	},
	getUpper: function(key) {
		return this.get(key);
	},
});

// Declare getter and setter of Text like types
Object.assign(fabric.Group.prototype, {
	setUpper: function(key, value) {
		if (!isDoubleText(this)) return;
		this.item(1).set(key, value);
		this.customSetCoords();
	},
	getUpper: function(key) {
		if (!isDoubleText(this)) return;
		return this.item(1).get(key);
	},
	setLower: function(key, value) {
		if (!isDoubleText(this)) return;
		this.item(0).set(key, value);
		this.customSetCoords();
	},
	getLower: function(key) {
		if (!isDoubleText(this)) return;
		return this.item(0).get(key);
	},
	setAllText: function(key, value) {
		if (!isDoubleText(this)) return;
		this.item(0).set(key, value);
		this.item(1).set(key, value);
		this.customSetCoords();
	},
	customSetCoords: function() {
		this.addWithUpdate();
		// to fix Fabric's bug
		// fabric's setCoords() is not for group of group
		if (this.group) {
			this.left -= this.group.left;
			this.top -= this.group.top;
		}
	},
});

fabric.Group.prototype.on("scaled", function(opt){
	opt.target._lastSelected = false;
});
fabric.Group.prototype.on("moved", function(opt){
	opt.target._lastSelected = false;
});
fabric.Group.prototype.on("mouseup", editExtraStroke);
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
		alert("잘못된 접근입니다");
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
	}, ['isDoubleText']);
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
	}, ['isDoubleText']);
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

function loadFontFromPJSON(pjson) {
	var result = [];
	var prom;
	// Find all font in json from decendants
	var recurse = function(obj) {
		for (var e in obj) {
			if (obj[e] instanceof Object) {
				recurse(obj[e]);
			} else {
				if (e === 'fontFamily' && !result.includes(obj[e])) {
					result.push(obj[e]);
				}
			}
		}
	}
	var loadFont = function(font) {
		var myfont = new FontFaceObserver(font);
		return myfont.load();
	}

	recurse(pjson);
	console.log(result);

	if (result.length === 0) {
		console.log("no font");
		prom = new Promise(function(resolve, reject) {reject()});
		return prom;
	}

	// Chaining All font loading sequences ex) p.then(f).then(f)....
	prom = loadFont(result.shift());
	for (var font in result) {
		prom = prom.then(function() {loadFont(font)});
	}

	return prom;
}

function load_template(json) {
	var pjson = JSON.parse(json);
	var items = pjson["objects"];

	canvas.forEachObject(function(t) {
		canvas.remove(t);
	});

	return loadFontFromPJSON(pjson).then(function() {
		fabric.util.enlivenObjects(items, function(objects) {
			canvas.renderOnAddRemove = false;
			objects.forEach(function(o) {
				if (isDoubleText(o)) o.customSetCoords();
				canvas.add(o);
			});
			canvas.renderOnAddRemove = true;
			canvas.renderAll();
		});
	});
}

function save_session(e, callback) {
	var obj = $("input[name='csrfmiddlewaretoken']");
	var token = obj && obj.attr('value');
	var jdata, tmpl_data, box_num;

	if (!token) {
		console.log("no token data");
		return;
	}

	jdata = canvas.toJSON();
	tmpl_data = JSON.stringify(jdata);
	// Error code -1 will also be passed
	box_num = Toolbox.currentBox();

	// Save session data
	$.post({
		url:'session/',
		data: {data: tmpl_data, csrfmiddlewaretoken: token, box_info: box_num},
		success: function() {
			if (callback) {callback()}
		}
	});
}

function restore_template(json) {
	var pjson = JSON.parse(json);
	var bg = pjson['backgroundImage'];
	if (bg) set_background_image(bg.src);
	load_template(json).then(function() {
		History.add();
	});
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
		var scale = (wRatio > hRatio) ? wRatio : hRatio;

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
function setTextAttrBox(obj) {
	if (!obj) obj = canvas.getActiveObject();
	if (!obj) {
		console.log("no active obj");
		return;
	}
	if (!isIText(obj) && !isDoubleText(obj)) {
		console.log("can't set box attr. it is not text");
		return;
	}

	// First line of attr box
	$("#sliderFontSize")[0].value = obj.scaleX * SLIDER_TO_1X;
	fillHue.setColor(obj.getUpper('fill'));

	// Second line of attr box
	$("#sliderTextStroke")[0].value = obj.getUpper('strokeWidth');
	strokeHue.setColor(obj.getUpper('stroke'));

	// Third line if it has double stroke
	if (isDoubleText(obj)) {
		$("#sliderTextStroke2")[0].value = obj.getLower('strokeWidth');
		strokeHue2.setColor(obj.getLower('stroke'));
	}

	// Fourth line of char spacing
	$("#sliderCharSpace")[0].value = obj.getUpper('charSpacing');
}

function isIText(obj) {
   if (!obj) obj = canvas.getActiveObject();
   return !!(obj && obj.type === "i-text");
}

function isMultipleSelected(obj) {
   if (!obj) obj = canvas.getActiveObject();
   return !!(obj && obj.type === "activeSelection");
}

function isDoubleText(obj) {
	if (!obj) obj = canvas.getActiveObject();
	return !!(obj && obj.type === "group");
}

// Return false if test one IText
function isAllIText(obj) {
	var i;
	if (!obj) obj = canvas.getActiveObject();
	if (!obj || obj.type !== 'activeSelection') return false;
	for (i=0; i<obj._objects.length; i++) {
		if (obj.item(i).type !== 'i-text') return false;
	}
	return true;
}

// Return false if test one doubleText
function isAllDoubleText(obj) {
	var i;
	if (!obj) obj = canvas.getActiveObject();
	if (!obj || obj.type !== 'activeSelection') return false;
	for (i=0; i<obj._objects.length; i++) {
		if (!isDoubleText(obj.item(i))) return false;
	}
	return true;
}

function addExtraStroke(actobj, _clonedObj) {
	var ret;

	if (!actobj) actobj = canvas.getActiveObject();
	if (!actobj || !isIText(actobj)) return;

	// Orign left, top -> center, center
	centeralize(actobj);

	if (!_clonedObj) {
		actobj.clone(function(obj) {
			obj.set({stroke: "green"});
			obj.strokeWidth += 16;
			clonedObj = obj;
		});
	} else {
		// _clonedObj must have absolute top, left
		_clonedObj.clone(function(obj) {
			clonedObj = obj;
			canvas.remove(_clonedObj);
		});
	}

	actobj.clone(function(clonedObjUpper) {
		var scale = clonedObjUpper.scaleX;
		let group;

		// Pass scale to Group
		clonedObjUpper.set({scaleX: 1, scaleY: 1});
		clonedObj.set({scaleX: 1, scaleY: 1});

		group = new fabric.Group([clonedObj, clonedObjUpper]);

		// If it is member of group, needs to find absolute coords
		if (actobj.group) {
			group.set({
				left: actobj.group.left + group.left,
				top: actobj.group.top + group.top,
			});
		}

		// Apply passed scale
		group.set({scaleX: scale, scaleY: scale});
		group.set("isDoubleText", true);

		canvas.remove(actobj).renderAll();
		canvas.add(group);

		History.add();

		ret = group;
	});

	return ret;
}

function editExtraStroke() {
	let actobj = canvas.getActiveObject();

	if (!isDoubleText(actobj)) return;

	if (!actobj._lastSelected) {
		actobj._lastSelected = true;
		// Group event needs to be offed
		// Group share hander (bug?)
		actobj.on("deselected", function() {
			actobj._lastSelected = false;
			actobj.off("deselected");
		});
		return;
	}

	// Prevent Scale Bug
	canvas.renderAll();

	actobj.item(0).clone(function(clonedObj0) {
		actobj.item(1).clone(function(clonedObj1) {
			var opt = {
				scaleX: actobj.item(0).scaleX * actobj.scaleX,
				scaleY: actobj.item(0).scaleY * actobj.scaleY,
				left: actobj.left,
				top: actobj.top,
			};

			clonedObj0.set(opt);
			clonedObj1.set(opt);

			canvas.remove(actobj);

			// Caustion: IText share event!!
			// It should be off after event exit
			clonedObj1.on("editing:exited", function() {
				addExtraStroke(clonedObj1, clonedObj0);
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

function loadAndUse(font, obj) {
	var myfont = new FontFaceObserver(font);
	return myfont.load()
		.then(function() {
			console.log(font + ' loaded');
			// when font is loaded, use it.
			obj.setAllText("fontFamily", font);
			canvas.requestRenderAll();
		}).catch(function(e) {
			console.log(e)
			alert('폰트 로딩이 느려 기본으로 대체합니다 :' + font);
		});
}

function centeralize(obj) {
	var crd = obj.aCoords;
	if (!obj) return;
	if (obj.originX !== 'center') {
		obj.originX = 'center';
		obj.set('left', obj.left + (crd.tr.x - crd.tl.x)/2);
	}
	if (obj.originY !== 'center') {
		obj.originY = 'center';
		obj.set('top', obj.top + (crd.bl.y - crd.tl.y)/2);
	}
	return;
}

function deleteActiveObject() {
	activeObjectSet(function(obj) {canvas.remove(obj)});
	canvas.discardActiveObject();
	canvas.renderAll();
}
function setFirstActive() {
	var objs = canvas.getObjects();
	if (objs.length) {
		canvas.setActiveObject(objs[0]);
		if (isIText() || isDoubleText()) setTextAttrBox();
		canvas.renderAll();
	}
}

// END OF FUNCTIONS



//
// EVENT HANDLERS
//
fillHue.on('change', function(color) {
	if($(".huebee").length !== 0) {
		activeObjectSet(function(obj) {
			obj.setUpper('fill', color);
		});
	}
});
strokeHue.on('change', function(color) {
	if($(".huebee").length !== 0) {
		activeObjectSet(function(obj) {
			obj.setUpper('stroke', color);
		});
	}
});
strokeHue2.on('change', function(color) {
	if($(".huebee").length !== 0) {
		activeObjectSet(function(obj) {
			if (obj.setLower) obj.setLower('stroke', color);
		});
	}
});
// DOM events
$("#btn-undo").click(History.undo);
$("#btn-redo").click(History.redo);
$(".js-btn-copy").click(function() {Copy(); Paste()});
$(".js-btn-delete").click(function(){
	deleteActiveObject();
});
$(".js-btn-edit").click(function() {
	var obj = canvas.getActiveObject();
	if (isIText(obj)) {
		obj.enterEditing();
		obj.selectAll();
	} else if (isDoubleText(obj)) {
		// Run twice, like double click
		editExtraStroke();
		editExtraStroke();
	}
});
$("#toggle-objctrl").click(function() {
	var target = $("#advanced-objctrl");
	if (target.hasClass("hide")) {
		target.removeClass("hide");
	} else {
		target.addClass("hide");
	}
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
	value = parseInt($(this).val()) / SLIDER_TO_1X;

	actobj.set("scaleX", value);
	actobj.set("scaleY", value);

	canvas.renderAll();
});
$("#sliderTextStroke").on("input", function() {
	var strVal = $(this).val();
	var value = parseInt(strVal);
	activeObjectSet(function(obj) {
		obj.setUpper('strokeWidth', value);
	});
});
$("#sliderTextStroke2").on("input", function() {
	var strVal = $(this).val();
	var value = parseInt(strVal);
	activeObjectSet(function(obj) {
		if (isDoubleText(obj)) obj.setLower('strokeWidth', value);
	});
});
$("#sliderCharSpace").on("input", function() {
	var strVal = $(this).val();
	var value = parseInt(strVal);
	activeObjectSet(function(obj) {
		obj.setAllText('charSpacing', value);
	});
});
$("#download-btn-a").click(function(ev) {
	if (isLogin()) {
		// Download Image
		var link=document.createElement('a');
		link.href=canvas.toDataURL();
		link.download="mypainting.png";
		link.click();
	} else {
		alert("로그인이 필요합니다");
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
		alert("로그인이 필요합니다");
		save_session(null, function() {
			location.href = LOGIN_URL;
		});
	}
});
// Thumbnail image loading and hook event
$(".block-thumbnail").each(function(i, item) {
	var token = $("input[name='csrfmiddlewaretoken']").attr("value");
	let id, img, icon, pjson;

	// Template id
	id = item.id.split('-')[1];

	// Load Image
	img = $(item).find('img')[0];
	$.ajax({
		url:'templates/'+id+'/thumbnail/',
		success:function(src) {
			$(img).attr("src", src);
		}
	});

	// Hook image click event
	$(img).click(function() {
		$.ajax({
			url:'templates/'+id+'/data/',
			success: restore_template,
		});
	});

	// Hook delete btn click event
	// Find icon <i> tag
	icon = $(item).find('i');
	if (icon) {
		icon.click(function() {
			if(confirm("정말 삭제하시겠습니까?")) {
				$.ajax({
					url:'templates/'+id+'/',
					type:'DELETE',
					beforeSend: function(xhr) {
						xhr.setRequestHeader("X-CSRFToken", token);
					},
					success:function() {
						location.href = '';
					}
				});
			}
		});
	}

	// Set first templete in canvas
	// It needs to be here for fast loading
	// Try to get session data, if get, use it
	if (i === 1) {
		$.get("session/", function(json) {
			if (json === "") {
				set_background_image(DEFAULT_BACKGROUND_URL);
				History.add();
			} else {
				pjson = JSON.parse(json);
				Toolbox.jumpBoxTo(pjson['box_info']);
				// Todo: clean up session data format
				restore_template(JSON.stringify(pjson['cdata']));
				console.log("restore session");
			}
		});
	}
});
$("#switch-user").click(function() {
	var href, txt;
	if (isLogin()) {
		if(confirm("데이터가 사라집니다 계속하시겠습니까?")) {
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
	Toolbox.nextBox();
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
$('#sampleLoader').click(function(e) {
	set_background_image(SAMPLE_BACKGROUND_URL);
	Toolbox.nextBox();
});
$("#stroke2-text").click(function(){
	var newObjs = [];
	var act;

	activeObjectSet(function(obj) {
		var obj2 = addExtraStroke(obj);
		newObjs.push(obj2);
	});

	// Discard empty selection, change to new one
	canvas.discardActiveObject();

	if (newObjs.length === 0) {
		console.log("try to set nothing to active");
		return;
	}

	if (newObjs.length === 1) {
		act = newObjs[0];
	} else {
		act = new fabric.ActiveSelection(newObjs, {canvas: canvas});
	}

	canvas.setActiveObject(act);
	canvas.requestRenderAll();

	$("#stroke2-text").addClass("hide");
	$("#stroke2-console").removeClass("hide");
	setTextAttrBox();
});
$("input[type='range']").mouseup(function() {
	// Prevent slider to add lots of history
	History.add();
});
$("#addImage").click(function(){

	$(".btn-tool").removeClass("active");
	$(this).addClass("active");
	Toolbox.switchTo("image")

});
$("#selectTemplate").click(function(){
	$(".btn-tool").removeClass("active");
	$(this).addClass("active");
	Toolbox.switchTo("template")
});
$(".js-next-step").click(function() {
	Toolbox.nextBox();
});
$(".js-previous-step").click(function() {
	Toolbox.previousBox();
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
			loadAndUse(font, obj).then(function() {
				History.add();
			});
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

	//console.log('key: '+e.which);

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
		deleteActiveObject();
	} else if (e.which === 67 && isCtrlKey()) {
		Copy();
	} else if (e.which === 86 && isCtrlKey()) {
		Paste();
	}
});
// END OF EDIT DOM ELEMENTS
