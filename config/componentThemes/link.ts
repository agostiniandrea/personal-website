const transform = "translateX(10px)";
const transition = "transform 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms";

export const link = {
  size: {
    sm: {
      fontFamily: "default",
      fSize: "18px",
      fontWeight: "medium",
      letterSpacing: "0.04em",
    } as any,
    md: {
      fontFamily: "heading",
      fSize: "21px",
      icon: {
        mt: "6px",
        width: "26px",
      } as any,
    },
  },
  dark: {
    primary: {
      enabled: {
        color: "secondary06",
        textDecoration: "underline",
      },
      active: {
        color: "secondary06",
        textDecoration: "underline",
      },
      hover: {
        color: "secondary06",
        fontWeight: "bold",
        textDecoration: "underline",
      },
      disabled: {},
    },
    secondary: {
      enabled: {
        color: "secondary06",
        textDecoration: "none",
        icon: {
          transition,
        },
      },
      active: {
        color: "secondary06",
      },
      hover: {
        color: "secondary06",
        fontWeight: "bold",
        textDecoration: "underline",
        icon: {
          transform,
        },
      },
      disabled: {},
    },
  } as any,
  light: {
    primary: {
      enabled: {
        color: "primary03",
        textDecoration: "underline",
      },
      active: {
        color: "primary03",
        textDecoration: "underline",
      },
      hover: {
        color: "primary03",
        fontWeight: "bold",
        textDecoration: "underline",
      },
      disabled: {},
    },
    secondary: {
      enabled: {
        color: "primary02",
        textDecoration: "none",
        icon: {
          transition,
        },
      },
      active: {
        color: "primary02",
      },
      hover: {
        color: "primary02",
        textDecoration: "underline",
        fontWeight: "bold",
        icon: {
          transform,
        },
      },
      disabled: {},
    },
  } as any,
};
