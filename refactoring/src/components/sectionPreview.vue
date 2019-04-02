<template>
  <section id="section-preview">
    <div class="container">
      <div class="outer" id="preview-wrapper">
        <canvas class="inner" id="preview"></canvas>
      </div>
      <div class="outer" id="cover-wrapper" v-if="selectedStep === 1">
        <div class="inner" id="cover">
          <div class="container">
            <input type="file" @change="loadBackground( $event )" />
            <i class="material-icons">add_photo_alternate</i><br>
            여기를 눌러 배경 이미지를 불러오세요
          </div>
        </div>
      </div>
      <div class="interface" >
        <ul>
        </ul>
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
  data(){
    return {
      canvas: {},
    }
  },
  computed: {
    ...mapGetters({
      editingData: 'GET_SELECTED_NODES',
      vuexCanvas: 'GET_CANVAS',
      selectedStep: 'GET_SELECTED_STEP',
    }),
  },
  methods: {
    ...mapMutations({
      updateCanvas: 'UPDATE_CANVAS',
    }),
    loadBackground( e ){
      var reader = new FileReader();
      reader.onload = function( event ){
        this.$store.state.canvas.set_background_image( event.target.result );
      }.bind( this );
      reader.readAsDataURL( e.target.files[0] );
    },
  },
  mounted(){

//
// GLOBAL VARIABLES
//

var HOST = this.$store.state.config.API_URL;
var LOGIN_URL = HOST+'/login/google-oauth2/';
var LOGOUT_URL = HOST+'/logout/';
var _clipboard = {};

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

      if (isText(o) || isDoubleText(o)) {
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
//canvas.add(sampleText);
//canvas.add(sampleText2);


// Get editingData
this.$watch( "editingData", dataList => {
  var objs = canvas.getActiveObjects();

  // selectedNodes === []
  if( dataList.length === 0 ) {
    canvas.discardActiveObject().renderAll();
    return;
  }

  if ( dataList.length !== objs.length ) throw new Error("missmatch between data and objs");

  // if extra stroke data exist,
  // check each objects and if not double stroke, make them double
  //if (dataList.strokes[1]) doAddExtraStroke();

  objs = canvas.getActiveObjects();
  objs.forEach( (o, i) => {
    var data = dataList[i];
    if ( data.type === 'text' && isText(o) ) {
      o.setAllText('text', data.text);
      loadAndUse(data.fontFamily, o);
      o.setUpper('fill', data.fill);
      o.set('scaleX', data.scale);
      o.set('scaleY', data.scale);
      o.setAllText('charSpacing', data.charSpacing);
      o.setUpper('stroke', data.strokes[0].color);
      o.setUpper('strokeWidth', data.strokes[0].width);
      if (data.strokes[1] && isIText(o)) addExtraStroke(o);
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
	console.log(opt.target);
});
setSelectedNodes("mouse:up");
//setSelectedNodes("selection:cleared");
//setSelectedNodes("selection:updated");
//setSelectedNodes("selection:created");

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
    // below code can make scale bug
    // this.addWithUpdate();
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
  canvas.getActiveObject().clone( (cloned) => {
    _clipboard = cloned
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
  this.$store.commit( "SET_SELECTED_NODES", [] );
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
function addExtraStroke(actobj, _clonedObj) {
	var ret;
  var clonedObj;

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
    console.log(group);

//		History.add();

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
function doAddExtraStroke(){
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
function addImage(src) {
	var imgObj = new Image();
	imgObj.src = src;
	imgObj.onload = function () {
		var image = new fabric.Image(imgObj);

		canvas.add(image);
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
// Export functions
canvas.addNewText = function(){
  sampleText.clone((obj) => {
    var randcolor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
    obj.setUpper('fill', randcolor);
    canvas.add(obj);
  })
};
canvas.deleteActiveObject = deleteActiveObject.bind(this);
canvas.set_background_image = set_background_image;
canvas.addImage = addImage;
canvas.cloneObjects = function(){ Copy(); Paste() };
canvas.restore_template = restore_template;

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
