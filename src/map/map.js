import store, { observeStore } from '../state'
import { LoginState, selectLoginState } from '../auth/state'
import { selectCountriesMapUrl, setCountriesMapUrl } from './state'
// import { selectCountry, setCountry, deselectCountry, selectRegion, setRegion, deselectRegion } from '../route/slice.js'
// import { selectCountriesMapUrl, selectCountryMapUrl, loadCountriesMapUrl, loadCountryMapUrl, selectLocalAuthorityRegionMapUrl, loadLocalAuthorityRegionMapUrl } from './slice.js'
import { createLayer, addLayer, removeLayer, fadeLayer, foregroundLayer, zoomOnLoad, zoomTo } from './map-ui.js'
import { getCountriesMapUrl } from '../aws/aws'

var countriesLayer = undefined
var countryLayers = {}
var regionLayers = {}
var selectedCountryName = undefined
var selectedRegionName = undefined

observeStore(
  store, state => {
    return {
      loginState: selectLoginState(state.auth),
      countriesMapUrl: selectCountriesMapUrl(state.map),
      country: "",//selectCountry(state.route),
    }
  }, state => {
    if (state.loginState == LoginState.AUTHENTICATED) {
      ensureCountriesLayer(state)
    }
  }
)

async function ensureCountriesLayer(state) {
  if (!state.countriesMapUrl) {
    const url = await getCountriesMapUrl()
    store.dispatch(setCountriesMapUrl({countriesMapUrl: url}))
  } else {
    countriesLayer = createLayer(
      state.countriesMapUrl, 
      feature => {
        // TODO: Dynamic feature name for country name attribute.
        const countryName = feature.get("CTRY23NM")
        // store.dispatch(setCountry(countryName))
      },
      () => {
        // store.dispatch(deselectCountry())
        zoomTo(countriesLayer)
      }
    )
    zoomOnLoad(countriesLayer)
    addLayer(countriesLayer)
  }
}

// observeStore(
//   store, state => {
//     return {
//       userAuth: selectUserAuth(state.auth),
//       countriesMapUrl: "",//selectCountriesMapUrl(state.map),
//       country: "",//selectCountry(state.route),
//     }
//   }, state => {
//     if (state.userAuth) {
//       if (!state.countriesMapUrl) {
//         // Get the private URL.
//         store.dispatch(loadCountriesMapUrl())
//       } else if (!countriesLayer) {
//         // Create the layer.
//         countriesLayer = createLayer(
//           state.countriesMapUrl, 
//           feature => {
//             // TODO: Dynamic feature name for country name attribute.
//             const countryName = feature.get("CTRY23NM")
//             // store.dispatch(setCountry(countryName))
//           },
//           () => {
//             // store.dispatch(deselectCountry())
//             zoomTo(countriesLayer)
//           }
//         )
//         if (!state.country) {
//           zoomOnLoad(countriesLayer)
//         } else {
//           fadeLayer(countriesLayer)
//         }
//         addLayer(countriesLayer)
//       } else {
//         // Fade out countries if a specific country is shown.
//         if (!state.country) {
//           foregroundLayer(countriesLayer)
//         } else {
//           fadeLayer(countriesLayer)
//         }
//       }
//     }
//   }
// )

// observeStore(
//   store, state => {
//     return {
//       userAuth: selectUserAuth(state.auth),
//       country: "",//selectCountry(state.route),
//       region: "",//selectRegion(state.route),
//       selectedCountryMapUrl: "",//selectCountryMapUrl(state.map, selectCountry(state.route)),
//     }
//   }, state => {
//     if (state.userAuth) {
//       if (state.country && !state.selectedCountryMapUrl) {
//         // Get the private URL.
//         store.dispatch(loadCountryMapUrl({ country: state.country }))
//       } else if (!countryLayers[state.country]) {
//         const layer = createLayer(
//           state.selectedCountryMapUrl, 
//           feature => {
//             // TODO: Dynamic feature name for region name attribute.
//             const regionName = feature.get("RGN23NM")
//             // store.dispatch(setRegion(regionName))
//           },
//           () => {
//             // store.dispatch(deselectRegion())
//             zoomTo(countryLayers[state.country])
//           }
//         )
//         zoomOnLoad(layer)
//         addLayer(layer)
//         if (selectedCountryName) {
//           removeLayer(countryLayers[selectedCountryName])
//         }
//         countryLayers[state.country] = layer
//         selectedCountryName = state.country
//       } else if (selectedCountryName != state.country) {
//         const layerToRemove = selectedCountryName ? countryLayers[selectedCountryName] : undefined
//         if (state.country) {
//           const layer = countryLayers[state.country]
//           addLayer(layer)
//           zoomTo(layer)
//         }
//         if (layerToRemove) {
//           removeLayer(layerToRemove)
//         }
//         selectedCountryName = state.country
//       } else {
//         // Fade out country if a specific region is shown.
//         const layer = countryLayers[state.country]
//         if (!state.region) {
//           foregroundLayer(layer)
//         } else {
//           fadeLayer(layer)
//         }
//       }
//     }
//   }
// )

// observeStore(
//   store, state => {
//     return {
//       userAuth: selectUserAuth(state.auth),
//       country: "",//selectCountry(state.route),
//       region: "",//selectRegion(state.route),
//       selectedRegionMapUrl: "",//selectLocalAuthorityRegionMapUrl(state.map, selectCountry(state.route), 2023, selectRegion(state.route)),
//     }
//   }, state => {
//     if (state.userAuth) {
//       if (state.country && state.region) {
//         if (!regionLayers[state.country]) {
//           regionLayers[state.country] = {}
//         }
//         if (!regionLayers[state.country][2023]) {
//           regionLayers[state.country][2023] = {}
//         }

//         if (!state.selectedRegionMapUrl) {
//           // Get the private URL.
//           store.dispatch(loadLocalAuthorityRegionMapUrl({ country: state.country, year: 2023, region: state.region }))
//         } else if (!regionLayers[state.country][2023][state.region]) {
//           const layer = createLayer(state.selectedRegionMapUrl, feature => {
//             // TODO: Dispatch select feature to URL params handler.
//             // const regionName = feature.get("RGN23NM")
//             // store.dispatch(setCountry(countryName))
//             console.log(feature.get("RGN23NM"))
//           })
//           zoomOnLoad(layer)
//           addLayer(layer)
//           if (selectedRegionName) {
//             removeLayer(regionLayers[state.country][2023][selectedRegionName])
//           }
//           regionLayers[state.country][2023][state.region] = layer
//           selectedRegionName = state.region
//         } else if (selectedRegionName != state.region) {
//           const layerToRemove = selectedRegionName ? regionLayers[state.country][2023][selectedRegionName] : undefined
//           if (state.region) {
//             const layer = regionLayers[state.country][2023][state.region]
//             addLayer(layer)
//             zoomTo(layer)
//           }
//           if (layerToRemove) {
//             removeLayer(layerToRemove)
//           }
//           selectedRegionName = state.region
//         }
//       }
//     }
//   }
// )