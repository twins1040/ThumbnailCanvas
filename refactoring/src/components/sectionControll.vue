<template>
  <section ref="sectionControll" id="section-controll">
    <div class="container">
      <step-template v-if="selectedStep == 1" />
      <step-edit v-if="selectedStep == 2" />
      <step-complete v-if="selectedStep == 3" />
    </div>
  </section>
</template>
<script>
import stepTemplate from "@/components/sectionControllStepTemplate";
import stepEdit from "@/components/sectionControllStepEdit";
import stepComplete from "@/components/sectionControllStepComplete";
export default {
  components: {
    stepTemplate,
    stepEdit,
    stepComplete
  },
  computed: {
    selectedStep(){
      return this.$store.state.selectedStep;
    }
  },
  mounted() {
    this.$store.dispatch( "loadHotTemplates" );
  }
}
</script>
