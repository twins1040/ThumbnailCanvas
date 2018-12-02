
var og = $(".block-option-group");

var ai = $("#addImageOptions");
var tm = $("#templates");
var txt = $("#settingText");
var al = $("#alignItems");

$("#addImage").click(function(){
   og.addClass("hide");
   if( $(this).hasClass("btn-active") ){
      // $(this).removeClass("btn-active");
      tm.removeClass("hide");
   } else {
      // $(this).addClass("btn-active")
      ai.removeClass("hide");
   }
   console.log("clicked");
});

var textSelect = false;

canvas.on("mouse:up", function(obj){
   og.addClass("hide");
   console.log(isMultipleSelected());

   if (isTextSelected()) {
      txt.removeClass("hide");
   } else if (isMultipleSelected()) {
      al.removeClass("hide");
   } else {
      tm.removeClass("hide");
   }
});

function isTextSelected() {
   var obj = canvas.getActiveObject();
   if (!obj) {
      return false;
   }
   if (obj.type === "i-text"){
      return true;
   } else {
      return false;
   }
}

function isMultipleSelected() {
   var obj = canvas.getActiveObject();
   if (!obj) {
      return false;
   }
   if (obj.type === "activeSelection"){
      return true;
   } else {
      return false;
   }
}

function isBackgroundImage() {

}


$(".block-thumbnail").click(function() {
   $(".tool-options").addClass("tool-open").delay(1000).queue(function(){
     // $("#addImage").click();
   });
});
