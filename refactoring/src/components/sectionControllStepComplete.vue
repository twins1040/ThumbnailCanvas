<template>
  <div class="step" id="step-controll-step-complete">
    <div class="content">
      <button id="complete-save" type="button" @click="trigger('createTemplate')">내 템플릿에 저장하기</button>
      <button id="complete-download" @click="trigger('downloadTemplate')" type="button">다운로드하기</button>
    </div>
  </div>
</template>
<script>
import { mapMutations, mapActions } from 'vuex'
export default {
  data(){
    return {

    };
  },
  methods: {
    ...mapMutations({
      trigger: 'TRIGGER_CANVAS_EVENT'
    })
  }
}
</script>
