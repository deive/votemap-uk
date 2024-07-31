import UIkit from 'uikit'
import Icons from 'uikit/dist/js/uikit-icons'

import store, { observeStore } from '../state'
import authHtml from './auth.htmlt'
import { selectLoginState, LoginState, login } from './state'

document.getElementById("content").insertAdjacentHTML('afterend', authHtml)

const MODAL_LOGIN = UIkit.modal('#modal-login')
const MODAL_LOGIN_DOM = document.getElementById('modal-login')
const LOGIN_ACTION = document.getElementById('login-action')
const LOGIN_NAME = document.getElementById('login-name')
const LOGIN_PASSWORD = document.getElementById('login-password')
const LOGIN_LOADING = document.getElementById('login-loading')

UIkit.use(Icons)

UIkit.util.on('#login-action', 'click', function () { doLogin() })
UIkit.util.on('#login-name', 'keyup', function (e) { if (e.key === 'Enter') doLogin() })
UIkit.util.on('#login-password', 'keyup', function (e) { if (e.key === 'Enter') doLogin() })

UIkit.util.on('#login-action', 'animationend', function () {
    LOGIN_ACTION.classList.remove("uk-animation-shake")
})

observeStore(
    store, state => {
        return {
            loginState: selectLoginState(state.auth),
        }
    }, state => {
        if (state.loginState != LoginState.AUTHENTICATED) {
            MODAL_LOGIN_DOM.style.visibility = 'visible'
            MODAL_LOGIN.show()

            if (state.loginState == LoginState.LOGGING_IN) {
                LOGIN_ACTION.classList.add("uk-disabled")
                LOGIN_LOADING.classList.remove("uk-invisible")
            } else {
                LOGIN_ACTION.classList.remove("uk-disabled")
                LOGIN_LOADING.classList.add("uk-invisible")
            }
            
            if (state.loginState == LoginState.ERROR) {
                showAuthError()
            }
        } else {
            MODAL_LOGIN.hide()
        }
    }
)

function doLogin() {
    const [email, password] = getEmailAndPasswordIfValid()
    if (email && password) {
        store.dispatch(login({username: email, password: password}))
    }
}

function showAuthError() {
    LOGIN_ACTION.classList.add("uk-animation-shake")
}

function getEmailAndPasswordIfValid() {
    const email = LOGIN_NAME.value.trim()
    const password = LOGIN_PASSWORD.value.trim()

    if (!email || !password) {
        showAuthError()
    }

    return [email, password]
}