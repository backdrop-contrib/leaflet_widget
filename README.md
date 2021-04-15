# Leaflet Widget

**This port is work in progress!**

A [Geofield](https://backdropcms.org/project/geofield) widget that provides a
Leaflet map widget using the [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw)
library for adding features.

*Features*

- Create & manage simple geometries: Point, Polyline, Polygon.
- Delete geometries.
- Supports single or multi-value Geofields (cardinality).
- Uses base layers defined by Leaflet module.

## Installation

- Install this module using the official 
  [Backdrop CMS instructions](https://backdropcms.org/guide/modules)


## Issues

Bugs and Feature requests should be reported in the 
[Issue Queue](https://github.com/backdrop-contrib/leaflet_widget/issues)


## Known Issues

Values are stored as GeoJSON in Geofields, so some types (circle,
circlemarker) are not available. They could get drawn, but they can not get
saved.

Currently only "OSM Mapnik" layers are usable as drawing layer. Using
additional ones provided by the Leaflet More Maps module needs more
investigation.

The API information of this module is outdated and very likely incorrect.

## Requires

- Leaflet
- Geofield

## Current Maintainers

- [Indigoxela](https://github.com/indigoxela)

## Credits

- "Ported" to Backdrop by Indigoxela

This module is not really a port from the [Drupal version](https://www.drupal.org/project/leaflet_widget),
but rather a complete rewrite to get the Geofield widget working with a recent
Leaflet (JS library) version. To achieve this it was necessary to get rid of the
formerly used Leaflet.widget library.

This module bundles the [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw)
Javascript library by [Leaflet](http://leafletjs.com), which is
[MIT](https://github.com/Leaflet/Leaflet.draw/blob/develop/MIT-LICENSE.md)
licensed.

## License

This project is GPL v2 software. See the LICENSE.txt file in this directory for complete text.
