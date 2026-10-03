// Six independent structural puzzles. slot is the one-based stage ID.
// Authored solutions validated with 3 seeds, ±3px jitter, .6s/1.8s stroke gaps.
module.exports = [
  {
    "slot": 2,
    "level": {
      "id": 2,
      "name": "谷を渡す大橋",
      "source": {
        "x": 80,
        "y": 60
      },
      "cups": [
        {
          "x": 340,
          "y": 375,
          "w": 100,
          "h": 85,
          "target": 150
        }
      ],
      "platforms": [
        {
          "x": 65,
          "y": 240,
          "w": 36,
          "h": 18,
          "angle": 0
        },
        {
          "x": 240,
          "y": 330,
          "w": 36,
          "h": 18,
          "angle": 0
        }
      ],
      "solutions": [
        [
          {
            "x": 35,
            "y": 190
          },
          {
            "x": 245,
            "y": 298
          }
        ]
      ],
      "ink": 320,
      "total": 450,
      "maxStrokes": 1,
      "gravityScale": 1,
      "drains": [
        {
          "x": 150,
          "y": 405,
          "w": 120,
          "h": 14,
          "angle": 0
        }
      ],
      "puzzleConcept": "二つの足場に橋を掛け、落ちた後の出口から離れたタンクまで水を飛ばす。",
      "mechanic": "二つの足場に橋を掛け、落ちた後の出口から離れたタンクまで水を飛ばす。",
      "hints": [
        "橋の両端ではなく、途中の二か所を足場に載せよう。",
        "水には横向きの勢いが残る。タンクの手前で橋を終えよう。"
      ],
      "rule": "二つの足場に橋を掛け、落ちた後の出口から離れたタンクまで水を飛ばす。",
      "parInk": 237,
      "essentialStrokes": [
        0
      ],
      "archetype": "structure-2",
      "gates": [],
      "switches": [],
      "relays": [],
      "winds": [],
      "noDraw": [],
      "portals": [],
      "pumps": [],
      "sources": [
        {
          "x": 80,
          "y": 60
        }
      ]
    }
  },
  {
    "slot": 3,
    "level": {
      "id": 3,
      "name": "腕を回して支える",
      "source": {
        "x": 160,
        "y": 60
      },
      "cups": [
        {
          "x": 285,
          "y": 420,
          "w": 100,
          "h": 85,
          "target": 180
        }
      ],
      "platforms": [
        {
          "x": 95,
          "y": 210,
          "w": 38,
          "h": 90,
          "angle": 0
        },
        {
          "x": 215,
          "y": 325,
          "w": 22,
          "h": 16,
          "angle": 0
        }
      ],
      "solutions": [
        [
          {
            "x": 65,
            "y": 270
          },
          {
            "x": 65,
            "y": 140
          },
          {
            "x": 125,
            "y": 140
          },
          {
            "x": 310,
            "y": 355
          }
        ]
      ],
      "ink": 640,
      "total": 450,
      "maxStrokes": 1,
      "gravityScale": 1,
      "puzzleConcept": "折り曲げた左の腕で重心を戻し、長い出口を吊り合せる。",
      "mechanic": "折り曲げた左の腕で重心を戻し、長い出口を吊り合せる。",
      "hints": [
        "左の柱を避けて、線に長い折り返しの腕を付けよう。",
        "出口だけ長くすると傾く。反対側の線の重さを使おう。"
      ],
      "rule": "折り曲げた左の腕で重心を戻し、長い出口を吊り合せる。",
      "parInk": 474,
      "essentialStrokes": [
        0
      ],
      "archetype": "structure-3",
      "gates": [],
      "switches": [],
      "relays": [],
      "winds": [],
      "noDraw": [],
      "portals": [],
      "pumps": [],
      "sources": [
        {
          "x": 160,
          "y": 60
        }
      ],
      "drains": []
    }
  },
  {
    "slot": 5,
    "level": {
      "id": 5,
      "name": "逆向きの二段橋",
      "source": {
        "x": 65,
        "y": 60
      },
      "cups": [
        {
          "x": 80,
          "y": 460,
          "w": 100,
          "h": 85,
          "target": 180
        }
      ],
      "platforms": [
        {
          "x": 58,
          "y": 200,
          "w": 28,
          "h": 18,
          "angle": 0
        },
        {
          "x": 186,
          "y": 257,
          "w": 28,
          "h": 18,
          "angle": 0
        },
        {
          "x": 263,
          "y": 357,
          "w": 28,
          "h": 18,
          "angle": 0
        },
        {
          "x": 153,
          "y": 413,
          "w": 28,
          "h": 18,
          "angle": 0
        }
      ],
      "solutions": [
        [
          {
            "x": 30,
            "y": 155
          },
          {
            "x": 205,
            "y": 232
          }
        ],
        [
          {
            "x": 350,
            "y": 280
          },
          {
            "x": 130,
            "y": 392
          }
        ]
      ],
      "ink": 600,
      "total": 450,
      "maxStrokes": 2,
      "gravityScale": 1,
      "puzzleConcept": "右へ送った水を下の逆向きの橋で受け、左へ折り返す。",
      "mechanic": "右へ送った水を下の逆向きの橋で受け、左へ折り返す。",
      "hints": [
        "上下の橋は、反対向きの坂にしよう。",
        "上の橋から飛び出す場所を、下の橋の右側で受けよう。"
      ],
      "rule": "右へ送った水を下の逆向きの橋で受け、左へ折り返す。",
      "parInk": 439,
      "essentialStrokes": [
        0,
        1
      ],
      "archetype": "structure-5",
      "gates": [],
      "switches": [],
      "relays": [],
      "winds": [],
      "noDraw": [],
      "portals": [],
      "pumps": [],
      "sources": [
        {
          "x": 65,
          "y": 60
        }
      ],
      "drains": []
    }
  },
  {
    "slot": 6,
    "level": {
      "id": 6,
      "name": "壁が最後の水路",
      "source": {
        "x": 115,
        "y": 60
      },
      "cups": [
        {
          "x": 330,
          "y": 425,
          "w": 110,
          "h": 85,
          "target": 180
        }
      ],
      "platforms": [
        {
          "x": 90,
          "y": 190,
          "w": 120,
          "h": 14,
          "angle": 0.55
        },
        {
          "x": 277,
          "y": 340,
          "w": 90,
          "h": 14,
          "angle": 0.55
        },
        {
          "x": 378,
          "y": 345,
          "w": 12,
          "h": 170
        }
      ],
      "solutions": [
        [
          {
            "x": 65,
            "y": 140
          },
          {
            "x": 270,
            "y": 300
          }
        ]
      ],
      "ink": 360,
      "total": 450,
      "maxStrokes": 1,
      "gravityScale": 1,
      "drains": [
        {
          "x": 175,
          "y": 280,
          "w": 85,
          "h": 12
        }
      ],
      "puzzleConcept": "排水口を跨ぐ橋で水を送り、右の壁に当ててタンクへ落とす。",
      "mechanic": "排水口を跨ぐ橋で水を送り、右の壁に当ててタンクへ落とす。",
      "hints": [
        "ピンクの排水口より上で、切れた足場をつなごう。",
        "右の壁も水路の一部。勢いのある水をそこで止めよう。"
      ],
      "rule": "排水口を跨ぐ橋で水を送り、右の壁に当ててタンクへ落とす。",
      "parInk": 261,
      "essentialStrokes": [
        0
      ],
      "archetype": "structure-6",
      "gates": [],
      "switches": [],
      "relays": [],
      "winds": [],
      "noDraw": [],
      "portals": [],
      "pumps": [],
      "sources": [
        {
          "x": 115,
          "y": 60
        }
      ]
    }
  },
  {
    "slot": 11,
    "level": {
      "id": 11,
      "name": "足場から描く",
      "source": {
        "x": 80,
        "y": 60
      },
      "cups": [
        {
          "x": 340,
          "y": 375,
          "w": 100,
          "h": 85,
          "target": 150
        }
      ],
      "platforms": [
        {
          "x": 78,
          "y": 240,
          "w": 34,
          "h": 18,
          "angle": 0
        },
        {
          "x": 230,
          "y": 415,
          "w": 48,
          "h": 18,
          "angle": 0
        }
      ],
      "solutions": [
        [
          {
            "x": 213,
            "y": 310
          },
          {
            "x": 245,
            "y": 310
          },
          {
            "x": 245,
            "y": 395
          },
          {
            "x": 213,
            "y": 395
          },
          {
            "x": 213,
            "y": 310
          }
        ],
        [
          {
            "x": 35,
            "y": 178
          },
          {
            "x": 290,
            "y": 310
          }
        ]
      ],
      "ink": 710,
      "total": 450,
      "maxStrokes": 2,
      "gravityScale": 1,
      "puzzleConcept": "一筆目を箱型の支柱にし、二筆目の坂を支えて出口の高さを作る。",
      "mechanic": "一筆目を箱型の支柱にし、二筆目の坂を支えて出口の高さを作る。",
      "hints": [
        "低い右の足場に、縦長の四角い支柱を先に落とそう。",
        "左の足場と、自分で作った支柱に坂を渡そう。"
      ],
      "rule": "一筆目を箱型の支柱にし、二筆目の坂を支えて出口の高さを作る。",
      "parInk": 522,
      "essentialStrokes": [
        0,
        1
      ],
      "archetype": "structure-11",
      "gates": [],
      "switches": [],
      "relays": [],
      "winds": [],
      "noDraw": [],
      "portals": [],
      "pumps": [],
      "sources": [
        {
          "x": 80,
          "y": 60
        }
      ],
      "drains": []
    }
  },
  {
    "slot": 12,
    "level": {
      "id": 12,
      "name": "段差の分水嶺",
      "source": {
        "x": 180,
        "y": 60,
        "spread": 36
      },
      "cups": [
        {
          "x": 50,
          "y": 350,
          "w": 90,
          "h": 85,
          "target": 100
        },
        {
          "x": 310,
          "y": 440,
          "w": 100,
          "h": 85,
          "target": 100
        }
      ],
      "platforms": [
        {
          "x": 115,
          "y": 265,
          "w": 30,
          "h": 18,
          "angle": 0
        },
        {
          "x": 257,
          "y": 340,
          "w": 30,
          "h": 18,
          "angle": 0
        }
      ],
      "solutions": [
        [
          {
            "x": 85,
            "y": 260
          },
          {
            "x": 180,
            "y": 155
          },
          {
            "x": 290,
            "y": 330
          }
        ]
      ],
      "ink": 480,
      "total": 450,
      "maxStrokes": 1,
      "gravityScale": 1,
      "puzzleConcept": "高さの違う二つのタンクへ、左右の長さが違う屋根で水を分ける。",
      "mechanic": "高さの違う二つのタンクへ、左右の長さが違う屋根で水を分ける。",
      "hints": [
        "真ん中を頂点にした屋根で、水を左右に分けよう。",
        "左は高く短く、右は低く長く。器の高さに出口を合わせよう。"
      ],
      "rule": "高さの違う二つのタンクへ、左右の長さが違う屋根で水を分ける。",
      "parInk": 349,
      "essentialStrokes": [
        0
      ],
      "archetype": "structure-12",
      "gates": [],
      "switches": [],
      "relays": [],
      "winds": [],
      "noDraw": [],
      "portals": [],
      "pumps": [],
      "sources": [
        {
          "x": 180,
          "y": 60,
          "spread": 36
        }
      ],
      "drains": []
    }
  }
];
