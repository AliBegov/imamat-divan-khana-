// ============================================================================
// РЕАЛЬНАЯ СПУТНИКОВАЯ ВЫСОТНАЯ КАРТА ДАГЕСТАНА И ВОСТОЧНОГО КАВКАЗА (NASA SRTM 30m)
// Источник: AWS Elevation Tiles / Mapzen Terrarium (srtm/N41E045..N43E048, Zoom 9)
// Сетка: 301×198 (59,598 реальных высотных отсчётов, шаг квантования 2 м,
// диапазон -46.0 м .. 4168.8 м, TPS-привязка к историческим точкам 1845 г.)
// Автоматически сгенерировано: scratch/build_dagestan_real_srtm_dem.py
// ============================================================================

export const DAGESTAN_SRTM_META = {
  width: 301,
  height: 198,
  minMeters: -60.0,
  stepMeters: 2.0,
  actualMinMeters: -46.0,
  actualMaxMeters: 4168.8
};

// Реальные русла 7 главных рек Дагестана и Чечни, привязанные к тальвегам каньонов NASA SRTM
export const DAGESTAN_SRTM_RIVER_DEFS = [
  {
    "id": "terek",
    "hw": 0.66,
    "carveDepth": 0.14,
    "pts": [
      [
        8.0,
        22.0
      ],
      [
        115.0,
        14.0
      ],
      [
        225.0,
        11.0
      ],
      [
        358.0,
        10.0
      ],
      [
        510.0,
        12.0
      ],
      [
        650.0,
        16.0
      ]
    ]
  },
  {
    "id": "sunzha",
    "hw": 0.48,
    "carveDepth": 0.16,
    "pts": [
      [
        15.8,
        165.7
      ],
      [
        108.3,
        47.3
      ],
      [
        168.1,
        6.0
      ]
    ]
  },
  {
    "id": "argun",
    "hw": 0.42,
    "carveDepth": 0.36,
    "pts": [
      [
        144.7,
        347.9
      ],
      [
        143.1,
        338.6
      ],
      [
        141.9,
        329.2
      ],
      [
        141.5,
        319.9
      ],
      [
        141.8,
        310.7
      ],
      [
        142.2,
        301.9
      ],
      [
        142.0,
        293.5
      ],
      [
        140.7,
        284.7
      ],
      [
        137.8,
        275.5
      ],
      [
        133.4,
        266.2
      ],
      [
        128.9,
        256.9
      ],
      [
        125.9,
        247.5
      ],
      [
        124.5,
        238.3
      ],
      [
        124.2,
        229.6
      ],
      [
        123.5,
        221.1
      ],
      [
        120.6,
        212.3
      ],
      [
        114.9,
        203.1
      ],
      [
        107.0,
        193.8
      ],
      [
        98.0,
        184.5
      ],
      [
        89.2,
        175.1
      ],
      [
        82.8,
        165.8
      ],
      [
        79.9,
        156.4
      ],
      [
        79.3,
        147.1
      ],
      [
        79.3,
        137.8
      ],
      [
        79.3,
        128.4
      ],
      [
        79.8,
        119.1
      ],
      [
        81.7,
        109.7
      ],
      [
        85.0,
        100.4
      ],
      [
        88.7,
        91.1
      ],
      [
        92.6,
        81.7
      ],
      [
        97.6,
        72.5
      ],
      [
        103.5,
        64.2
      ],
      [
        110.7,
        58.4
      ],
      [
        119.1,
        56.5
      ],
      [
        128.2,
        57.8
      ],
      [
        136.6,
        59.1
      ],
      [
        143.4,
        57.1
      ],
      [
        147.4,
        50.8
      ],
      [
        149.0,
        42.0
      ],
      [
        149.6,
        32.7
      ],
      [
        151.1,
        23.5
      ],
      [
        154.3,
        14.9
      ],
      [
        158.7,
        7.0
      ]
    ]
  },
  {
    "id": "andi_koisu",
    "hw": 0.5,
    "carveDepth": 0.44,
    "pts": [
      [
        280.0,
        397.0
      ],
      [
        283.6,
        387.6
      ],
      [
        286.0,
        378.3
      ],
      [
        286.9,
        368.9
      ],
      [
        286.9,
        359.6
      ],
      [
        286.0,
        350.3
      ],
      [
        283.9,
        340.9
      ],
      [
        281.3,
        331.6
      ],
      [
        278.7,
        322.2
      ],
      [
        276.2,
        312.9
      ],
      [
        275.3,
        303.6
      ],
      [
        278.0,
        294.2
      ],
      [
        283.4,
        284.9
      ],
      [
        288.8,
        275.5
      ],
      [
        292.4,
        266.2
      ],
      [
        294.9,
        256.9
      ],
      [
        298.2,
        247.5
      ],
      [
        303.8,
        238.3
      ],
      [
        311.2,
        229.7
      ],
      [
        319.7,
        222.0
      ],
      [
        328.3,
        215.1
      ],
      [
        336.6,
        209.4
      ],
      [
        344.2,
        205.3
      ],
      [
        349.1,
        202.7
      ],
      [
        350.1,
        200.1
      ],
      [
        350.3,
        195.4
      ],
      [
        353.9,
        188.3
      ],
      [
        361.1,
        179.8
      ],
      [
        369.4,
        171.6
      ],
      [
        378.1,
        165.2
      ],
      [
        387.3,
        160.5
      ],
      [
        396.5,
        156.6
      ],
      [
        404.7,
        153.7
      ],
      [
        409.8,
        152.4
      ],
      [
        410.8,
        150.8
      ],
      [
        410.8,
        146.4
      ],
      [
        413.9,
        139.2
      ],
      [
        419.7,
        130.6
      ],
      [
        425.2,
        121.4
      ],
      [
        428.8,
        112.1
      ],
      [
        429.5,
        103.0
      ],
      [
        426.6,
        95.7
      ],
      [
        420.7,
        92.5
      ],
      [
        415.2,
        93.1
      ],
      [
        412.0,
        93.4
      ],
      [
        408.9,
        91.2
      ],
      [
        402.9,
        88.6
      ],
      [
        394.5,
        86.7
      ],
      [
        386.5,
        83.8
      ],
      [
        381.5,
        78.1
      ],
      [
        380.2,
        69.9
      ],
      [
        380.8,
        60.7
      ],
      [
        381.1,
        51.4
      ],
      [
        380.2,
        42.0
      ],
      [
        378.9,
        32.7
      ],
      [
        378.0,
        23.6
      ],
      [
        377.1,
        15.8
      ],
      [
        375.7,
        9.3
      ]
    ]
  },
  {
    "id": "avar_koisu",
    "hw": 0.44,
    "carveDepth": 0.4,
    "pts": [
      [
        401.3,
        448.3
      ],
      [
        397.7,
        439.7
      ],
      [
        395.5,
        431.2
      ],
      [
        395.1,
        422.5
      ],
      [
        395.2,
        413.3
      ],
      [
        394.8,
        404.0
      ],
      [
        393.8,
        394.6
      ],
      [
        393.0,
        385.6
      ],
      [
        394.2,
        377.7
      ],
      [
        398.3,
        371.4
      ],
      [
        402.9,
        366.6
      ],
      [
        403.7,
        364.1
      ],
      [
        399.4,
        363.5
      ],
      [
        393.9,
        361.1
      ],
      [
        390.1,
        354.5
      ],
      [
        388.1,
        345.6
      ],
      [
        386.6,
        336.2
      ],
      [
        385.0,
        326.9
      ],
      [
        383.7,
        317.6
      ],
      [
        384.0,
        308.2
      ],
      [
        386.9,
        298.9
      ],
      [
        392.3,
        289.7
      ],
      [
        399.1,
        280.9
      ],
      [
        406.9,
        272.8
      ],
      [
        415.5,
        265.5
      ],
      [
        424.7,
        259.6
      ],
      [
        434.0,
        255.5
      ],
      [
        443.2,
        252.9
      ],
      [
        451.4,
        250.3
      ],
      [
        457.0,
        245.5
      ],
      [
        460.1,
        237.9
      ],
      [
        462.6,
        228.8
      ],
      [
        466.4,
        219.5
      ],
      [
        470.3,
        210.3
      ],
      [
        471.3,
        201.7
      ],
      [
        468.4,
        194.4
      ],
      [
        462.6,
        189.4
      ],
      [
        455.3,
        186.7
      ],
      [
        448.6,
        183.7
      ],
      [
        442.8,
        179.5
      ],
      [
        435.8,
        175.6
      ],
      [
        427.7,
        172.4
      ],
      [
        421.8,
        168.0
      ],
      [
        419.0,
        161.6
      ],
      [
        417.7,
        154.1
      ]
    ]
  },
  {
    "id": "kara_koisu",
    "hw": 0.4,
    "carveDepth": 0.38,
    "pts": [
      [
        520.3,
        401.6
      ],
      [
        523.8,
        392.3
      ],
      [
        525.6,
        382.9
      ],
      [
        525.3,
        373.6
      ],
      [
        523.5,
        364.3
      ],
      [
        521.2,
        354.9
      ],
      [
        519.6,
        345.6
      ],
      [
        519.0,
        336.2
      ],
      [
        519.0,
        327.0
      ],
      [
        520.8,
        318.4
      ],
      [
        525.0,
        310.6
      ],
      [
        528.9,
        302.7
      ],
      [
        528.8,
        294.2
      ],
      [
        524.4,
        285.6
      ],
      [
        519.3,
        277.1
      ],
      [
        515.4,
        268.4
      ],
      [
        512.0,
        259.2
      ],
      [
        510.6,
        249.8
      ],
      [
        512.2,
        240.5
      ],
      [
        514.5,
        231.2
      ],
      [
        515.2,
        222.0
      ],
      [
        513.6,
        213.9
      ],
      [
        509.0,
        208.8
      ],
      [
        501.4,
        206.8
      ],
      [
        492.3,
        206.2
      ],
      [
        483.1,
        206.8
      ],
      [
        474.8,
        209.4
      ],
      [
        468.6,
        213.4
      ],
      [
        464.3,
        217.2
      ]
    ]
  },
  {
    "id": "kazikumukh_koisu",
    "hw": 0.36,
    "carveDepth": 0.34,
    "pts": [
      [
        627.7,
        343.2
      ],
      [
        628.4,
        333.9
      ],
      [
        628.2,
        324.6
      ],
      [
        627.8,
        315.2
      ],
      [
        627.5,
        305.9
      ],
      [
        626.8,
        296.5
      ],
      [
        624.9,
        287.2
      ],
      [
        621.5,
        277.9
      ],
      [
        617.5,
        268.5
      ],
      [
        614.0,
        259.2
      ],
      [
        611.5,
        249.8
      ],
      [
        609.3,
        240.9
      ],
      [
        606.1,
        233.4
      ],
      [
        601.6,
        226.6
      ],
      [
        596.6,
        219.5
      ],
      [
        590.8,
        212.9
      ],
      [
        583.0,
        209.0
      ],
      [
        574.0,
        207.2
      ],
      [
        564.7,
        206.2
      ],
      [
        555.3,
        205.6
      ],
      [
        546.0,
        205.6
      ],
      [
        536.7,
        206.2
      ],
      [
        527.3,
        206.9
      ],
      [
        518.3,
        207.1
      ],
      [
        510.4,
        207.1
      ],
      [
        504.0,
        207.8
      ]
    ]
  }
];

