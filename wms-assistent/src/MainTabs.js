import React from "react";
import { Paper, Tabs, Tab } from "@material-ui/core";
import Tjeneste from "./Tjeneste";
import TextField2 from "./TextField2";
import { Create as CreateIcon } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import KartlagListItem from "./KartlagListItem";
import KlikkResultatPreview from "./KlikkResultatPreview";

const MainTabs = ({
  tab,
  setTab,
  doc,
  id,
  feature,
  setFeature,
  setDoc,
  handleUpdate,
  onUpdateLayerField,
  sub,
  selectedLayerIndex,
  writeUpdate
}) => {
  const history = useHistory();
  if (!doc) return null;
  if (!doc.underlag) return null;
  const layer = doc.underlag[selectedLayerIndex];
  return (
    <>
      {tab === 0 && (
        <TabPanel value={tab} index={0}>
          <TextField2
            title="WMS URL"
            dockey="wmsurl"
            doc={doc}
            onUpdate={handleUpdate}
          />
          <TextField2
            title="WMS version"
            dockey="wmsversion"
            doc={doc}
            onUpdate={handleUpdate}
          />
          <TextField2
            title="Projeksjon"
            dockey="projeksjon"
            doc={doc}
            onUpdate={handleUpdate}
          />
          <TextField2
            title="API URL (hvis tom brukes WMS url)"
            dockey="klikkurl"
            doc={doc}
            onUpdate={handleUpdate}
          />
          <TextField2
            title="Featureinfo format"
            dockey="wmsinfoformat"
            doc={doc}
            onUpdate={handleUpdate}
          />
          <TextField2
            title="Faktaark URL"
            dockey="faktaark"
            doc={doc}
            onUpdate={handleUpdate}
            onIconClick={() => {
              history.push(`?id=${doc._id}&sub=faktaark`);
            }}
            icon={<CreateIcon />}
          />
        </TabPanel>
      )}
      {tab === 1 && (
        <TabPanel value={tab} index={1}>
          <KartlagListItem layer={layer} />
          {doc && (
            <>
              <Tjeneste
                key={id}
                doc={doc}
                feature={feature}
                setFeature={setFeature}
                onSetDoc={setDoc}
                onUpdateLayerField={onUpdateLayerField}
                onSave={() => writeUpdate(doc)}
                sub={sub}
                selectedLayerIndex={selectedLayerIndex}
              />
              <KlikkResultatPreview layer={layer} feature={feature} />
            </>
          )}
        </TabPanel>
      )}
      <Paper square style={{ position: "fixed", bottom: 0, width: 508 }}>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          centered
          onChange={(e, v) => setTab(v)}
          aria-label="disabled tabs example"
        >
          <Tab label="WMS" />
          <Tab label="Layers" />
        </Tabs>
      </Paper>
    </>
  );
};

const TabPanel = ({ children }) => (
  <div
    style={{
      overflowY: "auto",
      backgroundColor: "rgb(250, 250, 250)",
      _padding: 16,
      paddingBottom: 64
    }}
  >
    {children}
  </div>
);

export default MainTabs;
