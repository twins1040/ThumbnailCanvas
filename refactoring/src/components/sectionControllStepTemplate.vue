<template>
  <div class="step" id="step-controll-step-template">
    <div class="tab">
      <div class="tab-item" :class="{ on: tab == 'popular' }" @click="shiftTab( 'popular' )">인기 템플릿</div>
      <div class="tab-item" :class="{ on: tab == 'my' }" @click="shiftTab( 'my' )">내 템플릿</div>
    </div>
    <div class="contents">
      <ul>
        <template v-if="tab == 'popular'">
          <li v-for="template in popularTemplates" :class="{ on: selectedTemplateId == template.id }" :style="'background-image:url(' + template.thumbnail + ')'" :key="template.id" @click="selectTemplate( template.id )">
            <div class="layer" v-if="selectedTemplateId == template.id">
              <button @click="nextStep" type="button">선택 완료</button>
            </div>
          </li>
        </template>
        <template v-if="tab == 'my'">
          <li v-for="template in myTemplates" :class="{ on: selectedTemplateId == template.id }" :style="'background-image:url(' + template.thumbnail + ')'" :key="template.id" @click="selectTemplate( template.id )">
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
export default {
  data(){
    var tab = "popular";
    var popularTemplates = [
      { id: 1 },
      { id: 2 },
    ];
    var myTemplates = [
      { id: 3 },
      { id: 4 },
    ];
    return {
      tab,
      popularTemplates,
      myTemplates,
    };
  },
  computed: {
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
  created(){
    // this.$watch( "tab", tab => {
    //   this.axios.get( this.$store.state.config.API_HOST + "/templates/" + ( tab == "popular" ? "popular" : "my" ) ).then( res => {
    //     console.log( res );
    //   }).catch( err => {
    //     console.log( err );
    //   });
    // }, { immediate: true });
  },
  mounted() {
    var host = this.$store.state.config.API_URL;
    this.axios.get( host+"/templates/hot/" ).then( response => {
      response.data.forEach( d => {
        d.thumbnail = host + d.thumbnail;
      });
      this.popularTemplates = response.data;
    });
  }
}
</script>
