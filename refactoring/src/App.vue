<template>
  <div id="app">
    <site-header />
    <main id="site-container">
      <section-preview />
      <section-controll />
    </main>
  </div>
</template>

<script>
import siteHeader from "@/components/siteHeader";
import sectionPreview from "@/components/sectionPreview";
import sectionControll from "@/components/sectionControll";
export default {
  components: {
    siteHeader,
    sectionPreview,
    sectionControll
  },
}
</script>
