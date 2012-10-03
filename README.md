# Geofield Leaflet

A [Geofield] widget that provides a [Leaflet] map with the [Leaflet.draw] 
plugin for adding features.

## Features:

Supports creation of simple geometries:

- Point
- LineString
- Polygon

And creation of complex geometries:

- MultiPoint
- MultiLineString
- MultiPolygon

Can be used with single-valued or multi-valued Geofields (cardinality).

__Note: due to a side-effect of Geofield's GeoJSON storage, currently all 
geometries of the same type will be grouped into their complex equivalent and 
stored as a single field value.__

## Installation tips:

- Currently Geofield Leaflet uses the [Leaflet] library provided by the 
[Leaflet Drupal] module.  
- This module requires the latest dev release of [GeoPHP] as there are issues 
with parsing GeoJSON in the latest stable release.
- Make sure you have the most recent version of the [Leaflet.draw] plugin in 
your 'libraries' directory (see [Libraries API].

[Leaflet]: http://leaflet.cloudmade.com
[GeoPHP]: http://drupal.org/project/geophp
[Leaflet Drupal]: http://drupal.org/project/leaflet
[Geofield]: http://drupal.org/project/geofield
[Leaflet.draw]: https://github.com/jacobtoye/Leaflet.draw
[Libraries API]: http://drupal.org/project/libraries
