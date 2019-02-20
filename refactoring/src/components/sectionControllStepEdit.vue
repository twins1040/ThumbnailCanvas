<template>
  <div class="step" id="step-controll-step-edit">
    <div class="tab" v-if="selectedNode">
      <div class="tab-item" :class="{ on: tab == 'font' }" @click="shiftTab( 'font' )">글자</div>
      <div class="tab-item" :class="{ on: tab == 'style' }" @click="shiftTab( 'style' )">스타일</div>
    </div>
    <div class="contents" v-if="selectedNode">
      <ul>
        <template v-if="tab == 'font'">
          <li>
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
          <li>
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
    <div class="interface" v-if="!selectedNode">
      <ul>
        <li><button type="button" @click="addNode( 'text' )"><i class="material-icons">text_fields</i>글자 추가</button></li>
        <li><button type="button" @click="addNode( 'image' )"><i class="material-icons">filter_hdr</i>이미지 추가</button></li>
        <li><button type="button" @click="addNode( 'background' )"><i class="material-icons">insert_photo</i>배경 이미지 변경</button></li>
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
    selectedNode(){
      return this.$store.getters.GET_SELECTED_NODE;
    }
  },
  methods: {
    shiftTab( tab ){
      this.tab = tab;
    },
    addBorder(){
      this.formData.borders.push({ width: 1, color: "#000" });
    },
    addNode( type ){
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
        this.$store.dispatch( "createNode", nodeData ).then( nodeId => {
          this.$store.commit( "SELECT_NODE", nodeId );
        });
      // }else if( type == "image" ){
      //   nodeData = {
      //     type: "image",
      //     fontFamily: "굴림",
      //     align: "left"
      //   };
      // }else if( type == "background" ){
      //   nodeData = {
      //     type: "text",
      //     fontFamily: "굴림",
      //     align: "left"
      //   };
      };
    },
    cloneNode(){
      this.$store.dispatch( "cloneNode", { id: this.selectedNode.id }).then( nodeId => {
        this.$store.commit( "SELECT_NODE", nodeId );
      });
    },
    deleteNode(){
      var targetId = this.selectedNode.id;
      this.$store.commit( "SELECT_NODE", null );
      this.$store.dispatch( "deleteNode", { id: targetId });
    },
  },
  created(){
    this.$watch( "selectedNode.id", nodeId => {
      if( this.selectedNode ){
        this.formData.text = this.selectedNode.text;
        this.formData.fontFamily = this.selectedNode.fontFamily;
        this.formData.align = this.selectedNode.align;
      };
    });
    this.$watch( "formData", formData => {
      this.$store.dispatch( "updateNode", { id: this.selectedNode.id, data: formData });
    }, { deep: true });
  }
}
</script>
