module.exports = {
  plugins: {
    "posthtml-include": {},
    "posthtml-inline-svg": {
      "cwd": "./src/assets/img/svg"
    },
    "posthtml-expressions": {
      "locals": {
        "NODE_ENV": process.env.NODE_ENV,
      },
    }
  }
}