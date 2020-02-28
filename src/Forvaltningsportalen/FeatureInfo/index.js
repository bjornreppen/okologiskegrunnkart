import LocationSearching from "@material-ui/icons/LocationSearching";
import React from "react";
import { withRouter } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import GeneriskElement from "./GeneriskElement";

const FeatureInfo = ({
  showExtensiveInfo,
  kartlag,
  onUpdateLayerProp,
  handleExtensiveInfo,
  lat,
  lng,
  resultat,
  layersresultat,
  sted,
  kommune
}) => {
  if (!showExtensiveInfo) return null;
  if (!lat) return null;
  const coords = `${Math.round(lat * 10000) / 10000}° N ${Math.round(
    lng * 10000
  ) / 10000}° Ø`;

  const kommunestr =
    resultat &&
    resultat.kommune &&
    resultat.kommune.kommune &&
    resultat.kommune.kommune.tittel.nb +
      " kommune i " +
      resultat.kommune.fylke.tittel.nb;
  return (
    <div className="left_window">
      <div className="left_window_scrollable">
        <button
          className="close_button"
          onClick={e => {
            handleExtensiveInfo(false);
          }}
        >
          <Close />
        </button>
        <List>
          <ListSubheader disableSticky={true}>
            {lat ? coords : "Klikk i kartet..."}
          </ListSubheader>
          {lat && (
            <ListItem button>
              <ListItemIcon>
                <LocationSearching />
              </ListItemIcon>
              <ListItemText
                primary={sted && sted.navn}
                secondary={kommunestr}
              />
            </ListItem>
          )}
          {resultat !== undefined &&
            Object.keys(resultat).map(key => {
              return (
                <GeneriskElement
                  kartlag={kartlag}
                  resultat={resultat[key]}
                  element={key}
                />
              );
            })}
          {layersresultat !== undefined &&
            Object.keys(layersresultat).map(key => {
              return (
                <GeneriskElement
                  key={key}
                  kartlag={kartlag}
                  resultat={layersresultat[key]}
                  element={key}
                />
              );
            })}
        </List>
      </div>
    </div>
  );
};

export default withRouter(FeatureInfo);
