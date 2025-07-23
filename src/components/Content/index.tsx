import React from "react";
import ContentUI from "./ContentUI";
import { useContent } from "./useContent";

interface ContentProps {
  children: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ children }) => {
  const { processContent } = useContent();

  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.log("Content render");
  }

  return (
    <ContentUI processContent={processContent}>
      {children}
    </ContentUI>
  );
};

export default React.memo(Content);
