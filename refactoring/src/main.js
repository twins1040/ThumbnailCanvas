import Vue from "vue";
import App from "@/App";
import "@/assets/css/app.scss";

import router from "@/router";
import store from "@/store";
import filter from "@/filter";
import plugins from "@/plugins";

new Vue({
  el: "#app",
  components: { App },
  template: "<App />",
  store,
  beforeCreate(){
    this.$store.commit('INIT_STORE');
  }
})
