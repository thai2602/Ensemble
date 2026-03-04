export const themeLibrary = {
    // Keeping compatible original structure just in case
    colorSchemes: {
        vintage_amber: {
            bgClass: "bg-amber-50",
            fontClass: "font-serif",
            textPrimaryClass: "text-amber-900",
            buttonClass: "bg-amber-700 hover:bg-amber-800 text-white",

            // Existing properties for backward compat if any
            primary: "bg-amber-600",
            secondary: "bg-amber-100",
            accent: "text-amber-700",
            background: "bg-amber-50",
            text: "text-amber-900",
            button: "bg-amber-600 hover:bg-amber-700 text-white",
            buttonOutline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
        },
        ocean_blue: {
            bgClass: "bg-blue-50",
            fontClass: "font-sans",
            textPrimaryClass: "text-blue-900",
            buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",

            primary: "bg-blue-600",
            secondary: "bg-blue-100",
            accent: "text-blue-700",
            background: "bg-blue-50",
            text: "text-gray-800",
            button: "bg-blue-600 hover:bg-blue-700 text-white",
            buttonOutline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
        },
        modern_dark: {
            bgClass: "bg-gray-900",
            fontClass: "font-sans",
            textPrimaryClass: "text-white",
            buttonClass: "bg-white text-black hover:bg-gray-200",

            primary: "bg-black",
            secondary: "bg-gray-800",
            accent: "text-gray-200",
            background: "bg-black",
            text: "text-white",
            button: "bg-white hover:bg-gray-200 text-black",
            buttonOutline: "border-2 border-white text-white hover:bg-white hover:text-black"
        },
        pastel_pink: {
            bgClass: "bg-pink-50",
            fontClass: "font-mono",
            textPrimaryClass: "text-pink-800",
            buttonClass: "bg-pink-400 hover:bg-pink-500 text-white",

            primary: "bg-pink-400",
            secondary: "bg-pink-100",
            accent: "text-pink-600",
            background: "bg-pink-50",
            text: "text-gray-800",
            button: "bg-pink-400 hover:bg-pink-500 text-white",
            buttonOutline: "border-2 border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white"
        }
    },
    fontStyles: {
        classic_serif: "font-serif",
        modern_sans: "font-sans",
        handwriting: "font-mono"
    },
    borderStyles: {
        rounded: "rounded-lg",
        pill: "rounded-full",
        sharp: "rounded-none",
        shadowSoft: "shadow-md",
        shadowHard: "shadow-xl",
        shadowNone: "shadow-none"
    }
};

// Export THEMES alias for easy access as per user prompt
export const THEMES = themeLibrary.colorSchemes;
