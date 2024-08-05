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
        areas: {
            'UK': {
                years: [1927],
                selectedYear: 1927,
                1927: {
                    layerDepth: 0,
                    year: 1927,
                    url: undefined,
                    'Local Authorities': {
                        'England': {
                            years: [2023],
                            2023: {
                                layerDepth: 1,
                                year: 2023,
                                url: undefined,
                                'East Midlands': {
                                    layerDepth: 2,
                                    url: undefined,
                                    'Barnsley': {
                                        layerDepth: 3,
                                        url: undefined,
                                    }
                                }
                            }
                        },
                    }
                }
            },
        },
        mapUrlError: undefined,
        currentLayer: undefined,
    },
    reducers: {
        setCountriesUrl: (state, data) => {
            if (!state.areas[state.selectedArea]) {
                state.areas[state.selectedArea] = {}
            }
            const area = state.areas[state.selectedArea]
            const year = data.payload.year
            if (!area[year]) {
                area[year] = {}
            }
            area.selectedYear = year
            area.years = data.payload.years

            const areaYear = area[year]
            areaYear.layerDepth = 0
            areaYear.year = year
            areaYear.url = data.payload.url
            state.currentLayer = areaYear
        },
        setCountryUrl: (state, data) => {
            const area = state.areas[state.selectedArea]
            const areaYear = area[area.selectedYear][state.selectedType]
            const name = data.payload.name
            if (!areaYear[name]) {
                areaYear[name] = {}
            }
            const country = areaYear[name]
            const year = data.payload.year
            country.selectedYear = year
            country.years = data.payload.years

            if (!country[year]) {
                country[year] = {}
            }
            const countryYear = country[year]
            countryYear.layerDepth = 1
            countryYear.year = year
            countryYear.url = data.payload.url
            state.currentLayer = countryYear
        },
        setRegionUrl: (state, data) => {
            // if (!state.currentLayer) {
            //     state.currentLayer = state.countries
            // } else if (state.currentLayer === state.countries) {
            //     // TODO: Select country.
            // } {
            //     // TODO: Select region/sub region.
            // }
            // state.currentLayer.url = data.payload.countriesMapUrl
        },
        deselectCountry: (state) => {
            const area = state.areas[state.selectedArea]
            state.currentLayer = area[area.selectedYear]
        },
    },
})

export default mapSlice.reducer
export const { setCountriesUrl, setCountryUrl, deselectCountry, setRegionUrl } = mapSlice.actions
export const selectSelectedDate = state => state.selectedDate
export const selectCurrentLayer = state => state.currentLayer
