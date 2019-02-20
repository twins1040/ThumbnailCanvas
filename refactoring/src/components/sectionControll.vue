<template>
  <section id="section-controll">
    <div class="container">
      <step-template v-if="selectedStep == 1" />
      <step-edit v-if="selectedStep == 2" />
    </div>
  </section>
</template>
<script>
import stepTemplate from "@/components/sectionControllStepTemplate";
import stepEdit from "@/components/sectionControllStepEdit";
export default {
  components: {
    stepTemplate,
    stepEdit
  },
  computed: {
    selectedStep(){
      return this.$store.state.selectedStep;
    }
  },
}
</script>
