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
const PERIODS = { am:{name:"오전", start:0,end:5}, pm:{name:"오후", start:6,end:12} };
const ROLES = [
  {id:"counter",name:"카운터",symbol:"▣"},
  {id:"backbar",name:"빽바",symbol:"▤"},
  {id:"deli",name:"딜리",symbol:"◫"},
  {id:"clean",name:"클세",symbol:"✳"},
  {id:"packing",name:"포장",symbol:"▱"}
];
const PEAK_COUNTER_CAUTION = new Set(["김영진","황지아보"]);
const STORAGE_KEY="dimdim-position-prototype-v1";

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
  for(const [key,status] of [["extend30","extend30"],["extend60","extend60"],["training","training"]]){
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
  {break:{"이승민":"5","김현우":"6","김희준":"6","황지아보":"5","김영진":"5","권주성":"6","김명섭":"6"},extend30:{"김영진":"2","변지웅":"1"}}
 ),
 "2026-10-21":makeDay(
  {"김현우":"3-5,7-11","김희준":"2-4,6-10","석보라":"3-5,7-12","김영진":"0-4,6-8","김단영":"3-5,7-11","김명섭":"2-4,6-10","정연우":"2-5,7-10"},
  {"변지웅":"0-6","이승우":"1-6","김두빈":"7-11","박수연":"7-11"},
  {break:{"김현우":"6","김희준":"5","석보라":"6","김영진":"5","김단영":"6","김명섭":"5","정연우":"6"},extend30:{"정연우":"2","이승우":"1"},extend60:{"석보라":"3"}}
 ),
 "2026-10-22":makeDay(
  {"김현우":"0-4,6-8","김희준":"4-5,7-12","석보라":"2-5,7-10","황지아보":"3-5,7-11","김단영":"3-5,7-11","권주성":"2-4,6-10","정연우":"2-4,6-10"},
  {"이승우":"0-6","양유열":"1-6","변지웅":"2-6","김명섭":"7-11","채민우":"8-11"},
  {break:{"김현우":"5","김희준":"6","석보라":"6","황지아보":"6","김단영":"6","권주성":"5","정연우":"5"},extend30:{"양유열":"1","정연우":"3","채민우":"8"}}
 ),
 "2026-10-23":makeDay(
  {"이승민":"4-5,7-12","김희준":"2-4,6-10","김영진":"3-5,7-11","황지아보":"0-4,6-8","김단영":"3-4,6-11"},
  {"김두빈":"0-6","김명섭":"1-6","주혜민":"2-6","양유열":"2-6","박연주":"2-6","조원우":"7-11","박수연":"7-11","김선영":"7-11","최주은":"8-11","채민우":"8-11"},
  {break:{"이승민":"6","김희준":"5","김영진":"6","황지아보":"5","김단영":"5"},extend30:{"김명섭":"1","채민우":"8"}}
 ),
 "2026-10-24":makeDay(
  {"이승민":"2-4,6-10","김희준":"0-4,6-8","석보라":"4-5,7-12","권주성":"3-5,7-11","정연우":"2-4,6-10"},
  {"김두빈":"0-6","채민우":"1-6","김선영":"1-6","박연주":"2-6","장승원":"2-6","주혜민":"3-5,7-11","김민지":"7-11","권예준":"7-11","조원우":"7-11","최주은":"7-11","최희재":"8-11"},
  {break:{"이승민":"5","김희준":"5","석보라":"6","권주성":"6","정연우":"5","주혜민":"6"},extend30:{"채민우":"1","김선영":"1"}}
 ),
 "2026-10-25":makeDay(
  {"이승민":"2-4,6-10","김현우":"4-5,7-12","황지아보":"3-5,7-11","김영진":"0-4,6-8","김단영":"3-5,7-11","정연우":"3-5,7-11","한여진":"2-4,6-10"},
  {"김두빈":"0-6","박연주":"1-6","히라이":"1-6","김민지":"2-4,6-10","조원우":"7-11","권예준":"7-11"},
  {break:{"이승민":"5","김현우":"6","황지아보":"6","김영진":"5","김단영":"6","정연우":"6","한여진":"5","김민지":"5"},extend30:{"한여진":"2","박연주":"1","히라이":"1"}}
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
function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved&&saved.rosters&&saved.plans&&saved.manualHistory)return saved;}catch(e){/* private browsing may block storage */}return initialState();}
let state=loadState(),selectedDay="2026-10-25",selectedPeriod="am",activeView="assign",sheetMode=null,sheetStaff=null;
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){toast("저장 공간에 접근할 수 없습니다. 현재 화면에서만 유지됩니다.");}}
function $(id){return document.getElementById(id);}
function dayInfo(){return DAYS.find(d=>d.date===selectedDay);}
function isPeakDay(){return ["금","토","일"].includes(dayInfo().weekday);}
function rowStatus(person,index){return state.rosters[selectedDay]?.[person]?.slots?.[index]||"off";}
function active(status){return ["work","extend30","extend60","training"].includes(status);}
function coverage(name){let minutes=0;const rangePeriod=PERIODS[selectedPeriod];for(let i=rangePeriod.start;i<=rangePeriod.end;i++){if(active(rowStatus(name,i)))minutes+=(i===0?30:60);}const max=selectedPeriod==="am"?330:420;return {minutes,percent:Math.round(minutes/max*100)};}
function rosterNames(){return Object.keys(state.rosters[selectedDay]||{}).sort((a,b)=>a.localeCompare(b,"ko"));}
function activeRosterNames(){return rosterNames().filter(n=>coverage(n).minutes>0);}
function getAssignedRole(name){const p=state.plans[selectedDay][selectedPeriod];return ROLES.find(r=>p[r.id].includes(name))?.id||null;}
function roleName(role){return ROLES.find(r=>r.id===role)?.name||role;}
function localDay(date){return date.slice(5).replace("-","/");}
function historyLogs(){const logs=[];function add(day,p,plan){for(const [r,names] of Object.entries(plan)){for(const name of names)logs.push({name,role:r,date:day,period:p,source:"position"});}}for(const p of ["am","pm"])add("2026-10-19",p,HISTORY_19[p]);for(const [day,parts] of Object.entries(state.plans)){for(const p of ["am","pm"])add(day,p,parts[p]);}for(const entry of state.manualHistory)logs.push({...entry,source:"manual"});return logs;}
function eventRank(entry){return entry.date+":"+(entry.period==="am"?"0":"1");}
function lastDone(name,role){const cutoff=selectedDay+":"+(selectedPeriod==="am"?"0":"1");const arr=historyLogs().filter(x=>x.name===name&&x.role===role&&eventRank(x)<cutoff).sort((a,b)=>eventRank(b).localeCompare(eventRank(a)));return arr[0]||null;}
function labelLast(log){return log?`${localDay(log.date)} ${log.period==="am"?"오전":"오후"}`:"기록 없음";}
function weekendWarn(name,role){return isPeakDay()&&role==="counter"&&PEAK_COUNTER_CAUTION.has(name);}
function candidates(role){return activeRosterNames().filter(name=>!getAssignedRole(name)).map(name=>({name,cov:coverage(name),last:lastDone(name,role),risk:weekendWarn(name,role)})).sort((a,b)=>{
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
function renderStaffPool(){let pool=activeRosterNames().map(n=>({name:n,cov:coverage(n)}));const search=$("staffSearch").value.trim();if(search)pool=pool.filter(x=>x.name.includes(search));if($("fullOnly").checked)pool=pool.filter(x=>x.cov.percent>=55);pool.sort((a,b)=>b.cov.minutes-a.cov.minutes||a.name.localeCompare(b.name,"ko"));$("poolCount").textContent=`${pool.length}명 표시`;$("staffPool").innerHTML=pool.length?pool.map(x=>{const role=getAssignedRole(x.name);const caution=isPeakDay()&&PEAK_COUNTER_CAUTION.has(x.name);const group=state.rosters[selectedDay][x.name].type==="정직원"?"정":"파";return `<button type="button" class="staff-btn" data-person="${x.name}"><span class="line"><strong>${x.name}</strong><small>${group} · ${x.cov.percent}%</small></span><span class="details">${role?`<span class="badge assigned">${roleName(role)} 배치</span>`:`<span class="badge ${x.cov.percent<55?"weak":""}">${x.cov.percent<55?"부분근무":"배치 가능"}</span>`}${caution?`<span class="badge warn">금·토·일 카운터 주의</span>`:""}</span></button>`;}).join(""):`<div class="muted-empty">해당 조건의 근무자가 없습니다.</div>`;document.querySelectorAll("[data-person]").forEach(el=>el.addEventListener("click",()=>showStaff(el.dataset.person)));}
function renderPositions(){const p=state.plans[selectedDay][selectedPeriod];$("positions").innerHTML=ROLES.map(role=>{const list=p[role.id],cand=candidates(role.id);return `<div class="position-card"><div class="position-head"><div class="position-title"><span class="position-icon">${role.symbol}</span><h3>${role.name}</h3><small>${list.length}명</small></div><button type="button" class="recommend-btn" data-suggest="${role.id}">추천 보기 →</button></div><div class="placed">${list.length?list.map(n=>`<button type="button" class="placed-chip" data-person="${n}" title="눌러 배치 변경">${n}<span>↗</span></button>`).join(""):`<span class="placeholder">배치된 직원이 없습니다</span>`}</div><div class="recommend-line">${(role.id==="backbar"||role.id==="packing")&&cand[0]?`이력 우선 추천: <b>${cand[0].name}</b> · ${labelLast(cand[0].last)}`:cand[0]?`추천: <b>${cand[0].name}</b> · 근무 ${Math.round(cand[0].cov.minutes/30)/2}시간`:"현재 추천할 미배치 인원 없음"}</div></div>`;}).join("");document.querySelectorAll("[data-suggest]").forEach(el=>el.addEventListener("click",()=>showSuggestions(el.dataset.suggest)));document.querySelectorAll(".placed [data-person]").forEach(el=>el.addEventListener("click",()=>showStaff(el.dataset.person)));}
function sumStaffAt(index,type){return Object.values(state.rosters[selectedDay]).filter(entry=>(!type||entry.type===type)&&active(entry.slots[index])).length;}
function renderSchedule(){const header=$("scheduleTable").querySelector("thead"),body=$("scheduleTable").querySelector("tbody");const headerRow=label=>`<tr><th class="name">${label}</th>${TIMES.map(t=>`<th>${t}</th>`).join("")}</tr>`;header.innerHTML=headerRow("시간")+`<tr class="head-target"><th class="name">목표 인원</th>${dayInfo().target.map(n=>`<th>${n}</th>`).join("")}</tr>`+`<tr class="head-count"><th class="name">현재 근무</th>${TIMES.map((_,i)=>`<th title="정직원 ${sumStaffAt(i,"정직원")} / 파트 ${sumStaffAt(i,"파트타임")}">${sumStaffAt(i)}</th>`).join("")}</tr>`;const names=rosterNames();body.innerHTML=names.map(name=>{const record=state.rosters[selectedDay][name];return `<tr><th class="name" title="${record.type}">${name}<span style="font-size:9px;color:#9ba9a9"> ${record.type==="정직원"?"정":"파"}</span></th>${record.slots.map((status,i)=>`<td data-edit-person="${name}" data-edit-slot="${i}" class="${status} ${$("editSchedule").checked?"editing":""}" title="${TIMES[i]} · ${statusLabel(status)}">${statusText(status)}</td>`).join("")}</tr>`;}).join("");body.querySelectorAll("[data-edit-person]").forEach(el=>el.addEventListener("click",()=>{if(!$("editSchedule").checked)return;const row=state.rosters[selectedDay][el.dataset.editPerson];const i=Number(el.dataset.editSlot);const next={off:"work",work:"break",break:"extend30",extend30:"extend60",extend60:"training",training:"off"};row.slots[i]=next[row.slots[i]]||"off";saveState();renderStats();renderStaffPool();renderPositions();renderSchedule();}));}
function statusText(status){return {off:"",work:"●",break:"식사",extend30:"30분",extend60:"1시간",training:"클세"}[status]||"";}
function statusLabel(status){return {off:"비근무",work:"근무",break:"식사",extend30:"30분 연장",extend60:"1시간 연장",training:"신입 클세"}[status]||"";}
function renderHistory(){const hist=historyLogs();$("historyBoard").innerHTML=["backbar","packing"].map(role=>{const result=rosterNames().map(name=>({name,log:lastDone(name,role)})).filter(x=>x.log).sort((a,b)=>eventRank(a.log).localeCompare(eventRank(b.log))).slice(0,8);return `<div class="history-panel"><h3>${roleName(role)} · 오래된 순</h3>${result.length?result.map(x=>`<div class="history-item"><strong>${x.name}</strong><span>${labelLast(x.log)}</span></div>`).join(""):`<div class="subtle">선택 날짜 이전 기록이 없습니다</div>`}</div>`;}).join("");const old=$("historyStaff").value;const all=new Set([...Object.keys(state.rosters[selectedDay]),...historyLogs().map(h=>h.name)]);$("historyStaff").innerHTML=[...all].sort((a,b)=>a.localeCompare(b,"ko")).map(n=>`<option value="${n}">${n}</option>`).join("");if(all.has(old))$("historyStaff").value=old;}
function renderAll(){renderDateTabs();renderPeriod();renderStats();renderStaffPool();renderPositions();renderSchedule();renderHistory();}
function openSheet(title,eyebrow,content){$("sheetTitle").textContent=title;$("sheetEyebrow").textContent=eyebrow;$("sheetContent").innerHTML=content;$("sheetBackdrop").hidden=false;$("bottomSheet").hidden=false;document.body.style.overflow="hidden";$("sheetClose").focus();}
function closeSheet(){$("sheetBackdrop").hidden=true;$("bottomSheet").hidden=true;document.body.style.overflow="";sheetMode=null;sheetStaff=null;}
function showStaff(name){sheetMode="staff";sheetStaff=name;const cov=coverage(name);const existing=getAssignedRole(name);const shifts=PERIODS[selectedPeriod];const danger=isPeakDay()&&PEAK_COUNTER_CAUTION.has(name)?`<div class="sheet-explain">금·토·일 카운터 교육이 부족하다는 현장 규칙이 있습니다. <strong>${name}</strong>은 특히 금·토·일 카운터를 권장하지 않습니다.</div>`:"";const snippet=`<div class="sheet-summary"><span>${state.rosters[selectedDay][name].type}</span><span>${dayInfo().label} ${PERIODS[selectedPeriod].name}</span><span>실제 근무 ${Math.round(cov.minutes/30)/2}시간</span>${existing?`<span>현재 ${roleName(existing)}</span>`:""}</div>${danger}<div class="sheet-divider">배치할 포지션 선택</div><div class="sheet-role-list">${ROLES.map(role=>{const last=lastDone(name,role.id);const tip=(role.id==="backbar"||role.id==="packing")?`마지막 담당 ${labelLast(last)}`:weekendWarn(name,role.id)?"금·토·일 카운터 주의":role.id==="clean"?"클린 & 세팅":"오전·오후 중복 배치 방지";return `<button type="button" class="sheet-role" data-assign-role="${role.id}"><span><strong>${role.name}${existing===role.id?" · 현재 배치":""}</strong><small>${tip}</small></span><span class="arrow">→</span></button>`;}).join("")}</div>${existing?`<button class="sheet-clear" type="button" id="removeStaffBtn">현재 ${roleName(existing)} 배치 해제</button>`:""}<p class="history-note">같은 시간대에 다른 포지션을 선택하면 기존 배치는 자동으로 해제됩니다. 업무 배치는 선택 시간대 전체에 대한 기본 담당표입니다.</p>`;openSheet(name,"직원 선택 → 포지션 배치",snippet);document.querySelectorAll("[data-assign-role]").forEach(el=>el.addEventListener("click",()=>assign(name,el.dataset.assignRole)));$("removeStaffBtn")?.addEventListener("click",()=>removeStaff(name));}
function showSuggestions(role){sheetMode="recommend";const list=candidates(role);const markup=`<p class="sheet-explain">${role==="backbar"||role==="packing"?"마지막 담당일이 오래된 직원 우선, 같은 날이면 오전 기록 우선입니다. 기록 미입력 직원은 ‘기록 없음’으로 표시하고 뒤에 배치합니다.":"해당 시간대의 근무 가능 시간이 긴 직원부터 보여줍니다."} 금·토·일 카운터 주의 직원은 후순위입니다.</p><div class="suggested-list">${list.length?list.map((x,i)=>`<button type="button" class="sheet-role" data-assign-person="${x.name}"><span><strong><span class="rank">${i+1}</span> ${x.name}</strong><small>${candidateWhy(x,role)}</small></span><span class="arrow">＋</span></button>`).join(""):`<div class="muted-empty">추천할 미배치 직원이 없습니다.</div>`}</div>`;openSheet(`${roleName(role)} 추천 순서`,"포지션 선택 → 직원 배치",markup);document.querySelectorAll("[data-assign-person]").forEach(el=>el.addEventListener("click",()=>assign(el.dataset.assignPerson,role)));}
function assign(name,role){const cov=coverage(name);if(cov.minutes===0){toast("해당 시간대에 실제 근무 시간이 없습니다.");return;}if(weekendWarn(name,role)&&!window.confirm(`${name} 직원은 금·토·일 카운터 숙련도 주의 대상입니다. 그래도 배치하시겠습니까?`))return;for(const r of ROLES)state.plans[selectedDay][selectedPeriod][r.id]=state.plans[selectedDay][selectedPeriod][r.id].filter(n=>n!==name);state.plans[selectedDay][selectedPeriod][role].push(name);saveState();closeSheet();renderAll();toast(`${name} → ${roleName(role)} 배치했습니다.`);}
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
$("clearPeriodBtn").addEventListener("click",()=>{if(!window.confirm(`${dayInfo().label} ${PERIODS[selectedPeriod].name} 포지션 배치를 비우시겠습니까?`))return;for(const r of ROLES)state.plans[selectedDay][selectedPeriod][r.id]=[];saveState();renderAll();toast("선택한 시간대의 배치를 비웠습니다.");});
$("resetBtn").addEventListener("click",()=>{if(!window.confirm("저장된 근무표 수정·배치·추가 이력을 모두 지우고 사진 기반 초안으로 복구하시겠습니까?"))return;state=initialState();saveState();renderAll();toast("초안으로 복구했습니다.");});
$("historySaveBtn").addEventListener("click",()=>{const name=$("historyStaff").value,role=$("historyRole").value,date=$("historyDate").value,period=$("historyPeriod").value;if(!name||!date){toast("직원과 날짜를 선택하세요.");return;}if(date>selectedDay||(date===selectedDay&&period==="pm"&&selectedPeriod==="am")){toast("현재 선택한 시간대 이전의 기록만 등록해 주세요.");return;}state.manualHistory.push({name,role,date,period});saveState();renderAll();toast(`${name}의 ${roleName(role)} 이력을 추가했습니다.`);});
renderAll();
