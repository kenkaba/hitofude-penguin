'use strict';
var FLOW_WORLDS=[
  {
    "name": "ネオン街",
    "en": "NEON DISTRICT",
    "accent": "#53f6ed",
    "start": 1,
    "end": 3,
    "image": "cyber-city.webp"
  },
  {
    "name": "凍結炉心",
    "en": "FROZEN REACTOR",
    "accent": "#91d9ff",
    "start": 4,
    "end": 6,
    "image": "worlds/02.webp"
  },
  {
    "name": "軌道ステーション",
    "en": "ORBITAL STATION",
    "accent": "#b3b7ff",
    "start": 7,
    "end": 9,
    "image": "worlds/03.webp"
  },
  {
    "name": "光る温室",
    "en": "BIOLUMINESCENT GARDEN",
    "accent": "#88f2ab",
    "start": 10,
    "end": 12,
    "image": "worlds/04.webp"
  },
  {
    "name": "砂漠の精製所",
    "en": "DESERT REFINERY",
    "accent": "#ffd58c",
    "start": 13,
    "end": 15,
    "image": "worlds/05.webp"
  },
  {
    "name": "深海ドーム",
    "en": "ABYSSAL DOME",
    "accent": "#79dcff",
    "start": 16,
    "end": 18,
    "image": "worlds/06.webp"
  },
  {
    "name": "紅蓮の鋳造所",
    "en": "CRIMSON FOUNDRY",
    "accent": "#ffa18b",
    "start": 19,
    "end": 21,
    "image": "worlds/07.webp"
  },
  {
    "name": "データ大聖堂",
    "en": "DATA CATHEDRAL",
    "accent": "#d2a7ff",
    "start": 22,
    "end": 24,
    "image": "worlds/08.webp"
  },
  {
    "name": "雨のネオン市場",
    "en": "RAIN MARKET",
    "accent": "#ff9bd2",
    "start": 25,
    "end": 27,
    "image": "worlds/09.webp"
  },
  {
    "name": "月面採掘基地",
    "en": "LUNAR EXCAVATION",
    "accent": "#dbe2ff",
    "start": 28,
    "end": 30,
    "image": "worlds/10.webp"
  },
  {
    "name": "緑に沈む地下鉄",
    "en": "OVERGROWN METRO",
    "accent": "#b2ef9a",
    "start": 31,
    "end": 33,
    "image": "worlds/11.webp"
  },
  {
    "name": "水晶動力洞",
    "en": "CRYSTAL POWER CAVE",
    "accent": "#bcb2ff",
    "start": 34,
    "end": 36,
    "image": "worlds/12.webp"
  },
  {
    "name": "雲上の港",
    "en": "CLOUD HARBOR",
    "accent": "#b2ecff",
    "start": 37,
    "end": 39,
    "image": "worlds/13.webp"
  },
  {
    "name": "火山の地熱機関",
    "en": "GEOTHERMAL ENGINE",
    "accent": "#ffc48c",
    "start": 40,
    "end": 42,
    "image": "worlds/14.webp"
  },
  {
    "name": "白金の太陽都市",
    "en": "SOLAR CITADEL",
    "accent": "#ffe6a4",
    "start": 43,
    "end": 45,
    "image": "worlds/15.webp"
  },
  {
    "name": "環状惑星の前哨基地",
    "en": "RINGWORLD OUTPOST",
    "accent": "#e9b0ed",
    "start": 46,
    "end": 48,
    "image": "worlds/16.webp"
  },
  {
    "name": "夜明けの再生都市",
    "en": "CITY REBORN",
    "accent": "#ffd8b3",
    "start": 49,
    "end": 50,
    "image": "worlds/17.webp"
  }
];
if(typeof module!=="undefined")module.exports=FLOW_WORLDS;
