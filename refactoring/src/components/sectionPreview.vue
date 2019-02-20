<template>
  <section id="section-preview">
    <div class="container">

      <div class="outer" id="cover-wrapper">
        <div class="inner" id="cover">
          <div class="container">
            <i class="material-icons">add_photo_alternate</i><br>
            여기를 눌러 배경 이미지를 불러오세요
            {{ nodes }}
          </div>
        </div>
      </div>

      <div class="outer" id="preview-wrapper" style="display:none;">
        <canvas class="inner" id="preview" style="background-image: url(./static/img/thumbnail-temp.jpg)"></canvas>
      </div>

    </div>
  </section>
</template>
<script>
export default {
  computed: {
    nodes(){
      return this.$store.getters.GET_NODES;
    }
  }
}
</script>
