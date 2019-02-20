<template>
  <div class="step" id="step-controll-step-edit">
    <div class="tab" v-if="selectedNodes.length > 0">
      <div class="tab-item" :class="{ on: tab == 'font' }" @click="shiftTab( 'font' )">글자</div>
      <div class="tab-item" :class="{ on: tab == 'style' }" @click="shiftTab( 'style' )">스타일</div>
    </div>
    <div class="contents" v-if="selectedNodes.length > 0">
      <ul>
        <template v-if="tab == 'font'">
          <li v-if="selectedNodes.length == 1">
            <div class="text">
              <input type="text" v-model="formData.text" placeholder="텍스트">
            </div>
          </li>
          <li>
            <div class="select">
              <div class="label">{{ formData.fontFamily }}</div>
              <i class="material-icons">arrow_drop_down</i>
              <select v-model="formData.fontFamily">
                <option value="굴림">굴림</option>
                <option value="명조">명조</option>
                <option value="본고딕">본고딕</option>
              </select>
            </div>
          </li>
          <li v-if="selectedNodes.length > 1">
            <div class="vertical-select">
              <button :class="{ on: formData.align == 'left' }" type="button"><input type="radio" v-model="formData.align" value="left" /><i class="material-icons">format_align_left</i></button>
              <button :class="{ on: formData.align == 'center' }" type="button"><input type="radio" v-model="formData.align" value="center" /><i class="material-icons">format_align_center</i></button>
              <button :class="{ on: formData.align == 'right' }" type="button"><input type="radio" v-model="formData.align" value="right" /><i class="material-icons">format_align_right</i></button>
            </div>
          </li>
        </template>
        <template v-if="tab == 'style'">
          <li>
            <div class="color-picker-and-slider">
              <twin-color-picker v-model="formData.fontColor" icon="title" />
              <twin-slider v-model="formData.fontSize" :min="12" :max="36" />
            </div>
          </li>
          <li v-for="border in formData.borders">
            <div class="color-picker-and-slider">
              <twin-color-picker v-model="border.color" icon="edit" />
              <twin-slider v-model="border.width" :min="0" :max="12" />
            </div>
          </li>
          <li>
            <div class="border-maker">
              <button type="button" @click="addBorder"><i class="material-icons">add</i>외곽선 추가</button>
            </div>
          </li>
        </template>
        <li>
          <div class="node-controlls">
            <button type="button" @click="deleteNode"><i class="material-icons">delete</i></button>
            <button type="button" @click="cloneNode"><i class="material-icons">file_copy</i></button>
          </div>
        </li>
      </ul>
    </div>
    <div class="interface" v-if="selectedNodes.length == 0">
      <ul>
        <li><button type="button" @click="addNode( 'text' )"><i class="material-icons">text_fields</i>글자 추가</button></li>
        <li><input type="file" @change="addNode( 'image', $event )" /><i class="material-icons">filter_hdr</i>이미지 추가</li>
        <li><input type="file" @change="addNode( 'image', $event )" /><i class="material-icons">insert_photo</i>배경 이미지 변경</li>
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
    var formData = {
      text: "",
      fontFamily: "",
      fontSize: "",
      fontColor: "",
      align: "",
      borders: []
    };
    return {
      tab,
      formData
    };
  },
  computed: {
    selectedNodes(){
      return this.$store.getters.GET_SELECTED_NODES;
    },
    selectedNodeIds(){
      return this.$store.state.selectedNodeIds;
    }
  },
  methods: {
    shiftTab( tab ){
      this.tab = tab;
    },
    addBorder(){
      this.formData.borders.push({ width: 1, color: "#000" });
    },
    addNode( type, e ){
      var nodeData = {};
      if( type == "text" ){
        nodeData = {
          type: "text",
          fontFamily: "굴림",
          fontSize: 12,
          fontColor: "#000",
          align: "left",
          border: []
        };
      }else if( type == "image" ){
        var data = new FormData();
        data.append( "file", event.target.files[0] );
        this.axios.post( this.$store.config.API_HOST + "/upload", data ).then( res => {
          nodeData = {
            type: "image",
            url: res.url
          };
        });
      }else if( type == "background" ){
        var data = new FormData();
        data.append( "file", event.target.files[0] );
        this.axios.post( this.$store.config.API_HOST + "/upload", data ).then( res => {
          nodeData = {
            type: "background",
            url: res.url
          };
        });
      };
      this.$store.dispatch( "createNode", nodeData ).then( nodeId => {
        this.$store.commit( "SELECT_NODE", [ nodeId ] );
      });
    },
    cloneNode(){
      this.$store.dispatch( "cloneNode", { ids: this.selectedNodeIds }).then( nodeId => {
        this.$store.commit( "SELECT_NODE", [ nodeId ] );
      });
    },
    deleteNode(){
      var targetIds = this.selectedNodeIds;
      this.$store.commit( "SELECT_NODE", null );
      this.$store.dispatch( "deleteNode", { ids: targetIds });
    },
  },
  created(){


    Object.keys( this.formData ).forEach( fieldName => {
      this.$watch( "formData." + fieldName, value => {
        this.$store.dispatch( "updateNode", {
          ids: this.selectedNodeIds,
          data: { [fieldName]: value }
        });
      }, { deep: true });
    });
    this.$watch( "selectedNodeIds", newIds => {
      // 여기서 한 번 체크!
      if( newIds.length >= 2 ){
        Object.keys( this.selectedNodes[0] ).forEach( key => {
          this.formData[ key ] = this.selectedNodes[0][ key ];
        });
      }else{
        Object.keys( this.selectedNodes[0] ).forEach( key => {
          this.formData[ key ] = this.selectedNodes[0][ key ];
        });
      }
    }, { deep: true });
  }
}
</script>
