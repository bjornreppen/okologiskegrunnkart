import React from "react";
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
  Delete,
  Create,
  Done,
  Undo,
  Settings
} from "@material-ui/icons";
import {
  IconButton,
  Typography,
  Collapse,
  RadioGroup,
  FormControlLabel
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import BottomTooltip from "../../Common/BottomTooltip";
import CustomRadio from "../../Common/CustomRadio";

const useStyles = makeStyles(() => ({
  customIconButtom: {
    "&.MuiIconButton-root": {
      color: "#666",
      border: "1px solid #666",
      backgroundColor: "rgba(145, 163, 176, 0)",
      padding: "8px"
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
  showPolygonOptions,
  setShowPolygonOptions
}) => {
  const classes = useStyles();

  const handleRadioChange = event => {
    handleGrensePolygon(event.target.value);
  };

  return (
    <>
      <div className="polygon-tool-wrapper">
        <div className="polygon-tool-label">
          <Typography variant="body1">Geometri</Typography>
        </div>
        <div className="polygon-buttons-wrapper">
          {polygon && grensePolygon === "none" && (
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
                >
                  <Create />
                </IconButton>
              </span>
            </BottomTooltip>
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

          <BottomTooltip placement="bottom" title="Innstillinger">
            <span className="geometry-tool-button">
              <IconButton
                className={classes.customIconButtom}
                onClick={() => {
                  setShowPolygonOptions(!showPolygonOptions);
                }}
              >
                <Settings />
              </IconButton>
            </span>
          </BottomTooltip>
          <BottomTooltip placement="bottom" title="Vis/Gjem">
            <span className="geometry-tool-button">
              <IconButton
                className={classes.customIconButtom}
                onClick={() => {
                  hideAndShowPolygon(!showPolygon);
                }}
              >
                {showPolygon ? (
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
                onClick={() => {
                  addPolygon(null);
                  addPolyline([]);
                  hideAndShowPolygon(true);
                  handleEditable(true);
                  handlePolygonResults(null);
                }}
              >
                <Delete />
              </IconButton>
            </span>
          </BottomTooltip>
        </div>
      </div>
      <Collapse
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
    </>
  );
};

export default PolygonDrawTool;
