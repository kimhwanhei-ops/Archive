"use strict";

/* 딤딤섬 포지션 - 2026.10.20~25 근무표 수기 전사 초안.
   사진과 다르면 '시간대별 근무표 > 근무표 편집'에서 수정하십시오.
   데이터는 외부로 전송되지 않으며 사용 중인 브라우저 localStorage에 저장됩니다. */

const DAYS = [
  { date:"2026-10-20", label:"20일", weekday:"화", target:[2,3,6,9,9,6,5,9,9,8,8,5,1], off:["석보라","한여진","정연우"], leave:[] },
  { date:"2026-10-21", label:"21일", weekday:"수", target:[2,3,6,9,9,6,5,9,9,8,8,5,1], off:["이승민","황지아보","한여진"], leave:[], note:"근무변경: 권주성 → 김명섭" },
  { date:"2026-10-22", label:"22일", weekday:"목", target:[2,3,7,9,10,7,6,8,9,8,8,5,1], off:["이승민","김영진","한여진"], leave:[] },
  { date:"2026-10-23", label:"23일", weekday:"금", target:[2,3,7,9,10,7,8,8,10,9,9,8,1], off:["석보라","정연우","한여진"], leave:["김현우"] },
  { date:"2026-10-24", label:"24일", weekday:"토", target:[2,4,8,10,11,8,8,10,11,10,10,8,1], off:["김현우","황지아보","김영진","김단영","한여진"], leave:[] },
  { date:"2026-10-25", label:"25일", weekday:"일", target:[2,4,7,10,11,7,7,10,10,9,9,6,1], off:["김희준"], leave:["석보라"] }
];
const TIMES = ["9:30-10","10-11","11-12","12-13","13-14","14-15","15-16","16-17","17-18","18-19","19-20","20-21","21-22"];
const PERIODS = { am:{name:"오전", start:0,end:6}, pm:{name:"오후", start:7,end:12} };
const ROLES = [
  {id:"counter",name:"카운터",symbol:"▣"},
  {id:"backbar",name:"빽바",symbol:"▤"},
  {id:"deli",name:"딜리",symbol:"◫"},
  {id:"clean",name:"클세",symbol:"✳"},
  {id:"packing",name:"포장",symbol:"▱"}
];
const PEAK_COUNTER_CAUTION = new Set(["김영진","황지아보"]);
const STORAGE_KEY="dimdim-position-prototype-v1";
const SCHEDULE_IMAGES={
  "2026-10-20":"images/schedules/2026-10-20.png",
  "2026-10-21":"images/schedules/2026-10-21.png",
  "2026-10-22":"images/schedules/2026-10-22.png",
  "2026-10-23":"images/schedules/2026-10-23.png",
  "2026-10-24":"images/schedules/2026-10-24.png",
  "2026-10-25":"images/schedules/2026-10-25.png"
};

function range(pattern) {
  const slots=[];
  pattern.split(",").forEach(part=>{
    if(!part.trim())return;
    const bounds=part.split("-").map(Number);
    const [first,last]=bounds.length===1?[bounds[0],bounds[0]]:bounds;
    for(let i=first;i<=last;i++)if(i>=0&&i<TIMES.length)slots.push(i);
  });
  return [...new Set(slots)];
}
function makeDay(regular,part,colors={}) {
  const roster={};
  for(const [group,people] of [["정직원",regular],["파트타임",part]]){
    for(const [name,pattern] of Object.entries(people)) {
      if(!roster[name])roster[name]={type:group,slots:Array(13).fill("off")};
      range(pattern).forEach(i=>roster[name].slots[i]="work");
    }
  }
  for(const [name,breakPattern] of Object.entries(colors.break||{})){
    if(roster[name])range(breakPattern).forEach(i=>roster[name].slots[i]="break");
  }
  for(const [key,status] of [["half","half"],["extend60","extend60"],["training","training"]]){
    for(const [name,pattern] of Object.entries(colors[key]||{})){
      if(roster[name])range(pattern).forEach(i=>roster[name].slots[i]=status);
    }
  }
  return roster;
}

