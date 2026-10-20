(function(){

const MODEL_ROOT = "./models/assets";
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

/****************************************************************/
/*                         設定（存在 localStorage）             */
/****************************************************************/
const STORAGE_KEY = "l2dSettings";
const DEFAULTS = {
  model: null,
  randomStart: true,
  scale: 1,        // 相對於「自動符合畫面」大小的倍率
  x: 0.8,          // 模型底部中心點在畫面中的位置（比例）
  y: 1,
  opacity: 1,
  visible: true,
  flip: false,
  shadow: true,
  follow: true,
  tap: true,
};
const SCALE_MIN = 0.3;
const SCALE_MAX = 2.5;

const settings = loadSettings();

function loadSettings(){
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch (e) {
    return Object.assign({}, DEFAULTS);
  }
}
let saveTimer = null;
function saveSettings(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)), 200);
}

/****************************************************************/
/*                         DOM                                   */
/****************************************************************/
const $ = (id) => document.getElementById(id);
const myCanvas = $("canvas");
const ui = {
  models: $("models"),
  prev: $("model-prev"),
  next: $("model-next"),
  random: $("model-random"),
  status: $("model-status"),
  randomStart: $("l2d-random-start"),
  size: $("size"),
  sizeVal: $("size-val"),
  opacity: $("l2d-opacity"),
  opacityVal: $("opacity-val"),
  visible: $("l2d-visible"),
  flip: $("l2d-flip"),
  shadow: $("l2d-shadow"),
  follow: $("l2d-follow"),
  tap: $("l2d-tap"),
  edit: $("dragable"),
  editDone: $("l2d-edit-done"),
  reset: $("l2d-reset"),
  motions: $("motion-list"),
};

/****************************************************************/
/*                         PIXI                                  */
/****************************************************************/
const app = new PIXI.Application({
  view: myCanvas,
  autoStart: true,
  backgroundAlpha: 0,
  antialias: true,
  resizeTo: window,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  autoDensity: true,
});

let model = null;
let currentName = null;
let content = null;     // 角色實際可見範圍（模型座標）
let motions = [];       // [{name, index}]
let loadToken = 0;

/****************************************************************/
/*                         載入模型                              */
/****************************************************************/
function modelUrl(name){
  return `${MODEL_ROOT}/${name}/${name}.model3.json`;
}

function motionName(file){
  return file.split("/").pop().replace(/\.motion3\.json$/, "");
}

// 重新整理 model3.json 的動作：
//  - "Idle" 群組只放 idle 動作，讓模型待機時自動循環
//  - "All" 群組放所有（去重後的）動作，給面板按鈕與點擊互動使用
function prepareSettings(json, url){
  const settingsJson = JSON.parse(JSON.stringify(json));
  settingsJson.url = url;
  const refs = settingsJson.FileReferences;
  const seen = new Set();
  const all = [];
  Object.values(refs.Motions || {}).forEach(group => {
    group.forEach(def => {
      if (!seen.has(def.File)) {
        seen.add(def.File);
        all.push(def);
      }
    });
  });
  const idle = all.find(def => motionName(def.File) === "idle");
  refs.Motions = { All: all };
  if (idle) refs.Motions.Idle = [idle];
  const list = all.map((def, index) => ({ name: motionName(def.File), index }));
  return { settingsJson, list };
}

// 計算角色真正可見的範圍；這批模型的畫布很大（例如 10000x8000），
// 直接用畫布大小縮放會讓角色變得很小或偏離畫面
function measureContent(m){
  const im = m.internalModel;
  const core = im.coreModel;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  try {
    core.update();
    const count = core.getDrawableCount();
    for (let i = 0; i < count; i++) {
      if (core.getDrawableOpacity(i) < 0.05) continue;
      const b = im.getDrawableBounds(i);
      if (!isFinite(b.x) || !isFinite(b.y)) continue;
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }
  } catch (e) {
    console.warn("measure live2d content failed", e);
  }
  if (!isFinite(minX) || maxX - minX < 1 || maxY - minY < 1) {
    minX = 0; minY = 0; maxX = im.width; maxY = im.height;
  }
  return { left: minX, top: minY, right: maxX, bottom: maxY, width: maxX - minX, height: maxY - minY };
}

