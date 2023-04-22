const l2dModel =
  "./models/assets/bulaimodun_5/bulaimodun_5.model3.json";
const myCanvas =  document.getElementById("canvas")

const sizeSlider = document.getElementById("size");
sizeSlider.addEventListener("input", changeModelSize);
const draggableCheckBox = document.querySelector("#dragable")
draggableCheckBox.addEventListener("click",function(){
  if(this.checked){
    draggable(this.checked,this.checked)
    myCanvas.style.zIndex = "0"
  }
  else{
    draggable(this.checked,this.checked)
    myCanvas.style.zIndex = "-10"
  }
})

let model = null;

(async function main() {
  const app = new PIXI.Application({
    view: myCanvas,
    autoStart: true,
    transparent: true,
    resizeTo: window,
  });

  model = await PIXI.live2d.Live2DModel.from(l2dModel);

  app.stage.addChild(model);
  model.scale.set(0.05);
  model.position.x  = 1600
  model.position.y = 600
  // draggable()

})();

function changeModelSize(e){
  let modelSize = sizeSlider.value/100
  if(model){
    model.scale.set(modelSize);
  }
}

function draggable(dragFlag,buttonMode) {
  model.buttonMode = buttonMode;
  model.on("pointerdown", (e) => {
    model.dragging = dragFlag;
    model._pointerX = e.data.global.x - model.x;
    model._pointerY = e.data.global.y - model.y;
  });
  model.on("pointermove", (e) => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
    }
  });
  model.on("pointerupoutside", () => (model.dragging = false));
  model.on("pointerup", () => (model.dragging = false));
}