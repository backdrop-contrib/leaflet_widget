# Leaflet Widget

**This port is work in progress, do not use this on productions sites yet,
it is broken!**

A [Geofield](https://backdropcms.org/project/geofield) widget that provides a
Leaflet map widget with the Leaflet.widget plugin for adding features.
Leaflet.widget uses the Leaflet.draw geometry creation tools.

*Features*

- Create & manage simple geometries: Point, LineString, Polygon.
- Maintains complex geometries: MultiPoint, MultiLineString, MultiPolygon and
  GeometryCollection. (These can't be created yet but it won't mess with your
  existing data.)
- Delete geometries.
- Supports single or multi-value Geofields (cardinality).
- Use base layers defined by [Leaflet module].

## Installation:

- Install this module using the official 
  [Backdrop CMS instructions](https://backdropcms.org/guide/modules)


## Issues

Bugs and Feature requests should be reported in the 
[Issue Queue](https://github.com/backdrop-contrib/leaflet_widget/issues)


## Requires:

- Leaflet
- Geofield
- GeoPHP latest development version (conflicts with geofield)

## Current Maintainers

- Indigoxela

## Credits

- TODO

## License

This project is GPL v2 software. See the LICENSE.txt file in this directory for complete text.