/* 원본 표의 '사람이 들어간 칸'을 수기로 옮겼습니다. 파란 빈칸 = 식사 시간으로 등록한 경우만 break. */
const BASE_ROSTERS={
 "2026-10-20":makeDay(
  {"이승민":"0-4,6-8","김현우":"3-5,7-12","김희준":"3-5,7-11","황지아보":"2-4,6-10","김영진":"2-4,6-10","권주성":"2-5,7-10"},
  {"정천빈":"0-6","변지웅":"1-6","김두빈":"7-11","박수연":"7-11","김명섭":"3-5,7-11"},
  {break:{"이승민":"5","김현우":"6","김희준":"6","황지아보":"5","김영진":"5","권주성":"6","김명섭":"6"},half:{"김영진":"2","변지웅":"1"}}
 ),
 "2026-10-21":makeDay(
  {"김현우":"3-5,7-11","김희준":"2-4,6-10","석보라":"3-5,7-12","김영진":"0-4,6-8","김단영":"3-5,7-11","김명섭":"2-4,6-10","정연우":"2-5,7-10"},
  {"변지웅":"0-6","이승우":"1-6","김두빈":"7-11","박수연":"7-11"},
  {break:{"김현우":"6","김희준":"5","석보라":"6","김영진":"5","김단영":"6","김명섭":"5","정연우":"6"},half:{"정연우":"2","이승우":"1"},extend60:{"석보라":"3"}}
 ),
 "2026-10-22":makeDay(
  {"김현우":"0-4,6-8","김희준":"4-5,7-12","석보라":"2-5,7-10","황지아보":"3-5,7-11","김단영":"3-5,7-11","권주성":"2-4,6-10","정연우":"2-4,6-10"},
  {"이승우":"0-6","양유열":"1-6","변지웅":"2-6","김명섭":"7-11","채민우":"8-11"},
  {break:{"김현우":"5","김희준":"6","석보라":"6","황지아보":"6","김단영":"6","권주성":"5","정연우":"5"},half:{"양유열":"1","정연우":"3","채민우":"8"}}
 ),
 "2026-10-23":makeDay(
  {"이승민":"4-5,7-12","김희준":"2-4,6-10","김영진":"3-5,7-11","황지아보":"0-4,6-8","김단영":"3-4,6-11"},
  {"김두빈":"0-6","김명섭":"1-6","주혜민":"2-6","양유열":"2-6","박연주":"2-6","조원우":"7-11","박수연":"7-11","김선영":"7-11","최주은":"8-11","채민우":"8-11"},
  {break:{"이승민":"6","김희준":"5","김영진":"6","황지아보":"5","김단영":"5"},half:{"김명섭":"1","채민우":"8"}}
 ),
 "2026-10-24":makeDay(
  {"이승민":"2-4,6-10","김희준":"0-4,6-8","석보라":"4-5,7-12","권주성":"3-5,7-11","정연우":"2-4,6-10"},
  {"김두빈":"0-6","채민우":"1-6","김선영":"1-6","박연주":"2-6","장승원":"2-6","주혜민":"3-5,7-11","김민지":"7-11","권예준":"7-11","조원우":"7-11","최주은":"7-11","최희재":"8-11"},
  {break:{"이승민":"5","김희준":"5","석보라":"6","권주성":"6","정연우":"5","주혜민":"6"},half:{"채민우":"1","김선영":"1"}}
 ),
 "2026-10-25":makeDay(
  {"이승민":"2-4,6-10","김현우":"4-5,7-12","황지아보":"3-5,7-11","김영진":"0-4,6-8","김단영":"3-5,7-11","정연우":"3-5,7-11","한여진":"2-4,6-10"},
  {"김두빈":"0-6","박연주":"1-6","히라이":"1-6","김민지":"2-4,6-10","조원우":"7-11","권예준":"7-11"},
  {break:{"이승민":"5","김현우":"6","황지아보":"6","김영진":"5","김단영":"6","정연우":"6","한여진":"5","김민지":"5"},half:{"한여진":"2","박연주":"1","히라이":"1"}}
 )
};

/* 실제 작성한 포지션 세 건을 입력했습니다. '근무변경 권주성 → 김명섭' 포함. */
const BASE_PLANS={
 "2026-10-20":{
  am:{counter:["이승민"],backbar:["변지웅"],deli:["황지아보","권주성"],clean:["김현우","김희준","김명섭","김영진"],packing:["정천빈"]},
  pm:{counter:["김현우"],backbar:["김두빈"],deli:["이승민","김희준","김명섭"],clean:["황지아보","권주성","박수연"],packing:["김영진"]}
 },
 "2026-10-21":{
  am:{counter:["김영진"],backbar:["이승우"],deli:["김희준","김명섭"],clean:["김현우","석보라","김단영","정연우"],packing:["변지웅"]},
  pm:{counter:["석보라"],backbar:["김두빈"],deli:["김현우","김영진","정연우"],clean:["김희준","김명섭","박수연"],packing:["김단영"]}
 }
};
const HISTORY_19={am:{counter:["석보라"],backbar:["김단영"],deli:["황지아보","김민지","최희재"],clean:["이승민","김영진","권주성","정연우"],packing:["이승우"]},pm:{counter:["김영진"],backbar:["권주성"],deli:["이승민","석보라","정연우"],clean:["황지아보","김단영","주혜민"],packing:["최주은"]}};

