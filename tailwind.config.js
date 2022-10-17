/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brandLight: "#74FFAC",
                brandNormal: "#38CB7C",
                brandDark: "#00994F",
                darkBackground: {
                    800: "#1D1D1D",
                    900: "#121212",
                },
            },
        },
    },
    plugins: [],
}
