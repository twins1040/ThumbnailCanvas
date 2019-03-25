import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use( VueAxios, axios );
Vue.axios.default.baseURL = 'http://127.0.0.1:8000/api';

// Google oauth2
import GAuth from 'vue-google-oauth2'
const gauthOption = {
  clientId: '626999294415-uotoverock9qhhcrbkkcm1m709i2hsvh.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}
Vue.use(GAuth, gauthOption);

export default {};
