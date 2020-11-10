import React, { useState, useEffect } from "react";
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
  Delete,
  Create,
  Done,
  Undo,
  ExpandLess,
  ExpandMore,
  Forward,
  Folder,
  Save
} from "@material-ui/icons";
import {
  IconButton,
  Typography,
  Collapse,
  RadioGroup,
  FormControlLabel,
  ListItem,
  ListItemText,
  Snackbar
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import BottomTooltip from "../../Common/BottomTooltip";
import CustomRadio from "../../Common/CustomRadio";
import { sortPolygonCoord } from "../../Funksjoner/polygonTools";

const useStyles = makeStyles(() => ({
  customIconButtom: {
    "&.MuiIconButton-root": {
      color: "#666",
      border: "1px solid #666",
      backgroundColor: "rgba(145, 163, 176, 0)",
      padding: "10px"
    },
    "&:hover": {
      backgroundColor: "rgba(145, 163, 176, 0.5)"
    },
    "&.Mui-disabled": {
      color: "#999",
      border: "1px solid #999"
    }
  }
}));

const PolygonDrawTool = ({
  polygon,
  polyline,
  showPolygon,
  hideAndShowPolygon,
  handleEditable,
  addPolygon,
  addPolyline,
  handlePolygonResults,
  grensePolygon,
  handleGrensePolygon,
  removeGrensePolygon,
  showPolygonOptions,
  setShowPolygonOptions,
  showFylkePolygon,
  showKommunePolygon,
  showEiendomPolygon,
  uploadedPolygon,
  handleUploadedPolygon
}) => {
  const classes = useStyles();

  const [polygonVisible, setPolygonVisible] = useState(true);
  const [showUploadError, setShowUploadError] = useState(false);

  const handleRadioChange = event => {
    handleGrensePolygon(event.target.value);
  };

  const deletePolygon = () => {
    if (grensePolygon === "none") {
      addPolygon(null);
      addPolyline([]);
      handleEditable(true);
    } else {
      removeGrensePolygon();
    }
    hideAndShowPolygon(true);
    handlePolygonResults(null);
    handleUploadedPolygon(false);
  };

  const hideShowPolygon = () => {
    if (grensePolygon === "none") {
      hideAndShowPolygon(!showPolygon);
    } else if (grensePolygon === "fylke") {
      hideAndShowPolygon(!showFylkePolygon);
    } else if (grensePolygon === "kommune") {
      hideAndShowPolygon(!showKommunePolygon);
    } else if (grensePolygon === "eiendom") {
      hideAndShowPolygon(!showEiendomPolygon);
    }
  };

  const selectFile = () => {
    const fileSelector = document.getElementById("file-input");
    fileSelector.click();

    fileSelector.onchange = () => {
      const selectedFiles = fileSelector.files;
      if (fileSelector.files.length > 0) {
        const reader = new FileReader();

        // This event will happen when the reader has read the file
        reader.onload = () => {
          var result = JSON.parse(reader.result);
          const allGeoms = [];
          if (result && result.features && result.features.length > 0) {
            for (const geom of result.features) {
              if (
                geom.geometry &&
                geom.geometry &&
                geom.geometry.coordinates &&
                geom.geometry.coordinates.length > 0
              ) {
                allGeoms.push(sortPolygonCoord(geom.geometry));
              }
            }
            addPolygon(allGeoms);
            addPolyline([]);
            handleUploadedPolygon(true);
          } else {
            setShowUploadError(true);
          }

          if (allGeoms.length === 0) {
            setShowUploadError(true);
          }
          document.getElementById("file-input").value = "";
        };
        reader.readAsText(selectedFiles[0]);
      }
    };
  };

  const closeUploadError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowUploadError(false);
  };

  useEffect(() => {
    if (grensePolygon === "none") {
      setPolygonVisible(showPolygon);
    } else if (grensePolygon === "fylke") {
      setPolygonVisible(showFylkePolygon);
    } else if (grensePolygon === "kommune") {
      setPolygonVisible(showKommunePolygon);
    } else if (grensePolygon === "eiendom") {
      setPolygonVisible(showEiendomPolygon);
    }
  }, [
    grensePolygon,
    showPolygon,
    showFylkePolygon,
    showKommunePolygon,
    showEiendomPolygon
  ]);

  return (
    <>
      <div className="polygon-options-listitem-wrapper">
        <ListItem
          id="polygon-options-listitem"
          button
          onClick={e => {
            setShowPolygonOptions(!showPolygonOptions);
          }}
        >
          <ListItemText primary="Velg polygon" />
          {showPolygonOptions ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </div>
      <Collapse
        id="select-polygon-collapse"
        in={showPolygonOptions}
        timeout="auto"
        unmountOnExit
        // Underelementet
      >
        <div className="polygon-options-container">
          <div className="infobox-radio-buttons-title">
            Definer polygon fra grenser
          </div>
          <div className="infobox-radio-buttons-container">
            <RadioGroup
              aria-label="export"
              name="export1"
              value={grensePolygon}
              onChange={handleRadioChange}
            >
              <FormControlLabel
                id="infobox-radio-label"
                value="none"
                control={<CustomRadio />}
                label="Ingen (selvtegnet)"
              />
              <FormControlLabel
                id="infobox-radio-label"
                value="fylke"
                control={<CustomRadio />}
                label="Fylke"
              />
              <FormControlLabel
                id="infobox-radio-label"
                value="kommune"
                control={<CustomRadio />}
                label="Kommune"
              />
              <FormControlLabel
                id="infobox-radio-label"
                value="eiendom"
                control={<CustomRadio />}
                label="Eiendom"
              />
            </RadioGroup>
          </div>
        </div>
      </Collapse>

      <div
        className={
          grensePolygon === "none"
            ? "polygon-tool-wrapper vertical"
            : "polygon-tool-wrapper"
        }
      >
        <div
          className={
            grensePolygon === "none"
              ? "polygon-tool-label vertical"
              : "polygon-tool-label"
          }
        >
          <Typography variant="body1">Geometri</Typography>
        </div>
        <div className="polygon-buttons-wrapper">
          {/* !polygon && polyline.length === 0 && grensePolygon === "none" && */}
          {grensePolygon === "none" && (
            <>
              <BottomTooltip placement="bottom" title="Laste opp polygon">
                <span className="geometry-tool-button first-tool">
                  <IconButton
                    className={classes.customIconButtom}
                    onClick={() => selectFile()}
                  >
                    <Forward style={{ transform: "rotate(-90deg)" }} />
                  </IconButton>
                </span>
              </BottomTooltip>
              <BottomTooltip placement="bottom" title="Åpne lagret polygon">
                <span className="geometry-tool-button">
                  <IconButton
                    className={classes.customIconButtom}
                    onClick={() => {
                      console.log("Functionality not implemented");
                    }}
                  >
                    <Folder />
                  </IconButton>
                </span>
              </BottomTooltip>
            </>
          )}

          {polygon && grensePolygon === "none" && (
            <>
              <BottomTooltip placement="bottom" title="Lagre polygon">
                <span className="geometry-tool-button">
                  <IconButton
                    className={classes.customIconButtom}
                    onClick={() => {
                      console.log("Functionality not implemented");
                    }}
                  >
                    <Save />
                  </IconButton>
                </span>
              </BottomTooltip>
              <BottomTooltip placement="bottom" title="Rediger">
                <span className="geometry-tool-button">
                  <IconButton
                    className={classes.customIconButtom}
                    onClick={() => {
                      addPolygon(null);
                      addPolyline(polygon);
                      handleEditable(true);
                      handlePolygonResults(null);
                    }}
                    disabled={uploadedPolygon}
                  >
                    <Create />
                  </IconButton>
                </span>
              </BottomTooltip>
            </>
          )}

          {!polygon && grensePolygon === "none" && (
            <>
              <BottomTooltip placement="bottom" title="Angre sist">
                <span className="geometry-tool-button">
                  <IconButton
                    className={classes.customIconButtom}
                    onClick={() => {
                      if (polyline.length > 0) {
                        polyline.pop();
                        addPolyline(polyline);
                      }
                    }}
                  >
                    <Undo />
                  </IconButton>
                </span>
              </BottomTooltip>
              <BottomTooltip placement="bottom" title="Ferdig">
                <span className="geometry-tool-button">
                  <IconButton
                    className={classes.customIconButtom}
                    onClick={() => {
                      if (polyline.length > 1) {
                        addPolygon(polyline);
                        addPolyline([]);
                      }
                    }}
                  >
                    <Done />
                  </IconButton>
                </span>
              </BottomTooltip>
            </>
          )}

          <BottomTooltip placement="bottom" title="Vis/Gjem">
            <span className="geometry-tool-button">
              <IconButton
                className={classes.customIconButtom}
                onClick={() => hideShowPolygon()}
              >
                {polygonVisible ? (
                  <VisibilityOutlined />
                ) : (
                  <VisibilityOffOutlined />
                )}
              </IconButton>
            </span>
          </BottomTooltip>

          <BottomTooltip placement="bottom" title="Fjern">
            <span className="geometry-tool-button">
              <IconButton
                className={classes.customIconButtom}
                onClick={() => deletePolygon()}
              >
                <Delete />
              </IconButton>
            </span>
          </BottomTooltip>
        </div>
      </div>
      <input
        style={{ display: "none" }}
        type="file"
        id="file-input"
        name="file"
        accept=".geojson, .json"
      />
      <Snackbar
        open={showUploadError}
        autoHideDuration={3000}
        onClose={closeUploadError}
      >
        <Alert severity="error">Kunne ikke laste opp filen</Alert>
      </Snackbar>
    </>
  );
};

export default PolygonDrawTool;
