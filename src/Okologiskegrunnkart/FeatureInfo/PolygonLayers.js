import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  ListItem,
  ListItemText,
  Collapse
} from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import "../../style/infobox.css";
import backend from "../../Funksjoner/backend";
import { getPolygonDepth, calculateArea } from "../../Funksjoner/polygonTools";
import { getTextAreaReport } from "../../Funksjoner/translateAreaReport";
import CustomIcon from "../../Common/CustomIcon";

const PolygonLayers = ({
  availableLayers,
  polygon,
  handlePolygonResults,
  handleLoadingFeatures
}) => {
  const [searchLayers, setSearchLayers] = useState(availableLayers);
  const [menuOpen, setMenuOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [slowLayers, setSlowLayers] = useState(false);
  const [complexPolygon, setComplexPolygon] = useState(false);
  const [polygonArea, setPolygonArea] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [matrikkelLayer, setMatrikkelLayer] = useState(false);
  const [showMatrikkelWarning, setShowMatrikkelWarning] = useState(false);

  const polygonJSON = JSON.stringify(polygon);

  const calculateAreaReport = () => {
    if (!polygon || polygon.length === 0) return;
    handlePolygonResults(null);
    const layerCodes = [];
    let errorResult = {};
    for (const layer of searchLayers) {
      if (!layer.selected || !layer.code) continue;
      layerCodes.push(layer.code);
      errorResult[layer.code] = { error: true };
    }
    if (layerCodes.length > 0) {
      const depth = getPolygonDepth(polygon);
      let wkt;
      if (depth === 2) {
        let points = "";
        for (const coord of polygon) {
          points = points + coord[1] + " " + coord[0] + ",";
        }
        // Last point has to be the same as the initial point
        points = points + polygon[0][1] + " " + polygon[0][0];
        points = "((" + points + "))";
        wkt = `SRID=4326;POLYGON ${points}`;
      } else if (depth === 3) {
        let points = "";
        for (const poly of polygon) {
          points = points + "(";
          for (const coord of poly) {
            points = points + coord[1] + " " + coord[0] + ",";
          }
          // Remove last comma
          points = points.slice(0, -1);
          points = points + "),";
        }
        // Remove last comma
        points = points.slice(0, -1);
        points = "(" + points + ")";
        wkt = `SRID=4326;POLYGON ${points}`;
      } else if (depth === 4) {
        let points = "";
        for (const multi of polygon) {
          points = points + "(";
          for (const poly of multi) {
            points = points + "(";
            for (const coord of poly) {
              points = points + coord[1] + " " + coord[0] + ",";
            }
            // Remove last comma
            points = points.slice(0, -1);
            points = points + "),";
          }
          // Remove last comma
          points = points.slice(0, -1);
          // points = "(" + points + "),";
          points = points + "),";
        }
        // Remove last comma
        points = points.slice(0, -1);
        points = "(" + points + ")";
        wkt = `SRID=4326;MULTIPOLYGON ${points}`;
      } else {
        handlePolygonResults(errorResult);
        return;
      }
      handleLoadingFeatures(true);
      backend.makeAreaReport(layerCodes, wkt).then(result => {
        if (!result) handlePolygonResults(errorResult);
        else sortAndHandlePolygonResults(result);
        handleLoadingFeatures(false);
      });
    }
  };

  const sortAndHandlePolygonResults = result => {
    let extendedResult = {};
    for (const code in result) {
      const detailResult = result[code];
      if (!detailResult || !Array.isArray(detailResult)) {
        extendedResult[code] = detailResult;
        continue;
      }
      let sorted = detailResult.sort((a, b) => {
        return b.km2 - a.km2;
      });
      if (code === "MAT") {
        sorted = sorted.map(item => {
          return {
            ...item,
            navn: item.kode,
            kode: ""
          };
        });
      }
      if (code === "BRE") {
        sorted = sorted.map(item => {
          let name =
            item.navn === "" || item.navn === " " || item.navn === "null"
              ? null
              : item.navn;
          return {
            ...item,
            navn: name,
            kode: item.kode
          };
        });
      }
      if (code === "N13") {
        sorted = sorted.map(item => {
          // NOTE: A08 has been moved to A11, but data still returns A08
          return {
            ...item,
            navn: getTextAreaReport(
              "N13",
              item.kode === "A08" ? "A11" : item.kode,
              "name"
            ),
            beskrivelse: getTextAreaReport(
              "N13",
              item.kode === "A08" ? "A11" : item.kode,
              "description"
            ),
            expandable: true
          };
        });
      }
      if (code === "NMA") {
        sorted = sorted.map(item => {
          const desc =
            getTextAreaReport("NMA", item.kode, "name") +
            ". " +
            getTextAreaReport("NMA", item.kode, "description");
          return {
            ...item,
            navn: item.navn,
            kode: item.kode,
            beskrivelse: desc,
            expandable: true
          };
        });
      }
      if (code === "NIN") {
        sorted = sorted.map(item => {
          let name = item.navn;
          name = name ? name.charAt(0).toUpperCase() + name.slice(1) : "N/A";
          return {
            ...item,
            navn: name,
            kode: null,
            beskrivelse: getTextAreaReport("NIN", item.kode, "code")
          };
        });
      }
      if (code === "ANF") {
        sorted = sorted.map(item => {
          let name = item.navn;
          name = name ? name.charAt(0).toUpperCase() + name.slice(1) : "N/A";
          return {
            ...item,
            navn: name,
            kode: item.kode
            // beskrivelse: getTextAreaReport("ANF", item.kode, "description")
          };
        });
      }
      if (code === "MAG") {
        sorted = sorted.map(item => {
          return {
            ...item,
            navn: item.navn,
            kode: item.kode,
            beskrivelse: getTextAreaReport("MAG", item.kode, "code")
          };
        });
      }
      extendedResult[code] = sorted;
    }
    handlePolygonResults(extendedResult);
  };

  const handleChange = (e, selectedLayerName) => {
    let layers = [...searchLayers];
    for (let layer of layers) {
      if (layer.name === selectedLayerName) {
        layer.selected = e.target.checked;
      }
    }
    setSearchLayers(layers);
  };

  useEffect(() => {
    if (!polygon) {
      setDisabled(true);
      return;
    }
    const depth = getPolygonDepth(polygon);
    if (depth === 2 && polygon.length > 2) setDisabled(false);
    else if (depth === 3 && polygon[0].length > 2) setDisabled(false);
    else if (depth === 4 && polygon[0][0].length > 2) setDisabled(false);
    else setDisabled(true);
  }, [polygon, polygonJSON]);

  useEffect(() => {
    if (!searchLayers) {
      setSlowLayers(false);
      setMatrikkelLayer(false);
      return;
    }
    // Check selected layers
    const complexLayers = searchLayers.filter(
      item => item.selected && !["FYL", "KOM"].includes(item.code)
    );
    if (complexLayers.length > 0) setSlowLayers(true);
    else setSlowLayers(false);

    // Matrikkel layer
    const matrikkelLayer = searchLayers.filter(
      item => item.code === "MAT" && item.selected
    );
    if (matrikkelLayer.length > 0) setMatrikkelLayer(true);
    else setMatrikkelLayer(false);
  }, [searchLayers]);

  useEffect(() => {
    if (!polygon || !slowLayers) {
      setComplexPolygon(false);
      return;
    }

    // Check polygon complexity
    const limit = 5000;
    const depth = getPolygonDepth(polygon);
    if (depth === 2 && polygon.length > 2) {
      if (polygon.length > limit) {
        setComplexPolygon(true);
        return;
      }
    } else if (depth === 3 && polygon[0].length > 2) {
      for (const poly of polygon) {
        if (poly.length > limit) {
          setComplexPolygon(true);
          return;
        }
      }
    } else if (depth === 4 && polygon[0][0].length > 2) {
      for (const multipoly of polygon) {
        for (const poly of multipoly) {
          if (poly.length > limit) {
            setComplexPolygon(true);
            return;
          }
        }
      }
    }
  }, [polygon, polygonJSON, slowLayers]);

  useEffect(() => {
    if (!polygon || ((!slowLayers || !complexPolygon) && !matrikkelLayer)) {
      setPolygonArea(0);
      return;
    }

    // Calculate main area
    let points;
    let area = 0;
    const depth = getPolygonDepth(polygon);
    if (depth === 2) {
      // Only one polygon
      points = polygon;
      area += calculateArea(points);
    } else if (depth === 3) {
      // Polygon with holes. Substract areas if there are holes
      points = polygon[0];
      area += calculateArea(points);
      if (polygon.length > 1) {
        for (let i = 1; i < polygon.length; i++) {
          const hole = polygon[i];
          if (hole.length < 3) continue;
          area -= calculateArea(hole);
        }
      }
    } else if (depth === 4) {
      // Multipolygon. Substract areas if there are holes
      for (const poly of polygon) {
        points = poly[0];
        area += calculateArea(points);
        if (poly.length > 1) {
          for (let i = 1; i < poly.length; i++) {
            const hole = poly[i];
            if (hole.length < 3) continue;
            area -= calculateArea(hole);
          }
        }
      }
    }

    area = area / 1000000;
    setPolygonArea(area);
  }, [polygon, polygonJSON, slowLayers, matrikkelLayer, complexPolygon]);

  useEffect(() => {
    if (slowLayers && complexPolygon && polygonArea > 5000)
      setShowWarning(true);
    else if (slowLayers && matrikkelLayer && polygonArea > 20000)
      setShowWarning(true);
    else setShowWarning(false);

    if (matrikkelLayer && polygonArea > 2000) setShowMatrikkelWarning(true);
    else setShowMatrikkelWarning(false);
  }, [slowLayers, complexPolygon, polygonArea, matrikkelLayer]);

  return (
    <div
      className={
        menuOpen ? "polygon-layers-wrapper expanded" : "polygon-layers-wrapper"
      }
    >
      <ListItem
        id={disabled ? "polygon-layer-disabled" : "polygon-layer-expander"}
        button
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <ListItemText
          primary={
            disabled ? "Arealrapport (polygon ikke definert)" : "Arealrapport"
          }
        />
        {menuOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse
        id="polygon-layers-collapse"
        in={menuOpen}
        timeout="auto"
        unmountOnExit
      >
        <div className="polygon-layers-content">
          <div className="polygon-checkbox-content">
            {searchLayers.map((layer, index) => {
              return (
                <div key={index} className="polygon-layers-item">
                  <div className={disabled ? "polygon-layers-disabled" : ""}>
                    {layer.name}
                  </div>
                  <Checkbox
                    id={`select-layers-checkbox-${layer.code.toLowerCase()}`}
                    checked={layer.selected}
                    onChange={e => handleChange(e, layer.name)}
                    color="default"
                    disabled={disabled}
                  />
                </div>
              );
            })}
          </div>
          <div className="polygon-button-wrapper">
            <Button
              id="polygon-run-button"
              variant="contained"
              size="small"
              onClick={() => {
                calculateAreaReport();
              }}
              disabled={disabled}
            >
              Lag arealrapport
            </Button>
          </div>
          {!disabled && showWarning && (
            <div className="polygon-report-warning">
              <div className="polygon-report-warning-content">
                <CustomIcon
                  id="polygon-report-warning-icon"
                  icon="clock-alert"
                  size={24}
                  color="#697f8a"
                />
                <span className="polygon-report-warning-text">
                  Arealrapport kan ta flere minutter for store, komplekse
                  polygoner og de valgte rapporter
                </span>
              </div>
            </div>
          )}
          {!disabled && showMatrikkelWarning && (
            <div className="polygon-report-warning">
              <div className="polygon-report-warning-content">
                <CustomIcon
                  id="polygon-report-warning-icon"
                  icon="clock-alert"
                  size={24}
                  color="#697f8a"
                />
                <span className="polygon-report-warning-text">
                  Eiendommer rapport kan gi veldig mange resultater for store
                  arealer
                </span>
              </div>
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default PolygonLayers;