function deepCopy(item){return JSON.parse(JSON.stringify(item));}
function emptyPlans(){return Object.fromEntries(DAYS.map(d=>[d.date,{am:Object.fromEntries(ROLES.map(r=>[r.id,[]])),pm:Object.fromEntries(ROLES.map(r=>[r.id,[]]))}]));}
function initialState(){const plans=emptyPlans();for(const [day,data] of Object.entries(BASE_PLANS))plans[day]=deepCopy(data);return {rosters:deepCopy(BASE_ROSTERS),plans,manualHistory:[]};}
function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved&&saved.rosters&&saved.plans&&saved.manualHistory){
      // 기존 버전의 노란색(extend30) 기록은 내용 보존 후 half로 전환.
      for(const roster of Object.values(saved.rosters)){
        for(const record of Object.values(roster)){
          if(Array.isArray(record.slots))record.slots=record.slots.map(status=>status==="extend30"?"half":status);
        }
      }
      return saved;
    }
  }catch(e){/* private browsing may block storage */}
  return initialState();
}
let state=loadState(),selectedDay="2026-10-25",selectedPeriod="am",activeView="assign",sheetMode=null,sheetStaff=null,resultBuilt=false;
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){toast("저장 공간에 접근할 수 없습니다. 현재 화면에서만 유지됩니다.");}}
function $(id){return document.getElementById(id);}
function dayInfo(){return DAYS.find(d=>d.date===selectedDay);}
function isPeakDay(){return ["금","토","일"].includes(dayInfo().weekday);}
function rowStatus(person,index){return state.rosters[selectedDay]?.[person]?.slots?.[index]||"off";}
function active(status){return ["work","half","extend60","training"].includes(status);}
function slotMinutes(status,index,type){
  if(!active(status))return 0;
  // 노란색 = 표시된 시간의 후반 30분만 근무, 연장 근무가 아님.
  const minutes=status==="half"||index===0?30:60;
  // 21~22시 칸에서 파트타임은 최대 21:30까지만 근무할 수 있음.
  return type==="파트타임"&&index===12?Math.min(minutes,30):minutes;
}
function coverage(name){
  let minutes=0;
  const record=state.rosters[selectedDay]?.[name];
  if(!record)return {minutes:0,percent:0};
  const rangePeriod=PERIODS[selectedPeriod];
  for(let i=rangePeriod.start;i<=rangePeriod.end;i++){
    minutes+=slotMinutes(rowStatus(name,i),i,record.type);
  }
  const max=selectedPeriod==="am"?390:(record.type==="파트타임"?330:360);
  return {minutes,percent:Math.min(100,Math.round(minutes/max*100))};
}
function rosterNames(){
  const roster=state.rosters[selectedDay]||{};
  return Object.keys(roster).sort((a,b)=>{
    const rankA=roster[a].type==="정직원"?0:1;
    const rankB=roster[b].type==="정직원"?0:1;
    return rankA-rankB||a.localeCompare(b,"ko");
  });
}
function activeRosterNames(){return rosterNames().filter(n=>coverage(n).minutes>0);}
function getAssignedRole(name){const p=state.plans[selectedDay][selectedPeriod];return ROLES.find(r=>p[r.id].includes(name))?.id||null;}
function roleName(role){return ROLES.find(r=>r.id===role)?.name||role;}
function localDay(date){return date.slice(5).replace("-","/");}
function historyLogs(){const logs=[];function add(day,p,plan){for(const [r,names] of Object.entries(plan)){for(const name of names)logs.push({name,role:r,date:day,period:p,source:"position"});}}for(const p of ["am","pm"])add("2026-10-19",p,HISTORY_19[p]);for(const [day,parts] of Object.entries(state.plans)){for(const p of ["am","pm"])add(day,p,parts[p]);}for(const entry of state.manualHistory)logs.push({...entry,source:"manual"});return logs;}
function eventRank(entry){return entry.date+":"+(entry.period==="am"?"0":"1");}
function lastDone(name,role){const cutoff=selectedDay+":"+(selectedPeriod==="am"?"0":"1");const arr=historyLogs().filter(x=>x.name===name&&x.role===role&&eventRank(x)<cutoff).sort((a,b)=>eventRank(b).localeCompare(eventRank(a)));return arr[0]||null;}
function labelLast(log){return log?`${localDay(log.date)} ${log.period==="am"?"오전":"오후"}`:"기록 없음";}
function weekendWarn(name,role){return isPeakDay()&&role==="counter"&&PEAK_COUNTER_CAUTION.has(name);}
function candidates(role){return activeRosterNames().filter(name=>!getAssignedRole(name)&&(role!=="counter"||state.rosters[selectedDay][name].type==="정직원")).map(name=>({name,cov:coverage(name),last:lastDone(name,role),risk:weekendWarn(name,role)})).sort((a,b)=>{
 if(a.risk!==b.risk)return a.risk?1:-1;
 const lowA=a.cov.percent<55,lowB=b.cov.percent<55;if(lowA!==lowB)return lowA?1:-1;
 if(role==="backbar"||role==="packing"){
   if(Boolean(a.last)!==Boolean(b.last))return a.last?-1:1; // 이전 기록이 없는 경우 임의로 1순위로 두지 않음
   if(a.last&&b.last){const cmp=eventRank(a.last).localeCompare(eventRank(b.last));if(cmp)return cmp;}
 }
 if(a.cov.minutes!==b.cov.minutes)return b.cov.minutes-a.cov.minutes;
 return a.name.localeCompare(b.name,"ko");
 });}
