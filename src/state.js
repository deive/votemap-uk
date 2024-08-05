import { configureStore } from '@reduxjs/toolkit'
import isEqual from 'lodash.isequal'
import pDebounce from 'p-debounce'

import authSlice, { LoginState } from './auth/state'
import mapSlice from './map/state'

const store = configureStore({
    reducer: {
      auth: authSlice,
      map: mapSlice,
    },
    preloadedState: loadState(),
})
export default store

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

  const saveState = state => {
    try {
      if (state) {
        localStorage.setItem("token", state)
      } else {
        localStorage.removeItem("token")
      }
    } catch (e) {}
  }
  const saveStateDebounced = pDebounce(saveState, 500)

  observeStore(store, state => state.auth.loginToken, state => {
    (() => { saveStateDebounced(state) })()
  })

  function loadState() {
    const token = localStorage.getItem("token")
    return {
      auth: {
        loginRequest: undefined,
        loginState: token ? LoginState.AUTHENTICATED : LoginState.UNAUTHENTICATED,
        loginToken: token,
      },
    }
  }