async function loadModel(name){
  const token = ++loadToken;
  currentName = name;
  ui.models.value = name;
  settings.model = name;
  saveSettings();
  setStatus("載入中…", "loading");
  myCanvas.classList.remove("ready");

  try {
    const url = modelUrl(name);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { settingsJson, list } = prepareSettings(await res.json(), url);
    const next = await PIXI.live2d.Live2DModel.from(settingsJson, { autoInteract: false });

    // 載入期間又切換了別的模型，丟掉這個結果
    if (token !== loadToken) {
      next.destroy({ children: true, texture: true, baseTexture: true });
      return;
    }

    const old = model;
    model = next;
    motions = list;
    content = measureContent(model);
    app.stage.addChild(model);
    if (old) {
      app.stage.removeChild(old);
      old.destroy({ children: true, texture: true, baseTexture: true });
    }

    bindMotionEvents(model);
    renderMotionButtons();
    applyTransform();
    applyAppearance();
    myCanvas.classList.add("ready");
    setStatus(`${list.length} 個動作`);

    // 進場打招呼
    const greet = motions.find(m => m.name === "login") || motions.find(m => m.name === "home");
    if (greet) playMotion(greet.index);
  } catch (e) {
    console.error(e);
    if (token === loadToken) {
      setStatus("載入失敗", "error");
      if (model) myCanvas.classList.add("ready");
    }
  }
}

function setStatus(text, type){
  ui.status.textContent = text;
  ui.status.className = "model-status" + (type ? " " + type : "");
}

/****************************************************************/
/*                         位置 / 大小 / 外觀                    */
/****************************************************************/
function fitScale(){
  return Math.min(
    (innerHeight * 0.92) / content.height,
    (innerWidth * 0.7) / content.width
  );
}

function applyTransform(){
  if (!model || !content) return;
  const im = model.internalModel;
  const s = fitScale() * settings.scale;
  // 以角色底部中心為錨點，縮放與翻轉時位置不會跑掉
  model.anchor.set((content.left + content.width / 2) / im.width, content.bottom / im.height);
  model.scale.set(settings.flip ? -s : s, s);
  model.position.set(settings.x * innerWidth, settings.y * innerHeight);
}

function applyAppearance(){
  myCanvas.style.setProperty("--l2d-opacity", settings.opacity);
  myCanvas.classList.toggle("shadow", settings.shadow);
  myCanvas.style.visibility = settings.visible ? "" : "hidden";
  // 隱藏時停止繪製，節省效能
  if (settings.visible) app.start(); else app.stop();
  if (model && !settings.follow) model.focus(innerWidth / 2, innerHeight / 2);
}

function setScale(value){
  settings.scale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
  applyTransform();
  syncUI();
  saveSettings();
}

function resetLayout(){
  settings.scale = DEFAULTS.scale;
  settings.x = DEFAULTS.x;
  settings.y = DEFAULTS.y;
  applyTransform();
  syncUI();
  saveSettings();
}

window.addEventListener("resize", applyTransform);

/****************************************************************/
/*                         動作                                  */
/****************************************************************/
function playMotion(index){
  if (!model) return;
  model.motion("All", index, PIXI.live2d.MotionPriority.FORCE);
}

function playRandomMotion(){
  const pool = motions.filter(m => m.name !== "idle");
  if (pool.length) playMotion(pool[Math.floor(Math.random() * pool.length)].index);
}

function bindMotionEvents(m){
  const mm = m.internalModel.motionManager;
  mm.on("motionStart", (group, index) => {
    ui.motions.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("playing", group === "All" && Number(btn.dataset.index) === index);
    });
  });
  mm.on("motionFinish", () => {
    ui.motions.querySelectorAll("button.playing").forEach(btn => btn.classList.remove("playing"));
  });
}

function renderMotionButtons(){
  ui.motions.innerHTML = "";
  motions.forEach(m => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = m.name;
    btn.dataset.index = m.index;
    btn.addEventListener("click", () => playMotion(m.index));
    ui.motions.appendChild(btn);
  });
}

/****************************************************************/
/*                         滑鼠互動                              */
/****************************************************************/
// 角色可見範圍在螢幕上的矩形
function contentScreenRect(){
  const a = model.toGlobal(new PIXI.Point(content.left, content.top));
  const b = model.toGlobal(new PIXI.Point(content.right, content.bottom));
  return {
    left: Math.min(a.x, b.x), right: Math.max(a.x, b.x),
    top: Math.min(a.y, b.y), bottom: Math.max(a.y, b.y),
  };
}
function hitModel(x, y){
  if (!model || !content || !settings.visible) return false;
  const r = contentScreenRect();
  // 範圍稍微內縮，避免點到角色旁邊的空白也觸發
  const padX = (r.right - r.left) * 0.15;
  return x > r.left + padX && x < r.right - padX && y > r.top && y < r.bottom;
}

// 視線跟隨滑鼠
window.addEventListener("pointermove", (e) => {
  if (model && settings.follow && settings.visible) model.focus(e.clientX, e.clientY);
});
document.documentElement.addEventListener("mouseleave", () => {
  if (model && settings.follow) model.focus(innerWidth / 2, innerHeight / 2);
});

// 一般模式：模型在介面後方，點擊沒有被介面擋住的角色部分時播放動作
const UI_SELECTOR = "button, a, input, select, label, iframe, .glass, .sidebar, .topbar, .bg-nav";
document.addEventListener("click", (e) => {
  if (!settings.tap || document.body.classList.contains("l2d-editing")) return;
  if (e.target.closest(UI_SELECTOR)) return;
  if (hitModel(e.clientX, e.clientY)) playRandomMotion();
});

