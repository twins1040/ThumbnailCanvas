import Vue from 'vue'


// Axios
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use( VueAxios, axios );
Vue.axios.defaults.baseURL = process.env.API_HOST+"/api"

// Google oauth2
import GAuth from 'vue-google-oauth2'
const gauthOption = {
  clientId: '626999294415-uotoverock9qhhcrbkkcm1m709i2hsvh.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}
Vue.use(GAuth, gauthOption);

// infinite template loading
import infiniteScroll from 'vue-infinite-scroll'
Vue.use(infiniteScroll)

export default {};
