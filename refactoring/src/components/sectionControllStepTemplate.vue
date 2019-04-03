<template>
  <div class="step" id="step-controll-step-template">
    <div class="tab">
      <div class="tab-item" :class="{ on: tab == 'hot' }" @click="shiftTab( 'hot' )">인기 템플릿</div>
      <div class="tab-item" :class="{ on: tab == 'my' }" @click="shiftTab( 'my' )">내 템플릿</div>
    </div>
    <div class="contents">
      <ul>
        <template v-if="tab == 'hot'">
          <li v-for="template in hotTemplates" :class="{ on: selectedTemplateId == template.id }" :style="'background-image:url(' + template.thumbnail + ')'" :key="template.id" @click="selectTemplate( template.id, template.data )">
            <div class="layer" v-if="selectedTemplateId == template.id">
              <button @click="nextStep" type="button">선택 완료</button>
            </div>
          </li>
        </template>
        <template v-if="tab == 'my'">
          <li v-for="template in userTemplates" :class="{ on: selectedTemplateId == template.id }" :style="'background-image:url(' + template.thumbnail + ')'" :key="template.id" @click="selectTemplate( template.id, template.data )">
            <div class="layer" v-if="selectedTemplateId == template.id">
              <button @click="nextStep" type="button">선택 완료</button>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      hotTemplates: 'GET_HOT_TEMPLATES',
      userTemplates: 'GET_USER_TEMPLATES',
      canvas: 'GET_CANVAS',
      tab: 'GET_TEMPLATE_TAB',
    }),
    selectedTemplateId(){
      return this.$store.state.selectedTemplateId;
    },
  },
  methods: {
    ...mapMutations({
      setTab: 'SET_TEMPLATE_TAB',
    }),
    shiftTab( tab ){
      this.setTab( tab );
    },
    selectTemplate( id, data ){
      this.canvas.restore_template( JSON.parse(data) );
      this.$store.commit( "SELECT_TEMPLATE", id );
    },
    nextStep(){
      this.$store.commit( "SELECT_STEP", 2 );
    },
  },
}
</script>