// 調整模式：畫布移到最上層，可以拖曳與滾輪縮放
let drag = null;
myCanvas.addEventListener("pointerdown", (e) => {
  if (!model) return;
  myCanvas.setPointerCapture(e.pointerId);
  myCanvas.classList.add("dragging");
  drag = {
    id: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    originX: settings.x * innerWidth,
    originY: settings.y * innerHeight,
    moved: false,
  };
});
myCanvas.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  settings.x = (drag.originX + dx) / innerWidth;
  settings.y = (drag.originY + dy) / innerHeight;
  applyTransform();
});
function endDrag(e){
  if (!drag || e.pointerId !== drag.id) return;
  const wasTap = !drag.moved;
  drag = null;
  myCanvas.classList.remove("dragging");
  if (wasTap && settings.tap && hitModel(e.clientX, e.clientY)) playRandomMotion();
  saveSettings();
}
myCanvas.addEventListener("pointerup", endDrag);
myCanvas.addEventListener("pointercancel", endDrag);
myCanvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  // 依滾動量平滑縮放，觸控板也不會一下縮放太多
  const delta = Math.max(-200, Math.min(200, e.deltaY));
  setScale(settings.scale * Math.exp(-delta * 0.001));
}, { passive: false });
myCanvas.addEventListener("dblclick", resetLayout);

function setEditMode(on){
  ui.edit.checked = on;
  document.body.classList.toggle("l2d-editing", on);
  if (on) {
    // 進入調整模式時順便關掉側邊欄，讓模型完整露出
    document.querySelector(".sidebar").classList.remove("show");
    document.body.classList.remove("sidebar-open");
  }
}
ui.edit.addEventListener("change", () => setEditMode(ui.edit.checked));
ui.editDone.addEventListener("click", () => setEditMode(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("l2d-editing")) setEditMode(false);
});

/****************************************************************/
/*                         側邊欄控制                            */
/****************************************************************/
function setRangeFill(input){
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--fill", pct + "%");
}

function syncUI(){
  ui.size.value = Math.round(settings.scale * 100);
  ui.sizeVal.textContent = ui.size.value + "%";
  ui.opacity.value = Math.round(settings.opacity * 100);
  ui.opacityVal.textContent = ui.opacity.value + "%";
  setRangeFill(ui.size);
  setRangeFill(ui.opacity);
  ui.randomStart.checked = settings.randomStart;
  ui.visible.checked = settings.visible;
  ui.flip.checked = settings.flip;
  ui.shadow.checked = settings.shadow;
  ui.follow.checked = settings.follow;
  ui.tap.checked = settings.tap;
}

function stepModel(step){
  const i = modelNames.indexOf(currentName);
  loadModel(modelNames[(i + step + modelNames.length) % modelNames.length]);
}

function randomModel(){
  let name;
  do {
    name = modelNames[Math.floor(Math.random() * modelNames.length)];
  } while (modelNames.length > 1 && name === currentName);
  loadModel(name);
}

function bindToggle(input, key, after){
  input.addEventListener("change", () => {
    settings[key] = input.checked;
    saveSettings();
    if (after) after();
  });
}

ui.models.innerHTML = modelNames
  .map(name => `<option value="${name}">${name.replace(/_(\d+)$/, " · $1")}</option>`)
  .join("");
ui.models.addEventListener("change", () => loadModel(ui.models.value));
ui.prev.addEventListener("click", () => stepModel(-1));
ui.next.addEventListener("click", () => stepModel(1));
ui.random.addEventListener("click", randomModel);

ui.size.addEventListener("input", () => setScale(ui.size.value / 100));
ui.opacity.addEventListener("input", () => {
  settings.opacity = ui.opacity.value / 100;
  syncUI();
  applyAppearance();
  saveSettings();
});
bindToggle(ui.randomStart, "randomStart");
bindToggle(ui.visible, "visible", applyAppearance);
bindToggle(ui.flip, "flip", applyTransform);
bindToggle(ui.shadow, "shadow", applyAppearance);
bindToggle(ui.follow, "follow", applyAppearance);
bindToggle(ui.tap, "tap");

document.querySelectorAll(".seg [data-pos]").forEach(btn => {
  btn.addEventListener("click", () => {
    settings.x = Number(btn.dataset.pos);
    settings.y = 1;
    applyTransform();
    saveSettings();
  });
});
ui.reset.addEventListener("click", resetLayout);

/****************************************************************/
/*                         初始化                                */
/****************************************************************/
syncUI();
applyAppearance();
if (!settings.randomStart && modelNames.includes(settings.model)) {
  loadModel(settings.model);
} else {
  randomModel();
}

})();
