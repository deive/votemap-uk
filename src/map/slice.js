import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// import { createSignedMapUrl, logout } from '../api/slice.js'
import { getCountriesMapUrl } from '../aws/aws'
import { COUNTRIES_FILE_NAME, COUNTRY_FILE_NAMES } from './ons.js'

export const loadCountriesMapUrl = createAsyncThunk(
    'map/loadCountriesMapUrl',
    async (thunkAPI) => {
        const url = getCountriesMapUrl()
        if (url) {
            return url
        } else {
            return thunkAPI.rejectWithValue("Error in getCountriesMapUrl()")
        }
    }
)

export const loadCountryMapUrl = createAsyncThunk(
    'map/loadCountryMapUrl',
    async (details, thunkAPI) => {
        return thunkAPI.rejectWithValue("WRONG")
        // const fileName = COUNTRY_FILE_NAMES[details.country]
        // if (!fileName) return thunkAPI.rejectWithValue(`No country: ${details.country}`)

        // const response = await createSignedMapUrl(fileName)
        // const url = processSignedUrlResponse(response, thunkAPI)
        // if (!response.error) {
        //     return {
        //         name: details.country,
        //         url: url,
        //     }
        // } else {
        //     return url
        // }
    }
)

export const loadLocalAuthorityRegionMapUrl = createAsyncThunk(
    'map/loadLocalAuthorityRegionMapUrl',
    async (details, thunkAPI) => {
        return thunkAPI.rejectWithValue("WRONG")
        // const name = details.region.replaceAll(" ", "_")
        // const response = await createSignedMapUrl(`${details.country}/Local Authorities/${details.year}/${name}.geojson`)
        // const url = processSignedUrlResponse(response, thunkAPI)
        // if (!response.error) {
        //     return {
        //         country: details.country,
        //         year: details.year,
        //         name: details.region,
        //         url: url,
        //     }
        // } else {
        //     return url
        // }
    }
)

const mapSlice = createSlice({
    name: 'map',
    initialState: {
        countriesMapUrl: undefined,
        countryMapUrls: {},
        localAuthorityRegionMapUrls: {
            'England': {},
            'Northern Ireland': {},
            'Scotland': {},
            'Wales': {},
        },
        mapUrlError: undefined,
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadCountriesMapUrl.fulfilled, (state, action) => {
                state.countriesMapUrl = action.payload
            })
            .addCase(loadCountryMapUrl.fulfilled, (state, action) => {
                state.countryMapUrls[action.payload.name] = action.payload.url
            })
            .addCase(loadLocalAuthorityRegionMapUrl.fulfilled, (state, action) => {
                const countries = state.localAuthorityRegionMapUrls[action.payload.country]
                if (!countries[action.payload.year]) countries[action.payload.year] = {}
                countries[action.payload.year][action.payload.name] = action.payload.url
            })
            .addCase(loadCountriesMapUrl.rejected, (state, action) => {
                state.mapUrlError = action.error
            })
            .addCase(loadCountryMapUrl.rejected, (state, action) => {
                state.mapUrlError = action.error
            })
            .addCase(loadLocalAuthorityRegionMapUrl.rejected, (state, action) => {
                state.mapUrlError = action.error
            })
    },
})

export const selectCountriesMapUrl = state => state.countriesMapUrl
export const selectCountryMapUrl = (state, country) => state.countryMapUrls[country]
export const selectLocalAuthorityRegionMapUrl = (state, country, year, name) => {
    if (state.localAuthorityRegionMapUrls[country] && state.localAuthorityRegionMapUrls[country][year])
        return state.localAuthorityRegionMapUrls[country][year][name]
    else
        return undefined
}
export const selectMapUrlError = state => state.mapUrlError
    

export default mapSlice.reducer

function processSignedUrlResponse(response, thunkAPI) {
    if (response.error) {
        return thunkAPI.rejectWithValue(response.error.toJSON())
    }
    return response.data.signedUrl
}