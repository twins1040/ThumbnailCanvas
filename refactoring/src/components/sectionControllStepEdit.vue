<template>
  <div class="step" id="step-controll-step-edit">
    <div class="tab" v-if="editingData">
      <div class="tab-item" :class="{ on: tab == 'font' }" @click="shiftTab( 'font' )">글자</div>
      <div class="tab-item" :class="{ on: tab == 'style' }" @click="shiftTab( 'style' )">스타일</div>
    </div>
    <div class="contents" v-if="editingData">
      {{ editingData }}
      <ul>
        <template v-if="tab == 'font'">
          <li>
            <div class="text">
              <input type="text" v-model="editingData.text" placeholder="텍스트">
            </div>
          </li>
          <li>
            <div class="select">
              <div class="label">{{ editingData.fontFamily }}</div>
              <i class="material-icons">arrow_drop_down</i>
              <select v-model="editingData.fontFamily">
                <option value="굴림">굴림</option>
                <option value="명조">명조</option>
                <option value="본고딕">본고딕</option>
              </select>
            </div>
          </li>
          <li v-if="editingData && editingData.isMultiple">
            <div class="vertical-select">
              <button :class="{ on: editingData.align == 'left' }" type="button"><input type="radio" v-model="editingData.align" value="left" /><i class="material-icons">format_align_left</i></button>
              <button :class="{ on: editingData.align == 'center' }" type="button"><input type="radio" v-model="editingData.align" value="center" /><i class="material-icons">format_align_center</i></button>
              <button :class="{ on: editingData.align == 'right' }" type="button"><input type="radio" v-model="editingData.align" value="right" /><i class="material-icons">format_align_right</i></button>
            </div>
          </li>
        </template>
        <template v-if="tab == 'style'">
          <li>
            <div class="color-picker-and-slider">
              <twin-color-picker v-model="editingData.fontColor" icon="title" />
              <twin-slider v-model="editingData.fontSize" :min="12" :max="36" />
            </div>
          </li>
          <li v-for="stroke in editingData.strokes">
            <div class="color-picker-and-slider">
              <twin-color-picker v-model="stroke.color" icon="edit" />
              <twin-slider v-model="stroke.width" :min="0" :max="12" />
            </div>
          </li>
          <li>
            <div class="stroke-maker">
              <button type="button" @click="addStroke"><i class="material-icons">add</i>외곽선 추가</button>
            </div>
          </li>
        </template>
        <li>
          <div class="objects-controlls">
            <button type="button" @click="deleteObjects"><i class="material-icons">delete</i></button>
            <button type="button" @click="cloneObjects"><i class="material-icons">file_copy</i></button>
          </div>
        </li>
      </ul>
    </div>
    <div class="interface" v-if="!editingData">
      <ul>
        <li><button type="button" @click="addObject( 'text' )"><i class="material-icons">text_fields</i>글자 추가</button></li>
        <li><input type="file" @change="addObject( 'image', $event )" /><i class="material-icons">filter_hdr</i>이미지 추가</li>
        <li><input type="file" @change="addObject( 'image', $event )" /><i class="material-icons">insert_photo</i>배경 이미지 변경</li>
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
    return {
      tab,
    };
  },
  computed: {
    editingData(){
      return this.$store.getters.GET_EDITING_DATA;
    }
  },
  methods: {
    shiftTab( tab ){
      this.tab = tab;
    },
    addStroke(){
      if( this.editingData.strokes.length < 2 ){
        this.editingData.strokes.push({ width: 1, color: "#000" });
      };
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
    cloneObjects(){
      this.$store.dispatch( "cloneObjects" );
    },
    deleteObjects(){
      this.$store.dispatch( "deleteOjbects" );
    },
  },
  created(){
    // this.$watch( "editingData", data => {
    //   Object.keys( data ).forEach( key => {
    //     this.formData[ key ] = data[ key ];
    //   });
    // });

  }
}
</script>