const DAGESTAN_SRTM_DELTA_B64 =
  'gADW9hgB/v0LEP74FPPZJ9jg8wD+AQnv/vz+BfgO//IFBP79FQko2/H9/v79//36APoF+QD1BfH8+Pv+//v7AgX9BPoAAvL3/v//AP0G+wYD/fr+/f3//v8A/gABAAACAAECAgICBAQDBAMB/wMAAP7/AQIA+wb7CQUBAv8D//4EAP8EAgEBAAH+/v39//39/f3+/Pz+/f38/wD/AgEC+wL8AwYDAQABAAYGBAUECxIJDhX/EA4T0eH5+wMABf0X+QIlExDuMgLlBQnNFgvo//8JDg/x6P/26PLx8PT3+/3+/f79/v7+/gAA/v37/QECAQAAAP7////3/f8D+/3//v///v8A///+AP8A//8AAP8A//0AAP8A/wAAAP8A/wAA/wAAAP8AAP8AAAAA//8AgADDExIS9fHzDArpFfwEE/Do/PMC/AXy8voDAvcM//YHDuwGFyDg4Pr9/f/+AP7+/v/8+/36//f7+vz4APcA/QMB/gb/8AL//QAE/f0HCAMF/f32+/z6/////wD/AQABAQIBAwIDBAQDBAMB/gUA/gH/AAIA+wQBBAkCAf///gL+Bf8EAwABAv3//f/+/v39/P39/P39/v39/v4AAgIBAf37AQcDAQEBAgsFAwwECgsNJC/w4fD1+fsMGgX35RtE7Q4eFgP8Defu8fYP/foKDAD/AvX/AwDz7e7q6OX3+PL4/f7+/f3/AQH//f/+/f78AgAA///+//j8Cv3+/vv4/f//////AP/+AP//AP8A/wAB//v/AQD/AP8AAAD/AP8AAP8AAAAA/wAA/wAA//8AgADTCiUO2eb7EAru9RzyDyL7EfLsAPMB5/AGBfAV9Q4V++oV/N/m9fr8/gD+///++wP3/f/5/vv7+vn6AP///gAA/AD+/wP7AQMA/Qj3GA/9/ff49vn6+/7/AP8AAQABAQEBAwMDBQQEAwQC/AYA/v8AAwEAAAABAQ0C////AAH+AAQDAwEBAP/8AP/9/vz9/P38/fz9/v79/wAAAQEDAv78+AEBAQMKBQkICw0HGCYS6+b1/gn9BCMbHOELygwuMiMTC/P05/r39fsE9fL05+f5A/7z/w76AjH34dbuJO34DvLz+fn6/f79/fz8/v7+/v4A//7+//UM//7+/vz7+/n9/wD///////8A/wD/AQD////7AAEAAP8AAP8AAP8A/wAA/wAAAAD//wAA/wAAgADfJvT7+vTfCwf67R7qEwETHvAP9gT4C+7zD/j/8P78DfDq+uzx+Pr9/////wD9+gP5/v36/vr1/AD9Av//AAD9/AH//f0EAAEAAwX2Iyvq/PD39Pj59P3///8AAAEBAQIBAwMDBAUFBAMC/wT+AAACAgEBAAH+AQ4B/AACAv/+AAQCBAL/AP/+//79/f38/P38/fz//v7/AAEAAAIBBAX0+vcCAAULCgsVCCIi4e35AQcSD+wU+SkiFg/P7g8qLxvm6Pb+3+oH++jr9/r89fwADgj79vT5+/j7+hRDR+vd6AIH8N7v9PT8+/r5+vkAAP/+/P789Q0A/v7+/v7+/Pv7+P3//wD//wD/AAD+/wD/Af/+/QAAAP8AAAAA/wD/AP8AAAD/AAD/AP8AAP8AgADqBvMICN75+AoO5P0M9wAZ/QcJ6BD7GOfyEuwG/fX8BvboA/T2+Pv9//8A/v/++wH9/Pv8/vb8//z/BP4A/vz///8B/gX9/wMAAwD0LTkE8+no8vb4+fT6//8BAAAAAQMBBAIDBAUGBAMCBAH+AQIBAgIAAv/7ABIA+AYBAf8A/wICBAP/AP7///39/P38/f39/P8B/QD+AAIAAAMDBgTp9voAAA4QCBMeB+f1Aw8WHhPx5hweFhQ5GufY3gsbF/zy8ffx5+rt9/z/+/4AGQIADgkDA+7x9vYDCgb9//oB+w0KFv7z9PXs6ff38vj+B/719Pz68xYA/f37/f7+/f79//f2/f//AP//AP///wD/AAAAAPz9AAEAAf8AAP8A/wAA/wAAAP8A/wAA/wD/gAEI3/EdAe3f9goW8eca6g/5CQfxBBL0DOzzBfj5APcDAfkC9Pr4+P3+/QEA/v/+/f3+/Pv7//n///z/BPoE+wD+//4AAgL//wIAAvkJLyI89djb7fP18vb7+v8AAQAAAgICAwMDAwYGBQT/B/8BAgICAwIB/wD2Ff/6AQr+/wL//gABBQEB/////v39/P79/v39/f8D/v3/AQMBAgUEBPD0+vf5CRIMIhHb+AQQFR0WC/38AxwWKzYdC93TDv739fPs3uv4Afz7+PsBCwAAFv3/AQL7//v3+fsEBf779/T29fj9AgINDhwK/vTq3vn88Qn84O/9EAD+/v0A/f7+/v/+/f78+v37/P3+AAD+//4BAP8A//3//QEAAAEA/wD/AAD/AAD/AAD/AP8AAAD/gADtCN0O+gX86/QK/e4GBO//E/QGAQD3/v74+Qr4//v9Af789QL6+P/+/QH/AP3//fz++/39+wD/APsD+/8B//4A//7/Bv7//gMAB/UVKwhOB+He4fHy6/T6Avr8AP8BAQECBAIEAwYFBgX/BwAEAgIEAwIB/fETCP7yEgH6Bv/6AgMA/wMCAP///fz+/vz//v0A/gED/P//AQUEAQUHAd31///vER4N7foKFBcR9gcNIjUQ4g8rKxAA8fvt4u3t+gH///f57/IEDQoD+AIF/Pv58+/2/fn5+Pz9AP77/QH//v/5/vf/BAoFCPsbErvk9//6AwoJ+v78/f4A/wD//AD//v3/+vz8/vz7/f4B/v7+AgIAEQTz8f7+/v7/AQAAAP8A/wAA/wD/AP8AAAD/gADn/wPiAwX7+Oka9e4DCO76C/oS6f4F+gQB7Ar5//v5BgD7/P76+/3//gD/AP7+/vz7/f/9/v/+/v8A/v8AAP7///8ABf0B/QMA/P0VGyIaA/wU6OTd7+8E+vv7//wBAQADAwMEBAQGBgMFBAAHAwUFAQH87wwR/u8SBf/7BfgEAgIB+QUCAP3//P8B/fwBAP///gQAAP7//wgKAwLq6vv/+P39BAIOAxYVCe8JDyc8DygN6w8gD/fW+Qr48PYO/fby9Pj9+QcA+gD/9vXy9fb2//8A/fv9/AUB9vb9/Pz7AQsF8Pj59f79AQP19QAXKdwS8/z9BfT2+AIC/gH6AP3//v/9/v/7/vr8/P78Af3//gIBAgUB+wD68vz+AQEAAP//AAD/AP8AAP8A/wAAgADt6Ar65wMM5/4L/fvtAwnpCQABAu4I9QAK8v0A/f74BgD7APn8/f3//wD/AP7+/vz9/P4A//4A/v0A//8A//7/AAD/Bf78AgABAfoNFR0aAQQLFQDR2e//+fn4/f3/Af4DAwMGBAQGBgMDBAcHBAUDAf/v+h8D9/IZAfz7AwUAAAL++AMD/v79AwL8/f8CAgD/AQIBAv3//wsS8N4C/v/x7f0AAQ0VCggL8BQUOywJ6TUJAQXj/OnsBhXBEyYn//f3+P779/r+/Pj95PL+Cf3/+AIfCP/38evs+vwB/gf5+wPx+QAD/vz49Pb5/AkJH0QY/+zN5gT6CPT0AgT5+Pf5/v78/f3+AP39+/v8/f7+/wD/AgT9+/v8APv8+QD//wAAAP8A/wAAAP8A/wD/gAD07usE+PEZ6PAABAL19Qb99Qz0DPzwAQH7BvEG+AH6BP/7Avj8//79AQD+Af7+//r+//79AgD++wH/AP8A//7//wIDAPz+AQT+//0HDhgc/wv6FBfv3uT2+vf4/vv//v4BBQIIBQQFBwf8Aw4GBAUE/fnmJQn65B0J/vIK+AIOAP8A8QQA/f8EA/79AgABAgQBBfkMBPf9AhT6zw4O+g3B7/8ABgwEEQIPDh82Egq0HwkJBfMLAtz6/PkiIwMIEAAQ/+/1+Pn7/+f2FQoJBvsOB/sH7O/l7xLvBPgB+fn59vn5+v39//759vb2/ggOEAMpIzL10/cX8jroBPfUE9j23/H2+PkAAvz7+wH++vz9AxcPCvjU8fz7//39/P78/v8AAf8A/wAA/wD/AP8AgADt9fbtB+oIBfDy/QsC8PYH9/oBCQX19AH7Avv9/QD+Af7+//j8/wD+AP7/AwD9/f/9/v/+Av//+wH/AAD///7//wIDAPoBAwP9//4EBg0TAhkDERr79uHq9vH1A/r+/v7+BgMHBQUHBwn4AhQEBQQA/eUMI/nn/iIA+PMU9gQK///z+QX+/wcAAP4CBf8CAQwF+wgG/AEBAfHbBxom5LDsAP0CDREIBg0u+xsuA7btBBYP6QMB/gb9+v4LBxED9Q8L+yEeCwLuyRIVHAsM/A4Q6tTb6/IeGxHk+Pb56PHz/QAAAwcHAv798OTn8RIADhkPChcdIfwQEQMh+wr08QT4z/qoD9vq+Pr4+f0A+vwCHR8mEPzV2svx/f39/voB/P7/AAAA/wAA//8AAP8AgADUBQLq+fr4Awny9PwFBvD3Bfn7C/8A9fYD9//+//8A/v/9/f7+/gD///////8A//7+/wD+AP8A/f8B/gH+//////4EAvoFAgD9/v0CBQgICAcdDAIHGN/+7+n3//v8//8CBAcJ/wQIBAT1EBMDAwL6+toyC/LgFhkB+voN6RMJ/f/q/wP/CwEA/gIHAgECBw/+BgsC/ujl7P4VGvjS5vD7/fkADBwdKin+AQbkzvwA/wX+AgEJA/4G+AP9BQICCg0HHRshAvLNHCAtCQEY/Ojl7efdBQ4HAe3mC/j17/b8+wQJAQb88+r4CODt//oLDBkS9xAPBPD7EAsZAx3xDhMNGB61ADXbscb9/RPT+vEW/xFgPePn3sLF3fz+/fv8/v8B/v4A/wAAAP8A/wAAgADV8gf+8Pn8+QwA9PP8Cv/19AjzBAED8vr//f/+/v////7//wH/APz//v7+/wAA/v///AH/AAD/Af7/////AP0A//8D/f8HAf/++gABAwMCDQcQFQQcEvL+2vL9+vv9AQECCAT/BwcG/u0GIQwDAff88OY9+vLiMQz2+gr/5RAS//zeBwMNBAACAAYIAgMCEQn9DhLe3vDwEwrn4PTx+gz+7/gBDhwhIgj/yAvu/wj7CPkGBQUEAwD5BAoGCA0KCAsABwQVAvb+AAcGFBEQE/fh8fQTI/f37vP27vH08+zx9/v9/QP4+fr9//z//vj+AAIEAwUGBQYFCAwGBgQIB/0OGRbrLhY8x5v2N9fEAfXuGAdEed7X3ujkqtT5/Pv5/gD//wH+AP8A/wD/AAAAgADd6/YI//D8+f0M/PL3/Qr49f3++//7/QD+AAH7AP7///4A/wQBAPv++/z+////AP7//QD///8F/v///wD//v///wAD//4EAv/7/f8DAQT/BgQNDR8KB/sZ6ukA8vkDBAXvGwP8Bgj//tMfGhIC/vT33hsn8O7oOAj+5xnt8xUHB/3XCQoNAwICBgcJBP0EFgcIE9D15/YN8tfv8/oNFe/1/vDzBwgMCgL/BAABBgj9BAv+AAL+BPonEQYKBxgRCwQLAv4BAf8EEwUDFA8EAPkB+vXs8u7p7vb28/j2+Pb3+vz/APr//v/48fz/+gIDAf8A/gQDAwMDAgYEBwYEBgQFBwUFDRMMLvvtFzup6d7k0R8iOXDoxtng3bva6/f8Afv+Af8A/v8A/wD/AAAAgADU+vD6DfP0A/UADvfz+v4G9/n8/fr+////BQcB+gTzAwP+AAUO+PT0/fv6//7/Af7///7/AAD/AAP+/wD//gD+/wECAP8BAQD7//4BBAIDAQQDCRQUEQ4H/+70APL1HAbkJPgNAAr189AuGBT+8/L13yoT9tcmGwb67hPqCgkGAuzmDQwJBwQCBw8HBfYZEQUJyennBRDx0e/1BxAi7Ajw3OIABwYCBgYKAvsFB/z+AgECAwUEBAcKEBgWERYREw/+/QT0+v8DFhUPEg4VANzh5uPk8e379ff4+/r8+v37/f39/f39AP/3+wL8+xH2+/8ABwL8AAECAwMFAwQEBQUFBAUGBggECRAzQhANtw3fqdog/CM2NfXS3ObRz8D1/f7//wD/AP/+AP8AAP8AgADOAvPyAQfy9wL2CQX29vn/CwD66/wCAQcBAhoT2CPVCgr+6x4N6On6+vj5+/7/AP3//wD//wAAAAL//wAA/QD//gAABAAA//78Av8BAgAEAgIDAwcMDBQRD/74APv5EwP1Fvz6DgD43+I5Axj/6/Dv5TEL8/IXEw7t9BfhFRAEANP6EAcNDgYBDw4K9wkkA/HR5AQFE8jZ8QENBDPoAN/k6PgCCwMEBRIA8P4ABQMHBgcEAAIDAwIFCAoIFQ0JAwIM/v0BFB8cERw5BfLq6eTi4fYN3/Xw9xcF4PP2/AL49fr8+v7+AwkP7PL6EAEC9v0C/f0AAf4BAgMDBwsDAvwECAkIAwYJBAEKIh4jMNostu+/7RnWBA4hOuTgxsPA9vv//gD+AP///wEB//0AgADFAAHx9gr98/r9ABD6+PT7DgHq9wv9/gQDCA0YAPPzDBPS/RQO2fEFAvb59vn//v4A/wH+AAD/AAAB/wD+Af/+/wD/BPsG/v77A/8BAgECAwMCAwMDBwwXDwUNCQD5DfMBFQsV9gPexwM0FQzs7eML2S4L7foWFwv39wrmDxEK9Nr5GAQWCgsABBsQ9Bgb3NboEAn4weL2Bg0j+xPX4AD18uv8CQUBAAP9CA4SDgn3C/7/CPgAAAACBQEDBQcDCQ3/BhYqJiAhJP7z5urs9fsJIvzzyeggDc3g+hQP4dnw9/r7Af8CCBIK4Oz+BwkCAPn9+QAB/wAA/wMHBwkICPr8AxAGBg8GCwIFBRv2/fQKJEK+FqTT5vn/BB9azMyx3vX8//////7///8AAAL8gAC4Awn38/wN9/b5/AcL9/7z+QPzARLvEPkIABAmA/DsDf7u8wz77P4HAfTz9/X7/v8B/wD9AQD/AAAAAAH+AAD9AAD/Av4E/f/8AwAAAQIBAgQDAgIDBQUJDBMU/BQOFO0NBhQY+unPzg0rJfre5BP27BAR6wQSFQ3yAgXsDwgN5eQFGAAZAg8EDBkT/Cbpy+cQHOav6fwMCh8f7svd8v76+PH+AQQDCR4LGRAOBgT4APkE8QID//kH/gIBBAj7AgkHDCQxKi79Afn97Orq8f8CDB4GAP77+/HHM9/lzNr5+gAA/v7/AgkL8usBBgcCA/f4Af//AQAFBgkI/xMM/gITAuQMEg0YCyrXGjEO0M7Z+SBSHaoBxszm6QD3AvX73vf1///+/v7+/gD//wH/gAC0/QgD9PcIBvn39vwICf/v9fr9EQH2DggC+gQl+Qb+/uvpChDx/vUS6PD3+fb7//4AAP8AAAH//wD/Av8A/////wD//gEEAfsAAf8AAgEBAwECBQIDAwQFBwMXBAAZHhwc/hEJ9eXLwiEmK+DeBf/62BcX4SAJDRLoDPX/FAMH1fETE/wm/g4RACEH/xPD6RsRC5LjBQwIHA/N4+z49/vz/f7z/gkMCBIGDQobGQP2FQP39PkQ8Qf7/gT6BQMFDfb8ExEmHQb1/AIcEOjt8voBHgARAf/+EQTVwdvo8vn/AP38/QAA+/wA/AL+BgYCAvwA9QEBAAAFDQ8HCwsZDeAp9P0yGNkCQuQ2DywF18S+zesUGyAdH8vVrePlCPzf+/339v/9/f79/////gEAgAC59QUL9fMJAf/99fQDBQ7t7f4GCwr1CQ/7CRT9+/gI+QvnDA0B8vv+4/L6+uz9AP0B/wAAAAH/AP8B//4CAf3//wD+AAMAAf3/Av8BAAEBAgIEAgMEAwQDBQcGCQ0DFBAaHyQG+9fStCkeMejfDfTo+fwh3ysMARToFPQBCg0A0fgVHPQZFQcfBAMiB9faBS0Aptz/Df8ZJLAC0Pz/7e8IA/jw/AAJCBoX/QMBBwoTDRYJAQD6A/74BvgIFfb3BfED/g0MDQkEAwIDBRf+8vP6/gH7/gz+CBqv2vj7/wQB/ALu+fz9/wD/AgIBAAcDA/L5AAECBQADEBIUJAsFFwzVIRriKybwGScYARfxBBLJua7N5AH/Iu7v/NQBDN7t8u4B+Pr6/v3+//7//wD/gAC68wEM+PIBCvgC/vP4Bgfs+gULBQj6EQ8E/v4J6PwM+Qz3BfQE8grvAvP77ev9AP0B/gIAAAAA/gEAAP0D/v///wD/AAAAAAD/A/8AAAECAQMDAgQEBAYGBgMLCAoDAwwJGTUSCd3HuyopGtUDAOcI+eAq4TQPCv3tFP79ARP31/YeHPsNJQ4DFxIZ7r8TJAey4vUGDgEV3/zJ5/Hr+Rj48Pf28goNBxYCCw4YDgoK/hsN+w/3BAX36BoIBPb96Qn9/wQDBAT7/AIBAAckE/bw+fz7+Pn3BgDi9/7/BPD9IdXj+v///wAAAQMCAwEBAQf/+vsb6f0ECRQYIisfChgD6/4a/gQwDe374gb6+Rb+ANwU19XZq+8G5+clXhqx0ufq7fj29/z//v7//wAAgAC19AQGAu77BwT3BAH29AT0BgMEEgkPD/fzCPcD6/oO9w3tBAAJ6g7vCgMB1O3//v8A/wIAAAH+/wEAAf0C/gH//gD//wD/A///AgAAAAL+AwQCBAMEBQcGBgUOBw4H/B0LGfIhFNvYtys9/d0S+/L+890r5DAKEQrhGv/2BQ302fonHOwpCiX0/REc6vgVTcrI7PETAMbgFtH35fAHEfD7+ezw/foUDRgAExkcBAkR+hkTDwEF9e/66RgMBvnuDgcKAfzz9PT2+Pv+AQYQBw0JDxQE7vHx7PX0+P74DwDR8Pv////+/wACAQUDBQIA/gQG/AgCDeL9BA0eHR4r+SXqFh/mEBEQANze+vrkCwcACg4B9+Hh38rW8/YXOE0dsdnY3O3u+fP+/v39////gACs+Aj/BfX3/wj+/AH/8f7+EPQFEBQO+v/wCfEF9vQF/A/x/gEE9Qv5+QsF0fL+/gH/AQEB/wH///8CAP0C/gEA/QAA/wAAAv8BAAAAAAD/AgUDAwQDBgcHBwQRBRQL/BcTC/wSCu/MvS8tA+4U6ATz9d0o5SYMGA7nGvcB/wvu2Q0hGP/2LBIm+/AUAB736NzuCf3l7sX/B8j0+vkN8Pn69vwG9/UODBH9Cg0HCQ0IDQ8OFCwa8en9/f8PG/kCHQf26vr77uzy8vf4/AEAAwQGDRMSLgj07PT9AfoFtdz1/gAAAP4ABf4CBQEDFxD95/UFAgAICPbv/wQKDA8UDBAAExoA8Sv1Lwe77/QD+O4aAdD9GREB5+PVyx3oEiAhMh+S3tzo7/T7+fv8/v7/gACjCgD2BQL0+Qf/+P76/f8LCu8OBwsL+v37/vf+Ce79AQj9+P8M8Ar5/AX34vn//gABAQEAAAD+Af8BAAD//wD///8AAP8BAgAC/gAAAP4BAgMEBAMGBAoECwYOCg4Y9gUi+R4CDN7Zxh83+vEZ2hPx7tsv4jYGEw/kGQED/wTa6A4iGAvuBxscGRUPC6bw9vcSA8/jA/Hb8fT59v4A+v0GAfb76QcRDAgPCw4QDPckFAoZGi384P8K+BEDFQQEBuru5+rv9voB9PT09/0AAAICAwcSIwwTD/by1dfp8fkAAQABAAMCCQMIBgT0Fgry9gEH6wIB+/n9/wIFBQYGBwoICBMMFgcPHBYG39Xl6wL1+AUD9tsFBuLq9/8tAwMtQBnkw8nO5fDz+vr2/P//gACfDwPz+Qby/gL9/f3/AQIO9v0DEQ4H7v8C9wPzDffyAwz89f4K8Qr6+RDw4/3//wAD/wIA/wD//wAB/AX+//8A/gH/AAEBAQAC/gAA//4CAgIDBgQEBQkJBw0KBR0KDe8lCAoHA+3TvCYyCvAP5RHr5+Qu4EML9B3++hAB8wzP7xYPBREY5w0dICcZw9Xk7CH82fTd++zz/Pb6C/8X8Q0D0/D47hQMExQMFh4x5t4mOB4PIA/62x3nCCkGD/Lu5ejm5fHy9ff6Afb3+ff8/gEAAgIFCQcE+fD1+Pf5/gECAgEBBAcQDAwO/fT1+RAF6vn8AP/2/vz//wECAwUHBg4JCQ4GAAIQGzIK79HY8vHz9/n8+Pz6+SUMCufQDiU4MB/HxdnfAtnk8/P4+/z8gACeDfrz//3+AP7+Af8BAgYCA/sBChL6+P75+wruAgbvAwcA8gAK9AQB9RLf9v/+AAQB/gAAAv/+/wAC/AT///4AAAD+AAECAQAC/gH///4CAgMCBgQFAxAKBAkY9h4KGOcgEAEHEO7BvjMz9Qj3/w3g2gQh3zgV+gsQ6hoA9QzG9A0UEwQbBPsAIhkD2uz06d8Q3+n1/ff69wMJ/ggVB9vyBvXn5R4YNiUHFAgk7eTtTTQpKwfS8x4ED/bd9/IG5eXo6Ov29fr5/P749/3+9vwAAAABAv3/+v37/QD/AAIBAwIHAwUJDwkB+/39BA4D5/UG/Ov8/gD/AAABDQgrEwcE9u3+FBIABv0PF+Xm+fj+6vzp9Pz5BBsECv/m6BAeNlHw4tHWC+bYvPLw8vr/gACcAPz9/wAE/vz/AAn/+gn9DPX/Dwjy+vz9/wjz/AnxAgQC8gAJ9AUB9g7g/P0CBQAB//0B/gL+//8D/gP+//4B/wH+AQEBAgEA/wD//gABAwIEAAYGCCEEEQQCBQIiHdcoEwUAEdHZuDg95RToE/7dzikP3TYWCwgM5hoG7wvBARH9FRYjEv7yAhMNAf3u2tbi6/nx9vf/AgURHBXu3B/8+dvl2zkNExcqSfMl9eb/Gy0dGhbzGt7s7dP8APXqB//f5u32/Pv7/P37+Pv/+P7+//7+////A//9/wH//wIDAgMCBAcPDgv7+fv9AgP59AsCCAUH8gYLDPgNBjAlIQwVvtnVCigVBxj8//n+8v79EuTP3h8rufEdEQfw4PL3KTAfztTtEePUAcTh8vf6gACZ/gEE+gIN//v++A74/wf9CvABDgj49/b8/wL8+QP5AwAF8gAH9QUC9v/x/P8HAQEC//sBAf3///8D/wIA/v4B//8AAAMBAgAA/wH+//8BAwQDBAEDDTb2AyX9+f0dGtM/AxP6/ejHvUAwAgTwFOHP7kvu1UMFH/ka4hAN9f7D/RcGBiYQDRzrCvjq+frX8Qjo4uz9/gYTEvQkLvTOBCvMDBfF2oABGgbzMw0iBBv48AEpER0J8eXp69Ls3QUM9vEJ8vHq9vf+/fz++/75+wD9/gL9/QH//wMA/f0C//4DAgMHCQb8/AkSEgEC9fIDAO8FAgkIBQIFBgQGBgYJFRUZCQ8UFrrBQWj+y8sA8v0FIzXo+d3n3hgB9hIB/QAI+vzm/yjb9PLS2vHx4tfs8vaAAJoCABD7/AMD8wX5D+0M/Qr+9P0QEvft/vb4/fz+/v8BAAP4/wX4BAD59/v5BgcCAQIA9wAB/gD+/gT/Av3/AAD//wEAAgICAf8A/////wEEBAYFBf0PNvfqRwgA5yP/2UznM/v4z+C7NDkF/gH8xt8kNeLUORYT/Rj1Dwjy+ML7FCL2/xwQEiD/6sTg8/H7/O7+AiEF6Bol0iEtGdYYDwoItIAAZUiAAVgt4PsnGgQPAPkPGQoF5OvGB+/QzRIZ7vHxBe3w9/f8/v/+/v3+/gIHAPkC/wX9AAD9/f/+AgECAgX7EQH5+AUNHAP59wUF6/3+9wcLEwUeCA0JCP/89hsQFhkMAwEFzwMONdkD6c/Y/CYIHOT67fLv/P4238bxA/4x5R4Z7Pj15unL9BPrzN77gACmDvAU6f8I+wH2BwfyEvcM+PMHCBDu+/b4+v4B/Pz8/QD+/gABAAP5+vn6AA8CAgIHAO0AAP0E/f4D/wH9AP8AAP8AAgICAQH/AAH+/gABAwYFCQT5DkD94CBG7eog9Pci+g0LAve5wi8aNPIK2c8IITLV1Tge/xwL+AAW7/W9+C0o7gD4GxwyxuHVBej07AIB+wMQCiD4RswnOAn9BQoH2oAAyqg+SoABrAoL+gz4EBXy5+ID7+bi0w3u9NkYCPf58Pj2+fn7/f0CAwQPAPoFCQkFAwD+8vcK//3zDgEBAf/7+vkBAAv6Iv76/QPsBBH88Pj+HCERCRIFAwMDE/oNFwkI9hMF4OEfFxL5A8LjBvu+Fw38/dzz/PsLFCYS18Xd5wMEFife9wEJ497r8xb/vIAAt+8E/gb0Df379A74Aw38/fX9AhIF8vL9+/4CBff+9vv9/f/+/QIC/vj7/AERBAUHG+jl/wD9Dfr8//8B/v0BAP8BAQECAQECAP8A//4ABAQBBgwG/gdCBOwIT9QGJ/L4Fw//BQbqsMcyJzEC4crjPgYs081E/xsaAgYCEvntt/xAJOjkFwtBB6nsCuTr6gAP5AgYFhci/RsQFBohAP/2/ciAANvH3YAA/3xsAvcHEfPh3tndA9vq3Ogb+u4HFvP29gL59/j3+gIHBQYRBAkPEQwEEP3Y+RP+5+4QAPr7+vr8C/MSBxcF/vrz+/kCDfwAAe33/QogCwIACwIFCQMJBg4ZAwcMB9kHIwH11hH//sbu/gfXCwPs8f0BFvwYJC/n67fV5+oHD+z1APoA5QbwJ/CAALjsEPUB/gj88gER7wgFA/P8BfgQDOoB9/76CgTqBP7++fb8/f8A/f/++/sKCwwEDSHm1f0AFgD+9Pf/AAD//gAAAQEBAgICAAAA/wD9AgUCBQULCwP6TQP08E7kGBj75g4u+wAL1KjmIzU08sDQFjcBIdHSJyMd+CUH3iAK2cf1JAoW/BEmHOHKANfp9+8VAu0OIgZBGhsUEAwPAuz2EAG5i4UkdF+AAgH++/7i3ufi0uv42+bp9fr5EC/x9/jzBgbz8P0HDwgCCREOCg8VCwnZ+w0F2gMH//v5+fj69/gZ7QIcJ/vz7/f2AgT/Av739/v/AxYBBwMCEAT7AgoJCgkPFQXs6xMi/+r54vQMBLX6+gX29vn8AAQU+f0JIiPy+e7I/t3Z9/77+PcC+gHyMYAAqQUABvYHBuwGAwD4F/b3/f0EAQEG9/kE+QEG8AD8AvX3B/X/+v/9/v37/g0MCgQaGOLV/Acq7Pj77AL//gH+Af8BAgICAgABAv///gACBQEGCQkP/fFMAhDOSgQo/QLeEykL9QW7t/4uJDjZxNhDBDLy4d/vV/gs+hvoFwXZxOskLf0XCy0gpvHX6/fmAyLr/Bz2GRwvLj39+OP67ucKGaGNom5qYFzy/unh6tvm5uTr5uXw9Pv/AggICwHuB/z1DAwWCQX5EBIRFRYIAuIJCenwCv7w9Pj09/X5IQn65BRB/ezi+vj7BwP9/vr79/sA/QUHAwYMDAcIFgMACgMJDAry2BUZA/Tz4OQSEsjp+QD9Ce79/AEBCgj79QAOEQn54OMS6Q345uYpBerhHYAArgkD9AUE+fkBB/j/F/L/+gH+CAT1AP/9+BLr+AcA7/oB/QL5//r6+vz9CAcRAg8hHtbFBCwc6fft5AP+/wD+Af8BBAECAgEBAv/+/wECBQEFDQcW/OA+IxPNJTUt8/vU9UgZ4/+ruBotMiTI2OZSEDfP3d3cPyoPIvoS7x3Xv+IfHzANEUX4ur3Y7PkFGf7uGAgk4xcoNCIPAe39EemAASLL4bkROF+AAbYoBPD44dna3QH04Orp8vT7AP8ECP7++///DBES8AMOEhceHhEUB+8J/Ozv7vD18vf4+PkKLvnz4Rc06/Lz+vMGEPv9/Pn8+PkIAwL5+gYGCwMCEA4QFgIOBgID+N3jIA7j/Pvi7fn88/r8/f/9+P0AAwgLCAPl7/kMIvz3DRQL8+zi9iXW5BaAALUJBP/+BecFCv34/hT7+vcCBwID+P0I/u4V8+0H8PkDAfICCffz//IA/A4DFgcIFB7bzAQgG/7oCMwF/QH//wH/AQMCBAEAAQP//gABAgUBBhEHHPbYNiQz0/xXIAXuxwE/Gu/mtK4rITcqycX9QDgmydbmzxwsRBwBFNQt18Xm/Tg0E0Ec2KfF8PYF9hHyCiXRQBfmJjEaHgUA7wztq4nqrO/wgAEbbz79++7j4gTU4/7r7ujx5gAAA/8BDPMA/QQO+xIcGg4TDg0WLAsB+fHu7vru4vr67/T/9h4R8OoUI+v3+e78GyPuA+3v+vj9/hUMCvLv9QoGCw/9BhAQERT//fzy4/D2Evz0/AL17ez5/P8DBAL38Pf+/hMTGQDz8uTlGxT07v8NLhDo6fb96oAAygfvBQLuBAQM+v71EPoE8gMLB+0B/hDw+A7z8vj49w3x/v0N6gru9f8EBwMWDf8UHdPYCicpAtzv1QL+AAD+AAEABAIEAQIBAf//AQIDAwICGgkg8dIiJDEF0T03Isjr8kQc8+SstDcgMiHRyec/Pjiv/dre7UoRKRUU+R7grujxaTotFeXQ1OPw/vHwGfMWDvUAOAsOCj4OBQP1/vq9svanufdPIFD8UuDq4fsH7PDr6OHb+gH/Af8AAv4EA/7+CxAcAx4FJDUI9SUP/uz98b75EPPr7PT6LAnp+AYKAvzv9w33KBb93en/+v/+/wMUDAj33fgGCgkLDg8TBwkJ8+wB6vLv9/v/AAD39//9/g31AAQB+ADb/fz7AhD7+QUI7vQfDtEk8C765Pnh7IAAyxHiCADvBQsM7QX8E+8N9AQGA/P6CAvy+wj28u//9Q7rAQH+9Q/j+f0KBvsXEA8XAs3oBiUoEevT2gD+AAD/AAAABgEFAgEAAv//AwQBAwMEFBsc8NETHyg3tRwrReHGGDEh9taxtzM4Iw7KwgYcQT7e3eHq4xgmEBoEPhjUwt32dkMguP7iDPj3Duj0B/72Ke37MCr0FwMyCAHs/v4I04ABPZTE7fFG9RcuKvc+++j14eTq6gABAAAAAAAAAQAN/PYABgkRFTQP8R9BNgTg1NYCH/Xk4uvxAxMcDvQB+/r56Bb9/fwXFOnv8hT8+vkB+/0QCgrs8gT4Cg8UEAT29xAO7vL1+vH4+PkABPYEBAT0+gb76PT+/v0ACfnu+AAJBPzwAPD/AAw98xHyyfAFgADX8gQL8/MABxnyBvEV9AgCBPUM9PgU+O3+8wf57/T/+AT4CukEDdz9+w4G+RITDzDT1fgLNAMm7+i+//8K9v//AQQDAwMCAgEB/gAGAwMABQQjHhH5y/YnK0bJAD0z7bw97zf7z7K7NS085OquL/EaNyrNDOLS/SQKBxsxJ8HuwAZ0G+Xy+/cBCAgLBBAR9ecaGPYaIv0LEiME7vgCBQKiuuWV8+KxI+oL//FzPBTlje4w9AH/AAAAAAAA/wcJ8AH/AAsSFAsQRDQ89tfmBA3w2ebu9foGHh0f+OPy+PbwLfbz9f0KBfvwCxgB8+oCBv/5DBQF/QD/1v8FBgMKFRwD9/L2/Pzv8vD4+fz8/f4E+/b7/v7/+wAI/vz7/fXx/f33/Pz+/v0HOxYN89rmgADc+f4T3QIAERb3AQoBAg3tAe8G///57P8C6gr+9u4F8gr3+PcJ8O79/wwI9hINKiPK0AEFHywp4rTu//8U6wAAAAQDAwUBAgEA/wEGBgP/B/03GwUD0t8iMEPi2TZCBrlDBgEF167QMiM54rjaRyPHMCwH+ML3y1Ab+/8cE/O5B/Vh6vz7/vYGCBoL+RAuJuUQHvn0LBz5FwkG9+//AP/2s57YFuyh6eAKI93K+AAeLynZ9gD9AAABAAAA/wH+AQkAAggRFCslOzoD6fML3cj2A/Lt9wYQFSj94/X57wInFN8B9fj++/gBIhjw6P78GPzv+hAVFAHl3PUb6QMTFA777vL2AA0C+/7sCO7x8Pf8/P3+//79/QAD///8+/v+BvL19/387vsJ9B4i5/QcgADs7QAD8goAGBf9//YL7//28/QY6Ab98fIC9gEAB/L1/QIB6QcN1/r8BQYH/QkTLhPaygECLCAa564A//8F+/8BAAUDAwQBAwAB/QQJBgT/BwMcLQUF38scLD4Wzvw7N7UeJRT95YTtSRMxpdr5LTj21z494LwUuholJQETDM3eEugYCwr3/g0RFisj9OrtLyknDBf1/BoXEAb99vPxAfUF6tsGmq6fDFsN08sLBjPr7uP21QEM+vn+/wAB/wIFBxECCfgfHTcwJCH98tbZAAXw6+T8CgkXGQfi9fLqHi0D7AL+9fL18voUMQ/h+Q0BA+bnEhAKHvHX5gIu8vERBgn46vL5+QQLB/779AP98Oz4AfP7AAD8/f4EBRgA4/YG7Ar6+vvz9fX19PkCQ8T5gAD09v3/9hENGAPuA9Uh4wnrBfAW6gID7vEC+f0CBgXwAf/0+Qrs5/4ABwMEAP8XHxHc3gEBIzry3tD/Af4A/wD/AgQDBAQCAwD//wUKBwUADQUZJgYV1MwIKT9FufETQNgMGyIMxIAA0QZOLgy20QcQ/DAKBEIUrhLB/SMdMQXv1vAr5PACAAAiCf8GGyITDvndHi0THyITEQ0P+NoH5v4RA+7f26mp1wyAAcb6BeH2Ae/Q5+Xc4vIeINIK6ez8Af0i+Rr5Dv8EHhkrQR8M7dn9DNvV8Pz/FQ4LCPbx9u8H+jAa+gr27ejv9f8KGCsW+Pfp8OvzARgXEA/w4+ThFg4iDQTt7/LzCvro+PwA9gP2+fv8BgD8BQkB/Pf7A/MCEQLw7wIOB/38//fi8fDv7fj7BYAA//oH+PgXDOsG4wviCPsW2w3wBfL+/fjyA/v9BAEH/gP86Qv64vb+BAUCAwH9FBYL3u8CATUJCLf//wIB/f8AAAIDBAQEAwIBAP8GCQoGAQsUAzrxL9q/7CdARtP8+DX4JxMHEqmMClNC3qz6BCT4+jvyCTXj897EOkMcJfO23RwQDg7s+wkU6O8a/hchJxDd/hYiIRshKP7y/vH65s3i5wMi/N4g//cD7//x6c304eDo0Dgzzgzp0uT4/g4UCR4QBwTsBx4vOCcF7gnazfDtGPUKFQcD7e/rA/38BiUk/+Tu9ff98xELFwwW7vDt+wLuCQcfGgbS4e0H9A0VHQr28fX/7vcT8O0G8vL6/RgXDu8NCQQI9e7s6PcAAw/eFfwyEPz27uHg+u7p5vcD7YABEgLrDwQF5esA5xHx/vkT6gb1+gH4+fr8+f7+AgECAAMB+gDm7f79CQMCAv//DRAH4v8AASwE+9IA/gIC/f4B/wQDAgUFAwIBAf4ICQoJAQck50D+M+3A0g41PhP71jYuEgkKBJeo5kk21fLfCTAU0DVD0iUOz/zM3zAeHx0Wrf30FRokBgAQ+NUGLwnbJzkNygYkJyghFB8B8ujZEtvmARkB+eTtGv/mAtjd+eft4+udaRvKLbTr+uzw9As8EBQOAPzqHBUeKyMO6djk2AoZ+QIQCfTu7uUR+QH//hAoBOvt+v3oHAIEAxAQ8vAF/PEJDPEVGPXb4xYF/wIJEvzr/f7/9gv07vD3+w74+B0WEAgHBPry7uDxDAf6A/7nHAPmDCsd9s727uLk+PD624ABEAHUExvr6vjz7hH5+//+9QP69gP1BPf6/P7//gIBAAIJAPLm9P0GBgEDAP8ACQsE7QABASr35Pn/AP8AAP8AAAIFAwQFBAIBAQALBwkMCPwz1R8RPAe72eowOzYKwCc6DhUB36+57Cox7s0ECEQsyPxhAuQq7uq7yior9ScZ1+QT/gIlMw8Y5dXtPCrVGzAx4tHpIzIeLSID2vEE//7IKQ3+3vkZ8PADzQ7Z5uvj7oty8/Xt4gL76+vlJf4m7gkHBBoYBv4cHiIF7dTaIgr+/fvz9fHx+Bf/8QP3CwsYAeAF9ff9IQwADQbr9Av2+fcbBekVF+Ph8BQZBQIG9Oj0+goD9O73/f//9w0O4/YFERcL+vby+fsQBwj+/tQ4BgTo3gwTJgL34tH97+Lg8oAA7QzdJ/nr8//38Bb0+gHyAf0D9AH7/ff7/v4A/v8AAQIDAPLq+wMGAwICAf4ABgf++gACABX/7P7/Av//AP4AAQIFAwQFAwQAAgIOCAYLDwAk7Pw+/C3M0dgfNDEo0Ao+N/Ef2Zey+FUX67UuEuhh7tJDTuEl2OLSzfkzG+s0/eHaTuX4IwYNF/LYLioXxzo7Jebp5CVFF+4gGfj23vLSSPv52x709eT4/Nz24MWFUCXy8Q7IHOLz5QCcEAk/JhQI/v4QJQkJCA0C+M8THvzu7fDx+AHyHvL8AfETGxjw3AMF7vYTCwwLBPX1DPv6+P0X+PoMC+Tt8hgEAAf49Pf2+/39/v8GAewD/R7r7AAN8xAQCvH1+QYCBgn36wf/BQL48v8HDygOwh4H1+vW3YAA1Q/tFfjz6wQA8w/0/gD1AfsE+vv7/Pz8/f8A/v8AAAAB+fD5/wYDAwEAAgABAgX9AAACAAj6/QD+AQD+Af4BAAMFAgYFBAMBAQQQCwcIFAAb9u83CB32zdAALC9F2xYMQyQLy56o9HIFydo1K70rR9cTShPzC97WwMIkHygHJ/PGIBoJ5yAkI8jhHSsz1wA0Rxn8/oY+5RVSCir979vROQwD8AT45Qnx5OPFgAFVaR4S2fjTADS+5w39pbt6RgbSPQn59t4tFvP+/f74Gh/i5efx+v778ib2/fnuER8U4OsS/unwCQkLAwcG/wn//vT3H/f6/wPlBe8LGwf4+/r69PPz/Af+BwHrCPT5HubxABzz+wUh6QX/+vUGA//18Rn59fT8C+z3CxIlDPUE79fEgADPB/AG/fb2A/n6BQD2Af38/gD8/fr9//z8Af/+/wAAAADu+QH+BwUAAv8BAwH/BP4CAQEBAv/8AAL+/gEA/gEBAgUEBQUEBAIBBBIOCgQW/gwNAAU48xrFzOEuKkz/IPo3KRuM06jqbOna+SlLuBNZ9NFpEOc6vrm34SojMhQW/cb6KyHw1Ugq8MwUGi/zzzYjHSD2wR08+rkWRyHf8RAbDg318vr5697drqMmVAPpzRP1E8j2BwnegADo4oABcFEHxmoA+eTc6RoN+gAUGfnI8gD3APXk+h0SC+L8/SMi1vP/9OsEBggICgMLAQ39+/MC9xzmGP/x/uIYEfz3/f3z7vT7AP8RBPP6/wHmCRb97vQICP0D+Q8IAP32/Av17Qj7Fvrq7Pv+8e/9AAry8f7tAYAAxAH5Bf31/f78+wD+/P/9/v79/f77/v/+/AAA/f8A///59f8C/wcDAAD/AgMCAAIAAQECAAL//QAA//8AAAAAAQAFBwMHBQQCAAcTEAwBHPwEIwPYT/4hyLvUKzo1HCsBCzDyvKLe2Vn2zxgzS9PQYyPKNELlIKLD+skPIylMBebK+C42Acv7SBy39TsoEL0lIiYr9KohJjGzFi81/PQDISP/8N3s7NbA+9SAAWeAAfYw/e/tF/fd4/IcAIeAAN7rgAGFbNFGOvTb2doCAA0BHxPH9gzpAvPOAQbqLCDmBNYiMtXkFufuD/4JEw3yCwkP+/X4AfcZ6gUl8ebsH/jr/ff39v8C+vsC+wUN/vfx9fsFHPn47SD6A/wB9g8PBeT8Ce79Cf4GCdUE/+/mBPL1+PsT5PP7gAC//gL6/Pf8//z+/f3//f3/AP3//vz//v78AAD+/v//+ff/AgIABwEC/QIBAgMAA/8BAgEBAP/+AAL9/wAA/wACAQMHBgUGBAIEBxcQE/wh9xoWCMM6JRy50colNuc9ZRHv9+b8vNDEVtgQ8DJh/6dQPuUZJBTut+njwvk5TDobzsnaPRM3zeBNLOK5GDQp4QcfLBfR8RkcD9YuMycQAgsDFenp7NHd2NnmgAFygAH6OhD9+/78AMjgMArbgAExlnOAAddfxHbx39va9foCEQPy8xTp3+fy8Rry7BgWDOrhHB7l/Q/X/hP+ERIA8QUNFvrz/f36A/z8DBTx5Qz49Qn75/r+//3++gD/AxL/7ugF+/8XEeP0DQ78Bf/7BAr79gL98wz6CgL96RUC7/Hw9vXn+Pr6A/WAALn7//n7+/7//f/8/gD9/v4B/AD//P/9//0B/f8A/Pf+/gACAwADAwP9AQIBAwIBAAICAAEB/f8AAv0A/wAAAAIABQUGBgUGAQcLHA0a9iXoL/8XuytCELfqrvwbJixiQee25PMHxb1V1zDyECw/xwZkAhENLs7U5MDMEyQsKyb0weczLCT68fdH7sEmGR0L6CEaH9AaGB7LGRkiH0XWshTy1f0I7Ne+kUFF9/1Q/AD7BMjlOAf3gAFhi+N+ZWr/DAcJ6fX33g8M9gwI3Oze4Qso4t0CCyT46hoW2Qvx8f4CBxQY+f8CFwj5CgYK8AAI9uAfA970EP4B894C//kACur7BP0L+/X5AP72/goO/fEY/gIM/PkI9BXtAfj9FAH+/OUO8AwUBAP+Bdrb+uIE6oAAqwD6//z+/v7+/vz+AP3//wD9AP79AP3//v///vr6AAD+AQICAAQD/wABAgIBAgIBAQIBAAH9//8C/gD/AAACAQADBwYGBgUCDAYiDhr0Jeg45S65Ijcow8ynGvhAKkwnGcnQzuH14ULdP+7dKjIg10NOCvsf6NHO560fPVbPDyTyyOwwIDgF6x0X3dcmLRrgIygT4iAYAdMnGiMpAc2sm/Ti7AkqKe7OSxrTJDL9Adfy9R8f+4AByYABSoAAxCQKgAGJgAIOcObp8gH1zxX/Bw3f0d718CIWz+4FDAsI9iT42hbs/AAHBRoL/Qz9FgQOHQDw5yj79MMf++zqHwYC4/EK6PIAAvX/A/IFDfnzAv/yBu8KDQv1ABT9Cfn9Bf4C+AT5DRf9DtXzA/n9BfL35PQCFzLMCOaAAKUA+QH8//7+/QH8/AD8AP///wD//v/9//7/+vr+Af8B/gIBAgIEAf8BAQICAgEDAQEBAQEB/AD/Af4A/wEAAQIAAwcGBgYFAw4JHxUS/B7tF/0vxBg1OrKwwDYD8DdERucV1c/exQM93UMK2+44NPkLVy0C0QzE0/uoPVET/hr8ENXaHgnwMCsjJenTJRv5CBov9h0YF8oVGxUnBcO+roACzOWfKiAN2bM0NtziMzPu3vcYFv8lgAIOgAF9me7HXIABsIAChADo6RvK5iLt+trd/ejvDgIkz+z+G/Eh9x/a+xPp+QgBHB3yD/MiI+giBhThBukq1tUSBe/fEi754uQC8PcH7xDwB+kQ7BAD+wjfBAcCEAoOEg3iCfQA+QMJCt4e1iUC9+v78Rjy9Rj2+c8QG/8D/bcrgACh/v3//P7//v0A/f75/f/9BAMA//7//AD8+v3+AQAC//4F/wEBBQD/AgECAgICAgEBAgEB//0A/wH/AP8AAQIB/wQHBgYGBgIMFBoeEPEe+x79IMkPNh+6tNo2GcUcNjcU9wjk5psVSsVANdX37DNE/wYqH8fq397ZCTIMISb7BwIt0d4k/+0jFDNJ1gAs8xkWJPskJPbyFBIJNs7viUsf8dzjN8nPFRcqzvwjOt/zGPUyCYACWpCRorN3gAHGgAJnQeTaCOTnK+350vrj1/Me/xbS6gkDEA4Z/tUXFM8GCPgTJ/AeAR8y3x7jNcYk4And2xUO5ecCMfHm7+wDBQf4BwUH2tMKGQ0g+uD/Ka4EADJJ8NkOLeMN0gUoxwQU4wzsCfT97Acg/NwQ5egALe/25/ctgACe/f7//P3//v///fsA/P3+/gIG///+/fz5/gL/AP8DAf0DAAACAwABAgECAgIDAQIAAgEAAPwBAQD+AP8BAQIB/wQGBgcHBgMHGiUXE/0EIBIHBNYDMQ6q5NE9E9YOPDEatP/73r42O9MTOgv17yctPOwhEcPJ6Aj2yyIyKfnu+SQv/ev7MvfnDCdCGwgXAQg4GuYYLeEyEQ32+vyAArIHadvT7gIP4PMrEwzaGChA8dsW8iOAAq6AAe+VgADSQD2AAd2AAl5r6drq/fjzCvrqyuf53f8PHM4K/e4o7SX37x4D0gYLAgEQEhRAEy6rPwnr4RPbB+fRIQHjDekN8fb6+wr7/xEQ8/fi2SD1HwAn1u/9/9sRIAQwGMUw+fkP7QzxyBoW+BXRF/D6+PoH+QQO+O0A/AP3ygPygACa/v/+/f3///7/+v8A///7/f4I/wD9+/kA/wAC/wEBAP8CAAEBAgACAgECAwICAgEBAgAB/v0BAv//AP8BAAMAAAQGBwcHBwIFJhgi/Rj9KwAI/+3yMCqXxec+MMrjOj8E770ZyvYlVb33PUHx+RIi407wBvvc8v8Pky3jKf0QGAI2KQu8KTX8+ddHMyonCPgpKBYTIBK7TPf676+SVhvrAgn9B/4MBSraGPMaJ/H9I/2AAtmAAjibnNeOc3mAAtX65O/mHd71/NHv9OXl+BLv9PsQ7CQH6gn7I933BBkWDuQYQEUG0B7pKtUO4Q/o9rgZJeT39/D8//77AgIHEPv+19YrF+EYOvsZ3OvszgnrDvEQBBI4PO75CwHcvFsL+/LUFgTy8AUP5v8G/PH49vD13/regACY/AD//P7///79/QH+///7//wHAP7/9wD//gEC/wEAAfwFAAEBAQECAQMBAwICAgIAAgEA/vwCA/7/AP8BAgEAAQMFCAcIBgUDMwoiCRThRPYc+vjtJfXB285PMOLdHUva/Mry7Ak5OdTROBoBICvJI/n/N+0h6hWu3jD26ysdGfgIJzLBCyw+8e74GUopPiIGURsXEgqCTPXdsukMLBH/AxACAgL6CxP+Bv8KBxntCY6AAoOgso+AANldgAG8gAK6LeTd6x7t8fnf8PXP9Q0N1wL5//IGG/cE8BX+Hd4QNvzrFT4zC9JGuxcIBs4T4NvX8j0BAfX79u0NC/XoEgExDvuitSMT5DL9Cyv678bmJdY15Q76CvkXPx8RpcwwUwjFy08AGe3KEB/WD8o46wXPA/Xt7deAAJb+/v/8/v4B/foBAAAA/f7/+gb++Ab6////AwD+AgAA/gQAAQEBAQEDAgICAgICAgECAQD8+QcD/v//AAECAQAAAwYICAcIBQJCCB8dBPYMKhj48PAU1MbY3zcpKuP2S9zfEfTLHh4x5OTpEPsUNeIDFig17gYX2LE2DgH/8zUyFNkTMPYQ+DU06QX6EoADFjRF3GA3E+eiNtjL6QUGGyn3GfAf9A/gFwn+7Rr08BIL44ADLYACkaDFg4AA3niAAfKAAt0L7OTpLu/y8+3x6rfwO/3ZDv/93BgBDA7XJ/QV+gwSFAAHOCXuER7OAhML1w3u4fGoZC3+9Q34vSDX+AQROtPEx94CDyQU5P0qGNDu6xz03Dn/Ifrv/uUl/Ozx+xwxOLQKGiUj/MwC50LIFsYc/gKzK+7yzOSAAJb9/v7+/f7//f4D/QH///38/AH7/wH+Av8AAv//Av8BAQABAQEBAQICAgICAgMCAQIBAQD8/wMB/v8AAAECAQAAAwYGCQgKBgBJ+ichAA7hFzMb7+sFo/K4H/BVPPLaQ9sBBvrA9EApA/HFIwPz+BAIJiUu5t0C6gkONwAD+QUFMxwaCwkMABg2EhkrgAJSOoADEoADu9RHfO7KnSL4BPsOFBob+xDoGAH+/9A11QUE/vUIlYADDoitnK6t1G6AAlWAAw7X8Ov8CA399+C89O8XCc4BPeTJDAk86+wTIwYPEuki/Bb4QxTaQNj0ExT8C+vKx6kuSCYpANzFHyAGz8y7zvIJ4z6+IzH7Ed0u9tj6CvzFHUrGQ/vwB+sDEdMNGPFHI8fyOx0o1R/t/hjhx99DBbIW//HlvxiAAJX+/v0C+v79/gEC/v7///79+v7//gD/BP8BAf8A/wL/AQEBAQACAgEBAgMDAgMBAgEBAQD9/wT/////AAIBAQH/AwcFCAoKBv88EysX+CDrDQEnIevxqLz8HPMLQiT2FAgA+/G/+B4zI+jSJwDrCAYOEikh3OQS/Cy6LRUXCSQB8TokDScNEhAqJjoogALcgAJbgALkVYADyuV6/e3/CA7oJw0Y/xb0IdElBMIN6hT7CgnZ04ADfIuml62+rYg8gAHHgAKlaejv+PgI6vLt7P7yA/7jBgXvAAUQE/77KwYO9Sz5G+wKIfgiIP36AxjKxMLV5gsKCAZEAuzt6/D6B+bZ7BMNEbkT8t4NMzDgDxPk4wr/0/lAJfrtG/367RT51w1V4kvf5gr5Tyf/9vAD7ckODOnHBjjSzPHHQoAAlv3+/v/+/fwAA/0A/f0A/QH5/f/+/wAEAf8BAP8AAf4DAAIAAgECAQICAwICAgICAQEC//3/Bf////8AAQIBAf8DBgYGDhX7/io9+TT2K+UWAhItzdHKvScc8d0vDjEq7/LE9vIPOxI579LnQPIAxkwSLSytBC8BBbAtFzYAFishvYACxBoYDx8WSyc9gANogAJ7H09gb3UQNv7mKfIKI+w17gcU5BAb0wXs7BMO+dSAA+mSmaejxKiAATC+gAF2dYAC60Tu6g3z9/r79Pjs9f345xLqCxLrIAUb+tZ79+bzNQPULioO5SsN6PGDx+0JCRAWBxXSMv/27ent6vHxAggMF8/P0w/66R0hHggFFgDs+MXeJVPz7+wQHvYYC8HzGj87+NrzHBDwGCr5DxTq3xPO7OwNFeW67ewYgACW/f3//gL/+AP+/v/+/v78A/v8/wD9AgIB/wAAAf8B/gIBAgEBAQEBAwMCAgIDAgEBAgH//v8F/v///wEAAgIAAAIIBgcPGwDyGD0HIi0T3Tb9BRTG3NCwLjfy1/MlKy/z1gEIDK5BTSYCxfMjFODkIlQX784GMCm94TkoKywwOCyAAjeAAtyAA4EhzoAD+6qABDcegAPQgALpnIADBDNwVm0gUdrmNPLyAj7WVL1O1w/d4hzmlgDugAPI7raow8e0joABXNEKgAHZgALKgANe7QLoEfv2+fvm/PX2/fb1Cw8Myk0hFu+rMFrKAQAvDgrmVNwNGpWg4hUJBggNJQYGtB8n8vXg8tAO8PQTCdq219wp2RvcFBA1OzDi8vLC3QdIA/zqBPsYTu/uwPgpPzb30fcXCgD0B9TxEAod/w7sEOvN7/zm3rWAAJb+/AD9/gH6A/7//v39Af7++/4A//8CAQAAAAAAAAD/AgECAAECAQEDAwIDAgMBAgEBAf7//wQA//7/AQIBAgH/AggHCBUaBecLXB0bEgrpOwMA+rXJCZ8+QAi86yogM+IJ9BrR2DUkVPjP9ABF6s7wQF3+xAkUNrbsVGNYSz0pmIACZBQuO3eAA+U/2L6dr8xHfH1STe0Wa8gbGff1NdBP1+amgAQ7ueUO7qJOxYAC8AUkQYACfoAB5qeAAQLqcEiAAlyAA2IaCwve7/IQDNYQ7/oA+hLyFSLBKVAl24y9cfYwAORR/Q012eyF3vwdIfQSEA0GBvrSx1oA6df82BD17v0Fnsn50CDUIfvsHiBcEunX1vTuAQEcIQ/2BgUsLsztBhgHPuj6BPfx+NT7Bvbh4RcS9wYQCC4O26imsdGAAJf8/AT6//7+Af/8/v7+Av76/v8A/wABAQAAAAAAAAD/AgECAAIBAQIDAgIDAwEDAQIAAv3//wX/AP7/AQIBAQL/AwYKCRYaDuP9VDzpLwAODhkc2bCv7uo2Lh7J/QM2JNQcBBXZ3xU0QPvs6f4z7+vCTyga/9kxBNog/3RU0BpC8+XuMBcgN0wGvdSUgANNJDeABERPZg/RXLaJ3OsY5Ccl36gFy4ADU9sb94b8763O1iSAAaWAAQfOKYAB1T0+gAMFgAPI8/3/8fYH6QT2Cv0R+AUCBifyqIAD7/WV6uTpdesOKw4pDwHZhgP4JxcTCwECDfMS7ujP/ELfyxjOBQDv7gCyrOLVIuYRCdgFE1gXAff58/b+3vAsMU/v+RT/5RP8BO308QnSGOnx+PT/4wPw9fb9+AsI/Q8FCdWqmOmAAJf8/gX4/v0D/v/7//3/AP39/AAA/wEBAQAAAAAAAAAAAgACAAIBAQIDAgMCAwMCAAIBAf3/AAQA///+AQMCAQAAAgYLCBodE+XtU0X1Jvok/hoX6LOjE7Y3OSPX+9c2Rc0tDgTl5sw2JEcH5QIm9vjJ7BwZBDQ03uZVT4ACFENeVzr86ttYCwtDYYADipruEkMRHlZyTj+w3sSmtlI4jSFSFoADfzeAAyepzR35+N/ygAHdob8B7bL4gAGUgAITIztSFOAn60s4gAPVE/r5+AgEBwfvHf+uRdnt1fMjxz4mTPH60MfOPToJCCELB/f5/gEK7PT1xiPw4AbKC/Xi//vdi8nOMNUhBurqMBAiGCUF+gn6EfL4NeToFfsBBA/q6OkA7/b8/ekE6/Xu8/oE6fvrBvXx9gIe7BXRnv1dgACX/P8E+P4D/foD/fz////+/fwAAAAAAAIAAAAAAP8BAAEBAgACAQECAwMDAgMCAgEBAQL7AAID/wD+/gIDAgABAQEGCwoaHRvq4TFhE/wOOgAo9rXA3CaNKUA+zujyCk7aLC709OmQZywhGfsLGPiz3wfiEhs4JAr9bFyJJnskOSrw+S0yR+q3v7s2LTVr8/gWNOLu0t6ooCUr4kcxqvOT/xbFsrDrgALEm+TB/uzUo4AA1G4694ACDDTfHe38H2RKA+/aIBTwQIADwlbp0f4i5vm0N+cictGQtdsbXlfzDiwALQ708gIA/uLV4P70COnt4xHl2vL4/NqJvjTWD1//4+X5ME8D9vn7BOcB8/8B8/AT9/gE+/YC7Pzx7gX27/vs/+oG5/0R2gQA0ecB8+z/8Aok0z2AAJf9///9/QH9/AL7Af4A/P38AAAAAAABAQAA/wH/AQAAAQEBAQIBAQICBAMDAgMBAQIAAvsBBAAA/v//AQMDAQEBAQULDQsnFRDQGlMq/zcULBXRmsAVEZQjRRoSywgBMPISOxQSuaH6Qh4CHSIKJ870Dd7UQkAQSLlFOSnMCktgGz7pb1S6gAOIzQUjPkJ3KCHhGnTrooaxtJXxubBQXAHC4vjrGuXBmudm78y7B6O9sG2S8nI4Qb64gAHm2YACV9cGF+EW/V44d+bI0z+AA9ES6BIhAqy7w8P0YEj2w/5C+zIYc0Pz5Nba9PL78fj46QL1xOLu7vfluNhR+645FBbzNhL28Ov88Pf99f70+f/3BP/6+v38//709/H29AbuAfb87fL/5uIIBfsvE9gv4Pvr8sEkHYAAl/7//f7//f7//f4B/AL8/P4AAAAAAAEBAAAA/wH/AAACAQEBAgECAQMDBAICAwIBAQEA/AEG//8A/v8ABAQBAAECBQgSDRQnI9HlRiNOTdI9QbGjvRTSyAMxMBv5Bgwb+fo3OfvSjhIODRciAzbsB/z4+9M0SylJqfMfZD8aByBkDjZnyJHbEttfIgISRWEhoEUSHM3TgAPngANfzt6AAmNjI9PqDuWT3M3IADEb7t/M+OCfaHX0gADt6vQlFBQjIGs3EEUzPDJCL+LHpNKAAwZlBQDTren3O0mAAqcTPQ3mExIz+TdhgAR68eTt5OPq8+ru+/fp3/799NXj49r1LvDbA0k0Ferk5vbr9fv1+gXsCO8H7usD6//7Avz6//v09Pf9+f4C9gbx4u8mGxbzAh0F89SbK9MQT+M/gACY//3+/v7//AD8/gP//vv9/gAAAAD/AgH/Af8BAP8AAAIBAQEBAgIBAwMDAwMCAwEBAQD7AQf//////wADBAMAAQMFDBEFJBUkEqk9YBJBGAJH35O0A64TwCkjLg8KHS3q60AO4t+sD0cUC/wWE9wt0Pos7xJaes4G9k3ECHZDERzhWF7K8e5BxuYRAkTwX9wwLhkZgAQwxMK2HIACyYACOUKAAwO8gq2p3drrPBHm6j7RttZVUmkhWIABgymAAQDiIhYyIjAjGUR9gANLgAPhxbCyop0uX9DQCxFRXdHP0sxPDM4qQRvncSFWgASL5+Xe3+Hp7d/WDhX8KBgO4eXl19saGOzwBPXy7vDy9frz8/r2//b68/78+v76+/f4+e3s9x7s8Pjl+fkJAuoREB4J/Cz7vMXx/AURCeM0VdkygACZ/v7+/f7+/f7+/wEA/fz+/gAAAAAAAv8BAAAAAP8AAAIBAQIAAgICAwIDBAIDAgEBAgD7AQf+/wD///8DBQICAQQFDBYILBQeIK7oWy1TYtQgEZK46akn49UsGynzMkHy8jfZ3OzU20sXGfk399kj0DQfABlTL1sD80oRz90GLDQ6gAQoCOAKHv+Qagz+MNP7ODUnEoAEUYADzZALY72Dn4AB/toAHgAa7L2vlCXmA/r6MjFUFTY/vev4zoAA1CZGMoACInYuMCJOR+C/072AAklKOuafdOQvCtq0DOcPNQjuNgIaMi9JgARAQ9nK6NPQx+MmREkY2u3w5ent9PP17wnn7wTo8P33/fDy//vv8/4A++n/9v71+vH8+vf4+vv9/P78+x/L/QMPDf4XEwjw3ML7NtoNNQjkMUb6HIAAmv3+/v3//f79/v8B//z+/v8AAAAAAAEBAAD/Af//AQACAQEBAgECAgMCBAMDAgID/wP/+wEH/wD///7/BQQDAQEGBgkbCgokKh3soxdjWGbY5QYQsrPNEA/D6w8cLD4QAy0I49Lj3AoBQAznLAr60Dor6TZiCUcVAh37VlUMvRQZgAQ0CykNE8QMDCIc/v4N/h8U74AEHMbm/oW4moACDEAuCgT9xKLBgAEo8M75JDXVSvpsHTM68cUDLYABOLFogAH2EoACzmgl/4AC0NpCotjvydo23fMbGGENBtrLDRcGKs8uJBZCQkmABCUA0tvUwd0SOXwr9/ri2Ona6fDuAu3y8Pn8+urx/fgE9gT0+f3/+fj37//89PcA9/nyAPz0AfYJ9fn9/wjuC+8aAAUHBuDw1+09JADaFU4NJwgk34AAm/3+/f/9/v3+//4A//3+/gD/AAAAAAEBAAAAAP8AAP8DAQEBAgECAgMDAwMDAwICAAP/+QIHAAD//v7/BQQEAgEHBwcfAw0lJB8er8pFW1vc6xUk56jN7SzHCfzjJTP8HUQGydj2K8X1FPgQGzfaChMPHV7WJlTXHl8+Vrz/aB1lfd1i5/gY9/hNDAQM5yDCm6iAA6fE/MWWkjcQMzLxgAJnisbLh+YgYEDI+iEBUvtiZiWUzwWYgADtQXmAAqKAAypsBIACqoACJ+kb/PjqJ58+3/ICU3be7RKVJewOJT5pICg6b+cQ7tTW5dMGTEl65e/T49/r9ff08fr88u/v9/L09QMJ+fD+8gn2Afvt/fUC+fb0Afr28v/99vf2BPr1+wL+AwADCOf0//306RYIBRMeMSbWMS0N9dnXgACc/P7+/v3+/v7//v/9//7///8AAQH/AgH/Af8A//8B/wICAQEBAgMCAwMCAwMDAwIAAQD6AQj/Af/+/v8EBgQBAwgIBhwQGuwjIzfxueluMeUJMSL047bPLN0J5N7sMhpHE//XCRzouh3mIwHyBRgvBxAWAWwb5WIm4Q8JRiRhbHz9JjkV+zY/+RPj9BoF/NWogAQugAOkn9jGMtjs+eP7qYABq83TrRhUWkv5yE3f34ACcFtPSKeLgAIPCNaAAOmAAWqAAndbKVKAAoaAAeTjADUOxjjgBPrPX3P84yKK3D8JgAK4v2hOdmH/5/2xHsnG3xdAgAQCZvTP1ubw//Tz9O/4/vDt8fDz8fAV+/Tx9fUGAfkE9PcA9P/89vAG9fTyAvzw/fr4/Pb5APr6+wAA8On/8Bj8CgoX+voiISkpN9/tDALpgACc/v3//f3+/v7+///9/v///wD/AQL+AgEAAAAA/gAAAAEBAgIAAgMCAwMCBAMDAgIAAQH5AwYAAAD+/v8FBgQBAgoKCA4hDBD9Nikc5YRrCAQ7JCHG+/69/gsLqTDe5kgY/AgIFw/I9RPjIQv2ETQJCyw47Tdt3tVaUtxLH/tjgARlAAlxFsbnKx/ZDfMNGQjD46TBup3M07fp4c738/bQ34ABDxdGgAIOgAKZeoACj79i07V+gAOJFQ+AAuCAAlqP9f+AARqAAdpNZTmAAfT7sOAdIP7eWJ0XCHAT+a8/+MKAAlc+DiD9UIADm4AEJs+AA3Yel/Xk6TZvbOlHFBzs4uju5eYR8f7l+OXo7PL19hX99u7yCv37APv+APcF+v8C8vL65/Ty+vAA+/D+9/j59/z4+/j8/vDnGwsFAPMjC+8XKzwQNQXgKhLlgACd/v3+/f3//v7//QD9//7/AP8AAQH/AQEBAP//AP8AAAECAgEBAgICAwMDAwMDAgICAAD6AgcAAAD+//8FBgQBAQsOCRQXCCUO4DguCIAA/DUwKC0v7NnlLejfEfjUCsfbNw4BGDQPA7EdEOIUL+MCLkk3IBRYCSQIgAJMgAMBR+TOPyYfPWaABPPgpR0LzezsFOYHAgO78tahDqi4uc3Q/PPx9cvTgAEASjV3gALEgANVO/XiMffhAiAFwoACpKCSr9yeb24kOoABSUO4FgX5ECIO/9RPADbD5CUTSDNRSHI2+O7K2MLdwi9QgAOjHSSvQSzkRCLB4Obb9DUM9fbh8vTwAP36/PPy5QoO8QMJ9wUC+/kB+wfi+t4D7AIK5+jz7fX0+vj49/b2+/4G8O4OEAH9BAQOARwNJRkeMQ4myxqAAJ7+/fz//f/+/gD9/v7+////AAEAAf8CAQEA/gD//wAAAgEBAgEBAwIDBAMDAgIEAgL///sEBv8BAP8AAAQFBv4CDg8NEQUUG/sQDiMphwYsOjIh5eXbHRkEAvDSBeuxF/xEJAgM0hT0HQXvFQgAQnMf10GAAywaPJKAAn409S0wAldxHUeABNC+99oq8fell+/+VfuAA1k8sJ2OuBvr8+ca8ffspangbTgegAK0LkZWJv8zuNsn+4ADC4Warrym4Bb4Bu7yAxMa7wgf5iPvQxP50i4H8jUogAJ3WmwX5OLEy8nWDmNQRvj0+QsaFxclKvfk2+ILKNsOBOQAGuY6Dfrn2OJCBRX7EeMHHgb32Ajt2/YR4NgUCM3+3OUR6O/s8fTz+/f6Af7XLwL+C/UO+wkVCQYrIAwxKvMDtYAAn/39/f7///3+//3//v7//wAAAQH/AQACAAD/AP4A/wABAQICAQEDAwMDAgQCAwMCA/7+/AUFAAEBAAAEAwIHAfwUDg0SCxICERIBCxjvuCIqOiXw+b4jGSoj+MwF2qALIhYpKNkK9fgjB+cs/DD4GxyAArCAAzEnZwKAAzaPBmlOGbdEQIAEqhS85kPkxaotBQmAA6iAAunY3gni3AUI/dLh2u/qvMQ7y6hRfkNkJxiAA3MOQwghvtsSBIACxJWrzK+3DxU4JnaAAXWdCvMB/wANEwoLDzLgBjYTLwz4RmOAA1jyvNrAp8tASh0ZKisiChoNBQoi6uPv6/P85O7qEQD0I/xI8yLw8hALECMSEN3vJdEXAwv86ezn+OfhCtYACOD45erw+u/17ff82iYJCQcJ5QkSDQ0l4h8bL0Ht8ucNgACg/fz+/gD+/f/+/v7+/v///wEBAQAAAQEAAP8A//8A/wECAQICAAMCAwQDAwMDAwIC//38CAMAAQECBAIDBwEE9w4ZBw4cEQIJGQASEA3er1ItDvXs0R0lIS4l5svJqw8uBAdDCv/j9jUJ8hw2OMdjRdQkfXUwgANOgxBAC1ExVIAE1OXh1x74rYADmTKoqMH++Ca24Dc85AHsyO77192imc3VFGeAAhRCgALvOApUIUoED8HcGrSAAq2mlqHxMwI5QcCAAoWGgAEz7QQAIfzSC/wz+f4ECjAVBy4z8VgHOd2l8WBvMBHu5gPMETwkRFhL7+Lb1OHlzN/h9v8B8P0EDiMpRiwcCwvc8Qnt8Ano6gT19Pr6/gMEDAgR+fja3ujr8fDw8PXl6/UYDxYK/u4KASEQChH7LAwnLA/2+YAAoP39/v8A/f7+/v7+/v7/AP8BAQH/AQEBAAD//wD+AAAAAgEDAQECAwMDAwMDBAEDAv/9/AwAAAACAwcD/gz+D+sNGwcdCBASCw0HEwAm/YkENCnn5A8EDiBIKrzqw9Ezzy0ZMyr67+YSNAAObDvKQS5YAXX3JZ2K8AEtQneABLwnyN3uuva5gANF5hgV/t8WkgA5TiLh67262O22r9Oq0y0EgAIScIADH2IbCgocMSwMseUVgAMygAJwjRLw5DMyTQnbEBDngAGigAI+AzyAAY/B0vIW9AUNFi/3My/JPtZN2dxngAKf7urY9RwZ6BoaHihcV3hM2MvH6tfe4efn7vPH6BQZEAoVBAsO/RoECRIa+fLy7vz08PP0AvP//AQAAP3/CAbu8url7fL05QUKEh8A9QQKBA4bGyESDiLb0yHJgACg/f7//v/+/v7+/v7+/gD//wEBAv8AAQEBAP////4AAAEBAgICAAICBAMEAwMCAwID//z8DAABAQAJBAcACv0W6/8gFwQWEBkAFwgODRgRgAEl+gQq8AFA/esILxvby+H9UcoKSPj5IAD/Bx1T/hVsDUQjZddFUcq6gALWFGMjPIAETYAE6+nK3/vQgAOirC4NHCYWtIADBRU2Nyshy4ADAYyawKLb7eDZRnqAAk8pFTYrKTMa/iQaVg0t1ZKAAubAPoACT4KAAqVTOPOoI8iivyBWbbCagAGCovYDAAIIDu8ROSf3FBjSOUQe9vUNPuoNLvcSRFRMboAEawrC39vU3ujq78yAAqYJbeXp6f4XCxQLHQsRFBMNB/v09/f28PHt8O/q8O/2/wL49fX5/wD99Pnu9/j9FwoG/RAHCwoRFx0wECAIns/D54AAof3+/////v7+/f7//f4B//8AAgL/AAEBAAH//gD+AP4CAgICAQEBAgQDBAMDAgQCAwD6/A0AAQL+DgUHBgb6Hf3hNw0NDRMX9yUMDRcZ8IABJfQd6AIZHyUU4wYh783+/j7e1hoMESYtAwoaUE8lLf17PRQb9Di7gAMPJPcxWIAEnYAFIdvD0IAEC7UPzSgIEzgvr5HFFtIw0LWwgAH+EuXvB9GAASvygAGk7edxMVb+GAr8OCw6O2RE34ADXeTdcwyAAvOAAiFrgAMbgAO51aHPyNPu6fzP6gEe6uHKx6nPF/gAGxAPQN8kMBII9U0N8w4FDyZRamlpZNvp7ubj9OXrjYACnbWAAuZy6fvy/gkOFxwZGRgJHfv0C+cK2vLoB+zg9+jz5t7l8vb2AP309fj1+gcA6vMXNBb76/EOEBMW/h4KNwLF2t/O6IAAof7//wD+/f7+/v79/f8AAAAAAgL/AAAC/wL+/gH+/wABAQEDAgEBAgMEAwMDAwMDAgL4/Q0AAwIBDwYNAQrvI/PlPw0EEyEJ/Bs49UIFmaD5KvsH7xEiGyTsARvE8wkh3+QnDwcYNBYo0E4gO741P3Azaz3SgANb12wFzU6ABMFB1JuoBuL99AgTLzYrgAPPsuaqzt7mxE7tsNiAAZ8DpdYhgAH68wlpNjRSQdGjZx0UJ2AjB65O+6uAAvK5yxdWZBYK8u/lvK7X0Nvu0ekO7uPk7QE0ggv9RvMxLvH8FRgYNTgJOzhUQVwi3v69+xf68C+qgAKsnPOAAr2AA3j9Af4KGCH+LBj5FQoOFvvvDeD84eYG8t/91+7r5+zq5+7o8PX4//YCAu/u+fAAExIVDAr7DiAJFg0q+MnY4ezsDIAAo/7//wD9/v3+/v39/gAAAAAAAQIAAAEBAAD//gD///4DAAEEAgEBAQMDBAQDAwIDAwH4/Q4AAgcJBgsFCwfrIeX7MBcOECECGRARKmKpm68V8kEI7uMMHUANB//e6wkQ1A/1N/4kLiRmiCkZKFNK79J5G3sOpQvQdvpPgAUNHIAEfeXz6/0R9gwbISWEgAOBuu28v8/IGYAC6reiiKu7/QweHSwnRhYiWmTjBvMbKQ4mGAgVFf6ouRDdHCF3BxYV29rj2Z0lz7PYv9UNxDsqvJjP6gsPNCPuByROJQV0aBIz9/f+0Aj92SoKCAcqp4ACe6obgAK/gANTCCofGxIoIfkkC+sNDBoI+wDz8un09e307OX11ujv0fnm9Pbv7vXk+Pz65wTn9vUOBQkLFCf5ChYnGhkf2qLh7PQggACl/v//AP78/f/+/P3+Af8BAQABAQABAQD/AAD+AP///wEBAQMCAQECAgQDBAMDAgMDAvf+Dv8DDQ0DDfsZBOgdBNsnJxgTHAwbCvxLFMSfuSfrJD3t1vYgMQj9+AwR+QLPEOZADjNNIwEJ0IAC5gZ2BA3E5YADtkAR8vrKRGqABP/TszPj4eAQ/BYNIhcQgAQZgAOEyeMBEoACfIAB8EBG/IAB5cqRD4ABzmEkMcVfMkcoKy4F2iH42j4L8wAECQwHwwsVBxA/DQYEtdfZ1ALRuwcC5gfbgAIkltnn//TEHg8SMig0UU8XO4ADdMjc7fX6yv35DA0IGvUj1IACO7xJgALEfk4YHBUXJR8cBBAM4OwqEQ3/9fLs/fHv9Ozw7+7w674k5+nt6O/c7fHs5Oju9P359QYJBQwNEDnrDRUQExwnrNLj7yGAAKf+AP4A/vz9/v77/f8BAAACAAACAAAC/wAA/gAA////AAEBBAIBAQIBBAMEAwQDAgIC+P4NAAIPEQMO9xQL7SILwys7AyQjIfUk81fsnrfWNOEAVvjF/hb9Eg0JEgcDAeoX6CM+U3bm+/HxCIADGkthGeLL6IAD/00V1MpdgAUzxOor2Mrm7gAVKRoUgARWy8YI5o0Mo6eMsbokz68LgAIegALRXAE2rCRRbesOTOCfTfvvMvUN9NoyCBL64gAXMQP7+/rPxfD87v7T/fyAAtSAAjy9+OblG8yw4wM0ECcjYYACrYADexPY29To7fvX3+vxCA0RBhELrIAB5mp3KD0oBCQ3QxvrxdL128cVRyoy/gQGShXi9OcNxwPpGev99/Hp8PPY99bq4fDw5uX1+fMO/AQIDQYSJRkMBxsiKAuG4/v5gACp/gD/APz9//v9+//+AQH/AgEAAgAAAQABAP7+AQD9AP8CAQIDAQIBAQMEAwQEAwMCAvYADv8CHgkDC/cSGOcYD7w0SRoULhjsPdsj5qPP8D3T60AgxxP0EAwLCv8VBh7zA+ZcV9ZIT/NQrT8DG2yABBrfDYxRIj8L5zJIeBUL39u//QYsFuaABDSyCSvFvbeUpYAB9dnc+Nj91oAB+oACmFk/TzUpIFX3Ca1WG64gOAQE//Tv+eEjCggOAQn9/QD2/MD0GPz8DfyegAMCgAJZ77PjDe231xyxFRc0UG6AAuVz4h7c5tro/uPO8M0NAPz//f0CkmM3PhUe+DpAMu/Bz8wL1ssvWRkfCtjzLDkmHRrdH/nQMgn9+fb19evx4+rn5eHb6u3p7/ryFfsICAUEHvwiBxQYIhwgrtLm7YAAqwAA/gD7/vz9+/z//gED/wEBAAIAAQEAAP/+/wL+/v4AAgECAwECAAIDBAQEAwQDAgL5+w8AACsCBgz5BSbqDxW2N0ErGBIVIAnd8PLS0ftIyPT6SfQQyQ4WDA0LAiEw8Os/cS2IU1JWHI56tHxXa/va+s0sOTvhsD5EDUIX7UwW9hDngAQugAOf3x8O+YADI4SJGxJtgAIqgAGlseJNcWxhQyFfHCcDBwDdgAQ17zsGCQoJB/749uoSBAcK//4CCAwAAeAhvuD8CQ2AA7SAAseezMrV6vTr4unTAUUogAJFgALd1yvnE+Py3BDn4Ofi6Rb9+vT6/N1PGB4XHST0FQr/Hajh6wq8SBYOKP4R3T4EEg0bJA4TCTIo+gviC88K+Nn22fDq6O7h7Of2+PwECxEIABce6w3+ERUhIST+leIAgACv/gH+//36+//7/P8AAQEAAQEBAQH/AgH///4AAv79/gEAAQIDAQIAAgMEBAQEAwIDAvr8DgEDK/gV/wETH+kMFr8oWAocCy8UvOEICczUGEjF+O1KFN/kIPgVDxIEBTQvGksoNK0egAMrZ8XgWZ2AA8GABFsa/uP1ATH+9pnXPUroERQkGijoJ9yABAifrttxgAL4ixRz3LH4iIjC5E73Y9NeMT9JcvsY3FscFmYODBETCwf/+fj6/f397Owe59vlBvk1L+XlBQ74gAObgALPjcHb7PHf1ODSCFaAAh1GjEzMIwv27dwf6Onn8QL4/QUKCBUWFBgUFekADfXt+wzz6RrnFBrTEAoX7x3oHxdHPT0cKzEZ7xX4+dbuDu343O3v6e/t5vjs8vIJDwsUKxby8fkABQ4NEikv7K0B+oAAsv/////89wD7/PwA/wECAAECAQEB/wIA////AAH+/P4CAAADAgIC/wMCBAQEAwQEAwL5/Q0ABjIBDPESDxX0DQjcBV4pJfUH3OHsHOcXvRk13vD/Cy/w5jDoGw4TF/cIdFogTqkGbE35HDU7gAN5WoAEffjW/v0ZOdy/wcZNB/74Mi34zgwZ/9Tro4ADLKQ0UxL2gALTgAIgoxIg4YABRRpYAiDNTRI1FRkePzkeZTwmGhYYFBMDA/Dz8OvO6iML+OPOBP/cHyYP9vUA6eGzrbva/6/E9bG3RkPR2voG/C3wIPnm9vvuAQT8AgoMBggCEAUQDR331OoLFBXvBywK2QICFvITJPn5ExkHECwcOSACGycQEP/nAu7v8/X17+7v6PXz+woYGhby+fv+AwIJCRAMEhoh6BX464AAtAD///76+/37+v4BAAADAAACAQEBAAIA////AAH9+/8BAQADAgED/wMCAwQEBAQEAgMA9A4CCygWAfgODBQAFPDsxl9IDev19ejvTe7e+O80DNnsCSwP2y30ExsOMAswv4ACnR/65y+AA2wBmIADs9aABBH+ODDC89QYCDn8rr7IEFPw+Sgh5Obt+Qbb2fYgV/kdoYACt4ACNhgrpIABh9/bJ4AB8XjgsPAt9RR7IDA6/hASLiRCGB8SF/Ho6M7Q5AxbRBD8x7Vnsam+7wj77Pb03Lvi3wvqy8rKtfP0BAUCAwMDGzv77w4PyfL/BwwLAwILGvraAwP+AQMFBAsQAPkAAQ0ICRIDBPMTJyX1/RcT/hMG7SAuGhscA/T79+HuBxwE8PX3+/wkAvX1CgMGCgIFCgkPDRghJxDrIhaAALUCAP/9+fv7+/v/Af8BAwAAAgECAQACAf/9AAAA/fz9AQIAAgMCAAECAgIEBgQDBAMD//IQAg4wFAP79CAO+i7i68EqISf8/APoCU/I6CH3CjPL8hD3KeoaDgc5ByBnCI8ZTvkea0CcVBorPxgjUA6y8EQgHc+nqw7HXvMaBs3z3+zj5fdygAQjGoKp8YzhDPqggAFdBesdXoACU2bY1+/gAQ9+gAN++g4fOhkMIhQOGQ7968bb6xXikYAEJrHy6OfYMxgksLWzzObV1ffU3Ozn69fn5+P8HS0s+tvh9gECDQ7mARUVCt33BAMEAwUICAUCCQAFChIYJB4F/Pfo4urqAgAEC/8SJA0QBv0BEvEBHQ78BwsJBhMUFh8V//z88gT+9gn4AAoICv0PBQUJBhAWEgYiHyspgAC5AQD/+Pv/+fv7AAH/AAIB/wMCAgEAAgH+/gAAAfv9+wECAQEDAgEBAgICBAUEBAMEAwHxEAERKh/6DOgmGOtB1O7E9Row/f4C+Cs7w/Qr3SkgzvQO/AsSExUSKyEmgALF9YACLc8o/CkpBCgDHxQ0e0ky8rk+VlTBqKiIVKYUCDgE5/Tcv97/VCwf4pnuJsgZiZWE1yIwXFxt9c/zDstZCvJHTO4W/iI5QSEwHykx+fT48du8i8ke3vr56x4AAwcLA+S15dXf4AYA69fcuKyogAHLUjL+DZOn7yjj2hgCAgv/9vf8FwcSBw0LDRwAEhUbIvTqFvMBC9vU7O76B/4BAwAD9/kMDQ0aGBMUHS/iEfz/HCECGxz8+Pzv/Pv1/gEF/QQFCQr+BQQKDgcNFBQDISkfgAC/////9QL6+v35/gL/AAIC/wMCAgEBAQH+/QIA//z8+wECAQEDAgACAwACBAQEBQQEAwLvEQMdJhX3HOcmGN875fvG4v0aCQEFGS8w0fQP7SAT5vMQ/A8uCBEmJSfxgALWDZKm/10bDgZd0IADYQP31lkCLU4uMgu2oK2ZL7giERbm4unP4zJF79fvH50RQYACG9frgAFIR0UkDcc+eQPmAxQfPFA8IuYBFej7ABEYCRMlKTEV4ufX1c3G4ecIAAIRAwP///gN25XX4wDGBrIO0su4KoACBnknjJjH8RM89v/nCAEWFwzEDDoqFw8tAwb2CgP/EwXY/ej18PDv5ur0AA/7/QYEBvru8RMIGkVhJish+gMJD/wD8f318vTy//j7+v0B/wL7/wv7DgsCBv0QDQgNFRghD4AAx/sA/fcB+vz8+fsCAP8DAv8CAwEDAAIB/f8B///8+/wAAgECAgEBAwIAAAUEBAYDBAMC8BADFSwSChz4Bi7ZKQAAzcYBCgAQATYRMOrv9PsUEPfpHf8JFhs4Hxlx0UcugAJfvjaAAunkbut1oGhR2uTfJDNEJEm2raGptfjoKgnx2NT+8jBW5MO5dLi+ApPNixNEZFDrGYAB4dlYH/gDH1RhXkJk88MPDCscFAwIA/cgFATz78vQ2LrJ0uvq/wcGBgD76SDFpwWY9b/H6PbhASJqYv3KvwEwMybz/QYuFBgKyoAB76ro+yImSYAClnrhH/3uCPnh3ubw7goU5d/Mzfb8/wkNBv0A+/PqAhQYHQ8Y9yxA5zJH1PVADPLv+P0CBgf/8u0J/vf7B/8DBgULAgUODg8jBQuAANL4+/v8//r+/Pj5Af8BBAH/AQMDAgIBAf3/AP///Pv8AQAABAECAQED/wEEBQQGAwQEAvcJAR0pFxISBu5Hv0QF+qrYF/sfAPsBMiHpCfLxCwwK5zT5Eg8fLB8+gAL/gycOzpuAAqyAAzfqR0MjxncU57goB9EpWiq/qZqzufnsxUr+wPD8RnfP0M/HRwmAAeTwz6lW3VdACBwZ7M0K5x0LCj04X0QJXVwdAuP+9AASDAMb9t/y7/UZ+Rfvy73EuNUL9O7698X2+KsLv/3Ju/ATGQ4dLQ0XTjkfGRbfEAwPDRiAAmeAAdH47ODxJDdWXYADPRb17/n0BfXy7er4Cunz79LD5AccDw8J9/ns4trcBv8JDQoJDQcOHCAoBVnfCDfPNuct7wHq+foF9fv+/gMJBgMMCP0GDQ8VGYAA2Pz19gH//f799fr/AP4EAAIBAgMCAwEB/QD/AP37/PwAAAAEAwEAAQMAAAQFBQYBBAQCAP8CGDkHLPoLEC++NjiwuPAxw1DRKNgSMwIV3QEMCAn3MQwTCRcpLHV3gAKqFgHniViAAzs+LTAJ14AENQsHgAOxWCDCNVnOtJOozQ71+Mi67fUQMoADM/LFvaQv3pC62dUsMggRIxsmFxrf9foj//MQMxInQx0yHRoQKgcCEwwPBvLo0fH3BAHj/P4SEAzgv9Tq/ujlAhypkpbJ/toRICEA+yhUTDYkGBYNFxID+RmCgAI6uuDl0RUcOG2AAwZf+vcE+AD29PDvA/f946DM3fUPFxIOCAgG+/rQri7vFS0AAvoDASHm5QINBQ8QFBIFCAEPCPEDCAcKBwsFCBQUBgYGCfz/BRQbgADo+ezyEQH2/Pv0/PoB/wMAAQEDAwEEAQH///7//f36/P8BAAQBAwAAAgH/BgcGB/wEAwQA+gYRVxYN6CUkAuIaMaLT9jq7MO4y4P0rBxDcBhELBwU0ERIbEj8ygAMVDMLtBMqegALlVoADxSENyghkSeSAA81AI8Fx98CPqvMLGcvNu9KwM85Ncveoy4cBycni7jVJP+8gR+FG2Tvp6+8GEA4ubfUKYiMIBgID9v/9HB8NA/L58+vo3+Px6/fw+v/iARkG++UKENiAAjePBjPimjOAAj3fCyMKNSskIBkUGA8REgCNgAJLvevvugQUMleAAsqAA18B+/IB//32AAHjybnT5vb++fsJChQRGwsP+gCAAhEacEocEgoB9vD0+/cP1fHj8QTz9xEJCQAHDRYDDQoKBQQEBgACDQ0WMPLsDRWAAPT+3QkV9vb0+u8A/vgBAQL/AwICAQQDAAD//v/8/fr8/gEABQIC/wACAAEGBwkDAgz9/AH5BQ1BJ/cgEEH56/r7zcYcNMMOFhH65hYbBfEHERIf9g9SGxUTRU1i89HRKpu7gAL5gAOeFDkD9QAndvmAA9xIHdBHy6yj8T4q3dGqsMawwDVcatP+gAJUgAGzzOnuAT9ycUXS+oADRMcAsxoMCZVA5C9PWATkTgIDBfj37voA+P0P//kNAv78B/j08PTy6c3by9zyAw856qarCFMMjYABUYACDGttCAfk8xQZIRYYFhUSD/2AAs+AAjuu6OjWF0NIc4ADJPTxEBD0Fgzevtrk9fX5/gT0+P0UGxEIEP/2+/mAAijyV2YgLB8OA/4HDN3/FeLq5uvezw38GPoJDBAKCAwPEQQD+PT7/Af/ESs44ASAAQD92A416evs9uwF/fEGAAD/BAICAQQD/gT+/f/9+/z7/QEABQP+A/4CAQEIBgwEDwr69fnwDxJhHgQQCjwd19f0uvXxRNv5RdsL6wUTBwYMI/84CNYHgAJy8iFCZf8t1tPzghFKgANUEmMy7T0JcM+AA+BNR9/prJ/3XVczmdyAA0PHgAKL567PG4ACpEelgAHpmvLmH29egALSgANTBYACtBmAA8D93oAC0IADig73gAKngAMw2Vg3V+rVHgX29e74DvbuB/bp+/kGBP/+AAgLDAgF/+jtteK9xcjm7+jhFVvzgAHNnIACBlCAAwR18tnG6hARFiIcGBAH7IAC0ITYysbeCmWAAo8n7hD6BQoJBQsBFfkXDPPxyfUSDe78/PwA5PDu6R4FiVM6ERv3KTUVEQEMERAE8fvi5/bG7gYQFBogAAQICw0D+frs5+r2BwoPIVj2gAEX/cr7Vvji2vT0+gHpDfz+AAQDAQAFBPwG/v39//v7+/0BAAQE/AX9AQMCCgcRCgkQA+fu+wMdVxRD+PIRT/Sw280P7xgFzzQY7vYJBBMYESr1Sfj34IACgzETMAvyKv4PiQgjtD6AA1RlJiVG/k2mvRAyHKub7kiABG9arf+ugAN5jIACeVnhvJBg0cWX3PkgUYAClSWAA4BgpIACzgeAA2yABBOsgALwgAPIR5CAArKAA5bANW9Vstwb8+rx/vYL7/Dz7wb4+fT0/gYCDAoMEBUQDg2488SzsKvQ8/bOHiOG7YACIXE+N0QH3uf4/P4CFA4O4Ajq/7WAAjy42PRuEegLGQsaLh0wXCIF9vTj9fYB9PD0+xAE/vDy89rM1tX66AQ2E/saKDAz+SAW+hkb0f4ODAzs4vkVFyctAPv29ujp7fvu6u/wCAwTGzCAATj2t+46PN7L/PXy/e8H+/r9BAMBAQMF/QYA/Pv/+/z7/AABAwUCAPsABgMMDBILFBAA99bw7jJeKiv+Bg4q/cXF9gTw5zuvERcJ/QwHEij1TeQpKh3dP4AC6ePV6hE7NMzgeTCAArc9KYADtS1ELysktroZNuyQ5vSABFiABNu1qyETgAObgALr4QSAA1K0gAJajTiAAYbk8j1ZdYADCviAA9A2gANMiU8ngAQJgAOFo4ADxYAEg4ADWIOAA3+ABBe0gARND74Y7uXbENca8un1Af3u8Pb0+fv0BRAWDA4RBg8YHQnSyKCnu8vc37bu5t+AAh9KCBApMUb47ur4CgMF4t/ky+EK1My/9xMTGyw3OSQ0PRTX6fv99d3r/AAI9AEDBAkDCDEF8N3h3Nnq798JChc7HysTGSjtNci/Xi4IBvQQ/BEZARD/4R7q7+7u4/H6+u78Cg0SEIABXOan4kUp/soS793pDv/68/4EAwAABAX8CP/9+QD8/Pr8/wICBQL+/v0GBg8SCQkgGv/819fvO1hU7B4iEdzI8/7n/xfOMMHwEgoPDgsQMRIn4kMdSfWagAKNzQ0kJBsiGdqAA3NVgALRgAN5w1xCE0Zw7MPfOiOhogxPgATE7ruuGVKAA42AAwI1McCCgAIJn/bR8DZXgAKTbYADgvWABCOtnp2AA44jbcyAA1sJgARMgAN5gALwVoAERlj+vA4K29jXEeYD6vvu5BLt/u/r+Pf1zEoWGwwMEQoHBQT//urAorrxyIACJ7qy7VojGg/+GWI4FQfq9+DY5eHO3urt7fL0J0ckFiphOPzs8Pzq0sEB9/sBCiP9Bgf7AgcJIkft7vbj5fPr3v8TAboJ+R06FikXHZ4hdwv2HNj9Ig4Y+AL3CgEO4+H86+ri7gIJDRALE4ABNt3j1z0vFscb393nF/j76vsL/gEBAQT+Cf/9+AD8/Pz+/AEGAAP9//4GARcRFwMgMRP2BJ7WYj4jLQgj27Db8vvvCC4PC7f3CRIODw8XJQ0kCEIpPAWAAdIsTIAC0O4z9UL4C4ADrwqAAwKAA8Hi1ShcaCUkxegP9q0RK3cygARsA6o2LYADgPAFuJuAAjXQle3dI2CAAp1XgAN8Xe5k0YADX8lvgAQnPeSAA66wgAQxmIADGjmABDqABNPupkv+3Lzk/O3y3A3v6//z/vfs1Pf1pIADiBQdEQ4PDwUCAvv189vc2bacnJ+tFCn5DQsTGQMYGxcRNAX7Cffju8Pa4OQYIjVIPwryEAsL3t/B9PH+/ggdGAgFBAIFCAgLGTcIBu/o9+j5+N/L+dgmOBXR1gpBH+tHDTL//PMRAAUG9QP8AgcD9+nl9+7z/RUJCw4HDoABEwX6xBJHKNUA1OAc+gD34AYG+v8BAgIEBQD89gH9+wH9+QQJAfz4AgMH/BoaGwg5PhQEAaiAAM42Vg0GBDbX/cEF7ioM40YNt+oMCAwPFhEgNikKYioR+YAB5WpAbIxKKRwackvMgAMtgAPp1SrLYE0LN+jg0x4RH1s9s4AEOyW8V4AD7MxOgAM1tLPHgAHJuPb6aIACjHVreFYAyZTbzoADy4AEdVCABED8gAN/gAR8gAPpgAM7BIAENIAE7snNcezS0uED1N/tC/bj8fP449vp7fuAAteAA5UXFRYSCgwJBf/59Onj2M6Rjai7mjIVGxsZJToODxEYQS4L+dCttdXJ6ubhSD8w/+geCe/o6uv6+/ISGRYNBgYGCQQGBAsMCw4OJxIH7/Pr8O3o8eq4NCpa/9XxuOgqLP87Awfq/+n4GRgL6u76+fT/DPj+BhwI/goKGRmAATQL2cr8LTsJ2OfbGgoN5tIc/vH7A/8CBQMC/vn9/QP9+/YHEQXv9QYCBwUTJBhLwnory7TOqv0WMRkaN9Ln3AYy+ULg8Tbf0g4MBBMTDUNE/SJuLxPzgAH8e1LQykkYMn6AA/tHipeABB/fGLYcPxhU4OTRQX0qG8aP8IAD4ArkooAEDOOAAxiAApAEgAH1senbVoACS4AC0oADZmKABEfyFtGv+cYrgAShQIAEWPaDgART44ADiP1fgATSFtZS8OXH7wzX1PkG9MX36ODq3OHo9YACoIADmh0UFRUJCBAD//jv6OSq+ZSplLyVNAwYFlkhNzUkKCTw3+TlAPWd06XL6AwRISrzDvkC/f/yBRguKx8LAv/79f8MAf0YBwIPHxvyGg0M0Mfn0eLv5AYsUVUuxA3M5eTjAgEMBO/9AwAEBwwI9f0GFv4ACBUD7gkXDBwkC4ABTxfZp+5J+1PQ0QcAD+0AwjXz8/IFAgMH8gz++/r9C/r/7BYRCwDYDfoGChAgRxK7Ngbu0tfW9RrsLxgn3eQc9S027yvTFRW/CQwFFRg1/4ACVv8uS0QWooACEOg+AhojX02AA7dJfYADvAZdByGeEBtIHdz4+XApZcabnM2AA3BAoUJZ04AC3Ym/ivjNM4ACOHaAA0eAA8tk/fQAKa/0At+ABLItuueREmmRDMyABMVgskMT2q0k4uHl6w/p4fnq4tbO9LmCvIADdTYjFhUMCQkL//Xy4dGAAxjb8qubmat01ig7gAK7OSL8BBMaAAMB78PZnJ656wEh+BAB9woHCRQ2OUMsEfr79fDu7O8FCg0KDhAuBCEa4jEmx7Hb49fc4OcSQR8Y8EoqMsnaCePZ7AD9EeAj6Pn5AQAQHewICBv9BuoEBhklGjaAAWrvycvsSSAQw94eIv3h6d479QLaCgn8DfT+BPv1CAv1BOUoDQMQzhzmARH3UEnky+3++Ofp+Ooi/uwg+vwiASvgNCQk9doozv4MCggjSvN3GVPfdzuAAo2WHfYPKQqAAxpOYoAEgROAA+Z2+O3x2B0KGQ7uzAA+gATQS6yb/tKAA0Df0oADkSrRgALegoAB09vZ536AAsBbgAOogAQpC9T4+lvUAAYJgAToLOizjDUrrwwyJIAFT6cyLdOsKuzO9uP98uf46AP1yMeGgALBuYADAh0fSB1SCvIN7wyY+JHVgAJkScO8n6Rm0TE8gAKbgAMoCxwjEwzBosHRxd/N3uf2Ky8MHwgDHh8yOhzpQvTn7/Lt6enuBwYRGQIYKjgVEyHyEP7u4+ns5+etlEbV8Bb/QfkLRTgnEvHR0NAtxyE+0uvXAAAFB/77FBwM4ucfDSYkOIABL/PMGN4nRQHvvyE76em0Gyf2CsoRFPsD/+oJ+fUY/PsL4xEsGheNR+fsD+1KKv2/CPDrKQS06CsM8t8SGiUVDfjzGxYz8//+9gnyGSo7VaKAAsUPSgs6gAKKulC3RCLoW4ADqmJHX61D4//LxkcR7OYPztA3gATlCMLi94AD+oADboAC2lEIY6WDgAIpkdv8GIACSoADH3x0/fbn8QVmCzgDKlwE8OOABGVRBOjnXA1jwTQv3KoZ6ssc0A3y9vbf+gLVooADZZmAAnciDwY+Hm/Z1wz9/Re9zq2uCwvklrs/3iUZNjdIOC4X+8TO78ndCQkYpx9dJBkUHTA/Ag4D3Nwf7+vt7ens8PwJDiQ2Mh/zHRMWGwMN9/Hn38ChzsXOCnP/GdMD6QkCHEN9LNfTucf99gI1RPLI0vf5AA3kKh/n3i0EGSQ0gAD8+xofxg4LV9/RHB7p1eouEe8GyybiGgn91x755iUF+wr0C1UPvLYWU8kIxiIoFcxQ3MpM68bAK1nNyQAdPx/eMscEDBUREBYIC+AyVBMfwoACmnYnJt6AAof4CuFGUOfuTVKABDlp9OoQ4QneMvOO+jT8oIAEYIAE5uTC/ryRm4ACzEjdWZ+DlMbCBoACFoAC1YADg4AECN367toEKFlANgr+JuYhEMZIBw7wNwUk4SAo8OP6vv0gwCLw8OXv6RPol52AAzqIorkxNwR43b/r/QQext23wtg19tnaLOwTGy0uIDwmPhfr/9kPHdzFqK7yLxURLSVogAN8Menl6PDu5+nx7+/6/xAiKyUbGBsHExYVDRERA7OVrcjG1uv73R5fQ/X72izd6BAhSYADuSeAA1XsyuAN+wZQEti66fIN7wUuAtQNCyQhK4ABLvMbELb7Dzv37jXe1+f9NCvaEcf8FRMEBOUT7+snCfwPyPc8NrzQ6zwq8dbmGSnmHzq8Gg221QxBMbnMHBhFBBvYA/oRDhMPCAUISgJTQOW2dYADKGmSgAKH2EUIYb9Tt4ADY4AD/4AEhza3yCgOCRcCkLoAOeXlgAR0c575/8nmgANcnrkyMoACloACCN+4HuSAAo+AA0yAA+P4z+/Z6jBSVUEZ8+Iy6T0r+wclFxQKEA39FxH58gfhts8RC/2/gAQJS0f0+KevgANWvr2wpNFmSLDC1/UrC+Gl5Qg0xwP5D1MZwUI5H1AuKVo2+OTHv8OnrsvuDyoVJSJogANDdO3r5+nr7Onw+PEEDRgfHhobGBgQBR8dGxASFtCAA7PKp7nX6fXX3A0fQEJGBu0SqOAKFiVPOhbSuuD+8fJXG9u/2Qj0+hUa3vYZLhwagAFa4Cjys/BDy0/sKrYD3AclT9cNvfcU/Dzw4Bvo2Hvz4+DztiY9FM67JQMPDwnpK+s8/wrVMrLL7k1C4cnMIhIYRAvWIOMhGBIPBgtQA15a1YACFlNcgANZroACW1pBBwgQyE7mV4AEByLWdDHoBd6uuPP/NMdYgAS0DKsACrvHgANFspBR9oACNqfqB66AAh6AAxOAA8PD6uzl2xpVX1Y85vIABglc/wz1OCUOFREOCwsHCvwDgAUDgAR5gAP2QekJgAOclCCAA9O0SYADCk2AAm19HdrGlynuks3e/wgH9xNKKfWe6Ag8c0Pph3wwUBVAJM3CzcvPwtYA9OnrNC0XNHuAA54H8Ozn6+Xm8wP0DRUeHhkXHB0RFPgYCAwKDwoYCpGgr7nI4+r80/AoGgYzRzsfEs3DCvYhLEEq0c3a7O7/NCTI2uz29Pw21v8gBCMigAF/1i3ylxb0IO1N7dcdtf0yUvLys+804jQitRv+uEdgyN8FnDkVL7PSZsY28QfOIPY3IhfVIq7A5CwqVMjOzkoSADrqJuMMExcXDAdJd/uAAy+AApbQgALsXh+AAry9XnL17mWAAxBix9lJV0k4+DjW0OQiCNLYPTGABK/U0g/j4oADXtHwgAKcK6WL1gP5v4AClYADexuW8/Xg9z6AA6g9SSPqzPsoQDjvEwMjERw0GxkNC/QDAwyABNCAA7/J9Pz4zaU5G7X/r+K3CBvOUN+AAb/k+Ck4HuXkByBbJRaN8JhzEBXQ7v4QMysyLPa/1ejwAgcA1NjqCSYmQ4AC+oADiPnh6erq7fgDCxgAJjkYDRgVCQAB/AYJBQgGGhAP3oqcvcYX6d7X1xwDICz3EDtoMdsD+eAjBRNivMza4QL6FBnf0wjj6Cf/5hEJJBuAAWL+JOqrH81vtA9I3/G5Ev87AOLf/TX3Fkaq5yPHBFYY2rzh9idF4KlnzVkGv+dA+eEyNQHxtNDt+30nHPSAASQlPPcIEQgD8CAFByoLgAJ0ZeoysZJHfgXE4EI4RzAoj4AECBCwNvQGDCsB1h5BRcSrroAEiukW2uo86oADfZfFVYACo/aEyvgf+p+AAqeAA0f+l9gK+itaHh18Js7YFWY0BfIe9hcULl8gFAcF5QzP95WAA+mTsQE9htELMZb83NLDCObV/t79/VDTYzATKQUuT+3dpZKhCh8mQSYE2vgQUBXs80OwCRqty+7n+OsPJGeAAwxj1eXs6/T6Ch0fH//iCQYXKED9DAD8/gMFCAoRExcQpLalyOHq9O7FFm/n4fs1ExVZRO/s3/wg8hhm8eOh3gUCC9/5DsnrMOPiJCD2KYABXzsRqbsq3mzQ31PZ4Nj5GUXSCub8+0LTXbnLWrXvG1fEzeMZEAJUlQ0ZH0Kp/Q1AwwEqLt/J8Qq6gAGNaRomgAGlooACCsnuA/sBAfoe+y9iCnA5LoACwJdnBFYSoBWAA3lX0IAEOIADqliABIWzXaDSFyDgIU9T05iAA8wPgAR39ubSWy+ABAqAAyKv8lKbmrjvM+TR8YAC0i3XpN4sPwku9DKAA70K6ts+YCP6BRn1+05JUR4V/fS+NaPsKIAEO4ADuIADMMVPtJ/wHdrY2Oz23e7S8wQLABs1FIACmPJ2Rx6NgAJmxsrk2zpI/TYs2iXaAGwEExHj4bzP4+gX69n34zk6gALmU9Tj9PsBFxoZGhoVEw8C2uofDC7++wT9AQcJCRAYH/++lK/U+PsPrvhCHQ4N79QzE1lZy+b7/wMEGGormdDYAQDnAASsEA/n/Q8EJguAAVtGA7u0MuJcBLVktsMn4CMh/frJDgIn7irI4kHNF90ZONrNK9dGEsTFWAE/yQXiOgfPBDsnrAcJGIAA/IABqIACQ0WAAdqAASiAAhFO+PTTyu7xJhwlAjjybGoTgAK+uEBnYIAC/iFMgAQMB1uAA9J9TbZHlfwnBxN5Mu2Fk6mABEccweRqSNWAA5KAAuu3LPif1tr7HjqAAbgLgAKbI6mdLWYX6QboToADi/K67nNj8gcyBw0aMTk1OS0B0M4Kq/NTtIAEAIADS6Ic+pnGF74iv+Xw6d7x/wcXLgT/LXUl8jEo0cSS2dLyICAoLgwkSpoIamgMC9Kxw8rZ7erz+PTh+0eAArQ0DwLk+QkQGyIbGhMfCQ396+nvJRH6DgUNCP8HCAUdH/SMq8nW9RfMxYAC/w8X/AD+zlj4gAPP7dL77PwP/xWABBgJ3prk7P0R06UwEOcG1QwIFoABhxn6t8VI5yUfyUfdm1XTBDQG5dIEJggM89jtW9D3DucAL9rq10xOwplHQhjtyNozP9IT9TH1CfLB49yAAZyAAkYmgAGnyIACS2L5Bc/OxRs9Kf7/JvQ4XJ4M20tGMgXVgAP1gAR3/ZxaObId2CQpDmOABYraoo6AA98PM/vvQGEGgAQKgANQr4JKtbrnDTHyE4AB0vmAAmP7l/QYNwT4AQxYgAMd3NEjb07oaRcjHDXrFzQtJv/m6wOonVm6qYADRKT0SYy01RXDGMjr5OcACxIRRhURMGQEAR8NIoabCbnWHBD6JA5de4ckXIADn1v117Someji4vPy+u2/FXciGxcDHQYaFw0XFR80ARAO4+Xu9hEWHgkBDhH1BAgLDAS+0Ku2pyjovIADABkWEv0E4fwwMni/6fzsEBHoH1RMr67n8vKwBRT7+dkO+PcRgAGx+QXDlVsF8EzXILHiYNW+I1LU1/lE+AzGIb9RtQlKs0jgI64W6UP9yOEuRCq06w1E7SXiDDTLyxk+gAD/MoAB+IACioAB9oABKYABxoACejwbBOfQEukHdYQHTgtgxS2rS1pi36JAgARnHMpQCta9KoAFDD8SAe++vMCAA/nEHANsXC2ABB6AA5GIDoAChwXJz/cEeaPsnBBO5uCAAmicBRdCNOL9Mf1UEBc7I4AECiEpGDH0CQwnH/fy+uuABC+8gAR0gAPSssaGADHCv6cOyO/42OwDHRwAEA5jSzFV0QgqBeSL/vaAAiO6RkDr3CA8eCkNgAO1H9rf8fnx5+Tp6fbyx8Or1TYvVD8ZLBgPDxQWCQL85PrzFPbuJEUfFQ7++Rv5+wUTAxa5uqqAAt7E8QPNRCUVPCwS9dkxMlEh6/nqACy/7CI1Cfr658CAAxiAA6S7Dubh6h3z34ABxgO13LBSHsZm/vO59U3avDU3uSPf/THY9kiaWsUPDtpADdMMCpdEG/ajJTc39ez2MSUP8e8i2L3pPIcBgAG1gAJWE4ABdsR1QCmAArYz8Abz3HKsJ/RGSd0coVWABAVIjLuABDFMC+n/ywD2gATXgAVw/qftEqPmhongU3hOSoAEVIADkKXIvPycygEBDyag6K0fJP18M+gS9ipK56U/aUwjyiIZTIAEWBQhJQMGFiMC++Tu9qmAA61Cne+AAtfLBwUB36D59KUJ5yAVCgv3KvQwL102QQsPP5Or8s2hv1ZJ/LotR2qAA9cb5ccG4tnx89X53/b098ma2espU10c9w0I+RQVFPjp/Bbv9f/tDz4tKDk7LgguBv/t+uL74Iubs8nyEbhDSQftFCokDhIQHhdUOdkKDqHqAQXD/gcmlhVbx+gyv+gD6wCAAeDTuMXcVke4Vwy+shtoxLInSc0g2PwR+fNLm1bcBxrCFETVJvKv40wfmO4JHTlB7woACg0UCcHhzSj8gAD/gAGAgAIuWIAB8IABZdSAAblSEEGAAxwjBdsY5zX4JkEDB58LgAPxZ6sC1W8BX9GN4IAEnIAFR9/54LkkosaKskZaYWBAgAQZgANDtNzB2LLsD/dAKdqAAZb+KvILXHYougc8Neyld4ADgiEavif8R4AEcyImMQkODBP23+vkAt6AA6WeDQmoiQQCHuK5t8rpAA43LvQI+0vEBzUsQTNrNiSAAxzBs6fYFWoVJsUiJn2ABAfX7QEMzPDg4+D5BvTd2LacvhsYJB0LBBsHJfsYEPYH/Qj7/wMBLCMZMTA7QGID/fHr49rp+7yktNTU4PnaOmAXCSf/Eg0kBvckUUoZ+cLSAdbgxNr25VFPIMjnEs3x8uiAAfDezaXRSWC1QwuwySxA27ZWD/X/vTILFN0wo0no8EutKCz12wuy5T08q+z//wA9Kur5GgweKODfxRwvgAEbR2VaNKiGuYABvjBBQYADBE4hAx/uKethPMSaLwtR6BcCCU1un4rqgASygAUxw/D4pBOSrcTJgAPhVHBawYADpIADF7euD7zP6fQKLwH3gAGCQmHR4Bt+VOLiRDzgs2yAA6ko1+oqAS1mRF46/hf/CADgx/MD/oADzIADDvARvv6cMBOMDrzHGg4ly1w38NYr4mrPDjFVN4AD9HSAA5SAAvi/7KMnWyIXuhVcVYAEEPv53gTv+NjJ1cK6xNPp5OPlGBgaCxMVAi0ICwgE/f7x/BAGDSImHC8zOjljKO728u/n7N335NSqy8LN6QDcOVAfIhkXFBrlBRUmJlFBB8n0uci34eXzIiM4KfP8DMPW6YAB6u+6qOMfSPxXsMLnFG/NuVEPBgDEDEEjqxe1RPTiUqUaMwrbI7+7KU3L3vgyw/8h/AMRITEqK83OAiiAAVTRgAGwVFT0+4ABmq5YFIACUk9b4v8DVIADtBCsQjoVEr9N0yliIjyQDIAD4hdogAThwRHk1MbJobJXV3BSMYAEF4ADXYOv+rnU+uPvGAPp9+E9HhEssXZo99YvWcOha3tq2fAiCgZMUXNMEfwGBPDZgASlesAhgAPVgAM0gAKsAg4Rw+FMr43a6UJkDa7oZUbP2itStUkFYWVZgAS+gAOqgALype6uEFMFDgVXNGeABE8Q98Lq8uGAA1KC08Hk5/fp+fL7FQ0WHAD/GhgFDBX8/v32E/gjEhQJJTZGM0FRJ+/r6fzn0u4LywvEkM7W+QHN+1drJPoXNCbH7ivxFi9fVwLozLyd0ufgASFtFxDo/hGqw4ABzv+cvSgvHBIS/8uxI0rCAPpK8+72AwxHmTqhNze3SqwHG0bVEMvR+k/3uwo40g3rDwon4CYqKRO5/hbUgAESgAH3eDkQ3oACE4ABkcd6VR0X/RRXSHH/lYADkwIsHNHIQIAEQ1Pk48IPxLeABF4jxkSVIoPprSBIYVs3r4ADk4ADCaW+2Mr4BObsC+gC7/IgWx0ovTeAAwnoDAZerpJ8gAOmWuYCHgU/VhpMVBj5CwnqqYAEV4AE6qkEgAPvgAM+magzFQiL6UmAAgvSLzUHgAL2pbDkRELQRyfs9DxngAQAgASP+IADjIAC+cWgG+jxHSkpOEJogAQ+WuXG4t2AA3WAAu+05AT77wjv4dreBRUIDBcZCxIjBQ3dGvfjBDT4AxgMJ1odHEgzYvTv6d/iHNvj7svbu//C7NDo8BxKfCAQJAm0XrcN+z46UVIJ07iw3rbNBA1wSAby2L7h4oAByeDMrDo4JwcgyOS8Miy0GRUuDuT78iUYtg68GkbdM7Ej80Pl/u6v+j8KtyE31OMk+AwyCtQjLiji++4BgAFNTYACMoAC7A7rnp+AAZEzW9OAAn66gALVgANfAkKorT4PMs/oUoAEJhjd7NDka4ADlQWABDz+1ECDC8XTqXJIWULRoIADHJm62dXfEOrn2xbe+t04E1NPPZocgAL4JxIJOvKAArZygAPUNgr4FFI7HSY1JEncMuad7IAD90zTpO+lzJbeIkmasMjFUExN6GIPkfatgALo7D0V6tQ/gAO0XYAEq4AD4ILGk8AS9OYCGBc3OGhhgARQPbKinsjA2uDz7wHyytkO8M0IGBQrDyob8+sm0RDkGDcGyiX+CjJA+xVcXoAEj+Dz5NsL9O7777nf4sv44qbz4fo5WX4V76wTaJglHRIjVSIBUt6026+tK9sFPSkkCbDaCoABkvbaxgsuLgMc79zrOhqxQyAn+fP97Bn/yvfJQOg/3+34Ig4J9uDR1UfvzRlD3c813kINO7oKMy3G7xgd+4ABJYAB84ACuVc414WAAfiAAWBVGV3cgAL0Ih3o4b+AA1Md25GAA4wVCxwKueb+gAP2gANNalz37wTB1t7i9j9UKhOHr4OV3fDO4yTT+tEM7e38N0chRGmUOzqAA2MLFS4kgAKxMIADnIAEGzP2QTQmESM/ERz7FqWABKLSgAO1IsvNAungiJ1fW42Su+qAAm0+ShDiau28gAJnNSUUZOrnK4ADtWIzgAOqn5TbCA/i6/4WFPwaLz53TNaJzMMF9+rw6L/z9Pjx7A7u6P8DIyoLJPId5dwhPPsLzhQi8FHnEFFbXFwd7ejv8ejm8vfz89bRvaMMCMjJL3Rn+KHzJBROFtsUGSsTESoV3Ym3buoZ1+0VUAao5gKAAXnm+fQvyRAPOBSuFTwB4WgCIwwP9vb2/OLcu1rITuEF2+ZABubsydwjA9QZMe/hE+BCHS7a9SIe76sTODuAASCAAfqAArKAA0QBEOeAAn6OhOIATYACeyAz7eXvgANw4QqAAtpXCy7mJz+e5ViSgAO5GBAT0cXMALVGO0ub8cyWkc3x+goAu+r0CtvyCSVkLL9yHw85IoADhzQALSOAArPqgANJgAPegARk+eBz8u5iRj4vBfqABNCABCq8of7A6B/w94eSSXqYgAHe+TAHG1CAAxtE4B0LoJkUCxt0HAcZXfbZjM08j2eL/QsxDOnuVSVF5PHQ1fzX5PrG8O/0BBkK6gjox/kC9xMKAQ0F/BIGBQkN9iInDC/oPEs7QEZf7Ory5urp4vTv++PXk+v38+a6DG5m6LZJ5n4pHuLbNRPY5xzy2bFhYtwK2wcVAQ7XxwCAAYva7vtC5/YSLfW+PhYb6oACQjEz71awIffksq2yUvzxP8kB/AI03tnG5xP23yMXGsv2/wVFP+/nGPy5/eQ7PoABPYABvoACrlFYNBG8gALFkcaS4V8dGCwagALyAN36BfcVB09PbKmAAvscGIADsxgv1MDZ1PXMRUfAgAK397vs1P4PMQoFqpQD7uUtA1gz0ydaKz0hIyuAA/z0MQ+AAt/EM2N46OVwDSFaSmZAJ6uABIKAA/CexdvQCh7/6O2thViE5IACgwylP+8xgANMOOwPrarmAQcgIRw0QAkOrPcqpVG/5DTUR+345lfz1R7iu/Ls2OsA7Pkt/fUAAN/Y0j7Z6/xRGuv9HPsh/PgC8/7pNgEXOD9IIFCABJAC5ODm7unr+Pr35rjW3ers2NfOWFfnNyvDgAPLWBXU+QIUsPDw797mfIAEX97v9u7+Fvjowg+AAaDUzx5YztkzHAu8H1EKKj59IYACXYADO/H3F+bhroABmoACe+Ur8fTQAblH7eG1+fb23Ac+/crvHPsUNEDe99bJ5eUjWoABMIACNn0vLRc3ICK/gALAo8KCEvwjaw4G9B/3QVFeRyk6gANLgAK9gANPgAPqEv3k1cLa2b0g4csDF9He1fMc6noslIa07+sWJE1eEtg1S0oHLjkKaSga/oAC/s/pZhMNI0YfGGMiWBH15JOcu+3K5bnqDlzvzZqMyjFXWJk7aINVgAOf9vqq8Mz9BBkPExAVGyoK2ivvFPDsGMxR8eHjEADe1t7s3fL2BQMAEgH37vfj8Py4YdXj2TR66RUYzDEEAv/vAMXqU0kYLDDyXm5H0eTr6uzv+fXi1dQZlwjf0924OBgBgANyNZuAA9zWSUfixjbS2dDo7/1bZWjN6AfUKOnG89eAAaXD5RgpCe/++0rY51MXVNd1X5R8XScVgALlgtauzoACyN7BcAnriesS2tvs098F/B8Q3twX5y8mO8Lzy9D+LODhAIACDjYmFj8rIA4IcO7IgAJygAHAcEOzFNlWDlxVKFI7ycOXy4ADa1sK5ALxysbXG/Ig+HXjhcW10TMggAMtmqiCz9IBIzBk/IAC3OVARji2cUf3L2ongAOZgAMHwCTsIR8pJiUzNThRBADe6pEU0NTUqNKvI3PUvYACFceAAnUoMO4YgANkgALb4G45Ih3kxNEk+y0V/AsgHxXzKwL++PvvAPrLKfMa2+PM7NjoCvz99fj08P8DCPkN2ZdJIce9CIAC5E/3GbJaBAe1IcYMw/SAA0kPGvobZWNd6OLq6+ru6fH55unavgfSwM3aFCpATWaAA0w0cSvUHOM+xPnBANjkQ1ZgQ8IU4THDwe0EgAGOxyUe6T3h6h34M9kMUEvPcG2jM2c1LYahsuqPHYAC/MDsLyGAAnIx6OvI8srKAeooFM7wD+kUNxDDxg4CDgLVz+1YOicjKScTDRhs7Qe6gAHGgAJtBgnm2QoxXnEk4GzLpZY6Xv/9dgjax9rnDwMMNDIvqZqAAp4RIk3okcKZvgoENiRLZTUhPUUkmV96ACodgAOmicv5Hx4CLy8ZCVQTLCT659k96OfyvOCOz6qYWFmAAiPDCoACtTgz/7WAA3+ujwVCKC5WAbEt4jDrMvkdLx4YAckfA64e1vnr/Sze5QPa+/XjAv3t/wTqEv0c8/3gmssVWtmAAkgRgALvTjMeqUBAx5dbvRW6s05Y+/5KRVZdFefa6+Xk7PoD9d6gA/DZuMjiHEVlDVmLMkrSIAha0yHoyv7O1EArOnUcBPUiqtfb7IABk8UgOu0m+vYU+R3wGhU9OfFHPNcsS30NgAL30NSnnnKAA0mz5SWXUuze1eSo5urkHfHZ8xkEExQHrBUN+hu+x8UMJSkYIBgzBSobPPEHy47uHx+AAoc83RAf+xRJRuTogAKwC2xVHiHjBtL38+cX/zI1P8GAAy2TKC30pdWQx9oePOqAAoVdRyYlPjohgANxS2JkLoADm6brNMzvYhgWNw0FJjQ2EQKJ+jXdK8TmyfaIsJqoMZT+QYAC2mc3ALppgAMc9RrW+SUlVxIm6QrvTfcOKy8Q9tak3hfR1BHa61r0I7Uw4RzvAP/rEvDjBf/t9cu24bhdSriAAjs2Ph9xT/4cJcb6HrQys5LrZgY2IkIgY0nt5un+3+gF9PfblwjlxL7v1hNMZF0L2NwJP+wRSAPQ7j7aqOE1FCpydgYIAeLcq7SAAXn2P/kuDwHsKvnvJRYNNRrJaF3pGBg5VMyAAvPa3YAB/TKAAvt2qz2GPhXPvxmszMjo+vXX/fY2CB+xBBULDuHBy9TuGQksEBUfIhoSIPLt2dj1Sw02YXj9pSZLHE+qgAKKwRkYb4ADn+yAAu4TV+IZFA0RLzpUs4ADMvwKMIACzpzb9qLYHzKAApFlXyYuJi8w9YqABDkiUYAD1I4t3kXVgAMHgAPmJPUmBfj1bRfPzOTX/+xByvGv8CjPgALco5HYNlCAAwyAA7QgC8cnudUtzeAyD/k8HSgW5kYdEQ8KzdzS4OULBfcUy9zSFE/uwigPJM0FNubZ6evA3u/u+tLhbvGsu18pFDlfMTUU9BTcwx+cpd9JFBn4SiVKRS4V5fvW9wnk5anr78K15ODqDV16ZuAJ9dNm8ebuZK8kKo72zwgiNEtUFgj9Hfvbn4ABpt5aFvtA7wH/DwLkQmAkDYJCRhYNWNQjorHTv8MqgALMMyY05sxk2pgt/5/ZpQftxAXbF0ABrBcsGALGxtPVyT0A+iEqBB4MGiX/4vblFhM8MzyAAznFukVJEayAAnbbMTv09BA0gAOZBpT+NyAHGj1kToAEDYADU1znx4OZo8f3zXeAAqd7XSsjIyMkNfvM6IAEpIAEAqHrW9o5soADGYAD6GUY/QL/xoAEvNUVrgrExN/bDpLeCvuAA7KKoIACMsR86nOAA4RKQtsrs/EK6dg3+tRRIBMfESQi7d7R4fLvHN9G2PvK+Am1xzH/8Qr4CTGrTzTQGu7P9MretLRJZ6yAAk8HJBgVR01oHAAtD+f4wLHC3Bkq/C37QSE0PlEe7NvzCN+19Obf3Y7N8eoZXIADrHjwuy7bUtchvDUCDssC89jsCzMpLQD8FNRDKvqAAda0gAJKRO0CzTj0Hv+kgALbJQ2l3wpaYeN69hiH8sDWyoACEU0TCXOAA5LG9w/5gALIgAOJgALINaLLtdYyvDEQCaE1GwfPzcbm9tw9CPcCEA8HRgEoNtvkDCqAAb6AAllkEt+/hSRODvW3TFo65DwTgAPaSpOAAzUgCFEOMXZSgAQWosX/A4AC6qrk3uWnMYACq4ADM2MwGzMNKyQSM9jPDoAD4Be8e+IskYADL4ADyvxCXiwPt2vvCqpDnO/dn8Lzw6/dgANROIADAYACFhuAArHZ/lJhcRht4eUB6/Eq7wDegARM9wVACPXE8AQS3u0a0RoevPTzGpgLsffq7escBBT5EOYPKxM7vJKywYADAueI2zU8JQjgNWYcAywe99jIv7nsGygoJekcHyRJWWfn7PD636sE6s6hpfAHzBBWbYAEETHK7hhf1r4r2VfyjiAqzs3zJh8j2Qz90RkSe4ACMoABkYACFHRdAOEYADengAI5K0RmBDbh23QVM1DO6eXLpZaAAi8va2LS24ADbYAD7+uigALzPx7EEamsuAfI60/qxTkVybkF6u0LpktC8PfxCh/pGjg9H5w9KdioHqP/KxMCPs8gdv1DaOJ6IIAEZ72F2A3uREFyaIAEQ46MB5PgOvuuzN6s04ACvneAA7ooOzUAJR4eU7id6L4+lms0vIbV0nUaH0B76zriK6A8q/Dnm8zbwdCe/IADVYACzIACDjuAAvjl6CEyKD5EOUT18vYd6RCAA7NATUoIOsHxFNMWszMfy+suo/g775wsxrIlxyvl2OTV8OcECAtT+qesPwuc7xs3TyQG+u76Fh4sTtre087Y31r7BAEZGhEdSUplLu71+ar1zgmJn9wD3+X5XV1HgAREFqT2cA2jKr1iEsf7A68OwC4RFsgD6PUPCy2AAoOAAY9TQYACt2oEHQuL3Ti8gAM+PWm5gAMdz4ADcV4OWhP+gq7364ACbSCAAyosUrcNBldUgAM5cdWAAuleyKDwwN/SMPHhM/CpAuvz9xKcEFoO+iLbQebaXiv1tS0nMYS0VxL1GS2b7mZ0EAo8Q4AEFoAEoAOABCGb0yQZO3JwgARmgAPlqgmHO0Ldvqnm54ACC6R6gAMcgAPYLD5J9CoYz4nR4YAEUvolrwKABMDHivqAA3uABD429SrugAUM+OJIpUO1+7HkutKp7IAC+oACd0QxgAIKSIADKfzs/UQWEhMMYFokAv3y74AD0xgDPjtG+PAjwi6vMgjC/jC0+knXuQOd2znGDSvWo/cp3sbz1+L9+EzejgUoM0dOCA4O/LJfMsFOt8voGeu9CBwrFu8EFRcxQ0ZVKffujB3W5IADWb3k6gne+1FHYYAEViWu8z7cFxmsNx8Lx883z9PhUc7X7QDk/yIDgAKigAHXL4ACh8RbAkQ50i0egAK8gAOBYkiUgAM28h9EU0chzcuUH4AC7IACZwiAAwiABAQdxrJxGZiAAzdWgAQygANBe8yUoL8KxeUt5SG7EvTL8vYPoiYPPwb5+xIs4fcz/tMqTUrNgAH1GmIXI7vpAMGAApRdCV4lgASTa4AEcLSaBTFBTmPygAQmvCTxljsJxafF8/KPrciAAtOAA6+ABEUjIrKgu97/ADqABDJuDbXXgATDntCT5mY4ZgL9F4AFTqxmsd3zpzHvs83K0IADOoACsp0fwu2AAryAA3Hu/jkoBh/65BJuLCP2iBL0ONgdPUbhOs4Q1Qwb1PkJ6Qz47szg3fYdyQT4uRjjKe/C3MC6+lPjgw8iHOsOgAMqYBIJ6sFVJ7FQvLsy1NbLC3AWAgHZGgYGIT9DLvDmBRbfw4un4AQI0/00T4AD2FBV4Ogb4C3/wWgDuOQ7CcHMxWzGvs7lHdoT9oACkceAAZhlD0xJVFgSDQm2DmdQ9q0gEjVHH/SVsqHnk9jxd29cRgYVScqAA4NS4rSAA/Gl54vCA9DgFOAU0hHsy+rMzcVKPAUv/hToL/TXKicAKkNht4ACWtlwVtDgKwqfr4AC7zUgt4ADkYAE5ZLEj0QuUF0ui6u2W4AD0jMA8rug8/Xj1fuAAgvugAMhgAP8C4ADhbHe7iY7XlcIgASpRsC1gATpsB6AA+0bvVuABKxI//dc717HgAS4xMUTYQjosMqAA5CAAveppNn2cYADBoAD0Oc5ECUV//HSABYnEx/9/BMH9QthBuQh/f0LBecH/O/w4e3kyLoz7dGxFLXn5TA26bK1yWMRm7Q9Fyz3yzU7W23stjE2wRz1xiO/+avpVjwnCr0jEPz/PiAozdYy41Wln54WCNDj6FBfMW1KI/7UEEbjrFAfij9Xqre+AwAmytbKz+L4FIACKw+e9Vc9HXVoG/JeGsZlA6RxCA9I7YAD49hA/bWAAxOduyj7IVlkgARMgAPIgARut6FUZqHlj4AC/KgkgAOiuKjI9BTr3tvD7Pb4gAFtgAIb+hURDwf1OdYDGi0hzoADDlaAArCdGHw3BJ2AA1yGKYACfseAAuX7tYADYIAEvOGY4VImWNTQANYH84AD2ic91L+y+vUL+h6AAgLYgAJle0OP+zZFSThCgARq805vgASHzIAE2imsgAQvCOP0bTqABUunUyArl9yABFbFGg5CMOvDgAPggANQqreAAigNgALaYzmABBo2tWIGPaAh6usoFAkPIQkTr0TuVPAoLeLG3t36I/TOKqT4+7r1ytTS7wwK4bc90bEGKkPPgAKCAWUzAQTKBGlHBQUzCTXf4SnM/uX/vZLnPmNitgdT6uI0Qhe2x+gPPYrd3gG19+kIKT1vYFJEALFAM5zqNur2ZeuDv0W8Iwbe47zB1tDzgAIO7++4gAIjKYAC3AaAA4j9gAL+aPf6GAXiHDxeVJXAzQYW6QC+gAJ0gAMw/YACmoADImBPgANNVoAEJj3cPMsKgANxuevk5YADbmu6j9nX3t7b/BGAAaMNgAJATAr/Ie0UGOc4CftEm/5fgAKm6RR2gAOk5oAC/3SbgAOTioACZ7tdJ1qAA+uABNOKJjczgARkvENprQCvRshzrcGmEAwy1oADDYACL4xXZhERXzdTLnIJcRL2gAUz5oAEfE1hgASIwTHo4jFBgAVV0ih9pIjywK2MRkjDRd+lmKiAApWFI4AC2IADhWTHObdR62Mg4lu/TSLtB/VHCN7+KGHPBO4etOTdtCjdJa5Mi/6/yAP1HhAg6JzFxeYpMinkjasUgAMtPf3/0aYDXgQq9kFgPcJA8s26IJKk4XcuX+PgUQvtKT/dAo3PDRWjzQrN1+r1KCxrQ2RsH93qLimRKDqhMyaL9xPSDeJIm7zRFsTN6YAB8PTfAxBJR25rBYACuSgEJfgSBwdiUT6yyP/ELB6kMoACgYADVf7Oh0YYVGSABFbRGz6qlOe8gALhaBET43s1vpG8zPMUCIABpRqAAleAAtZCH/C6SQ/7EiWDgAN5jdgbVYACwvKAA0iABBMIgANlJPo6HYAC1g+5n1yAA1yABH0TRfSHqjcFYSk8gARRgATjlIAFJYAEghC/B6uAA02AAsmAAj7G6+CAAlcHaWRSPEVUNjtAHGQEgATDbD6ABKP3JvupWmLcgAWF12OABT6Qu+T7g9sq/YAEfYADtTeAAzisoZQWgAK/gAOpW4ADUnCcXctk8S85LT5S5Cvs5Twd8CAwx7wLEhKt78jC6Qf42/HT7yUv7hDkrbzbwd85YC+rybakP4ADV1QD+tqqwwIpGGA0KmPW8uLfyOnAF51wPTVA40X59CMpxAOWtPUA0sn3+L4DBCBWOmF7PI86NhL3rTspyiKqEWeqzAj6E73I8K4ZrBOAAfES7gc0lE9OThjOBA8jDxHvSjQmGiq76ie02t+4Yml4gAM4nhbjQENL+IAEFSaEquuvMyF7CQIVvbTL2gP53oqAAa/Mcm6AAuWAA5rxzBY8GNy1tST8+VRPopx2cDywqoAEFIADiIAEDYADVFeAAw6wlIADMoAD+GmAA+H92P42aVKABTXWmIAFK6eABVOABKk07YAEB4AC+4XgAQrWplhNe1pVUlNJPSc5ZhLFxg4jgATuFRL7gARxLYAFJywETCiABTyC4abC0+S0NIAEV4ADeoAEFoSAAwuAAoTGuIAChIADRDStbIlv7oAEGpdj9SxTNMByIBfuPTL+3LfX2Ro247Lz+sf43+ntATjpCteU7h2G1ggYOGzslabJrGZ2FUdU8ZWuLtnwHUpOLBLIyt3i4gcrkCU4WDhA/BcdDP3sxLDC6/Lb2t7w4RMDPjBSTzvu6kFHEevoRgP+4LB5B7L33vQbnyCLL8vEBoAB2joQIjSlqiMuGi8GJS3pFjEYUQw8Eh+qzy6eMYACo1lvasGAAvVFFNIk2ytoYiOzn5ZTGt0RgALzHVsi7te0tLrNjr1cMU1tgANd8zQMVO7o1Qgx5GbvNoADIYAD/wAoI4ADoYAERZyABGbT6IADWIACtAMReTLGM+l1Ymp0gAWPyu4JB/nkHYAD94ADDbMmAgnt8IAB2DKAAqFfa4AD6mNcUjbE/TYuWzH78IAFRhcItYAEkVMEgAWVAlHkgAVLkrHOBuT7lI1J0kX1rYACx4ACRLuAArBP5PJK+EsrJeOABCfWKP5HC00CLSkcN9z/9vixtiEbuMczJMgGAuP39ebskC7Lr9IDP/k+RMqv1qiqJlpPLT0wsc/WZdnf2D1Hb6jKJsXgAtURuRhwLyb7LhId+RDFrNfWCgrio+UL8/g4QEMuOMMUHmZS1fwgQ8vSEHeU9cESHO7t09X+vQnYgAITSTEsDoACQc8LOPfIUOYUJEJBWucBVkP0DdCAAytE/IACu2ZGgAPopZH0cCUDCapQMTKslCBDoqgPotc24NcLgAMK8z2+gAI8gAFpgAJXJwQ7GF4beQvSDcQLFkiABGbhgAOTj4ADxoAEot+6ynb3TDWABGyAA4uAArMNsUQNLWdfXnwxgAVGlqdwgAWVHp2KgARVgAOGshUF8f3tgAKcgAHpZoADA0dmbmVp+uDlBic3Ij8rdoAFjRECtIAEw00VgAW0JjaABWih1Ojp8fIFpIADXOZD0MqAA7CAAySAAo2AAfxmRPMfDhMoQyQAPO00YxoWGQlWBj4aN7HYGA2zyFqsp+RD36sPHdgm3cQIteji/h1fDBgclLkJu6vggAMtUVEXVb3KwmPyybE9SGG76uO6EA/b4N/sMzNK6z0QAAEP4abq0gYB4Lj5G+7pDS5jBU62IUBeSSby+j/VqitKEp/wBRHQzAkUy+Hco4ACFIACvioNn7A9iYACjSLMBhkkAxdCUBT3SUE0NIADofpVgANJgALJUnZapJvzgAOhHiGxFjQdWZqAA2gkBq7hGMoMgAKAC+zD8P09N6eAAaOAAiqAAsYM/GXr7Nrg7E5pKlr+gARtEoAD7YADZw+ABDuABSmABJM3poAFIEmjgAQ1gANfpoACY4ADB4OAA0dtVkshAtu32BFxPfHbv96/4hHwAe7zgAMHgAHyboAC7E2AA9ozPwcZ5CT7VDFWVUIH7gACsYUoPFtZ2IAFYuG/+vDq8eaABAfrgANBswrWTiOAAnqDU/wJHhgjGh4nEjUMgAP0+UTUIBozKystYxGusPcllCMuzqvGOqfH9uYR8Onw5g0hMxj9Rh3Pyd+mutaqboADeHRCGOTY4DHrz55fUT+//LHmBCS5zfLXFy0kHib8/z7n0tPH5/AG2uUFMQ3P5WjvPgvlJy5RVkA56e3RBAo+ztUa7fXmp1oLt82PsYAB4Tk2KCQO3IACBnpq56Z3DSQqI04x3ANtb6OAA41OT4ADaaoDOUBBrxfsgAQg09/172cegAO5+0rU0rg7vLieSveAAkPb87717MAcPgE/OAnzHTKAAxiAA5kmWrcHUi0D1+FqgAVYoQr2aYqXgAPl1IADJ4ACgYADiYAC5y6AA8bW1PUBBiZGGFxHvM/ezmbnB+X/4fWAAx2AAjXdU2ZlHzJDMesogASqcy4+L4AGO+v3FPC3j8mABbUvY4fM96rx+ACABHqkAIADnqAdgALc6sMMA4ACASA7OxkY70svFRQYV6wmQRBUFF826kw4683QxO3d2RpNsKjG7SP09vUe1QDmQwMkCQEtJdTguK20tKxLd1UjBU4zD/fUw5w3KSZQ+ozzG+ChNsfOAT4eIuf/NDXaxubk8tAFxvouOgTjuSYRGSwfVxZ0D/UrOOz15vkW9/EA0rMcqF3ao9C4z4AB6EwTYS7NyK47SVGxYIADgyQskW92yvRl7JSo64AEC5XZhhxbClnTIyh19+X8BPMMkoAEWxbQkgfMh/YShagbJte484ABgH0MF9j0HT0N719UdT7lJSYUMtdpfRi4/n7XgARSIYADvYADGYACkVSAA46AAwe2Cx0ZMGQbW86ABHURYqLr4aqu5AnEuhcI35eAAf8kgAKyCxZETzBBcih1gAWdGCmABnfn7hsgj6q/P4AGPxjJtRmh7QrUgASlm4ADteH0FqLi0bLpx8mAAqEzDAcSA3Qy49R29QAUDHFAACJnQva+yuH7BOfPuhrm4solGQ716zHZ/uIFFCQLHSfx+6u5oZzCvDAqJScnPVJjG8O4vm0VHUzjgAPfHS2XxyDH7uX0JxsTOjbc97YA/vbgvwD9K4ADw8aL6kUTGElG50YX50MgLT755vv1/si238wvlzT6uL3dU4AB1nhHAygJ0KxpJ1bnl4ADRYAD3iDf9nRQEBuAA/626PYJE50M/PNCOU4mJzAhEuuAA/flUMVZGd77/OKz/IADK5rLOQkLxa+AAYOAAiuAArT1moACw9E+FqzMHU1XA2fuF3DAWifOEKRVgAS4ooADowGtgAJ3cXXbWYAC24ADXwUvXelXLBRdQ9UB0JKAA60P2tfVhOj658unSyoPUUtxd29WRYAFpS94EA31NRyH/aPwJHcIwxek7/SABOutgAQB7vncF9ux5qCAAmjJ8XVbIhQH/kRS5wvLfCAG8RpJcQj+gAV0xOrgH9TOAeGat/75KjEWEwPuCuIQ6f7xJqfUWwL63oADibfYpN9GNytCRCURLiCqvyN36zU6wp038oADryjG5AwL48cqLTs5zc/J6hniye/rLUJQtYsYKRQuLR4eLwMEHENpT7gFCwG7xtfpoPa66Bnf2ARrgAHVgALdREHIMLuAAkpjgANPJ+fQpYADdCjyQT4wQ/WMA+TCTQXfzo5FWDw/Q5wN2y4jjMcA9nFKG8oACcGAA5K+rtdoGYACk6erwmCAAshshviAAzT7rwsi3vfiEFwFDEIdZNr35t8B2IAEE86AAzeAApEqfQaAA+HZiC6AA/oh4UwzYY+ABS8MD6CABE+0EQzh39mHvIy60ORQMU9gKYAD4V9eYWVbfTGcxveABkvwTSyABi4V1TtL1wTluaebgASH5eTnA/4AgAO4uIjnyoACFIACrF9ICvUhElYr6sIGC1xkoRUwRIAFPS4ECOwNtaK41c8OFM9QIx8FA+sX6A7svsfN+bY+XMLpB7KrgAK3+GJTQ0ZX5L46eJykHnbqOWKABFrtR7GAA6gjHZ4/Db3JLBU//9/a1ecR4vns3i4wCdS4NBM0GRkcIw8EGUFlgAU+OtHd+xK1mLjGCbP34MMLQv3ugAHZgAKGfVoakJu5HEhbgAPbiZHUOkYuHT5VV5TTys8rC+m0DhsNGjM1zPgAVSv4y5N66RQZwxhO98qistwdXIADAL+ogAHe74ACfIADAim3YFyAAxL7U/rPLPexbCTdgAQKOJG8y9MH8/q+uw6AA05HBFAAgANeyEiABBJxQcSABSSKVIAFo4qABJbbDgs1qMfsxY3Po5+AAel2WR1RTVaABIlgVWRBTU+ABby6+4AGJIAFo1aABnztKL2ABs4YsI7d6pikCNWjBRXqG4AEBral4K2AAjlogANYHhQdF/4jUgy8HPoP6XH71jZTOVdT9sOy7K2YAiISwgB1MgAL1e3nqskqm7o7wcV4OpYMBYADFJQ/Xxv4VTPaL1lMhh30LjAET44nDIAEFM4j0QMJteT9Sv411enb+dLeGNwE0jQlPZXVIVceH/EcDw4nRWB2dwnY/B/egATriMoagAPMJLGwQzW9KNOAAgiAArY9Skj8gALmlRGAAzkp//O2Q6pDLzRdZFGABC7RrRon55oZNdFg+QBY9a+wYCvLWIUzQ+Wk4hNrP6fDKMz4BoADDoACX6PK1IACJnCAA0NU+jPZ6Ak81NtTgAMjgAO1NcgyYN/MvtHVsAYdhVsUgAO6cQf6jqAXgAPyZiBsVP9YEpSABLMlEwcTycfe9Z2AA3WAAqK5rRxybjdIa3SABPiABZT4ylaABj6mgAVR+oAF0pguW4AGwOEMA74ZgAWs1/xrgAVqgAToIkTYgARh3OZkq4ADnIAC7aiTV4ADTH4LFTH69DZN67Fn1gfYSvM0EQk3Y/4CtvuYvEUPG675+yctnhDG7kC8qhudDAaZRl+VExSAAxWLNAwjHgs2FoAD/XcmgAQFctBHK81JtkqhgAPnPwPTHKLc4EA1CDPR3uD4tgXX6wjbMkUTiuhKJEMz6vAMIDUagATnay0yGv7YgAUfkbq2xu70uhASEPISoIACCyxdUjcvtvFEpYADcoAD+OOAA1AitAhPFzlhfom4wv9INY0d8PFdCfo6Kt2SnGiaV6b5gAQSJsCAA2gEgAPxGLS2QXITgANbgAK95taKooACb1eAA2aAA+gfKQjCJPHWMayFgAPMbS2WdyCjqRG5/w2zgAKTgANg0DqABCpR64ADtSen/GQzcxmABSaABhG3gAUt3yjMv+WABCIOxEOAA5GAAwv+14ACRuKAArd9XDw8bmZe5vR5e4O/3yPWdoAGG2oo39mkD9yABUD2TOnFpFWdEYAEE71xB5aCvoACXWR1bH0KP/LzFS0xtRgsAN3uUs55BBs24MXk2dvsBChSwizo+fKWuOL/OQad0uygFrkRSOzSC+y1+IADYCbr/iv4DVt7qUoyynfgNtH/gAQ60z0T1qf4vDIXOh0K3+vvtOD73+sE0B4XMpHvVRFXO8IDASImZ4AFBk0hLi/8m4AE5q6wuu0RnONKOdcZn/CAAiFe41NSOfnsZqnzIVNsJeeMQOlcgATB5omb8iwAG/n+Ah8vAgLqwEGXmRD0IdNUapTKGJN7YNqAA0MLgAPfL6+AAyvJgAJbidOAAjlzbkzuS0tIWP7JFaCTPQ5OIBFIuawZ5N+AA2q1gAKVgAMhgAO46fBggAR4oFGAA9rw8Vw1gATcboAGX4bXzYAFB6el3/iAA6ToYgDhuYAC5YACU8GAAtyAA3l0TTMfQRfUM4AFcV7NgAUH5DTQSWqABlBYgAYQwhPSZoAFaYAE5y1TlcXgAROABDKAA51ZgAR604i9gAK5gAIygALxgAO4gAQ5Mkfp/f8zHNMFLQvX+PVeHzocN+as0AHa9QDmRgHD4Szj193On89NBJXV65r78AMT3Pz05AKAA0hr1+1n/DvjgASPt0c08Qc1GOWshF8bBpe7H4ADilsmJ/DyAvDj5tqv8zLo0/j2Nb39CTkVYu78CyZRYIAFIyUvHTPRhMmnzfDynMnMNUAot6RRgAKBDksSV1JrxmCAA0QEDiJHPIAEn4AEAF11gAQsVBqD1t8CSdzf8ucRSuTlF8k7Opb2zocOSm8Gj6nIT4ADx7uh2HJR4LSAAo+NseWAAkM/HTBARUhXP0kjI62AA9ZfRSQyAw8OlRegsq6hgAKlgAMkgAO8eao6TyT9y+rAgASPOBOABaeABkqDHIiABMCrtsfO2Mo0KukEr4ACM96AAsRsgAO3B0sWWRX9gAUXdxfBt6gODYAFjDAzcqCegAYogAVwQS+ABTuABKKABTAxgATggARSL+Yeg4ADZIAENTmAA6yQ5YACOnxbgAP3UmsfCQMtINziITPEC/rpfkUp58Lw/Pzy9P7xGJWZ1/VK15z1KqnXV9OWxd1Qvxy5Cv0Q8b5agAObUc0CakmzgAS04/RjGRLuJ4ik+Hn6pI8srvFTFwjI3/QFzP7N5gcw3+bqBRTdAPv3I3YC9xNGWIAE6nUSACMRgAUjyfS00fnmrMe8MDHX5Q1RgALTPVG8gAPOQp2ABDwfgAOkWcwr0FslVIAFLBGABLjp24fhDts5nvcNygQMFEDmkn7egAQzrqmAAvheeGKAA6qiBZEjZ1CAAyyAApWAAzNrmvC5jIABxRQATlH/WGpWG005E/oKuxJORSCl+Q4azqGxhqTNYiyAA86ABGs8G2fe0bvCankWG35D/I+ABReqvLzL5seAAykGHQfsgAKugAIqIGpeL1kTNGNqgAVNNNPZMoAEr+1LgAVsgAYUxU7Kx/vxk4AFzqiABOGmgAVMlbCI80nggANvLkcsgANIgALEqAmAAz9YgAQYXQddMEct2OP3OOof5+8lgAX8+I/sqP5R+yXqB9zB0qqg7l7Clc1CtdMVwNQxd45WlCsHAeGMIWNIatkDgAR3KSQZwAmABUEstfK7rhpLs44tmMwhfQfU/rjTENnt2CHZN+nQAOcw5zq+DPYiMAg7OYAElIAFVRcVDwrHk+PdpPr/sMC1OhoEtvo6OoADuk75s0GABJCABA3fLAMtMMvAIV2ABRJIVYrLgARVwwO2yTsFlADM3BsrPdK+U84/Z4ADb4AC3XthVdmogAL/tCs8R7aAAoAngAM3yOmh14AB1CE9uzM2RlwKUlE8GP30NyslEQmdxxwOPJCY5aOtW3lgY4AE5xCtRCG41HdmPRJj4IAFdO8mv96CocjTmd6AAtzV0vCbXoAC9BhgWzl9YyYNMb0G9cDSOj+ABa0MgAY97LuABT0tkoAFndiggARbgATyXYAEsuaAA+8PswWUHFUfgANPgAJXgALedIAD6Uca0IAEzPFsgAWs1gndIR4m5u8odb2UscXeGCEr9fQossXmtpAY98672+rr5Oo5VUuFPc1J/+izmc9TbC9t7wlZVT7u84AFexvEnpto8K6vPbLM9xJ67czjzBbF5cQt5hb99d/u70/H/g0LJ7BCAkBSgAS4NfswXfaz1Z/wvKbt0uz+PuHwDPcdUoADBkoha2FKrf8QVkApwfnyUoAFnBQIo4We/OmAA9vMxvH/IwX7xbcfDgrDe9NU2IAC7g9lJ9hVjd2F6IADGy+AApqegALXtAntpY5iciOiAfRcDUSAA3sGHQEMRVtBUb3Sk7MNQPetuJDUVmBwTFLc3TiABS0AxnuABfM5IIAFe5Hr8w+ABZCABQAG0MfSwJ6AA0X8srKAAhRDgAL3fYAD9lonISICo4AFWp7TUYAEguFeUyRhUoAGcKCABWyQxHFqgAT+gAR5voAE8oAEarvJypDm1e9NfMCAArjggAMcgAQLJxiAA8WABKTPgAUmF/HdXAJc5jjVOhD7vKrf6rP+EFG9IwqpxwyLkGa1gANZ1wYJEh/2WGCAA50wP/KXw8ndyiAzXIAEBWvm8mVlPLlgO6u1t3qvjiTDtryABFsSZ7TEuCa7+qQk9+Yy5OXm/Qc7GfQFF93Q54AD5Dpy7AIwLBLzB8zMyrDd6QvfEAzsQLgORhGAAys5fERMKgzPbuGABVD5N/2nudZdAuW3pyKt3d0HnEMo34ADRlGwK4UUxjYYb0GjgALE/To/gAQWrrSqgAKR54AC+K2AAiUksifjuDeAAntoSdkSi8USNXEMCQ0pVl5XeZ+mw+mlHeUoooYeVUMcZmTRpmhZgAUr/w5Lfh+ABUqABMnOHdeABU2ABLv3S4AEdsnpF4ADsDOWm4ACHjYzPoADhzcSPBH+44AFIq6wgAUIgARgR4AFRRwwOncns57UuIAEm2UijIAEIGO2hy6AA03T2AHp00+AA76AAuqNgAMigAPO4SaAA1SABBf+gAS4d4UUCUCABcqQFfFMOlOzt+PT1bWyTe76GfOb9r6f8NK1TvUzBRfNWVmAA8wwOqgV4tago9hyVEpGakAqO17DNAfBqAUcn0DH2ruOSUBGJYAERgLe8YADmEXzzSzp5vesLx9cIQD2+sbI4TGABDgg4i8TEfI6DOWm5r7v594PLuII6hImIuuAA6QGNoAEkTVuB8dU9yOOHqDH2gNX9L3uJ5cMaI8akeiABDSAA7HxWL1UgAM1gAPYgAM3CIACtoADSeyAA9bCgAMKsYADQoAD0yaAAyrjHIACoczbnBQp8fl6ncN6ehMaUP/apuoqQGMqKW2ABNtW2q/YjtudpupNgAK9RWtRpWYdJuR1SARIVkZyAZ2lgASsjxSABQfzgAQ5OFiABB6Q0hIjH4WAAoW9D/eAAulJMX3p9CiABOijn4AEuoAEFoAErlp2Wx9EByKp+IAFhIAEptc02MqAA8Yt8LKj6mbPH7WMA1eAAlOAA0lZsNIBgAOt4oAEQoAE9uOFPIAFHVP8thBwL3H66IqOqNTG5A7xKBC5CI292tMrFlPDVTvqHByjdNLxDdTAp5jDGUpLZ4AEli72Qy3QFAJTpEzbkVjPgARJC8neSoAE2dzYydeOHxm6UQSw7tbx+EUjCAgY37AO3VZLDAgrCyEqHvTU29XxmR7/FiPy5gwnFOPhgAQ8BT1SgAVSPtOvgASNyPQsBAnBzhlJuRrTM6Z2MvEG18BggAP4QUL1NYADqmm6W4ADSoPwgAOCgAQTioAC4Bd3GcuAAoUW/oXxgAKm8B/8Kx2/rrxFEjA1SyQD/hv4S0xiLGB5gATTvxkLwpfKgANKqelYsjMYOv1U2GZy7zeABSmABcIy44AFUrAKgASKgAP8gASr2rPIgAShm4ADvbyXLADOqPOAAyv+gAKMPVRH+iCABAWABOLEgAQDGtMpVIAE+kYoSypxaYAF7oAFCZW4+uDU5M/A7x5hNLsDB7CAAvmqsIAC2E2g/g4hQ3xigATdgAQ3amw+GbPzMkSABg0BLIyABTvG1NXvst75+DuPIYvGNX2zRCfiAhFmJKiABM+vxLuowcL5vRmAA6dORPQcNIAFKYAEnzS6VoAFauoItRDFkv3x+/PugATdGM60pNQ4mDYcv9/2wxD2Gg0XJCOrAPfZSkb/FgoNEjVxxLvh5rwYC//jGib9Ftb6A86ABLPMT/W24a9NkwrWfODm8eEINsou1wsJgAR+W+/LNcg+Fxn3MSSABDkZIFaABAXSgAMuiIADdneAA1qAAmlhgANWgAKHw7YI9CxtgAM4J/I2LquAAojq1Mc7JmYY2PNIIFFj/2+ABNYL9oAELORV+fregANJmzCAA9mUEv8EAC9Y7O9OVIAFQzcGAoAE9p0uoY0rIhmAA7CABFYKxwGAA2OvnvqHgAK1gAOlIIADA+H4HDCAA89weaCvm4AEJWZB2hZVLTVagAZXnoAFCdOI2sXh/eUVPQpC11TM4iiAA2aAAl4MROJOUyIzuvJUgAQiDdmABIhz/ugiaUcy0kDmncfg3d3kw6jC1v/Yyx4sZNL2MFcfzgl79keVnIK/BkSInzSAA+onwAhqgAUJ0YAEQBuABNyABWqgNEWbCqMW07jvHNJ1AuiABBe+gARiqPkzx8nx3dr7HxIVFQT5+fXd7EwSHRICDiQvMuzqDr3YEOHy90jkD9X8D+sfgAMoXHv42gvVGhu4PQwH8G2AA7kHYBWAA7H9V1VKYzbUsfu+LnEX7mKABPjkgAVt6o/QgAP5gAL4tn5+gAMcgAJCgAL2s4ACCIAClngCwIAB/oAC74ADtBczNcWAA2HCDoACjwL1yxliIs1WIUpIHIAEotuABSCQgAPTLoAEioADxgaAAx0tBIAEDvDXBBzxY9hrELZSgAU69B8BPYAE2oAEP/2w4Rng9ASABFIwNIAEJp6AAxOAAoGbgAKrgAOUgARagAPBobbd74ADZEqABEunufqABFGABOF35OJmNhPpeY+ngATG4SiZ7NUjE89s5ksU/MyqgANVgAKq+RsWgANvAksv65z5Z/80gATTUZvTgAUSajXiARUeF77J8enW1Nqx5bSa3iw8OxHEHWF9x+pKUoAEsoAEM9S002neyoAC9VJZ/GxxKCGRz2uABUPD7lhUAayI/ebr9c8RQaXNwVPZ03TXx8zxqiglGQ7+FxoL6a7rBR4JEhk2Bz4dAivm3/7mx9n+7iwl6dUFKbUrgAK0Sm0GAwIV1je7WhbjOx6gYmaepoAEVjeABQ8AgAW5Ddjc/92ABHcME82ABSVQEkpLmIAFIpGAA66AAp28c2ecgAIp4YACjoADHIAD1guSgAJyHIADOdJZFYAEEvjj9IADGFDygAKyMoADcRTmpkkY9YAD/oAEoqtn5YAD3peABEyAA7yAAygBgAPozEyABLO6pXH8MtyABRQNpRiABWMrjgCABam5gATfgARU/QCAA83lApcpGYAELU3UgAOLgALJgAI4dF+ABCtmgAPEiVn3sOiAA/scgAN0a4AEelyABXNZKhUmMMBGx7iABRhIzcMVoQssgoAFGcovFTqXgARqgAOvrIACaYADVyaABAUqBgQ1nIADfN8VVmBEEgaABS1IAtw3/1Q5u9H51+LYv7TLsoADmxBt+faABIbI8E1zOwb0xZW/m9pey6K1rjZHXVv9IFqABAtsbB+ABHJKgAVxW9Ga2SDFs0yABFlq89uZLRPtuVO2y+acK+9YSu0KBSXiqQPG/yEIL0YnDDPm/VHZ170Nyg3uzif2J9k71KdDgAJbV2Au2RzZctThXVWvWUuAA2OABDaQ03NSgAUwKVgvq8+p+RhJgAS0kb9AgATO5Bd3OIAEkoAD7YADO4ACp0CAAkUKvSQSgANOgAP6TQaAA7KAAuiAAkJRgAN9gAQXU4cvacSAA7dg2oAC+9aAA6GABFPZgAOWb0GJgASHUYAENGOABS2ABIiAA6AOkgu5gAQKTfl7VL9RFfsBLahbE23XgAUu0ih7gAT8xxDts6xPgAOn+4ADEWBkgAR5qIADZIACQ4ADDzaAA/CABOKAA8sGM0KVq8Y7HIAEaU8WIk2ABeRYb/XXMuOQgAV+Wqgk4Ikv6tcIXRBA6IAE6citgAOHgAJ2gAMxgAQxQSv5CSWpgAPd8DjfzxwxMYAEtYAFTczzNStkEjTd2MHEtufCpIAD08ZTV1XCLGyABHESQUI+nr6+xuxYj5Lw2a4dZCwFFihBrHFzpxGABSEJdifC6u6ABL1Oovpd1YXdgATG5aIbtwm2nCcR0ixAMVkO/KgBzKcNPTsJWgBYyrsTPNHAygVivrnaKvfn6wf4FAKAAjp5MvxKMoAC2m7DCWMgsYAD//mAA1mAA/iAA1kvgARocxqABe2ABV/ereKn0kgmayKABKaAA+D2Pc2ABLfUroADV4ACgiKNJUQoLfnKgAOHgAR6B4AD+s+AAuSVgAM9eYAEcIAE+oAETkGABRqHL4AEC4ADjIACw4ADjYAEcGqd63vBgAUqHIAEWe2ABROABI+AA+uAAyIxgAQQgAMmgAPXgAUCKyHIEgvlELf9/IAFdIAGJ9j9t8qlgAXd2Yc/7c+XFIAEV+KAA3yAAu+AA3WAA/bxgAMbgAJVgANmgAQr1IAEzLK0tYAEroAEFOjattaAA+hT+2aABTV81G0J2DeABsirgAXhbLXnWYAFu7FSwdmABfPtsLGdgAP6wMeAAr8XgAPsgASjdRroFe6ABDsvD+qAA8d9PCfjCCNogAWfDvwoYweypq+gsbkHgAOqGmdNYN9dCLYEcwL4wv6ABHMP+cKjCPH8o4gl/x0ubr5Jcv7RR05PQlT8profs7iABRW9mvgQYr4VvvSokyw7vOv8JFdYDOYcqLO6Ejp7NEIN4bndAyzB6wMe2Quy+M7y9QH8EijvgAJFVTP1ZcQOGd5JaL8BWanOYTiABG2OgATVgAWUerOABP+ABD/2zNch/WNCACeAA/uAAzwdbg+AA0qAAsPggANggAJtgAMHgAOb52oTgAMv/oAEeoAFK6eAA/6AAz+AAmOAAuOAA52ABESABS3ZljSABanWgATCgAOP10s7gASjgAVK3Gf/7qHEgAPmfsyAA1VmgAQ8b4ADoBGABHqABQCp6vrk7P4vUXU3PERLgAVYMIAE/mmABkKDd/vQgAV609W9gAPcgANFgAKxe4ADs4ACquOAA2OABE9YbO+T1HeABBdBQ7SAA8y/MD2ABP5+yM6ABZzo1imABkSABueABlfEW7xGqK+ABlSABbU5WIAFve36ioAEZIADmYAC+o+AAzwka4AEenKABY9JlYAEvyO2LYAEDeyABNtf1eDuEU1RYyZBwJjLpajOlbDXWm48Zi831dUIRCrK14IR5vSpyCz/t4ADf5sTRu/DSydpSqI0SiZQgAVqaZ/k7aW7GkC51xIDP93h2YmmM0OlJ9bcSiwIgASh5cq12c4MSz+ABNXxGNfmxdYCHyfm5rPvNfLbtx7X/tgWR4ACYv0vRVfl19H/FWDJHuM9Bx2AA+2ABNH73YAFjoAGldeABYOABM2AA7Wn1hgpTi8NWSHLgAM9rkyAApPYgAMEgAPlgANZgAKngAQQWFPfgAPKV4AEqYAFfueABNaABB+AAyWAAmqAA5OABEKABQWABdOgBhnvgASEgAOWXeyABL8WgAV8gAYbzIAFZoAEsY3q8YADlu3tgAQ2gATuGIAD+4ADIYADt4AEU6fi5BhVNYAE926ABevuHYAFaXJMgAVggATea4AGHVfnyuJF4s+ZgATTgAQ1gANJgAKXT6gogAN+gAQWgAT0XyKh2CWABGlDgAU2moAELDCAA6l8YoAFEs7WZeHhLoAFkYAGN4AG1IAGVHypI/MDK4AGMXW/ooAFVbeABZmABQ6ABDOAA4qAAncrgAMqgAO5AoAEXXeABasugAVM/OQVgASnnfl+gAVq4PUoxQNYOGayxKe1uvuigAPED4AEZ1X++CBcTRr+OBqgtub6FK/DFgG4gAO7waFwdcmO7loaDoAEeU8sL0Fj6STcp4AE2ABRmdo49iXhq6i81TBUuSLizuJd7oAEcCT909GsxC4fgASIICMioc4D20YdGrLO4AYK5Z5dqUjX2MH8gAKSwzQLQMoHNki9Dtl4Xyw0mRdZgATLgAVsSIAGioAFzaCABGmAA4ho7qiEBBYwKEEZ1IADJIACdDiAA0uAA+J0iYAClYADe3mABMdpgARFgATrGoAFuxaABOWAA+yAA2mAApF8gAPzgASEgAVdgAZDSYWjgASzgAQegAS0gAP4gATTgAV8gAYhl4AFNZqABBS4585q2byABK6ABVIXgASDgAPPgyEdTHrogATOHb9EgAWFgAZyydGABUH0gAW5gATogAWagAZVqsb2sDdhLJehgATFgAQcgAOZgALGkoADOYAEAlGABOWABacVCpwXiZCABW6RiHiABDmdM27z8gAggAUYTf2ABeJ2gAbmSIAGepTAEYAGXoAHDNnJgAYogAWDgATyMk+ABPCAA+iAAslIgAO/gASA4tOABNCABYKABiqlD7o6gAVIgASjy+VjgAVBgAXFEsL0+TEi1NK8oaex5awz+UMkPYAFKS1tPwg0z9PT0ubhvBLftMrCgAO6gAMdgAPCbtHhnOtnGHgZV4AFZtf9TVWRmDXs6eLPXfvGEIAEHrfoQhnrJtj13NhaNvMpa7fBmNkoT0sZAVK1xDq+LVLb08gGp/bLYcYn3en6AemAAlwP/lsV9VAyBvmAA+2mp4AEPoADpYAEk4ADzXIAgAUqfmwYgAWYjYAERoADs4AEnBKAA/Xsi5S74i5A2/SLgANEgARGS0qABCiAAvxdgAQyPYAFYaXRgAXvRqi8gATjgAQEgAMJy4ADo4AESIAFN4AGM0BtgAZYgAWJgAS3gAWDgATIYIAGIfuABWWABMqVgAPbgAR3K5KABMaZgANhgAQbgAUFgAYCgAVXgAS8gAQogANogAQugAS0fqH+gAVxgASkgAWLJlFoK4AGFoAFYIAEpzRvYeOABPdUgASnYYAFnfypyuIJgARxgAO4gAKKgANtgARHgATKZA7WWoAF8yScgAT4gAWa5YAE4YAFa4AEgA+Ryzk8IAeABX+ABhLDHTx0gAeagAb/l6qD5oAGaQ2ABevfgAUjlrBZAYAEPYADJ9WABB+ABPn/zNxVgAWmgAYyPJY3gAWBgASqM+O1dYAFkCJKCOBCvqi6uMu2BYAD/hR22d8CgATEUGRWPyomFK3T/+zE4oWNhsX9wYyAA6mABEcR9KCAA2ZeFS2ABJ2ABUSIWh9IE4AFISzqK9viCvmhx92K4ytT2S7W1ujs5isMMlDUycfYH1ET+hc4VqEY5f4M/BjvytWt+mrb6QHfHQmY74ACuG2+koAC9lnegAO244AELPlnjweABK2cgATwgAP0gAUf84AF64AG/4AF8oAFIYAEjYAEDCKABQjrzQykgAOV/MvRgAKozx8IgAMggAQ4gAUpgASZgAOlgALKgANUgARigAUpUWeJgAYXw4zp/YAEc4ADkYACnYADpIAEfYAFakMhQ4AG1YAGQoAFtGCKUIAGg4AFv4AE/4AEXdF6gAU90LqABYuABLWAA8RggAUMgAXNW4AFb4AEnoADwYAEToAFd4AF/oAFf4AE9V/QgAYrIHAVNIAGU4AFvoAFF4AEMYAFBCWx1DSABCdMgAUtUIAE65fcE4AD09KAAvPSgAOIgARhaBeVboAFjOhpsXvxgAVRgAXQgAUfIYAEr91FQ+jk7oAFm4AGbhragAcMgAewgAbw3g6ABi+ABUWABcU/gAWFqOqABEOfFiM0gANEhoADi4AEk4AFe83rE/FugAY4V4AGEIaABMlHO43OS2BMNXAUp6zfobWqoLKABGyABPnF8K1gK4AFa/tL/keABonh0sD10NKdoZKRqL/kXYAEQDfngAOeCGwmZ2ix/nE4gAX1gAVOI1uvEdtEgAUWnp38x91O92HZ3wL5s+3w+1E2+M337K0vBQ0IRFM+nzfoL7LMFASuxyFc/JJ95uKsz0kGgAMCU6Txl4ADdIAEFB5RRreABTysgARigAVnnGKABHaABP1ygAYZgAdBgAY/gAU1gARIBIAEzYAFcCzp24AEmsn+ta2AAyfGgAOdgAMKgAPuS4AFKYKAA+WAAtCAA7yABKSABYyABkx+uIAF3omABOK8/CaAA/aAArmAA5qABLZT3hyABY+ABk+AByOABls4tYAGyYeABWiABIC2eYAFl1DB2maABRWABFCpgAS9gAV0gAY/gAVWgARXgw+ABReABf6ABoqABdKABUCABdh2gAc7S4AGshYvgAXygATwgARQHgW0gASqx4AD5190GoAFkIAE04AEK5CAAzKTqhMggAPBN0+4gAShOtaABTaABeI7aIAF2vrfEYAFKdMWdYAFB4AFuYAFFDyABfyABtrTgAet4YAG4YAGVnnogAXXgAUNgAWqg4USgAQqgAOLrDRakoOAA+NVgAUrgAX7riP92IAGJ22WgAV9gATngAVyYYAFIvO0ZoAF2yNGs5f5zg3rj4WJUYAEyVa91dc1JissNFyABlDP2NK/gAUECcHSzqqAA3nMgAQSSi6Jt6w2gAQ6gAS7qf44gAUnZC/oBTMiJaf1gAU4gAS5+b67roAEhwI3ySAJlvjnBNL4EDY/5BKAA9/VDwsSDDRxOKoYRN2j1+T94v5DS4AD9S5C7Ie+eaZ0gAMvbxOAAyWAAo9rgAPzJQ90gAUzFlPjDm8EgAVbgATYgAYjZYAHC4AGRIAFT4AEdyCABUaABc+ABl+bgAUwgASuOIAEEYADg/OAAno7gAPhTcqABLqABZSABROABBWCloAEPIAE4oAFtYAGi0uABb2ABMOABDDR3z+AA0+AAsaAA3yABDoOP4AFjoAGKtmABqtXE7yKgAXKgAUNioAFLYAEfoAFWYAGeMJKnoAFJYAEfOlGgAVWgAZCkoAEyeiAA7qABIOABZOABuWinUbuZIAHRImABjMxtYAFA4AESIADshrbgAQsgAOSMRBfC4AFNPWABByAAyG5m3F8jBsyThOABI4TjYAE+YAF9oAGioAHG4AGcq0fttPc4YAGHIAFem4IgAVagAZHboAHoDeABt4JgAZO7S7OgAWAgAUB4L+fgAO7HQiAAzvLV4ACr4ADu4AEx4AFUYAGOQ4ugjbQgAbIwYAF/IAFIG2ABimABVH4BoAEznxQgAY/5pCxuM0h1oAEMfmABLVRb7Tzm332NxNBKFTnxYAFEqi7yrnf6AyeA4AEVfRxhbSdTUf5OoAFBBQyR0z8KWbiG66ABTupX9LAgAQfgASfgAU1kQFd4pcHqR3HzUoZLvcbkZ31KW/TuzxIWsUGUJ61HcvSLgtbjiog5ru3TP/9fIADFoADxQK24IAChIADbyaYboAEgM9WgAV0gAX9gAaXi+2ABQ+ABcmABqizgoiWgAWEy4AF6YAGjYAGC4ybgASmgAO/gAK9zwZygAOZgATdFFeABhmABYGABJyAA8GAAx2AA8+ABFiABZyABphrgAYIgAV6gASbk6+AAzW2gAOngAL6dnyABQCABcNCa1qAB1WABsOABiC1gAVBgASNgAUbgAX+gAVV14AGIYAG9YAGBKyABSqABExagAWSGYAGW8eABXb9gASMgAP9gAVTgAZGVT7kX0OJBIAGWIAFkz+DgATBgAPRgANB8RRUgAMUVURggAT/U4AEf4ADjIACiHqAA41iiIAC2ecdgAOPgAQ8AKyABPqABZ5bZHjJPKbH1vQ9IIAF74AGw4AFqXlfgAdtMoAGzKiojQPq6IAE+4AELdG3RFtSi4ADWoACqe6AA5yABJKABZN+ZYAHAIAGSj+4OIAHHYAGNIAFaSeABkmABX3KgAXrgAUv9IAF1huABnWABe6imZPQErkM9W9YaMaegAWMCVfRUQOaBTKABUCABJL73vTrvYjEcRZRgATum5eAA52ABC34gATCE0hItjSABeZLHFqUnZDjXc7FgASEgAP7gATCgAVL8uVMgwegy+TX0WhLb+GABGid2fRDR8rVHCaABMLv+C2ABEkTytY3503to1DPzuxizyNW2IADfQqABDbVBIADB9wQ+i+AA53nVIAEZIAFBoAF1oAGwdyABaXygAbJ+qOABX/9YyMveIAF7oAFSYAEc5DJgALGgAN++6KABBllgAUygAXugAakgAWFgATPgARKt4ADOYAEfIAFmnGABpo3gAW7oIAEkMuAA0CAA8mABJONgAMggAQKgATPQ3hxaYAHBsGABgOABTmABKBbgAXQgAbAgAXagAU0gAZFgAbSgAXMgAUpnoAEGYAE4YAFoIAGR4AHPYAGa8KABSuABHm0gATbgAV7X4AG2IAHdv/dgAaipfuABXfMjauAA+IIFIADZZ51gALtNoAD8FxpgAP8l4ACfIADboAEU0yLgAOj5LSkgAO49jCABIxBYYAGFD6sXWQi698JgAd0gAabgAdMgAaLp4AGtoAHSPKABrT0mJGABUWN992ABBrtYC4UgAVWrYAEDYADgYACmIADSYAEKYAFOv2ABcyABoE3GdUggAd9gAapgAW8B4AGk4AF2pOABheXgAUQgAXUgAZrb4AGHIAFlZbnmpbRakMZd4AGB7KABRVwgAYEXqg0u4AFd0cIgAUxrT/gicK/gxUpBV2ABLKLhv1KMU3+UPwlgAWEgAYIVjrlgAXlsgnogAYRgAV3gATahdCABOYrOHyABUbm4IAEgBu50hYigATfIaOmlznEKDzvzhAogATAIb7SBrnuCCBQ9oAEBjn0HYADzYAEXNwGANv7gAPlRhOABPHGgAO2gAL11IADhoAED5lWOBoBgAU/gAY0gAcXgAZhgAW1gAaiXIAGe4AFsnUIjcCABf4zgAVngATngAQdgAM36oAD/0CAA3kjbIAEkIAFs4AGvYAGOIAFgYAEsdeAA42ABCeABPaABbaABk6ABwiNgAWXy4AEk4ADcmeABL/XgAOVLleABKaABXGABkGABshtpoAGAoAE90BDgAZceLWABftRgAb9gAX5gAUegASAU8F3gAYbgAcmy4AGVYAFbvDRgAR6fYAFz4AG3oAIAqKABw+ABoeABevvloAEjJOrv4AEQlqAA7jrgAQ2gAOQhgaAA95knoAC5sCAA7KABHOABQ+DxoADuVGDgAMDJxWAA9RJgATCgAWyHtEaeBOABs+4YIAHhAUa3oAGtoAHS16ABsaABkPUgAbrgAY+j4SZgARXSCUP7IAFYx08gATRgAPZgAMUyIAD+IAE5MKABWuABfllOfVuZYAGk4AGDwOABtSABg+rgAZtqIAFPYAFwYAGl3mABlaaiLqUixJcgAVczoAF1IAGioAGBoAFY0FLaGGHgAW7lD3pvVUNgAUJgARJnazgboAEaNwkSoAELbuzOG7mQkw9a4AF3ERNlDvQ2UX2gAVqgATTsaocTYAFclrArsKgKLrJ0RBTF/7LmjP1+SlPgAQLTL4tYELJ/q325yss+6sUAeq4NWjl5/Wx6oAElFLodlCABJKAA4aAApmAA9GABM/u5hBECdKABaaABrh4gAY1UoAHWIAGgJ1DgAWTgAUEgAR6gAUNgAWugATcgAQ3gAOTgALRgAOwgASoOY1DRYAERYAFPIAGR4AG0oAF3sCABOuAA8e5gARTgAUfgAWqgAaMS4AGMYAFR4AEN4ADm+WABISABSeABCuAA3eABHuABU2ABiUZgAb5YYAGlYAFvq5+gAa3JIAHiIAGxIAGJ22AB1CABjyABSj4XOXzcoAGwYAHq4AG44AGCQ6ABZaABKGABWKABfiAByOACDiAB1SABpmsgAW3gAUoioAECVUC74AE13mABE35gATdgAQGtoACvoADSjL4gAJxgAMEMIAD/oAExF3XgAQfgASoqYADaw1FgAM1b4AEi4AFcp3pL3wTgAZPiz2ABriAB1C2ZTwUioAGhJOABWOABlhK4IAF/LGABOlGC8MagAXgQISCgAQtgAMfnYADf4AEctWABOiABXQ1XsmABlRbbKDRcYAGZsWABsuABjSABXExgAZmgAb8rIAFxfiVjoAES26ABT+ABekJMyXntueABmsFAaGABXeULNGncDyYr4SAA4pXbIAEzu4duKLN3OWABKkAU20xzTMvQJ59Kv7CgAWDhDqABHyVgATTX4AF8/q2xqHG79yy2xcuPaO5BiPhGTvNWrPuJXTX/boO6WHjzOscCdbKHj9jtOIApqWABK6ABV9zkYAGIoAE6YAEC4AC14ADoYAExIAFjgTeA/Q/gAUWgAX2a4AG9voczYAGMJaABSOYOoAEIoAFNIAEi4ADyYAC8VyAA/SABLCABXqm5IAFw4AE/t+ABcCABsL/gAXygAUigARTrNSABHmABXOABk+AB1KABqOABZiHgARZgANDgAR4gAVpgATNgAPxMoAFEXglgAZygAdIgAaHqQqzgAbQUT2ABt+4NVSABmeABXxGgAZlvhPQgAapgAd144AG0qeABVG0gAXygAZ3gAdUFh+ABmKABdOABUWABKKngATJctz7gAWdNobRENOABGuAA3+AApb+foACg4ADlE7/gATMgAWk54AEh2GlgAPGEmaPqnmABRGABF//NVZEgAXQgAUcIoAGJmrwgAdaWCKABtmABlOABZ+ABQuABY2ABpCAByGABoCJgAVoRviXck5DgAVQgASdgAP+gAMB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gAZRgAcpwYAGU4AFqL+pgARbgAN+DPOABAGABPaABY/fgATfgARWgAVogAX96YAGjx3mgAYOgAV8/ROABICAA52ABH4YgAUZw4AFtoAGeoAFxYAE9YAEOIADqRVagAUGueyABaW0A1dZgAcGL8khgAaOgAXwgAU88IAFsYAGgOuABauABOyL/XOosPJ2tzxyry8UgARj9Bf/b4AFziaS94AE74AF0T3WgAZlgAV5gAR3U4AFnIAGdYAFkYAEnyk3gAPqgATbgAW9gAUkgAQOloADH4AD6IAEi4ADeOSABDE8gAPeqxEUgAUBhoADmoACtEWAA9OdgARvgAVMkfojgAReOHIMgAYGgAajgAYPgAa2Q0iABl+CgAVfgAYpMZO1gAZygAb6r7TQ/46ABMiABZuABj6ABWuABL7BgAPE+25MgAPbgASVv4RfZLiAAyfHgANxixU0AQtAPH6ABQ67gAWQ24AGI/qABUwOLmqABppcWoargAc2gAaggAYfgAbZmodwcIAGIoAFnIAGICkogAXoFHaNjYAE84AEdM3LL4AE+WyABeiABp/S74AG9oAGYK+wp4AEqaBFgAUb5GGABnjaYoAHSYAGwKoJzYAGzoAGI++HgATeboAF3oAGZoAF0M/AmQtAeC+ABWKABegGNGGN8hur7oAE2IAFfs+ABLqABUJ8LKO9XQ2V4wET1eEVyuPw8zxLYSnEvcLS2bKABbCABmOABvOABlm90oAFA4AEdoADsAeABG3fgAOfgARSgAULgAXjgAU8gASJgAUIgAWYgAY9gAcOtR/tgAYa9NSABQ+ABABhgAVJxoAFwBeABmuABbiIgARxgAN7gARlgAOngASinIAEw4AFSrNIYHeABwqAB46ABsoB0I6ABaYcgAZ3X4AF34KABKV4G3G01IAEo4AEF/QJbrY7gAUygARLm27cgAUrgAW6vazvqIAFv+jvgAYqvYAE8qKABY2ABlSABdGABM6ABDOABMiAA8uABK6ABUSABIeUgAN+HrmABBaAA1JBgAR3gAUviIADnmumgAT32YADsYADCrcrYYAEU4AE8oAEL2z0gAPDTHxigAXJgAaIok6AByjDgAZek7WABjWdsQeABjSABwGABleABbo/x/eABJyABW6ABjeABZC2gAS8gAPcsOuABB3PQfCAA4ksXN+AAxH9gAPyo/nPVvuABDnAgASugAVpqIAFtE4tgAV/gATscWp5aoAHOprdAm+pq4AHNoAGcCRkgAZUgAW04oAGJYAGp1GABl9PP5eABciABQHIjYADxoAEclhpgAXuQWtn1IAGK4AFhYAE8rsajYAFC4AFqfsnDIAGhW5rgAa56g3a6/mdooAE7DGABeGABrKJhYAFCGwEgAYEJNeABWyABj0OPMy6Zc6SgAVT5oAFuYAFN6Fcb4AGI4bkJPTO2uUe7cj84O741is+Re8qCbe13LyABk4ZgAdVgAYsgAUeCoejgAOKgAQrZEqABC4HgAVFgAXa9YAFMIAEgoAFZoAGC4AG2YmYV6vjgAU0roADxoAEV4AFBYAFj0SABmybgAUujAKAA4KABLeABDPaASR0gAVwgAXv+YAGi4AHbgaABqDbgAcYmajjgAa8k4AFrYAFERiABeCJjeePCDdPrYgfs4AEkYAEEIAEqoAEEO+ABOc8GIAErRoPgAWOgAUOPUdBgAUigAQ9gAVogAY1gAWIgAS8gAPdIIADe4AEL4AE2YKAA4fmPochzFCABFiABVuMgAQaMOWABSS8gAQZmb6AAruAA1GAA9mABGWAA6qABKWABBbxgASn2YAFCGmABf2ABpO+OWKwwNLWmpA8ZYAGssqABcqVnheABHaABRCABgDBgAT1gARsAq2AA3UdP9sMmPCAA79EgANUgALQgAPUTunnWreABKrOCIAFNHEzoxKABPsWgAX9bH3cSIAGVKYvgAa0LFHQiIAHLpmagAWI/05mTlP/kcyABYY9lIAEfIAD4IAErIAFQl0fZkGABumABiKABZSmC/qABI4IgAVkIcEzXIAGwYAHT9WvPrEYuqGABa2giIAFXoAGC22ABfiABTeABeDUMoAGaxKABd21gAaLG//c0SGABfHygAUJgAW96OKABPIMdIAF/8/5ExCuxAPn9M4e2OTwuSYnTwP6YIM9naGAB5/sgAa3gAXptoAEZKbJ5YAEdIAFMSOABImLgASmgAWkgAZSjoAE5lyABiqABuSABjmABYn7yOmOgAQk01WABVKABgxNS4eABT6ABKiABBGAA46ABCGABMGABDiABLyABDtugAV4gAYdbH1ohYW/VYAHU5e8qoAFnLyABMGABcmwgASq5+ZQgAVMCoAF34rLNoAEgYAD+QOABOz+gAPOgARZIC2R44AFEPSo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gAdEgAa2m1GkgAWpgAZWgAb480OktRi3lAmABoemwfCCqR/73qTj1efGFA8WgAYUXoAHM+yH/T6ABhGophhKEgaABTuABHaAA+ckIqz6CzdSgAUCgAWcIOeABRSRrHaABVFFgATs54AFv4AE4TCABgOABVHGUIAEsaju6IAExIAFWUOABlyABzGABqxUwSqdKduABfCABUUhMIAGMUmABayABObhKkqKAAuABChM7N8A9OXe5IAEdBukn/CABLxEgARcj/7f1toU5IAEI3mABB2ABLxSgAWzggZUgAYlLYAFatGABKFeK8OABZCABhMGgAVWgATXs5gRyIADcTWAAw/4AUI3QgTs4LELEhEjQVKABNOKgAT5ckCABt3+gAYwgAWJ3KiABE2QDoAEel5TgASmcIAFmQ6ABIaAA/qAAxeABEd4mIAFIYAFuoAEzoADtIAC+IADfIAEJIAE6YAEN4ADimaABPh9gAX8gAaegAXYgAU9gARf1J6ABNuABXLogASxgAVrgAY0gAa1gAXyo4AFCohBgAXJxucHuw1PfpA7gAVO9oAGU+OABV6ABKUAgAUrS1SjgAZVZoAHUYAG0ZeaU4AFkIAE7TOABguABthC8IAHqxqsgAbwqZuABrQQgAX+gAaY2oAF54AGlIAHnoAGrbDbfIAHgYAGv7HgV4AHROos+faABrDTzPhYbqQtpLKQNIAGogeAB3SABu8loIAGMtFQbpTsidzky/Sa/K7FaIAEL8n/Mw==';

