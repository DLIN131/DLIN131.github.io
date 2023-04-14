const l2dModel =
  "./models/assets/bulaimodun_5/bulaimodun_5.model3.json";


(async function main() {
  const app = new PIXI.Application({
    view: document.getElementById("canvas"),
    autoStart: true,
    transparent: true,
  });

  const model = await PIXI.live2d.Live2DModel.from(l2dModel);

  app.stage.addChild(model);

  model.scale.set(0.05);

})();