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
export default {
  computed: {
    nodes(){
      return this.$store.getters.GET_NODES;
    },
    selectedNodeIds(){
      return this.$store.getters.GET_SELECTED_NODE_IDS;
    },
    selectedNodes(){
      return this.$store.getters.GET_SELECTED_NODES;
    },
  },
  mounted(){
//
// GLOBAL VARIABLES
//
var canvas = new fabric.Canvas( "preview" );
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
var addCommitEvent = (event) => {
  canvas.on(event, (opt) => {
    this.$store.commit( "UPDATE_CANVAS", canvas );
  });
};
// END OF GLOBAL VARIABLES

//
// CANVAS SETTINGS
//
canvas.setDimensions({ width: 1280, height:720 }, { backstoreOnly:true });
canvas.selection = true;
canvas.add(sampleText);
sampleText.clone((obj) => canvas.add(obj));
this.$store.commit( "UPDATE_CANVAS", canvas );
canvas.on("mouse:up", (opt) => {
	console.log(opt.target);
});
addCommitEvent("object:modified");
addCommitEvent("selection:cleared");
addCommitEvent("selection:updated");
addCommitEvent("selection:created");

// Remove middle point of controller
fabric.Object.prototype.setControlsVisibility({
  mb: false, ml: false, mr: false, mt: false
});
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

  }
}
</script>
