import { createSlice } from '@reduxjs/toolkit'

const mapSlice = createSlice({
    name: 'map',
    initialState: {
        countriesMapUrl: undefined,
        countryMapUrls: {},
        localAuthorityRegionMapUrls: {},
        mapUrlError: undefined,
    },
    reducers: {
        setCountriesMapUrl: (state, data) => {
            state.countriesMapUrl = data.payload.countriesMapUrl
        },
    },
})

export default mapSlice.reducer
export const { setCountriesMapUrl } = mapSlice.actions
export const selectCountriesMapUrl = state => state.countriesMapUrl