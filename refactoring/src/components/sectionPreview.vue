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
import Fabric from "fabric";
export default {
  computed: {
    nodes(){
      return this.$store.getters.GET_NODES;
    }
  },
  mounted(){
    var preview = new fabric.Canvas( "preview" );
    preview.setDimensions({ width: 1280, height:720 }, { backstoreOnly:true });
    preview.selection = true;
  }
}
</script>
