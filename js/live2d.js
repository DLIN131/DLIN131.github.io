const modelNames = [
  "aijier_2",
  "aijier_3",
  "aimudeng_2",
  "aisaikesi_4",
  "baerdimo_5",
  "baerdimo_6",
  "banrenma_2",
  "beikaluolaina_2",
  "boyixi_2",
  "bulaimodun_2",
  "bulaimodun_5",
  "buleisite_2",
  "chaijun_3",
  "chaijun_4",
  "chicheng_5",
  "dafeng_3",
  "daofeng_5",
  "deyizhi_3",
  "dujiaoshou_4",
  "dujiaoshou_6",
  "dunkeerke_2",
  "edu_3",
  "edu_4",
  "genaisennao_2",
  "guangrong_3",
  "heitaizi_2",
  "hemin_2",
  "hemin_3",
  "jialisuoniye_3",
  "jialisuoniye_4",
  "jianye_2",
  "jianye_3",
  "jiuyun_2",
  "kalvbudisi_2",
  "kuersike_2",
  "lafei_4",
  "lingbo_10",
  "lisailiu_2",
  "list.txt",
  "luoen_4",
  "lvzuofu_2",
  "nengdai_2",
  "nengdai_3",
  "ougen_5",
  "ougen_6",
  "ouruola_4",
  "qianwei_2",
  "qiye_7",
  "rangbaer_4",
  "shengluyisi_4",
  "shitelasai_2",
  "sipeibojue_5",
  "taiyuan_2",
  "tianlangxing_3",
  "tierbici_2",
  "weineituo_2",
  "wuqi_2",
  "xinnong_3",
  "xuefeng_3",
  "yanusi_3",
  "yibei_3",
  "yingrui_3",
  "z46_4",
  "zhaohe_3"
];
//create canvas to the following load l2d
const myCanvas =  document.getElementById("canvas")
const sizeSlider = document.getElementById("size");

let l2dModel = null;
let model = null;
let app = null;

//if is pc then load live2d
app = new PIXI.Application({
  view: myCanvas,
  autoStart: true,
  transparent: true,
  resizeTo: window,
});
addModelsName();
randomModel();


//add mode name to option element
function addModelsName(){
  let option = modelNames.map(item => `<option value=${item}>${item}</option>`)
  options =  option.join("");
  const modelSelector = document.querySelector("#models")
  modelSelector.innerHTML = options;
  selectedEvent(modelSelector);
}

function selectedEvent(ele){
  ele.addEventListener("change",changeModel);
}
function changeModel(e){
  let name = e.target.value;
  l2dModel = `./models/assets/${name}/${name}.model3.json`;
  loadLive2dModel();
}



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

// when first load page the random load l2d 
function randomModel(){
  let randomN = Math.floor(Math.random()*modelNames.length);
  let name = modelNames[randomN];
  l2dModel = `./models/assets/${name}/${name}.model3.json`;
  console.log(name);
  loadLive2dModel();
}


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


async function loadLive2dModel() {
  app.stage.removeChild(model);
  app.stage.children = [];
  model = await PIXI.live2d.Live2DModel.from(l2dModel);
  const scaleX = (innerWidth * 0.6) / model.width;
  const scaleY = (innerHeight * 0.6) / model.height;
  app.stage.addChild(model);
  console.log(app.stage);
  model.scale.set(Math.min(scaleX, scaleY));
  model.position.x  = innerWidth*0.6;
  model.position.y = innerHeight * 0.1;
};


