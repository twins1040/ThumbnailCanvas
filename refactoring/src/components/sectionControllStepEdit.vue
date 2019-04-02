<template>
  <div class="step" id="step-controll-step-edit">
    <div class="tab" v-if="editingDataType !== 'none'">
      <template v-if="editingDataType === 'text'">
        <div class="tab-item" :class="{ on: tab == 'font' }" @click="shiftTab( 'font' )">글자</div>
        <div class="tab-item" :class="{ on: tab == 'style' }" @click="shiftTab( 'style' )">스타일</div>
      </template>
      <template v-if="editingDataType === 'image'">
        <div class="tab-item" :class="{ on: true }">이미지</div>
      </template>
    </div>
    <div class="contents">
      <ul>
        <template v-if="editingDataType === 'text' && tab == 'font'">
          <li>
            <div class="text">
              <input type="text" v-model="editingData.text" placeholder="텍스트" @keyup="updateData( 'text' )">
            </div>
          </li>
          <li>
            <div class="select">
              <div class="label">{{ editingData.fontFamily }}</div>
              <i class="material-icons">arrow_drop_down</i>
              <select v-model="editingData.fontFamily" @change="updateData( 'fontFamily' )">
                <option value="Noto Sans KR">Noto Sans KR</option>
                <option value="Nanum Gothic">Nanum Gothic</option>
                <option value="Nanum Myeongjo">Nanum Myeongjo</option>
                <option value="Hanna">Hanna</option>
                <option value="Poor Story">Poor Story</option>
                <option value="Gothic A1 Regular">Gothic A1 Regular</option>
                <option value="Gothic A1 Light">Gothic A1 Light</option>
                <option value="Gothic A1 Thin">Gothic A1 Thin</option>
                <option value="TmonMonsori">TmonMonsori</option>
                <option value="Cute Font">Cute Font</option>
                <option value="HANNA Pro">HANNA Pro</option>
                <option value="Black Han Sans">Black Han Sans</option>
                <option value="JUA">JUA</option>
                <option value="Swagger">Swagger</option></select>
              </select>
            </div>
          </li>
          <li>
            <div class="char-spacing-slider">
              <div class="icon" @click="editingData.charSpacing = 0"><i class="material-icons">format_shapes</i></div>
              <twin-slider v-model="editingData.charSpacing" :min="-300" :default="0" :max="300" @slideChange="updateData( 'charSpacing' )" />
            </div>
          </li>
        </template>
        <template v-if="editingDataType === 'text' && tab == 'style'">
          <li>
            <div class="color-picker-and-slider">
              <twin-color-picker v-model="editingData.fill" icon="title" @colorChange="updateData( 'fill' )" />
              <twin-slider v-model="editingData.scale" :min="0.05" :default="1" :max="10" @slideChange="updateData( 'scale' )" />
            </div>
          </li>
          <li v-for="stroke in editingData.strokes">
            <div class="color-picker-and-slider">
              <twin-color-picker v-model="stroke.color" icon="edit" />
              <twin-slider v-model="stroke.width" :min="0" :default="0" :max="100" />
            </div>
          </li>
          <li>
            <div class="stroke-maker" v-if="editingData.strokes && editingData.strokes.length < 2">
              <button type="button" @click="addStroke"><i class="material-icons">add</i>외곽선 추가</button>
            </div>
          </li>
        </template>
        <li v-if="isMultiple">
          <div class="vertical-select">
            <button type="button"><i class="material-icons">format_align_left</i></button>
            <button type="button"><i class="material-icons">format_align_center</i></button>
            <button type="button"><i class="material-icons">format_align_right</i></button>
          </div>
        </li>
        <template v-if="editingDataType !== 'none'">
          <li>
            <div class="objects-controlls">
              <button type="button" @click="deleteActiveObject"><i class="material-icons">delete</i></button>
              <button type="button" @click="cloneObjects"><i class="material-icons">file_copy</i></button>
            </div>
          </li>
        </template>
      </ul>
    </div>
    <div class="interface" v-if="editingDataType === 'none'">
      <ul>
        <li><button type="button" @click="addNewText"><i class="material-icons">text_fields</i>글자 추가</button></li>
        <li><input type="file" @change="loadImage( $event )" /><i class="material-icons">filter_hdr</i>이미지 추가</li>
        <li><input type="file" @change="loadBackground( $event )" /><i class="material-icons">insert_photo</i>배경 이미지 변경</li>
      </ul>
    </div>
  </div>
