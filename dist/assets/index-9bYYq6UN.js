import{a6 as mn,s as Mt}from"./index-b9OYvAdP.js";const Je=()=>{};let Ue={},At={},kt=null,Nt={mark:Je,measure:Je};try{typeof window<"u"&&(Ue=window),typeof document<"u"&&(At=document),typeof MutationObserver<"u"&&(kt=MutationObserver),typeof performance<"u"&&(Nt=performance)}catch{}const{userAgent:Qe=""}=Ue.navigator||{},j=Ue,g=At,Ze=kt,ie=Nt;j.document;const _=!!g.documentElement&&!!g.head&&typeof g.addEventListener=="function"&&typeof g.createElement=="function",wt=~Qe.indexOf("MSIE")||~Qe.indexOf("Trident/");var h="classic",Ot="duotone",C="sharp",M="sharp-duotone",dn=[h,Ot,C,M],pn={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds"}},et={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},gn=["kit"],hn=/fa(s|r|l|t|d|b|k|kd|ss|sr|sl|st|sds)?[\-\ ]/,bn=/Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit)?.*/i,yn={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},vn={"Font Awesome 6 Free":{900:"fas",400:"far"},"Font Awesome 6 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 6 Brands":{400:"fab",normal:"fab"},"Font Awesome 6 Duotone":{900:"fad"},"Font Awesome 6 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 6 Sharp Duotone":{900:"fasds"}},xn={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds"}},Ln={classic:["fas","far","fal","fat"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds"]},zn={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid"}},Cn={classic:{solid:"fas",regular:"far",light:"fal",thin:"fat",duotone:"fad",brands:"fab"},sharp:{solid:"fass",regular:"fasr",light:"fasl",thin:"fast"},"sharp-duotone":{solid:"fasds"}},Pt={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fad:"duotone","fa-duotone":"duotone",fab:"brands","fa-brands":"brands"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid"}},Mn=["solid","regular","light","thin","duotone","brands"],St=[1,2,3,4,5,6,7,8,9,10],An=St.concat([11,12,13,14,15,16,17,18,19,20]),Q={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},kn=[...Object.keys(Ln),...Mn,"2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","fw","inverse","layers-counter","layers-text","layers","li","pull-left","pull-right","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul",Q.GROUP,Q.SWAP_OPACITY,Q.PRIMARY,Q.SECONDARY].concat(St.map(e=>"".concat(e,"x"))).concat(An.map(e=>"w-".concat(e))),Nn={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},wn={kit:{"fa-kit":"fak"},"kit-duotone":{"fa-kit-duotone":"fakd"}},On={kit:{fak:"fa-kit"},"kit-duotone":{fakd:"fa-kit-duotone"}},tt={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}};const T="___FONT_AWESOME___",Ce=16,Et="fa",Tt="svg-inline--fa",X="data-fa-i2svg",Me="data-fa-pseudo-element",Pn="data-fa-pseudo-element-pending",Ye="data-prefix",We="data-icon",nt="fontawesome-i2svg",Sn="async",En=["HTML","HEAD","STYLE","SCRIPT"],It=(()=>{try{return!0}catch{return!1}})(),_t=[h,C,M];function re(e){return new Proxy(e,{get(t,n){return n in t?t[n]:t[h]}})}const Ft={...Pt};Ft[h]={...Pt[h],...et.kit,...et["kit-duotone"]};const W=re(Ft),Ae={...Cn};Ae[h]={...Ae[h],...tt.kit,...tt["kit-duotone"]};const ne=re(Ae),ke={...zn};ke[h]={...ke[h],...On.kit};const H=re(ke),Ne={...xn};Ne[h]={...Ne[h],...wn.kit};const Tn=re(Ne),In=hn,Rt="fa-layers-text",_n=bn,Fn={...pn};re(Fn);const Rn=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],be=Q,q=new Set;Object.keys(ne[h]).map(q.add.bind(q));Object.keys(ne[C]).map(q.add.bind(q));Object.keys(ne[M]).map(q.add.bind(q));const jn=[...gn,...kn],ee=j.FontAwesomeConfig||{};function Dn(e){var t=g.querySelector("script["+e+"]");if(t)return t.getAttribute(e)}function Un(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}g&&typeof g.querySelector=="function"&&[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]].forEach(t=>{let[n,a]=t;const r=Un(Dn(n));r!=null&&(ee[a]=r)});const jt={styleDefault:"solid",familyDefault:"classic",cssPrefix:Et,replacementClass:Tt,autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};ee.familyPrefix&&(ee.cssPrefix=ee.familyPrefix);const K={...jt,...ee};K.autoReplaceSvg||(K.observeMutations=!1);const f={};Object.keys(jt).forEach(e=>{Object.defineProperty(f,e,{enumerable:!0,set:function(t){K[e]=t,te.forEach(n=>n(f))},get:function(){return K[e]}})});Object.defineProperty(f,"familyPrefix",{enumerable:!0,set:function(e){K.cssPrefix=e,te.forEach(t=>t(f))},get:function(){return K.cssPrefix}});j.FontAwesomeConfig=f;const te=[];function Yn(e){return te.push(e),()=>{te.splice(te.indexOf(e),1)}}const F=Ce,O={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Wn(e){if(!e||!_)return;const t=g.createElement("style");t.setAttribute("type","text/css"),t.innerHTML=e;const n=g.head.childNodes;let a=null;for(let r=n.length-1;r>-1;r--){const s=n[r],i=(s.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(i)>-1&&(a=s)}return g.head.insertBefore(t,a),e}const Hn="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function ae(){let e=12,t="";for(;e-- >0;)t+=Hn[Math.random()*62|0];return t}function J(e){const t=[];for(let n=(e||[]).length>>>0;n--;)t[n]=e[n];return t}function He(e){return e.classList?J(e.classList):(e.getAttribute("class")||"").split(" ").filter(t=>t)}function Dt(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Xn(e){return Object.keys(e||{}).reduce((t,n)=>t+"".concat(n,'="').concat(Dt(e[n]),'" '),"").trim()}function me(e){return Object.keys(e||{}).reduce((t,n)=>t+"".concat(n,": ").concat(e[n].trim(),";"),"")}function Xe(e){return e.size!==O.size||e.x!==O.x||e.y!==O.y||e.rotate!==O.rotate||e.flipX||e.flipY}function Gn(e){let{transform:t,containerWidth:n,iconWidth:a}=e;const r={transform:"translate(".concat(n/2," 256)")},s="translate(".concat(t.x*32,", ").concat(t.y*32,") "),i="scale(".concat(t.size/16*(t.flipX?-1:1),", ").concat(t.size/16*(t.flipY?-1:1),") "),o="rotate(".concat(t.rotate," 0 0)"),c={transform:"".concat(s," ").concat(i," ").concat(o)},l={transform:"translate(".concat(a/2*-1," -256)")};return{outer:r,inner:c,path:l}}function Bn(e){let{transform:t,width:n=Ce,height:a=Ce,startCentered:r=!1}=e,s="";return r&&wt?s+="translate(".concat(t.x/F-n/2,"em, ").concat(t.y/F-a/2,"em) "):r?s+="translate(calc(-50% + ".concat(t.x/F,"em), calc(-50% + ").concat(t.y/F,"em)) "):s+="translate(".concat(t.x/F,"em, ").concat(t.y/F,"em) "),s+="scale(".concat(t.size/F*(t.flipX?-1:1),", ").concat(t.size/F*(t.flipY?-1:1),") "),s+="rotate(".concat(t.rotate,"deg) "),s}var Vn=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 6 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 6 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 6 Sharp Duotone";
}

svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
  overflow: visible;
  box-sizing: content-box;
}

.svg-inline--fa {
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285705em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left {
  margin-right: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-pull-right {
  margin-left: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  top: 0.25em;
}
.svg-inline--fa.fa-fw {
  width: var(--fa-fw-width, 1.25em);
}

.fa-layers svg.svg-inline--fa {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}
.fa-layers svg.svg-inline--fa {
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: 0.625em;
  line-height: 0.1em;
  vertical-align: 0.225em;
}

.fa-xs {
  font-size: 0.75em;
  line-height: 0.0833333337em;
  vertical-align: 0.125em;
}

.fa-sm {
  font-size: 0.875em;
  line-height: 0.0714285718em;
  vertical-align: 0.0535714295em;
}

.fa-lg {
  font-size: 1.25em;
  line-height: 0.05em;
  vertical-align: -0.075em;
}

.fa-xl {
  font-size: 1.5em;
  line-height: 0.0416666682em;
  vertical-align: -0.125em;
}

.fa-2xl {
  font-size: 2em;
  line-height: 0.03125em;
  vertical-align: -0.1875em;
}

.fa-fw {
  text-align: center;
  width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-left: var(--fa-li-margin, 2.5em);
  padding-left: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  left: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.08em);
  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);
}

