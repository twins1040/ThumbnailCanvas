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
    SELECT_NODE( state, payload ){
      state.selectedNodeIds = payload ? payload : [];
    }
  },
  getters: {
    GET_NODES( state ){
      var nodeIds = Object.keys( state.nodes );
      if( nodeIds.length ){
        var nodes = nodeIds.map( nodeId => {
          return {
            id: nodeId,
            ...state.nodes[ nodeId ]
          };
        });
        return nodes;
      }else{
        return [];
      };
    },
    GET_SELECTED_NODE_IDS( state ){
      return state.selectedNodeIds;
    },
    GET_SELECTED_NODES( state ){
      if( state.selectedNodeIds.length > 0 ){
        return state.selectedNodeIds.map( nodeId => {
          return JSON.parse( JSON.stringify({
            id: nodeId,
            ...state.nodes[ nodeId ]
          }) );
        });
      }else{
        return [];
      };
    },
  },
  actions: {
    createNode({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
        var newId = nonce()();
        Vue.set( state.nodes, newId, payload );
        resolve( newId );
      });
    },
    updateNode({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
        payload.ids.forEach( id => {
          Vue.set( state.nodes, id, JSON.parse( JSON.stringify(
            $.extend({}, state.nodes[ id ], payload.data )
          )) );
        });
        resolve( payload.id );
      });
    },
    cloneNode({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
        var newIds = [];
        payload.ids.forEach( id => {
          var newId = nonce()();
          Vue.set( state.nodes, newId, JSON.parse( JSON.stringify(
            state.nodes[ id ]
          )) );
          newIds.push( newId );
        });
        resolve( newIds );
      });
    },
    deleteNode({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
        payload.ids.forEach( id => {
          Vue.delete( state.nodes, id );
        });
        resolve( payload.id );
      });
    },
  }

});

export default store;