function candidateWhy(x,role){const coverageText=`근무 ${Math.round(x.cov.minutes/30)/2}시간`;
 if(x.risk)return `${coverageText} · 금·토·일 카운터 주의`;
 if(role==="backbar"||role==="packing")return `${coverageText} · 마지막 ${labelLast(x.last)}`;
 return `${coverageText}${x.cov.percent<55?" · 단시간 근무":""}`;
}
function toast(message){const node=$("toast");node.textContent=message;node.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove("show"),2800);}
function renderDateTabs(){$("dateTabs").innerHTML=DAYS.map(d=>`<button type="button" class="date-btn ${selectedDay===d.date?"selected":""}" data-day="${d.date}" aria-pressed="${selectedDay===d.date}">${d.label}<small>${d.weekday}요일</small></button>`).join("");document.querySelectorAll("[data-day]").forEach(el=>el.addEventListener("click",()=>{selectedDay=el.dataset.day;$("staffSearch").value="";renderAll();}));}
function renderPeriod(){document.querySelectorAll("[data-period]").forEach(el=>{const yes=el.dataset.period===selectedPeriod;el.classList.toggle("active",yes);el.setAttribute("aria-pressed",String(yes));});const off=dayInfo().off.join(", ")||"없음", leave=dayInfo().leave.join(", ")||"없음";$("dayNote").textContent=`OFF ${off} · 연차 ${leave}${dayInfo().note?" · "+dayInfo().note:""}`;}
function renderStats(){const names=activeRosterNames(),period=PERIODS[selectedPeriod],data=state.plans[selectedDay][selectedPeriod];const placed=ROLES.reduce((n,r)=>n+data[r.id].length,0);const target=dayInfo().target.slice(period.start,period.end+1);const avg=Math.round(target.reduce((a,b)=>a+b,0)/target.length);const regular=names.filter(n=>state.rosters[selectedDay][n].type==="정직원").length;const part=names.length-regular;$("stats").innerHTML=`<div class="stat"><small>해당 시간대 근무 가능</small><strong>${names.length}<em>명 · 정직원 ${regular}, 파트 ${part}</em></strong></div><div class="stat"><small>포지션 배치 완료</small><strong>${placed}<em>명</em></strong></div><div class="stat ${names.length-placed>0?"":"warning"}"><small>아직 미배치</small><strong>${names.length-placed}<em>명</em></strong></div><div class="stat"><small>시간대별 목표 인원 평균</small><strong>${avg}<em>명 · 사진의 빨간 숫자</em></strong></div>`;}
function renderStaffPool(){
  let pool=activeRosterNames().map(n=>({name:n,cov:coverage(n)}));
  const search=$("staffSearch").value.trim();
  if(search)pool=pool.filter(x=>x.name.includes(search));
  if($("fullOnly").checked)pool=pool.filter(x=>x.cov.percent>=55);
  pool.sort((a,b)=>b.cov.minutes-a.cov.minutes||a.name.localeCompare(b.name,"ko"));
  $("poolCount").textContent=`${pool.length}명 표시`;
  $("staffPool").innerHTML=pool.length?["정직원","파트타임"].map(type=>{
    const people=pool.filter(x=>state.rosters[selectedDay][x.name].type===type);
    if(!people.length)return "";
    return `<div class="staff-group-label">${type} <span>${people.length}명</span></div>`+people.map(x=>{
      const role=getAssignedRole(x.name);
      const caution=isPeakDay()&&PEAK_COUNTER_CAUTION.has(x.name);
      const group=type==="정직원"?"정":"파";
      return `<button type="button" class="staff-btn" data-person="${x.name}"><span class="line"><strong>${x.name}</strong><small>${group} · ${x.cov.percent}%</small></span><span class="details">${role?`<span class="badge assigned">${roleName(role)} 배치</span>`:`<span class="badge ${x.cov.percent<55?"weak":""}">${x.cov.percent<55?"부분근무":"배치 가능"}</span>`}${caution?`<span class="badge warn">금·토·일 카운터 주의</span>`:""}</span></button>`;
    }).join("");
  }).join(""):`<div class="muted-empty">해당 조건의 근무자가 없습니다.</div>`;
  document.querySelectorAll("[data-person]").forEach(el=>el.addEventListener("click",()=>showStaff(el.dataset.person)));
}
function renderPositions(){const p=state.plans[selectedDay][selectedPeriod];$("positions").innerHTML=ROLES.map(role=>{const list=p[role.id],cand=candidates(role.id);return `<div class="position-card"><div class="position-head"><div class="position-title"><span class="position-icon">${role.symbol}</span><h3>${role.name}</h3><small>${list.length}명</small></div><button type="button" class="recommend-btn" data-suggest="${role.id}">추천 보기 →</button></div><div class="placed">${list.length?list.map(n=>`<button type="button" class="placed-chip" data-person="${n}" title="눌러 배치 변경">${n}<span>↗</span></button>`).join(""):`<span class="placeholder">배치된 직원이 없습니다</span>`}</div><div class="recommend-line">${(role.id==="backbar"||role.id==="packing")&&cand[0]?`이력 우선 추천: <b>${cand[0].name}</b> · ${labelLast(cand[0].last)}`:cand[0]?`추천: <b>${cand[0].name}</b> · 근무 ${Math.round(cand[0].cov.minutes/30)/2}시간`:"현재 추천할 미배치 인원 없음"}</div></div>`;}).join("");document.querySelectorAll("[data-suggest]").forEach(el=>el.addEventListener("click",()=>showSuggestions(el.dataset.suggest)));document.querySelectorAll(".placed [data-person]").forEach(el=>el.addEventListener("click",()=>showStaff(el.dataset.person)));}
function sumStaffAt(index,type){return Object.values(state.rosters[selectedDay]).filter(entry=>(!type||entry.type===type)&&active(entry.slots[index])).length;}
function partialTimeLabel(index,type){
  if(index===0)return "09:30~10:00";
  if(index===12&&type==="파트타임")return "21:00~21:30";
  const end=Number(TIMES[index].split("-")[1]);
  return `${String(end-1).padStart(2,"0")}:30~${String(end).padStart(2,"0")}:00`;
}
function scheduleCellTitle(status,index,type){
  if(status==="half")return `${TIMES[index]} · 30분 근무(${partialTimeLabel(index,type)})`;
  if(type==="파트타임"&&index===12&&active(status))return `${TIMES[index]} · 파트타임 종료 21:30 (21:00~21:30)`;
  return `${TIMES[index]} · ${statusLabel(status)}`;
}
function renderSchedule(){
  const header=$("scheduleTable").querySelector("thead"),body=$("scheduleTable").querySelector("tbody");
  const headerRow=label=>`<tr><th class="name">${label}</th>${TIMES.map(t=>`<th>${t}</th>`).join("")}</tr>`;
  header.innerHTML=headerRow("시간")+`<tr class="head-target"><th class="name">목표 인원</th>${dayInfo().target.map(n=>`<th>${n}</th>`).join("")}</tr>`+`<tr class="head-count"><th class="name">현재 근무</th>${TIMES.map((_,i)=>`<th title="정직원 ${sumStaffAt(i,"정직원")} / 파트 ${sumStaffAt(i,"파트타임")}">${sumStaffAt(i)}</th>`).join("")}</tr>`;
  const names=rosterNames();
  body.innerHTML=["정직원","파트타임"].map(type=>{
    const group=names.filter(name=>state.rosters[selectedDay][name].type===type);
    if(!group.length)return "";
    return `<tr class="schedule-group"><th class="name">${type}</th><td colspan="${TIMES.length}">${type==="정직원"?"정직원 · 위쪽":"파트타임 · 아래쪽 (최대 21:30)"}</td></tr>`+group.map(name=>{
      const record=state.rosters[selectedDay][name];
      return `<tr><th class="name" title="${record.type}">${name}<span style="font-size:9px;color:#9ba9a9"> ${record.type==="정직원"?"정":"파"}</span></th>${record.slots.map((status,i)=>`<td data-edit-person="${name}" data-edit-slot="${i}" class="${status} ${$("editSchedule").checked?"editing":""}" title="${scheduleCellTitle(status,i,record.type)}">${statusText(status)}</td>`).join("")}</tr>`;
    }).join("");
  }).join("");
  body.querySelectorAll("[data-edit-person]").forEach(el=>el.addEventListener("click",()=>{
    if(!$("editSchedule").checked)return;
    const row=state.rosters[selectedDay][el.dataset.editPerson];
    const i=Number(el.dataset.editSlot);
    const next={off:"work",work:"break",break:"half",half:"extend60",extend60:"training",training:"off"};
    row.slots[i]=next[row.slots[i]]||"off";
    saveState();renderStats();renderStaffPool();renderPositions();renderSchedule();
  }));
}
function statusText(status){return {off:"",work:"●",break:"식사",half:"30분",extend60:"1시간",training:"클세"}[status]||"";}
function statusLabel(status){return {off:"비근무",work:"근무",break:"식사",half:"30분 근무",extend60:"1시간 연장",training:"신입 클세"}[status]||"";}
function renderHistory(){const hist=historyLogs();$("historyBoard").innerHTML=["backbar","packing"].map(role=>{const result=rosterNames().map(name=>({name,log:lastDone(name,role)})).filter(x=>x.log).sort((a,b)=>eventRank(a.log).localeCompare(eventRank(b.log))).slice(0,8);return `<div class="history-panel"><h3>${roleName(role)} · 오래된 순</h3>${result.length?result.map(x=>`<div class="history-item"><strong>${x.name}</strong><span>${labelLast(x.log)}</span></div>`).join(""):`<div class="subtle">선택 날짜 이전 기록이 없습니다</div>`}</div>`;}).join("");const old=$("historyStaff").value;const all=new Set([...Object.keys(state.rosters[selectedDay]),...historyLogs().map(h=>h.name)]);$("historyStaff").innerHTML=[...all].sort((a,b)=>a.localeCompare(b,"ko")).map(n=>`<option value="${n}">${n}</option>`).join("");if(all.has(old))$("historyStaff").value=old;}
function renderAll(){renderDateTabs();renderPeriod();renderScheduleVisual();renderStats();renderStaffPool();renderPositions();renderSchedule();renderHistory();if(resultBuilt)renderResultCard();}

