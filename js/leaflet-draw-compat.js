/**
 * @file
 * Override methods from Leaflet.draw for compatibility with Leaflet 1.9+.
 */

/**
 * Prevent deprecation warnings:
 * "Deprecated use of _flat, please use L.LineUtil.isFlat instead."
 * Deprecated since 2017, (will be) removed in 2.x.
 */
L.Edit.Poly.include({
  _defaultShape: function () {
    if (!L.LineUtil.isFlat) {
      return this._poly._latlngs;
    }
    return L.LineUtil.isFlat(this._poly._latlngs) ? this._poly._latlngs : this._poly._latlngs[0];
  }
});

L.Edit.PolyVerticesEdit.include({
  _defaultShape: function () {
    if (!L.LineUtil.isFlat) {
      return this._latlngs;
    }
    return L.LineUtil.isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
  }
});

/**
 * Prevent deprecation warnings:
 * "wrong event specified: touchleave"
 * Also drop IE polyfill.
 */
L.Map.TouchExtend.include({
  addHooks: function () {
    L.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
    L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
    L.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);
    L.DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this);
  },
  removeHooks: function () {
    L.DomEvent.off(this._container, 'touchstart', this._onTouchStart, this);
    L.DomEvent.off(this._container, 'touchend', this._onTouchEnd, this);
    L.DomEvent.off(this._container, 'touchmove', this._onTouchMove, this);
    L.DomEvent.off(this._container, 'touchcancel', this._onTouchCancel, this);
  }
});
