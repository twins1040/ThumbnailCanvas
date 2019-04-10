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
var SHORTCUT = true;


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
	var order = [".templates", ".objectView", ".saveAndDown", ".objectControl"];

	this.now = 0;
	this.nowSelector = function() {return order[this.now]};

	// Toolbox controlled ONLY with this function
	this.switchTo = function(opt) {
		var tmp = order.indexOf(opt);

		if (tmp < 0) {
			console.log("invalid class name");
			return;
		}

		this.now = tmp;
		og.addClass("hide");
		$(opt).removeClass("hide");

		// Toggle canvas enable/disable edit
		// use tmp, because class name can be changed
		if (tmp === 1 || tmp === 3) {
			melt();
		} else {
			freeze();
		}
		if (tmp === 0) {
			$("#toolBox").removeClass("col-md-4");
			$("#canvasBox").removeClass("col-md-8");
			$("#toolBox").addClass("col-md-6");
			$("#canvasBox").addClass("col-md-6");
		} else {
			$("#toolBox").removeClass("col-md-6");
			$("#canvasBox").removeClass("col-md-6");
			$("#toolBox").addClass("col-md-4");
			$("#canvasBox").addClass("col-md-8");

		}
	}

	this.switchToNum = function(n) {
		if (n < 0 || n >= order.length) {
			console.log("invalid index");
			return;
		}
		this.switchTo(order[n]);
	}

	this.nextBox = function() {
		var cnt = this.now;
		if (0 <= cnt && cnt < order.length - 1) {
			this.switchTo(order[cnt+1]);
		} else if (cnt == order.length - 1) {
			this.switchTo(order[0]);
		}
	}

	this.previousBox = function() {
		var cnt = this.now;
		if (1 <= cnt && cnt < order.length) {
			this.switchTo(order[cnt-1]);
		} else if (cnt == 0) {
			this.switchTo(order[order.length -1]);
		}
	}

	this.toggleDouble = function() {
		if (isDoubleText() || isAllDoubleText()) {
			$("#stroke2-text").addClass("hide");
			$("#stroke2-console").removeClass("hide");
		} else {
			$("#stroke2-text").removeClass("hide");
			$("#stroke2-console").addClass("hide");
		}
	}
}
// END OF CANVAS SETTINGS




// END OF PROTOTYPE WRAPPER



//
// FUNCTIONS
//
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
function deleteActiveObject() {
	activeObjectSet(function(obj) {canvas.remove(obj)});
	canvas.discardActiveObject();
	canvas.renderAll();
}
function setFirstActive() {
	var objs = canvas.getObjects();
	if (objs.length) {
		canvas.setActiveObject(objs[0]);
		if (isIText() || isDoubleText()) {
			Toolbox.toggleDouble();
			setTextAttrBox();
		}
		canvas.renderAll();
	}
}
function toggleLoadingPage() {
	var target = $("#loading-page");
	if (target.css("display") === "none") {
		target.css("display", "block");
	} else {
		target.css("display", "none");
	}
}
function freeze() {
	canvas.discardActiveObject();
	canvas.forEachObject(function(object){
		object.selectable = false;
		if (object.type === 'i-text') object.editable = false;
	}).renderAll();
	// TODO : remove hovering event to do not change cursor
};
function melt() {
	canvas.forEachObject(function(object){
		object.selectable = true;
		if (object.type === 'i-text') object.editable = true;
	}).renderAll();
};
// END OF FUNCTIONS



//
// EVENT HANDLERS
//
$("input[type='range']").mouseup(function() {
	// Prevent slider to add lots of history
	History.add();
});
$("#feedback-link").click(function() {
	if (confirm("저장하지 않은 내용을 잃게됩니다. 계속하시겠습니까?")) {
		$(this).attr('href', 'https://goo.gl/forms/iu1jmmQXXGoPz6If2');
	}
});
// END OF EVENT HANDLERS



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

	if (!SHORTCUT) {
		console.log("shortcut is off");
		return;
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
