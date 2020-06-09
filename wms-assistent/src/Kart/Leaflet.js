import L, { LatLng } from "leaflet";
// -- WEBPACK: Load styles --
import "leaflet/dist/leaflet.css";
import React from "react";
import "./leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

class Leaflet extends React.Component {
  componentDidMount() {
    this.wms = {};
    const options = {
      zoomControl: true,
      inertia: true,
      minZoom: 3,
    };

    let map = L.map(this.mapEl, options);
    // For servere som bare støtter 900913
    L.CRS.EPSG900913 = Object.assign({}, L.CRS.EPSG3857);
    L.CRS.EPSG900913.code = "EPSG:900913";

    map.setView(
      [this.props.latitude, this.props.longitude],
      this.props.zoom * 1.8
    );
    map.on("click", (e) => {
      const latlng = e.latlng;
      this.props.onClick(latlng.lng, latlng.lat, this.map.getZoom());
    });
    map.on("load", (e) => {
      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    });
    map.whenReady(() => {
      map.invalidateSize();
    });
    setTimeout(() => {
      map.invalidateSize();
    }, 5000);

    this.marker = L.marker([0, 0]);
    this.updateMarker(this.props.layer.testkoordinater);
    this.marker.addTo(map);
    /*        </div>
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
        */

    L.tileLayer(
      `https://gatekeeper2.geonorge.no/BaatGatekeeper/gk/gk.cache_wmts?&gkt=${this.props.token}&layer=egk&style=default&tilematrixset=EPSG%3A900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A900913%3A{z}&TileCol={x}&TileRow={y}`,
      { opacity: 0.5 }
    ).addTo(map);

    L.tileLayer(
      `https://gatekeeper2.geonorge.no/BaatGatekeeper/gk/gk.cache_wmts?&gkt=${this.props.token}&layer=topo4&style=default&tilematrixset=EPSG%3A900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A900913%3A{z}&TileCol={x}&TileRow={y}`,
      { opacity: 0.2 }
    ).addTo(map);

    this.map = map;
  }

  erEndret(prevProps) {
    if (this.props.layer !== prevProps.layer) return true;
    if (this.props.marker !== prevProps.marker) return true;
    if (this.props.token !== prevProps.token) return true;
  }

  componentDidUpdate(prevProps) {
    if (this.props.bounds !== prevProps.bounds) {
      const bounds = this.props.bounds;
      if (bounds) {
        this.map.flyToBounds(bounds);
      }
    }
    if (this.erEndret(prevProps)) {
      this.updateMap(this.props);
      return;
    }
  }

  updateMap(props) {
    if (!this.props.token) return; // not yet loaded
    this.updateMarker(props.layer.testkoordinater);
    this.syncWmsLayers(props.layer);
  }

  updateMarker(koords) {
    const tc = (koords || "").split(",").map((e) => parseFloat(e));
    if (tc.length !== 2) return;
    try {
      const latlng = new LatLng(tc[1], tc[0]);
      this.marker.setLatLng(latlng);
    } catch (e) {
      console.error(e);
    }
  }

  syncUnderlag(config, underlag) {
    if (!underlag) return;
    const wmsurl = new URL(config.wmsurl);
    const search = wmsurl.searchParams;
    search.delete("request");
    search.delete("service");
    search.delete("version");
    var layer = this.wms[underlag.wmslayer];
    if (underlag.erSynlig) {
      if (!layer) {
        layer = L.tileLayer.wms(wmsurl.toString(), {
          layers: underlag.wmslayer,
          transparent: true,
          crs: config.crs === "EPSG:3857" ? L.CRS.EPSG3857 : L.CRS.EPSG900913,
          format: "image/png",
          opacity: 0.95,
        });
        this.wms[underlag.wmslayer] = layer;
        //console.log('layer', layer)
        this.map.addLayer(layer);
      }
      layer.setOpacity(underlag.opacity);
    }
  }

  syncWmsLayers(config) {
    if (!config || !config.underlag) return;
    const keys = config.underlag.reduce((acc, e) => {
      if (e.erSynlig) acc[e.wmslayer] = true;
      return acc;
    }, {});
    Object.keys(this.wms).forEach((key) => {
      if (!keys[key]) this.map.removeLayer(this.wms[key]);
    });
    for (var ul of config.underlag) this.syncUnderlag(config, ul);
  }

  makeWmsUrl(url) {
    url = url.replace(/request=GetCapabilities/gi, "");
    url = url.replace(/service=WMS/gi, "");
    url = url.replace(/[&?]*$/gi, "");
    url = url.replace("{gkt}", this.props.token);
    var srs = url.match(/srs=(?<srs>[^&]+)/i);
    url = url.replace(/srs=(?<srs>[^&]+)/i, "");
    return { url, srs: srs && srs.groups.srs.replace(":", "") };
  }

  render() {
    return (
      <div
        style={{ zIndex: -100, cursor: "default" }}
        ref={(ref) => {
          this.mapEl = ref;
        }}
      />
    );
  }
}

export default Leaflet;