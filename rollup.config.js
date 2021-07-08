import path from 'path';
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import external from "rollup-plugin-peer-deps-external";
import dts from "rollup-plugin-dts";

import pkg from "./package.json";

export default [{
  input: "src/index.ts",
  output: [
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true
    }, {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    resolve(),
    typescript({
      rollupCommonJSResolveHack: true,
      tsconfig: path.resolve(__dirname, './tsconfig.json'),
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
    commonjs({
      include: ["node_modules/**"],
    }),
  ]
}, {
  input: './distDts/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts()],
}];