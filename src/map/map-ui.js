import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { Map, View } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { fromLonLat } from 'ol/proj'
import LayerVector from 'ol/layer/Vector'
import SourceVector from 'ol/source/Vector'
import VectorEventType from 'ol/source/VectorEventType'

import { BRITISH_NATIONAL_GRID_PROJECTION } from './epsg-27700.js'

const VIEW = new View({
  center: fromLonLat([-2.263085462517795, 53.45621990568716]),
  zoom: 1,
})

const MAP = new Map({
  target: 'content',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
  ],
  view: VIEW,
})

export function zoomTo(mapLayer) {
  if (mapLayer && mapLayer.source) {
    const extent = mapLayer.source.getExtent()
    if (!(extent[0] === Infinity || extent[1] === Infinity || extent[2] === Infinity || extent[3] === Infinity)) {
      VIEW.fit(
        extent,
        {
          padding: [25, 50, 25, 50],
          duration: 1000,
        }
      )
    }
  }
}

export function zoomOnLoad(mapLayer) {
  mapLayer.source.addEventListener(VectorEventType.ADDFEATURE, function () {
    VIEW.fit(
      mapLayer.source.getExtent(),
      {
        padding: [25, 50, 25, 50],
        duration: 1000,
      }
    )
    mapLayer.source.removeEventListener(this)
  })
}

export function addLayer(mapLayer) {
  MAP.addLayer(mapLayer.layer)
}

export function removeLayer(mapLayer) {
  MAP.removeLayer(mapLayer.layer)
}

export function fadeLayer(mapLayer) {
  mapLayer.layer.setOpacity(0.5)
}

export function foregroundLayer(mapLayer) {
  mapLayer.layer.setOpacity(1)
}

export function createLayer(sourceUrl, onClick, onDeselect) {
  const source = new SourceVector({
    format: new GeoJSON({
      dataProjection: BRITISH_NATIONAL_GRID_PROJECTION,
    }),
    url: sourceUrl,
  })
  const sourceLayer = new LayerVector({
    source: source,
  })

  MAP.on("click", (event) => {
    let feature = MAP.getFeaturesAtPixel(
      event.pixel,
      {
        layerFilter: (l) => l === sourceLayer
      },
    )[0];
    if (feature) {
      onClick(feature)
    } else if (onDeselect) {
      onDeselect()
    }
  });

  return {
    source: source,
    layer: sourceLayer,
  }
}