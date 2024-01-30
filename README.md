# Leaflet Widget

A [Geofield](https://backdropcms.org/project/geofield) widget that provides a
Leaflet map widget using the [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw)
library for adding features.

The library ships with this module, no need for an extra download.

*Leaflet Widget enables you to:*

- Insert markers based on text search widget (off by default)
- Create, edit and delete simple geometries: Point, Polyline, Polygon
- Configure available geometry types per field
- Supports single or multi-value Geofields (cardinality)
- Uses base layers defined by the Leaflet module
- API for additional base layers

![Widget screenshot](https://raw.githubusercontent.com/backdrop-contrib/leaflet_widget/1.x-1.x/screenshots/widget.webp)

## Installation

- Install this module using the official 
  [Backdrop CMS instructions](https://docs.backdropcms.org/documentation/extend-with-modules)
- Add or configure any Geofield to use the widget for input

## Requires

- Leaflet
- Geofield

## Issues

Bugs and Feature requests should be reported in the 
[Issue Queue](https://github.com/backdrop-contrib/leaflet_widget/issues)


## Known Issues

Because of the way Geofield stores values, some types (circle, circlemarker)
are not available. They could get drawn, but they couldn't get saved.

The API of this module has changed compared to Drupal. That was a necessary
step to make it useful.

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

The location search widget utilizes the [Nominatim API](https://nominatim.org/)
 via JavaScript (AJAX) to geocode text input into coordinates for markers.

## License

This project is GPL v2 software. See the LICENSE.txt file in this directory for complete text.
