const ratio = 1.5;
const size0 = "16px";

const md = `calc(${size0} / ${ratio})`; // --s-1
const sm = `calc(${md} / ${ratio})`; // --s-2
const xs = `calc(${sm} / ${ratio})`; // --s-3
const xxs = `calc(${xs} / ${ratio})`; // --s-4
const xxxs = `calc(${xxs} / ${ratio})`; // --s-5

const lg = size0; // --s0
const xl = `calc(${lg} * ${ratio})`; // --s1
const xxl = `calc(${xl} * ${ratio})`; // --s2
const xxxl = `calc(${xxl} * ${ratio})`; // --s3
const xxxxl = `calc(${xxxl} * ${ratio})`; // --s4
const xxxxxl = `calc(${xxxxl} * ${ratio})`; // --s5

export const space = {
  none: "0px",
  xxxs,
  xxs,
  xs,
  sm,
  md,

  lg,
  xl,
  xxl,
  xxxl,
  xxxxl,
  xxxxxl,
};
