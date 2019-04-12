<template>
  <div class="step" id="step-controll-step-template">
    <div class="tab">
      <div class="tab-item" :class="{ on: tab == 'hot' }" @click="shiftTab( 'hot' )">인기 템플릿</div>
      <div class="tab-item" :class="{ on: tab == 'my' }" @click="shiftTab( 'my' )">내 템플릿</div>
    </div>
    <div class="contents" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="0">
      <ul>
        <li v-for="template in visibleTemplates.slice().reverse()" :class="{ on: selectedTemplateId == template.id }" :style="'background-image:url(' + template.thumbnail + ')'" :key="template.id" @click="selectTemplate( template.id )">
          <div class="layer" v-if="selectedTemplateId == template.id">
            <button @click="nextStep" type="button">선택 완료</button>
          </div>
          <div v-if="user.isSuper === true || template.owner_id === user.id"> 
            <div class="material-icons" @click="deleteTemplate( template.id, $event )">
              <i>delete</i>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  data() {
    return {
      busy: false,
      tabs: {
        hot: {
          length: 10,
        },
        my: {
          length: 10,
        },
      },
    }
  },
  computed: {
    ...mapGetters({
      hotTemplates: 'GET_HOT_TEMPLATES',
      myTemplates: 'GET_USER_TEMPLATES',
      canvas: 'GET_CANVAS',
      tab: 'GET_TEMPLATE_TAB',
      user: 'GET_USER',
    }),
    selectedTemplateId(){
      return this.$store.state.selectedTemplateId;
    },
    visibleTemplates(){
      if( this.tab === 'hot' ){
        return this.hotTemplates ? this.hotTemplates.slice(-this.tabs.hot.length) : [];
      }else if( this.tab === 'my' ){
        return this.myTemplates ? this.myTemplates.slice(-this.tabs.my.length) : [];
      }else{
        return [];
      }
    },
  },
  methods: {
    ...mapMutations({
      setTab: 'SET_TEMPLATE_TAB',
    }),
    shiftTab( tab ){
      this.setTab( tab );
    },
    selectTemplate( id ){
      this.$store.dispatch( "loadTemplateData", id ).then( data => {
        this.canvas.restore_template( JSON.parse(data) );
      });
      this.$store.commit( "SELECT_TEMPLATE", id );
    },
    nextStep(){
      this.$store.commit( "SELECT_STEP", 2 );
    },
    loadNextTemplates(){
      this.$store.dispatch( "loadNextTemplates" );
    },
    loadMore(){
      this.busy = true;
      setTimeout(() => {
        var tab = this.tabs[this.tab];
      console.log(tab);
        if( tab ) tab.length += 10;
        this.busy = false;
      }, 500);
    },
    deleteTemplate(i, e){
      e.stopPropagation();
      if( confirm( "정말 삭제하실건가요?" ) ){
        return this.axios.delete( "/templates/"+i+"/" ).then(() => {
          this.$store.dispatch( "loadHotTemplates" );
        });
      }
    },
  },
}
</script>
