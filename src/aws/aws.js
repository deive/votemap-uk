import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'
import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import store, { observeStore } from '../state'
import { selectClientInitilised, setInitilised } from './state'
import { LoginState, selectLoginState, selectLoginRequest, selectLoginToken, setLoggedIn, setLogInError, logout } from '../auth/state'

const mapsRegion = 'eu-west-2'
const authClient = new CognitoIdentityProviderClient({ region: mapsRegion })
var s3Client = undefined

observeStore(
    store, state => {
        return {
            clientInitilised: selectClientInitilised(state.aws),
            loginState: selectLoginState(state.auth),
            loginRequest: selectLoginRequest(state.auth),
            loginToken: selectLoginToken(state.auth),
        }
    }, async state => {
        if (state.loginState == LoginState.LOGGING_IN && state.loginRequest) {
            const token = await login(state.loginRequest.username, state.loginRequest.password)
            if (s3Client) {
                store.dispatch(setInitilised())
                store.dispatch(setLoggedIn({token: token}))
            } else {
                // TODO: Better error handling
                store.dispatch(setLogInError({error: ''}))
            }
        } else if (state.loginState == LoginState.UNAUTHENTICATED && state.clientInitilised) {
            s3Client = undefined
        }

        if (!state.clientInitilised && state.loginToken) {
            createS3Client(state.loginToken)
            store.dispatch(setLoggedIn({token: state.loginToken}))
        }
    }
)

function createS3Client(idToken) {
    s3Client = new S3Client({
        region: mapsRegion,
        credentials: fromCognitoIdentityPool({
            clientConfig: { region: mapsRegion },
            identityPoolId: `${mapsRegion}:f6f94958-e7eb-4dc5-a0d5-d2eed9e0d51f`,
            logins: {
                'cognito-idp.eu-west-2.amazonaws.com/eu-west-2_wlHX2yK7U': idToken,
            }
        }),
    })
}

async function login(username, password) {
    try {
        const input = {
            'AuthFlow': 'USER_PASSWORD_AUTH',
            'AuthParameters': {
                'USERNAME': username,
                'PASSWORD': password,
            },
            'ClientId': '4u88ms4tch3490cuh95g7si86g',
        }
        const command = new InitiateAuthCommand(input)
        const response = await authClient.send(command)
        if (response.AuthenticationResult && response.AuthenticationResult.IdToken) {
            createS3Client(response.AuthenticationResult.IdToken)
            return response.AuthenticationResult.IdToken
        }
    } catch (err) {}
    return undefined
}

export async function getCountriesMapUrl(areaYear) {
    return await getMapUrl(`UK_${areaYear}`)
}

export async function getCountryMapUrl(areaYear, type, country, countryYear) {
    return await getMapUrl(`UK_${areaYear}/${type}/${country}/${country}_${countryYear}`)
}

export async function getCountryMapYears(areaYear, type, country) {
    return await getMapYears(`UK_${areaYear}/${type}/${country}/`, country)
}

export async function getRegionMapUrl(year, type, country, path) {
    return await getMapUrl(`${type}/${country}_${year}/${path}`)
}

async function getMapUrl(name) {
    return awsCall(async () => {
        const command = new GetObjectCommand({
            Bucket: 'maps.votemap.uk',
            Key: `${name}.geojson`,
        })
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    })
}

async function getMapYears(folder, name) {
    return awsCall(async () => {
        const command = new ListObjectsV2Command({
            Bucket: 'maps.votemap.uk',
            Prefix: folder,
        })
        const response = await s3Client.send(command)
        if (!response || !response.Contents) return []
        const names = response.Contents.map((item) => item.Key.slice(folder.length))
        const filtered = names.filter(
            (file) => !file.includes('/') && file.startsWith(`${name}_`) && file.endsWith('.geojson')
        )
        const years = filtered.map((fileName) => fileName.slice(name.length + 1).replace('.geojson', ''))
        return years
    })
}

async function awsCall(call) {
    try {
        return call()
    } catch (err) {
        if (err['name'] == 'NotAuthorizedException') {
            store.dispatch(logout())
        } else {
            store.dispatch(setLogInError({error: err['name']}))
        }
    }
}
