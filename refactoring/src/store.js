import Vue from "vue";
import Vuex from "vuex";
import $ from "jquery";
import nonce from "nonce";
Vue.use( Vuex );

const store = new Vuex.Store({
  state: {
    selectedStep: 1,
    selectedTemplateId: null,
    selectedNodeId: null,
    nodes: {}
  },
  mutations: {
    SELECT_TEMPLATE( state, payload ){
      state.selectedTemplateId = payload;
    },
    SELECT_STEP( state, payload ){
      state.selectedStep = payload;
    },
    SELECT_NODE( state, payload ){
      state.selectedNodeId = payload;
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
    GET_SELECTED_NODE( state ){
      if( state.selectedNodeId ){
        return JSON.parse( JSON.stringify({
          id: state.selectedNodeId,
          ...state.nodes[ state.selectedNodeId ]
        }));
      }else{
        return null;
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
        Vue.set( state.nodes, payload.id, JSON.parse( JSON.stringify(
          $.extend({}, state.nodes[ payload.id ], payload.data )
        )) );
        resolve( payload.id );
      });
    },
    cloneNode({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
        var newId = nonce()();
        Vue.set( state.nodes, newId, JSON.parse( JSON.stringify(
          state.nodes[ payload.id ]
        )) );
        resolve( newId );
      });
    },
    deleteNode({ state, rootState, commit, dispatch }, payload ){
      return new Promise( ( resolve, reject ) => {
        Vue.delete( state.nodes, payload.id );
        resolve( payload.id );
      });
    },
  }

});

export default store;
