import { configureStore } from '@reduxjs/toolkit'
import isEqual from 'lodash.isequal'

import authSlice from './auth/state'
import awsSlice from './aws/state'
import mapSlice from './map/state'

export default configureStore({
    reducer: {
      auth: authSlice,
      aws: awsSlice,
      map: mapSlice,
    },
    preloadedState: loadState(),
})

export function observeStore(store, select, onChange) {
    let currentState;
  
    function handleChange() {
      let nextState = select(store.getState());
      if (!isEqual(currentState, nextState)) {
        currentState = nextState;
        onChange(currentState);
      }
    }
  
    let unsubscribe = store.subscribe(handleChange);
    handleChange();
    return unsubscribe;
  }

  function loadState() {
    return undefined
    // var authString = window.location.hash
    // if (authString && authString.startsWith("#")) {
    //   authString = authString.substring(1)
    //   // authString = `{${authString}}`
    // }
    // var authData = undefined
    // if (authString) {
    //   const p = new URLSearchParams(authString)
    //   if (p.has("id_token") && p.has("access_token")) {
    //     authData = {
    //       accessKeyId: p.get("id_token"),
    //       secretAccessKey: p.get("access_token"),
    //   }
    //     //p.get("id_token")
        
    //   }
    //   // try {
    //   //   authData = JSON.parse(authString)
    //   // } catch (e) {}
    // }
    // // const url = new URL(document.location.toString())
    // // const params = url.searchParams
    // // var code = params.get("code")
    // // if (code) code = code.trim()
    // return {
    //   auth: {
    //     authData: authData,
    //   }
    // }
  }