function renderScheduleVisual(){
  const img=$("schedulePreviewImage"), label=$("scheduleImageLabel");
  if(!img||!label)return;
  const src=SCHEDULE_IMAGES[selectedDay];
  if(src){
    img.src=src;
    img.alt=`${dayInfo().label} 원본 스케줄 사진`;
    img.hidden=false;
    label.textContent=`${dayInfo().label} 원본`;
  }else{
    img.removeAttribute("src");
    img.alt="등록된 스케줄 사진이 없습니다";
    img.hidden=true;
    label.textContent="사진 없음";
  }
}
function assignedCount(period){return ROLES.reduce((sum,role)=>sum+state.plans[selectedDay][period][role.id].length,0);}
function breakPeople(slot){return rosterNames().filter(name=>rowStatus(name,slot)==="break");}
/* 아이폰용 PNG 이미지 출력: 1170 × 2532, 2장, 외부 캡처 라이브러리 미사용 */
const EXPORT_W = 1170;
const EXPORT_H = 2532;
let exportRevision = 0;
let exportAssets = [];

function drawRound(ctx,x,y,w,h,r,fill,stroke="") {
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.moveTo(x+rr,y);ctx.lineTo(x+w-rr,y);ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
  ctx.lineTo(x+w,y+h-rr);ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);
  ctx.lineTo(x+rr,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-rr);
  ctx.lineTo(x,y+rr);ctx.quadraticCurveTo(x,y,x+rr,y);ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke();}
}
function exportFont(size,weight=700){return `${weight} ${size}px "Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif`;}
function exportText(ctx,text,x,y,size,color="#19323c",weight=700){ctx.font=exportFont(size,weight);ctx.fillStyle=color;ctx.textBaseline="top";ctx.fillText(String(text),x,y);}
function splitLines(ctx,text,maxWidth){
  const words=String(text).split(/\s+/).filter(Boolean);
  const lines=[];let line="";
  for(const word of words){
    const next=line?line+" "+word:word;
    if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word;}else{line=next;}
  }
  if(line)lines.push(line);
  return lines.length?lines:[""];
}
function fitLines(ctx,text,width,maxLines=4){
  for(let size=42;size>=30;size-=2){ctx.font=exportFont(size,700);const lines=splitLines(ctx,text,width);if(lines.length<=maxLines&&(lines.length<3||size<=34))return {size,lines};}
  ctx.font=exportFont(30,700);
  return {size:30,lines:splitLines(ctx,text,width)};
}
function drawHeader(ctx,title,sub,page){
  const grad=ctx.createLinearGradient(0,0,1170,400);grad.addColorStop(0,"#183d47");grad.addColorStop(1,"#0b6763");
  ctx.fillStyle="#f3f8f8";ctx.fillRect(0,0,EXPORT_W,EXPORT_H);
  ctx.fillStyle=grad;ctx.fillRect(0,0,EXPORT_W,410);
  ctx.fillStyle="rgba(255,255,255,.055)";ctx.beginPath();ctx.arc(1050,20,360,0,Math.PI*2);ctx.fill();
  exportText(ctx,"D I M D I M   P O S I T I O N",70,83,28,"#9fddd4",800);
  exportText(ctx,title,70,150,77,"#ffffff",800);
  exportText(ctx,sub,74,261,39,"#d3ece6",500);
  drawRound(ctx,1012,74,93,55,26,"rgba(255,255,255,.18)");
  exportText(ctx,`${page} / 2`,1030,86,27,"#fff",700);
}
function drawFooter(ctx,text,page){
  ctx.strokeStyle="#d6e5e4";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(70,2441);ctx.lineTo(1100,2441);ctx.stroke();
  exportText(ctx,"DIMDIM POSITION · OPERATION BOARD",72,2460,26,"#627c80",700);
  ctx.textAlign="right";exportText(ctx,`${text}  ·  ${page}/2`,1095,2460,25,"#627c80",500);ctx.textAlign="left";
}
function drawRole(ctx,role,idx){
  const y=590+idx*328;
  drawRound(ctx,68,y,1034,305,29,"#ffffff","#e0eaea");
  drawRound(ctx,90,y+34,12,51,6,"#0e8b7a");
  exportText(ctx,role.name,123,y+35,48,"#173840",800);
  const am=state.plans[selectedDay].am[role.id];
  const pm=state.plans[selectedDay].pm[role.id];
  const rows=[{x:96,text:am.join(" · ")||"미배치",label:"오전",color:"#eaf6f3",accent:"#137b6c"},
              {x:605,text:pm.join(" · ")||"미배치",label:"오후",color:"#f1f5fa",accent:"#3e6b8d"}];
  for(const row of rows){
    drawRound(ctx,row.x,y+112,467,181,19,row.color);
    exportText(ctx,row.label,row.x+23,y+127,28,row.accent,800);
    const {size,lines}=fitLines(ctx,row.text,421,3);
    const lineHeight=size+9;
    let ty=y+169;
    for(let li=0;li<Math.min(lines.length,3);li++){
      let line=lines[li];
      if(li===2&&lines.length>3)line+=" …";
      exportText(ctx,line,row.x+23,ty,size,row.text==="미배치"?"#8ea2aa":"#20343c",750);
      ty+=lineHeight;
    }
  }
}
function exportPageOne(){
  const c=document.createElement("canvas");c.width=EXPORT_W;c.height=EXPORT_H;const ctx=c.getContext("2d");
  const info=dayInfo();
  drawHeader(ctx,"딤딤섬 포지션",`2026년 10월 ${Number(selectedDay.slice(-2))}일 ${info.weekday}요일 · 오전 / 오후 배치`,1);
  const a=assignedCount("am"),b=assignedCount("pm");
  drawRound(ctx,70,355,1030,156,26,"#fff","#e2ebeb");
  exportText(ctx,"오전 배치 완료",111,383,29,"#65838a",600);exportText(ctx,`${a}명`,111,426,51,"#087f6b",800);
  ctx.fillStyle="#dce9e9";ctx.fillRect(585,382,2,101);
  exportText(ctx,"오후 배치 완료",630,383,29,"#65838a",600);exportText(ctx,`${b}명`,630,426,51,"#087f6b",800);
  ROLES.forEach((role,i)=>drawRole(ctx,role,i));
  drawRound(ctx,70,2251,1030,130,20,"#e6f3f1");
  exportText(ctx,"교대 기준 16:00",98,2275,35,"#096858",800);
  exportText(ctx,"카운터 정직원 전용 · 수정 후 다시 이미지 만들기",98,2320,29,"#4d7373",500);
  drawFooter(ctx,"포지션 배치",1);
  return c;
}
function imageLoad(src){return new Promise(resolve=>{if(!src)return resolve(null);const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;});}
function drawNoteLine(ctx,label,body,y){
  exportText(ctx,label,110,y,35,"#116e62",800);
  ctx.font=exportFont(34,600);const lines=splitLines(ctx,body,785);
  for(let i=0;i<Math.min(lines.length,2);i++)exportText(ctx,lines[i],290,y+i*48,34,"#36545b",600);
  return y+Math.max(80,lines.length*48+20);
}
async function exportPageTwo(){
  const c=document.createElement("canvas");c.width=EXPORT_W;c.height=EXPORT_H;const ctx=c.getContext("2d");
  const info=dayInfo();
  drawHeader(ctx,"근무표 · 현장 메모",`10월 ${Number(selectedDay.slice(-2))}일 ${info.weekday}요일 · 원본 스케줄`,2);
  drawRound(ctx,70,370,1030,1110,28,"#ffffff","#dde9e8");
  exportText(ctx,"원본 스케줄",104,410,42,"#173e47",800);
  exportText(ctx,"사진 비율을 유지해 삽입했습니다",106,466,27,"#7a9299",500);
  const photo=await imageLoad(SCHEDULE_IMAGES[selectedDay]);
  if(photo){
    const maxW=966,maxH=920;
    const scale=Math.min(maxW/photo.width,maxH/photo.height);
    const w=photo.width*scale,h=photo.height*scale;
    const x=(EXPORT_W-w)/2, y=548+(maxH-h)/2;
    ctx.drawImage(photo,x,y,w,h);
  }else{
    drawRound(ctx,102,535,966,904,22,"#f3f7f7");
    exportText(ctx,"원본 스케줄 이미지가 없습니다",195,920,41,"#73898e",700);
  }
  drawRound(ctx,70,1515,1030,622,28,"#fff","#dde9e8");
  exportText(ctx,"근무 및 식사 메모",104,1546,46,"#173e47",800);
  ctx.fillStyle="#e9f0f0";ctx.fillRect(105,1610,960,2);
  let y=1650;
  for(const [label,slot] of [["2시 식사",5],["3시 식사",6]]){
    const names=breakPeople(slot);
    y=drawNoteLine(ctx,label,names.length?names.join(" · "):"입력 없음",y);
  }
  y=drawNoteLine(ctx,"근무변경",info.note||"없음",y+8);
  drawRound(ctx,110,1995,945,92,18,"#ecf7f3");
  exportText(ctx,"기준  16:00 교대 · 파트타임 최대 21:30",136,2014,30,"#1a625b",700);
  exportText(ctx,"원본 사진과 실제 휴게시간은 현장에서 재확인",83,2216,37,"#376069",650);
  exportText(ctx,"노란색 30분 근무 / 파란색 식사시간",85,2275,32,"#617b81",500);
  drawFooter(ctx,"스케줄 · 메모",2);
  return c;
}
function revokeExportAssets(){for(const x of exportAssets){if(x.url)URL.revokeObjectURL(x.url);}exportAssets=[];}
function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error("PNG 생성 실패")),"image/png"));}
async function renderResultCard(){
  const revision=++exportRevision, target=$("captureTarget"), empty=$("resultEmpty");
  if(!target||!empty)return;
  target.hidden=false;empty.hidden=true;
  target.innerHTML='<p class="export-loading">아이폰용 이미지를 만들고 있습니다…</p>';
  try{
    if(document.fonts?.ready)await document.fonts.ready;
    const page1=exportPageOne();const page2=await exportPageTwo();
    const blobs=await Promise.all([canvasBlob(page1),canvasBlob(page2)]);
    if(revision!==exportRevision)return;
    revokeExportAssets();
    exportAssets=blobs.map((blob,i)=>({blob,url:URL.createObjectURL(blob),name:`dimdim_${selectedDay}_${String(i+1).padStart(2,"0")}.png`}));
    target.innerHTML=`<div class="export-info"><h3>아이폰용 이미지 2장 완성</h3><p>각각 1170 × 2532px PNG입니다. 이미지를 길게 눌러 저장하거나, 아래 버튼으로 개별 저장할 수 있습니다.</p></div><div class="export-preview-grid">${exportAssets.map((asset,i)=>`<div class="export-preview"><div class="export-preview-head"><strong>${i===0?"1장 · 포지션 배치":"2장 · 원본 스케줄 / 현장 메모"}</strong><span>1170 × 2532</span></div><img src="${asset.url}" alt="${i+1}번째 아이폰 출력 이미지"/><a class="btn btn-primary export-download" href="${asset.url}" download="${asset.name}">${i+1}장 PNG 저장</a></div>`).join("")}</div>`;
  }catch(e){if(revision!==exportRevision)return;target.innerHTML='<p class="muted-empty">이미지 생성에 실패했습니다. 파일 경로와 브라우저를 확인해 주세요.</p>';console.error(e);}
}
function buildResult(){resultBuilt=true;renderResultCard();toast("아이폰용 PNG 출력 화면을 생성합니다.");}
async function downloadJpg(){
  if(!resultBuilt||exportAssets.length!==2){buildResult();toast("출력 이미지가 만들어진 뒤 공유 버튼을 다시 눌러 주세요.");return;}
  const files=exportAssets.map(item=>new File([item.blob],item.name,{type:"image/png"}));
  if(navigator.share&&navigator.canShare?.({files})){
    try{await navigator.share({files,title:`딤딤섬 포지션 ${selectedDay}`,text:"포지션 배치표와 원본 스케줄"});return;}
    catch(error){if(error.name==="AbortError")return;console.error(error);}
  }
  $("captureTarget").scrollIntoView({behavior:"smooth",block:"start"});
  toast("미리보기 이미지에서 1장·2장을 각각 저장하거나 길게 눌러 공유해 주세요.");
}

