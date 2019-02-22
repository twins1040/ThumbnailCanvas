<template>
  <header id="site-header">
    <template v-if="selectedStep == 1">
      <h1>썸네일 메이커</h1>
    </template>
    <nav>
      <template v-if="selectedStep == 1 && selectedTemplateId">
        <button class="nav-button" id="nav-next" type="button" @click="nextStep">다음<i class="material-icons">chevron_right</i></button>
      </template>
      <template v-if="selectedStep == 2 && !editingData">
        <button class="nav-button" id="nav-previous" type="button" @click="previousStep"><i class="material-icons">chevron_left</i>이전</button>
        <button class="nav-button" id="nav-save" type="button" @click="nextStep">다음<i class="material-icons">chevron_right</i></button>
      </template>
      <template v-if="selectedStep == 2 && editingData">
        <button class="nav-button" id="nav-complete" type="button" @click="completeEditingData">완료<i class="material-icons">chevron_right</i></button>
      </template>
      <template v-if="selectedStep == 3">
        <button class="nav-button" id="nav-previous" type="button" @click="previousStep"><i class="material-icons">chevron_left</i>이전</button>
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
