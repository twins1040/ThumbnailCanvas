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
    selectedStep: 1,
    selectedTemplateId: null,
    selectedNodes: [],
    nodes: {},
    canvas: {}
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
  }

});

export default store;
