import Vue from "vue";
import Vuex from "vuex";
import $ from "jquery";
import nonce from "nonce";
Vue.use( Vuex );

const store = new Vuex.Store({
  state: {
    config: {
      API_URL: "https://thumbnail-maker.xyz"
    },
    selectedStep: 1,
    selectedTemplateId: null,
    editingData: {
      text: "",
      fontFamily: "",
      scale: 1,
      fill: "",
      align: "",
      strokes: []
    },
    selectedNodeIds: [],
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
    SET_EDITING_DATA( state, payload ){
      state.editingData = payload;
    }
  },
  getters: {
    GET_EDITING_DATA( state ){
      return state.editingData;
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
