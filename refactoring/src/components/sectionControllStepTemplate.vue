<template>
  <div class="step" id="step-controll-step-template">
    <div class="tab">
      <div class="tab-item" :class="{ on: tab == 'popular' }" @click="shiftTab( 'popular' )">인기 템플릿</div>
      <div class="tab-item" :class="{ on: tab == 'my' }" @click="shiftTab( 'my' )">내 템플릿</div>
    </div>
    <div class="contents">
      <ul>
        <template v-if="tab == 'popular'">
          <li v-for="template in hotTemplates" :class="{ on: selectedTemplateId == template.id }" :style="'background-image:url(' + template.thumbnail + ')'" :key="template.id" @click="selectTemplate( template.id )">
            <div class="layer" v-if="selectedTemplateId == template.id">
              <button @click="nextStep" type="button">선택 완료</button>
            </div>
          </li>
        </template>
        <template v-if="tab == 'my'">
          <li v-for="template in userTemplates" :class="{ on: selectedTemplateId == template.id }" :style="'background-image:url(' + template.thumbnail + ')'" :key="template.id" @click="selectTemplate( template.id )">
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
import { mapGetters } from 'vuex'
export default {
  data(){
    var tab = "popular";
    return {
      tab,
    };
  },
  computed: {
    ...mapGetters({
      hotTemplates: 'GET_HOT_TEMPLATES',
      userTemplates: 'GET_USER_TEMPLATES',
    }),
    selectedTemplateId(){
      return this.$store.state.selectedTemplateId;
    },
  },
  methods: {
    shiftTab( tab ){
      this.tab = tab;
    },
    selectTemplate( id ){
      this.$store.commit( "SELECT_TEMPLATE", id );
    },
    nextStep(){
      this.$store.commit( "SELECT_STEP", 2 );
    },
  },
}
</script>
