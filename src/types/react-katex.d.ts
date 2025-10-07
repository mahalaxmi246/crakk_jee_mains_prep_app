declare module "react-katex" {
  import * as React from "react";

  interface BlockMathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  }

  export const BlockMath: React.FC<BlockMathProps>;

  interface InlineMathProps extends BlockMathProps {}
  export const InlineMath: React.FC<InlineMathProps>;
}
