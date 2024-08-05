import store, { observeStore } from '../state'
import { LoginState, logout, selectLoginState } from '../auth/state'
import { selectCurrentLayer, selectSelectedCountry, setCountriesUrl, setCountryUrl, deselectCountry, setRegionUrl, deselectRegion } from './state'
import { createLayer, addLayer, removeLayer, fadeLayer, foregroundLayer, zoomOnLoad, zoomTo } from './map-ui.js'
import { getCountriesMapUrl, getCountryMapUrl, getCountryMapYears, getRegionMapUrl } from '../aws/aws'

var layers = undefined

observeStore(
  store, state => {
    return {
      loginState: selectLoginState(state.auth),
      currentLayer: selectCurrentLayer(state.map),
      selectedCountry: selectSelectedCountry(state.map),
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
    loadRegionLayer(state)
  }

  if (state.currentLayer) {
    if (layers.length > 1 + state.currentLayer.layerDepth) {
      layers.forEach((layer) => {
        if (layer.index > state.currentLayer.layerDepth) {
          removeLayer(layer.layer) 
        }
      })
      layers = layers.filter((layer) => layer.index <= state.currentLayer.layerDepth)
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
      if (countryName != 'Northern Ireland') {
        loadCountryMapUrl(countryName)
      }
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
    state.currentLayer.name,
    state.currentLayer.url,
    feature => {
      // TODO: What is the feature attribute name?
      const regionName = feature.get(`CTRY${state.currentLayer.year}NM`)
      loadRegionMapUrl(state.currentLayer.name, state.currentLayer.year, '', regionName)
    },
    () => {
      store.dispatch(deselectCountry())
    }
  )
  zoomOnLoad(layers[1].layer)
  addLayer(layers[1].layer)
}

function loadRegionLayer(state) {
  loadLayer(
    state.currentLayer.layerDepth,
    state.currentLayer.name,
    state.currentLayer.url,
    feature => {
      // TODO: What is the feature attribute name?
      const regionName = feature.get(`CTRY${state.currentLayer.year}NM`)
      // TODO: Get all the info from loadCountryLayer() above, plus also the extra regions path.
      loadRegionMapUrl(regionName)
    },
    () => {
      store.dispatch(deselectRegion())
    }
  )
  zoomOnLoad(layers[state.currentLayer.layerDepth].layer)
  addLayer(layers[state.currentLayer.layerDepth].layer)
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
      url: url,
    }))
  }
}

async function loadRegionMapUrl(countryName, countryYear, path, name) {
  const url = await getRegionMapUrl(1927, "Local Authorities", countryName, countryYear, path)
  store.dispatch(setRegionUrl({
    name: name,
    url: url,
  }))
}