let _decodedMeters = null;

function decodeBase64Bytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export function getDagestanRealSrtmGrid() {
  if (_decodedMeters) return _decodedMeters;
  const { width, height, minMeters, stepMeters } = DAGESTAN_SRTM_META;
  const raw = decodeBase64Bytes(DAGESTAN_SRTM_DELTA_B64);
  const out = new Float32Array(width * height);
  let ptr = 0;
  for (let row = 0; row < height; row++) {
    let prev = 0;
    const rowOff = row * width;
    for (let col = 0; col < width; col++) {
      const b0 = raw[ptr++];
      let val;
      if (b0 === 0x80) {
        val = (raw[ptr++] << 8) | raw[ptr++];
      } else {
        const d = b0 > 127 ? b0 - 256 : b0;
        val = prev + d;
      }
      out[rowOff + col] = minMeters + val * stepMeters;
      prev = val;
    }
  }
  _decodedMeters = out;
  return out;
}

/**
 * Билинейная выборка реальной спутниковой высоты NASA SRTM (в метрах над уровнем моря)
 * и истинного угла наклона склона (в градусах) по координатам карты (0..700, 0..460).
 */
export function sampleDagestanRealSrtm(mx, my) {
  const grid = getDagestanRealSrtmGrid();
  const { width, height } = DAGESTAN_SRTM_META;
  const cx = Math.max(0, Math.min(700, Number(mx) || 0));
  const cy = Math.max(0, Math.min(460, Number(my) || 0));
  const fx = (cx / 700) * (width - 1);
  const fz = (cy / 460) * (height - 1);
  const ix = Math.min(width - 2, Math.floor(fx));
  const iz = Math.min(height - 2, Math.floor(fz));
  const tx = fx - ix;
  const tz = fz - iz;
  const r0 = iz * width + ix;
  const r1 = (iz + 1) * width + ix;
  const h00 = grid[r0];
  const h10 = grid[r0 + 1];
  const h01 = grid[r1];
  const h11 = grid[r1 + 1];
  const elev = (h00 * (1 - tx) + h10 * tx) * (1 - tz) + (h01 * (1 - tx) + h11 * tx) * tz;

  // Истинный градиент рельефа (~820 м на ячейку сетки 301x198 -> реальный уклон в градусах)
  const ixL = Math.max(0, ix - 1);
  const ixR = Math.min(width - 1, ix + 1);
  const izU = Math.max(0, iz - 1);
  const izD = Math.min(height - 1, iz + 1);
  const dhdx = (grid[iz * width + ixR] - grid[iz * width + ixL]) / (Math.max(1, ixR - ixL) * 760);
  const dhdz = (grid[izD * width + ix] - grid[izU * width + ix]) / (Math.max(1, izD - izU) * 760);
  const slopeDeg = Math.round(Math.max(1, Math.min(78, Math.atan(Math.hypot(dhdx, dhdz) * 2.15) * (180 / Math.PI))));

  return { elev, slopeDeg };
}
