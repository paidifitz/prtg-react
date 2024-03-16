define(["@grafana/data","lodash","@grafana/runtime","rxjs","react","@grafana/ui"],((e,t,a,r,n,s)=>(()=>{"use strict";var o={781:t=>{t.exports=e},531:e=>{e.exports=a},7:e=>{e.exports=s},241:e=>{e.exports=t},959:e=>{e.exports=n},269:e=>{e.exports=r}},l={};function c(e){var t=l[e];if(void 0!==t)return t.exports;var a=l[e]={exports:{}};return o[e](a,a.exports,c),a.exports}c.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return c.d(t,{a:t}),t},c.d=(e,t)=>{for(var a in t)c.o(t,a)&&!c.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},c.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),c.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var i={};return(()=>{c.r(i),c.d(i,{plugin:()=>S});var e=c(781);const t={Message:"lastmessage",Status:"statustext","Status (Raw)":"statusid"};var a=c(241),r=c.n(a),n=c(531),s=c(269);function o(e,t){return t?("0"+(e+1)).slice(-2):("0"+e).slice(-2)}function l(e,t,a,r,n,s,o){try{var l=e[s](o),c=l.value}catch(e){return void a(e)}l.done?t(c):Promise.resolve(c).then(r,n)}function u(e){return function(){var t=this,a=arguments;return new Promise((function(r,n){var s=e.apply(t,a);function o(e){l(s,r,n,o,c,"next",e)}function c(e){l(s,r,n,o,c,"throw",e)}o(void 0)}))}}const m=e=>{const[t,a]=e.split(" "),[r,n,s]=t.split("/"),[o,l,c]=a.split(":");return`${s}-${n}-${r}T${o}:${l}:${c}.000Z`},d=e=>{const t=new Date(e);return[t.getFullYear(),o(t.getMonth(),!0),o(t.getDate()),o(t.getHours()),o(t.getMinutes()),o(t.getSeconds())].join("-")};class p extends e.DataSourceApi{query(a){var r=this;return u((function*(){const n=a.targets.map((s=u((function*(n){let s=(new Date).toISOString(),o=(l=r.cache_timeout,Date.now()-6e4*l);var l;let c="API Error: ";if(void 0===n.chart_type)return new e.MutableDataFrame({refId:n.refId,fields:[{name:"Time",values:[s],type:e.FieldType.time},{name:"Value",values:[0],type:e.FieldType.number}]});if("Time series"===n.chart_type){let t=[],s=[];const{range:l}=a,c=l.from.valueOf(),i=l.to.valueOf();let u=(e=>{let t=0;const a=e/36e5;return a>12&&a<36?t="300":a>36&&a<745?t="3600":a>745&&(t="86400"),t})(i-c),p="&sdate="+d(c),f="&edate="+d(i);const h=`id=${n.sensor_id}&avg=${u}${p}${f}&usecaption=true`,g=`historicdata.json&id=${n.sensor_id}&avg=${u}&${n.channel_name}`;if(r.cache[g]&&o<r.cache[g].timestamp)t=r.cache[g].dates_array,s=r.cache[g].results_array;else{const e=yield r.request("historicdata.json",h);if(e.data.histdata.length>0){let a=n.channel_name;a.includes("Traffic")&&(a+=" (Speed)"),e.data.histdata.forEach((function(e){parseFloat(e[a])>0&&(s.push(e[a]),t.push(m(e.datetime)))}))}r.cache[g]={results_array:s,dates_array:t,timestamp:Date.now()}}return new e.MutableDataFrame({refId:n.refId,fields:[{name:"Time",values:t,type:e.FieldType.time},{name:n.channel_name,values:s,type:e.FieldType.number}]})}if("Stat"===n.chart_type&&"Text"===n.query_mode){const a=`id=${n.sensor_id}`,l=a+`?filter_property=${n.filter_property}`;let c="N/a";return r.cache[l]&&o<r.cache[l].timestamp?(c=r.cache[l].last_value,s=r.cache[l].datetime):(c=(yield r.request("getsensordetails.json",a)).data.sensordata[t[n.filter_property]],r.cache[l]={last_value:c,datetime:s,timestamp:Date.now()}),new e.MutableDataFrame({refId:n.refId,fields:[{name:"Time",values:[s],type:e.FieldType.time},{name:"Message",values:[c],type:e.FieldType.string}]})}{let t="NaN";const a=`content=channels&columns=name,datetime,lastvalue_&id=${n.sensor_id}`,l=a+`?channel=${n.channel_name}`;if(r.cache[l]&&o<r.cache[l].timestamp)t=r.cache[l].converted_value,s=r.cache[l].datetime;else try{const e=yield r.request("table.json",a);if(e.data.channels.length>0){const a=e.data.channels.find((e=>e.name===n.channel_name));t=a.lastvalue_raw,s=m(a.datetime),r.cache[l]={converted_value:t,datetime:s,timestamp:Date.now()}}}catch(e){r.cache[l]?(t=r.cache[l].converted_value,s=r.cache[l].datetime,c+=`Using cached values: ${t}`):c+="No cached value, please refresh.",console.log(c)}return new e.MutableDataFrame({refId:n.refId,fields:[{name:"Time",values:[s],type:e.FieldType.time},{name:n.channel_name,values:[t],type:e.FieldType.number}]})}})),function(e){return s.apply(this,arguments)}));var s;return Promise.all(n).then((e=>({data:e})))}))()}request(e,t){var a=this;return u((function*(){const r=(0,n.getBackendSrv)().fetch({url:`${a.base_url}${e}${(null==t?void 0:t.length)?`?${t}`:"?"}&apitoken=${a.api_token}`});return(0,s.lastValueFrom)(r)}))()}testDatasource(){var e=this;return u((function*(){const t="Cannot connect to API";try{const a=yield e.request("status.json","");return 200===a.status?{status:"success",message:"Success. Version: "+a.data.Version+" returned from PTRG."}:{status:"error",message:a.statusText?a.statusText:t}}catch(e){let a="";return r().isString(e)?a=e:(0,n.isFetchError)(e)&&(a="Fetch error: "+(e.statusText?e.statusText:t),e.data&&e.data.error&&e.data.error.code&&(a+=": "+e.data.error.code+". "+e.data.error.message)),{status:"error",message:a}}}))()}constructor(e){super(e),this.base_url=e.jsonData.path||"",this.cache_timeout=e.jsonData.cache||5,this.api_token=e.jsonData.api_token||"",this.cache={}}}var f=c(959),h=c.n(f),g=c(7);function v(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function y(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{},r=Object.keys(a);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(a).filter((function(e){return Object.getOwnPropertyDescriptor(a,e).enumerable})))),r.forEach((function(t){v(e,t,a[t])}))}return e}function b(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):function(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a.push.apply(a,r)}return a}(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})),e}function w(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function E(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{},r=Object.keys(a);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(a).filter((function(e){return Object.getOwnPropertyDescriptor(a,e).enumerable})))),r.forEach((function(t){w(e,t,a[t])}))}return e}function _(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):function(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a.push.apply(a,r)}return a}(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))})),e}const j=["Metrics","Text","Raw"],x=["Message","Status","Status (Raw)"],N=["Sensor"],S=new e.DataSourcePlugin(p).setConfigEditor((function(e){const{onOptionsChange:t,options:a}=e,[r,n]=(0,f.useState)(a.jsonData.cache||""),[s,o]=(0,f.useState)(""),{jsonData:l,secureJsonFields:c}=a;return h().createElement("div",{className:"gf-form-group"},h().createElement(g.InlineField,{label:"Path",labelWidth:20},h().createElement(g.Input,{onChange:e=>{const r=b(y({},a.jsonData),{path:e.target.value});t(b(y({},a),{jsonData:r}))},value:l.path||"",placeholder:"json field returned to frontend",width:40})),h().createElement(g.InlineField,{label:"API Token",labelWidth:20},h().createElement(g.SecretInput,{value:l.api_token||"",placeholder:"api token",width:40,onChange:e=>{const r=b(y({},a.jsonData),{api_token:e.target.value});t(b(y({},a),{jsonData:r}))}})),h().createElement(g.InlineField,{label:"Cache timeout",labelWidth:20},h().createElement(g.Input,{onKeyPress:e=>{"Enter"===e.key&&e.preventDefault()},onChange:e=>{const r=parseInt(e.target.value,10);if(r>0&&r<=1440){const e=b(y({},a.jsonData),{cache:r});n(r),o(""),t(b(y({},a),{jsonData:e}))}else{const e=b(y({},a.jsonData),{cache:5});n(""),t(b(y({},a),{jsonData:e})),o("Cache timeout should be a number between 1 and 1440. It will default to 5 if not set.")}},value:r,placeholder:"Timeout in minutes",width:40})),h().createElement("div",null,h().createElement("p",{style:{paddingLeft:"165px",paddingTop:"8px",fontSize:"10px",color:"red"},id:"age-error"},s)))})).setQueryEditor((function({query:e,datasource:t,onChange:a,onRunQuery:r}){const n=t.base_url,s="&apitoken="+t.api_token,[o,l]=(0,f.useState)(e.query_mode||j[0]),[c,i]=(0,f.useState)(e.group_name||"*"),[u,m]=(0,f.useState)(e.device_name||"*"),[d,p]=(0,f.useState)(e.sensor_id||0),[v,y]=(0,f.useState)(e.channel_name||"*"),[b,w]=(0,f.useState)(e.filter_property||x[0]),[S,O]=(0,f.useState)(N[0]);let P=document.querySelector('[aria-label="Change Visualization"]').children[1].innerHTML;const D={switch:{paddingLeft:"20px",paddingRight:"30px"},fillPadding:{marginLeft:"15px"},calcButton:{padding:"0px 15px",margin:"0px 15px 4px 15px",borderRadius:"7px",color:"#FFF",border:"none",backgroundColor:"#3781DC"}},[T,I]=(0,f.useState)([""]),[$,F]=(0,f.useState)(!0);(0,f.useEffect)((()=>{fetch(n+"table.json?content=groups&count=9999&columns=objid,group,probe,tags,active,status,message,priority"+s).then((e=>e.json())).then((e=>{if(e.treesize>0){let t=Array.from(new Set(e.groups.map((e=>e.group)).sort()));t.unshift("*"),I(t)}else console.log("No Groups.");F(!1)})).catch((e=>{console.error(`An error occurred: ${e}`)}))}),[]);const[k,q]=(0,f.useState)([""]),[C,M]=(0,f.useState)(!0);(0,f.useEffect)((()=>{let e=n+"table.json?content=devices&count=9999&columns=objid,device,group,probe,tags,active,status,message,priority"+s;"*"!==c&&(e+="&filter_group="+c),fetch(e).then((e=>e.json())).then((e=>{if(e.treesize>0){let t=Array.from(new Set(e.devices.map((e=>e.device)).sort()));t.unshift("*"),q(t)}else"*"!==c?(q(["*"]),console.log("No devices for that group.")):console.log("No Devices.");M(!1)})).catch((e=>{console.error(`An error occurred: ${e}`)}))}),[c]);const[L,R]=(0,f.useState)([""]),[A,V]=(0,f.useState)(!0);(0,f.useEffect)((()=>{let e=n+"table.json?content=sensors&count=9999&columns=objid,sensor,device,group,probe,tags,active,status,message,priority"+s;"*"!==u&&(e+="&filter_device="+u),fetch(e).then((e=>e.json())).then((e=>{if(e.treesize>0){let t=[];e.sensors.forEach((function(e){let a={};a.id=e.objid,a.name=e.sensor,t.push(a)})),t.unshift({id:0,name:"*"}),R(t)}else"*"!==u?(R([{id:0,name:"*"}]),console.log("No sensors for that device.")):console.log("No Sensors.");V(!1)})).catch((e=>{console.error(`An error occurred: ${e}`)}))}),[u]);const[z,G]=(0,f.useState)([""]),[H,Q]=(0,f.useState)(!0);function W(t,n){a(_(E({},e),{query_mode:o,chart_type:P,group_name:c,device_name:u,sensor_id:t,channel_name:"*",filter_property:n})),r()}return(0,f.useEffect)((()=>{let e=n+"table.json?content=channels&output=json&columns=name,datetime,lastvalue_&id=";e+=0!==d?d+"&noraw=1&usecaption=true"+s:"0&noraw=1&usecaption=true"+s,fetch(e).then((e=>e.json())).then((e=>{if(e.channels.length>0){let t=[];e.channels.forEach((function(e){let a={};a.name=e.name,a.last_value=e.lastvalue,t.push(a)})),t.unshift({name:"*"}),G(t)}else 0!==d?(G([{name:"*"}]),console.log("No channels for that sensor.")):console.log("No Channels.");Q(!1)})).catch((e=>{console.error(`An error occurred: ${e}`)}))}),[d]),document.querySelector('[aria-label="Refresh dashboard"]').addEventListener("click",(t=>{a(_(E({},e),{query_mode:o,chart_type:P,group_name:c,device_name:u,sensor_id:parseInt(d),channel_name:v})),r()})),h().createElement("div",null,h().createElement("div",{className:"gf-form-inline"},h().createElement("div",{className:"gf-form max-width-20"},h().createElement("div",{className:"gf-form-label width-7"},"Query Mode"),h().createElement("select",{value:o,onChange:e=>l(e.target.value),className:"gf-form-select-wrapper max-width-20",type:"string"},h().createElement("option",{value:"Metrics",className:"gf-form-input"},"Metrics"),h().createElement("option",{value:"Text",className:"gf-form-input"},"Text"),h().createElement("option",{value:"Raw",className:"gf-form-input",disabled:"true"},"Raw"))),h().createElement("div",{className:"gf-form gf-form--grow",style:D.fillPadding},h().createElement("div",{className:"gf-form-label gf-form-label--grow"}))),"Raw"!==o?h().createElement("div",{className:"gf-form-inline"},h().createElement("div",{className:"gf-form max-width-20"},h().createElement("div",{htmlLabel:"Group",className:"gf-form-label query-keyword width-7"},"Group"),$?h().createElement(g.Input,{type:"text",disabled:!0,placeholder:" Loading groups..."}):h().createElement("select",{value:c,onChange:e=>i(e.target.value),className:"gf-form-select-wrapper max-width-20",type:"string"},T.map((e=>h().createElement("option",{value:e,className:"gf-form-input"},e))))),h().createElement("div",{className:"gf-form max-width-20"},h().createElement("div",{htmlLabel:"Host",className:"gf-form-label query-keyword width-7",style:D.fillPadding},"Host"),C?h().createElement(g.Input,{type:"text",disabled:!0,placeholder:" Loading hosts..."}):h().createElement("select",{value:u,onChange:e=>m(e.target.value),className:"gf-form-select-wrapper max-width-20",type:"string"},k.map((e=>h().createElement("option",{value:e,className:"gf-form-input"},e)))))):h().createElement("div",{className:"gf-form-inline"},h().createElement("div",{className:"gf-form max-width-30"},h().createElement("div",{className:"gf-form-label query-keyword width-7"},"URI"),h().createElement(g.Input,{type:"text",disabled:!0,placeholder:"To be developed...",className:"gf-form-wrapper max-width-25"})),h().createElement("div",{className:"gf-form max-width-30"},h().createElement("div",{className:"gf-form-label query-keyword width-10"},"Query String"),h().createElement(g.Input,{type:"text",disabled:!0,placeholder:"To be developed...",className:"gf-form-wrapper max-width-25"})),h().createElement("div",{className:"gf-form gf-form--grow"},h().createElement("div",{className:"gf-form-label gf-form-label--grow"}))),"Raw"!==o?h().createElement("div",{className:"gf-form-inline"},h().createElement("div",{className:"gf-form max-width-30"},h().createElement("div",{htmlLabel:"Sensor",className:"gf-form-label query-keyword width-7"},"Sensor"),A?h().createElement(g.Input,{type:"text",disabled:!0,placeholder:" Loading sensors..."}):h().createElement("select",{value:d,onChange:e=>{let t=e.target.value;p(t),"Text"===o&&"Stat"==P?W(t,b):console.log("No sensor details required.")},className:"gf-form-select-wrapper max-width-30 sensorValue",type:"string"},L.map((e=>h().createElement("option",{value:e.id,className:"gf-form-input"},e.name))))),"Text"!==o?h().createElement("div",{className:"gf-form max-width-30"},h().createElement("div",{htmlLabel:"Channel",className:"gf-form-label query-keyword width-7",style:D.fillPadding},"Channel"),0!==d?h().createElement("select",{value:v,onChange:t=>{let n=t.target.value;y(n),a(_(E({},e),{query_mode:o,chart_type:P,group_name:c,device_name:u,sensor_id:parseInt(d),channel_name:n})),r()},className:"gf-form-select-wrapper max-width-30",type:"string"},z.map((e=>h().createElement("option",{value:e.name,className:"gf-form-input"},e.name)))):h().createElement(g.Input,{type:"text",disabled:!0,placeholder:H?" Loading channels...":" Sensor must be selected first."})):""):"","Text"===o?h().createElement("div",{className:"gf-form-inline"},h().createElement("div",{className:"gf-form max-width-40"},h().createElement("div",{className:"gf-form-label query-keyword width-7"},"Options")),"Text"===o?h().createElement("div",{className:"gf-form max-width-20"},h().createElement("div",{className:"gf-form-label width-10"},"Value From"),h().createElement("select",{value:S,onChange:e=>O(e.target.value),className:"gf-form-select-wrapper "},N.map((e=>h().createElement("option",{value:e,className:"gf-form-input"},e))))):"","Text"===o?h().createElement("div",{className:"gf-form max-width-20"},h().createElement("div",{className:"gf-form-label width-10"},"Filter Property"),h().createElement("select",{value:b,onChange:e=>{let t=e.target.value;w(t),"Text"===o&&"Stat"==P&&0!==d?W(d,t):console.log("No Get call for sensor")},className:"gf-form-select-wrapper "},x.map((e=>h().createElement("option",{value:e,className:"gf-form-input"},e))))):""):"")}))})(),i})()));
//# sourceMappingURL=module.js.map