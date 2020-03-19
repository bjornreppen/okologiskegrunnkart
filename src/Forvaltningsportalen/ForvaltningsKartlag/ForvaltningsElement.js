import Geonorge from "./Geonorge";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import React, { useState } from "react";
import språk from "../../Funksjoner/språk";
import {
  OpenInNew,
  VisibilityOutlined,
  VisibilityOffOutlined
} from "@material-ui/icons";
import {
  Typography,
  Slider,
  IconButton,
  ListItemIcon,
  Collapse,
  ListItem,
  ListItemText
} from "@material-ui/core";

const ForvaltningsElement = ({
  kartlag,
  erAktivtLag,
  onUpdateLayerProp,
  handleShowCurrent,
  show_current,
  kartlag_key,
  element
}) => {
  let tittel = kartlag.tittel;

  let kode = kartlag_key;
  const erSynlig = kartlag.erSynlig;
  const [open, setOpen] = useState(false);
  const [hasLegend, setHasLegend] = useState(true);
  if (!tittel) return null;
  let tags = kartlag.tags || null;

  return (
    <>
      <ListItem
        style={{ backgroundColor: open ? "#fff" : "#eee" }}
        button
        onClick={() => {
          setOpen(!open);
        }}
      >
        <ListItemIcon onClick={e => e.stopPropagation()}>
          <IconButton
            className="visibility_button"
            onClick={e => {
              onUpdateLayerProp(kode, "erSynlig", !erSynlig);
              e.stopPropagation();
            }}
          >
            {erSynlig ? (
              <VisibilityOutlined style={{ color: "#333" }} />
            ) : (
              <VisibilityOffOutlined style={{ color: "#aaa" }} />
            )}
          </IconButton>
        </ListItemIcon>
        <ListItemText primary={språk(tittel)} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <div
          style={{
            backgroundColor: open ? "#fff" : "#eee",
            paddingLeft: 16,
            paddingBottom: 16,
            paddingRight: 16,
            paddingTop: 16
          }}
        >
          {tags && (
            <>
              Emneknagger: <br />
              {tags.map((element, index) => {
                return (
                  <div className="tags" key={index}>
                    {element}
                  </div>
                );
              })}
            </>
          )}

          {kartlag.kart && kartlag.kart.format.wms && (
            <div style={{ marginLeft: 24 }}>
              <Typography id="range-slider" gutterBottom>
                Gjennomsiktighet
              </Typography>
              <Slider
                value={100 * kartlag.opacity}
                step={1}
                min={0}
                max={100}
                onChange={(e, v) => {
                  onUpdateLayerProp(kode, "opacity", v / 100.0);
                }}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={opacity => opacity + " %"}
              />
              {true && (
                <ListItem
                  style={{ backgroundColor: open ? "#fff" : "#eee" }}
                  button
                  onClick={e => {
                    window.open(kartlag.geonorge || "https://www.geonorge.no/");
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ListItemIcon>
                    <Geonorge />
                  </ListItemIcon>
                  <ListItemText primary="Datasettet på Geonorge.no" />
                  <OpenInNew />
                </ListItem>
              )}

              {hasLegend && (
                <>
                  <Typography id="range-slider" gutterBottom>
                    Tegnforklaring
                  </Typography>
                  <div style={{ paddingLeft: 56 }}>
                    <img
                      alt="legend"
                      onError={() => setHasLegend(false)}
                      src={`${kartlag.kart.format.wms.url}?layer=${kartlag.kart.format.wms.layer}&request=GetLegendGraphic&format=image/png&version=1.3.0`}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Collapse>
    </>
  );
};

export default ForvaltningsElement;