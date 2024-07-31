import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import {get as getProjection} from 'ol/proj.js';

proj4.defs('EPSG:27700',
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy "
  + "+datum=OSGB36 +units=m +no_defs");
register(proj4);
export const BRITISH_NATIONAL_GRID_PROJECTION = getProjection('EPSG:27700');