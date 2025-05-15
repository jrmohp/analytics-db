import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";

export const globalStyles = {
  colors: {
    brand: {
      100: "#FFF4E5",
      200: "#FFD8A8",
      300: "#FFC078",
      400: "#FFA94D",
      500: "#FF922B", // primary orange
      600: "#FD7E14",
      700: "#E8590C",
      800: "#D9480F",
      900: "#A63E10",
    },
    brandScheme: {
      100: "#FFF4E5",
      200: "#FFD8A8",
      300: "#FFC078",
      400: "#FFA94D",
      500: "#FF922B",
      600: "#FD7E14",
      700: "#E8590C",
      800: "#D9480F",
      900: "#A63E10",
    },
    brandTabs: {
      100: "#FFF4E5",
      200: "#FFD8A8",
      300: "#FFC078",
      400: "#FFA94D",
      500: "#FF922B",
      600: "#FD7E14",
      700: "#E8590C",
      800: "#D9480F",
      900: "#A63E10",
    },
    secondaryGray: {
      100: "#F7F7F7",
      200: "#E5E5E5",
      300: "#D6D6D6",
      400: "#B3B3B3",
      500: "#A0A0A0",
      600: "#808080",
      700: "#636363",
      800: "#4D4D4F",
      900: "#2C2C2C",
    },
    red: {
      100: "#FFE3E3",
      500: "#FF6B6B",
      600: "#FA5252",
    },
    blue: {
      50: "#E7F6F8",
      100: "#D0F6FB",
      500: "#00CFEA", // replaced with cyan as per Optum accent
    },
    green: {
      100: "#E6FBE6",
      500: "#C3D600", // lime green as per positive tones
    },
    orange: {
      100: "#FFF4E5",
      300: "#FFA94D",
      500: "#FF922B",
    },
    yellow: {
      100: "#FFF8E1",
      500: "#F2B411",
    },
    teal: {
      100: "#CCF0F2",
      500: "#00B0B9",
    },
    plum: {
      100: "#E6D5E8",
      500: "#5E2751",
    },
    gray: {
      100: "#FAFAFA",
      200: "#F5F5F5",
      300: "#E0E0E0",
      400: "#C4C4C4",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    white: "#FFFFFF",
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        overflowX: "hidden",
        bg: "white",
        fontFamily: "DM Sans",
        letterSpacing: "-0.5px",
        color: "gray.800",
        lineHeight: "1.5",
      },
      html: {
        fontFamily: "DM Sans",
        bg: "white",
      },
      input: {
        color: "gray.800",
        bg: "white",
        borderColor: "gray.300",
        _placeholder: {
          color: "gray.500",
        },
      },
      "::selection": {
        backgroundColor: "#FFD8A8",
        color: "gray.900",
      },
    }),
  },
};