</template>
<script>
import twinColorPicker from "@/components/elements/twinColorPicker";
import twinSlider from "@/components/elements/twinSlider";
export default {
  components: {
    twinColorPicker,
    twinSlider
  },
  data(){
    var tab = "font";
    var editingData = {};
    var readyToSubmitToCanvas = false;
    return {
      tab,
      editingData,
      readyToSubmitToCanvas
    };
  },
  computed: {
    editingDataType(){
      return this.$store.getters.GET_SELECTED_TYPE;
    },
    isMultiple(){
      return this.$store.getters.GET_IS_NODE_MULTIPLE;
    },
    selectedNodes(){
      return this.$store.getters.GET_SELECTED_NODES;
    },
    canvas(){
      return this.$store.state.canvas;
    }
  },
  created(){
    this.$watch( "selectedNodes", nodes => {
      if( nodes.length > 0 ){
        if( this.isMultiple ){
          if( this.editingDataType == "combined" ){  // 여러개의 노드가 선택되었으며, 노드 타입이 다를 때.
            Object.keys( this.editingData ).forEach( key => {
              this.editingData[ key ] = null;
            });
          }else{
            Object.keys( nodes[0] ).forEach( key => {
              var isSame = true;
              var tempValue = nodes[0][key];
              nodes.forEach( node => {
                if( tempValue != node[ key ] ){
                  isSame = false;
                };
              });
              if( isSame ){
                this.$set( this.editingData, key, tempValue );
              }else{
                this.$set( this.editingData, key, null );
              };
            });
          };
        }else{  // 한개의 노드만 선택되었을 때.
          Object.keys( nodes[0] ).forEach( key => {
            this.$set( this.editingData, key, nodes[0][key] );
          });
        };
      }else{  // 선택된 노드가 없을 때.
        Object.keys( this.editingData ).forEach( key => {
          this.editingData[ key ] = null;
        });
      };
    });

  },
  methods: {
    updateData( fieldName ){
      this.$store.commit( "SET_EDITING_DATA", { fieldName, data: this.editingData[ fieldName ] });
    },
    shiftTab( tab ){
      this.tab = tab;
    },
    addStroke(){
      if( this.editingData.strokes && this.editingData.strokes.length < 2 ){
        this.editingData.strokes.push({ width: 1, color: "#000" });
      }
      this.updateData( 'strokes' );
    },
    addObject( type, e ){
      var nodeData = {};
      new Promise( ( resolve, reject ) => {
        if( type == "text" ){
          resolve({ type: "text" });
        }else if( type == "image" ){
          var data = new FormData();
          data.append( "file", event.target.files[0] );
          this.axios.post( this.$store.config.API_HOST + "/upload", data ).then( res => {
            resolve({ type: "image", url: res.url });
          }).catch( reject );
        }else if( type == "background" ){
          var data = new FormData();
          data.append( "file", event.target.files[0] );
          this.axios.post( this.$store.config.API_HOST + "/upload", data ).then( res => {
            resolve({ type: "background", url: res.url });
          }).catch( reject );
        };
      }).then( data => {
        this.$store.dispatch( "creatObjects", data );
      });
    },
    loadBackground( e ){
      var reader = new FileReader();
      reader.onload = function( event ){
        this.set_background_image( event.target.result );
      }.bind( this );
      reader.readAsDataURL( e.target.files[0] );
    },
    loadImage( e ){
      var addImage = this.addImage;
      var readAndAdd = function( file ){
        if ( /\.(jpe?g|png|gif)$/i.test( file.name ) ) {
          var reader = new FileReader();
          reader.onload = function ( event ) {
            addImage( event.target.result );
          }
          reader.readAsDataURL( file );
        }
      }.bind(this);
      if ( e.target.files ) {
        [].forEach.call( e.target.files, readAndAdd );
      }
    },
    // addNewText(){ this.canvas['addNewText']() }, ...
    ...((methods)=>{
      const res = {};
      methods.forEach(function(x){
        res[x] = function(){ this.canvas[x].apply(null, arguments) };
      });
      return res;
    })([
      'addNewText',
      'deleteActiveObject',
      'set_background_image',
      'cloneObjects',
      'addImage',
    ]),
  },
}
</script>
