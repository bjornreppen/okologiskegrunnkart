import db from "./IndexedDB";

const updateLayersIndexedDB = async completeKartlag => {
  // Get layers from indexed DB
  const layersdb = await db.layers.toArray();
  const sublayersdb = await db.sublayers.toArray();

  Object.entries(completeKartlag).forEach(async ([key, k]) => {
    // Check if layer is already stored in indexed DB and modify
    const existingLayer = layersdb.filter(e => e.id === key);
    if (existingLayer.length > 0 && existingLayer[0].favorite !== k.favorite) {
      db.layers
        .where("id")
        .equals(key)
        .modify({ favorite: k.favorite });
    }
    Object.entries(k.underlag).forEach(async ([ulkey, ul]) => {
      // Check if sublayer is already stored in indexed DB and modify
      const existingSublayer = sublayersdb.filter(e => e.id === ul.key);
      if (
        existingSublayer.length > 0 &&
        existingSublayer[0].favorite !== ul.favorite
      ) {
        db.sublayers
          .where("id")
          .equals(ul.key)
          .modify({ favorite: ul.favorite });
      }
    });
  });
};

const removeUnusedLayersIndexedDB = async (listLayerIds, listSublayerIds) => {
  // Get layers and sublayers from indexed DB
  const layersdb = await db.layers.toArray();
  const sublayersdb = await db.sublayers.toArray();

  for (const layer of layersdb) {
    if (!listLayerIds.includes(layer.id)) {
      db.layers
        .where("id")
        .equals(layer.id)
        .delete();
    }
  }

  for (const sublayer of sublayersdb) {
    if (!listSublayerIds.includes(sublayer.id)) {
      db.sublayers
        .where("id")
        .equals(sublayer.id)
        .delete();
    }
  }
};

export { updateLayersIndexedDB, removeUnusedLayersIndexedDB };
