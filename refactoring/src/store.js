import Vue from "vue";
import Vuex from "vuex";

Vue.use( Vuex );

const store = new Vuex.Store({
  state: {
    selectedStep: 1,
    templateTab: "hot", // hot or my
    selectedTemplateId: null,
    selectedNodes: [],
    canvas: {},
    user: {
      // sample data
      // id: 1,
      // thumbnail: "", (not implemented)
      // email: "",
      // templates: [],
      // isSuper: false,
    },
    apiToken: "",
    hotTemplates:[
      // {
      //   localhost:8000/api/templates/1/",
      //   "id": 1,
      //   "owner_name": "tom",
      //   "owner_id": "1",
      //   localhost:8000/media/templates/thumbnail_zaspRpy.png"
      // },
    ],
    isBackground: false,
  },
  mutations: {
    INIT_STORE(state) {
      // Check if the ID exists
      if(localStorage.getItem('store')) {
        // Replace the state object with the stored item
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store')))
        );
      }
    },
    UPDATE_CANVAS( state, payload ){
      state.canvas = payload;
    },
    SELECT_TEMPLATE( state, payload ){
      state.selectedTemplateId = payload;
    },
    SELECT_STEP( state, payload ){
      state.selectedStep = payload;
    },
    SET_SELECTED_NODES( state, payload ){
      state.selectedNodes = payload;
    },
    SET_EDITING_DATA( state, payload ){
      for( var i = 0; i < state.selectedNodes.length; i++ ) {
        state.selectedNodes[i][ payload.fieldName ] = payload.data;
      }
    },
    SET_USER( state, payload ){
      state.user = payload;
    },
    SET_API_TOKEN( state, token ){
      state.apiToken = token;
      Vue.axios.defaults.headers.common['Authorization'] = token;
    },
    SET_HOT_TEMPLATES( state, templates ){
      state.hotTemplates = templates;
    },
    SET_TEMPLATE_TAB( state, tabName ){
      state.templateTab = tabName;
    },
    SET_IS_BACKGROUND( state, payload ){
      state.isBackground = payload;
    },
  },
  getters: {
    GET_CANVAS( state ){
      return state.canvas;
    },
    GET_SELECTED_NODES( state ){
      return state.selectedNodes;
    },
    GET_IS_SELECTED_NODES_EMPTY( state ){
      return state.selectedNodes.length === 0;
    },
    GET_IS_NODE_MULTIPLE( state ){
      return state.selectedNodes.length > 1;
    },
    GET_SELECTED_TYPE( state ){
      var type = "none";

      var i;
      if( state.selectedNodes.length === 0 ) return "none";
      for( i = 0; i < state.selectedNodes.length; i++ ){
        if( i === 0 ){
          type = state.selectedNodes[i].type;
        }else if( type === state.selectedNodes[i].type ){
          continue;
        }else{
          return "combined";
        };
      }
      return type;
    },
    GET_SELECTED_STEP( state ){
      return state.selectedStep;
    },
    GET_SELECTED_TEMPLATE_ID( state ){
      return state.selectedTemplateId;
    },
    GET_USER( state ){
      return state.user;
    },
    GET_IS_LOGIN( state ){
      // !!"" => false, !!undefined => false
      return !!state.apiToken;
    },
    GET_HOT_TEMPLATES( state ){
      return state.hotTemplates;
    },
    GET_USER_TEMPLATES( state ){
      return state.user.templates;
    },
    GET_TEMPLATE_TAB( state ){
      return state.templateTab;
    },
    GET_IS_BACKGROUND( state ){
      return state.isBackground;
    },
  },
  actions: {
    loadHotTemplates({ state, rootState, commit, dispatch }){
      return Vue.axios.get( "/templates/" ).then( response => {
        commit( 'SET_HOT_TEMPLATES', response.data );
      });
    },
    loadUserTemplates({ state, rootState, commit, dispatch }){
      return Vue.axios.get( "/users/"+state.user.id+"/" ).then( response => {
        state.user.templates = response.data.templates;
        commit( 'SET_USER', state.user );
      });
    },
    loadTemplateData({ state, rootState, commit, dispatch }, id ){
      return Vue.axios.get( "/templates/"+id+"/data/" ).then( response => {
        return response.data;
      });
    },
    login({ state, rootState, commit, dispatch }){
      var user = {};
      // Try Google login
      return Vue.gAuth.getAuthCode().then( authCode => {
        // Try API login
        return Vue.axios.post( "/login/social/token_user/", {
          provider: 'google-oauth2',
          code: authCode,
          redirect_uri: window.location.origin,
        });
      }).then( response => {
        // response = {
        //   email: "my@gmail.com"
        //   first_name: "Wook"
        //   id: 2
        //   last_name: "Kim"
        //   token: "0e20955776fb24a8900..."
        //   username: "wook.kim"
        // }
        commit( 'SET_API_TOKEN', 'Token '+response.data.token );
        user.id = response.data.id;
      }).then( () => {
        // Try get user data
        return Vue.axios.get( "/users/"+user.id+"/" );
      }).then( response => {
        // response.data = {
        //  "url": "http://thumbnail-maker.xyz/api/users/1/",
        //  "id": 1,
        //  "username": "wook",
        //  "email": "my@gmail.com",
        //  "is_superuser": true,
        //  "templates": []
        // }
        user.email = response.data.email;
        user.templates = response.data.templates;
        user.isSuper = response.data.is_superuser;
        commit( 'SET_USER', user );
      });
    },
    logout({ state, rootState, commit, dispatch }){
      commit( 'SET_USER', {} );
      commit( 'SET_API_TOKEN', "" );
    },
  }
});

// Subscribe to store updates
store.subscribe((mutation, state) => {
  // Store the state object as a JSON string
  var temp = {};
  var blacklist = ['user', 'apiToken', 'hotTemplates'];
  if( state.canvas.toJSON === undefined ) return;
  Object.entries( state ).forEach( ([key, value]) => {
    if( blacklist.includes( key ) ) return;
    if( key === 'canvas' ){
      temp[key] = value.toJSON();
    }else{
      temp[key] = value;
    }
  });
  localStorage.setItem('store', JSON.stringify(temp));
});

export default store;
