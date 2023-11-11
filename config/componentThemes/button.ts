const borderRadius = "";

const disabled = {
  //disabled state
  bgColor: "secondary05",
  border: "none",
  color: "secondary06",
};

const tertiary = {
  enabled: {
    //default state
    bgColor: "secondary05",
    borderRadius,
    color: "primary01",
    lineHeight: 1,
    letterSpacing: "-0.02em",
    border: 0,
    "> svg": {
      ml: "12px",
    },
  } as any,
  active: {
    //active state
    bgColor: "secondary05",
    borderRadius,
    color: "primary01",
  },
  hover: {
    //hover state
    border: 0,
    color: "primary01",
    bgColor: "primary02",
  } as any,
  disabled: {},
};

const buttonVariants = {
  light: {
    primary: {
      enabled: {
        //default state
        bgColor: "primary02",
        border: "none",
        borderRadius,
        color: "secondary06",
      } as any,
      active: {
        //active state
        bgColor: "primary02",
        border: "none",
        borderRadius,
        color: "secondary06",
      },
      hover: {
        //hover state
        bgColor: "primary02",
        border: "none",
        borderRadius,
        color: "secondary06",
      } as any,
      disabled,
    },
    secondary: {
      enabled: {
        //default state
        bgColor: "white",
        border: "3px solid $primary01",
        borderRadius,
        color: "primary01",
      } as any,
      active: {
        //active state
        bgColor: "white",
        border: "3px solid $primary01",
        borderRadius,
        color: "primary01",
      },
      hover: {
        //hover state
        bgColor: "primary01",
        border: "none",
        borderRadius,
        color: "secondary06",
      } as any,
      disabled,
    },
    tertiary,
  },
  dark: {
    primary: {
      enabled: {
        //default state
        bgColor: "secondary06",
        border: "none",
        borderRadius,
        color: "primary02",
      } as any,
      active: {
        //active state
        bgColor: "secondary06",
        border: "none",
        borderRadius,
        color: "primary02",
      },
      hover: {
        //hover state
        bgColor: "secondary06",
        border: "none",
        borderRadius,
        color: "primary02",
      } as any,
      disabled,
    },
    secondary: {
      enabled: {
        //default state
        bgColor: "transparent",
        border: "2px solid $secondary06",
        borderRadius,
        color: "secondary06",
      } as any,
      active: {
        //active state
        bgColor: "transparent",
        border: "3px solid $secondary06",
        borderRadius,
        color: "secondary06",
      },
      hover: {
        //hover state
        bgColor: "secondary05",
        border: "none",
        borderRadius,
        color: "primary02",
      } as any,
      disabled,
    },
    tertiary,
  },
};

const { dark, light } = buttonVariants;

export const button = {
  defaultValues: {
    borderRadius: "100px",
    boxSizing: "border-box",
    fontFamily: "heading",
  } as any,
  light,
  dark,
  size: {
    md: {
      height: "50px",
      px: "33px",
      fSize: "28px",
      fontWeight: "bold",
      pb: "10px",
      "> svg": {
        mt: "8px",
      },
    } as any,
    lg: {
      fSize: "26px",
      height: "66px",
      px: "45px",
    } as any,
  },
};
