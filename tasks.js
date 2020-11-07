const esbuild = require("esbuild");
const fs = require("fs/promises");
const sane = require("sane");
const { argv } = require("process");
const { ncp } = require("ncp");

ncp.limit = 16;


const build = () => {
  const options = {
    bundle: true,
    define: { "process.env.NODE_ENV": process.env.NODE_ENV },
    entryPoints: ["dist/index.js"],
    minify: argv[3] === "production",
    outfile: "dist/bundle.js",
    platform: "browser",
    target: "es2020",
  };
  esbuild.build(options).catch((err) => {
    process.stderr.write(err.stderr);
    process.exit(1);
  });
};

const clean = async () => {
  await fs.rmdir('dist', {
    recursive: true,
  });
  await fs.mkdir('dist');
  ncp("assets", "dist", (err) => err && console.error(err));
};

const watch = async () => {
  const watcher = sane('dist', {glob: ['**/*.js', '!bundle.js']});
  watcher.on('change', build);
};


(async () => {
  const command = argv[2];
  switch (command) {
    case "build":
      build();
      break;
    case "clean":
      await clean();
      break;
    case "watch":
      await watch();
      break;
    default:
      console.log("unknown command.");
      break;
  }
})();
