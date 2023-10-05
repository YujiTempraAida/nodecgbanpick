// vite.config.mts
import { defineConfig } from "file:///D:/Users/YujiAida/Documents/programs/nodecgutils/bundles/nodecgbanpick/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Users/YujiAida/Documents/programs/nodecgutils/bundles/nodecgbanpick/node_modules/@vitejs/plugin-react/dist/index.mjs";

// vite-plugin-nodecg.mts
import path from "path";
import fs from "fs/promises";
import { globbySync } from "file:///D:/Users/YujiAida/Documents/programs/nodecgutils/bundles/nodecgbanpick/node_modules/globby/index.js";
import {
  rollup,
  watch as rollupWatch
} from "file:///D:/Users/YujiAida/Documents/programs/nodecgutils/bundles/nodecgbanpick/node_modules/rollup/dist/es/rollup.js";
var setupExtensionBuild = async (options) => {
  const inputOptions = {
    ...options
  };
  const outputOptions = {
    dir: "./extension",
    format: "cjs",
    sourcemap: true,
    interop: "auto",
    ...options.output
  };
  const watchOptions = {
    ...options,
    watch: {
      clearScreen: false,
      ...options.watch
    },
    output: {
      dir: "./extension",
      format: "cjs",
      sourcemap: true,
      interop: "auto",
      ...options.output
    }
  };
  let watcher;
  const watchEventHandler = (event) => {
    var _a;
    if (event.code === "BUNDLE_END" || event.code === "ERROR") {
      (_a = event.result) == null ? void 0 : _a.close();
    }
  };
  return {
    watch: () => {
      watcher = rollupWatch(watchOptions);
      watcher.on("event", watchEventHandler);
    },
    unwatch: () => {
      watcher.off("event", watchEventHandler);
      watcher.close();
    },
    build: async () => {
      const bundle = await rollup(inputOptions);
      await bundle.write(outputOptions);
      await bundle.close();
    }
  };
};
var vite_plugin_nodecg_default = async ({
  bundleName,
  graphics = [],
  dashboard = [],
  extension,
  template = "./src/template.html",
  server
}) => {
  let config;
  let origin;
  const extensionRollup = typeof extension === "string" ? await setupExtensionBuild({ input: extension }) : typeof extension === "object" ? await setupExtensionBuild(extension) : extension;
  const graphicsInputs = globbySync(graphics);
  const dashboardInputs = globbySync(dashboard);
  const generateHtmlFiles = async () => {
    const [graphicsTemplateHtml, dashboardTemplateHtml] = await Promise.all([
      fs.readFile(
        path.join(
          config.root,
          typeof template === "string" ? template : template.graphics
        ),
        "utf-8"
      ),
      fs.readFile(
        path.join(
          config.root,
          typeof template === "string" ? template : template.dashboard
        ),
        "utf-8"
      )
    ]);
    const graphicsOutdir = path.join(config.root, "graphics");
    const dashboardOutdir = path.join(config.root, "dashboard");
    await Promise.all([
      fs.rm(graphicsOutdir, { recursive: true, force: true }),
      fs.rm(dashboardOutdir, { recursive: true, force: true })
    ]);
    await Promise.all([
      fs.mkdir(graphicsOutdir, { recursive: true }),
      fs.mkdir(dashboardOutdir, { recursive: true })
    ]);
    const manifest = config.command === "build" ? JSON.parse(
      await fs.readFile(
        path.join(config.build.outDir, "manifest.json"),
        "utf-8"
      )
    ) : void 0;
    const generateHtml = async (input, templateHtml, outputDir) => {
      const head = [];
      if (config.command === "serve") {
        head.push(`
					<script type="module">
						import RefreshRuntime from '${new URL(
          path.join(config.base, "@react-refresh"),
          origin
        )}'
						RefreshRuntime.injectIntoGlobalHook(window)
						window.$RefreshReg$ = () => {}
						window.$RefreshSig$ = () => (type) => type
						window.__vite_plugin_react_preamble_installed__ = true
					</script>
				`);
        head.push(
          `<script type="module" src="${new URL(
            path.join(config.base, "@vite/client"),
            origin
          )}"></script>`
        );
        head.push(
          `<script type="module" src="${new URL(
            path.join(config.base, input),
            origin
          )}"></script>`
        );
      }
      if (config.command === "build") {
        const inputName = input.replace(/^\.\//, "");
        const entryChunk = manifest == null ? void 0 : manifest[inputName];
        const checkCss = (chunk) => {
          if (chunk.css) {
            for (const css of chunk.css) {
              head.push(
                `<link rel="stylesheet" href="${path.join(config.base, css)}">`
              );
            }
          }
          if (chunk.imports) {
            for (const importName of chunk.imports) {
              const childChunk = manifest == null ? void 0 : manifest[importName];
              if (childChunk) {
                checkCss(childChunk);
              }
            }
          }
        };
        if (entryChunk) {
          checkCss(entryChunk);
        }
        if (entryChunk == null ? void 0 : entryChunk.file) {
          head.push(
            `<script type="module" src="${path.join(
              config.base,
              entryChunk.file
            )}"></script>`
          );
        }
      }
      const newHtml = templateHtml.includes("</head>") ? templateHtml.replace("</head>", `${head.join("\n")}
</head>`) : `${head.join("\n")}
${templateHtml}`;
      const name = path.basename(input, path.extname(input));
      await fs.writeFile(path.join(outputDir, `${name}.html`), newHtml);
    };
    await Promise.all([
      ...graphicsInputs.map(
        (input) => generateHtml(input, graphicsTemplateHtml, graphicsOutdir)
      ),
      ...dashboardInputs.map(
        (input) => generateHtml(input, dashboardTemplateHtml, dashboardOutdir)
      )
    ]);
  };
  return {
    name: "nodecg",
    config: async (_, { command }) => {
      const host = (server == null ? void 0 : server.host) ?? "localhost";
      const port = (server == null ? void 0 : server.port) ?? 8080;
      origin = `http://${host}:${port}`;
      return {
        appType: "mpa",
        base: command === "serve" ? `/bundles/${bundleName}` : `/bundles/${bundleName}/shared/dist`,
        server: { host, port, origin },
        build: {
          rollupOptions: {
            input: [...graphicsInputs, ...dashboardInputs]
          },
          manifest: true,
          outDir: "./shared/dist",
          assetsDir: "."
        }
      };
    },
    configResolved: (resolvedConfig) => {
      config = resolvedConfig;
    },
    buildStart: async () => {
      if (config.command === "serve") {
        void generateHtmlFiles();
        extensionRollup == null ? void 0 : extensionRollup.watch();
      }
    },
    writeBundle: async () => {
      if (config.command === "build") {
        await Promise.all([generateHtmlFiles(), extensionRollup == null ? void 0 : extensionRollup.build()]);
      }
    },
    buildEnd: () => {
      if (config.command === "serve") {
        extensionRollup == null ? void 0 : extensionRollup.unwatch();
      }
    }
  };
};

// vite.config.mts
import rollupEsbuild from "file:///D:/Users/YujiAida/Documents/programs/nodecgutils/bundles/nodecgbanpick/node_modules/rollup-plugin-esbuild/dist/index.mjs";
import rollupExternals from "file:///D:/Users/YujiAida/Documents/programs/nodecgutils/bundles/nodecgbanpick/node_modules/rollup-plugin-node-externals/dist/esm/index.js";
var vite_config_default = defineConfig({
  clearScreen: false,
  plugins: [
    react(),
    vite_plugin_nodecg_default({
      bundleName: "nodecgbundletemplate",
      graphics: "./src/browser/graphics/views/*.tsx",
      dashboard: "./src/browser/dashboard/views/*.tsx",
      extension: {
        input: "./src/extension/index.ts",
        plugins: [rollupEsbuild(), rollupExternals()]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgInZpdGUtcGx1Z2luLW5vZGVjZy5tdHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxZdWppQWlkYVxcXFxEb2N1bWVudHNcXFxccHJvZ3JhbXNcXFxcbm9kZWNndXRpbHNcXFxcYnVuZGxlc1xcXFxub2RlY2diYW5waWNrXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxZdWppQWlkYVxcXFxEb2N1bWVudHNcXFxccHJvZ3JhbXNcXFxcbm9kZWNndXRpbHNcXFxcYnVuZGxlc1xcXFxub2RlY2diYW5waWNrXFxcXHZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovVXNlcnMvWXVqaUFpZGEvRG9jdW1lbnRzL3Byb2dyYW1zL25vZGVjZ3V0aWxzL2J1bmRsZXMvbm9kZWNnYmFucGljay92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgbm9kZWNnIGZyb20gXCIuL3ZpdGUtcGx1Z2luLW5vZGVjZy5tanNcIjtcclxuaW1wb3J0IHJvbGx1cEVzYnVpbGQgZnJvbSBcInJvbGx1cC1wbHVnaW4tZXNidWlsZFwiO1xyXG5pbXBvcnQgcm9sbHVwRXh0ZXJuYWxzIGZyb20gXCJyb2xsdXAtcGx1Z2luLW5vZGUtZXh0ZXJuYWxzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdGNsZWFyU2NyZWVuOiBmYWxzZSxcclxuXHRwbHVnaW5zOiBbXHJcblx0XHRyZWFjdCgpLFxyXG5cdFx0bm9kZWNnKHtcclxuXHRcdFx0YnVuZGxlTmFtZTogXCJub2RlY2didW5kbGV0ZW1wbGF0ZVwiLFxyXG5cdFx0XHRncmFwaGljczogXCIuL3NyYy9icm93c2VyL2dyYXBoaWNzL3ZpZXdzLyoudHN4XCIsXHJcblx0XHRcdGRhc2hib2FyZDogXCIuL3NyYy9icm93c2VyL2Rhc2hib2FyZC92aWV3cy8qLnRzeFwiLFxyXG5cdFx0XHRleHRlbnNpb246IHtcclxuXHRcdFx0XHRpbnB1dDogXCIuL3NyYy9leHRlbnNpb24vaW5kZXgudHNcIixcclxuXHRcdFx0XHRwbHVnaW5zOiBbcm9sbHVwRXNidWlsZCgpLCByb2xsdXBFeHRlcm5hbHMoKV0sXHJcblx0XHRcdH0sXHJcblx0XHR9KSxcclxuXHRdLFxyXG59KTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxZdWppQWlkYVxcXFxEb2N1bWVudHNcXFxccHJvZ3JhbXNcXFxcbm9kZWNndXRpbHNcXFxcYnVuZGxlc1xcXFxub2RlY2diYW5waWNrXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxZdWppQWlkYVxcXFxEb2N1bWVudHNcXFxccHJvZ3JhbXNcXFxcbm9kZWNndXRpbHNcXFxcYnVuZGxlc1xcXFxub2RlY2diYW5waWNrXFxcXHZpdGUtcGx1Z2luLW5vZGVjZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1VzZXJzL1l1amlBaWRhL0RvY3VtZW50cy9wcm9ncmFtcy9ub2RlY2d1dGlscy9idW5kbGVzL25vZGVjZ2JhbnBpY2svdml0ZS1wbHVnaW4tbm9kZWNnLm10c1wiO2ltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnMvcHJvbWlzZXNcIjtcclxuaW1wb3J0IHtSZXNvbHZlZENvbmZpZywgTWFuaWZlc3QsIE1hbmlmZXN0Q2h1bmssIFBsdWdpbn0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHtnbG9iYnlTeW5jfSBmcm9tIFwiZ2xvYmJ5XCI7XHJcbmltcG9ydCB7XHJcblx0cm9sbHVwLFxyXG5cdHdhdGNoIGFzIHJvbGx1cFdhdGNoLFxyXG5cdHR5cGUgUm9sbHVwT3B0aW9ucyxcclxuXHR0eXBlIElucHV0T3B0aW9ucyxcclxuXHR0eXBlIE91dHB1dE9wdGlvbnMsXHJcblx0dHlwZSBSb2xsdXBXYXRjaE9wdGlvbnMsXHJcblx0dHlwZSBSb2xsdXBXYXRjaGVyRXZlbnQsXHJcblx0dHlwZSBSb2xsdXBXYXRjaGVyLFxyXG59IGZyb20gXCJyb2xsdXBcIjtcclxuXHJcbmNvbnN0IHNldHVwRXh0ZW5zaW9uQnVpbGQgPSBhc3luYyAob3B0aW9uczogUm9sbHVwT3B0aW9ucykgPT4ge1xyXG5cdGNvbnN0IGlucHV0T3B0aW9uczogSW5wdXRPcHRpb25zID0ge1xyXG5cdFx0Li4ub3B0aW9ucyxcclxuXHR9O1xyXG5cclxuXHRjb25zdCBvdXRwdXRPcHRpb25zOiBPdXRwdXRPcHRpb25zID0ge1xyXG5cdFx0ZGlyOiBcIi4vZXh0ZW5zaW9uXCIsXHJcblx0XHRmb3JtYXQ6IFwiY2pzXCIsXHJcblx0XHRzb3VyY2VtYXA6IHRydWUsXHJcblx0XHRpbnRlcm9wOiBcImF1dG9cIixcclxuXHRcdC4uLm9wdGlvbnMub3V0cHV0LFxyXG5cdH07XHJcblxyXG5cdGNvbnN0IHdhdGNoT3B0aW9uczogUm9sbHVwV2F0Y2hPcHRpb25zID0ge1xyXG5cdFx0Li4ub3B0aW9ucyxcclxuXHRcdHdhdGNoOiB7XHJcblx0XHRcdGNsZWFyU2NyZWVuOiBmYWxzZSxcclxuXHRcdFx0Li4ub3B0aW9ucy53YXRjaCxcclxuXHRcdH0sXHJcblx0XHRvdXRwdXQ6IHtcclxuXHRcdFx0ZGlyOiBcIi4vZXh0ZW5zaW9uXCIsXHJcblx0XHRcdGZvcm1hdDogXCJjanNcIixcclxuXHRcdFx0c291cmNlbWFwOiB0cnVlLFxyXG5cdFx0XHRpbnRlcm9wOiBcImF1dG9cIixcclxuXHRcdFx0Li4ub3B0aW9ucy5vdXRwdXQsXHJcblx0XHR9LFxyXG5cdH07XHJcblxyXG5cdGxldCB3YXRjaGVyOiBSb2xsdXBXYXRjaGVyO1xyXG5cdGNvbnN0IHdhdGNoRXZlbnRIYW5kbGVyID0gKGV2ZW50OiBSb2xsdXBXYXRjaGVyRXZlbnQpID0+IHtcclxuXHRcdGlmIChldmVudC5jb2RlID09PSBcIkJVTkRMRV9FTkRcIiB8fCBldmVudC5jb2RlID09PSBcIkVSUk9SXCIpIHtcclxuXHRcdFx0ZXZlbnQucmVzdWx0Py5jbG9zZSgpO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHR3YXRjaDogKCkgPT4ge1xyXG5cdFx0XHR3YXRjaGVyID0gcm9sbHVwV2F0Y2god2F0Y2hPcHRpb25zKTtcclxuXHRcdFx0d2F0Y2hlci5vbihcImV2ZW50XCIsIHdhdGNoRXZlbnRIYW5kbGVyKTtcclxuXHRcdH0sXHJcblx0XHR1bndhdGNoOiAoKSA9PiB7XHJcblx0XHRcdHdhdGNoZXIub2ZmKFwiZXZlbnRcIiwgd2F0Y2hFdmVudEhhbmRsZXIpO1xyXG5cdFx0XHR3YXRjaGVyLmNsb3NlKCk7XHJcblx0XHR9LFxyXG5cdFx0YnVpbGQ6IGFzeW5jICgpID0+IHtcclxuXHRcdFx0Y29uc3QgYnVuZGxlID0gYXdhaXQgcm9sbHVwKGlucHV0T3B0aW9ucyk7XHJcblx0XHRcdGF3YWl0IGJ1bmRsZS53cml0ZShvdXRwdXRPcHRpb25zKTtcclxuXHRcdFx0YXdhaXQgYnVuZGxlLmNsb3NlKCk7XHJcblx0XHR9LFxyXG5cdH07XHJcbn07XHJcblxyXG50eXBlIFBsdWdpbkNvbmZpZyA9IHtcclxuXHRidW5kbGVOYW1lOiBzdHJpbmc7XHJcblx0Z3JhcGhpY3M/OiBzdHJpbmcgfCBzdHJpbmdbXTtcclxuXHRkYXNoYm9hcmQ/OiBzdHJpbmcgfCBzdHJpbmdbXTtcclxuXHRleHRlbnNpb24/OiBzdHJpbmcgfCBSb2xsdXBPcHRpb25zO1xyXG5cdHRlbXBsYXRlPzogc3RyaW5nIHwge2dyYXBoaWNzOiBzdHJpbmc7IGRhc2hib2FyZDogc3RyaW5nfTtcclxuXHRzZXJ2ZXI/OiB7XHJcblx0XHRob3N0Pzogc3RyaW5nO1xyXG5cdFx0cG9ydD86IG51bWJlcjtcclxuXHR9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHtcclxuXHRidW5kbGVOYW1lLFxyXG5cdGdyYXBoaWNzID0gW10sXHJcblx0ZGFzaGJvYXJkID0gW10sXHJcblx0ZXh0ZW5zaW9uLFxyXG5cdHRlbXBsYXRlID0gXCIuL3NyYy90ZW1wbGF0ZS5odG1sXCIsXHJcblx0c2VydmVyLFxyXG59OiBQbHVnaW5Db25maWcpOiBQcm9taXNlPFBsdWdpbj4gPT4ge1xyXG5cdGxldCBjb25maWc6IFJlc29sdmVkQ29uZmlnO1xyXG5cdGxldCBvcmlnaW46IHN0cmluZztcclxuXHJcblx0Y29uc3QgZXh0ZW5zaW9uUm9sbHVwID1cclxuXHRcdHR5cGVvZiBleHRlbnNpb24gPT09IFwic3RyaW5nXCJcclxuXHRcdFx0PyBhd2FpdCBzZXR1cEV4dGVuc2lvbkJ1aWxkKHtpbnB1dDogZXh0ZW5zaW9ufSlcclxuXHRcdFx0OiB0eXBlb2YgZXh0ZW5zaW9uID09PSBcIm9iamVjdFwiXHJcblx0XHRcdD8gYXdhaXQgc2V0dXBFeHRlbnNpb25CdWlsZChleHRlbnNpb24pXHJcblx0XHRcdDogZXh0ZW5zaW9uO1xyXG5cclxuXHRjb25zdCBncmFwaGljc0lucHV0cyA9IGdsb2JieVN5bmMoZ3JhcGhpY3MpO1xyXG5cdGNvbnN0IGRhc2hib2FyZElucHV0cyA9IGdsb2JieVN5bmMoZGFzaGJvYXJkKTtcclxuXHJcblx0Y29uc3QgZ2VuZXJhdGVIdG1sRmlsZXMgPSBhc3luYyAoKSA9PiB7XHJcblx0XHRjb25zdCBbZ3JhcGhpY3NUZW1wbGF0ZUh0bWwsIGRhc2hib2FyZFRlbXBsYXRlSHRtbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcblx0XHRcdGZzLnJlYWRGaWxlKFxyXG5cdFx0XHRcdHBhdGguam9pbihcclxuXHRcdFx0XHRcdGNvbmZpZy5yb290LFxyXG5cdFx0XHRcdFx0dHlwZW9mIHRlbXBsYXRlID09PSBcInN0cmluZ1wiID8gdGVtcGxhdGUgOiB0ZW1wbGF0ZS5ncmFwaGljcyxcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHRcdFwidXRmLThcIixcclxuXHRcdFx0KSxcclxuXHRcdFx0ZnMucmVhZEZpbGUoXHJcblx0XHRcdFx0cGF0aC5qb2luKFxyXG5cdFx0XHRcdFx0Y29uZmlnLnJvb3QsXHJcblx0XHRcdFx0XHR0eXBlb2YgdGVtcGxhdGUgPT09IFwic3RyaW5nXCIgPyB0ZW1wbGF0ZSA6IHRlbXBsYXRlLmRhc2hib2FyZCxcclxuXHRcdFx0XHQpLFxyXG5cdFx0XHRcdFwidXRmLThcIixcclxuXHRcdFx0KSxcclxuXHRcdF0pO1xyXG5cclxuXHRcdGNvbnN0IGdyYXBoaWNzT3V0ZGlyID0gcGF0aC5qb2luKGNvbmZpZy5yb290LCBcImdyYXBoaWNzXCIpO1xyXG5cdFx0Y29uc3QgZGFzaGJvYXJkT3V0ZGlyID0gcGF0aC5qb2luKGNvbmZpZy5yb290LCBcImRhc2hib2FyZFwiKTtcclxuXHJcblx0XHRhd2FpdCBQcm9taXNlLmFsbChbXHJcblx0XHRcdGZzLnJtKGdyYXBoaWNzT3V0ZGlyLCB7cmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZX0pLFxyXG5cdFx0XHRmcy5ybShkYXNoYm9hcmRPdXRkaXIsIHtyZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlfSksXHJcblx0XHRdKTtcclxuXHRcdGF3YWl0IFByb21pc2UuYWxsKFtcclxuXHRcdFx0ZnMubWtkaXIoZ3JhcGhpY3NPdXRkaXIsIHtyZWN1cnNpdmU6IHRydWV9KSxcclxuXHRcdFx0ZnMubWtkaXIoZGFzaGJvYXJkT3V0ZGlyLCB7cmVjdXJzaXZlOiB0cnVlfSksXHJcblx0XHRdKTtcclxuXHJcblx0XHRjb25zdCBtYW5pZmVzdCA9XHJcblx0XHRcdGNvbmZpZy5jb21tYW5kID09PSBcImJ1aWxkXCJcclxuXHRcdFx0XHQ/IChKU09OLnBhcnNlKFxyXG5cdFx0XHRcdFx0XHRhd2FpdCBmcy5yZWFkRmlsZShcclxuXHRcdFx0XHRcdFx0XHRwYXRoLmpvaW4oY29uZmlnLmJ1aWxkLm91dERpciwgXCJtYW5pZmVzdC5qc29uXCIpLFxyXG5cdFx0XHRcdFx0XHRcdFwidXRmLThcIixcclxuXHRcdFx0XHRcdFx0KSxcclxuXHRcdFx0XHQgICkgYXMgTWFuaWZlc3QpXHJcblx0XHRcdFx0OiB1bmRlZmluZWQ7XHJcblxyXG5cdFx0Y29uc3QgZ2VuZXJhdGVIdG1sID0gYXN5bmMgKFxyXG5cdFx0XHRpbnB1dDogc3RyaW5nLFxyXG5cdFx0XHR0ZW1wbGF0ZUh0bWw6IHN0cmluZyxcclxuXHRcdFx0b3V0cHV0RGlyOiBzdHJpbmcsXHJcblx0XHQpID0+IHtcclxuXHRcdFx0Y29uc3QgaGVhZDogc3RyaW5nW10gPSBbXTtcclxuXHJcblx0XHRcdGlmIChjb25maWcuY29tbWFuZCA9PT0gXCJzZXJ2ZVwiKSB7XHJcblx0XHRcdFx0aGVhZC5wdXNoKGBcclxuXHRcdFx0XHRcdDxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiPlxyXG5cdFx0XHRcdFx0XHRpbXBvcnQgUmVmcmVzaFJ1bnRpbWUgZnJvbSAnJHtuZXcgVVJMKFxyXG5cdFx0XHRcdFx0XHRcdHBhdGguam9pbihjb25maWcuYmFzZSwgXCJAcmVhY3QtcmVmcmVzaFwiKSxcclxuXHRcdFx0XHRcdFx0XHRvcmlnaW4sXHJcblx0XHRcdFx0XHRcdCl9J1xyXG5cdFx0XHRcdFx0XHRSZWZyZXNoUnVudGltZS5pbmplY3RJbnRvR2xvYmFsSG9vayh3aW5kb3cpXHJcblx0XHRcdFx0XHRcdHdpbmRvdy4kUmVmcmVzaFJlZyQgPSAoKSA9PiB7fVxyXG5cdFx0XHRcdFx0XHR3aW5kb3cuJFJlZnJlc2hTaWckID0gKCkgPT4gKHR5cGUpID0+IHR5cGVcclxuXHRcdFx0XHRcdFx0d2luZG93Ll9fdml0ZV9wbHVnaW5fcmVhY3RfcHJlYW1ibGVfaW5zdGFsbGVkX18gPSB0cnVlXHJcblx0XHRcdFx0XHQ8L3NjcmlwdD5cclxuXHRcdFx0XHRgKTtcclxuXHRcdFx0XHRoZWFkLnB1c2goXHJcblx0XHRcdFx0XHRgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCIgc3JjPVwiJHtuZXcgVVJMKFxyXG5cdFx0XHRcdFx0XHRwYXRoLmpvaW4oY29uZmlnLmJhc2UsIFwiQHZpdGUvY2xpZW50XCIpLFxyXG5cdFx0XHRcdFx0XHRvcmlnaW4sXHJcblx0XHRcdFx0XHQpfVwiPjwvc2NyaXB0PmAsXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0XHRoZWFkLnB1c2goXHJcblx0XHRcdFx0XHRgPHNjcmlwdCB0eXBlPVwibW9kdWxlXCIgc3JjPVwiJHtuZXcgVVJMKFxyXG5cdFx0XHRcdFx0XHRwYXRoLmpvaW4oY29uZmlnLmJhc2UsIGlucHV0KSxcclxuXHRcdFx0XHRcdFx0b3JpZ2luLFxyXG5cdFx0XHRcdFx0KX1cIj48L3NjcmlwdD5gLFxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChjb25maWcuY29tbWFuZCA9PT0gXCJidWlsZFwiKSB7XHJcblx0XHRcdFx0Y29uc3QgaW5wdXROYW1lID0gaW5wdXQucmVwbGFjZSgvXlxcLlxcLy8sIFwiXCIpO1xyXG5cdFx0XHRcdGNvbnN0IGVudHJ5Q2h1bmsgPSBtYW5pZmVzdD8uW2lucHV0TmFtZV07XHJcblxyXG5cdFx0XHRcdGNvbnN0IGNoZWNrQ3NzID0gKGNodW5rOiBNYW5pZmVzdENodW5rKSA9PiB7XHJcblx0XHRcdFx0XHRpZiAoY2h1bmsuY3NzKSB7XHJcblx0XHRcdFx0XHRcdGZvciAoY29uc3QgY3NzIG9mIGNodW5rLmNzcykge1xyXG5cdFx0XHRcdFx0XHRcdGhlYWQucHVzaChcclxuXHRcdFx0XHRcdFx0XHRcdGA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIiR7cGF0aC5qb2luKGNvbmZpZy5iYXNlLCBjc3MpfVwiPmAsXHJcblx0XHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKGNodW5rLmltcG9ydHMpIHtcclxuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpbXBvcnROYW1lIG9mIGNodW5rLmltcG9ydHMpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zdCBjaGlsZENodW5rID0gbWFuaWZlc3Q/LltpbXBvcnROYW1lXTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoY2hpbGRDaHVuaykge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y2hlY2tDc3MoY2hpbGRDaHVuayk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0aWYgKGVudHJ5Q2h1bmspIHtcclxuXHRcdFx0XHRcdGNoZWNrQ3NzKGVudHJ5Q2h1bmspO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGVudHJ5Q2h1bms/LmZpbGUpIHtcclxuXHRcdFx0XHRcdGhlYWQucHVzaChcclxuXHRcdFx0XHRcdFx0YDxzY3JpcHQgdHlwZT1cIm1vZHVsZVwiIHNyYz1cIiR7cGF0aC5qb2luKFxyXG5cdFx0XHRcdFx0XHRcdGNvbmZpZy5iYXNlLFxyXG5cdFx0XHRcdFx0XHRcdGVudHJ5Q2h1bmsuZmlsZSxcclxuXHRcdFx0XHRcdFx0KX1cIj48L3NjcmlwdD5gLFxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IG5ld0h0bWwgPSB0ZW1wbGF0ZUh0bWwuaW5jbHVkZXMoXCI8L2hlYWQ+XCIpXHJcblx0XHRcdFx0PyB0ZW1wbGF0ZUh0bWwucmVwbGFjZShcIjwvaGVhZD5cIiwgYCR7aGVhZC5qb2luKFwiXFxuXCIpfVxcbjwvaGVhZD5gKVxyXG5cdFx0XHRcdDogYCR7aGVhZC5qb2luKFwiXFxuXCIpfVxcbiR7dGVtcGxhdGVIdG1sfWA7XHJcblx0XHRcdGNvbnN0IG5hbWUgPSBwYXRoLmJhc2VuYW1lKGlucHV0LCBwYXRoLmV4dG5hbWUoaW5wdXQpKTtcclxuXHRcdFx0YXdhaXQgZnMud3JpdGVGaWxlKHBhdGguam9pbihvdXRwdXREaXIsIGAke25hbWV9Lmh0bWxgKSwgbmV3SHRtbCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdGF3YWl0IFByb21pc2UuYWxsKFtcclxuXHRcdFx0Li4uZ3JhcGhpY3NJbnB1dHMubWFwKChpbnB1dCkgPT5cclxuXHRcdFx0XHRnZW5lcmF0ZUh0bWwoaW5wdXQsIGdyYXBoaWNzVGVtcGxhdGVIdG1sLCBncmFwaGljc091dGRpciksXHJcblx0XHRcdCksXHJcblx0XHRcdC4uLmRhc2hib2FyZElucHV0cy5tYXAoKGlucHV0KSA9PlxyXG5cdFx0XHRcdGdlbmVyYXRlSHRtbChpbnB1dCwgZGFzaGJvYXJkVGVtcGxhdGVIdG1sLCBkYXNoYm9hcmRPdXRkaXIpLFxyXG5cdFx0XHQpLFxyXG5cdFx0XSk7XHJcblx0fTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdG5hbWU6IFwibm9kZWNnXCIsXHJcblxyXG5cdFx0Y29uZmlnOiBhc3luYyAoXywge2NvbW1hbmR9KSA9PiB7XHJcblx0XHRcdGNvbnN0IGhvc3QgPSBzZXJ2ZXI/Lmhvc3QgPz8gXCJsb2NhbGhvc3RcIjtcclxuXHRcdFx0Y29uc3QgcG9ydCA9IHNlcnZlcj8ucG9ydCA/PyA4MDgwO1xyXG5cdFx0XHRvcmlnaW4gPSBgaHR0cDovLyR7aG9zdH06JHtwb3J0fWA7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0YXBwVHlwZTogXCJtcGFcIixcclxuXHRcdFx0XHRiYXNlOlxyXG5cdFx0XHRcdFx0Y29tbWFuZCA9PT0gXCJzZXJ2ZVwiXHJcblx0XHRcdFx0XHRcdD8gYC9idW5kbGVzLyR7YnVuZGxlTmFtZX1gXHJcblx0XHRcdFx0XHRcdDogYC9idW5kbGVzLyR7YnVuZGxlTmFtZX0vc2hhcmVkL2Rpc3RgLFxyXG5cdFx0XHRcdHNlcnZlcjoge2hvc3QsIHBvcnQsIG9yaWdpbn0sXHJcblx0XHRcdFx0YnVpbGQ6IHtcclxuXHRcdFx0XHRcdHJvbGx1cE9wdGlvbnM6IHtcclxuXHRcdFx0XHRcdFx0aW5wdXQ6IFsuLi5ncmFwaGljc0lucHV0cywgLi4uZGFzaGJvYXJkSW5wdXRzXSxcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRtYW5pZmVzdDogdHJ1ZSxcclxuXHRcdFx0XHRcdG91dERpcjogXCIuL3NoYXJlZC9kaXN0XCIsXHJcblx0XHRcdFx0XHRhc3NldHNEaXI6IFwiLlwiLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH07XHJcblx0XHR9LFxyXG5cclxuXHRcdGNvbmZpZ1Jlc29sdmVkOiAocmVzb2x2ZWRDb25maWcpID0+IHtcclxuXHRcdFx0Y29uZmlnID0gcmVzb2x2ZWRDb25maWc7XHJcblx0XHR9LFxyXG5cclxuXHRcdGJ1aWxkU3RhcnQ6IGFzeW5jICgpID0+IHtcclxuXHRcdFx0aWYgKGNvbmZpZy5jb21tYW5kID09PSBcInNlcnZlXCIpIHtcclxuXHRcdFx0XHR2b2lkIGdlbmVyYXRlSHRtbEZpbGVzKCk7XHJcblx0XHRcdFx0ZXh0ZW5zaW9uUm9sbHVwPy53YXRjaCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdHdyaXRlQnVuZGxlOiBhc3luYyAoKSA9PiB7XHJcblx0XHRcdGlmIChjb25maWcuY29tbWFuZCA9PT0gXCJidWlsZFwiKSB7XHJcblx0XHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoW2dlbmVyYXRlSHRtbEZpbGVzKCksIGV4dGVuc2lvblJvbGx1cD8uYnVpbGQoKV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdGJ1aWxkRW5kOiAoKSA9PiB7XHJcblx0XHRcdGlmIChjb25maWcuY29tbWFuZCA9PT0gXCJzZXJ2ZVwiKSB7XHJcblx0XHRcdFx0ZXh0ZW5zaW9uUm9sbHVwPy51bndhdGNoKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0fTtcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzWixTQUFRLG9CQUFtQjtBQUNqYixPQUFPLFdBQVc7OztBQ0RrWixPQUFPLFVBQVU7QUFDcmIs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
