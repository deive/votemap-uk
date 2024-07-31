import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import store, { observeStore } from '../state'
import { selectClientInitilised } from './state'
import { LoginState, selectLoginState, selectLoginRequest, setLoggedIn, setLogInError } from '../auth/state'

const authClient = new CognitoIdentityProviderClient({ region: "eu-west-2" })
var s3Client = undefined

observeStore(
    store, state => {
        return {
            clientInitilised: selectClientInitilised(state.aws),
            loginState: selectLoginState(state.auth),
            loginRequest: selectLoginRequest(state.auth),
        }
    }, async state => {
        if (state.loginState == LoginState.LOGGING_IN && !state.clientInitilised) {
            await login(state.loginRequest.username, state.loginRequest.password)
            if (s3Client) {
                store.dispatch(setLoggedIn())
            } else {
                store.dispatch(setLogInError(""))
            }
        } else if (state.loginState == LoginState.UNAUTHENTICATED && state.clientInitilised) {
            s3Client = undefined
        }
    }
)

async function login(username, password) {
    try {
        const input = {
            "AuthFlow": "USER_PASSWORD_AUTH",
            "AuthParameters": {
                "USERNAME": username,
                "PASSWORD": password,
            },
            "ClientId": "4u88ms4tch3490cuh95g7si86g",
        }
        const command = new InitiateAuthCommand(input)
        const response = await authClient.send(command)
        if (response.AuthenticationResult && response.AuthenticationResult.IdToken) {
            s3Client = new S3Client({
                region: "eu-west-2",
                credentials: fromCognitoIdentityPool({
                    clientConfig: { region: "eu-west-2" },
                    identityPoolId: "eu-west-2:f6f94958-e7eb-4dc5-a0d5-d2eed9e0d51f",
                    logins: {
                        "cognito-idp.eu-west-2.amazonaws.com/eu-west-2_wlHX2yK7U": response.AuthenticationResult.IdToken,
                    }
                }),
            })
        }
    } catch (err) {}
}

export async function getCountriesMapUrl() {
    return await getMapUrl("2023")
}

async function getMapUrl(name) {
    const command = new GetObjectCommand({
        Bucket: "maps.votemap.uk",
        Key: `${name}.geojson`,
    })
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}