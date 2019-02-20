<template>
  <div class="twin-color-picker">
    <button class="color-picker-opener" type="button" @click="toggleModal">
      <i class="material-icons">{{ icon }}</i>
      <div class="selected-color" :style="'background-color:' + model"></div>
    </button>
    <div class="color-picker-modal" v-if="modalOpened">
      <ul>
        <li v-for="color in colors" :style="'background-color:' + color" @click="selectColor( color )"></li>
      </ul>
    </div>
  </div>
</template>
<script>
import Colors from "@/assets/js/colors.json";
export default {
  props: [ "value", "icon" ],
  data(){
    return {
      colors: Colors,
      modalOpened: false,
    };
  },
  computed: {
    model: {
      get(){
        return this.value;
      },
      set( value ){
        this.$emit( "input", value );
      }
    }
  },
  methods: {
    toggleModal(){
      this.modalOpened = !this.modalOpened;
      if( this.modalOpened ){
        window.addEventListener( "mousedown", this.checkIsModal );
      }else{
        window.removeEventListener( "mousedown", this.checkIsModal );
      };
    },
    checkIsModal( e ){
      var target = e.target;
      var isSameNode = false;
      while( target && !isSameNode ){
        if( !target.isSameNode( this.$el ) ){
          target = target.parentNode;
        }else{
          isSameNode = true;
        };
      };
      if( !isSameNode ){
        this.modalOpened = false;
      };
    },
    selectColor( color ){
      this.$emit( "input", color );
      this.modalOpened = false;
    }
  },
}
</script>
