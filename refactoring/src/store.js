import Vue from "vue";
import Vuex from "vuex";
import $ from "jquery";
import nonce from "nonce";
Vue.use( Vuex );

const store = new Vuex.Store({
  state: {
    config: {
      API_URL: "http://127.0.0.1:8000"
    },
    selectedStep: 3,
    selectedTemplateId: null,
    selectedNodes: [],
    nodes: {},
    canvas: {},
    canvasEvents: {
      createTemplate: false,
      downloadTemplate: false
    },
    user: {
      login: false,
      super: false
    },
    cookie: {
      csrftoken: ""
    }
  },
  mutations: {
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
    TRIGGER_CANVAS_EVENT( state, eventName ){
      if( state.canvasEvents[ eventName ] === true ) console.log("already triggered");
      state.canvasEvents[ eventName ] = true;
    },
    COMPLETE_CANVAS_EVENT( state, eventName ){
      if( state.canvasEvents[ eventName ] === false ) console.log("already completed");
      state.canvasEvents[ eventName ] = false;
    },
    // Private
    SET_USER_DATA( state, data ){
      // Assume object's values are string or number
      var keys = Object.keys( state.user );
      var undefKey = key => { return data[key] === undefined };
      if( keys.some( undefKey ) ) return;
      // It should be called by value not ref, if not, can be used maliciously
      Object.entries( data ).forEach( ([key, value]) => { state.user[key] = value } );
    },
    // Private
    SET_COOKIE( state, key, value ){
      state.cookie[key] = value;
    }
  },
  getters: {
    GET_SELECTED_NODES( state ){
      return state.selectedNodes;
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
    GET_SELECTED_TEMPLATE_ID( state ){
      return state.selectedTemplateId;
    },
    GET_CANVAS_EVENT: (state) => (eventName) => {
      return state.canvasEvents[ eventName ];
    },
    GET_USER_DATA( state ){
      return state.user;
    }
  },
  actions: {
    createObject({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
      });
    },
    updateObject({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {

      });
    },
    cloneObject({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
      });
    },
    deleteObject({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
      });
    },
    // Login, Session
    requestUserData({ state, rootState, commit, dispatch }){
      return this.axios.get(state.config.API_URL+"/user/").then( response => {
        commit( 'SET_USER_DATA', response.data );
      });
    },
    isLogin({ state, rootState, commit, dispatch }){
      return dispatch( 'requestUserData' ).then( () => {
        var _login = state.user.login;
        if( typeof _login === 'boolean' ){
          throw new Error("user.login is not boolean");
        }
        return _login;
      });
    },
    setCookieFromDocument({ state, rootState, commit, dispatch }, name){
      return new Promise( ( resolve, reject ) => {
        var rawCookie = window.document.cookie;
        var cookieValue = null;
        var cookies;

        console.log(rawCookie);
        if( rawCookie === undefined || rawCookie === '') reject("no cookie");

        cookies = rawCookie.split(';');
        cookies.some( cookie => {
          cookie = $.trim( cookie );
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            return true;
          }
          return false;
        });

        commit( 'SET_COOKIE', name, cookieValue );
        resolve();
      });
    },
    getCookie({ state, rootState, commit, dispatch }, name){
      return dispatch( 'setCookieFromDocument', name ).then( () => {
        return state.cookies[name];
      });
    },
    saveSession({ state, rootState, commit, dispatch }, jdata){
      return dispatch( 'getCookie', 'csrftoken' ).then( token => {
        if( !token ) throw new Error( "no token data" );
        return this.axios.post( state.config.API_URL+'/session/', {
          step: state.selectedStep,
          data: jdata,
          csrfmiddlewaretoken: token,
        })
      });
    },
    login({ state, rootState, commit, dispatch }, jdata){
      /*
      if ( !jdata || jdata === "" ) {
        return new Promise( ( resolve, reject ) => {
          location.href = LOGIN_URL;
          resolve();
        });
      }
      */
      return dispatch( 'saveSession', jdata ).then( () => {
        location.href = LOGIN_URL;
      });
    }

  }
});

export default store;
