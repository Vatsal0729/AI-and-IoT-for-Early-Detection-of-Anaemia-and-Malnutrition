export const HB_THRESHOLDS = {
  children_6_59mo: { normal: 11.0, mild: 10.0, moderate: 7.0, severe: 0 },
  children_5_11y: { normal: 11.5, mild: 11.0, moderate: 8.0, severe: 0 },
  pregnant_women: { normal: 11.0, mild: 10.0, moderate: 7.0, severe: 0 },
  non_pregnant_women: { normal: 12.0, mild: 11.0, moderate: 8.0, severe: 0 },
  adult_men: { normal: 13.0, mild: 11.0, moderate: 8.0, severe: 0 }
};

export const MUAC_THRESHOLDS = {
  children_6_59mo: {
    green: { min: 12.5 },
    yellow: { min: 11.5, max: 12.4 },
    red: { max: 11.4 }
  }
};

export const MUAC_ZSCORE_TABLE = {
  boys: {
    '6': { median: 14.8, sd1: 13.7, sd2: 12.6, sd3: 11.5 },
    '12': { median: 15.3, sd1: 14.2, sd2: 13.1, sd3: 12.0 },
    '24': { median: 15.8, sd1: 14.7, sd2: 13.5, sd3: 12.4 }
  },
  girls: {
    '6': { median: 14.2, sd1: 13.1, sd2: 12.0, sd3: 10.9 },
    '12': { median: 14.8, sd1: 13.6, sd2: 12.5, sd3: 11.4 },
    '24': { median: 15.4, sd1: 14.2, sd2: 13.0, sd3: 11.9 }
  }
};

export const WEIGHT_FOR_AGE_MEDIAN = {
  boys: {
    '6': 7.9,
    '12': 9.6,
    '24': 12.2,
    '36': 14.3,
    '48': 16.3,
    '60': 18.3
  },
  girls: {
    '6': 7.3,
    '12': 8.9,
    '24': 11.5,
    '36': 13.9,
    '48': 16.1,
    '60': 18.2
  }
};

export const IRON_RDA = {
  children_1_3y: 7,
  children_4_8y: 10,
  males_9_13y: 8,
  males_14_18y: 11,
  males_19plus: 8,
  females_9_13y: 8,
  females_14_18y: 15,
  females_19_50y: 18,
  females_51plus: 8,
  pregnant: 27,
  lactating: 9
};
