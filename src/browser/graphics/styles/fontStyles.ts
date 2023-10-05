import {createGlobalStyle} from "styled-components";
import SourceHanSerifBold from "../styles/fonts/SourceHanSerif-Bold.otf";

export const FontStyles = createGlobalStyle`

@font-face {
  font-family: 'Source Han Serif';
  src: url(${SourceHanSerifBold}) format('otf')
}
`;
