<template>
  <header id="site-header">
    <nav>
      <template v-if="fill.logo">
        <h1>썸네일 메이커</h1>
      </template>
      <template v-if="fill.left">
        <button class="nav-button" id="nav-previous" type="button" @click="fill.left.event"><i class="material-icons">chevron_left</i>{{fill.left.text}}</button>
      </template>
      <template v-if="fill.right">
        <button class="nav-button" id="nav-next" type="button" @click="fill.right.event">{{fill.right.text}}<i class="material-icons">chevron_right</i></button>
      </template>
    </nav>
  </header>
</template>
<script>
export default {
  computed: {
    selectedStep(){
      return this.$store.state.selectedStep;
    },
    selectedTemplateId(){
      return this.$store.state.selectedTemplateId;
    },
    editingData(){
      return this.$store.state.editingData;
    },
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
        (this.editingData ?
          // Something selected
          {
            right:  { text: '완료', event: this.completeEditingData }
          } :
          // Nothing elected
          {
            left:  { text: '이전', event: this.previousStep },
            right:  { text: '다음', event: this.nextStep } 
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
      this.$store.commit( "SELECT_NODE", null );
    }
  }
}
</script>
