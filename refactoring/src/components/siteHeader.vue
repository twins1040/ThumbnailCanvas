<template>
  <header id="site-header">
    <nav>
      <template v-if="fill.logo">
        <h1>썸네일 메이커</h1>
      </template>
      <template v-if="fill.left">
        <button class="nav-button" id="nav-previous" type="button" @click="fill.left.event">
          <i class="material-icons">chevron_left</i>{{fill.left.text}}
        </button>
      </template>
      <button v-if="isLogin" class="nav-button" id="nav-logout" type="button" @click="logout()">로그아웃</button>
      <button v-if="!isLogin" class="nav-button" id="nav-login" type="button" @click="login()">로그인</button>
      <template v-if="fill.right">
        <button class="nav-button" id="nav-next" type="button" @click="fill.right.event">
          {{fill.right.text}}<i class="material-icons">chevron_right</i>
        </button>
      </template>
    </nav>
  </header>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      selectedStep: 'GET_SELECTED_STEP',
      selectedTemplateId: 'GET_SELECTED_TEMPLATE_ID',
      isEmptySelection: 'GET_IS_SELECTED_NODES_EMPTY',
      isLogin: 'GET_IS_LOGIN'
    }),
    fillData(){
      return [
        {},
        // Step 1 : select template
        {
          logo: true,
          right: this.selectedTemplateId ?
            // Template selected
            { text: '다음', event: this.nextStep } :
            // Not selected
            undefined
        },
        // Step 2 : editing
        (this.isEmptySelection ?
          // Nothing elected
          {
            left:  { text: '이전', event: this.previousStep },
            right:  { text: '다음', event: this.nextStep } 
          } :
          // Something selected
          {
            right:  { text: '완료', event: this.completeEditingData }
          }
        ),
        // Step 3 : complete ( save, upload ...)
        {
          left: { text: '이전', event: this.previousStep }
        }
      ];
    },
    fill(){
      return this.fillData[this.selectedStep];
    }
  },
  methods: {
    previousStep(){
      this.$store.commit( "SELECT_STEP", this.selectedStep - 1 );
    },
    nextStep(){
      this.$store.commit( "SELECT_STEP", this.selectedStep + 1 );
    },
    completeEditingData(){
      this.$store.commit( "SET_SELECTED_NODES", [] );
    },
    ...mapActions([
      'login',
      'logout'
    ]),
  }
}
</script>
