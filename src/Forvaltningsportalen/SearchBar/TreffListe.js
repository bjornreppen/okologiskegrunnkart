import React from "react";

const TreffListe = props => {
  let treffliste_lokalt = props.treffliste_lokalt;
  let treffliste_sted = props.treffliste_sted;
  let treffliste_knrgnrbnr = props.treffliste_knrgnrbnr;
  let treffliste_knr = props.treffliste_knr;
  let treffliste_gnr = props.treffliste_gnr;
  let treffliste_bnr = props.treffliste_bnr;

  // De faktiske listene å iterere - initialisering
  let knrgnrbnr = null;
  let knr = null;
  let bnr = null;
  let gnr = null;

  // Lengder på ting:
  let stedlength = (treffliste_sted && treffliste_sted.length) || 0;
  let kartlaglength = (treffliste_lokalt && treffliste_lokalt.length) || 0;
  let list_items = [];
  let list_length = 0;

  if (treffliste_knr && treffliste_knr.stedsnavn) {
    knr = treffliste_knr.stedsnavn;
    knr["trefftype"] = "Kommune";
    list_items = list_items.concat(knr);
    list_length = list_items.length;
  }

  if (treffliste_gnr && treffliste_gnr.adresser) {
    gnr = treffliste_gnr.adresser;
    for (let i in gnr) {
      gnr[i]["trefftype"] = "GNR";
    }
    list_items = list_items.concat(gnr);
    list_length = list_items.length;
  }

  if (treffliste_bnr && treffliste_bnr.adresser) {
    bnr = treffliste_bnr.adresser;
    for (let i in bnr) {
      bnr[i]["trefftype"] = "BNR";
    }
    list_items = list_items.concat(bnr);
    list_length = list_items.length;
  }

  if (treffliste_knrgnrbnr && treffliste_knrgnrbnr.adresser) {
    knrgnrbnr = treffliste_knrgnrbnr.adresser;
    for (let i in knrgnrbnr) {
      knrgnrbnr[i]["trefftype"] = "knrgnrbnr";
    }
    list_items = list_items.concat(knrgnrbnr);
    list_length = list_items.length;
  }

  let total_length = stedlength + kartlaglength + list_length;

  function movefocus(e, index) {
    if (e.keyCode === 27) {
      if (props.handleRemoveTreffliste) {
        props.handleRemoveTreffliste();
        props.handleSearchBar(null);
        document.getElementById("searchfield").value = "";
        document.getElementById("searchfield").focus();
      }
    }
    if (document.getElementsByClassName("searchbar_item")) {
      // nedoverpil
      if (e.keyCode === 40) {
        //console.log(index, total_length - 1);
        //console.log(index < total_length - 1);
        if (index < total_length - 1) {
          document.getElementsByClassName("searchbar_item")[index + 1].focus();
        }
      }
      // oppoverpil
      if (e.keyCode === 38) {
        let nextindex = index - 1;
        if (nextindex < 0) {
          document.getElementById("searchfield").focus();
        } else {
          document.getElementsByClassName("searchbar_item")[index - 1].focus();
        }
      }
    }
  }

  return (
    <ul
      className="treffliste"
      id="treffliste"
      tabIndex="0"
      onKeyDown={e => {
        if (e.keyCode === 40 || e.keyCode === 38) {
          e.preventDefault();
        }
      }}
    >
      {stedlength > 0 &&
        treffliste_sted.map((item, index) => {
          let itemname = item.stedsnavn || "";
          let itemtype = item.navnetype || "";
          let itemnr = item.ssrId || "";
          return (
            <li
              id={index}
              key={index}
              tabIndex="0"
              className="searchbar_item"
              onKeyDown={e => {
                if (e.keyCode === 13) {
                  //Enterpressed
                  if (!props.isSearchResultPage) {
                    props.removeValgtLag();
                    props.handleRemoveTreffliste();
                    document.getElementById("searchfield").value = "";
                  }
                  props.handleGeoSelection(item);
                } else {
                  movefocus(e, index);
                }
              }}
              onClick={() => {
                if (!props.isSearchResultPage) {
                  props.removeValgtLag();
                  props.handleRemoveTreffliste();
                  document.getElementById("searchfield").value = "";
                }
                props.handleGeoSelection(item);
              }}
            >
              <span className="itemname">{itemname} </span>
              <span className="itemtype">{itemtype} </span>
              <span className="itemnr">{itemnr} </span>
            </li>
          );
        })}

      {kartlaglength > 0 &&
        treffliste_lokalt.map((item, index) => {
          let full_index = index + stedlength;
          let itemname = item.tittel;
          let itemtype = "Kartlag";
          let itemowner = item.dataeier;
          let tema = item.tema || "";
          return (
            <li
              tabIndex="0"
              id={full_index}
              key={full_index}
              className="searchbar_item"
              onKeyDown={e => {
                if (e.keyCode === 13) {
                  //Enterpressed
                  if (!props.isSearchResultPage) {
                    props.handleRemoveTreffliste();
                    document.getElementById("searchfield").value = "";
                  } else {
                    props.setSearchResultPage(false);
                  }
                  props.removeValgtLag();
                  props.addValgtLag(item);
                } else {
                  movefocus(e, full_index);
                }
              }}
              onClick={() => {
                if (!props.isSearchResultPage) {
                  props.handleRemoveTreffliste();
                  document.getElementById("searchfield").value = "";
                } else {
                  props.setSearchResultPage(false);
                }
                props.removeValgtLag();
                props.addValgtLag(item);
              }}
            >
              <span className="itemname">{itemname} </span>
              <span className="itemtype">
                {itemtype}, {itemowner}{" "}
              </span>
              <span className="itemnr">{tema}</span>
            </li>
          );
        })}

      {list_items &&
        list_items.map((item, index) => {
          let itemname = item.adressetekst || "";
          if (item.trefftype === "Kommune") {
            console.log(item);
            itemname = item.kommunenavn || "finner ikke kommunenavnet??";
          }
          let trefftype = item.trefftype || "annet treff";
          let full_index = kartlaglength + stedlength + index;

          return (
            <li
              id={full_index}
              key={full_index}
              tabIndex="0"
              className="searchbar_item"
              onKeyDown={e => {
                if (e.keyCode === 13) {
                  //Enterpressed
                  if (!props.isSearchResultPage) {
                    props.handleRemoveTreffliste();
                    document.getElementById("searchfield").value = "";
                  } else {
                    props.setSearchResultPage(false);
                  }
                  props.handleGeoSelection(item);
                } else {
                  movefocus(e, full_index);
                }
              }}
              onClick={() => {
                if (!props.isSearchResultPage) {
                  props.removeValgtLag();
                  props.handleRemoveTreffliste();
                  document.getElementById("searchfield").value = "";
                  if (trefftype === "Kommune") {
                    props.handleGeoSelection(knr);
                  } else {
                    props.handleGeoSelection(item);
                  }
                }
              }}
            >
              <span className="itemname">{itemname} </span>
              <span className="itemtype">
                {trefftype} {item.postnummer} {item.poststed}
              </span>
              <span className="itemnr">
                {trefftype === "Kommune" ? (
                  <b>{knr.knr}</b>
                ) : (
                  <>
                    {trefftype === "KNR" ? (
                      <b>{item.kommunenummer}</b>
                    ) : (
                      <>{item.kommunenummer}</>
                    )}
                    -
                    {trefftype === "GNR" ? (
                      <b>{item.gardsnummer}</b>
                    ) : (
                      <>{item.gardsnummer}</>
                    )}
                    -
                    {trefftype === "BNR" ? (
                      <b>{item.bruksnummer}</b>
                    ) : (
                      <>{item.bruksnummer}</>
                    )}
                  </>
                )}
              </span>
            </li>
          );
        })}
    </ul>
  );
};

export default TreffListe;
