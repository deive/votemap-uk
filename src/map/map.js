import store, { observeStore } from '../state'
import { LoginState, logout, selectLoginState } from '../auth/state'
import { selectCurrentLayer, setCountriesUrl, setCountryUrl, deselectCountry, setRegionUrl } from './state'
// import { selectCountry, setCountry, deselectCountry, selectRegion, setRegion, deselectRegion } from '../route/slice.js'
// import { selectCountriesMapUrl, selectCountryMapUrl, loadCountriesMapUrl, loadCountryMapUrl, selectLocalAuthorityRegionMapUrl, loadLocalAuthorityRegionMapUrl } from './slice.js'
import { createLayer, addLayer, removeLayer, fadeLayer, foregroundLayer, zoomOnLoad, zoomTo } from './map-ui.js'
import { getCountriesMapUrl, getCountryMapUrl, getCountryMapYears, getRegionMapUrl } from '../aws/aws'

var layers = undefined

observeStore(
  store, state => {
    return {
      loginState: selectLoginState(state.auth),
      currentLayer: selectCurrentLayer(state.map),
      country: "",//selectCountry(state.route),
    }
  }, state => {
    if (state.loginState == LoginState.AUTHENTICATED) {
      ensureLayer(state)
    }
  }
)

async function ensureLayer(state) {
  if (!state.currentLayer) {
    loadCountriesMapUrl()
  } else if (state.currentLayer.layerDepth == 0 && !layers) {
    loadCountriesLayer(state)
  } else if (state.currentLayer.layerDepth == 1 && layers.length == 1) {
    loadCountryLayer(state)
  } else {
    // loadCountriesLayer(state)
  }

  if (state.currentLayer) {
    if (layers.length > 1 + state.currentLayer.layerDepth) {
      layers.forEach((layer) => {
        if (layer.index > state.currentLayer.layerDepth) {
          removeLayer(layer.layer) 
        }
      })
      layers = layers.filter((layer) => layer.index > state.currentLayer.layerDepth)
    }
  }
}

function loadCountriesLayer(state) {
  layers = []
  loadLayer(
    0,
    "UK",
    state.currentLayer.url,
    feature => {
      const countryName = feature.get("CTRY23NM")
      loadCountryMapUrl(countryName)
    },
    () => {
      store.dispatch(deselectCountry())
    }
  )
  zoomOnLoad(layers[0].layer)
  addLayer(layers[0].layer)
}

function loadCountryLayer(state) {
  loadLayer(
    1,
    "UK",
    state.currentLayer.url,
    feature => {
      // TODO: Dynamic feature name for country name attribute.
      const countryName = feature.get(`CTRY${year}NM`)
      loadCountryMapUrl(countryName)
    },
    () => {
      // store.dispatch(deselectCountry())
    }
  )
  zoomOnLoad(layers[1].layer)
  addLayer(layers[1].layer)
}

function loadLayer(layerIndex, layerName, sourceUrl, onClick, onDeselect) {
  layers[layerIndex] = {
    index: layerIndex,
    name: layerName,
    layer: createLayer(
      sourceUrl, 
      onClick,
      onDeselect,
      () => {
        store.dispatch(logout())
      },
    ),
  }
}

async function loadCountriesMapUrl() {
  const url = await getCountriesMapUrl(1927)
  store.dispatch(setCountriesUrl({
    year: 1927,
    years: [1927],
    url: url,
  }))
}

async function loadCountryMapUrl(countryName) {
  const years = await getCountryMapYears(1927, "Local Authorities", countryName)
  if (years.length == 0) {
    store.dispatch(logout())
  }
  else {
    const url = await getCountryMapUrl(1927, "Local Authorities", countryName, years[0])
    store.dispatch(setCountryUrl({
      name: countryName,
      year: years[0],
      years: years,
      url: url
    }))
  }
}

async function loadRegionMapUrl(currentLayer, name) {
  // const url = await getCountriesMapUrl()
  // store.dispatch(setChildLayer({mapUrl: url}))
}