.fa-pull-left {
  float: left;
  margin-right: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right {
  float: right;
  margin-left: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
.fa-bounce,
.fa-fade,
.fa-beat-fade,
.fa-flip,
.fa-pulse,
.fa-shake,
.fa-spin,
.fa-spin-pulse {
    animation-delay: -1ms;
    animation-duration: 1ms;
    animation-iteration-count: 1;
    transition-delay: 0s;
    transition-duration: 0s;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.fa-stack {
  display: inline-block;
  vertical-align: middle;
  height: 2em;
  position: relative;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.sr-only,
.fa-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:not(:focus),
.fa-sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.fad.fa-inverse,
.fa-duotone.fa-inverse {
  color: var(--fa-inverse, #fff);
}`;function Ut(){const e=Et,t=Tt,n=f.cssPrefix,a=f.replacementClass;let r=Vn;if(n!==e||a!==t){const s=new RegExp("\\.".concat(e,"\\-"),"g"),i=new RegExp("\\--".concat(e,"\\-"),"g"),o=new RegExp("\\.".concat(t),"g");r=r.replace(s,".".concat(n,"-")).replace(i,"--".concat(n,"-")).replace(o,".".concat(a))}return r}let at=!1;function ye(){f.autoAddCss&&!at&&(Wn(Ut()),at=!0)}var $n={mixout(){return{dom:{css:Ut,insertCss:ye}}},hooks(){return{beforeDOMElementCreation(){ye()},beforeI2svg(){ye()}}}};const I=j||{};I[T]||(I[T]={});I[T].styles||(I[T].styles={});I[T].hooks||(I[T].hooks={});I[T].shims||(I[T].shims=[]);var P=I[T];const Yt=[],Wt=function(){g.removeEventListener("DOMContentLoaded",Wt),le=1,Yt.map(e=>e())};let le=!1;_&&(le=(g.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(g.readyState),le||g.addEventListener("DOMContentLoaded",Wt));function qn(e){_&&(le?setTimeout(e,0):Yt.push(e))}function se(e){const{tag:t,attributes:n={},children:a=[]}=e;return typeof e=="string"?Dt(e):"<".concat(t," ").concat(Xn(n),">").concat(a.map(se).join(""),"</").concat(t,">")}function rt(e,t,n){if(e&&e[t]&&e[t][n])return{prefix:t,iconName:n,icon:e[t][n]}}var ve=function(t,n,a,r){var s=Object.keys(t),i=s.length,o=n,c,l,u;for(a===void 0?(c=1,u=t[s[0]]):(c=0,u=a);c<i;c++)l=s[c],u=o(u,t[l],l,t);return u};function Kn(e){const t=[];let n=0;const a=e.length;for(;n<a;){const r=e.charCodeAt(n++);if(r>=55296&&r<=56319&&n<a){const s=e.charCodeAt(n++);(s&64512)==56320?t.push(((r&1023)<<10)+(s&1023)+65536):(t.push(r),n--)}else t.push(r)}return t}function we(e){const t=Kn(e);return t.length===1?t[0].toString(16):null}function Jn(e,t){const n=e.length;let a=e.charCodeAt(t),r;return a>=55296&&a<=56319&&n>t+1&&(r=e.charCodeAt(t+1),r>=56320&&r<=57343)?(a-55296)*1024+r-56320+65536:a}function st(e){return Object.keys(e).reduce((t,n)=>{const a=e[n];return a.icon?t[a.iconName]=a.icon:t[n]=a,t},{})}function Oe(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const{skipHooks:a=!1}=n,r=st(t);typeof P.hooks.addPack=="function"&&!a?P.hooks.addPack(e,st(t)):P.styles[e]={...P.styles[e]||{},...r},e==="fas"&&Oe("fa",t)}const{styles:Y,shims:Qn}=P,Zn={[h]:Object.values(H[h]),[C]:Object.values(H[C]),[M]:Object.values(H[M])};let Ge=null,Ht={},Xt={},Gt={},Bt={},Vt={};const e1={[h]:Object.keys(W[h]),[C]:Object.keys(W[C]),[M]:Object.keys(W[M])};function t1(e){return~jn.indexOf(e)}function n1(e,t){const n=t.split("-"),a=n[0],r=n.slice(1).join("-");return a===e&&r!==""&&!t1(r)?r:null}const $t=()=>{const e=a=>ve(Y,(r,s,i)=>(r[i]=ve(s,a,{}),r),{});Ht=e((a,r,s)=>(r[3]&&(a[r[3]]=s),r[2]&&r[2].filter(o=>typeof o=="number").forEach(o=>{a[o.toString(16)]=s}),a)),Xt=e((a,r,s)=>(a[s]=s,r[2]&&r[2].filter(o=>typeof o=="string").forEach(o=>{a[o]=s}),a)),Vt=e((a,r,s)=>{const i=r[2];return a[s]=s,i.forEach(o=>{a[o]=s}),a});const t="far"in Y||f.autoFetchSvg,n=ve(Qn,(a,r)=>{const s=r[0];let i=r[1];const o=r[2];return i==="far"&&!t&&(i="fas"),typeof s=="string"&&(a.names[s]={prefix:i,iconName:o}),typeof s=="number"&&(a.unicodes[s.toString(16)]={prefix:i,iconName:o}),a},{names:{},unicodes:{}});Gt=n.names,Bt=n.unicodes,Ge=de(f.styleDefault,{family:f.familyDefault})};Yn(e=>{Ge=de(e.styleDefault,{family:f.familyDefault})});$t();function Be(e,t){return(Ht[e]||{})[t]}function a1(e,t){return(Xt[e]||{})[t]}function R(e,t){return(Vt[e]||{})[t]}function qt(e){return Gt[e]||{prefix:null,iconName:null}}function r1(e){const t=Bt[e],n=Be("fas",e);return t||(n?{prefix:"fas",iconName:n}:null)||{prefix:null,iconName:null}}function D(){return Ge}const Ve=()=>({prefix:null,iconName:null,rest:[]});function de(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{family:n=h}=t,a=W[n][e],r=ne[n][e]||ne[n][a],s=e in P.styles?e:null;return r||s||null}const s1={[h]:Object.keys(H[h]),[C]:Object.keys(H[C]),[M]:Object.keys(H[M])};function pe(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{skipLookups:n=!1}=t,a={[h]:"".concat(f.cssPrefix,"-").concat(h),[C]:"".concat(f.cssPrefix,"-").concat(C),[M]:"".concat(f.cssPrefix,"-").concat(M)};let r=null,s=h;const i=dn.filter(c=>c!==Ot);i.forEach(c=>{(e.includes(a[c])||e.some(l=>s1[c].includes(l)))&&(s=c)});const o=e.reduce((c,l)=>{const u=n1(f.cssPrefix,l);if(Y[l]?(l=Zn[s].includes(l)?Tn[s][l]:l,r=l,c.prefix=l):e1[s].indexOf(l)>-1?(r=l,c.prefix=de(l,{family:s})):u?c.iconName=u:l!==f.replacementClass&&!i.some(p=>l===a[p])&&c.rest.push(l),!n&&c.prefix&&c.iconName){const p=r==="fa"?qt(c.iconName):{},d=R(c.prefix,c.iconName);p.prefix&&(r=null),c.iconName=p.iconName||d||c.iconName,c.prefix=p.prefix||c.prefix,c.prefix==="far"&&!Y.far&&Y.fas&&!f.autoFetchSvg&&(c.prefix="fas")}return c},Ve());return(e.includes("fa-brands")||e.includes("fab"))&&(o.prefix="fab"),(e.includes("fa-duotone")||e.includes("fad"))&&(o.prefix="fad"),!o.prefix&&s===C&&(Y.fass||f.autoFetchSvg)&&(o.prefix="fass",o.iconName=R(o.prefix,o.iconName)||o.iconName),!o.prefix&&s===M&&(Y.fasds||f.autoFetchSvg)&&(o.prefix="fasds",o.iconName=R(o.prefix,o.iconName)||o.iconName),(o.prefix==="fa"||r==="fa")&&(o.prefix=D()||"fas"),o}class i1{constructor(){this.definitions={}}add(){for(var t=arguments.length,n=new Array(t),a=0;a<t;a++)n[a]=arguments[a];const r=n.reduce(this._pullDefinitions,{});Object.keys(r).forEach(s=>{this.definitions[s]={...this.definitions[s]||{},...r[s]},Oe(s,r[s]);const i=H[h][s];i&&Oe(i,r[s]),$t()})}reset(){this.definitions={}}_pullDefinitions(t,n){const a=n.prefix&&n.iconName&&n.icon?{0:n}:n;return Object.keys(a).map(r=>{const{prefix:s,iconName:i,icon:o}=a[r],c=o[2];t[s]||(t[s]={}),c.length>0&&c.forEach(l=>{typeof l=="string"&&(t[s][l]=o)}),t[s][i]=o}),t}}let it=[],B={};const $={},o1=Object.keys($);function c1(e,t){let{mixoutsTo:n}=t;return it=e,B={},Object.keys($).forEach(a=>{o1.indexOf(a)===-1&&delete $[a]}),it.forEach(a=>{const r=a.mixout?a.mixout():{};if(Object.keys(r).forEach(s=>{typeof r[s]=="function"&&(n[s]=r[s]),typeof r[s]=="object"&&Object.keys(r[s]).forEach(i=>{n[s]||(n[s]={}),n[s][i]=r[s][i]})}),a.hooks){const s=a.hooks();Object.keys(s).forEach(i=>{B[i]||(B[i]=[]),B[i].push(s[i])})}a.provides&&a.provides($)}),n}function Pe(e,t){for(var n=arguments.length,a=new Array(n>2?n-2:0),r=2;r<n;r++)a[r-2]=arguments[r];return(B[e]||[]).forEach(i=>{t=i.apply(null,[t,...a])}),t}function G(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),a=1;a<t;a++)n[a-1]=arguments[a];(B[e]||[]).forEach(s=>{s.apply(null,n)})}function U(){const e=arguments[0],t=Array.prototype.slice.call(arguments,1);return $[e]?$[e].apply(null,t):void 0}function Se(e){e.prefix==="fa"&&(e.prefix="fas");let{iconName:t}=e;const n=e.prefix||D();if(t)return t=R(n,t)||t,rt(Kt.definitions,n,t)||rt(P.styles,n,t)}const Kt=new i1,l1=()=>{f.autoReplaceSvg=!1,f.observeMutations=!1,G("noAuto")},f1={i2svg:function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return _?(G("beforeI2svg",e),U("pseudoElements2svg",e),U("i2svg",e)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:t}=e;f.autoReplaceSvg===!1&&(f.autoReplaceSvg=!0),f.observeMutations=!0,qn(()=>{m1({autoReplaceSvgRoot:t}),G("watch",e)})}},u1={icon:e=>{if(e===null)return null;if(typeof e=="object"&&e.prefix&&e.iconName)return{prefix:e.prefix,iconName:R(e.prefix,e.iconName)||e.iconName};if(Array.isArray(e)&&e.length===2){const t=e[1].indexOf("fa-")===0?e[1].slice(3):e[1],n=de(e[0]);return{prefix:n,iconName:R(n,t)||t}}if(typeof e=="string"&&(e.indexOf("".concat(f.cssPrefix,"-"))>-1||e.match(In))){const t=pe(e.split(" "),{skipLookups:!0});return{prefix:t.prefix||D(),iconName:R(t.prefix,t.iconName)||t.iconName}}if(typeof e=="string"){const t=D();return{prefix:t,iconName:R(t,e)||e}}}},A={noAuto:l1,config:f,dom:f1,parse:u1,library:Kt,findIconDefinition:Se,toHtml:se},m1=function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};const{autoReplaceSvgRoot:t=g}=e;(Object.keys(P.styles).length>0||f.autoFetchSvg)&&_&&f.autoReplaceSvg&&A.dom.i2svg({node:t})};function ge(e,t){return Object.defineProperty(e,"abstract",{get:t}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(n=>se(n))}}),Object.defineProperty(e,"node",{get:function(){if(!_)return;const n=g.createElement("div");return n.innerHTML=e.html,n.children}}),e}function d1(e){let{children:t,main:n,mask:a,attributes:r,styles:s,transform:i}=e;if(Xe(i)&&n.found&&!a.found){const{width:o,height:c}=n,l={x:o/c/2,y:.5};r.style=me({...s,"transform-origin":"".concat(l.x+i.x/16,"em ").concat(l.y+i.y/16,"em")})}return[{tag:"svg",attributes:r,children:t}]}function p1(e){let{prefix:t,iconName:n,children:a,attributes:r,symbol:s}=e;const i=s===!0?"".concat(t,"-").concat(f.cssPrefix,"-").concat(n):s;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:{...r,id:i},children:a}]}]}function $e(e){const{icons:{main:t,mask:n},prefix:a,iconName:r,transform:s,symbol:i,title:o,maskId:c,titleId:l,extra:u,watchable:p=!1}=e,{width:d,height:y}=n.found?n:t,z=a==="fak",k=[f.replacementClass,r?"".concat(f.cssPrefix,"-").concat(r):""].filter(N=>u.classes.indexOf(N)===-1).filter(N=>N!==""||!!N).concat(u.classes).join(" ");let b={children:[],attributes:{...u.attributes,"data-prefix":a,"data-icon":r,class:k,role:u.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(d," ").concat(y)}};const x=z&&!~u.classes.indexOf("fa-fw")?{width:"".concat(d/y*16*.0625,"em")}:{};p&&(b.attributes[X]=""),o&&(b.children.push({tag:"title",attributes:{id:b.attributes["aria-labelledby"]||"title-".concat(l||ae())},children:[o]}),delete b.attributes.title);const v={...b,prefix:a,iconName:r,main:t,mask:n,maskId:c,transform:s,symbol:i,styles:{...x,...u.styles}},{children:L,attributes:E}=n.found&&t.found?U("generateAbstractMask",v)||{children:[],attributes:{}}:U("generateAbstractIcon",v)||{children:[],attributes:{}};return v.children=L,v.attributes=E,i?p1(v):d1(v)}function ot(e){const{content:t,width:n,height:a,transform:r,title:s,extra:i,watchable:o=!1}=e,c={...i.attributes,...s?{title:s}:{},class:i.classes.join(" ")};o&&(c[X]="");const l={...i.styles};Xe(r)&&(l.transform=Bn({transform:r,startCentered:!0,width:n,height:a}),l["-webkit-transform"]=l.transform);const u=me(l);u.length>0&&(c.style=u);const p=[];return p.push({tag:"span",attributes:c,children:[t]}),s&&p.push({tag:"span",attributes:{class:"sr-only"},children:[s]}),p}function g1(e){const{content:t,title:n,extra:a}=e,r={...a.attributes,...n?{title:n}:{},class:a.classes.join(" ")},s=me(a.styles);s.length>0&&(r.style=s);const i=[];return i.push({tag:"span",attributes:r,children:[t]}),n&&i.push({tag:"span",attributes:{class:"sr-only"},children:[n]}),i}const{styles:xe}=P;function Ee(e){const t=e[0],n=e[1],[a]=e.slice(4);let r=null;return Array.isArray(a)?r={tag:"g",attributes:{class:"".concat(f.cssPrefix,"-").concat(be.GROUP)},children:[{tag:"path",attributes:{class:"".concat(f.cssPrefix,"-").concat(be.SECONDARY),fill:"currentColor",d:a[0]}},{tag:"path",attributes:{class:"".concat(f.cssPrefix,"-").concat(be.PRIMARY),fill:"currentColor",d:a[1]}}]}:r={tag:"path",attributes:{fill:"currentColor",d:a}},{found:!0,width:t,height:n,icon:r}}const h1={found:!1,width:512,height:512};function b1(e,t){!It&&!f.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(t,'" is missing.'))}function Te(e,t){let n=t;return t==="fa"&&f.styleDefault!==null&&(t=D()),new Promise((a,r)=>{if(n==="fa"){const s=qt(e)||{};e=s.iconName||e,t=s.prefix||t}if(e&&t&&xe[t]&&xe[t][e]){const s=xe[t][e];return a(Ee(s))}b1(e,t),a({...h1,icon:f.showMissingIcons&&e?U("missingIconAbstract")||{}:{}})})}const ct=()=>{},Ie=f.measurePerformance&&ie&&ie.mark&&ie.measure?ie:{mark:ct,measure:ct},Z='FA "6.6.0"',y1=e=>(Ie.mark("".concat(Z," ").concat(e," begins")),()=>Jt(e)),Jt=e=>{Ie.mark("".concat(Z," ").concat(e," ends")),Ie.measure("".concat(Z," ").concat(e),"".concat(Z," ").concat(e," begins"),"".concat(Z," ").concat(e," ends"))};var qe={begin:y1,end:Jt};const oe=()=>{};function lt(e){return typeof(e.getAttribute?e.getAttribute(X):null)=="string"}function v1(e){const t=e.getAttribute?e.getAttribute(Ye):null,n=e.getAttribute?e.getAttribute(We):null;return t&&n}function x1(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(f.replacementClass)}function L1(){return f.autoReplaceSvg===!0?ce.replace:ce[f.autoReplaceSvg]||ce.replace}function z1(e){return g.createElementNS("http://www.w3.org/2000/svg",e)}function C1(e){return g.createElement(e)}function Qt(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{ceFn:n=e.tag==="svg"?z1:C1}=t;if(typeof e=="string")return g.createTextNode(e);const a=n(e.tag);return Object.keys(e.attributes||[]).forEach(function(s){a.setAttribute(s,e.attributes[s])}),(e.children||[]).forEach(function(s){a.appendChild(Qt(s,{ceFn:n}))}),a}function M1(e){let t=" ".concat(e.outerHTML," ");return t="".concat(t,"Font Awesome fontawesome.com "),t}const ce={replace:function(e){const t=e[0];if(t.parentNode)if(e[1].forEach(n=>{t.parentNode.insertBefore(Qt(n),t)}),t.getAttribute(X)===null&&f.keepOriginalSource){let n=g.createComment(M1(t));t.parentNode.replaceChild(n,t)}else t.remove()},nest:function(e){const t=e[0],n=e[1];if(~He(t).indexOf(f.replacementClass))return ce.replace(e);const a=new RegExp("".concat(f.cssPrefix,"-.*"));if(delete n[0].attributes.id,n[0].attributes.class){const s=n[0].attributes.class.split(" ").reduce((i,o)=>(o===f.replacementClass||o.match(a)?i.toSvg.push(o):i.toNode.push(o),i),{toNode:[],toSvg:[]});n[0].attributes.class=s.toSvg.join(" "),s.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",s.toNode.join(" "))}const r=n.map(s=>se(s)).join(`
`);t.setAttribute(X,""),t.innerHTML=r}};function ft(e){e()}function Zt(e,t){const n=typeof t=="function"?t:oe;if(e.length===0)n();else{let a=ft;f.mutateApproach===Sn&&(a=j.requestAnimationFrame||ft),a(()=>{const r=L1(),s=qe.begin("mutate");e.map(r),s(),n()})}}let Ke=!1;function en(){Ke=!0}function _e(){Ke=!1}let fe=null;function ut(e){if(!Ze||!f.observeMutations)return;const{treeCallback:t=oe,nodeCallback:n=oe,pseudoElementsCallback:a=oe,observeMutationsRoot:r=g}=e;fe=new Ze(s=>{if(Ke)return;const i=D();J(s).forEach(o=>{if(o.type==="childList"&&o.addedNodes.length>0&&!lt(o.addedNodes[0])&&(f.searchPseudoElements&&a(o.target),t(o.target)),o.type==="attributes"&&o.target.parentNode&&f.searchPseudoElements&&a(o.target.parentNode),o.type==="attributes"&&lt(o.target)&&~Rn.indexOf(o.attributeName))if(o.attributeName==="class"&&v1(o.target)){const{prefix:c,iconName:l}=pe(He(o.target));o.target.setAttribute(Ye,c||i),l&&o.target.setAttribute(We,l)}else x1(o.target)&&n(o.target)})}),_&&fe.observe(r,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}function A1(){fe&&fe.disconnect()}function k1(e){const t=e.getAttribute("style");let n=[];return t&&(n=t.split(";").reduce((a,r)=>{const s=r.split(":"),i=s[0],o=s.slice(1);return i&&o.length>0&&(a[i]=o.join(":").trim()),a},{})),n}function N1(e){const t=e.getAttribute("data-prefix"),n=e.getAttribute("data-icon"),a=e.innerText!==void 0?e.innerText.trim():"";let r=pe(He(e));return r.prefix||(r.prefix=D()),t&&n&&(r.prefix=t,r.iconName=n),r.iconName&&r.prefix||(r.prefix&&a.length>0&&(r.iconName=a1(r.prefix,e.innerText)||Be(r.prefix,we(e.innerText))),!r.iconName&&f.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(r.iconName=e.firstChild.data)),r}function w1(e){const t=J(e.attributes).reduce((r,s)=>(r.name!=="class"&&r.name!=="style"&&(r[s.name]=s.value),r),{}),n=e.getAttribute("title"),a=e.getAttribute("data-fa-title-id");return f.autoA11y&&(n?t["aria-labelledby"]="".concat(f.replacementClass,"-title-").concat(a||ae()):(t["aria-hidden"]="true",t.focusable="false")),t}function O1(){return{iconName:null,title:null,titleId:null,prefix:null,transform:O,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function mt(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0};const{iconName:n,prefix:a,rest:r}=N1(e),s=w1(e),i=Pe("parseNodeAttributes",{},e);let o=t.styleParser?k1(e):[];return{iconName:n,title:e.getAttribute("title"),titleId:e.getAttribute("data-fa-title-id"),prefix:a,transform:O,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:r,styles:o,attributes:s},...i}}const{styles:P1}=P;function tn(e){const t=f.autoReplaceSvg==="nest"?mt(e,{styleParser:!1}):mt(e);return~t.extra.classes.indexOf(Rt)?U("generateLayersText",e,t):U("generateSvgReplacementMutation",e,t)}let S=new Set;_t.map(e=>{S.add("fa-".concat(e))});Object.keys(W[h]).map(S.add.bind(S));Object.keys(W[C]).map(S.add.bind(S));Object.keys(W[M]).map(S.add.bind(S));S=[...S];function dt(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!_)return Promise.resolve();const n=g.documentElement.classList,a=u=>n.add("".concat(nt,"-").concat(u)),r=u=>n.remove("".concat(nt,"-").concat(u)),s=f.autoFetchSvg?S:_t.map(u=>"fa-".concat(u)).concat(Object.keys(P1));s.includes("fa")||s.push("fa");const i=[".".concat(Rt,":not([").concat(X,"])")].concat(s.map(u=>".".concat(u,":not([").concat(X,"])"))).join(", ");if(i.length===0)return Promise.resolve();let o=[];try{o=J(e.querySelectorAll(i))}catch{}if(o.length>0)a("pending"),r("complete");else return Promise.resolve();const c=qe.begin("onTree"),l=o.reduce((u,p)=>{try{const d=tn(p);d&&u.push(d)}catch(d){It||d.name==="MissingIcon"&&console.error(d)}return u},[]);return new Promise((u,p)=>{Promise.all(l).then(d=>{Zt(d,()=>{a("active"),a("complete"),r("pending"),typeof t=="function"&&t(),c(),u()})}).catch(d=>{c(),p(d)})})}function S1(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;tn(e).then(n=>{n&&Zt([n],t)})}function E1(e){return function(t){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const a=(t||{}).icon?t:Se(t||{});let{mask:r}=n;return r&&(r=(r||{}).icon?r:Se(r||{})),e(a,{...n,mask:r})}}const T1=function(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=O,symbol:a=!1,mask:r=null,maskId:s=null,title:i=null,titleId:o=null,classes:c=[],attributes:l={},styles:u={}}=t;if(!e)return;const{prefix:p,iconName:d,icon:y}=e;return ge({type:"icon",...e},()=>(G("beforeDOMElementCreation",{iconDefinition:e,params:t}),f.autoA11y&&(i?l["aria-labelledby"]="".concat(f.replacementClass,"-title-").concat(o||ae()):(l["aria-hidden"]="true",l.focusable="false")),$e({icons:{main:Ee(y),mask:r?Ee(r.icon):{found:!1,width:null,height:null,icon:{}}},prefix:p,iconName:d,transform:{...O,...n},symbol:a,title:i,maskId:s,titleId:o,extra:{attributes:l,styles:u,classes:c}})))};var I1={mixout(){return{icon:E1(T1)}},hooks(){return{mutationObserverCallbacks(e){return e.treeCallback=dt,e.nodeCallback=S1,e}}},provides(e){e.i2svg=function(t){const{node:n=g,callback:a=()=>{}}=t;return dt(n,a)},e.generateSvgReplacementMutation=function(t,n){const{iconName:a,title:r,titleId:s,prefix:i,transform:o,symbol:c,mask:l,maskId:u,extra:p}=n;return new Promise((d,y)=>{Promise.all([Te(a,i),l.iconName?Te(l.iconName,l.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(z=>{let[k,b]=z;d([t,$e({icons:{main:k,mask:b},prefix:i,iconName:a,transform:o,symbol:c,maskId:u,title:r,titleId:s,extra:p,watchable:!0})])}).catch(y)})},e.generateAbstractIcon=function(t){let{children:n,attributes:a,main:r,transform:s,styles:i}=t;const o=me(i);o.length>0&&(a.style=o);let c;return Xe(s)&&(c=U("generateAbstractTransformGrouping",{main:r,transform:s,containerWidth:r.width,iconWidth:r.width})),n.push(c||r.icon),{children:n,attributes:a}}}},_1={mixout(){return{layer(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{classes:n=[]}=t;return ge({type:"layer"},()=>{G("beforeDOMElementCreation",{assembler:e,params:t});let a=[];return e(r=>{Array.isArray(r)?r.map(s=>{a=a.concat(s.abstract)}):a=a.concat(r.abstract)}),[{tag:"span",attributes:{class:["".concat(f.cssPrefix,"-layers"),...n].join(" ")},children:a}]})}}}},F1={mixout(){return{counter(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{title:n=null,classes:a=[],attributes:r={},styles:s={}}=t;return ge({type:"counter",content:e},()=>(G("beforeDOMElementCreation",{content:e,params:t}),g1({content:e.toString(),title:n,extra:{attributes:r,styles:s,classes:["".concat(f.cssPrefix,"-layers-counter"),...a]}})))}}}},R1={mixout(){return{text(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{transform:n=O,title:a=null,classes:r=[],attributes:s={},styles:i={}}=t;return ge({type:"text",content:e},()=>(G("beforeDOMElementCreation",{content:e,params:t}),ot({content:e,transform:{...O,...n},title:a,extra:{attributes:s,styles:i,classes:["".concat(f.cssPrefix,"-layers-text"),...r]}})))}}},provides(e){e.generateLayersText=function(t,n){const{title:a,transform:r,extra:s}=n;let i=null,o=null;if(wt){const c=parseInt(getComputedStyle(t).fontSize,10),l=t.getBoundingClientRect();i=l.width/c,o=l.height/c}return f.autoA11y&&!a&&(s.attributes["aria-hidden"]="true"),Promise.resolve([t,ot({content:t.innerHTML,width:i,height:o,transform:r,title:a,extra:s,watchable:!0})])}}};const j1=new RegExp('"',"ug"),pt=[1105920,1112319],gt={FontAwesome:{normal:"fas",400:"fas"},...vn,...yn,...Nn},Fe=Object.keys(gt).reduce((e,t)=>(e[t.toLowerCase()]=gt[t],e),{}),D1=Object.keys(Fe).reduce((e,t)=>{const n=Fe[t];return e[t]=n[900]||[...Object.entries(n)][0][1],e},{});function U1(e){const t=e.replace(j1,""),n=Jn(t,0),a=n>=pt[0]&&n<=pt[1],r=t.length===2?t[0]===t[1]:!1;return{value:we(r?t[0]:t),isSecondary:a||r}}function Y1(e,t){const n=e.replace(/^['"]|['"]$/g,"").toLowerCase(),a=parseInt(t),r=isNaN(a)?"normal":a;return(Fe[n]||{})[r]||D1[n]}function ht(e,t){const n="".concat(Pn).concat(t.replace(":","-"));return new Promise((a,r)=>{if(e.getAttribute(n)!==null)return a();const i=J(e.children).filter(d=>d.getAttribute(Me)===t)[0],o=j.getComputedStyle(e,t),c=o.getPropertyValue("font-family"),l=c.match(_n),u=o.getPropertyValue("font-weight"),p=o.getPropertyValue("content");if(i&&!l)return e.removeChild(i),a();if(l&&p!=="none"&&p!==""){const d=o.getPropertyValue("content");let y=Y1(c,u);const{value:z,isSecondary:k}=U1(d),b=l[0].startsWith("FontAwesome");let x=Be(y,z),v=x;if(b){const L=r1(z);L.iconName&&L.prefix&&(x=L.iconName,y=L.prefix)}if(x&&!k&&(!i||i.getAttribute(Ye)!==y||i.getAttribute(We)!==v)){e.setAttribute(n,v),i&&e.removeChild(i);const L=O1(),{extra:E}=L;E.attributes[Me]=t,Te(x,y).then(N=>{const fn=$e({...L,icons:{main:N,mask:Ve()},prefix:y,iconName:v,extra:E,watchable:!0}),he=g.createElementNS("http://www.w3.org/2000/svg","svg");t==="::before"?e.insertBefore(he,e.firstChild):e.appendChild(he),he.outerHTML=fn.map(un=>se(un)).join(`
`),e.removeAttribute(n),a()}).catch(r)}else a()}else a()})}function W1(e){return Promise.all([ht(e,"::before"),ht(e,"::after")])}function H1(e){return e.parentNode!==document.head&&!~En.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(Me)&&(!e.parentNode||e.parentNode.tagName!=="svg")}function bt(e){if(_)return new Promise((t,n)=>{const a=J(e.querySelectorAll("*")).filter(H1).map(W1),r=qe.begin("searchPseudoElements");en(),Promise.all(a).then(()=>{r(),_e(),t()}).catch(()=>{r(),_e(),n()})})}var X1={hooks(){return{mutationObserverCallbacks(e){return e.pseudoElementsCallback=bt,e}}},provides(e){e.pseudoElements2svg=function(t){const{node:n=g}=t;f.searchPseudoElements&&bt(n)}}};let yt=!1;var G1={mixout(){return{dom:{unwatch(){en(),yt=!0}}}},hooks(){return{bootstrap(){ut(Pe("mutationObserverCallbacks",{}))},noAuto(){A1()},watch(e){const{observeMutationsRoot:t}=e;yt?_e():ut(Pe("mutationObserverCallbacks",{observeMutationsRoot:t}))}}}};const vt=e=>{let t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return e.toLowerCase().split(" ").reduce((n,a)=>{const r=a.toLowerCase().split("-"),s=r[0];let i=r.slice(1).join("-");if(s&&i==="h")return n.flipX=!0,n;if(s&&i==="v")return n.flipY=!0,n;if(i=parseFloat(i),isNaN(i))return n;switch(s){case"grow":n.size=n.size+i;break;case"shrink":n.size=n.size-i;break;case"left":n.x=n.x-i;break;case"right":n.x=n.x+i;break;case"up":n.y=n.y-i;break;case"down":n.y=n.y+i;break;case"rotate":n.rotate=n.rotate+i;break}return n},t)};var B1={mixout(){return{parse:{transform:e=>vt(e)}}},hooks(){return{parseNodeAttributes(e,t){const n=t.getAttribute("data-fa-transform");return n&&(e.transform=vt(n)),e}}},provides(e){e.generateAbstractTransformGrouping=function(t){let{main:n,transform:a,containerWidth:r,iconWidth:s}=t;const i={transform:"translate(".concat(r/2," 256)")},o="translate(".concat(a.x*32,", ").concat(a.y*32,") "),c="scale(".concat(a.size/16*(a.flipX?-1:1),", ").concat(a.size/16*(a.flipY?-1:1),") "),l="rotate(".concat(a.rotate," 0 0)"),u={transform:"".concat(o," ").concat(c," ").concat(l)},p={transform:"translate(".concat(s/2*-1," -256)")},d={outer:i,inner:u,path:p};return{tag:"g",attributes:{...d.outer},children:[{tag:"g",attributes:{...d.inner},children:[{tag:n.icon.tag,children:n.icon.children,attributes:{...n.icon.attributes,...d.path}}]}]}}}};const Le={x:0,y:0,width:"100%",height:"100%"};function xt(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||t)&&(e.attributes.fill="black"),e}function V1(e){return e.tag==="g"?e.children:[e]}var $1={hooks(){return{parseNodeAttributes(e,t){const n=t.getAttribute("data-fa-mask"),a=n?pe(n.split(" ").map(r=>r.trim())):Ve();return a.prefix||(a.prefix=D()),e.mask=a,e.maskId=t.getAttribute("data-fa-mask-id"),e}}},provides(e){e.generateAbstractMask=function(t){let{children:n,attributes:a,main:r,mask:s,maskId:i,transform:o}=t;const{width:c,icon:l}=r,{width:u,icon:p}=s,d=Gn({transform:o,containerWidth:u,iconWidth:c}),y={tag:"rect",attributes:{...Le,fill:"white"}},z=l.children?{children:l.children.map(xt)}:{},k={tag:"g",attributes:{...d.inner},children:[xt({tag:l.tag,attributes:{...l.attributes,...d.path},...z})]},b={tag:"g",attributes:{...d.outer},children:[k]},x="mask-".concat(i||ae()),v="clip-".concat(i||ae()),L={tag:"mask",attributes:{...Le,id:x,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"},children:[y,b]},E={tag:"defs",children:[{tag:"clipPath",attributes:{id:v},children:V1(p)},L]};return n.push(E,{tag:"rect",attributes:{fill:"currentColor","clip-path":"url(#".concat(v,")"),mask:"url(#".concat(x,")"),...Le}}),{children:n,attributes:a}}}},q1={provides(e){let t=!1;j.matchMedia&&(t=j.matchMedia("(prefers-reduced-motion: reduce)").matches),e.missingIconAbstract=function(){const n=[],a={fill:"currentColor"},r={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};n.push({tag:"path",attributes:{...a,d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"}});const s={...r,attributeName:"opacity"},i={tag:"circle",attributes:{...a,cx:"256",cy:"364",r:"28"},children:[]};return t||i.children.push({tag:"animate",attributes:{...r,attributeName:"r",values:"28;14;28;28;14;28;"}},{tag:"animate",attributes:{...s,values:"1;0;1;1;0;1;"}}),n.push(i),n.push({tag:"path",attributes:{...a,opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"},children:t?[]:[{tag:"animate",attributes:{...s,values:"1;0;0;0;0;1;"}}]}),t||n.push({tag:"path",attributes:{...a,opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"},children:[{tag:"animate",attributes:{...s,values:"0;0;1;1;0;0;"}}]}),{tag:"g",attributes:{class:"missing"},children:n}}}},K1={hooks(){return{parseNodeAttributes(e,t){const n=t.getAttribute("data-fa-symbol"),a=n===null?!1:n===""?!0:n;return e.symbol=a,e}}}},J1=[$n,I1,_1,F1,R1,X1,G1,B1,$1,q1,K1];c1(J1,{mixoutsTo:A});A.noAuto;A.config;A.library;A.dom;const Re=A.parse;A.findIconDefinition;A.toHtml;const Q1=A.icon;A.layer;A.text;A.counter;var nn={exports:{}},Z1="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",ea=Z1,ta=ea;function an(){}function rn(){}rn.resetWarningCache=an;var na=function(){function e(a,r,s,i,o,c){if(c!==ta){var l=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw l.name="Invariant Violation",l}}e.isRequired=e;function t(){return e}var n={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:rn,resetWarningCache:an};return n.PropTypes=n,n};nn.exports=na();var aa=nn.exports;const m=mn(aa);function Lt(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),n.push.apply(n,a)}return n}function w(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?Lt(Object(n),!0).forEach(function(a){V(e,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Lt(Object(n)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(n,a))})}return e}function ue(e){"@babel/helpers - typeof";return ue=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},ue(e)}function V(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function ra(e,t){if(e==null)return{};var n={},a=Object.keys(e),r,s;for(s=0;s<a.length;s++)r=a[s],!(t.indexOf(r)>=0)&&(n[r]=e[r]);return n}function sa(e,t){if(e==null)return{};var n=ra(e,t),a,r;if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)a=s[r],!(t.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}function je(e){return ia(e)||oa(e)||ca(e)||la()}function ia(e){if(Array.isArray(e))return De(e)}function oa(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function ca(e,t){if(e){if(typeof e=="string")return De(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if(n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set")return Array.from(e);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return De(e,t)}}function De(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,a=new Array(t);n<t;n++)a[n]=e[n];return a}function la(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function fa(e){var t,n=e.beat,a=e.fade,r=e.beatFade,s=e.bounce,i=e.shake,o=e.flash,c=e.spin,l=e.spinPulse,u=e.spinReverse,p=e.pulse,d=e.fixedWidth,y=e.inverse,z=e.border,k=e.listItem,b=e.flip,x=e.size,v=e.rotation,L=e.pull,E=(t={"fa-beat":n,"fa-fade":a,"fa-beat-fade":r,"fa-bounce":s,"fa-shake":i,"fa-flash":o,"fa-spin":c,"fa-spin-reverse":u,"fa-spin-pulse":l,"fa-pulse":p,"fa-fw":d,"fa-inverse":y,"fa-border":z,"fa-li":k,"fa-flip":b===!0,"fa-flip-horizontal":b==="horizontal"||b==="both","fa-flip-vertical":b==="vertical"||b==="both"},V(t,"fa-".concat(x),typeof x<"u"&&x!==null),V(t,"fa-rotate-".concat(v),typeof v<"u"&&v!==null&&v!==0),V(t,"fa-pull-".concat(L),typeof L<"u"&&L!==null),V(t,"fa-swap-opacity",e.swapOpacity),t);return Object.keys(E).map(function(N){return E[N]?N:null}).filter(function(N){return N})}function ua(e){return e=e-0,e===e}function sn(e){return ua(e)?e:(e=e.replace(/[\-_\s]+(.)?/g,function(t,n){return n?n.toUpperCase():""}),e.substr(0,1).toLowerCase()+e.substr(1))}var ma=["style"];function da(e){return e.charAt(0).toUpperCase()+e.slice(1)}function pa(e){return e.split(";").map(function(t){return t.trim()}).filter(function(t){return t}).reduce(function(t,n){var a=n.indexOf(":"),r=sn(n.slice(0,a)),s=n.slice(a+1).trim();return r.startsWith("webkit")?t[da(r)]=s:t[r]=s,t},{})}function on(e,t){var n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof t=="string")return t;var a=(t.children||[]).map(function(c){return on(e,c)}),r=Object.keys(t.attributes||{}).reduce(function(c,l){var u=t.attributes[l];switch(l){case"class":c.attrs.className=u,delete t.attributes.class;break;case"style":c.attrs.style=pa(u);break;default:l.indexOf("aria-")===0||l.indexOf("data-")===0?c.attrs[l.toLowerCase()]=u:c.attrs[sn(l)]=u}return c},{attrs:{}}),s=n.style,i=s===void 0?{}:s,o=sa(n,ma);return r.attrs.style=w(w({},r.attrs.style),i),e.apply(void 0,[t.tag,w(w({},r.attrs),o)].concat(je(a)))}var cn=!1;try{cn=!0}catch{}function ga(){if(!cn&&console&&typeof console.error=="function"){var e;(e=console).error.apply(e,arguments)}}function zt(e){if(e&&ue(e)==="object"&&e.prefix&&e.iconName&&e.icon)return e;if(Re.icon)return Re.icon(e);if(e===null)return null;if(e&&ue(e)==="object"&&e.prefix&&e.iconName)return e;if(Array.isArray(e)&&e.length===2)return{prefix:e[0],iconName:e[1]};if(typeof e=="string")return{prefix:"fas",iconName:e}}function ze(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?V({},e,t):{}}var Ct={border:!1,className:"",mask:null,maskId:null,fixedWidth:!1,inverse:!1,flip:!1,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:null,transform:null,swapOpacity:!1},ln=Mt.forwardRef(function(e,t){var n=w(w({},Ct),e),a=n.icon,r=n.mask,s=n.symbol,i=n.className,o=n.title,c=n.titleId,l=n.maskId,u=zt(a),p=ze("classes",[].concat(je(fa(n)),je((i||"").split(" ")))),d=ze("transform",typeof n.transform=="string"?Re.transform(n.transform):n.transform),y=ze("mask",zt(r)),z=Q1(u,w(w(w(w({},p),d),y),{},{symbol:s,title:o,titleId:c,maskId:l}));if(!z)return ga("Could not find icon",u),null;var k=z.abstract,b={ref:t};return Object.keys(n).forEach(function(x){Ct.hasOwnProperty(x)||(b[x]=n[x])}),ha(k[0],b)});ln.displayName="FontAwesomeIcon";ln.propTypes={beat:m.bool,border:m.bool,beatFade:m.bool,bounce:m.bool,className:m.string,fade:m.bool,flash:m.bool,mask:m.oneOfType([m.object,m.array,m.string]),maskId:m.string,fixedWidth:m.bool,inverse:m.bool,flip:m.oneOf([!0,!1,"horizontal","vertical","both"]),icon:m.oneOfType([m.object,m.array,m.string]),listItem:m.bool,pull:m.oneOf(["right","left"]),pulse:m.bool,rotation:m.oneOf([0,90,180,270]),shake:m.bool,size:m.oneOf(["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:m.bool,spinPulse:m.bool,spinReverse:m.bool,symbol:m.oneOfType([m.bool,m.string]),title:m.string,titleId:m.string,transform:m.oneOfType([m.string,m.object]),swapOpacity:m.bool};var ha=on.bind(null,Mt.createElement);const Na={prefix:"fas",iconName:"user-xmark",icon:[640,512,["user-times"],"f235","M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM471 143c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"]},ba={prefix:"fas",iconName:"right-from-bracket",icon:[512,512,["sign-out-alt"],"f2f5","M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"]},wa=ba,Oa={prefix:"fas",iconName:"users-rectangle",icon:[640,512,[],"e594","M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l448 0c53 0 96-43 96-96l0-320c0-53-43-96-96-96L96 0zM64 96c0-17.7 14.3-32 32-32l448 0c17.7 0 32 14.3 32 32l0 320c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32L64 96zm159.8 80a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM96 309.3c0 14.7 11.9 26.7 26.7 26.7l56.1 0c8-34.1 32.8-61.7 65.2-73.6c-7.5-4.1-16.2-6.4-25.3-6.4l-69.3 0C119.9 256 96 279.9 96 309.3zM461.2 336l56.1 0c14.7 0 26.7-11.9 26.7-26.7c0-29.5-23.9-53.3-53.3-53.3l-69.3 0c-9.2 0-17.8 2.3-25.3 6.4c32.4 11.9 57.2 39.5 65.2 73.6zM372 289c-3.9-.7-7.9-1-12-1l-80 0c-4.1 0-8.1 .3-12 1c-26 4.4-47.3 22.7-55.9 47c-2.7 7.5-4.1 15.6-4.1 24c0 13.3 10.7 24 24 24l176 0c13.3 0 24-10.7 24-24c0-8.4-1.4-16.5-4.1-24c-8.6-24.3-29.9-42.6-55.9-47zM512 176a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM320 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"]},Pa={prefix:"fas",iconName:"backward",icon:[512,512,[9194],"f04a","M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3l0 41.7 0 41.7L459.5 440.6zM256 352l0-96 0-128 0-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-64z"]},Sa={prefix:"fas",iconName:"clipboard-list",icon:[384,512,[],"f46d","M192 0c-41.8 0-77.4 26.7-90.5 64L64 64C28.7 64 0 92.7 0 128L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64l-37.5 0C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM72 272a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm104-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zM72 368a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm88 0c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16z"]},Ea={prefix:"fas",iconName:"person-arrow-up-from-line",icon:[640,512,[],"e539","M192 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-8 352l0-96 16 0 0 96-16 0zm-64 0l-88 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l120 0 80 0 376 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-344 0 0-191.1 28.6 47.5c9.1 15.1 28.8 20 43.9 10.9s20-28.8 10.9-43.9l-58.3-97c-17.4-28.9-48.6-46.6-82.3-46.6l-29.7 0c-33.7 0-64.9 17.7-82.3 46.6l-58.3 97c-9.1 15.1-4.2 34.8 10.9 43.9s34.8 4.2 43.9-10.9L120 256.9 120 448zM598.6 121.4l-80-80c-12.5-12.5-32.8-12.5-45.3 0l-80 80c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L464 141.3 464 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-242.7 25.4 25.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"]},Ta={prefix:"fas",iconName:"bars",icon:[448,512,["navicon"],"f0c9","M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"]},Ia={prefix:"fas",iconName:"arrow-right-from-bracket",icon:[512,512,["sign-out"],"f08b","M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"]},_a={prefix:"fas",iconName:"folder-plus",icon:[512,512,[],"f65e","M512 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l128 0c20.1 0 39.1 9.5 51.2 25.6l19.2 25.6c6 8.1 15.5 12.8 25.6 12.8l160 0c35.3 0 64 28.7 64 64l0 256zM232 376c0 13.3 10.7 24 24 24s24-10.7 24-24l0-64 64 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-64 0 0-64c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 64-64 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l64 0 0 64z"]},ya={prefix:"fas",iconName:"pen-to-square",icon:[512,512,["edit"],"f044","M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"]},Fa=ya,Ra={prefix:"fas",iconName:"eye-slash",icon:[640,512,[],"f070","M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"]},ja={prefix:"fas",iconName:"plug",icon:[384,512,[128268],"f1e6","M96 0C78.3 0 64 14.3 64 32l0 96 64 0 0-96c0-17.7-14.3-32-32-32zM288 0c-17.7 0-32 14.3-32 32l0 96 64 0 0-96c0-17.7-14.3-32-32-32zM32 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l0 32c0 77.4 55 142 128 156.8l0 67.2c0 17.7 14.3 32 32 32s32-14.3 32-32l0-67.2C297 398 352 333.4 352 256l0-32c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z"]},Da={prefix:"fas",iconName:"folder",icon:[512,512,[128193,128447,61716,"folder-blank"],"f07b","M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z"]},Ua={prefix:"fas",iconName:"user",icon:[448,512,[128100,62144],"f007","M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"]},Ya={prefix:"fas",iconName:"jedi",icon:[576,512,[],"f669","M246 315.7l-21.2-31.9c-2.1-3.2-1.7-7.4 1-10.1s6.9-3.1 10.1-1l29.5 19.7c2.1 1.4 4.9 0 5-2.6L279.7 8c.1-4.5 3.8-8 8.3-8s8.1 3.5 8.3 8l9.4 281.9c.1 2.5 2.9 3.9 5 2.6l29.5-19.7c3.2-2.1 7.4-1.7 10.1 1s3.1 6.9 1 10.1L330 315.7c-1.3 1.9-.2 4.5 2 4.9l37.6 7.5c3.7 .7 6.4 4 6.4 7.8s-2.7 7.1-6.4 7.8L332 351.4c-2.2 .4-3.3 3-2 4.9l21.2 31.9c2.1 3.2 1.7 7.4-1 10.1s-6.9 3.1-10.1 1l-26.3-17.6c-2.2-1.4-5.1 .2-5 2.8l2.1 61.5C370.6 435.2 416 382.9 416 320c0-37-15.7-70.4-40.8-93.7c-7-6.5-6.5-18.6 1-24.4C410.1 175.5 432 134.3 432 88c0-16.8-2.9-33-8.2-48c-4.6-13 10.2-30 21.4-22c53.5 38 92.7 94.8 107.8 160.7c.5 2.1-.2 4.3-1.7 5.9l-28.4 28.4c-4 4-1.2 10.9 4.5 10.9l26 0c3.4 0 6.2 2.6 6.3 6c.1 3.3 .2 6.6 .2 10c0 17.5-1.7 34.7-4.8 51.3c-.2 1.2-.9 2.4-1.7 3.3l-46.5 46.5c-4 4-1.2 10.9 4.5 10.9l14.6 0c4.6 0 7.7 4.8 5.7 9C487.2 450.5 394.8 512 288 512S88.8 450.5 44.3 361c-2.1-4.2 1-9 5.7-9l14.6 0c5.7 0 8.6-6.9 4.5-10.9L22.6 294.6c-.9-.9-1.5-2-1.7-3.3C17.7 274.7 16 257.5 16 240c0-3.3 .1-6.7 .2-10c.1-3.4 2.9-6 6.3-6l26 0c5.7 0 8.6-6.9 4.5-10.9L24.6 184.6c-1.5-1.5-2.2-3.8-1.7-5.9C38.1 112.8 77.3 56 130.8 18c11.3-8 26 8.9 21.4 22c-5.3 15-8.2 31.2-8.2 48c0 46.3 21.9 87.5 55.8 113.9c7.5 5.8 8 17.9 1 24.4C175.7 249.6 160 283 160 320c0 62.9 45.4 115.2 105.1 126l2.1-61.5c.1-2.6-2.8-4.2-5-2.8l-26.3 17.6c-3.2 2.1-7.4 1.7-10.1-1s-3.1-6.9-1-10.1L246 356.3c1.3-1.9 .2-4.5-2-4.9l-37.6-7.5c-3.7-.7-6.4-4-6.4-7.8s2.7-7.1 6.4-7.8l37.6-7.5c2.2-.4 3.3-3 2-4.9z"]},Wa={prefix:"fas",iconName:"caret-up",icon:[320,512,[],"f0d8","M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"]},Ha={prefix:"fas",iconName:"table-columns",icon:[512,512,["columns"],"f0db","M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm64 64l0 256 160 0 0-256L64 160zm384 0l-160 0 0 256 160 0 0-256z"]},Xa={prefix:"fas",iconName:"circle-check",icon:[512,512,[61533,"check-circle"],"f058","M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"]},Ga={prefix:"fas",iconName:"pause",icon:[320,512,[9208],"f04c","M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"]},Ba={prefix:"fas",iconName:"sort",icon:[320,512,["unsorted"],"f0dc","M137.4 41.4c12.5-12.5 32.8-12.5 45.3 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9s-16.6 19.8-29.6 19.8L32 224c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9l128-128zm0 429.3l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8l256 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128c-12.5 12.5-32.8 12.5-45.3 0z"]},Va={prefix:"fas",iconName:"filter",icon:[512,512,[],"f0b0","M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"]},$a={prefix:"fas",iconName:"file-signature",icon:[576,512,[],"f573","M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-19.3c-2.7 1.1-5.4 2-8.2 2.7l-60.1 15c-3 .7-6 1.2-9 1.4c-.9 .1-1.8 .2-2.7 .2l-64 0c-6.1 0-11.6-3.4-14.3-8.8l-8.8-17.7c-1.7-3.4-5.1-5.5-8.8-5.5s-7.2 2.1-8.8 5.5l-8.8 17.7c-2.9 5.9-9.2 9.4-15.7 8.8s-12.1-5.1-13.9-11.3L144 381l-9.8 32.8c-6.1 20.3-24.8 34.2-46 34.2L80 448c-8.8 0-16-7.2-16-16s7.2-16 16-16l8.2 0c7.1 0 13.3-4.6 15.3-11.4l14.9-49.5c3.4-11.3 13.8-19.1 25.6-19.1s22.2 7.8 25.6 19.1l11.6 38.6c7.4-6.2 16.8-9.7 26.8-9.7c15.9 0 30.4 9 37.5 23.2l4.4 8.8 8.9 0c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7L384 203.6l0-43.6-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM549.8 139.7c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM311.9 321c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L512.1 262.7l-71-71L311.9 321z"]},qa={prefix:"fas",iconName:"person-circle-plus",icon:[576,512,[],"e541","M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l44.9 74.7c-16.1 17.6-28.6 38.5-36.6 61.5c-1.9-1.8-3.5-3.9-4.9-6.3L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0zM432 224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm16 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 48-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0 0 48c0 8.8 7.2 16 16 16s16-7.2 16-16l0-48 48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0 0-48z"]},Ka={prefix:"fas",iconName:"file-excel",icon:[384,512,[],"f1c3","M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM155.7 250.2L192 302.1l36.3-51.9c7.6-10.9 22.6-13.5 33.4-5.9s13.5 22.6 5.9 33.4L221.3 344l46.4 66.2c7.6 10.9 5 25.8-5.9 33.4s-25.8 5-33.4-5.9L192 385.8l-36.3 51.9c-7.6 10.9-22.6 13.5-33.4 5.9s-13.5-22.6-5.9-33.4L162.7 344l-46.4-66.2c-7.6-10.9-5-25.8 5.9-33.4s25.8-5 33.4 5.9z"]},Ja={prefix:"fas",iconName:"circle-up",icon:[512,512,[61467,"arrow-alt-circle-up"],"f35b","M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm11.3-395.3l112 112c4.6 4.6 5.9 11.5 3.5 17.4s-8.3 9.9-14.8 9.9l-64 0 0 96c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-96-64 0c-6.5 0-12.3-3.9-14.8-9.9s-1.1-12.9 3.5-17.4l112-112c6.2-6.2 16.4-6.2 22.6 0z"]},Qa={prefix:"fas",iconName:"file-image",icon:[384,512,[128443],"f1c5","M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM64 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm152 32c5.3 0 10.2 2.6 13.2 6.9l88 128c3.4 4.9 3.7 11.3 1 16.5s-8.2 8.6-14.2 8.6l-88 0-40 0-48 0-48 0c-5.8 0-11.1-3.1-13.9-8.1s-2.8-11.2 .2-16.1l48-80c2.9-4.8 8.1-7.8 13.7-7.8s10.8 2.9 13.7 7.8l12.8 21.4 48.3-70.2c3-4.3 7.9-6.9 13.2-6.9z"]},Za={prefix:"fas",iconName:"code-branch",icon:[448,512,[],"f126","M80 104a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm80-24c0 32.8-19.7 61-48 73.3l0 87.8c18.8-10.9 40.7-17.1 64-17.1l96 0c35.3 0 64-28.7 64-64l0-6.7C307.7 141 288 112.8 288 80c0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3l0 6.7c0 70.7-57.3 128-128 128l-96 0c-35.3 0-64 28.7-64 64l0 6.7c28.3 12.3 48 40.5 48 73.3c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-32.8 19.7-61 48-73.3l0-6.7 0-198.7C19.7 141 0 112.8 0 80C0 35.8 35.8 0 80 0s80 35.8 80 80zm232 0a24 24 0 1 0 -48 0 24 24 0 1 0 48 0zM80 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"]},e2={prefix:"fas",iconName:"tags",icon:[512,512,[],"f02c","M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"]},t2={prefix:"fas",iconName:"eye",icon:[576,512,[128065],"f06e","M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"]},n2={prefix:"fas",iconName:"user-gear",icon:[640,512,["user-cog"],"f4fe","M224 0a128 128 0 1 1 0 256A128 128 0 1 1 224 0zM178.3 304l91.4 0c11.8 0 23.4 1.2 34.5 3.3c-2.1 18.5 7.4 35.6 21.8 44.8c-16.6 10.6-26.7 31.6-20 53.3c4 12.9 9.4 25.5 16.4 37.6s15.2 23.1 24.4 33c15.7 16.9 39.6 18.4 57.2 8.7l0 .9c0 9.2 2.7 18.5 7.9 26.3L29.7 512C13.3 512 0 498.7 0 482.3C0 383.8 79.8 304 178.3 304zM436 218.2c0-7 4.5-13.3 11.3-14.8c10.5-2.4 21.5-3.7 32.7-3.7s22.2 1.3 32.7 3.7c6.8 1.5 11.3 7.8 11.3 14.8l0 30.6c7.9 3.4 15.4 7.7 22.3 12.8l24.9-14.3c6.1-3.5 13.7-2.7 18.5 2.4c7.6 8.1 14.3 17.2 20.1 27.2s10.3 20.4 13.5 31c2.1 6.7-1.1 13.7-7.2 17.2l-25 14.4c.4 4 .7 8.1 .7 12.3s-.2 8.2-.7 12.3l25 14.4c6.1 3.5 9.2 10.5 7.2 17.2c-3.3 10.6-7.8 21-13.5 31s-12.5 19.1-20.1 27.2c-4.8 5.1-12.5 5.9-18.5 2.4l-24.9-14.3c-6.9 5.1-14.3 9.4-22.3 12.8l0 30.6c0 7-4.5 13.3-11.3 14.8c-10.5 2.4-21.5 3.7-32.7 3.7s-22.2-1.3-32.7-3.7c-6.8-1.5-11.3-7.8-11.3-14.8l0-30.5c-8-3.4-15.6-7.7-22.5-12.9l-24.7 14.3c-6.1 3.5-13.7 2.7-18.5-2.4c-7.6-8.1-14.3-17.2-20.1-27.2s-10.3-20.4-13.5-31c-2.1-6.7 1.1-13.7 7.2-17.2l24.8-14.3c-.4-4.1-.7-8.2-.7-12.4s.2-8.3 .7-12.4L343.8 325c-6.1-3.5-9.2-10.5-7.2-17.2c3.3-10.6 7.7-21 13.5-31s12.5-19.1 20.1-27.2c4.8-5.1 12.4-5.9 18.5-2.4l24.8 14.3c6.9-5.1 14.5-9.4 22.5-12.9l0-30.5zm92.1 133.5a48.1 48.1 0 1 0 -96.1 0 48.1 48.1 0 1 0 96.1 0z"]},a2={prefix:"fas",iconName:"trash",icon:[448,512,[],"f1f8","M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"]},r2={prefix:"fas",iconName:"file-video",icon:[384,512,[],"f1c8","M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM64 288c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32l0-96zM300.9 397.9L256 368l0-64 44.9-29.9c2-1.3 4.4-2.1 6.8-2.1c6.8 0 12.3 5.5 12.3 12.3l0 103.4c0 6.8-5.5 12.3-12.3 12.3c-2.4 0-4.8-.7-6.8-2.1z"]},s2={prefix:"fas",iconName:"file-pdf",icon:[512,512,[],"f1c1","M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 144-208 0c-35.3 0-64 28.7-64 64l0 144-48 0c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z"]},i2={prefix:"fas",iconName:"tag",icon:[448,512,[127991],"f02b","M0 80L0 229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7L48 32C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"]},o2={prefix:"fas",iconName:"circle-info",icon:[512,512,["info-circle"],"f05a","M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"]},va={prefix:"fas",iconName:"arrow-rotate-left",icon:[512,512,[8634,"arrow-left-rotate","arrow-rotate-back","arrow-rotate-backward","undo"],"f0e2","M125.7 160l50.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 224c-17.7 0-32-14.3-32-32L16 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"]},c2=va,l2={prefix:"fas",iconName:"gear",icon:[512,512,[9881,"cog"],"f013","M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"]},f2={prefix:"fas",iconName:"caret-down",icon:[320,512,[],"f0d7","M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"]},u2={prefix:"fas",iconName:"download",icon:[512,512,[],"f019","M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"]},m2={prefix:"fas",iconName:"file-circle-check",icon:[576,512,[],"e5a0","M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 38.6C310.1 219.5 256 287.4 256 368c0 59.1 29.1 111.3 73.7 143.3c-3.2 .5-6.4 .7-9.7 .7L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM288 368a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm211.3-43.3c-6.2-6.2-16.4-6.2-22.6 0L416 385.4l-28.7-28.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l40 40c6.2 6.2 16.4 6.2 22.6 0l72-72c6.2-6.2 6.2-16.4 0-22.6z"]},d2={prefix:"fas",iconName:"id-card",icon:[576,512,[62147,"drivers-license"],"f2c2","M0 96l576 0c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96zm0 32L0 416c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-288L0 128zM64 405.3c0-29.5 23.9-53.3 53.3-53.3l117.3 0c29.5 0 53.3 23.9 53.3 53.3c0 5.9-4.8 10.7-10.7 10.7L74.7 416c-5.9 0-10.7-4.8-10.7-10.7zM176 192a64 64 0 1 1 0 128 64 64 0 1 1 0-128zm176 16c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16z"]},xa={prefix:"fas",iconName:"house",icon:[576,512,[127968,63498,63500,"home","home-alt","home-lg-alt"],"f015","M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"]},p2=xa,g2={prefix:"fas",iconName:"stop",icon:[384,512,[9209],"f04d","M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"]},h2={prefix:"fas",iconName:"upload",icon:[512,512,[],"f093","M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"]},b2={prefix:"fas",iconName:"sun",icon:[512,512,[9728],"f185","M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"]},La={prefix:"fas",iconName:"ellipsis",icon:[448,512,["ellipsis-h"],"f141","M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"]},y2=La,v2={prefix:"fas",iconName:"file-circle-xmark",icon:[576,512,[],"e5a1","M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 38.6C310.1 219.5 256 287.4 256 368c0 59.1 29.1 111.3 73.7 143.3c-3.2 .5-6.4 .7-9.7 .7L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zm48 96a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm59.3 107.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L432 345.4l-36.7-36.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L409.4 368l-36.7 36.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L432 390.6l36.7 36.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L454.6 368l36.7-36.7z"]},x2={prefix:"fas",iconName:"file",icon:[384,512,[128196,128459,61462],"f15b","M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"]},L2={prefix:"fas",iconName:"arrow-down",icon:[384,512,[8595],"f063","M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"]},z2={prefix:"fas",iconName:"bars-staggered",icon:[512,512,["reorder","stream"],"f550","M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"]},C2={prefix:"fas",iconName:"link",icon:[640,512,[128279,"chain"],"f0c1","M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"]},M2={prefix:"fas",iconName:"play",icon:[384,512,[9654],"f04b","M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"]},A2={prefix:"fas",iconName:"magnifying-glass",icon:[512,512,[128269,"search"],"f002","M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"]},k2={prefix:"fas",iconName:"arrow-up",icon:[384,512,[8593],"f062","M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"]},za={prefix:"fas",iconName:"circle-user",icon:[512,512,[62142,"user-circle"],"f2bd","M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"]},N2=za,w2={prefix:"fas",iconName:"copy",icon:[448,512,[],"f0c5","M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z"]},Ca={prefix:"fas",iconName:"plus",icon:[448,512,[10133,61543,"add"],"2b","M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"]},O2=Ca,P2={prefix:"fas",iconName:"expand",icon:[448,512,[],"f065","M32 32C14.3 32 0 46.3 0 64l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32l0-96z"]},Ma={prefix:"fas",iconName:"xmark",icon:[384,512,[128473,10005,10006,10060,215,"close","multiply","remove","times"],"f00d","M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"]},S2=Ma,E2={prefix:"fas",iconName:"trash-arrow-up",icon:[448,512,["trash-restore"],"f829","M163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3C140.6 6.8 151.7 0 163.8 0zM32 128l384 0L394.8 467c-1.6 25.3-22.6 45-47.9 45l-245.8 0c-25.3 0-46.3-19.7-47.9-45L32 128zm192 64c-6.4 0-12.5 2.5-17 7l-80 80c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L200 408c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-4.5-4.5-10.6-7-17-7z"]},T2={prefix:"fas",iconName:"chevron-right",icon:[320,512,[9002],"f054","M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"]},I2={prefix:"fas",iconName:"rotate",icon:[512,512,[128260,"sync-alt"],"f2f1","M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7-24.2 25.4-40.8 19.5s-25.4-24.2-19.5-40.8C55.6 150.7 73.2 122 97.6 97.6c87.2-87.2 228.3-87.5 315.8-1L455 55c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 128c0 13.3-10.7 24-24 24l-8.4 0c0 0 0 0 0 0L344 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l41.1-41.1c-62.6-61.5-163.1-61.2-225.3 1zM16 312c0-13.3 10.7-24 24-24l7.6 0 .7 0L168 288c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-41.1 41.1c62.6 61.5 163.1 61.2 225.3-1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7 24.2-25.4 40.8-19.5s25.4 24.2 19.5 40.8c-10.8 30.6-28.4 59.3-52.9 83.8c-87.2 87.2-228.3 87.5-315.8 1L57 457c-6.9 6.9-17.2 8.9-26.2 5.2S16 449.7 16 440l0-119.6 0-.7 0-7.6z"]},_2={prefix:"fas",iconName:"spinner",icon:[512,512,[],"f110","M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"]},F2={prefix:"fas",iconName:"building",icon:[384,512,[127970,61687],"f1ad","M48 0C21.5 0 0 21.5 0 48L0 464c0 26.5 21.5 48 48 48l96 0 0-80c0-26.5 21.5-48 48-48s48 21.5 48 48l0 80 96 0c26.5 0 48-21.5 48-48l0-416c0-26.5-21.5-48-48-48L48 0zM64 240c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zm112-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM80 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM272 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16z"]},R2={prefix:"fas",iconName:"moon",icon:[384,512,[127769,9214],"f186","M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"]},j2={prefix:"fas",iconName:"person-arrow-down-to-line",icon:[640,512,[],"e538","M192 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-8 352l0-96 16 0 0 96-16 0zm-64 0l-88 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l120 0 80 0 376 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-344 0 0-191.1 28.6 47.5c9.1 15.1 28.8 20 43.9 10.9s20-28.8 10.9-43.9l-58.3-97c-17.4-28.9-48.6-46.6-82.3-46.6l-29.7 0c-33.7 0-64.9 17.7-82.3 46.6l-58.3 97c-9.1 15.1-4.2 34.8 10.9 43.9s34.8 4.2 43.9-10.9L120 256.9 120 448zM464 64l0 242.7-25.4-25.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80 80c12.5 12.5 32.8 12.5 45.3 0l80-80c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L528 306.7 528 64c0-17.7-14.3-32-32-32s-32 14.3-32 32z"]},D2={prefix:"fas",iconName:"file-circle-plus",icon:[576,512,[58606],"e494","M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 38.6C310.1 219.5 256 287.4 256 368c0 59.1 29.1 111.3 73.7 143.3c-3.2 .5-6.4 .7-9.7 .7L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zm48 96a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm16 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 48-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0 0 48c0 8.8 7.2 16 16 16s16-7.2 16-16l0-48 48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0 0-48z"]},U2={prefix:"fas",iconName:"check",icon:[448,512,[10003,10004],"f00c","M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"]},Y2={prefix:"fas",iconName:"user-tag",icon:[640,512,[],"f507","M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c10 0 18.8-4.9 24.2-12.5l-99.2-99.2c-14.9-14.9-23.3-35.1-23.3-56.1l0-33c-15.9-4.7-32.8-7.2-50.3-7.2l-91.4 0zM384 224c-17.7 0-32 14.3-32 32l0 82.7c0 17 6.7 33.3 18.7 45.3L478.1 491.3c18.7 18.7 49.1 18.7 67.9 0l73.4-73.4c18.7-18.7 18.7-49.1 0-67.9L512 242.7c-12-12-28.3-18.7-45.3-18.7L384 224zm24 80a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"]},Aa={prefix:"fas",iconName:"triangle-exclamation",icon:[512,512,[9888,"exclamation-triangle","warning"],"f071","M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"]},W2=Aa,H2={prefix:"fas",iconName:"share",icon:[512,512,["mail-forward"],"f064","M307 34.8c-11.5 5.1-19 16.6-19 29.2l0 64-112 0C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96l96 0 0 64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z"]},X2={prefix:"fas",iconName:"video",icon:[576,512,["video-camera"],"f03d","M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1l0-17.1 0-128 0-17.1 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"]};export{H2 as $,Wa as A,f2 as B,e2 as C,Da as D,x2 as E,ln as F,r2 as G,Qa as H,s2 as I,O2 as J,Ta as K,z2 as L,Ua as M,Ia as N,l2 as O,m as P,p2 as Q,wa as R,b2 as S,R2 as T,_2 as U,Ka as V,P2 as W,Ra as X,t2 as Y,o2 as Z,D2 as _,Y2 as a,w2 as a0,Za as a1,y2 as a2,i2 as a3,A2 as a4,X2 as a5,g2 as a6,Ga as a7,M2 as a8,c2 as a9,Ca as aa,L2 as ab,k2 as ac,v2 as ad,m2 as ae,Xa as af,Na as ag,$a as ah,E2 as ai,h2 as aj,Pa as ak,C2 as al,Ja as am,Ha as b,a2 as c,n2 as d,T2 as e,_a as f,d2 as g,ja as h,Oa as i,Sa as j,N2 as k,F2 as l,Fa as m,Ea as n,j2 as o,S2 as p,Va as q,U2 as r,Ma as s,u2 as t,Ba as u,W2 as v,I2 as w,Ya as x,aa as y,qa as z};
