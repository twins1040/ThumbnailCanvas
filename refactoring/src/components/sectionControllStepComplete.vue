<template>
  <div class="step" id="step-controll-step-complete">
    <div class="contents">
      <ul>
        <li>
          <div class="button">
            <button id="complete-save" type="button" @click="createTemplate">내 템플릿에 저장하기</button>
          </div>
        </li>
        <li>
          <div class="button">
            <button id="complete-download" @click="downloadCanvas" type="button">다운로드하기</button>
          </div>
        </li>
        <li>
          <div class="image-for-download">
            <img id="img-for-download" :src="downloadSrc" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapMutations, mapActions, mapGetters } from 'vuex'
export default {
  data(){
    return {
      downloadSrc: "",
    };
  },
  computed: {
    ...mapGetters({
      isLogin: 'GET_IS_LOGIN',
      canvas: 'GET_CANVAS',
    }),
  },
  methods: {
    ...mapMutations({
      setTemplateTab: 'SET_TEMPLATE_TAB',
      setSelectedStep: 'SELECT_STEP',
    }),
    ...mapActions([
      'loadUserTemplates',
      'loadHotTemplates',
    ]),
    createTemplate(){
      if( !this.isLogin ){
				alert("로그인이 필요합니다");
        return this.$store.dispatch("login").then( () => {
          this.createTemplate();
        });
      }else{
        // Start Upload
        var _data = this.canvas.toJSON();

        // Remove bg data ( it is too large )
				_data["backgroundImage"] = undefined;

        return this.axios.post( "/templates/", {
          data: JSON.stringify(_data),
          thumbnail: this.canvas.toDataURL({format: 'png', multiplier:0.25}),
        }).then( (response) => {
          this.loadUserTemplates();
          // Move to my template
          this.setSelectedStep(1);
          this.setTemplateTab("my");
        }).catch( () => {
          alert( "저장이 안됐어요 ㅠㅠ. 다시 로그인해보세요." );
        });
      }
    },
    downloadCanvas(){
			var link = document.createElement('a');
      if( !this.isLogin ){
				alert("로그인이 필요합니다");
        return this.$store.dispatch("login").then( () => {
          this.downloadCanvas();
        });
      }else{
        // Show rendered image
        this.downloadSrc = this.canvas.toDataURL();
				// Download Directly
				link.href = this.downloadSrc;
				link.download = "mypainting.png";
				link.click();
      }
    },
  }
}
</script>
