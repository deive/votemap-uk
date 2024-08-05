import { createSlice } from '@reduxjs/toolkit'
import { parse, format } from 'date-fns'
import { enGB } from "date-fns/locale"

const mapSlice = createSlice({
    name: 'map',
    initialState: {
        selectedDate: format(new Date(), 'yyyy-LLL', { locale: enGB }),
        areaNames: ['UK'],
        selectedArea: 'UK',
        selectedType: 'Local Authorities',
        areas: {},
        mapUrlError: undefined,
        currentLayer: undefined,
    },
    reducers: {
        setCountriesUrl: (state, data) => {
            const area = getSelectedArea(state)
            area.years = data.payload.years
            area.selectedYear = data.payload.year

            const areaYear = getSelectedAreaYear(state, area)
            areaYear.layerDepth = 0
            areaYear.name = state.selectedArea
            areaYear.year = area.selectedYear
            areaYear.url = data.payload.url
            state.currentLayer = areaYear
        },
        setCountryUrl: (state, data) => {
            const selectedType = getSelectedType(state)
            selectedType.selected = data.payload.name

            const country = getSelectedCountry(state, selectedType)
            country.years = data.payload.years
            country.selectedYear = data.payload.year

            const countryYear = getSelectedCountryYear(state, country)
            countryYear.layerDepth = 1
            countryYear.name = selectedType.selected
            countryYear.year = country.selectedYear
            countryYear.url = data.payload.url
            state.currentLayer = countryYear
        },
        setRegionUrl: (state, data) => {
            state.currentLayer.selected = data.payload.name
            const region = getSelectedRegion(state)
            region.layerDepth = state.currentLayer.layerDepth + 1
            region.name = state.currentLayer.selected
            region.url = data.payload.url
        },
        deselectCountry: (state) => {
            const area = state.areas[state.selectedArea]
            state.currentLayer = area[area.selectedYear]
        },
        deselectRegion: (state) => {
            // const area = state.areas[state.selectedArea]
            // state.currentLayer = area[area.selectedYear]
        },
    },
})

export default mapSlice.reducer
export const { setCountriesUrl, setCountryUrl, deselectCountry, setRegionUrl, deselectRegion } = mapSlice.actions
export const selectSelectedDate = state => state.selectedDate
export const selectCurrentLayer = state => state.currentLayer
export const selectSelectedCountry = state => {
    if (state.selectedArea) {
        const selectedArea = state.areas[state.selectedArea]
        if (selectedArea && selectedArea.selectedYear) {
            const selectedAreaYear = selectedArea[selectedArea.selectedYear]
            if (selectedAreaYear && state.selectedType) {
                return selectedAreaYear[state.selectedType]?.selected
            }
        }
    }
}

function getSelectedRegion(state) {
    if (state.currentLayer && state.currentLayer.selected) {
        if (!state.currentLayer[state.currentLayer.selected]) {
            state.currentLayer[state.currentLayer.selected] = {}
        }
        return state.currentLayer[state.currentLayer.selected]
    }
}

function getSelectedCountryYear(state, country) {
    const c = country ?? getSelectedCountry(state)
    if (c && c.selectedYear) {
        if (!c[c.selectedYear]) {
            c[c.selectedYear] = {}
        }
        return c[c.selectedYear]
    }
}

function getSelectedCountry(state, selectedType) {
    const sT = selectedType ?? getSelectedType(state)
    if (sT && sT.selected) {
        if (!sT[sT.selected]) {
            sT[sT.selected] = {}
        }
        return sT[sT.selected]
    }
}

function getSelectedType(state) {
    const areaYear = getSelectedAreaYear(state)
    if (areaYear) {
        if (!areaYear[state.selectedType]) {
            areaYear[state.selectedType] = {}
        }
        return areaYear[state.selectedType]
    }
}

function getSelectedAreaYear(state, area) {
    const a = area ?? getSelectedArea(state)
    if (a.selectedYear) {
        if (!a[a.selectedYear]) {
            a[a.selectedYear] = {}
        }
        return a[a.selectedYear]
    }
}

function getSelectedArea(state) {
    if (!state.areas[state.selectedArea]) {
        state.areas[state.selectedArea] = {}
    }
    return state.areas[state.selectedArea]
}