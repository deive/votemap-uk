import store from './state'
import './auth/auth'
import './aws/aws'
import './map/map'

document.title = "UK Votes"

// TODO: Licences
// https://www.ons.gov.uk/methodology/geography/licences

// TODO: Remove or make debug only.
store.subscribe(() => console.log(store.getState()))