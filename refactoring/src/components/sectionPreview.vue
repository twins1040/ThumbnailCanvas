<template>
  <section id="section-preview">
    <div class="container">

      <!-- <div class="outer" id="cover-wrapper">
        <div class="inner" id="cover">
          <div class="container">
            <i class="material-icons">add_photo_alternate</i><br>
            여기를 눌러 배경 이미지를 불러오세요
          </div>
        </div>
      </div> -->
      <div class="outer" id="preview-wrapper">
        <canvas class="inner" id="preview"></canvas>
      </div>

    </div>
  </section>
</template>
<script>
import $ from "jquery";
import Fabric from "fabric";
import FontFaceObserver from "fontfaceobserver";
import { mapMutations, mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      editingData: 'GET_SELECTED_NODES',
      vuexCanvas: 'GET_CANVAS',
    }),
  },
  methods: {
    ...mapMutations({
      updateCanvas: 'UPDATE_CANVAS',
    })
  },
  mounted(){

//
// GLOBAL VARIABLES
//

var HOST = this.$store.state.config.API_URL;
var LOGIN_URL = HOST+'/login/google-oauth2/';
var LOGOUT_URL = HOST+'/logout/';

// if local storage has canvas data, load
var canvas = new fabric.Canvas( "preview" );
if( this.vuexCanvas !== {} ){
  canvas.loadFromJSON( this.vuexCanvas, () => canvas.renderAll.call(canvas) );
}
this.updateCanvas(canvas);

var sampleText = new fabric.IText("Double Click to edit!", {
  fontFamily: 'Noto Sans KR',
  fontSize: 50,
  fontWeight: 900,
  fill: '#192930',
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

var sampleText2 = new fabric.IText("NONONO!", {
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
// use '=>' to inherit parent's this

var setSelectedNodes = (event) => {
  canvas.on(event, () => {
    var _nodes = [];
    var objs = canvas.getActiveObjects();

    // do not use Object.keys().length. objs is array of objects.
    // if (objs.length === 0) console.log("no active obj");

    objs.forEach( o => {
      var ed = {};
      var _strokes = [];

      if (isText(o)) {
        _strokes.push({
          color : o.getUpper('stroke'),
          width : o.getUpper('strokeWidth'),
        });

        if (isDoubleText(o)) {
          _strokes.push({
            color : o.getLower('stroke'),
            width : o.getLower('strokeWidth'),
          });
        }

        ed = {
          type          : 'text',
          text          : o.getUpper('text'),
          fontFamily    : o.getUpper('fontFamily'),
          fill          : o.getUpper('fill'),
          scale         : o.scaleX, // assume scaleX and scaleY is same
          charSpacing   : o.getUpper('charSpacing'),
          strokes       : _strokes,
        };
      } else {
        ed = {
          type          : 'undef',
          url           : "",
          text          : "",
          fontFamily    : "",
          fill          : "",
          scale         : 1, // assume scaleX and scaleY is same
          charSpacing   : 0,
          strokes       : [],
        };
      }

      _nodes.push(ed);
    });
    this.$store.commit( "SET_SELECTED_NODES", _nodes );
  });
};

//
// END OF GLOBAL VARIABLES
//


//
// CANVAS SETTINGS
//

canvas.setDimensions({ width: 1280, height:720 }, { backstoreOnly:true });
canvas.selection = true;
canvas.add(sampleText);
canvas.add(sampleText2);
sampleText.clone((obj) => canvas.add(obj));


// Get editingData
this.$watch( "editingData", dataList => {
  var objs = canvas.getActiveObjects();
  objs.forEach( (o, i) => {
    var data = dataList[i];
    if ( data === undefined ) throw new Error("missmatch between data and objs");
    if ( data.type === 'text' && isText(o) ) {
      o.setAllText('text', data.text);
      o.setUpper('fontFamily', data.fontFamily);
      o.setUpper('fill', data.fill);
      o.set('scaleX', data.scale);
      o.set('scaleY', data.scale);
      o.setAllText('charSpacing', data.charSpacing);
      o.setUpper('stroke', data.strokes[0].color);
      o.setUpper('strokeWidth', data.strokes[0].width);
      if (isDoubleText(o)) {
        o.setLower('stroke', data.strokes[1].color);
        o.setLower('strokeWidth', data.strokes[1].width);
      }
    } else {
      // console.log("set data of undef");
    }
  } );
  canvas.renderAll();
}, { deep: true });

// Set editingData
canvas.on("mouse:up", (opt) => {
	// console.log(opt.target);
});
setSelectedNodes("object:modified");
setSelectedNodes("selection:cleared");
setSelectedNodes("selection:updated");
setSelectedNodes("selection:created");

// Remove middle point of controller
fabric.Object.prototype.setControlsVisibility({
  mb: false, ml: false, mr: false, mt: false
});

//
// END OF CANVAS SETTINGS
//


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
  selectable: true,
});
fabric.IText.prototype.set({
  editable: true,
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
// END OF PROTOTYPE WRAPPER

//
// FUNCTIONS
//
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
function deleteActiveObject() {
	activeObjectSet(function(obj) {canvas.remove(obj)});
	canvas.discardActiveObject();
	canvas.renderAll();
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
		//History.add();
	}
}
function isIText(obj) {
   if (!obj) obj = canvas.getActiveObject();
   return !!(obj && obj.type === "i-text");
}
function isDoubleText(obj) {
	if (!obj) obj = canvas.getActiveObject();
	return !!(obj && obj.type === "group");
}
function isText(obj) {
	if (!obj) obj = canvas.getActiveObject();
  return isIText(obj) || isDoubleText(obj);
}
function isMultipleSelected(obj) {
   if (!obj) obj = canvas.getActiveObject();
   return !!(obj && obj.type === "activeSelection");
}
function isAllIText(obj) {
	var i;
	if (!obj) obj = canvas.getActiveObject();
	if (!obj || obj.type !== 'activeSelection') return false;
	for (i=0; i<obj._objects.length; i++) {
		if (obj.item(i).type !== 'i-text') return false;
	}
	return true;
}
function isAllDoubleText(obj) {
	var i;
	if (!obj) obj = canvas.getActiveObject();
	if (!obj || obj.type !== 'activeSelection') return false;
	for (i=0; i<obj._objects.length; i++) {
		if (!isDoubleText(obj.item(i))) return false;
	}
	return true;
}
function loadFont(font) {
	var myfont = new FontFaceObserver(font);
	//toggleLoadingPage();
	//return myfont.load().then(toggleLoadingPage);
	return myfont.load();
}
function loadAndUse(font, obj) {
	return loadFont(font)
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
function loadFontFromPJSON(json) {
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
	recurse(json);
	console.log(result);

	if (result.length === 0) {
		console.log("no font");
		prom = new Promise(function(resolve, reject) {reject()});
		return prom;
	}

	// Chaining All font loading sequences ex) p.then(f).then(f)....
	prom = loadFont(result.shift());
	for (let i in result) {
		prom = prom.then(function() {return loadFont(result[i])});
	}

	return prom;
}
function load_template(json) {
	var items = json["objects"];

	canvas.forEachObject(function(t) {
		canvas.remove(t);
	});

	return loadFontFromPJSON(json).catch(function(e) {
			console.log(e)
			console.log('폰트 로딩이 느려 기본으로 대체합니다');
		}).then(function() {
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

		//History.add();
	}
}
function restore_template(json) {
	var bg = json['backgroundImage'];
	if (bg) set_background_image(bg.src);
	load_template(json).then(function() {
		//History.add();
	});
}
// END OF FUNCTIONS

//
// EDIT DOM ELEMENTS
//
// Key Binding (how to get key event?)
/*
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
    //(e.shiftKey) ? History.redo() : History.undo();
  } else if (isDeleteKey()) {
    deleteActiveObject();
  } else if (e.which === 67 && isCtrlKey()) {
    Copy();
  } else if (e.which === 86 && isCtrlKey()) {
    Paste();
  }
});
*/
// END OF EDIT DOM ELEMENTS


//
// EVENT HANDLERS
//
// END OF EVENT HANDLERS
  },
}
</script>
