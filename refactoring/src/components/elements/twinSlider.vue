<template>
  <div class="twin-slider">
    <input type="hidden" v-model="model" />
    <div class="slider-grab" :style="'left:'+ grabPosition + '%'"></div>
    <div class="slider-rail"></div>
  </div>
</template>
<script>
export default {
  props: {
    value: {},
    min: {
      default: 0.01
    },
    max: {
      default: 10
    },
    default: {}
  },
  data(){
    var isTouchDevice = /iPhone|iPad|iPod|Android/i.test( navigator.userAgent );
    return {
      isTouchDevice,
      eventNames: {
        dragStart: isTouchDevice ? "touchstart" : "mousedown",
        dragMove: isTouchDevice ? "touchmove" : "mousemove",
        dragEnd: isTouchDevice ? "touchend" : "mouseup"
      },
      grabPosition: 0
    };
  },
  computed: {
    model: {
      get(){
        if( this.value !== null ){
          this.setValue( this.value );
          return this.value;
        };
      },
      set( value ){
        this.$emit( "input", value );
      }
    }
  },
  methods: {
    bindEvent(){
      this.$el.addEventListener( this.eventNames.dragStart, this.dragStart );
    },
    dragStart( e ){
      this.tick( e );
      window.addEventListener( this.eventNames.dragMove, this.dragMove );
      window.addEventListener( this.eventNames.dragEnd, this.dragEnd );
    },
    dragMove( e ){
      this.tick( e );
    },
    dragEnd( e ){
      window.removeEventListener( this.eventNames.dragMove, this.dragMove );
      window.removeEventListener( this.eventNames.dragEnd, this.dragEnd );
    },
    tick( e ){
      var tickValue = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]
        ? e.originalEvent.touches[0].clientX
        : e.touches && e.touches[0]
          ? e.touches[0].clientX
          : e.clientX
      tickValue = ( tickValue - this.$el.getBoundingClientRect().x ) / this.$el.offsetWidth;
      tickValue = tickValue < 0
        ? 0
        : tickValue > 1
          ? 1
          : tickValue;
      this.drawGrabPosition( tickValue );
      this.updateValue( tickValue );
    },
    setValue( value ){
      var _v = ( value - this.min ) / ( this.max - this.min );
      _v = _v < 0
        ? 0
        : _v > 1
          ? 1
          : _v;
      this.drawGrabPosition( _v );
      this.updateValue( _v );
    },
    drawGrabPosition( value ){
      this.grabPosition = value * 100;
    },
    updateValue( value ){
      this.$emit( "input", this.min + ( this.max - this.min ) * value );
      this.$emit( "slideChange" );
    }
  },
  mounted(){
    this.bindEvent();
  }
}
</script>