function openSheet(title,eyebrow,content){$("sheetTitle").textContent=title;$("sheetEyebrow").textContent=eyebrow;$("sheetContent").innerHTML=content;$("sheetBackdrop").hidden=false;$("bottomSheet").hidden=false;document.body.style.overflow="hidden";$("sheetClose").focus();}
function closeSheet(){$("sheetBackdrop").hidden=true;$("bottomSheet").hidden=true;document.body.style.overflow="";sheetMode=null;sheetStaff=null;}
function showStaff(name){sheetMode="staff";sheetStaff=name;const cov=coverage(name);const existing=getAssignedRole(name);const shifts=PERIODS[selectedPeriod];const danger=isPeakDay()&&PEAK_COUNTER_CAUTION.has(name)?`<div class="sheet-explain">금·토·일 카운터 교육이 부족하다는 현장 규칙이 있습니다. <strong>${name}</strong>은 특히 금·토·일 카운터를 권장하지 않습니다.</div>`:"";const snippet=`<div class="sheet-summary"><span>${state.rosters[selectedDay][name].type}</span><span>${dayInfo().label} ${PERIODS[selectedPeriod].name}</span><span>실제 근무 ${Math.round(cov.minutes/30)/2}시간</span>${existing?`<span>현재 ${roleName(existing)}</span>`:""}</div>${danger}<div class="sheet-divider">배치할 포지션 선택</div><div class="sheet-role-list">${ROLES.map(role=>{const last=lastDone(name,role.id);const tip=(role.id==="backbar"||role.id==="packing")?`마지막 담당 ${labelLast(last)}`:weekendWarn(name,role.id)?"금·토·일 카운터 주의":role.id==="clean"?"클린 & 세팅":"오전·오후 중복 배치 방지";const blocked=role.id==="counter"&&state.rosters[selectedDay][name].type!=="정직원";return `<button type="button" class="sheet-role" data-assign-role="${role.id}" ${blocked?"disabled":""}><span><strong>${role.name}${existing===role.id?" · 현재 배치":""}</strong><small>${blocked?"정직원 전용 · 파트타임 배치 불가":tip}</small></span><span class="arrow">→</span></button>`;}).join("")}</div>${existing?`<button class="sheet-clear" type="button" id="removeStaffBtn">현재 ${roleName(existing)} 배치 해제</button>`:""}<p class="history-note">같은 시간대에 다른 포지션을 선택하면 기존 배치는 자동으로 해제됩니다. 업무 배치는 선택 시간대 전체에 대한 기본 담당표입니다.</p>`;openSheet(name,"직원 선택 → 포지션 배치",snippet);document.querySelectorAll("[data-assign-role]").forEach(el=>el.addEventListener("click",()=>assign(name,el.dataset.assignRole)));$("removeStaffBtn")?.addEventListener("click",()=>removeStaff(name));}
function showSuggestions(role){sheetMode="recommend";const list=candidates(role);const markup=`<p class="sheet-explain">${role==="backbar"||role==="packing"?"마지막 담당일이 오래된 직원 우선, 같은 날이면 오전 기록 우선입니다. 기록 미입력 직원은 ‘기록 없음’으로 표시하고 뒤에 배치합니다.":"해당 시간대의 근무 가능 시간이 긴 직원부터 보여줍니다."} 금·토·일 카운터 주의 직원은 후순위입니다.</p><div class="suggested-list">${list.length?list.map((x,i)=>`<button type="button" class="sheet-role" data-assign-person="${x.name}"><span><strong><span class="rank">${i+1}</span> ${x.name}</strong><small>${candidateWhy(x,role)}</small></span><span class="arrow">＋</span></button>`).join(""):`<div class="muted-empty">추천할 미배치 직원이 없습니다.</div>`}</div>`;openSheet(`${roleName(role)} 추천 순서`,"포지션 선택 → 직원 배치",markup);document.querySelectorAll("[data-assign-person]").forEach(el=>el.addEventListener("click",()=>assign(el.dataset.assignPerson,role)));}
function assign(name,role){if(role==="counter"&&state.rosters[selectedDay]?.[name]?.type!=="정직원"){toast("카운터는 정직원만 배치할 수 있습니다.");return;}const cov=coverage(name);if(cov.minutes===0){toast("해당 시간대에 실제 근무 시간이 없습니다.");return;}if(weekendWarn(name,role)&&!window.confirm(`${name} 직원은 금·토·일 카운터 숙련도 주의 대상입니다. 그래도 배치하시겠습니까?`))return;for(const r of ROLES)state.plans[selectedDay][selectedPeriod][r.id]=state.plans[selectedDay][selectedPeriod][r.id].filter(n=>n!==name);state.plans[selectedDay][selectedPeriod][role].push(name);saveState();closeSheet();renderAll();toast(`${name} → ${roleName(role)} 배치했습니다.`);}
function removeStaff(name){for(const r of ROLES)state.plans[selectedDay][selectedPeriod][r.id]=state.plans[selectedDay][selectedPeriod][r.id].filter(n=>n!==name);saveState();closeSheet();renderAll();toast(`${name}의 배치를 해제했습니다.`);}
function outputPosition(){const p=state.plans[selectedDay], lines=[`10월 ${Number(selectedDay.slice(-2))}일 ${dayInfo().weekday}요일 포지션 입니다.`,""];for(const role of ROLES){const am=p.am[role.id].join(", ")||"(미배치)",pm=p.pm[role.id].join(", ")||"(미배치)";lines.push(`${roleName(role.id)} ${am} / ${pm}`);}lines.push("","*근무변경",dayInfo().note||"","☆ 풀근무자 식사시간");for(const [label,slot] of [["2시",5],["3시",6]]){const group=rosterNames().filter(name=>rowStatus(name,slot)==="break");lines.push(`${label} ${group.length?group.join(", "):"(입력 없음)"}`);}lines.push("","※ 사진 판독을 기반으로 만든 초안입니다. 시간·휴게·배치를 현장표와 대조하세요.");return lines.join("\n");}
async function copyText(){const content=outputPosition();try{await navigator.clipboard.writeText(content);toast("포지션 안내문을 복사했습니다.");}catch(e){const t=document.createElement("textarea");t.value=content;t.style.position="fixed";t.style.top="-9999px";document.body.appendChild(t);t.select();try{const result=document.execCommand("copy");toast(result?"포지션 안내문을 복사했습니다.":"복사 권한이 없어 텍스트를 선택해 주세요.");}catch(_){window.prompt("이 텍스트를 복사하세요.",content);}t.remove();}}
function showView(view){activeView=view;$("assignView").hidden=view!=="assign";$("scheduleView").hidden=view!=="schedule";$("tabAssign").classList.toggle("active",view==="assign");$("tabSchedule").classList.toggle("active",view==="schedule");}

/* 이벤트 */
document.querySelectorAll("[data-period]").forEach(el=>el.addEventListener("click",()=>{selectedPeriod=el.dataset.period;renderAll();}));
$("staffSearch").addEventListener("input",renderStaffPool);
$("fullOnly").addEventListener("change",renderStaffPool);
$("tabAssign").addEventListener("click",()=>showView("assign"));
$("tabSchedule").addEventListener("click",()=>showView("schedule"));
$("editSchedule").addEventListener("change",renderSchedule);
$("sheetClose").addEventListener("click",closeSheet);
$("sheetBackdrop").addEventListener("click",closeSheet);
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!$("bottomSheet").hidden)closeSheet();});
$("exportBtn").addEventListener("click",copyText);
$("buildResultBtn").addEventListener("click",buildResult);
$("downloadJpgBtn").addEventListener("click",downloadJpg);
$("clearPeriodBtn").addEventListener("click",()=>{if(!window.confirm(`${dayInfo().label} ${PERIODS[selectedPeriod].name} 포지션 배치를 비우시겠습니까?`))return;for(const r of ROLES)state.plans[selectedDay][selectedPeriod][r.id]=[];saveState();renderAll();toast("선택한 시간대의 배치를 비웠습니다.");});
$("resetBtn").addEventListener("click",()=>{if(!window.confirm("저장된 근무표 수정·배치·추가 이력을 모두 지우고 사진 기반 초안으로 복구하시겠습니까?"))return;state=initialState();saveState();renderAll();toast("초안으로 복구했습니다.");});
$("historySaveBtn").addEventListener("click",()=>{const name=$("historyStaff").value,role=$("historyRole").value,date=$("historyDate").value,period=$("historyPeriod").value;if(!name||!date){toast("직원과 날짜를 선택하세요.");return;}if(date>selectedDay||(date===selectedDay&&period==="pm"&&selectedPeriod==="am")){toast("현재 선택한 시간대 이전의 기록만 등록해 주세요.");return;}state.manualHistory.push({name,role,date,period});saveState();renderAll();toast(`${name}의 ${roleName(role)} 이력을 추가했습니다.`);});
renderAll();
